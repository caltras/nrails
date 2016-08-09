var ELASTICSEARCH_URL = process.env.ELASTICSEARCH_URL;
var HTTP_BASE = process.env.HTTP_BASE || "https://micro-framework-caltras.c9users.io";
var DATA_BASE = process.env.DATA_BASE;
var PROVIDER_DATA_BASE = process.env.PROVIDER_DATA_BASE;
var FIREBASE_SECRET = process.env.FIREBASE_SECRET;
var ELASTIC_LOG = process.env.ELASTIC_LOG;
var GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
var GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
var FACEBOOK_CLIENT_ID = process.env.FACEBOOK_CLIENT_ID;
var FACEBOOK_CLIENT_SECRET = process.env.FACEBOOK_CLIENT_SECRET;
var AWS_CLIENT_ID = process.env.AWS_CLIENT_ID;
var AWS_CLIENT_SECRET = process.env.AWS_CLIENT_SECRET;

var config = {
    rootServer: "/server",
    welcome: {
        url: "/",
        controller: function(req, res) {
            res.render("site/index.html");
        }
    },
    views: {
        path: "site"
    },
    express: {
        views: "./client/",
        statics: "./client/",
        expressSession: "micro framework"
    },
    login: {
        method: "post",
        action: "/login/auth",
        failureRedirect: '/login',
        successRedirect: "/home/"
    },
    admin: {
        login: {
            method: "post",
            action: "/login/auth-admin",
            failureRedirect: '/login/admin',
            successRedirect: "/home/"
        }
    },
    dataProvider: PROVIDER_DATA_BASE,
    hasAuthentication: true,
    logginProvider: false,
    database: {
        datasources: {
            "default": {
                url: DATA_BASE,
                type: PROVIDER_DATA_BASE,
                secret:FIREBASE_SECRET
            }
        },
        inMemory : true
    },
    elasticsearch: {
        url: ELASTICSEARCH_URL,
        log: ELASTIC_LOG
    },
    cache: {
        enabled: false
    },
    auth: {
        googleAuth: {
            enabled: true,
            url: "/auth/google",
            callback: "/auth/google/callback",
            clientID: GOOGLE_CLIENT_ID,
            clientSecret: GOOGLE_CLIENT_SECRET,
            callbackURL: HTTP_BASE + "/auth/google/callback"
        },
        fbAuth: {
            enabled: true,
            url: "/auth/facebook",
            callback: "/auth/facebook/callback",
            clientID: FACEBOOK_CLIENT_ID,
            clientSecret: FACEBOOK_CLIENT_SECRET,
            callbackURL: HTTP_BASE + "/auth/facebook/callback",
        }
    },
    aws: {
        apikey: AWS_CLIENT_ID,
        secret: AWS_CLIENT_SECRET
    }
};
global.app_config = config;
module.exports = config;