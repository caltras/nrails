var mocha = require("mocha");
var sinon = require("sinon");
var assert = require("chai").assert;
var expect = require("chai").expect;
var Provider = require("../api/_data_provider");
var Cache = require("../api/_cache");
var memDBMock = {
    findOne:function(criteria,domain){
        return new Promise(function(resolve,reject){
            resolve(true);
        });
    },
    find:function(criteria,domain){
        return new Promise(function(resolve,reject){
            resolve(true);
        });
    },
    count: function(criteria,domain){
        return new Promise(function(resolve,reject){
            resolve(1);
        });
    }
};
global.memDB = memDBMock;
var CacheMock = {
    query : function(index,table,criteria,callback,fail){
        return new Promise(function(resolve,reject){
            resolve(true);
        });
    },
    findById : function(index,table,criteria,callback,fail){
        return new Promise(function(resolve,reject){
            resolve(true);
        });
    },
    count : function(index, domain, criterias, callback, fail){
        return new Promise(function(resolve,reject){
            resolve(1);
        });
    }
};

global.app_config = require("../config/config");
global.app_config.dataProvider="TestData";
var mockData = {
    _id: "123456",
    found:true,
    _source : {
        name: "ABC"
    }
};
var mockDataList = {
    hits : {
        hits : [mockData]
    }
};
describe("Data provider", function() {
    describe("create", function() {
        it("instance", function() {
            assert(new Provider("default", "test"));
            assert(new Provider(null, "test"));
        });
    });

    describe("getInstance", function() {
        it("null", function() {
            Provider.path = "../test/data/";
            assert(new Provider("default", "test").getInstance());
        });
    });
    describe("prototype methods",function(){
        Provider.path = "../test/data/";
        it("getTimestamp",function(){
            assert(new Provider("default", "test").getTimestamp());
        });
        it("save ",function(){
            assert(new Provider("default", "test").save({}));
        });
        it("delete ",function(){
            assert(new Provider("default", "test").delete({}));
        });
        it("getTableReference ",function(){
            assert(new Provider("default", "test").getTableReference ());
        });
    });

    describe("static methods", function() {
        
        beforeEach(function(){
            sinon.stub(Cache,"query",CacheMock.query);
            sinon.stub(Cache,"findById",CacheMock.findById);
            sinon.stub(Cache,"count",CacheMock.count);
            sinon.stub(Cache,"getInstance",CacheMock.getInstance);
        });
        afterEach(function(){
            Cache.query.restore();
            Cache.findById.restore();
            Cache.count.restore();
            Cache.getInstance.restore();
            global.app_config.database.inMemory=true;
        });
        it("hasCache", function() {
            Provider.config = Provider.config || {};
            Provider.config.cache = {enabled: true };
            expect(Provider.hasCache()).to.equals(true);
        });
        it("find",function(){
            Provider.config = Provider.config || {};
            Provider.config.cache = {enabled: true };
            assert(Provider.find("defaul","test",{}) instanceof Promise );
        });
        it("find memDB",function(){
            Provider.config = Provider.config || {};
            Provider.config.cache = {enabled: false, database: { inMemory:true } };
            assert(Provider.find("defaul","test",{}) instanceof Promise );
        });
        it("find memDB with callback",function(done){
            Provider.config = Provider.config || {};
            Provider.config.cache = {enabled: false, database: { inMemory:true } };
            Provider.find("defaul","test",{},function(data){
                assert(data);
                done();
            });
        });
        it("find database with callback",function(done){
            Provider.config = Provider.config || {};
            global.app_config.database.inMemory=false;
            Provider.config.cache = {enabled: false, database: { inMemory:false } };
            Provider.path = "../test/data/";
            Provider.config.dataProvider="TestData";
            Provider.find("defaul","test",{},function(data){
                assert(data);
                done();
            });
        });
        it("findById",function(){
            Provider.config = Provider.config || {};
            Provider.config.cache = {enabled: true };
            assert(Provider.findById("defaul","test",1) instanceof Promise );
        });
        it("findById memDB",function(){
            Provider.config = Provider.config || {};
            Provider.config.cache = {enabled: false, database: { inMemory:true } };
            assert(Provider.findById("defaul","test",1) instanceof Promise );
        });
        it("findById memDB with callback",function(done){
            Provider.config = Provider.config || {};
            Provider.config.cache = {enabled: false, database: { inMemory:true } };
            Provider.findById("defaul","test",1,function(data){
                assert(data);
                done();
            });
        });
        it("findById database with callback",function(done){
            Provider.config = Provider.config || {};
            global.app_config.database.inMemory=false;
            Provider.config.cache = {enabled: false, database: { inMemory:false } };
            Provider.path = "../test/data/";
            Provider.config.dataProvider="TestData";
            Provider.findById("defaul","test",1,function(data){
                assert(data);
                done();
            });
        });
        it("count",function(){
            Provider.config = Provider.config || {};
            Provider.config.cache = {enabled: true };
            assert(Provider.count("defaul","test",{}) instanceof Promise );
        });
        it("count memDB",function(){
            Provider.config = Provider.config || {};
            Provider.config.cache = {enabled: false, database: { inMemory:true } };
            assert(Provider.count("defaul","test",{}) instanceof Promise );
        });
        it("count memDB with callback",function(done){
            Provider.config = Provider.config || {};
            Provider.config.cache = {enabled: false, database: { inMemory:true } };
            Provider.count("defaul","test",{},function(data){
                assert(data);
                done();
            });
        });
        it("count database with callback",function(done){
            Provider.config = Provider.config || {};
            global.app_config.database.inMemory=false;
            Provider.config.cache = {enabled: false, database: { inMemory:false } };
            Provider.path = "../test/data/";
            Provider.config.dataProvider="TestData";
            Provider.count("defaul","test",{},function(data){
                assert(data);
                done();
            });
        });
        
    });

});