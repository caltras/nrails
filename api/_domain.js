const util = require('util');
const config = global.app_config;
var Provider = require("../api/_data_provider");
var Cache = require("../api/_cache");
var miscellaneous = require("../utils/Miscellaneous");
var _ = require("lodash");
var NULLABLE = "nullable";
var NUMBER = "number";
var MemDB = require("../data/NeDBData");
if(!global.memDB){
    global.memDB = new MemDB();
}

function Domain(options) {
    var self = this;
    if (options) {
        self._skipFields = options.skipFields || [];
        self.fields = options.fields;
        self._clazz = options.clazz;
        self._domain = options.domain;
        if (self._clazz) {
            options.refClazz = options.refClazz || {};
            options.refClazz.clazz = self._clazz;
            options.refClazz.domain = self._domain;
        }
        self._provider = new Provider("default", self._domain);
    }
    self.dataSource = null;
    self.errors = [];
    self._constructor();
    return self;
}
Domain.path = "../domain/";
Domain.prototype.skipFields = function(fields) {
    var self = this;
    self._skipFields = fields || [];
};
Domain.prototype._constructor = function() {
    var self = this;
    if (self.fields) {
        _.each(self._domainFields, function(field) {
            if (!miscellaneous.isNullOrEmpty(self.fields[field.name])) {
                var value = self._convertoToType(field, self.fields[field.name]);
                if (self._skipFields.length > 0 && self._skipFields.indexOf(field.name) >-1) {
                    value = self.fields[field.name];
                }
                self[field.name] = value;
            }
        });
    }
};

Domain.prototype._convertoToType = function(field, value) {
    if (field.hasOwnProperty("type")) {
        if (field.type === "password") {
            value = miscellaneous.toMD5(value);
        }
        if (field.type === "timestamp") {
            value = miscellaneous.toTimestamp(value);
        }
        if (field.type === "number") {
            value = value ? Number(value) : null;
        }
    }
    return value;
};
Domain.prototype.validate = function() {
    var valid = true;
    var self = this;
    self.errors = [];
    var fieldsToValidate = _.filter(self._domainFields, function(f) {
        return f.validate || f.inList;
    });
    _.each(fieldsToValidate, function(field) {
        var value = self.fields[field.name];
        if(field.validate){
            if (field.validate.indexOf(NULLABLE) > -1) {
                if (miscellaneous.isNullOrEmpty(value)) {
                    valid = false;
                    self.errors.push(field.name.toUpperCase() + " cannot be null ");
                }
            }
            if (field.validate.indexOf(NUMBER) > -1) {
                if (miscellaneous.isNullOrEmpty(value) || !miscellaneous.isNumber(value)) {
                    valid = false;
                    self.errors.push(field.name.toUpperCase() + " should be a number ");
                }
            }
        }
        if(field.inList && field.inList.length > 0){
            if(field.inList.indexOf(value) === -1){
                valid = false;
                self.errors.push(field.name.toUpperCase() + " should be between the values: "+field.inList.join(","));
            }
        }
    });
    return valid;
};
Domain.prototype.hasErrors = function() {
    var self = this;
    return self.errors && self.errors.length > 0;
};
Domain.prototype.toJson = function() {
    var self = this;
    var arrayReturn = {};
    _.each(self._domainFields, function(field) {
        if (!miscellaneous.isNullOrEmpty(self.fields[field.name])) {
            var value = self._convertoToType(field, self.fields[field.name]);
            if (self._skipFields.length > 0 && self._skipFields.indexOf(field.name) >-1) {
                value = self.fields[field.name];
            }
            arrayReturn[field.name] = value;
        }else{
            if(self.fields[field.name] instanceof Array){
                arrayReturn[field.name] = self.fields[field.name];
            }
        }
    });
    arrayReturn.update = self._provider.getTimestamp();
    return arrayReturn;
};

Domain.prototype.set = function(_fields) {
    var self = this;
    var existFields = _.map(self._domainFields,"name");
    self.fields = self.fields || {};
    if (_fields instanceof Array) {
        _.each(_fields, function(obj) {
            _.each(obj, function(value, k) {
                if(existFields.indexOf(k) > -1){
                    self.fields[k] = value;
                }
            });
        });
    }else {
        var keys = _.keys(_fields);
        _.each(keys, function(k) {
            if(existFields.indexOf(k) > -1){
                self.fields[k] = _fields[k];
            }
        });
    }
};
Domain.prototype.save = function() {
    var self = this;
    var d = null;
    var obj = self.fields;
    var strClazz = self._clazz;
    try {
        var clazz = require(Domain.path + strClazz);
        d = new clazz(obj, self._skipFields);
    }
    catch (e) {
        d = obj;
    }
    var responseJson = null;
    var response = null;
    responseJson = d.toJson();
    if (d.validate()) {
        response = self._provider.save(responseJson);
        responseJson.id = responseJson.id ? responseJson.id : response.key();
    }
    else {
        responseJson.errors = d.errors;
    }
    d = null;
    response = null;
    return responseJson;
};
Domain.prototype.updateField = function(field){
    var self = this;
    self._provider.updateField(self.id,field);
    return self;
};
Domain.prototype.delete = function(callback, fail) {
    var self = this;
    return self._provider.delete(self.id, callback, fail);
};
Domain.findById = function(id, callback, fail, nocache) {
    var self = this;
    var domain = self.domain;
    return Provider.findById("default", domain, id, callback, fail, nocache);
};
Domain.find = function(criterias, callback, fail, nocache) {
    var self = this;
    var domain = self.domain;
    if (criterias instanceof Function) {
        return Provider.find("default", domain, null, criterias, fail, nocache);
    }
    else {
        return Provider.find("default", domain, criterias, callback, fail, nocache);
    }
};

Domain.count = function(options) {
    var self = this;
    var domain = self.domain;
    return Provider.count("default", domain, options.criteria, options.callback, options.fail, options.nocache);
};

Domain.inherits = function(dest) {
    util.inherits(dest, Domain);
    var self = this;
    for (var i in self) {
        dest[i] = self[i];
    }
};
Domain.initializeCache = function() {
    var self = this;
    var domain = self.domain;
    
    function upsert(snapshot) {
        if (config.cache && config.cache.enabled) {
            Cache.save('domains', domain, snapshot);
        }
        if(config.database.inMemory){
            global.memDB.findOne({id:snapshot.key()},domain).then(function(data){
                if(data.first()){
                    var obj = snapshot.val();
                    obj.id = data.first().id;
                    obj._id = data.first()._id;
                    global.memDB.update(obj,domain);
                }
            },function(error){
                 console.log("It's not possible insert/update register");
            });
            
        }
    }
    function insert(snapshot){
       if (config.cache && config.cache.enabled) {
            Cache.save('domains', domain, snapshot);
        }
        if(config.database.inMemory){
            var obj = snapshot.val();
            obj.id = snapshot.key();
            global.memDB.insert(obj,domain);    
        } 
    }

    function remove(snapshot) {
        if (config.cache && config.cache.enabled) {
            Cache.delete('domains', domain, snapshot);
        }
        if(config.database.inMemory){
            global.memDB.remove({ id: snapshot.key() } ,domain);
        }
    }

    var _provider = new Provider("default", domain);
    var ref = _provider.getTableReference();
    
    if(config.database.inMemory){
        global.memDB.createRepository(domain);
    }
    
    ref.on('child_added', insert);
    ref.on('child_changed', upsert);
    ref.on('child_removed', remove);
};

module.exports = Domain;