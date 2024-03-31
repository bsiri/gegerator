Readme
---------
Gegerator, a tool for planning as much events as possible at the Gerardmer movies festival.

Latest is 1.0.1-RELEASE. Assuming you have Java and Maven ready (see below), you 
can quickly set you up with:
```bash
git checkout 1.0.1-RELEASE
mvn clean install
cd gegerator.server
java -jar target/gegerator.server-1.0.1-RELEASE.jar
```

The app will be served at `http://localhost:8080`

### Tooling version ?
Java 11 recommended, should run on Java 8
Maven 3.8.6
Node server (for development): v16.13.0
Npm version: 8.1.0
Browser Ecmascript 12+

### Known bugs
* When refreshing the page, if the Wizard was enabled, you will need to 
  re-enable it again
* The `Résumé` panel on the right does not show a scrollbar when the content 
  overflows at the bottom.
* If one define a context path, eg by running with `-Dspring.webflux.base-path=something`,
  the front-end breaks.

# Development

These instruction apply for development, where a fully standalone server is not required and 
the various parts can be run separately.

### Modules
* gegerator: 
      the umbrella project that manage the other modules

* gegerator.domain: 
      contains the domain objects + the wizard auto planner.

* gegerator.server:
      contains the backend (web + services), is also the main module.
      It depends on gegerator.domain and gegerator-client.
      The jar it produces is an executable jar that embeds everything.

* gegerator-client:
      contains the Angular front end, packaged as a jar as well.

* gegerator-jmh:
      a JMH project for benchmarking the various planners and other tests, 
      it is not part of the final application.

### Useful commands

`mvn clean install`: 
  that Maven command will build any module it is executed in: delete old build, 
  compiles, run tests, and produce a jar (except for the umbrella Maven project).

`mvn test`: 
  runs the test of the module, although only gegerator.domain and 
  gegerator.server actually have tests.

`npm run build`:
  only useful in gegerator-client, it is a direct call to npm if you want 
  to bypass Maven.

`npm run clean:dist`:
  only useful in gegerator-client, will delete the '/dist' directory
  (the output directory npm run build).

### How do I run it ?

At the moment you must run from the IDE, because there is no packaging yet so the web server cannot
yet serve the webapp.

So you will need to separately start the backend server and webpack (the Angular proxy).

### How do I start the backend server ?

* If your IDE already have a working run configuration, use that.
* If not you can create one to run the class org.bsiri.gegerator.Gegerator in the module gegerator.server.
* Else, from within gegerator.server : `java -jar target/gegerator.server-<VERSION>.jar`

Note that gegerator.server embeds gegerator-client and serve it at 'http://localhost:8080'. However
it will be a much better development experience to access it using 'http://localhost:4200', 
see Webpack right below.

### How do I start Webpack ?

From within gegerator-client, run : `npm run startproxy`
This will run the Webpack (Angular proxy). It will be served at 'http://localhost:4200'.

Note that Webpack will hot-reload the changes in the code of the front-end. If you access the application
at 'http://localhost:8080', your code changes will not be reflected until gegerator.server is rebuilt.

### Datasets

The files in directory 'samples/' contain a few pre-populated grids with movies, events, ratings etc
so you don't start from scratch everytime. You can upload it using the button with the Up/Down arrows icons. 


# Create a distribution

### Executable jar
Just run `mvn clean install` from the umbrella project, and go pick the main jar 
in gegerator.server/target

### Docker image
TODO (docker file and documentation)