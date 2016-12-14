import javax.inject.*;
import play.*;
import play.filters.cors.CORSFilter;
import play.mvc.EssentialFilter;
import play.http.HttpFilters;
import play.mvc.*;

import filters.ExampleFilter;

/**
 * This class configures filters that run on every request. This
 * class is queried by Play to get a list of filters.
 *
 * Play will automatically use filters from any class called
 * <code>Filters</code> that is placed the root package. You can load filters
 * from a different class by adding a `play.http.filters` setting to
 * the <code>application.conf</code> configuration file.
 */
@Singleton
public class Filters implements HttpFilters {

    @Inject
    CORSFilter corsFilter;

    private final Environment env;
    private final EssentialFilter exampleFilter;

    /**
     * @param env Basic environment settings for the current application.
     * @param exampleFilter A demonstration filter that adds a header to
     */
    @Inject
    public Filters(Environment env, ExampleFilter exampleFilter) {
        this.env = env;
        this.exampleFilter = exampleFilter;
    }

    @Override

    public EssentialFilter[] filters() {
        return new EssentialFilter[] { corsFilter.asJava() };
    }

}
