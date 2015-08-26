var CONNECT_INSTALLER =  "//d3gcli72yxqn2z.cloudfront.net/connect/v4";
 
var TokenAuth = {};
TokenAuth.url = "http://.../asperaNode/getToken";
TokenAuth.timeout = 60000;

var ASPERA_CONF = {};
//ASPERA_CONF.remote_host = "192.168.59.103";
ASPERA_CONF.remote_host = "54.175.217.198"; //Docker toolkit local
ASPERA_CONF.remote_user = "joker";
ASPERA_CONF.remote_password = "haha";

//ASPERA_CONF.remote_host = "54.175.217.198";
/*
ASPERA_CONF.remote_host = "aspera-dev.rr.giantsource.net";
ASPERA_CONF.remote_user = "batman";
ASPERA_CONF.remote_password = "batman";
*/

var initAsperaConnect  = function () {
  /* This SDK location should be an absolute path, it is a bit tricky since the usage examples
   * and the install examples are both two levels down the SDK, that's why everything works
   */
  this.asperaWeb = new AW4.Connect({sdkLocation: CONNECT_INSTALLER, minVersion: "3.6.0"});
  var asperaInstaller = new AW4.ConnectInstaller({sdkLocation: CONNECT_INSTALLER});
  var statusEventListener = function (eventType, data) {
    if (eventType === AW4.Connect.EVENT.STATUS && data == AW4.Connect.STATUS.INITIALIZING) {
      asperaInstaller.showLaunching();
   } else if (eventType === AW4.Connect.EVENT.STATUS && data == AW4.Connect.STATUS.FAILED) {
     asperaInstaller.showDownload();
   } else if (eventType === AW4.Connect.EVENT.STATUS && data == AW4.Connect.STATUS.OUTDATED) {
     asperaInstaller.showUpdate();
   } else if (eventType === AW4.Connect.EVENT.STATUS && data == AW4.Connect.STATUS.RUNNING) {
     asperaInstaller.connected();
   }
  };
  asperaWeb.addEventListener(AW4.Connect.EVENT.STATUS, statusEventListener);
  asperaWeb.initSession();
  setup();
};
 
 
function toggle(showHideDiv, switchTextDiv, displayText) {
    var ele = document.getElementById(showHideDiv);
    var text = document.getElementById(switchTextDiv);
    if(ele.style.display == "block") {
            ele.style.display = "none";
        text.innerHTML = "Show " + displayText;
    }
    else {
        ele.style.display = "block";
        text.innerHTML = "Hide " + displayText;
    }
}
 
var setup = function () {
 
    var uploadButton;
    uploadButton = document.createElement('input');
    uploadButton.type = 'button';
    uploadButton.value = 'Upload Files';
    uploadButton.className = 'upload_button';
    uploadButton.setAttribute('onclick', 'asperaWeb.showSelectFileDialog({success:fileControls.uploadFiles})');
    document.getElementById('button_container').appendChild(uploadButton);
 
    this.asperaWeb.addEventListener('transfer', fileControls.handleTransferEvents);
};
 
fileControls = {};
 
fileControls.handleTransferEvents = function (event, obj) {
    switch (event) {
        case 'transfer':
            document.getElementById('progress_meter').innerHTML = JSON.stringify(obj, null, 4);
            break;
    }
};
 
fileControls.uploadFiles = function (pathArray) {
    transferSpec = {
        "paths": [],
        "remote_host": ASPERA_CONF.remote_host,
        "remote_user": ASPERA_CONF.remote_user,
        "remote_password": ASPERA_CONF.remote_password,
        "ssh_port": "33001",
        "direction": "send",
        "target_rate_kbps" : 5000,
        "resume" : "sparse_checksum",
        "destination_root": "/"
    };

    transferSpec.cookie = "unique-file-cookie";
 
    connectSettings = {
        "allow_dialogs": "yes"
    };
    var files = pathArray.dataTransfer.files;
    for (var i = 0, length = files.length; i < length; i +=1) {
        transferSpec.paths.push({"source":files[i].name});
    }
 
    if (transferSpec.paths.length === 0) {
      return;
    }
    document.getElementById('transfer_spec').innerHTML = JSON.stringify(transferSpec, null, "    ");

    //fileControls.getTokenBeforeTransfer(transferSpec, connectSettings, files[0].name, false);
    asperaWeb.startTransfer(transferSpec, connectSettings);
};


fileControls.getTokenBeforeTransfer = function(transferSpec, connectSettings, path, download) {
  var params = {};
  params.username = transferSpec.remote_user;
  params.path=path;
  var dir;
  if(download) {
    params.direction = "download";
    dir = "download";
  } else {
    params.direction = "upload";
    dir = "upload";
  }
  var jqxhr = $.ajax({
    type : "GET",
    contentType: 'application/json',
    cache : false,
    url : TokenAuth.url,
    data : params,
    dataType: "jsonp",
    timeout : TokenAuth.timeout,
    beforeSend : function() {
    },
    error : function(xhr, textStatus) {
      console.error("Got token ", data);
      consoleLog("ERR: Failed to generate token " + textStatus);
    },
    success : function(data, textStatus, jqXHR) {
      //var jsonValue = JSON.stringify(data);
      console.info("Got token ", data);
      console.info("Got token ", data.transfer_specs[0].transfer_spec.token);
      var token = data.transfer_specs[0].transfer_spec.token;
      var new_transfer_spec = data.transfer_specs[0].transfer_spec;
      if(token !== "") {

          //transferSpec.authentication = "token";
          //transferSpec.token = token;

          new_transfer_spec.paths = [];
          new_transfer_spec.paths.push({source: path});
          new_transfer_spec.authentication = "token";
          new_transfer_spec.remote_host = ASPERA_CONF.remote_host;

          console.log(new_transfer_spec);
        
        //fileControls.transfer(transferSpec, connectSettings, token);
        asperaWeb.startTransfer(new_transfer_spec, connectSettings);
      } else {
        consoleLog("Error while retrieving data. Failed to generate token " + textStatus);
      }
    },
    complete : function(jqXHR, texStatus) {
    }
  });
};