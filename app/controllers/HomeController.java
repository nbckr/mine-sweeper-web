package controllers;

import com.fasterxml.jackson.databind.JsonNode;
import com.google.gson.FieldNamingPolicy;
import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import com.google.gson.JsonObject;
import com.google.inject.Inject;
import de.htwg.se.minesweeper.Minesweeper;
import de.htwg.se.minesweeper.aview.gui.GUI;
import de.htwg.se.minesweeper.aview.tui.TUI;
import models.GridObserver;
import org.pac4j.core.config.Config;
import org.pac4j.core.profile.CommonProfile;
import org.pac4j.core.profile.ProfileManager;
import org.pac4j.play.PlayWebContext;
import org.pac4j.play.java.Secure;
import org.pac4j.play.store.PlaySessionStore;
import play.mvc.*;
import views.html.*;

import java.util.List;
import java.util.Scanner;


/**
 * This controller contains an action to handle HTTP requests
 * to the application's home page.
 */
public class HomeController extends Controller {

    private static final boolean SHOW_GUI_TUI = true;

    @Inject
    private Config config;

    @Inject
    private PlaySessionStore playSessionStore;

    private static final Gson gson = new GsonBuilder().setPrettyPrinting().serializeNulls().setFieldNamingPolicy(FieldNamingPolicy.IDENTITY).create();

    private static de.htwg.se.minesweeper.controller.impl.Controller controller = new de.htwg.se.minesweeper.controller.impl.Controller();

    public HomeController() {

        // If wished so, TUI and GUI run asynchronously for demonstration purposes
        if (SHOW_GUI_TUI) {
            (new Thread(new TuiThread())).start();
            (new Thread(new GuiThread())).start();
        }
    }

    private List<CommonProfile> getProfiles() {
        final PlayWebContext context = new PlayWebContext(ctx(), playSessionStore);
        final ProfileManager<CommonProfile> profileManager = new ProfileManager(context);
        return profileManager.getAll(true);
    }

    public LegacyWebSocket<String> connectWebSocket() {
        return new LegacyWebSocket<String>() {

            public void onReady(WebSocket.In<String> in, WebSocket.Out<String> out) {
                new GridObserver(controller, in, out);
            }
        };
    }

    @Secure(clients = "Google2Client")
    public Result game() {
        return ok(views.html.game.render(getProfiles().get(0)));
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

                case "start":
                    controller.startNewGame(json.findPath("size").textValue(), json.findPath("difficulty").textValue());
                    return created();

                default:
                    return badRequest("Unknown JSON game action");
            }

        }
    }


    public class TuiThread implements Runnable {

        @Override
        public void run() {
            TUI tui = new TUI(controller);

            // We can't process input as activator run doesn't listen to input, but we can print the TUI nevertheless

            //boolean loop = true;
            //Scanner scanner = new Scanner(System.in);
            //while (loop) {
            //    loop = tui.processInput(scanner.next());
            //    System.out.println("HALLO");
            //    System.err.println("WELT");
            //}
        }
    }

    public class GuiThread implements Runnable {

        @Override
        public void run() {
            GUI gui = new GUI(controller);
        }
    }
}
