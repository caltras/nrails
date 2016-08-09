const config = global.app_config;
var Firebase = require("firebase");
const miscellaneous = require("../utils/Miscellaneous");

var FirebaseTokenGenerator = require("firebase-token-generator");
var tokenGenerator = new FirebaseTokenGenerator(config.database.datasources.default.secret);
var token = tokenGenerator.createToken(
  { uid: "youn1ty20160719"},
  { admin: true }
);

function FirebaseData(config) {
    var self = this;
    FirebaseData.config = config;
    return self;
}

FirebaseData.datasources = {};
FirebaseData.createConnection = function() {
    Firebase.enableLogging(config.logginProvider);
    var ref = new Firebase(FirebaseData.getConfig().url);
    ref.authWithCustomToken(token, function(error, authData) {
      if (error) {
        console.log("Login Failed!", error);
      } else {
        console.log("Login Succeeded!");
      }
    });
    return ref;
};
FirebaseData.getConfig = function() {
    var cfg = FirebaseData.config;
    if (!cfg) {
        cfg = config.database.datasources.default;
        FirebaseData.config = cfg;
    }
    return cfg;
};
FirebaseData.getInstance = function(ds) {
    var dtSource = null;
    if (!FirebaseData.datasources.hasOwnProperty(ds)) {
        FirebaseData.datasources[ds] = FirebaseData.createConnection();
    }
    dtSource = FirebaseData.datasources[ds];
    return dtSource;
};
FirebaseData.getTimestamp = function() {
    return Firebase.ServerValue.TIMESTAMP;
};
FirebaseData.getTableReference = function(ds, domain) {
    return FirebaseData.getInstance(ds).child(domain);
};
FirebaseData.save = function(ds, domain, obj) {
    if(obj.id){
        var refBase = FirebaseData.getInstance(ds).child(domain).child(obj.id);
        return refBase.update(obj);
    }else{
        var ref = FirebaseData.getInstance(ds).child(domain);
        return ref.push(obj);
    }
};
FirebaseData.delete = function(ds,domain,key,callback,fail){
    var onComplete = function(error) {
      if (error) {
        fail.call();
      } else {
        callback.call();
      }
    };
    new Firebase(FirebaseData.getConfig().url + "/" + domain + "/" + key).remove(onComplete);
};

FirebaseData.find = function(ds, domain, criterias, callback, fail) {
    var instance = FirebaseData.getInstance(ds);
    var ref = instance.child(domain);
    return ref.once("value", function(snapshot){
        callback.call(this, miscellaneous.formatResponseFireBaseList(snapshot,snapshot.size()));
    }, fail);    
};

FirebaseData.findById = function(ds, domain, id, callback, fail) {
    new Firebase(FirebaseData.getConfig().url + "/" + domain + "/" + id).once("value", function(snapshot){
        callback.call(this,miscellaneous.formatResponseFireBaseOne(snapshot));
    }, fail);

};

FirebaseData.count = function(ds,domain,criteria,callback,fail){
    return new Firebase(FirebaseData.getConfig().url + "/" + domain).transaction(callback,fail);
};

module.exports = FirebaseData;