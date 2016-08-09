var mocha = require("mocha");
var sinon = require("sinon");
var assert = require("chai").assert;
var expect = require("chai").expect;
var Cache = require("../api/_cache");
var CacheError = require("../api/_cache");
var elasticsearch = require('elasticsearch');
var elasticsearch_error = require('elasticsearch');
var miscellaneous = require("../utils/Miscellaneous");
global.app_config = require("../config/config");

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
var mockElasticsearch = {
    index: function(options,success){
        success.call(this,null,{});
    },
    delete : function(options,success){
        success.call(this,null,{});
    },
    get : function(){
        return new Promise(function(resolve,reject){
            resolve(mockData);
        });
    },
    search : function(options){
        return new Promise(function(resolve,reject){
            resolve(mockDataList);
        });
    },
    count : function(options,callback){
        if(callback){
            callback.call(this,null,mockDataList.hits.hits.length);
            return;
        }else{
            return new Promise(function(resolve,reject){
                resolve(mockDataList.hits.hits.length);
            });
        }
    }
};
var mockElasticsearchError =  {
    index: function(options,success){
        success.call(this,true,{});
    },
    delete : function(options,success){
        success.call(this,true,{});
    },
    get : function(){
        return new Promise(function(resolve,reject){
            resolve(mockData);
        });
    },
    search : function(options){
        return new Promise(function(resolve,reject){
            resolve(mockDataList);
        });
    },
    count : function(options,callback){
        if(callback){
            callback.call(this,null,mockDataList.hits.hits.length);
            return;
        }else{
            return new Promise(function(resolve,reject){
                resolve(mockDataList.hits.hits.length);
            });
        }
    }
};
var snapshotMock = {
    val : function(){
        return {};
    },
    key : function(){
        return "123456";
    }
};
describe("Unit test to Cache (elasticsearch)", function() {
    console.log("Starting test cache");
    
    beforeEach(function(){
        sinon.stub(elasticsearch, "Client", function() {
            return mockElasticsearch;
        });
        sinon.stub(Cache, "getInstance", function() {
            return mockElasticsearch;
        });
        Cache.instance = null;
    });
    
    afterEach(function(){
        elasticsearch.Client.restore();
        Cache.getInstance.restore();
    });
    
    describe("test Get Instance", function() {
        // beforeEach(function(){
        //     sinon.stub(Cache, "getInstance", function() {
        //         return mockElasticsearch;
        //     });
        // });
        it("create new Instance", function() {
            assert(Cache.getInstance() !=null);
        });
    });
    describe("test Save object", function() {
        it("save new object", function() {
            Cache.save("index", "domain", snapshotMock);
        });
        it("error",function(done){
            Cache.getInstance.restore();
            sinon.stub(Cache, "getInstance", function() {
                return mockElasticsearchError;
            });
            Cache.save("index", "domain", snapshotMock).then(function(){
                expect.fail();
            }).catch(function(){
                done();
            });
        });

    });
    describe("test Delete object", function() {
        it("delete object", function() {
            Cache.delete("index", "domain", snapshotMock);
        });
        it("error",function(done){
            Cache.getInstance.restore();
            sinon.stub(Cache, "getInstance", function() {
                return mockElasticsearchError;
            });
            Cache.delete("index", "domain", snapshotMock).then(function(){
                expect.fail();
            }).catch(function(){
                done();
            });
        });
    });
    describe("test findById",function(){
        it("with callback",function(done){
           Cache.findById("index","domain","123456",function(data){
               try{
                   expect(data.first()).equals(miscellaneous.formatResponseCacheOne(mockData).first());
                   done();
               }catch(e){
                   console.log(e);
                   expect.fail();
               }
           },done);
        });
        it("with promise",function(done){
            Cache.findById("index","domain","123456").then(function(data){
               try{
                   expect(data.first()).equals(miscellaneous.formatResponseCacheOne(mockData).first());
                   done();
               }catch(e){
                   console.log(e);
                   expect.fail();
               }
           }).catch(expect.fail);
        });
    });
    describe("test query",function(){
        it("with callback",function(done){
            Cache.query("index","domain",{},function(data){
               try{
                   expect(data.size()).equals(miscellaneous.formatResponseCacheList(mockDataList).size());
                   done();
               }catch(e){
                   console.log(e);
                   expect.fail();
               }
           },expect.fail);
        });
        it("with promise",function(done){
            Cache.query("index","domain",{}).then(function(data){
               try{
                   expect(data.size()).equals(miscellaneous.formatResponseCacheList(mockDataList).size());
                   done();
               }catch(e){
                   console.log(e);
                   expect.fail();
               }
           }).catch(expect.fail);
        });
    });
});