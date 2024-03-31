Readme
---------

Credits to https://github.com/FraktonDevelopers/spring-boot-angular-maven-build/blob/master/README.md for 
explaining how to package the angular app in the server jar !

TODO: also read https://www.baeldung.com/spring-webflux-static-content

### Any release yet ?

No, and probably the tip of master branch is not stable. However a functional version 
can be run if you revert to version `git checkout 1.0.0.PROTOTYPE`. See below 
in the `Development` section for instructions about how to run it.


### Which java version ?

Note sure, it's not configured in Maven :-O I recommend java 11 but it should run fine with java 8.

### Which Node and NPM version ?

Node server (for development): v16.13.0
npm version: 8.1.0

## Development

These instruction apply for development, where a fully standalone distro is not required and 
the various parts can/should be run separately.

### How do I build ?

`mvn clean install` will build the backend server.
`npm build` will build the webapp. 

### How do I run it ?

At the moment you must run from the IDE, because there is no packaging yet so the web server cannot
yet serve the webapp.

So you will need to separately start the backend server and webpack (the angular proxy).


### How do I start the backend server ?

* If your IDE already have a working run configuration, use that.
* If not you can create one to run the class org.bsiri.gegerator.Gegerator in the module gegerator.server.
* Else, from within gegerator.server : `java -jar target/gegerator.server-<VERSION>.jar`


### How do I start webpack ?

From within gegerator.client, run : `npm run startproxy`


### Also :

The file samples/gege_2020.json is a useful sample from the 2020 edition, with all movies and preferences set
so you don't start from scratch everytime. You can upload it using the button with the Up/Down arrows icons. 


## Create a distribution

TODO