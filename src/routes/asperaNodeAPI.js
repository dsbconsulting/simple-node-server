var fs = require('fs');
var uuid = require('node-uuid');
var async = require('async');
var http = require("http");
var request = require("request");

// http://nodejs.org/api.html#_child_processes
var sys = require('sys')
var exec = require('child_process').exec;

var errorMsg = { "status" : "error", "message" : "" };
var successMsg = { "status" : "success" , "message" : ""};

var ASPERA_ENDPOINT = "192.168.59.103";

module.exports = function(app) {
    app.get('/asperaNode/getToken', function (req, mainres) {
        var options = { method: 'POST',
              url: 'http://:9091/files/upload_setup',
              headers: 
               { authorization: 'Basic YXBpdXNlcjE6YmF0bWFu',
                 'content-type': 'application/json',
                 'accept-encoding': 'gzip, deflate',
                 accept: '*/*' },
              body: { transfer_requests: [ { transfer_request: { destination_root: '/' } } ] },
              json: true };

            request(options, function (error, response, body) {
              if (error) throw new Error(error);

              console.log(body);
              mainres.jsonp(body);
            });
    });



    app.put('/user', function (req, res) {
        //Return a list of aspera users
        var requestData = req.body;

        //-- https://support.asperasoft.com/entries/20918741
        
        //https://developer.asperasoft.com/Home/Web-APIs/Node/Node-v1/Node-Users

        if(!requestData)
            res.status(200).send('No Request Data');

        if(!requestData.username && requestData.password)
            res.status(200).send('No Username & Password');

        if(!requestData.homeDir)
            res.status(200).send('No Home Dir');

        var userHomeDirPath = requestData.homeDir + requestData.username;

        var cmd = "";
        async.waterfall([
            
            function (callback) {
                //Add system user
                cmd = 'useradd ' + requestData.username;
                runCommand(cmd, callback);
            },
            function (callback) {
                //Create Transfer User
                cmd = 'echo "' + requestData.username + ':x:501:501:...:/home/' + requestData.username + ':/bin/aspshell" >> /etc/passwd';
                runCommand(cmd, callback);
            },
            function (callback) {
                //Update user's password
                cmd = 'echo "' + requestData.username + ':' + requestData.password + '" | chpasswd';
                runCommand(cmd, callback);
            },
            function (callback) {
                //Add user to aspera conf
                cmd = 'mkdir -p ' + userHomeDirPath;
                runCommand(cmd, callback);
            },
            function (callback) {
                //Add user to aspera conf
                cmd = 'chmod 777 ' + userHomeDirPath;
                runCommand(cmd, callback);
            },
            function (callback) {
                //Add user to aspera conf
                cmd = 'asconfigurator -x "set_user_data;user_name,' + requestData.username + ';absolute,' + userHomeDirPath + '"';
                runCommand(cmd, callback);
            }

        ], 
        function (result, err) {
            if (result){
                successMsg.message = result;
                res.status(200).send(successMsg);
            }
            else{
                errorMsg.message = err;
                res.status(200).send(errorMsg);
            }
        })
    });

    app.delete('/user', function (req, res) {
        //Return a list of aspera users
        
    });


    function runCommand(cmd, callback){
        console.log(cmd);
        child = exec(cmd, function (error, stdout, stderr) {
            console.log('stdout: ' + stdout);
            console.log('stderr: ' + stderr);

            if (error !== null) {
                console.log('exec error: ' + stderr);
                callback(new Error("failed getting something:" + stderr));
            }
            else{
                callback(stdout);
            }

        });
    }
}