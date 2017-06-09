package controllers;

import actors.PlayerActor;
import com.google.inject.Inject;
import org.pac4j.core.config.Config;
import org.pac4j.core.profile.CommonProfile;
import org.pac4j.core.profile.ProfileManager;
import org.pac4j.play.PlayWebContext;
import org.pac4j.play.java.Secure;
import org.pac4j.play.store.PlaySessionStore;
import play.Configuration;
import play.libs.ws.WSClient;
import play.mvc.*;
import views.html.*;

import java.util.List;


/**
 * This controller contains an action to handle HTTP requests
 * to the application's home page.
 */
public class HomeController extends Controller {

    @Inject
    private Config config;

    @Inject
    Configuration configuration;

    @Inject
    WSClient wsClient;

    @Inject
    private PlaySessionStore playSessionStore;

    public HomeController() {
    }

    private List<CommonProfile> getProfiles() {
        final PlayWebContext context = new PlayWebContext(ctx(), playSessionStore);
        final ProfileManager<CommonProfile> profileManager = new ProfileManager(context);
        return profileManager.getAll(true);
    }

    public LegacyWebSocket<String> connectWebSocket(String userId) {
        return WebSocket.withActor(out -> PlayerActor.props(out, userId, configuration, wsClient));
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

}
