package controllers;

import akka.actor.Props;
import akka.actor.UntypedActor;
import de.htwg.se.minesweeper.aview.gui.GUI;
import de.htwg.se.minesweeper.aview.tui.TUI;
import de.htwg.se.minesweeper.controller.impl.Controller;

/**
 * Created by nielsb on 30.04.17.
 */
public class GuiTuiActor extends UntypedActor {

    private final GUI gui;
    private final TUI tui;

    public GuiTuiActor(Controller controller) {
        gui = new GUI(controller);
        tui = new TUI(controller);
    }

    @Override
    public void onReceive(Object message) throws Throwable {

    }

    public static Props props(Controller controller) {
        return Props.create(GuiTuiActor.class, controller);
    }

    public void postStop() throws Exception {
        gui.dispose();
    }
}
