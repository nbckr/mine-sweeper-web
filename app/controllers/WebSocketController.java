package controllers;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.google.gson.*;
import de.htwg.se.minesweeper.controller.IController;
import observer.IObserver;
import observer.Event;
import play.mvc.WebSocket;
import play.mvc.WebSocket.In;
import play.mvc.WebSocket.Out;

import java.io.IOException;

/**
 * This class is the link between one Game Controller and one web socket connection.
 */
public class WebSocketController implements IObserver {

	private WebSocket.Out<String> out;
	private WebSocket.In<String> in;
	private IController controller;

	private Gson gson = new GsonBuilder().setPrettyPrinting().serializeNulls().setFieldNamingPolicy(FieldNamingPolicy.IDENTITY).create();
    private ObjectMapper mapper = new ObjectMapper();

	public WebSocketController(IController controller, In<String> in, Out<String> out) {
		// attach to game controller
		this.controller = controller;
		controller.addObserver(this);

		// attach to web socket
		this.out = out;
		this.in = in;
		setupMessageListening();
    }

	private void setupMessageListening() {

		in.onMessage(message -> {

            JsonNode json = null;
            try {
                json = mapper.readTree(message);
            } catch (IOException e) {
                e.printStackTrace();
            }

            try {
				String action = json.findPath("action").textValue();
				switch (action) {
					case "reveal":
						controller.revealCell(json.findPath("row").intValue(), json.findPath("col").intValue());
						break;
					case "flag":
						controller.toggleFlag(json.findPath("row").intValue(), json.findPath("col").intValue());
						break;
					case "touch":
						controller.touch();
						break;
					case "start":
						controller.startNewGame(json.findPath("size").textValue(), json.findPath("difficulty").textValue());
						break;
					default:
						System.out.println("Unknown action in JSON");
				}
			} catch (Exception e) {
				System.err.println("Error while processing WebSockets data:\n" + json + "\nOriginal exception:\n" + e.getMessage());
			}
        });
	}

	@Override
	public void update(Event event) {
		out.write(getGridJson());
	}

	public void ping() {
		out.write("ping");
	}

	private String getGridJson() {

		final JsonObject data = new JsonObject();
		data.add("grid", gson.toJsonTree(controller.getGrid().getCellsAsRows()));
		data.add("state", gson.toJsonTree(controller.getState()));

        return gson.toJson(data);
	}
}
