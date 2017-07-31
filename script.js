var xmlHTTPRequest;
var pubkey;

function createXMLHttpRequestObject() {

    if (window.XMLHttpRequest) {
        xmlHTTPRequest = new XMLHttpRequest();
    } else {
        xmlHTTPRequest = new ActiveXObject("Microsoft.XMLHTTP");
    }
    return xmlHTTPRequest;
}

/*****
function will get all the values that user has entered from the HTML page and will form a 
json object that will be posted to the BETHERE API that is exposed
*/

document.addEventListener("DOMContentLoaded", function () {
    var rs = document.getElementById("resDiv");
    chrome.storage.sync.get("apikey", function (data) {
        if (data.apikey) {
            pubkey = data.apikey;
            document.getElementById("bethereurl").style.display = "block";
            document.getElementById("reglogin").style.display = "none";
            document.getElementById("footer").style.display = "none";
        } else {
            document.getElementById("regFormDiv").style.display = "block";
        }
    });
    document.getElementById("registerButton").addEventListener("click", function () {
        document.getElementById("resDiv").innerHTML = "";
        if (isRegFormValid()) {
            document.getElementById("resDiv").innerHTML = "";
            registerUser();
        } else {
            document.getElementById("resDiv").innerHTML = "Please fill the form properly.";
        }

    });

    document.getElementById("urlbutton").addEventListener("click", function () {
        saveThisUrl();
    });

    document.getElementById("reglink").addEventListener("click", function () {
        enableRegisterLink();
    });

    document.getElementById("loginlink").addEventListener("click", function () {
        enableLoginLink();
    });

    document.getElementById("loginButton").addEventListener("click", function () {
        console.log("Login button clicked");
        if (isLoginFormValid()) {
            document.getElementById("loginErr").innerHTML = "";
            loginUser();
        } else {
            document.getElementById("loginErr").innerHTML = "Plase enter correct values.";
        }
    });
});
var _e;
var _p;

function isLoginFormValid() {
    _e = document.getElementById("lemailid").value;
    _p = document.getElementById("lpassword").value;

    var eg = false;
    var emailPattern = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    if (emailPattern.test(_e)) {
        eg = true;
        console.log("email is correct");
    }

    if (_p.length != 0 && eg) {
        return true;
    } else {
        return false;
    }
}

function isRegFormValid() {
    var n = document.getElementById("name").value;
    var e = document.getElementById("emailid").value;
    var p = document.getElementById("password").value;
    var r1 = document.getElementById("repassword").value;

    var eg = false;
    var emailPattern = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    if (emailPattern.test(e)) {
        eg = true;
        console.log("email is correct");
    }
    console.log((n.length < 3) + "  " + (!eg) + "  " + (p != r1));
    if (n.length < 3 || !eg || (p != r1)) {
        console.log("returnigng false");
        return false;
    } else {
        console.log("returnigng true");
        return true;
    }
}


function registerUser() {
    console.log("Form sumited");
    var name = document.getElementById("name").value,
        emailid = document.getElementById("emailid").value,
        password = document.getElementById("password").value;


    //create a javascript object and store all the values

    var jsobj = {};
    jsobj["name"] = name;
    jsobj["emailId"] = emailid;
    jsobj["password"] = password;

    var json = JSON.stringify(jsobj);
    callRegisterAPI(json);

}
var httpReq = createXMLHttpRequestObject();

function callRegisterAPI(_j) {
    //make async XMLHTTPReq to the REST API and inform the user
    console.log("Inside the method callRegisterAPI to call the API with the values " + _j + "  " + typeof _j);
    if (httpReq) {
        httpReq.open("POST", "http://sample-env-2.fxds5jtjpp.ap-south-1.elasticbeanstalk.com/bethereapi/register", true);
        //httpReq.open("POST", "http://localhost:8080/bethere/bethereapi/register", true);
        httpReq.setRequestHeader("Content-type", "application/json");
        httpReq.onreadystatechange = procesAPIRes;
        httpReq.send(_j);
    } else {
        console.error("Unable to create the object");
    }
}

function procesAPIRes() {
    var rs = document.getElementById("resDiv");
    if (httpReq.readyState == 4) {
        var res = httpReq.responseText;
        var jsObj = JSON.parse(res);
        if (httpReq.status == 200) {
            // all OK, success response can be sent to the user
            console.log(jsObj);
            /*var s = document.createElement("span");
            s.setAttribute("class", "success");*/
            rs.innerHTML = "You have been registered, successfully.";
            //rw.appendChild(s);
            /*****
            The user has been registered successfully, save the cookie so that when the user hits the 
            BE THERE button we can get the APIKEY and store the URL in to the database
            */
            var obj = {
                "url": "http://vibhi.in",
                "name": "apikey",
                "value": jsObj.key
            };

            chrome.storage.sync.set({
                "apikey": jsObj.key
            }, function () {
                // Notify that we saved.
                //console.log('key has been saved');
            });

            window.setTimeout(closeWindow, 3000);

        } else {
            //get the error code and display the messsage acc
            var err = jsObj.errorCode;
            if (err == "BException-1003") {
                console.log("Username already exists");
                rs.innerHTML = "Oops, username already exists.";
            } else {
                console.log("Internal error");
                rs.innerHTML = "Something went wrong while regsitering you.";
            }
        }
    }
}

var xlogin = createXMLHttpRequestObject();

function loginUser() {
    if (xlogin) {
        xlogin.open("GET", "http://sample-env-2.fxds5jtjpp.ap-south-1.elasticbeanstalk.com/bethereapi/login?u=" + _e + "&p=" + _p, true);
        xlogin.onreadystatechange = processLoginRes;
        xlogin.send(null);
    } else {
        console.log("error while create XHR for login user");
    }
}

function processLoginRes() {
    console.log(xlogin.status + "  " + xlogin.readyState);
    console.log(xlogin.responseText);
    if (xlogin.status == 200 && xlogin.readyState == 4) {

        var jsO = JSON.parse(xlogin.responseText);

        chrome.storage.sync.set({
            "apikey": jsO.key
        }, function () {
            // Notify that we saved.
            console.log('key has been saved');
        });


        document.getElementById("loginErr").innerHTML = "Login Success.";
        //hide the login form and display the success message, close the extension then
        document.getElementById("loginFormDiv").innerHTML = "";
        document.getElementById("loginFormDiv").innerHTML = "<div class=\"successbox normfont bold\">You have been logged into the serivce successfully</div>";
        setTimeout(closeWindow, 3000);
        //window.close();
    } else {
        document.getElementById("loginErr").innerHTML = "Login failed.";
    }
}

function closeWindow() {
    window.close();
}
var xhr = createXMLHttpRequestObject();
var u;

function saveThisUrl() {
    chrome.tabs.query({
            'active': true,
            'windowId': chrome.windows.WINDOW_ID_CURRENT
        },
        function (tabs) {
            u = tabs[0].url;
            console.log("u is " + u);
            //document.getElementById("thisurl").innerHTML = tabs[0].url;


            var jsobj = {};
            jsobj["key"] = pubkey;
            jsobj["url"] = u;

            var _json = JSON.stringify(jsobj);


            //make an XMLHTTPReq and make the request to the rest api to get this URL stored 
            if (xhr) {
                console.log("Postng with the values " + _json);
                //xhr.open("POST", "http://localhost:8080/bethere/bethereapi/urls", true);
                xhr.open("POST", "http://sample-env-2.fxds5jtjpp.ap-south-1.elasticbeanstalk.com/bethereapi/urls", true);
                xhr.setRequestHeader("Content-type", "application/json");
                xhr.onreadystatechange = processSaveURLRes;
                xhr.send(_json);
            }

        }
    );

}


function processSaveURLRes() {
    if (xhr.readyState == 4) {
        var jsres = JSON.parse(xhr.responseText);
        if (xhr.status == 200) {
            document.getElementById("thisurl").innerHTML = "";
            document.getElementById("thisurl").innerHTML = "This URL has been saved successfully and can be accessed from your phone.";
        } else {
            var reserr = jsres.errorCode;
            document.getElementById("thisurl").innerHTML = "";
            document.getElementById("thisurl").innerHTML = reserr;
        }
    }
}


function enableRegisterLink() {
    document.getElementById("resDiv").innerHTML = "";
    if (document.getElementById("loginFormDiv")) {
        document.getElementById("loginFormDiv").style.display = "none";
    }
    document.getElementById("regFormDiv").style.display = "block";
}

function enableLoginLink() {
    document.getElementById("resDiv").innerHTML = "";
    if (document.getElementById("regFormDiv")) {
        document.getElementById("regFormDiv").style.display = "none";
    }
    document.getElementById("loginFormDiv").style.display = "block";
}
