var mocha = require("mocha");
var sinon = require("sinon");
var assert = require("chai").assert;
var expect = require("chai").expect;
var controller = require("../api/_controller");
global.app_config = require("../config/config");

var app = {
    post: function(url, method) { console.log(url); },
    get: function(url, method) { console.log(url); },
    delete: function(url, method) { console.log(url); },
    put: function(url, method) { console.log(url);}
};
var controllerFake = {
    "get": {
        "/":function(req,res){}
    },
    "post": {
        "/post":function(req,res){}
    },
    "put": {
        "/put":function(req,res){}
    },
    "delete": {
        "/delete":function(req,res){}
    }
};
var controllerFakeAuth = {
    "get": {
        "/":[true,function(req,res){}]
    },
    "post": {
        "/post":[true,function(req,res){}]
    },
    "put": {
        "/put":[true,function(req,res){}]
    },
    "delete": {
        "/delete":[function(req,res){}]
    }
};
var controllerFakeAuthObj = {
    "get": {
        "/":{authenticate:true,action:function(req,res){}}
    },
    "post": {
        "/post":{authenticate:true,action:function(req,res){}}
    },
    "put": {
        "/put":{authenticate:true,action:function(req,res){}}
    },
    "delete": {
        "/delete":{authenticate:true,action:function(req,res){}}
    }
};
describe("Unit test to controller helper", function() {
    beforeEach(function() {

    });
    describe("Test load method", function() {
        it("any verb", function() {
            controller.load("controller", {}, app);
        });
        it("with verbs", function() {
            controller.load("controller",controllerFake,app);
        });
        it("with verbs authentication", function() {
            controller.load("controller",controllerFakeAuth,app);
        });
        it("with verbs authentication as boject", function() {
            controller.load("controller",controllerFakeAuthObj,app);
        });
        
    });
    
    describe("Test register",function(){
       it("register Login",function(){
           expect(function(){ 
               controller.registerLogin(app);
            }).to.not.throw(Error);
       });
       it("register auth ",function(){
           expect(function(){ 
               controller.registerAuthController(app);
            }).to.not.throw(Error);
       });
    });
    
});