var fs = require('fs');
var uuid = require('node-uuid');

module.exports = function(app) {
    app.get('/pause/:milliseconds', function (req, res) {
        var milliseconds = req.params.milliseconds;

        console.log("Pause Started.");
        setTimeout(function() {
            res.status(200).send('Pause Complete');

        }, milliseconds);
    });

    app.put('/autoUpload', function (req, res) {
        var requestData = req.body;

        //Read testContent Dir and rename files for originality
        var dir = '/mcmTestContent';
        fs.readdir(dir, function(err, list) {
            if (err) return done(err);
            var pending = list.length;
            if (!pending) return done(null, results);
            list.forEach(function(file) {
                var orgFilepath = dir + '/' + file;

                if(file.indexOf('muxed_') != -1 && requestData.file.muxed){
                    var newFilepath = dir + '/' + requestData.file.muxed;
                    fs.rename(orgFilepath, newFilepath, function (err) {
                        if (err) throw err;
                    });
                    requestData.file.muxed = newFilepath;
                }
                if(file.indexOf('audio_') != -1 && requestData.file.audio){
                    var newFilepath = dir + '/' + requestData.file.audio;
                    fs.rename(orgFilepath, newFilepath, function (err) {
                        if (err) throw err;
                    });
                    requestData.file.audio = newFilepath;
                }
                if(file.indexOf('boxArt_') != -1 && requestData.file.boxArt){
                    var newFilepath = dir + '/' + requestData.file.boxArt;
                    fs.rename(orgFilepath, newFilepath, function (err) {
                        if (err) throw err;
                    });
                    requestData.file.boxArt = newFilepath;
                }
                if(file.indexOf('cover_') != -1 && requestData.file.cover){
                    var newFilepath = dir + '/' + requestData.file.cover;
                    fs.rename(orgFilepath, newFilepath, function (err) {
                        if (err) throw err;
                    });
                    requestData.file.cover = newFilepath;
                }
                if(file.indexOf('ancillary_') != -1 && requestData.file.ancillary){
                    var newFilepath = dir + '/' + requestData.file.ancillary;
                    fs.rename(orgFilepath, newFilepath, function (err) {
                        if (err) throw err;
                    });
                    requestData.file.ancillary = newFilepath;
                }

                if(file.indexOf(requestData.file.unique.name) != -1){
                    var newFilepath = dir + '/';
                    var random = randomIntInc(1, 1000);
                    if(requestData.file.unique.uuid)
                        newFilepath += requestData.file.unique.name + "_" + uuid.v4() + '.' + requestData.file.unique.ext;
                    else
                        newFilepath += requestData.file.unique.name + "_" + random + '.' + requestData.file.unique.ext;

                    fs.rename(orgFilepath, newFilepath, function (err) {
                        if (err) throw err;
                    });
                    requestData.file.single = newFilepath;
                }

                if(file == requestData.file.single){
                    var newFilepath = dir + '/' + requestData.file.single;
                    requestData.file.single = newFilepath;
                }
            });
        });

        setTimeout(function() {
            console.log(requestData);
            var destinationDir = requestData.provider.systemName+"/"+ uuid.v4() +"/";

            if(requestData.file.single !== undefined){
                transferFile(requestData, requestData.file.single, destinationDir);
            }
            else{
                transferFile(requestData, requestData.file.ancillary, destinationDir);
                transferFile(requestData, requestData.file.cover, destinationDir);
                transferFile(requestData, requestData.file.boxArt, destinationDir);
                transferFile(requestData, requestData.file.muxed, destinationDir);
                transferFile(requestData, requestData.file.audio, destinationDir);
            }

            res.status(200).send('Auto upload event sent');

        }, 1000);

    });

    function randomIntInc (low, high) {
        return Math.floor(Math.random() * (high - low + 1) + low);
    }

    function transferFile(requestData, file, destinationDir){

        var asperaUser = "mcm-auto-test-"+requestData.asperaInfo.env;
        var asperaPass = "mcmautotest"+requestData.asperaInfo.env+"123";
        var asperaEndpoint = requestData.asperaInfo.endpoint;
        var cookie = requestData.asperaInfo.cookie;
        var speed = 500;
        if(requestData.speed)
            speed = requestData.speed;

        //var ascpLocation = '"/Users/simran/Applications/Aspera Connect.app/Contents/Resources/ascp"';
        var ascpLocation = '"/home/ubuntu/.aspera/connect/bin/ascp"';
        var transferRate = "-TQ -l "+speed+"m -m 1m -d";

        var asperaCommand = "ASPERA_SCP_COOKIE="+cookie+" ASPERA_SCP_PASS="+asperaPass+" "+ascpLocation+" "+transferRate+" "+file+" "+asperaUser+"@"+asperaEndpoint+":"+destinationDir;
        console.log(asperaCommand);
        child = exec(asperaCommand, function (error, stdout, stderr) {
            console.log('stdout: ' + stdout);
            console.log('stderr: ' + stderr);
            if (error !== null) {
                console.log('exec error: ' + error);
            }
        });
    }


    function transferFileLocal(file, destinationDir){
        //host: 169.53.155.198 , user: aspera-p2p-test, password: secret, ssh port: 33001

        //--  ASPERA_SCP_PASS=secret ascp -l 300m -d --mode send --user aspera-p2p-test --host tx.asperademo.com -O 33001 -P 33001 /mcmTestContent/smalltest.jpg /
        //--  ASPERA_SCP_PASS=secret /Users/simran/Applications/Aspera\ Connect.app/Contents/Resources/ascp -l 300m -d --mode send --user aspera-p2p-test --host tx.asperademo.com -O 33001 -P 33001 /mcmTestContent/smalltest.jpg /
        //--  ASPERA_SCP_PASS=secret /Users/simran/Dev/bebop/client/aspera -l 300m -d --mode send --user aspera-p2p-test --host tx.asperademo.com -O 33001 -P 33001 /mcmTestContent/smalltest.jpg /

        //ascp -DD -A --host tx.asperademo.com

        var asperaUser = "aspera-p2p-test";
        var asperaPass = "secret";
        var asperaEndpoint = "169.53.155.198"
        var cookie = "SimransMacbookPro"
        var speed = 500;
        var faspPort = 31331;
        var sshPort = 31331;

        var ascpLocation = '"/Users/simran/Applications/Aspera Connect.app/Contents/Resources/ascp"';
        //var ascpLocation = '"/home/ubuntu/.aspera/connect/bin/ascp"';
        var transferRate = "-TQ -l "+speed+"m -m 1m -d";

        //var asperaCommand = "ASPERA_SCP_COOKIE="+cookie+" ASPERA_SCP_PASS="+asperaPass+" "+ascpLocation+" "+transferRate+" -P "+faspPort+" -O "+sshPort+" "+file+" "+asperaUser+"@"+asperaEndpoint+":"+destinationDir;

        var asperaCommand = ascpLocation+" -l 300m -d --mode send --user aspera-p2p-test --host 169.53.155.198 -O 33001 -P 33001 "+file+" /";
        //var asperaCommand = ascpLocation+" scp -l 300m -d --mode send --user aspera-p2p-test -pass secret --host 169.53.155.198 test1 /";

        console.log(asperaCommand);
        var child = exec(asperaCommand, function (error, stdout, stderr) {
            console.log('stdout: ' + stdout);
            console.log('stderr: ' + stderr);
            if (error !== null) {
                console.log('exec error: ' + error);
            }
        });
    }
}