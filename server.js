var path = require('path');
global.root_directory = path.resolve(__dirname);
var _ = require("lodash");
var users = [{
    id: 1,
    username: "microFramework"
}, {
    username: "microFramework-facebook"
}, {
    username: "microFramework-google"
}, ];

var microFramework = require("micro-framework");
var config = require("./server/config");
new microFramework()
    .init(
        {
        defaultConfig : config,
        passport: {
            "local": function(req, username, password, cb) {
                return cb(null, users[0]);
            }
        },
        "facebook": function(token, refreshToken, profile, done) {
            (function(token, profile, cb) {
                process.nextTick(function() {
                    users[1].id = token;
                    cb(null, users[1]);
                });
            })(token, profile, done);
        },
        "google": function(token, refreshToken, profile, done) {
            (function(token, profile, cb) {
                process.nextTick(function() {
                    users[2].id = token;
                    cb(null, users[2]);
                });
            })(token, profile, done);
        },
        "serializeUser": function(user, cb) {
            cb(null, user.id);
        },
        "deserializeUser": function(id, cb) {
            cb(null, _.find(users, {
                id
            }));
        }
    })
    .listen();