package controllers;

import de.htwg.se.minesweeper.aview.gui.GUI;
import de.htwg.se.minesweeper.aview.tui.TUI;
import de.htwg.se.minesweeper.controller.impl.Controller;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import play.mvc.LegacyWebSocket;
import play.mvc.WebSocket;

import java.util.HashMap;
import java.util.Map;
import java.util.Timer;
import java.util.TimerTask;

/**
 * Keeps track of active users and their appropriate web socket connections.
 */
public class WebSocketBroker {

    private static final Logger LOGGER = LogManager.getRootLogger();

    private static final boolean SHOW_GUI_TUI = false;

    private Map<String, LegacyWebSocket<String>> webSockets;
    private Map<String, WebSocketController> webSocketControllers;
    private Map<String, Long> timesOfLastInteraction;

    private Timer timer = new Timer();

    /* Time in ms after which we delete game to prevent cache trashing */
    private static final int MAX_AGE = 1 * 60 * 60 * 1000;

    /* Period after which to check data in ms */
    private static final int CHECK_PERIOD = 5 * 60 * 1000; //3 * 60 * 60 * 1000;

    /* Period in ms after which we send a ping to prevent Heroku from closing WebSocket */
    private static final int PING_PERIOD = 30 * 1000;

    /* Period in ms after which we actually want to time out WebSocket */
    // private static final int TIMEOUT_PERIOD = 5 * 60 * 1000;
    // Just set MAX_AGE lower to remove socket after 1 hour

    public WebSocketBroker() {
        this.webSockets = new HashMap<>();
        this.webSocketControllers = new HashMap<>();
        this.timesOfLastInteraction = new HashMap<>();

        // Check regularly if we can delete data
        timer.schedule(new GarbageCollectorTask(), CHECK_PERIOD, CHECK_PERIOD);

        // Send pings to everyone who has been active in the last hour
        timer.schedule(new PingTask(), PING_PERIOD, PING_PERIOD);
    }

    /**
     * If there is a game running for this user, the appropriate WebSocket is returned.
     * Otherwise, game will be started and new socket opened before it gets returned.
     */
    public LegacyWebSocket<String> getOrCreate(String userId) {

        // No game running for user, open new web socket and start game controller with default values
        if (!webSockets.containsKey(userId)) {

            de.htwg.se.minesweeper.controller.impl.Controller controller = new de.htwg.se.minesweeper.controller.impl.Controller();


            // If wished so, TUI and GUI run asynchronously for demonstration purposes
            if (SHOW_GUI_TUI) {
                (new Thread(new TuiThread(controller))).start();
                (new Thread(new GuiThread(controller))).start();
            }

            LegacyWebSocket<String> webSocket = new LegacyWebSocket<String>() {
                public void onReady(WebSocket.In<String> in, WebSocket.Out<String> out) {
                    WebSocketController webSocketController = new WebSocketController(controller, in, out);
                    webSocketControllers.put(userId, webSocketController);
                }
            };

            webSockets.put(userId, webSocket);
        }

        timesOfLastInteraction.put(userId, System.currentTimeMillis());
        return webSockets.get(userId);
    }

    private class GarbageCollectorTask extends TimerTask {

        @Override
        public void run() {
            LOGGER.info("Checking broker memory... current size " + webSockets.size());

            webSockets.keySet().forEach(userId -> {
                LOGGER.info("[UserId] " + userId);

                if (isTooOld(timesOfLastInteraction.get(userId))) {
                    LOGGER.warn("Deleting data for user " + userId);
                    webSockets.remove(userId);
                    webSocketControllers.remove(userId);
                    timesOfLastInteraction.remove(userId);
                }
            });
        }

        private boolean isTooOld(long time) {
            return System.currentTimeMillis() - MAX_AGE > time;
        }
    }

    private class PingTask extends TimerTask {

        @Override
        public void run() {
            LOGGER.info("Run ping task");

            webSocketControllers.keySet().forEach(userId -> {
                LOGGER.info("Sending a ping to " + userId);
                webSocketControllers.get(userId).ping();
            });
        }
    }


    public class TuiThread implements Runnable {

        private Controller controller;

        public TuiThread(Controller controller) {
            this.controller = controller;
        }

        @Override
        public void run() {
            TUI tui = new TUI(controller);

            // We can't process input as activator run doesn't listen to it, but we can print the TUI nevertheless

            //boolean loop = true;
            //Scanner scanner = new Scanner(System.in);
            //while (loop) {
            //    loop = tui.processInput(scanner.next());
            //}
        }
    }

    public class GuiThread implements Runnable {

        private Controller controller;

        public GuiThread(Controller controller) {
            this.controller = controller;
        }
        @Override
        public void run() {
            GUI gui = new GUI(controller);
        }
    }
}
