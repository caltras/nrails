var mocha = require("mocha");
var sinon = require("sinon");
var assert = require("chai").assert;
var expect = require("chai").expect;
var neDBData = require("../data/NeDBData");
var Datastore = {
    Datastore: require("nedb")
};

describe("Unit test NeDBData", function() {
    before(function() {
        sinon.stub(Datastore, "Datastore", function() {
            return function() {
                var self = this;
                this.insert = function() {};
                this.update = function() {};
                this.delete = function() {};
                this.count = function() {
                    return self;
                };
                this.find = function() {
                    return self;
                };
                this.findOne = function() {
                    return self;
                };
                this.sort = function() {
                    return self;
                };
                this.skip = function() {
                    return self;
                };
                this.limit = function() {
                    return self;
                };
                this.exec = function(callback) {
                    callback.call(this, true);
                    return self;
                };
            };
        });
    });
    after(function() {
        Datastore.Datastore.restore();
    });
    it("createRepository", function() {
        assert(new neDBData().createRepository("test") instanceof neDBData);
    });
    it("insert", function() {
        var mem = new neDBData("test");
        mem.createRepository("test");
        assert(mem.insert({}));
    });
    it("update", function() {
        var mem = new neDBData("test");
        mem.createRepository("test");
        assert(mem.update({}));
    });
    it("remove", function() {
        var mem = new neDBData("test");
        mem.createRepository("test");
        assert(mem.remove({}));
    });
    it("findOne", function(done) {
        var mem = new neDBData("test");
        mem.createRepository("test");
        mem.findOne({}).then(function(data) {
            assert(data);
            done();
        });
    });
    it("findOne with datasource", function(done) {
        var mem = new neDBData("test");
        mem.createRepository("test");
        mem.findOne({},"test").then(function(data) {
            assert(data);
            done();
        });
    });
    it("findOne with criteria", function(done) {
        var mem = new neDBData("test");
        mem.createRepository("test");
        mem.findOne({
            or: { id: 1, field1:"Test"},
            and:{ id: 1, field1:"Test"},
            not: {
                in : {
                    id: [2,3]
                }
            }
        }).then(function(data) {
            assert(data);
            done();
        });
    });
    it("find", function(done) {
        var mem = new neDBData("test");
        mem.createRepository("test","test");
        mem.find({}).then(function(data) {
            assert(data);
            done();
        });
    });
    it("find with datasource", function(done) {
        var mem = new neDBData("test");
        mem.createRepository("test","test");
        mem.find({},"test").then(function(data) {
            assert(data);
            done();
        });
    });
    it("find with criteria", function(done) {
        var mem = new neDBData("test");
        mem.createRepository("test");
        mem.find({
            between: {
                id: [2,3]
            },
            field:"Tes*"
        }).then(function(data) {
            assert(data);
            done();
        });
    });
    it("count", function(done) {
        var mem = new neDBData("test");
        mem.createRepository("test");
        mem.count({}).then(function(data) {
            assert(data==0);
            done();
        });
    });
    it("count with datasource", function(done) {
        var mem = new neDBData("test");
        mem.createRepository("test","test");
        mem.count({},"test").then(function(data) {
            assert(data==0);
            done();
        });
    });
});