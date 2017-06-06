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
import play.Configuration;
import com.google.inject.Inject;
import play.libs.ws.WSClient;
import play.libs.ws.WSResponse;

import java.io.IOException;
import java.util.concurrent.CompletionStage;


public class SolveActor extends UntypedActor {
    private final ActorRef out;
    private final Controller controller;
    private final String solveServiceUrl;
    private Gson gson = new GsonBuilder()
            .setPrettyPrinting()
            .serializeNulls()
            .setFieldNamingPolicy(FieldNamingPolicy.IDENTITY)
            .create();

    private ObjectMapper mapper = new ObjectMapper();

    @Inject
    WSClient ws;

    @Inject
    public SolveActor(ActorRef out, Controller controller, Configuration configuration) {
        this.out = out;
        this.controller = controller;
        this.solveServiceUrl = configuration.getString("solveServiceUrl");
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
                CompletionStage<WSResponse> postReq = ws.url(solveServiceUrl)
                        .setContentType("application/json")
                        .post(getGridJson());

                postReq.thenApply(res -> {
                    String body = res.getBody();

                    JsonNode json = null;

                    try {
                        json = mapper.readTree(body);
                    } catch (IOException e) {
                        e.printStackTrace();
                    }

                    json.findPath("mineProbabilities");

                    // TODO: pojo mapping or move that to the solver

                    return null;
                });
                break;
            case "single_step":
                break;
            case "all":
                break;
        }
    }

    private String getGridJson() {
        return gson.toJson(gson.toJsonTree(controller.getGrid().getCellsAsRows()));
    }

    public static Props props(ActorRef out, Controller controller) {
        return Props.create(SolveActor.class, out, controller);
    }
}
