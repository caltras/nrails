const config = global.app_config;
var MongoClient = require("mongodb").MongoClient;
const miscellaneous = require("../utils/Miscellaneous");

function MongoDBData(config) {
    var self = this;
    MongoDBData.config = config;
    return self;
}

MongoDBData.datasources = {};
MongoDBData.createConnection = function() {
    return null;
};
MongoDBData.getConfig = function() {
    var cfg = MongoDBData.config;
    if (!cfg) {
        cfg = config.database.datasources.default;
        MongoDBData.config = cfg;
    }
    return cfg;
};
MongoDBData.getInstance = function(ds) {
    var dtSource = null;
    if (!MongoDBData.datasources.hasOwnProperty(ds)) {
        MongoDBData.datasources[ds] = MongoDBData.createConnection();
    }
    dtSource = MongoDBData.datasources[ds];
    return dtSource;
};
MongoDBData.getTimestamp = function() {
    return null;
};
MongoDBData.getTableReference = function(ds, domain) {
    return null;
};
MongoDBData.save = function(ds, domain, obj) {
    return null;
};
MongoDBData.delete = function(ds,domain,key,callback,fail){
    return null;
};

MongoDBData.find = function(ds, domain, criterias, callback, fail) {
    return null;    
};

MongoDBData.findById = function(ds, domain, id, callback, fail) {
    return null;

};

MongoDBData.count = function(ds,domain,criteria,callback,fail){
    return null;
};

module.exports = MongoDBData;