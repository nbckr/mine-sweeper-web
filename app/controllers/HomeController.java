package controllers;

import com.fasterxml.jackson.databind.JsonNode;
import com.google.gson.FieldNamingPolicy;
import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import com.google.gson.JsonObject;
import de.htwg.se.minesweeper.aview.tui.TUI;
import models.GridObserver;
import play.mvc.*;
import views.html.*;


/**
 * This controller contains an action to handle HTTP requests
 * to the application's home page.
 */
public class HomeController extends Controller {

    private static final Gson gson = new GsonBuilder().setPrettyPrinting().serializeNulls().setFieldNamingPolicy(FieldNamingPolicy.IDENTITY).create();

    private static de.htwg.se.minesweeper.controller.impl.Controller controller = new de.htwg.se.minesweeper.controller.impl.Controller();
    private static TUI tui = new TUI(controller);

    public LegacyWebSocket<String> connectWebSocket() {
        return new LegacyWebSocket<String>() {

            public void onReady(WebSocket.In<String> in, WebSocket.Out<String> out) {
                new GridObserver(controller, in, out);
            }
        };
    }


    public Result game() {
        return processCommand("h");
    }

    public Result processCommand(String command) {

        tui.processInput(command);

        String tuiOutput = tui.printTUIAsString();
        return ok(views.html.game.render(tuiOutput));
    }

    /**
     * An action that renders an HTML page with a welcome message.
     * The configuration in the <code>routes</code> file means that
     * this method will be called when the application receives a
     * <code>GET</code> request with a path of <code>/</code>.
     */
    public Result index() {
        return ok(index.render("HELLO!"));
    }

    public Result instructions() {
        return ok(instructions.render());
    }

    public Result about() {
        return ok(about.render());
    }


    public Result getJson() {

        final JsonObject data = new JsonObject();
        data.add("grid", gson.toJsonTree(controller.getGrid().getCellsAsRows()));
        data.add("state", gson.toJsonTree(controller.getState()));

        return ok(gson.toJson(data)).as("text/json");
    }

    @BodyParser.Of(BodyParser.Json.class)
    public Result postJson() {

        JsonNode json = request().body().asJson();
        String action = json.findPath("action").textValue();
        if (action == null) {
            return badRequest("Missing parameter [action]");
        } else {

            final int row = json.findPath("row").intValue();
            final int col = json.findPath("col").intValue();

            switch (action) {

                case "reveal":
                    controller.revealCell(row, col);
                    return ok();

                case "flag":
                    controller.toggleFlag(row, col);
                    return ok();

                case "restart":
                    controller.startNewGame();
                    return created();

                default:
                    return badRequest("Unknown JSON game action");
            }

        }
    }
}
