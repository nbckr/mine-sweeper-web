package controllers;

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

    private Map<String, LegacyWebSocket<String>> activeUsers;
    private Map<String, Long> timesOfLastInteraction;
    private Timer timer = new Timer();

    /* Time in ms after which we delete game to prevent cache trashing */
    private static final int MAX_AGE = 4 * 60 * 60 * 1000;

    /* Period after which to check data in ms */
    private static final int CHECK_PERIOD = 5 * 60 * 1000; //3 * 60 * 60 * 1000;

    public WebSocketBroker() {
        LOGGER.info("CONSTRUCTOR Broker");
        this.activeUsers = new HashMap<>();
        this.timesOfLastInteraction = new HashMap<>();

        // Check regularly if we can delete data
        timer.schedule(new CheckMemoryTask(), CHECK_PERIOD, CHECK_PERIOD);
    }

    /**
     * If there is a game running for this user, the appropriate WebSocket is returned.
     * Otherwise, game will be started and new socket opened before it gets returned.
     */
    public LegacyWebSocket<String> getOrCreate(String userId) {

        // No game running for user, open new web socket and start game controller with default values
        if (!activeUsers.containsKey(userId)) {

            de.htwg.se.minesweeper.controller.impl.Controller controller = new de.htwg.se.minesweeper.controller.impl.Controller();

            LegacyWebSocket<String> webSocket = new LegacyWebSocket<String>() {
                public void onReady(WebSocket.In<String> in, WebSocket.Out<String> out) {
                    new WebSocketController(controller, in, out);
                }
            };

            activeUsers.put(userId, webSocket);
        }

        timesOfLastInteraction.put(userId, System.currentTimeMillis());
        return activeUsers.get(userId);
    }

    private class CheckMemoryTask extends TimerTask {

        @Override
        public void run() {

            LOGGER.info("Checking broker memory... current size " + activeUsers.size());

            activeUsers.keySet().forEach(userId -> {
                LOGGER.info("[UserId] " + userId);

                if (isTooOld(timesOfLastInteraction.get(userId))) {
                    LOGGER.warn("Deleting data for user " + userId);
                    activeUsers.remove(userId);
                    timesOfLastInteraction.remove(userId);
                }
            });
        }

        private boolean isTooOld(long time) {
            return System.currentTimeMillis() - MAX_AGE > time;
        }
    }
}
