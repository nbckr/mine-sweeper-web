package controllers;

import de.htwg.minesweeper.aview.tui.TUI;
import de.htwg.minesweeper.controller.*;
import play.mvc.*;

import play.mvc.Controller;
import views.html.*;

import static play.mvc.Results.ok;


/**
 * This controller contains an action to handle HTTP requests
 * to the application's home page.
 */
public class HomeController extends Controller {

    public Result processCommand(String command) {

        de.htwg.minesweeper.controller.Controller controller = new de.htwg.minesweeper.controller.Controller();
        TUI tui = new TUI(controller);
        tui.answerOptions(command);

        String tuiOutput = tui.printTui();

        //return ok(tuiOutput);
        //return ok(game.render(tuiOutput));
		return ok(views.html.game.render(tuiOutput));
    }

    /**
     * An action that renders an HTML page with a welcome message.
     * The configuration in the <code>routes</code> file means that
     * this method will be called when the application receives a
     * <code>GET</code> request with a path of <code>/</code>.
     */
    public Result index() {

        return ok("Hello");
    }
}
