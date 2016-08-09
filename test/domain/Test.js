var Domain = require("../../api/_domain");
var Test = function(obj, skipFields) {
     var self = this;
     Domain.call(this, {
         fields: obj,
         clazz: "Test",
         refClazz: self,
         domain: "test",
         skipFields: skipFields
     });
 };
 Domain.inherits(Test);

 Test.prototype._domainFields = [{
     name: "id",
     type: "number"
 }, {
     name: "field1",
     validate: ["nullable"]
 }, {
     name: "pass",
     type: "password",
     validate: ["nullable"]
 }, {
     name: "date",
     type: "timestamp",
     validate: ["nullable"]
 }];
 module.exports = Test;