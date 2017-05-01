package controllers;

import akka.actor.ActorRef;
import akka.actor.Props;
import akka.actor.UntypedActor;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.google.gson.FieldNamingPolicy;
import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import com.google.gson.JsonObject;
import de.htwg.se.minesweeper.controller.impl.Controller;
import de.htwg.se.minesweeper.persistence.couchdb.CouchDBDAO;
import observer.Event;
import observer.IObserver;

import java.io.IOException;

/**
 * Actor to handle messages from WebSocket connections.
 */
public class PlayerActor extends UntypedActor implements IObserver {

	public static Props props(ActorRef out, String userId) {
		return Props.create(PlayerActor.class, out, userId);
	}

    private final ActorRef out;
    private final String userId;
    private final Controller controller;

    private static final boolean SHOW_GUI_TUI = true;


    private Gson gson = new GsonBuilder().setPrettyPrinting().serializeNulls().setFieldNamingPolicy(FieldNamingPolicy.IDENTITY).create();
    private ObjectMapper mapper = new ObjectMapper();

    public PlayerActor(ActorRef out, String userId) {
        this.out = out;
        this.userId = userId;

        // TODO DI

        // TODO Rodrigo & Gabriela - TAMACUN <3

        CouchDBDAO someRandomDB = new CouchDBDAO();

        this.controller = new Controller(someRandomDB, userId);
        controller.addObserver(this);

        if (SHOW_GUI_TUI) {
            getContext().actorOf(GuiTuiActor.props(controller), "gui_tui_" + userId);
        }
    }

    @Override
	public void onReceive(Object msg) throws Throwable {

        if (!(msg instanceof String)) {
            System.out.println("message is not a string");
            return;
        }

        String message = (String) msg;

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
                case "save":
                    controller.saveGame();
                    break;
                case "load":
                    controller.loadGame();
                    break;
                default:
                    System.out.println("Unknown action in JSON");
            }
        } catch (Exception e) {
            System.err.println("Error while processing WebSockets data:\n" + json + "\nOriginal exception:\n" + e.getMessage());
        }
	}

    @Override
    public void update(Event event) {
        // TODO: sender() correct?
        out.tell(getGridJson(), getContext().sender());
    }

    private String getGridJson() {

        final JsonObject data = new JsonObject();
        data.add("grid", gson.toJsonTree(controller.getGrid().getCellsAsRows()));
        data.add("state", gson.toJsonTree(controller.getState()));

        return gson.toJson(data);
    }

    public void postStop() throws Exception {
        controller.removeAllObservers();
    }
}
