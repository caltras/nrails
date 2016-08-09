var fs = require("fs");
var express = require('express');
var _ = require("lodash");
var passport = require('passport');
var Strategy = require('passport-local').Strategy;
var FacebookStrategy = require('passport-facebook').Strategy;
var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
var rootDir = global.root_directory;
//Private library
var _c = require('./api/_controller');
var di = require("./api/_di");
var config = require("./config/config.js");

var DataFactory = require('./data/DataFactory');
global.Misc = require("./utils/Miscellaneous");
var pack = require("./package.json");

String.prototype.toCamelCase = function() {
    return this
        .replace(/\s(.)/g, function($1) {
            return $1.toUpperCase();
        })
        .replace(/\s/g, '')
        .replace(/^(.)/, function($1) {
            return $1.toLowerCase();
        });
};

var Main = function() {

    var self = this;

    //self.pathConfig = './server/config";
    self.pathController = rootDir+"/server/controller";
    self.pathService = rootDir+"/server/service";
    self.controllers = {};
    self.services = {};
    self.config = [];

    self.init = function(configuration) {
        var cfg = configuration || {};
        _loadConfig(cfg.defaultConfig);
        _configure(cfg.passport);
        _loadServices();
        _loadControllers();
        _configureCDN();
        _configureDB();
        return self;
    };
    var _configureDB = function() {
        for (var i in self.config.database.datasources) {
            if (i) {
                var ds = self.config.database.datasources[i];
                DataFactory(ds, ds.type);
            }
        }
    };
    var _configureCDN = function() {
        if (self.config.cdn) {
            self.app.get("/images/:id", function(req, res) {
                res.send(self.config.cdn + "images/" + req.params.id);
            });
            self.app.get("/videos/:id", function(req, res) {
                res.send(self.config.cdn + "videos/" + req.params.id);
            });
        }
    };
    var _loadConfig = function(cfg) {
        self.config = cfg || config;
        global.app_config = self.config;
        if (!self.config.views) {
            self.config.views = {};
        }
        if (!self.config.views.path) {
            self.config.views.path = "site";
        }
        if (!self.config.express) {
            self.config.express = {
                views: "/client/",
                statics: "/client/"
            };
        }
        if (self.config.hasAuthentication === undefined) {
            self.config.hasAuthentication = true;
        }
        self.config.relativeRootServer = "/server";
        if(!self.config.rootServer){
            self.config.rootServer = rootDir+"/server";
        }else{
            self.config.rootServer = rootDir+self.config.rootServer;
        }
        return self;
    };
    var _configureLocalPassport = function(v){
        return new Strategy({
                    passReqToCallback: true
                },v);
    };
    var _configureFacebookPassport = function(v){
        return new FacebookStrategy({
                clientID: self.config.auth.fbAuth.clientID,
                clientSecret: self.config.auth.fbAuth.clientSecret,
                callbackURL: self.config.auth.fbAuth.callbackURL,
            },v);
    };
    var _configureGooglePassport = function(v){
        return new GoogleStrategy({
                clientID: self.config.auth.googleAuth.clientID,
                clientSecret: self.config.auth.googleAuth.clientSecret,
                callbackURL: self.config.auth.googleAuth.callbackURL,
            },v);
    };
    var _configurePassport = function(passaportConfigurations) {
        if((passaportConfigurations.hasOwnProperty("local") || passaportConfigurations.hasOwnProperty("facebook") || passaportConfigurations.hasOwnProperty("google"))
        && passaportConfigurations.hasOwnProperty("deserializeUser") && passaportConfigurations.hasOwnProperty("serializeUser")){
            _.each(passaportConfigurations,function(v,k){
                switch(k){
                    case "local":
                        passport.use(_configureLocalPassport(v));
                        break;
                    case "facebook":
                        passport.use(_configureFacebookPassport(v));
                        break;
                    case "google":
                        passport.use(_configureGooglePassport(v));
                        break;
                }
            });
            passport.serializeUser(passaportConfigurations["serializeUser"]);
            passport.deserializeUser(passaportConfigurations["deserializeUser"]);
        }else{
            console.log("It's not possible configurate the passaport authentication");
        }
        
    };
    var _configure = function(passaportConfiguration) {
        if (self.config.hasAuthentication && passaportConfiguration && passaportConfiguration.hasOwnProperty("passport")) {
            _configurePassport(passaportConfiguration.passport);
        }

        var app = express();
        app.configure(function() {
            app.set('views', self.config.express.views);
            app.engine('html', require('ejs').renderFile);

            app.use(express.logger('dev'));
            app.use(express.cookieParser());
            app.use(express.bodyParser());
            app.use(express.session({
                secret: self.config.express.expressSession
            }));

            app.use(express.urlencoded());
            app.use(express.json());
            app.use(express.static(self.config.express.statics));
            app.use('/scripts', express.static('./node_modules/'));
            
            if (self.config.hasAuthentication) {
                app.use(passport.initialize());
                app.use(passport.session());
            }
        });
        if(app){
            app.locals.require = require;
        }
        self.app = app;
        return self;
    };
    var _loadServices = function() {
        if (!fs.existsSync(self.pathService)) {
            fs.mkdir(self.pathService);
        }
        fs.readdir(self.pathService, function(error, files) {
            if (error) {
                console.error(error);
                return;
            }
            for (var i = 0; i < files.length; i++) {
                var name = files[i].replace("Service", "").replace(".js", "").toLowerCase();
                self.services[name] = require(self.config.rootServer+"/service/" + files[i].replace(".js", ""));
            }
        });
        return self;
    };
    var _loadControllers = function() {
        if (self.config) {
            if (self.config.welcome) {
                self.app.get(self.config.welcome.url, self.config.welcome.controller);
            }
            else {
                self.app.get("/", function(req, res) {
                    res.render(self.config.views.path + "/index.html");
                });
            }
        }
        if (!fs.existsSync(self.pathController)) {
            fs.mkdir(self.pathController);
        }
        fs.readdir(self.pathController, function(error, files) {
            if (error) {
                console.error(error);
                return;
            }
            for (var i = 0; i < files.length; i++) {
                var name = files[i].replace("Controller", "").replace(".js", "").toLowerCase();
                var controller = self.controllers[name] = _c.load(name, require(self.config.rootServer+"/controller/" + files[i].replace(".js", "")), self.app);
                controller.app = self;
                if (controller.hasOwnProperty("services")) {
                    for (var s in controller.services) {
                        if (s) {
                            var nameService = controller.services[s];
                            var nameServiceCamelCase = nameService.toCamelCase();
                            try {
                                controller[nameServiceCamelCase] = di.$inject(nameService,self.config.rootServer+"/");
                            }
                            catch (e) {
                                console.log("Trying to inject service %s in the controller %s", nameService, files[i]);
                                throw e;
                            }
                        }
                    }
                }
            }
        });
        
        _c.registerLogin(self.app);
        _c.registerAuthController(self.app);
        
        self.app.use(function(req, res, next) {
            res.render(self.config.views.path + "/error/404.html");
        });
        return self;
    };
    self.error = function(res, error, code) {
        var c = code || 505;
        res.render(self.config.views.path + "/error/" + c + ".html", {
            error: error
        });
    };
    self.listen = function() {
        self.app.listen(process.env.PORT || 3000, process.env.IP || "0.0.0.0", function() {
            console.log("#....................................#");
            console.log("#....................................#");
            console.log("#....................................#");
            console.log(`#.....Starting NRails v${pack.version}.........#`);
            console.log("#....................................#");
            console.log("#....................................#");
            console.log("#....................................#");
            console.log(`#...by ${pack.author.name}...#`);
        });
    };
    return self;
};
module.exports = Main;