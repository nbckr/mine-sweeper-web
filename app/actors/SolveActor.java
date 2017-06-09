package actors;

import akka.actor.ActorRef;
import akka.actor.Props;
import akka.actor.UntypedActor;
import com.google.gson.FieldNamingPolicy;
import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import com.google.gson.JsonSyntaxException;
import com.google.inject.Inject;
import de.htwg.se.minesweeper.controller.IController;
import de.htwg.se.minesweeper.controller.IController.State;
import de.htwg.se.minesweeper.controller.impl.Controller;
import play.Configuration;
import play.libs.ws.WSClient;
import play.libs.ws.WSResponse;

import java.util.List;
import java.util.concurrent.CompletionStage;


public class SolveActor extends UntypedActor {
    private final Controller controller;
    private final String solveServiceUrl;
    private final WSClient wsClient;
    private Gson gson = new GsonBuilder()
            .setPrettyPrinting()
            .serializeNulls()
            .setFieldNamingPolicy(FieldNamingPolicy.IDENTITY)
            .create();


    @Inject
    public SolveActor(Controller controller, Configuration configuration, WSClient wsClient) {
        this.controller = controller;
        this.solveServiceUrl = configuration.getString("solveServiceUrl");
        this.wsClient = wsClient;
    }

    @Override
    public void onReceive(Object msg) throws Throwable {
        if (!(msg instanceof String)) {
            System.out.println("message is not a string");
            return;
        }

        String message = (String) msg;

        switch (message) {
            case "one":
                fetchSolveResult().whenComplete((solveResult, err) -> {
                    if (err != null) {
                        err.printStackTrace();
                        return;
                    }

                    System.out.println(solveResult);

                    if (!solveResult.clears.isEmpty()) {
                        Position clearPos = solveResult.clears.get(0);
                        controller.revealCell(clearPos.row, clearPos.col);
                    } else if (!solveResult.mines.isEmpty()) {
                        Position minePos = solveResult.mines.get(0);
                        controller.toggleFlag(minePos.row, minePos.col);
                    } else {
                        System.out.println("Can't open or flag a cell");
                    }
                });
                break;
            case "single_step":
                solveSingleStep();
                break;
            case "all":
                solveAll();
                break;
        }
    }

    private void solveAll() {
        solveSingleStep().thenAccept(canContinue -> {
            if (canContinue) {
                solveAll();
            }
        });
    }

    /**
     * @return if the solver can continue
     */
    private CompletionStage<Boolean> solveSingleStep() {
        return fetchSolveResult().handle((solveResult, err) -> {
            State state = controller.getState();
            if (state == State.GAME_LOST || state == State.GAME_WON) {
                return false;
            }

            if (err != null) {
                err.printStackTrace();
                return false;
            }

            if (solveResult.clears.isEmpty() && solveResult.mines.isEmpty()) {
                System.out.println("Can't open or flag a cell");
                return false;
            } else {
                solveResult.mines.forEach(minePos -> controller.toggleFlag(minePos.row, minePos.col));
                solveResult.clears.forEach(clearPos -> controller.revealCell(clearPos.row, clearPos.col));
                return true;
            }
        });
    }

    private CompletionStage<SolveResult> fetchSolveResult() {
        CompletionStage<WSResponse> postReq = wsClient.url(solveServiceUrl + "/solve")
                .setContentType("application/json")
                .post(getGridJson());

        return postReq.thenApply(res -> {
            String body = res.getBody();

            System.out.println(body);

            return gson.fromJson(body, SolveResult.class);
        });
    }

    private String getGridJson() {
        return gson.toJson(gson.toJsonTree(controller.getGrid().getCellsAsRows()));
    }

    public static Props props(Controller controller, Configuration configuration, WSClient wsClient) {
        return Props.create(SolveActor.class, controller, configuration, wsClient);
    }

    private class SolveResult {
        @Override
        public String toString() {
            return "SolveResult{" +
                    "mineProbabilities=" + mineProbabilities +
                    ", clears=" + clears +
                    ", mines=" + mines +
                    '}';
        }

        public List<Probability> mineProbabilities;
        public List<Position> clears;
        public List<Position> mines;
    }

    private class Probability {
        @Override
        public String toString() {
            return "Probability{" +
                    "cell=" + cell +
                    ", probability=" + probability +
                    '}';
        }

        public Position cell;
        public double probability;
    }

    private class Position {
        @Override
        public String toString() {
            return "Position{" +
                    "row=" + row +
                    ", col=" + col +
                    '}';
        }

        public int row;
        public int col;
    }
}
