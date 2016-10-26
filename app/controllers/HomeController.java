package controllers;

import de.htwg.minesweeper.aview.tui.TUI;
import play.mvc.Controller;
import play.mvc.Result;
import views.html.about;
import views.html.index;
import views.html.instructions;


/**
 * This controller contains an action to handle HTTP requests
 * to the application's home page.
 */
public class HomeController extends Controller {

    de.htwg.minesweeper.controller.Controller controller = new de.htwg.minesweeper.controller.Controller();
    TUI tui = new TUI(controller);

    public Result game() {
        return processCommand("h");
    }

    public Result processCommand(String command) {

        tui.answerOptions(command);

        String tuiOutput = tui.printTui();
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
