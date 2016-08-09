var bucket = process.env.STORAGE;
var config = global.app_config;
var fs = require("fs");
var _ = require("lodash");

var AWS = require('aws-sdk');

AWS.config.update({
    accessKeyId: config.aws.apikey,
    secretAccessKey: config.aws.secret
});


module.exports = function() {
    var self = this;
    self.upload = function(object) {
        return new Promise(function(resolve, reject) {
            try {
                var s3 = new AWS.S3();
                _.each(object, function(o) {
                    fs.readFile(o.path, function(err, data) {
                        if(err){
                            reject(err);
                        }
                        var params = {
                            Bucket: bucket,
                            Key: config.aws.apikey,
                            Body: data,
                            Metadata: {name:o.name, type:o.type}
                        };
                        s3.putObject(params, function(err, data) {
                            if (err) {
                                reject(err);
                            }
                            else {
                                resolve(data);
                            }

                        });
                    });
                });

            }
            catch (e) {
                reject(e);
            }
        });
    };
    self.get = function(id){
        return new Promise(function(resolve, reject){
            var s3 = new AWS.S3();
            var params = {
                Bucket: bucket,
                Key: config.aws.apikey
            };
            s3.getObject(params, function(err, data) {
                if (err) {
                    reject(err);
                }
                else {
                    resolve(data);
                }

            });
            
        });
        
    };
    self.remove = function(id) {
        return new Promise(function(resolve, reject){
            var s3 = new AWS.S3();
            var params = {
                Bucket: bucket,
                Key: config.aws.apikey
            };
            s3.deleteObject(params, function(err, data) {
                if (err) {
                    reject(err);
                }
                else {
                    resolve(data);
                }

            });
            
        });
    };
};