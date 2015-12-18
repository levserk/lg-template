var CHECK_USERNAME_GATEWAY = "/gw/checkUsername.php";
var REG_GATEWAY = "/gw/registerNewUser.php";
var LOGIN_GATEWAY = "/gw/login.php";
var RES_GATEWAY = "/gw/restorePass.php";
var CNP_GATEWAY = "/gw/changePass.php";

function LoginRegisterManager(_isFreshUser, _ui, _gc, _options) {
    var that = this;

    var isFreshUser;

    var ui, gc, cs;

    var options = {
        showWelcomePanel : false
    };

    var regUsernameValidationFlag = null;
    var regPasswdValidationFlag = null;

    var i18n = new I18n();
    i18n.setContext('loginRegister');

    this.cleanUp = function () {
        $("#loginResult").empty();

        $("#usernameAlert").empty();
        $("#passwdAlert").empty();

        $("#regUsername").val("");
        $("#regPasswd").val("");
        $("#regPasswdVerification").val("");
    }

    this.showRegMePanel = function () {

        $("#lrRegisterSection").show();
        $("#lrLoginSection").hide();
        $("#lrGuestSection").hide();
        $("#restorePassPanel").hide();
        $(".constantWidthTd").removeClass("rowWon");
        $("#wpReg").addClass("rowWon");

        $("#regUsername").focus();
    }

    this.showLoginBubblePanel = function () {

        $("#lrRegisterSection").hide();
        $("#lrGuestSection").hide();
        $("#restorePassPanel").hide();
        $("#lrLoginSection").show();
        $(".constantWidthTd").removeClass("rowWon");
        $("#wpLogin").addClass("rowWon");
        $("#loginUsername").focus();
    }

    this.showGuestAttentionPanel = function () {

        $("#lrRegisterSection").hide();
        $("#lrLoginSection").hide();
        $("#restorePassPanel").hide();
        $("#lrGuestSection").show();
        $(".constantWidthTd").removeClass("rowWon");
        $("#wpClose").addClass("rowWon");
        $("#loginUsername").focus();
    }

    this.doLogin = function () {
        var username = $("#loginUsername").val();
        var passwd = $("#loginPasswd").val();

        gc.getClientServer().sendRequest(LOGIN_GATEWAY, {
            username : username,
            passwd : passwd
        }, function (result, data) {
//            alert(username + " = " + passwd + " *** " + result + " = " + data);
            if (result) {
                gc.getClientServer().setUser(data.userId, data.username, false);
                gc.setAboutToLogin(true);
                $("#loginForm").trigger("submit");
            } else {
                that.showNoLoginPasswdMatch();
            }
        });
    }

    this.showNoLoginPasswdMatch = function () {
        $("#loginResult").empty().append("<div class='lrRedAlert'>" + i18n.get("loginPasswdNoMatchNotice") + "</div>");
        setTimeout(function () {
            $("#loginResult").empty();
        }, 2000);
    }

    this.switchToRegister = function () {
        $("#usernameAlert").empty();
        $("#passwdAlert").empty();

        $("#regUsername").val("");
        $("#regPasswd").val("");
        $("#regPasswdVerification").val("");
        $("#regUsername").focus();

        that.showRegMePanel();
    }

    this.switchToLogin = function () {
        that.showLoginBubblePanel();
    }

    this.regValidateUsername = function () {
        var username = $("#regUsername").val();
        if (username.length > 0 && username.length < 3) {
            that.setRegUsernameAlert(i18n.get("minUsernameLengthNotice"), false);
        } else if (username.length > 25) {
            that.setRegUsernameAlert(i18n.get("maxUsernameLengthNotice"), false);
        } else {
            that.regHotVerifyUsername();
        }
    }

    this.regValidatePasswd = function () {
        var passwd = $("#regPasswd").val();
        var passwdVerification = $("#regPasswdVerification").val();
        if (passwd.length > 0 && passwd.length < 5) {
            that.setRegPasswdAlert(i18n.get("minPasswdLengthNotice"), false);
        } else if (passwd.length > 25) {
            that.setRegPasswdAlert(i18n.get("maxPasswdLengthNotice"), false);
        } else if (passwdVerification != "") {
            if (passwd != passwdVerification) {
                that.setRegPasswdAlert(i18n.get("passwdsDontMatchNotice"), false);
            } else {
                that.setRegPasswdAlert(i18n.get("passwdsDoMatchNotice"), true);
            }
        } else {
            that.setRegPasswdAlert("");
        }
    }

    this.setRegPasswdAlert = function (msg, isPositive) {
        if (msg != "") {
            var color = isPositive ? "lrGreenAlert" : "lrRedAlert";
            $("#passwdAlert").empty().append("<div class='" + color + "'>" + msg + "</div>");
            regPasswdValidationFlag = isPositive;
        } else {
            $("#passwdAlert").empty();
            regPasswdValidationFlag = false;
        }
    }

    this.regHotVerifyUsername = function () {
        var username = $("#regUsername").val();
        if (username.length >= 3 && username.length <= 25) {
            gc.getClientServer().sendRequest(CHECK_USERNAME_GATEWAY, {
                username : username
            }, function (result, data) {
                if (result) {
                    if (!data.isAvailable) {
                        that.setRegUsernameAlert(i18n.get("usernameTakenNotice"), false);
                    } else {
                        that.setRegUsernameAlert(i18n.get("usernameAvailableNotice"), true);
                    }
                }
            });
        }
    }

    this.setRegUsernameAlert = function (msg, isPositive) {
        var color = isPositive ? "lrGreenAlert" : "lrRedAlert";
        $("#usernameAlert").empty().append("<div id='usernameAlertInt' style='position: relative;' class='" + color + "'>" + msg + "</div>");
        regUsernameValidationFlag = isPositive;
    }

    this.doRegister = function () {
        var cs = gc.getClientServer();

        var username = $.trim($("#regUsername").val());
        var passwd = $("#regPasswd").val();

//        if (regUsernameValidationFlag == null) {
        that.regValidateUsername();
//        }

//        if (regPasswdValidationFlag == null) {
        that.regValidatePasswd();
//        }

        if (username == "") {
            that.setRegUsernameAlert(i18n.get("usernameRequiredNotice"), false);
        }

        if (passwd == "") {
            that.setRegPasswdAlert(i18n.get("passwdRequiredNotice"), false);
        }

        if (regUsernameValidationFlag && regPasswdValidationFlag) {
            cs.sendRequest(REG_GATEWAY, {
                username : username,
                passwd : passwd
            }, function (result, data) {
                if (result) {
                    cs.setUser(data.userId, data.username, false);
                    if (gc.reloadPage) {
                        gc.reloadPage();
                    } else {
                        ui.onRegistration();
                    }
                } else {
                    $("#regResult").show();
                    $("#regResult").empty().append("<div class='lrRedAlert'>"
                        + i18n.get("usernameTakenNotice")
                        + "</div>");
                    $("#regResult").delay(2000).fadeOut("fast");
                }
            });
        }
    }

    this.doRestorePass = function(){
        var cs = gc.getClientServer();
        var login = $.trim($('#rpUsername').val());
        var mail = $.trim($('#rpMail').val());
        if (!login || !mail){
//            alert("нет пользователя с таким логином и паролем");
            $('#rpResult').show();
            $('#rpResult').empty().append("<div class='lrRedAlert'>Введённая пара имя пользователя/электронная почта не найдена.</div>");
            $("#rpResult").delay(2000).fadeOut("fast");
            return;
        }
        else {
            cs.sendRequest(RES_GATEWAY, {
                username:login,
                mail:mail
            },function(result, data){
                if (!result){}
                if (data.result == "ok"){
                    alert("Новый пароль отправлен на указанный адрес электронной почты.");
                    that.showLoginBubblePanel();
                } else {
                    $('#rpResult').show();
                    $('#rpResult').empty().append("<div class='lrRedAlert'>Введённая пара имя пользователя/электронная почта не найдена.</div>");
                    $("#rpResult").delay(2000).fadeOut("fast");
                }
            });
        }
    }

    this.bindLoginRegisterButton = function () {
        $("#bbLoginRegister").bind("click", function () {
            if (!$("#welcomePanel").is(":visible")) {
                that.showWelcomePanel();
            } else {
                ui.hidePanel("welcomePanel");
            }
        });
    }

    this.bindAll = function () {
        this.bindLoginRegisterButton();

        $("#loginCommit").click(function () {
            that.doLogin();
        });

        $("#loginCancel").click(function () {
            ui.hidePanel("loginRegisterPanel");
        });

        $("#loginForm").bind("keypress", function (e) {
            var key = e.which ? e.which : e.keyCode;

            if (key == KEY_ENTER) {
                that.doLogin();
            }
        });

        $("#regForm").bind("keypress", function (e) {
            var key = e.which ? e.which : e.keyCode;

            if (key == KEY_ENTER) {
                that.doRegister();
            }
        });

        $("#switchToRegister").click(function () {
            that.switchToRegister();
        });

        $("#regUsername").keyup(function () {
            that.regHotVerifyUsername();
        });

        $("#regUsername").blur(function () {
            that.regValidateUsername();
        });

        $("#regPasswdVerification").blur(function () {
            that.regValidatePasswd();
        });

        $("#regPasswd").blur(function () {
            that.regValidatePasswd();
        });

        $("#regForm").submit(function () {
            that.doRegister();
            return false;
        });

        $("#regMeBtn").click(function () {
            that.doRegister();
        });

        $('#rpCommit').click(function () {
            that.doRestorePass();
        });

        $('#restorePass').click(function(){
           $("#restorePassPanel").show();
           $("#lrLoginSection").hide();
           $("#lrGuestSection").hide();
           $("#lrRegisterSection").hide();
        });

        $('#rpCancel').click(function(){
            that.showLoginBubblePanel();
        });

        $("#switchToLogin").click(function () {
            that.switchToLogin();
        });

        $("#wpReg").click(function () {
            that.showRegMePanel();
        });

        $("#wpLogin").click(function () {
            that.showLoginBubblePanel();
        });

        $("#wpClose").click(function () {
            that.showGuestAttentionPanel();
        })

        $("#wpVK").click(function () {
            vkAuthOpenAPI();
        })

        $("#guestContinue").click(function(){
            ui.hidePanel("welcomePanel");
        })

        $("#closeRegMePanel, #lrCloseIcon").click(function () {
            ui.hidePanel("loginRegisterPanel");
        });

        $("#loginForm").submit(function () {
            var cs = gc.getClientServer();
            if (cs.isGuest()) {
//                that.doLogin();
                return false;
            } else {
//                returnBackToGame();
//
//                var gameHistory = encodeHistory();
//
//                updateAttemptsState();
//
//                var currentAttempt = g.getCurrentAttempt();

                $("#hfSessionId").val(cs.getSessionId());
                $("#hfUserId").val(cs.getUserId());

//                $.cookie("gameState", null);

                return true;
            }
        });
    }

    this.showWelcomePanel = function () {
        var cs = gc.getClientServer();
        if (cs.isGuest()) {
            $("#guestName").empty().append(i18n.transliterate(cs.getUsername()));
            ui.showPanel({
                id : "welcomePanel",
                type : OVER_FIELD_PANEL
            });
            $("#lrLoginSection").hide();
            $("#lrRegisterSection").hide();
            $("#lrGuestSection").hide();
            $("#restorePassPanel").hide();
            $(".constantWidthTd").removeClass("rowWon");
        }
    }

    isFreshUser = _isFreshUser;
    ui = _ui;
    gc = _gc;

    if (isDef(_options) && _options != null) {
        options = _options;
    }

    this.bindAll();

    if (isDef(options.showWelcomePanel) && options.showWelcomePanel) {
        this.showWelcomePanel();
    }
}