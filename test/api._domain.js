var mocha = require("mocha");
var sinon = require("sinon");
var assert = require("chai").assert;
var expect = require("chai").expect;
var Domain = require("../api/_domain");
var _provider = require("../api/_data_provider");


var Provider = function(){
    this.getTimestamp = function(){
        return new Date().getTime();
    };
    this.save = function(obj){
        obj.key = function(){
            return 1;
        };
        return obj;
    };
};
Domain.path = "../test/domain/";
describe("unit test Domain", function() {
    before(function(){
        sinon.stub(_provider.prototype,"getTimestamp",function(){
            return new Date().getTime();
        });
        sinon.stub(_provider.prototype,"save",function(obj){
            obj.key = function(){
                return 1;
            };
            return obj;
        });
        sinon.stub(_provider.prototype,"delete",function(id){
            return true;
        });
        sinon.stub(_provider,"find",function(ds, domain, criterias, callback, fail, nocache){
            return true;
        });
        sinon.stub(_provider,"findById",function(ds, domain, id, callback, fail, nocache){
            return true;
        });
        sinon.stub(_provider,"count",function(ds, domain, id, callback, fail, nocache){
            return true;
        });
    });
    after(function(){
        _provider.prototype.getTimestamp.restore();
        _provider.prototype.save.restore();
        _provider.prototype.delete.restore();
        _provider.find.restore();
        _provider.findById.restore();
        _provider.count.restore();
    });
    describe("create", function() {
        it("options undefined", function() {
            assert(new Domain() instanceof Object);
        });
        it("options", function() {
            var options = {
                fields: [{
                    name: "field1"
                }],
                clazz: "Test",
                domain: "test"
            };
            assert(new Domain(options) instanceof Object);
        });
        it("check created fields", function() {
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


            assert(new Test({
                id: 1,
                field1: "test",
                field2: "test2",
                pass: "12345",
                date: new Date().getTime()
            }) instanceof Test);

        });
    });
    describe("validate", function() {
        it("is valid", function() {
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


            var obj = new Test({
                id: 1,
                field1: "test",
                field2: "test2",
                pass: "12345",
                date: new Date().getTime()
            });
            assert(obj.validate());
        });
        it("is not valid", function() {
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
                type: "number",
                validate: ["number"]
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
            }, {
                name: "list",
                inList: ["ABC", "BCA"]
            }];


            var obj = new Test({
                id: "aaa",
                field1: "test",
                field2: "test2",
                date: new Date().getTime(),
                list: ["BBB"]
            });
            assert(!obj.validate());
        });
    });

    describe("hasErrors", function() {
        it("error", function() {
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
                type: "number",
                validate: ["number"]
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
            }, {
                name: "list",
                inList: ["ABC", "BCA"]
            }];


            var obj = new Test({
                id: "aaa",
                field1: "test",
                field2: "test2",
                date: new Date().getTime(),
                list: ["BBB"]
            });
            obj.validate();
            assert(obj.hasErrors());
        });
    });
    describe("toJson",function(){
        it("check equals", function() {
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

            var date = new Date().getTime();
            var objExpected = {
                id: 1,
                field1: "test",
                pass: "827ccb0eea8a706c4c34a16891f84e7b",
                date: date
            };
            var obj = new Test({
                id: 1,
                field1: "test",
                field2: "test2",
                pass: "12345",
                date: date
            });
            obj._provider = new Provider();
            var returnObj = obj.toJson();
            delete returnObj.update;
            expect(returnObj.id).to.equals(objExpected.id);
            expect(returnObj.field1).to.equals(objExpected.field1);
            expect(returnObj.pass).to.equals(objExpected.pass);
            expect(returnObj.date).to.equals(objExpected.date);
            expect(returnObj.field2).to.equals(undefined);
        });
        it("skip fields", function() {
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

            var date = new Date().getTime();
            var objExpected = {
                id: 1,
                field1: "test",
                pass: "12345",
                date: date
            };
            var obj = new Test({
                id: 1,
                field1: "test",
                field2: "test2",
                pass: "12345",
                date: date
            },["pass"]);
            obj._provider = new Provider();
            var returnObj = obj.toJson();
            delete returnObj.update;
            expect(returnObj.id).to.equals(objExpected.id);
            expect(returnObj.field1).to.equals(objExpected.field1);
            expect(returnObj.pass).to.equals(objExpected.pass);
            expect(returnObj.date).to.equals(objExpected.date);
            expect(returnObj.field2).to.equals(undefined);
        });
    });
    describe("set method",function(){
        it("fill fields as Array",function(){
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
            var obj = new Test();
            obj.set([{
                field1:"Test1",
            },{
                id:1
            }]);
            
            expect(obj.fields.field1).to.equals("Test1");
            expect(obj.fields.id).to.equals(1);
        });
        it("fill fields as Object",function(){
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
            var obj = new Test();
            obj.set({
                field1:"Test1",
                id:1
            });
            
            expect(obj.fields.field1).to.equals("Test1");
            expect(obj.fields.id).to.equals(1);
        });
    });
    describe("save object",function(){
        it("success",function(){
            var Test = require("./domain/Test");

            var obj = new Test({
                id: 1,
                field1: "test",
                field2: "test2",
                pass: "12345",
                date: new Date().getTime()
            });
            assert(!obj.save().errors);
        }); 
        it("error",function(done){
            var Test = require("./domain/Test");

            var obj = new Test({
                id: null,
                field1: null,
                field2: "test2",
                pass: "12345",
                date: new Date().getTime()
            });
            obj.save().then(function(){
                expect.fail();
            }).catch(function(error){
                done();
            });
        });
    });
    describe("delete",function(){
       it("success",function(){
           var Test = require("./domain/Test");
           var obj = new Test();
           assert(obj.delete());
       });
    });
    describe("static methods",function(){
        it("find",function(){
            var Test = require("./domain/Test");
            assert(Test.find({}));    
        });
        it("find without criterias",function(){
            var Test = require("./domain/Test");
            assert(Test.find(function(){}));    
        });
        it("findById",function(){
            var Test = require("./domain/Test");
            assert(Test.findById(1));    
        });
        it("count",function(){
            var Test = require("./domain/Test");
            assert(Test.count({criterias:{}}));    
        });

    });

});