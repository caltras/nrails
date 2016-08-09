var passport = require("passport");

module.exports = {
    load: function(name, ctrl, app) {
        var _gets = ctrl.get;
        var _deletes = ctrl.delete;
        var _puts = ctrl.put;
        var _post = ctrl.post;
        
        if (_gets) {
            this.register(name, "get", _gets, app, ctrl);
        }
        if (_post) {
            this.register(name, "post", _post, app, ctrl);
        }
        if (_deletes) {
            this.register(name, "delete", _deletes, app, ctrl);
        }
        if (_puts) {
            this.register(name, "put", _puts, app, ctrl);
        }
        return ctrl;
    },
    registerLogin : function(app){
        var config = global.app_config;
        var loginSucess = function(req, res) {
            req.failMsg = "";
            res.redirect(config.login.successRedirect);
        };
        if (config.login) {
            app.post(config.login.action, passport.authenticate('local', {
                    failureRedirect: config.login.failureRedirect
            }), loginSucess);
        }
        if (config.admin && config.admin.login){
            app.post(config.admin.login.action, passport.authenticate('local', {
                    failureRedirect: config.admin.login.failureRedirect
            }), loginSucess);
        }
    },
    registerAuthController: function(app) {
        var config = global.app_config;
        if (config.auth) {
            var url = "";
            var cbUrl = "";
            /*GOOGLE OAUTH*/
            if (config.auth.googleAuth && config.auth.googleAuth.enabled) {
                url = config.auth.googleAuth.url ? config.auth.googleAuth.url : "/auth/google";
                cbUrl = config.auth.googleAuth.callback ? config.auth.googleAuth.callback : "/auth/google/callback";

                app.get(url, passport.authenticate('google', {
                    scope: ['profile', 'email']
                }));
                app.get(cbUrl,
                    passport.authenticate('google', {
                        successRedirect: config.login.successRedirect,
                        failureRedirect: config.login.failureRedirect
                }));
            }
            /*FACEBOOK AUTH*/
            if (config.auth.fbAuth && config.auth.fbAuth.enabled) {
                
                url = config.auth.fbAuth.url ? config.auth.fbAuth.url : "/auth/facebook";
                cbUrl = config.auth.fbAuth.callback ? config.auth.fbAuth.callback : "/auth/facebook/callback";
                
                app.get(url, passport.authenticate('facebook', {
                    scope: 'email, public_profile'
                }));
                app.get(cbUrl,
                    passport.authenticate('facebook', {
                        successRedirect: config.login.successRedirect,
                        failureRedirect: config.login.failureRedirect
                }));
            }
        }
    },
    register: function(name, type, collection, app, ctrl) {
        var config = global.app_config;
        for (var i in collection) {
            var action = collection[i];
            var url = "/" + name;
            if (i && i != "/") {
                url += "/" + i;
            }
            url = url.replace(new RegExp("//", 'g'), "/");
            var authenticate = false;
            var fnAction = null;
            if (action) {
                if (Array.isArray(action)) {
                    if (typeof(action[0]) == "boolean") {
                        authenticate = action[0];
                        fnAction = action[1];
                    }
                    else {
                        fnAction = action[0];
                    }
                }
                else {
                    if (action instanceof Function) {
                        fnAction = action;
                    }
                    else {
                        authenticate = action.authenticate;
                        fnAction = action.action;
                    }
                }
                if (config.hasAuthentication === undefined) {
                    config.hasAuthentication = true;
                }
                if ((authenticate || ctrl.authenticateAll) && config.hasAuthentication) {
                    app[type](url, require('connect-ensure-login').ensureLoggedIn(), fnAction);
                }
                else {
                    app[type](url, fnAction);
                }
            }
        }
    }
};
