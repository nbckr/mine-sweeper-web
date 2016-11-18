package controllers;

import com.google.gson.*;
import de.htwg.se.minesweeper.aview.tui.TUI;
import play.mvc.Controller;
import play.mvc.Result;
import views.html.*;


/**
 * This controller contains an action to handle HTTP requests
 * to the application's home page.
 */
public class HomeController extends Controller {

    private static final Gson gson = new GsonBuilder().setPrettyPrinting().serializeNulls().setFieldNamingPolicy(FieldNamingPolicy.IDENTITY).create();

    de.htwg.se.minesweeper.controller.impl.Controller controller = new de.htwg.se.minesweeper.controller.impl.Controller();
    TUI tui = new TUI(controller);

    public Result game() {
        return processCommand("h");
    }

    public Result getJsonState() {
        return ok(gson.toJson(controller.getState())).as("text/json");
    }

    public Result getJson() {

        final JsonObject data = new JsonObject();
        data.add("grid", gson.toJsonTree(controller.getGrid().getCellsAsRows()));
        data.add("state", gson.toJsonTree(controller.getState()));

        return ok(gson.toJson(data)).as("text/json");
    }

    public Result postJson() {
        return null;
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
}
