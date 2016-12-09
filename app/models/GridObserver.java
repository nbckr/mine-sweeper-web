package models;

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
import java.util.function.Consumer;

public class GridObserver implements IObserver {
	
	private WebSocket.Out<String> out;
	private WebSocket.In<String> in;
	private IController controller;

	private Gson gson;
    private ObjectMapper mapper;

	public GridObserver(IController controller, WebSocket.In<String> in, WebSocket.Out<String> out) {
		controller.addObserver(this);
		this.controller = controller;
		this.out = out;
		this.in = in;
		this.gson = new GsonBuilder().setPrettyPrinting().serializeNulls().setFieldNamingPolicy(FieldNamingPolicy.IDENTITY).create();
        mapper = new ObjectMapper();
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

            String action = json.findPath("action").textValue();
			if (action == null) {
                System.out.println("Action field missing from JSON");
            } else {
				final int row = json.findPath("row").intValue();
				final int col = json.findPath("col").intValue();

				switch (action) {
					case "reveal":
						controller.revealCell(row, col);
                        break;
					case "flag":
						controller.toggleFlag(row, col);
						break;
					case "restart":
						controller.startNewGame();
						break;
					default:
                        System.out.println("Unknown action in JSON");
				}
			}
        });
	}

	@Override
	public void update(Event event) {
		out.write(getGridJson());
	}

	private String getGridJson() {

		final JsonObject data = new JsonObject();
		data.add("grid", gson.toJsonTree(controller.getGrid().getCellsAsRows()));
		data.add("state", gson.toJsonTree(controller.getState()));


        return gson.toJson(data);
	}
}
