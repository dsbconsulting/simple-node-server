var CONNECT_INSTALLER =  "//d3gcli72yxqn2z.cloudfront.net/connect/v4";
 
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
 
/**
 * This sample demonstrates how to authenticate a user against an Aspera transfer server.
 */
var applicationID = "aspera_web_transfers";
 
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
    $("#auth_button").click(function(e) {
      authControls.requestAuhentication();
      e.preventDefault();
    });
    $('#intro_text').show();
};
 
authControls = {};
 
authControls.requestAuhentication = function () {
  var host = ($("input#host").val() || "192.168.59.103");
  var user = ($("input#user").val() ||"txuser1");
  var passwd = ($("input#passwd").val() || "batman");
 
  var authSpec = {
   "remote_host":host,
   "remote_user": user,
   "remote_password":passwd
  };
 
  /**
   Error format
    {
      "error": {
          "code": 406,
          "internal_message": "Not Acceptable",
          "user_message": "Authentication failure: /opt/Aspera/AsperaConnect/bin/ascp: failed to open ssh session., exiting.\r\n\r\r\nSession Stop  (Error: failed to open ssh session.)"
      }
    }
 
    In the case of success, an empty JSON object {} is returned.
 
  */
  asperaWeb.authenticate(authSpec,
            callbacks = {
              error : function(obj) {
                $("#authcontainer #authenticationresult").text("Authentication failed: " + JSON.stringify(obj, null, 4));
              },
              success : function(obj) {
                $("#authcontainer #authenticationresult").text("Authentication successful. ");
              }
            }
  );
  $("#authcontainer").css('display', 'block');
  $("#authcontainer #authenticationresult").text("Authentication is requested, please wait ...");
  $("#auth_spec").text(JSON.stringify(authSpec, null, 4));
};