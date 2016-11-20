var bson = require('bson');
var BSON = new bson.BSONPure.BSON();
const config = global.app_config;
var mongoDb = require("mongodb");
var MongoClient = mongoDb.MongoClient;
var ObjectID = mongoDb.ObjectID;

const miscellaneous = require("../utils/Miscellaneous");
const _ = require("lodash");

function MongoDBData(config) {
    var self = this;
    MongoDBData.config = config;
    return self;
}

MongoDBData.datasources = {};
MongoDBData.limit = 10;
MongoDBData.createConnection = function(ds) {
    ds = ds || "default";
    return new Promise(function(resolve, reject) {
        MongoClient.connect(MongoDBData.config.url, function(err, db) {
            if (err) {
                db.close();
                reject(err);
            }
            else {
                resolve(db);
            }
        });
    });
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
    return MongoDBData.createConnection(ds);
};
MongoDBData.getTimestamp = function() {
    return new Date().getTime();
};
MongoDBData.getTableReference = function(ds, domain) {
    return {
        on:function(event,callback){
            
        }
    };
};
MongoDBData.save = function(ds, domain, obj) {
    return new Promise(function(resolve, reject) {
        MongoDBData.getInstance(ds).then(function(db) {
            var collection = db.collection(domain);
            collection.insertOne(obj, function(err, result) {
                db.close();
                if (err) {
                    reject(err);
                }else {
                    obj.id  = ObjectID(result.insertedId.id).toString();
                    resolve(miscellaneous.formatResponseMongoDbOne(obj));
                }
            });
        }).catch(function(err) {
            reject(err);
        });
    });
};
MongoDBData.delete = function(ds, domain, key) {
    return new Promise(function(resolve, reject) {
        MongoDBData.getInstance(ds).then(function(db) {
            var collection = db.collection(domain);
            collection.deleteOne({"_id": new ObjectID(key) }, function(err, result) {
                db.close();
                if (err) {
                    reject(err);
                }
                else {
                    resolve(result.deletedCount);
                }
            });
        }).catch(function(err) {
            reject(err);
        });
    });
};

MongoDBData.find = function(ds, domain, criterias,options) {
    var opts = options || {};
    return new Promise(function(resolve, reject) {
        MongoDBData.getInstance(ds).then(function(db) {
            db.collection(domain)
                .find(criterias)
                .count().then(function(data){
                    var cursor = db.collection(domain)
                        .find(criterias)
                        .limit(opts.limit || MongoDBData.limit);
                    
                    if(opts.sort){
                        cursor.sort(opts.sort);
                    }
                        
                    cursor.toArray(function(err, docs) {
                        db.close();
                        if (err) {
                            reject(err);
                            return;
                        }
                        resolve(miscellaneous.formatResponseMongoDbList(docs,data));
                    });
                });
        }).catch(function(err) {
            reject(err);
        });
    });
};

MongoDBData.findById = function(ds, domain, id) {
    return new Promise(function(resolve, reject) {
        MongoDBData.getInstance(ds).then(function(db) {
            db.collection(domain)
                .find({"_id": new ObjectID(id)})
                .toArray(function(err, docs) {
                    db.close();
                    if (err) {
                        reject(err);
                        return;
                    }
                    resolve(miscellaneous.formatResponseMongoDbOne(_.find(docs)));
                });
        }).catch(function(err) {
            reject(err);
        });
    });
};

MongoDBData.count = function(ds, domain, criteria) {
    return new Promise(function(resolve, reject) {
        MongoDBData.getInstance(ds).then(function(db) {
            var count = db.collection(domain)
                .find(criteria)
                .count();
            db.close();
            resolve(count);
        }).catch(function(err) {
            reject(err);
        });
    });
};

module.exports = MongoDBData;