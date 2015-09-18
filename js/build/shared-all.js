/*! 2015-09-18 */
var KEY_ESC = 27;

var KEY_A = 65;
var KEY_B = 66;
var KEY_D = 68;
var KEY_T = 84;
var KEY_W = 87;
var KEY_X = 88;
var KEY_Y = 89;
var KEY_Z = 90;

var KEY_LEFT_ARROW = 37;
var KEY_UP_ARROW = 38;
var KEY_RIGHT_ARROW = 39;
var KEY_DOWN_ARROW = 40;

var KEY_F1 = 112;
var KEY_F2 = 113;
var KEY_F3 = 114;
var KEY_F8 = 119;
var KEY_F9 = 120;

var KEY_0 = 48;
var KEY_1 = 49;
var KEY_2 = 50;
var KEY_3 = 51;
var KEY_4 = 52;
var KEY_5 = 53;
var KEY_6 = 54;
var KEY_7 = 55;
var KEY_8 = 56;
var KEY_9 = 57;
function GameTimer() {
    var elapsed;
    var recentTimestamp;
    var isFrozen;

    this.setElapsed = function (_elapsed) {
        elapsed = _elapsed;
        isFrozen = true;
    }

    this.unfreeze = function () {
        this.updateElapsed(true);
        if (elapsed >= -1) {
            isFrozen = false;
        }
    }

    this.getTime = function () {
        var elapsed = this.updateElapsed(false);
        if (elapsed < -1) {
            return -elapsed;
        } else if (elapsed == -1) {
            return 0;
        } else {
            return elapsed;
        }
    }

    this.getElapsed = function () {
        return this.updateElapsed(false);
    }

    this.updateElapsed = function (flushElapsed) {
        if (!isFrozen) {
            var nowTS = now();
            if (nowTS < recentTimestamp) {
                recentTimestamp = nowTS;
            }
            var delta = nowTS - recentTimestamp;
            if (delta >= GameTimer.FREEZE_AFTER_SEC * 1000) {
                delta = GameTimer.FREEZE_AFTER_SEC * 1000;
                isFrozen = true;
            }
            if (elapsed >= -1 && flushElapsed || isFrozen) {
                elapsed += delta + (elapsed == -1 ? 1 : 0);
                recentTimestamp = now();
                return elapsed;
            } else {
                return elapsed + delta + (elapsed == -1 ? 1 : 0);
            }
        } else {
            recentTimestamp = now();
            return elapsed;
        }
    }

    this.isFrozen = function () {
        return isFrozen;
    }

    this.getTimeSec = function () {
        return iDiv(this.getTime(), 1000);
    }

    this.reset = function () {
        elapsed = -1;
        isFrozen = true;
    }

    this.conserve = function () {
        if (elapsed > -1) {
            elapsed = -this.getTime();
        }
        isFrozen = true;
    }

    this.reset();
}

GameTimer.FREEZE_AFTER_SEC = 15;
var MIN_ACTUAL_ATTEMPT_LENGTH = 3;

function Attempt(_serializer) {
    var serializer;

    var that = this;

    that.hash = hash();

    var attemptId = -1;
    var elapsed = -1;
    var encHistory = "";
    var timestamp;

    var gt;
    var history;
    var redo;

    that.gameId = null;

    this.setGameId = function (gameId) {
        that.gameId = gameId;
    }

    this.getGameId = function () {
        return that.gameId;
    }

    this.getGameTimer = function () {
        return gt;
    }

    this.getHistory = function () {
        return history;
    }

    this.getRedo = function () {
        return redo;
    }

    this.setAttemptId = function (_attemptId) {
        attemptId = _attemptId;
    }

    this.getAttemptId = function () {
        return attemptId;
    }

    this.clearRedo = function () {
        redo = new Array();
    }

    this.win = function () {
        gt.conserve();
        elapsed = gt.getElapsed();

        if (history.length > 0 && elapsed == -1) {
            elapsed = -101;
            gt.setElapsed(elapsed);
        }

        this.encodeHistory();
        timestamp = nowTS();
    }

    this.encodeHistory = function () {
        encHistory = "";
        for (var i in history) {
            var move = history[i];
            encHistory += serializer.encodeMove(move);
        }
    }

    this.getEncodedHistory = function () {
        return encHistory;
    }

    this._dev_getLiveEncodedHistory = function () {
        __encHistory = "";
        for (var i in history) {
            var move = history[i];
            __encHistory += serializer.encodeMove(move);
        }
        return __encHistory;
    }

    this.finish = function () {
        if (elapsed >= -1) {
            var historyLength = history.length;
            elapsed = gt.getElapsed();
            this.encodeHistory();
            timestamp = nowTS();
            this.reset();
            return historyLength >= MIN_ACTUAL_ATTEMPT_LENGTH;
        } else {
            this.reset();
            return true;
        }
    }

    this.reset = function () {
        gt = new GameTimer();
        gt.setElapsed(elapsed);
        history = new Array();
        redo = new Array();
    }

    this.getGameTime = function () {
        if (elapsed > 0) {
            return elapsed;
        } else if (elapsed == -1) {
            return 0;
        } else {
            return -elapsed;
        }
    }

    this.isFresh = function () {
        return gt.getElapsed() == -1;
    }

    this.isWon = function () {
        return gt.getElapsed() < -1;
    }

    this.getFreshData = function () {
        encHistory = "";
        for (var i in history) {
            var move = history[i];
            encHistory += serializer.encodeMove(move);
        }

        return {
            gameId : that.gameId,
            attemptId : attemptId,
            history : elapsed < -1 ? that.getEncodedHistory() : encHistory,
            elapsed : isDef(gt) ? gt.getElapsed() : elapsed,
            hash : that.hash
        };
    }

    this.getData = function () {
        return {
            gameId : that.gameId,
            attemptId : attemptId,
            history : this.getEncodedHistory(),
            elapsed : elapsed,
            hash : that.hash
        };
    }

    this.setData = function (dataObj) {
        if (isDef(dataObj.attemptId)) {
            attemptId = dataObj.attemptId;
        }
        encHistory = dataObj.history;
        elapsed = dataObj.elapsed;
        if (isDef(dataObj.timeStamp)) {
            timestamp = dataObj.timeStamp;
        }
        this.reset();
    }

    this.equals = function (anotherAttempt) {
        return encHistory == anotherAttempt.history &&
            elapsed == anotherAttempt.elapsed;
    }

    serializer = _serializer;

    this.reset();
}
function AttemptLocalStorage(cs) {
    var that = this;

    var multiAttemptData;

    this.load = function () {
        multiAttemptData = store.get("attemptDelayed_gVId" + that.cs.getGameVariationId() + "_uId" + that.cs.getUserId());

        if (!isDef(multiAttemptData) || !multiAttemptData) {
            multiAttemptData = [];
        }
    }

    this.save = function () {
        store.set("attemptDelayed_gVId" + that.cs.getGameVariationId() + "_uId" + that.cs.getUserId(),
            multiAttemptData);

        //_w("SAVE! " + $.toJSON(multiAttemptData), _DEV_LOCALSTORAGE);
    }

    this.compareAttemptData = function (attemptDataA, attemptDataB) {
        return attemptDataA.gameId == attemptDataB.gameId && attemptDataA.hash == attemptDataB.hash ||
            attemptDataA.gameId == attemptDataB.gameId && attemptDataA.history == attemptDataB.history ||
            attemptDataA.gameId == attemptDataB.gameId && attemptDataA.attemptId == attemptDataB.attemptId;
    }

    this.sync = function (attempt) {
        if (!attempt.isFresh() && !(attempt.isWon() && attempt.attemptId == -1)) {
            that.load();

            var found = false;

            for (var i in multiAttemptData) {
                var attemptData = multiAttemptData[i];

                if (that.compareAttemptData(attemptData, attempt.getFreshData())) {
                    multiAttemptData[i] = attempt.getFreshData();
                    found = true;
                }
            }

            if (!found) {
                multiAttemptData.push(attempt.getFreshData());
            }

            that.save();
        }
    }

    this.remove = function (attemptData) {
        that.load();

        var newMultiAttemptData = [];

        for (var i in multiAttemptData) {
            var storedAttemptData = multiAttemptData[i];

            if (!that.compareAttemptData(attemptData, storedAttemptData)) {
                newMultiAttemptData.push(storedAttemptData);
            }
        }

        multiAttemptData = newMultiAttemptData;

        that.save();
    }

    this.reuploadAttempts = function () {
        that.load();

        for (var i in multiAttemptData) {
            var storedAttemptData = multiAttemptData[i];

            if (isDef(storedAttemptData)) {
                that.cs.reuploadAttempt(storedAttemptData.gameId, null, storedAttemptData, {
                    async : false
                });
            }
        }
    }

    that.cs = cs;
}

var HIDE_SINGLE_PANEL = 0;
var HIDE_ALL_PANELS = 1;

var OVER_FIELD_PANEL = 0;
var BOTTOM_PANEL = 1;

var PLAYED_GAME_COLOR = "#FFE0EE";
var WON_GAME_COLOR = "#FFFFE0";

var KEY_ENTER = 13;

var KOSYNKA_GAME_VARIATION_ID = 1;
var FREECELL_GAME_VARIATION_ID = 2;
var CHESS_GAME_VARIATION_ID = 3;
var SPIDER_4S_GAME_VARIATION_ID = 4;
var SPIDER_1S_GAME_VARIATION_ID = 5;
var SPIDER_2S_GAME_VARIATION_ID = 6;
var SOKOBAN_GAME_VARIATION_ID = 7;

function BottomSubPanel(_parent) {
    var that = this;
    var uniqueId;
    var id;
    var onCloseFn = null;
    var onShowFn = null;
    var contents = "";
    var parent = null;

    this.getId = function () {
        return id;
    };

    this.render = function (callbackFn) {
        var panelDiv = "<div class='bubblePanel bottomSubPanel bottomPanel _hackPaddingLayer' id='" + id + "'>"
            + "<img class='closeBottomSubPanelImg' id='closeBottomSubPanel" + uniqueId
            + "' alt='" + I18n.contextGet("ui", "closeIconAltText") + "' src='/img/icons/icon_close.png' />"
            + contents
            + "</div>";
        $("#bottomArea").append(panelDiv);
        $("#closeBottomSubPanel" + uniqueId).click(function () {
            ui.hidePanel(that);
        });
        ui.showPanel(that);
    };

    this.renderContents = function (renderTo) {
        var panelDiv = "<div id='" + id + "'>"
            + "<img class='closeBottomSubPanelImg' id='closeBottomSubPanel" + uniqueId
            + "' alt='" + I18n.contextGet("ui", "closeIconAltText") + "' src='/img/icons/icon_close.png' />"
            + contents
            + "</div>";
        $("#" + renderTo).empty().append(panelDiv);
        $("#" + renderTo).show();
        $("#closeBottomSubPanel" + uniqueId).click(function () {
            if (onCloseFn != null) {
                onCloseFn();
            }
//            that.destroy();
        });
    }

    this.generatePanelId = function () {
        uniqueId = BottomSubPanel.maxId;
        id = "bottomSubPanel" + uniqueId;
        BottomSubPanel.maxId++;

        this.id = id; // COMPATIBILITY HACK
    };

    this.destroy = function () {
//        alert("#" + id);
//        alert("DESTROY!");
        $("#" + id).remove();
    };

    this.fillContents = function (_contents) {
        contents = _contents;
    };

    this.onClose = function (callbackFn) {
        if (isDef(callbackFn)) {
            onCloseFn = callbackFn;
        }
    };

    this.onShow = function (callbackFn) {
        onShowFn = callbackFn;
    };

    this.fireOnShow = function () {
        if (onShowFn != null) {
            onShowFn();
        }
    };

    this.fireOnClose = function (closeType) {
        if (onCloseFn != null) {
            onCloseFn(closeType);
        }
    };

    this.generatePanelId();
    parent = _parent;
}

BottomSubPanel.maxId = 0;

function Beacon(_gc, _ui) {
    var that = this;

    var gc, ui, cs;

    var beaconFails = 0;
    var userAlert = false;

    var lastUserActivity = now();

    var i18n = new I18n();
    i18n.setContext("beacon");

    this.setNetworkStatus = function (status) {
        if (status == "offline") {
            $("#connOnline").hide();
            $("#connProblem").hide();
            $("#connOffline").show();
        } else if (status == "problem") {
            $("#connOnline").hide();
            $("#connOffline").hide();
            $("#connProblem").show();
        } else if (status == "online") {
            $("#connOffline").hide();
            $("#connProblem").hide();
            $("#connOnline").show();
        }
    }

    this.reportUserActivity = function () {
        lastUserActivity = now();
    }

    this.updateActivity = function (guestCount, loggedCount, regCount) {
        $("#activity").empty().append(i18n.format(
            "activityString",
            guestCount,
            loggedCount,
            regCount
        ));
    }

    this.sendBeacon = function () {
        var intervalSeconds = 60;
        var timeout = 5000;
        if (beaconFails > 0) {
            timeout = 15000;
        }

        cs.sendBeacon(intervalSeconds, timeout, msToSec(lastUserActivity - now()), function (result, response) {
            if (result) {
                that.updateActivity(response.guestCount, response.loggedCount, response.regCount);
                beaconFails = 0;
                userAlert = false;
                if (response.unreadMsgCount>-1)
                    ui.updateUnreadMsgCount(response.unreadMsgCount);
            } else {
                beaconFails++;
            }
            if (beaconFails == 0) {
                that.setNetworkStatus("online");
                ui.hideNotification();
            } else if (beaconFails < 3) {
                that.setNetworkStatus("problem");
            } else {
                that.setNetworkStatus("offline");
                if (!userAlert) {
                    userAlert = true;
                    ui.notifyUser(i18n.get("noConnectionNotice"), true);
                }
            }
        });
    }

    this.bindActivityTrackers = function () {
        $(window).mousemove(function () {
            that.reportUserActivity();
        });

        $(window).click(function () {
            that.reportUserActivity();
        });

        $(window).keydown(function () {
            that.reportUserActivity();
        });

        $(window).bind("scroll", function () {
            that.reportUserActivity();
        });
    }

    gc = _gc;
    ui = _ui;
    cs = gc.getClientServer();

    that.bindActivityTrackers();
}

function extendClass(child, parent) {
    var F = function () {
    }
    F.prototype = parent.prototype
    child.prototype = new F()
    child.prototype.constructor = child
    child.superclass = parent.prototype
}

function multiExtendClass(child, parent, obj) {
    var F = function () {
    }
    F.prototype = parent.prototype
    child.prototype = new F()
    child.prototype.constructor = child
    child.superclass = parent.prototype
    child.superclass.constructor.apply(obj);

    obj.super = new Object();
    for (var p in obj) {
        obj.super[p] = obj[p];
    }
}

function formatLargeGameTime(time) {
    time = iDiv(time, 1000);

    var sec = time % 60;
    var min = iDiv(time, 60) % 60;
    var hrs = iDiv(time, 3600) % 24;
    var days = iDiv(iDiv(time, 3600), 24);

    var strDays = "";

    if (days > 0) {
        strDays = days + " " + I18n.contextGet("time", "daysShortSuffix") + " ";
    }

    return strDays + hrs + " " + I18n.contextGet("time", "hoursSuperShortSuffix") + " "
        + ext(min, 2, '0') + " " + I18n.contextGet("time", "minutesShortSuffix") + " "
        + ext(sec, 2, '0') + " " + I18n.contextGet("time", "secondsShortSuffix");
}

function formatGameTimeMS(timeMS, onlyMinutes) {
    var onlyMinutes = typeof (onlyMinutes) == "undefined" ? false : onlyMinutes;

    timeMS = iDiv(timeMS, 1000);

    if (timeMS > 3600 * 24)
        timeMS = 3600 * 24;

    if (timeMS < 0)
        timeMS = -timeMS;

    if (timeMS == -1)
        timeMS = 0;

    var sec = timeMS % 60;
    var min = iDiv(timeMS, 60) % 60;
    var hrs = iDiv(timeMS, 3600);

    if (!onlyMinutes) {
        if (hrs == 0) {
            return min + ":" + ext("" + sec, 2, "0"); // ext("" + min, 2, "0")
        } else {
            return hrs + ":" + ext("" + min, 2, "0") + ":" + ext("" + sec, 2, "0"); // ext("" + hrs, 2, "0")
        }
    } else {
        if (min == 0 && hrs == 0)
            return sec + "&nbsp;" + I18n.contextGet("time", "secondsShortSuffix");
        else {
            if (sec > 30)
                min++;
            if (min == 60) {
                hrs++;
                min = 0;
            }
            if (hrs == 0) {
                return min + "&nbsp;" + I18n.contextGet("time", "minutesShortSuffix");
            } else {
                return hrs + "&nbsp;" + I18n.contextGet("time", "hoursSuperShortSuffix")
                    + "&nbsp;" + min + "&nbsp;" + I18n.contextGet("time", "minutesSuperShortSuffix");
            }
        }
    }
}

function formatTime(time, options) {
    var separator = ";";
    var clarify = false;

    if (isDef(options) && isDef(options.separator)) {
        separator = options.separator;
    }

    if (isDef(options) && isDef(options.clarify)) {
        clarify = options.clarify;
    }

    // create a new JavaScript Date object based on the timestamp
    // multiplied by 1000 so that the argument is in milliseconds, not seconds
    var date = new Date(time * 1000);
    // hours part from the timestamp
    var hours = date.getHours();
    // minutes part from the timestamp
    var minutes = date.getMinutes();
    // seconds part from the timestamp
    var seconds = date.getSeconds();

    var day = date.getDate();
    var month = date.getMonth() + 1;
    var year = ("" + date.getFullYear()).substr(2, 2);

    var dateString = ext(day, 2, "0") + "." + ext(month, 2, "0") + "." + year;
    var timeString = ext("" + hours, 2, "0") + ':' + ext("" + minutes, 2, "0");

    if (clarify && date.toDateString() == (new Date()).toDateString()) {
        dateString = I18n.contextGet("time", "today");
    }

    if (isDef(options) && isDef(options.putTimeInBrackets)) {
        var formattedTime = dateString + " (" + timeString + ")";
    } else {
        formattedTime = dateString + separator + " " + timeString;
    }

    return formattedTime;
}

function formatDate(time) {
    // create a new JavaScript Date object based on the timestamp
    // multiplied by 1000 so that the argument is in milliseconds, not seconds
    var date = new Date(time * 1000);

    var day = date.getDate();
    var month = date.getMonth() + 1;
    var year = ("" + date.getFullYear()).substr(2, 2);

    var formattedDate = ext(day, 2, "0") + "." + ext(month, 2, "0") + "."
        + year;

    return formattedDate;
}

function formatDateRu2(time) {
    var formattedDate = formatDateRu(time);
    var formattedNow = formatDateRu(nowTS());

    if (formattedDate == formattedNow) {
        return "сегодня";
    } else {
        return formattedDate;
    }
}

function formatDateRu(time) {
//    var months = [
//        'января',
//        'февраля',
//        'марта',
//        'апреля',
//        'мая',
//        'июня',
//        'июля',
//        'августа',
//        'сентября',
//        'октября',
//        'ноября',
//        'декабря'];

    var date = new Date(time * 1000);

    var day = date.getDate();
    var month = date.getMonth() + 1;
    var year = "" + date.getFullYear();

    var formattedDate = day + " " + I18n.contextGet("monthsBeta", month) + " " + year;

    return formattedDate;
}

// integer division
function iDiv(numerator, denominator) {
    // In JavaScript, dividing integer values yields a floating point result
    // (unlike in Java, C++, C)
    // To find the integer quotient, reduce the numerator by the remainder
    // first, then divide.
    var remainder = numerator % denominator;
    var quotient = (numerator - remainder) / denominator;

    // Another possible solution: Convert quotient to an integer by truncating
    // toward 0.
    // Thanks to Frans Janssens for pointing out that the floor function is not
    // correct for negative quotients.
    if (quotient >= 0)
        quotient = Math.floor(quotient);
    else
    // negative
        quotient = Math.ceil(quotient);

    return quotient;
}

// returns true, if variable is defined
// and false otherwise
function isDef(variable) {
    return typeof (variable) != "undefined";
}

function ifDef(a, b) {
    if (isDef(a)) {
        return a;
    } else {
        return b;
    }
}

function trimLeadingZeros(str) {
    while (str.length > 1 && str.charAt(0) == '0') {
        str = str.substring(1);
    }
    return str;
}

function boolToInt(b) {
    return b ? 1 : 0;
}

function bool2Int(b) {
    return b ? 1 : 0;
}

function parseJSON(jsonData) {
    try {
        return $.parseJSON(jsonData);
    }
    catch (e) {
        return null;
    }
}

function ext(str, len, char) {
    char = typeof (char) == "undefined" ? "&nbsp;" : char;
    str = "" + str;
    while (str.length < len) {
        str = char + str;
    }
    return str;
}

function genRnd(a, b) {
    if (typeof (b) == "undefined")
        return Math.floor(Math.random() * a);
    else
        return Math.floor(Math.random() * (b - a)) + a;
}

function now() {
    return new Date().getTime();
}

function nowTS() {
    return iDiv(new Date().getTime(), 1000);
}

function msToSec(ms) {
    return iDiv(ms, 1000);
}

function formatGame(gameVariationId) {
    return I18n.contextGet("games", gameVariationId);
//    switch (gameVariationId) {
//        case KOSYNKA_GAME_VARIATION_ID:
//            return "Пасьянс «Косынка»";
//        case FREECELL_GAME_VARIATION_ID:
//            return "Пасьянс «Солитёр»";
//        case CHESS_GAME_VARIATION_ID:
//            return "Шахматы";
//        case SPIDER_1S_GAME_VARIATION_ID:
//            return "Пасьянс «Паук» (1 масть)";
//        case SPIDER_2S_GAME_VARIATION_ID:
//            return "Пасьянс «Паук» (2 масти)";
//        case SPIDER_4S_GAME_VARIATION_ID:
//            return "Пасьянс «Паук» (4 масти)";
//        case SOKOBAN_GAME_VARIATION_ID:
//            return "Сокобан";
//    }
//    return "";
}

function arrayLast(arr) {
    if (arr.length == 0) {
        return null;
    } else {
        return arr[arr.length - 1];
    }
}

function Listener() {
    var that = this;

    that.listeners = new Array();

    this.addListener = function (l) {
        that.listeners.push(l);
    }

    this.removeListener = function (l) {
        for (var i in that.listeners) {
            if (that.listeners[i] == l) {
                that.listeners.splice(i, 1);
                return;
            }
        }
    }

    this.notify = function (event) {
        for (var i = 0; i < that.listeners.length; i++) {
            var l = that.listeners[i];
            if (isDef(l[event])) {
                l[event]();
            }
        }
    }
}

function hasFunc(f) {
    return typeof(f) == "function";
}

function last(arr, i) {
    if (typeof (i) == "undefined")
        return arr[arr.length - 1];
    else
        return arr[arr.length - 1 + i];
}

function mergeObj(A, B) {
    for (var p in B) {
        A[p] = B[p];
    }
}

function hash() {
    var S4 = function () {
        return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
    };
    return (S4() + S4() + "-" + S4() + "-" + S4() + "-" + S4() + "-" + S4() + S4() + S4());
}


//____________________ SCROLLER  ______________________
(function setupOnScroll(d,w){
    setTimeout(function(){
        try{
            var buttonUpHtml = '<div id="btnScrollUp" style="position: fixed;  display: block;    bottom: 15px;    left: 15px;    padding-left: 5px;    padding-right: 5px;    font-size: 16pt;    border: 1px solid black;    border-radius: 5px;    cursor: pointer;">'+contexts['shared']['btnUp']+'</div>';
            var btn;
            var fbuttonAdded = false;
            var fbuttonShow = false;
            var height = w.screen.height * 0.7 || 100;
            $(w).bind("scroll", function () {
               if (w.scrollY> height){
                   if (!fbuttonAdded){
                       $(d.body).append(buttonUpHtml);
                       btn = $('#btnScrollUp');
                       fbuttonAdded = true;
                       fbuttonShow = true;
                       $(btn).click(function(){
                           w.scrollTo(0,0);
                       });
                   } else {
                       if (!fbuttonShow){
                           $(btn).show();
                           fbuttonShow = true;
                       }
                   }
               } else {
                   if (fbuttonAdded && fbuttonShow) {
                       $(btn).hide();
                       fbuttonShow = false;
                   }
               }
            });
        } catch(e){console.log(e)};
    },1000);
}(document, window));
//__________________________________________________________

function sendMailInvite(){
    location.replace('mailto:?subject=Рекомендую сыграть&body='+location.href);
}


function vkAuthOpenAPI(){
    VK.init({
        apiId: 3960668
    });
    VK.Auth.getLoginStatus(function authInfo(response) {
        if (response.session) {
            location.reload();
        } else {
            VK.Auth.login(function(response) {
                if (response.session) {
                    location.reload();
                } else {
                }
            });
        }
    });
    function serverAuth(session){
        VK.Api.call('users.get', {uids: session.mid}, function(r) {
            if(r.response) {
               console.log(r.response[0].first_name+" "+r.response[0].last_name);
            }
        });
    }
}

setTimeout(function VkHidePAsswordChange(){
   if (window._isVk || window._isVK){
       try{
           $('#changePassword').hide();
       }
       catch(e) {console.log(e)}
   }
},1000);

function setCookie(name, value, expires, path, domain, secure) {
    if (!name || !value) return false;
    var str = name + '=' + encodeURIComponent(value);

    if (expires) str += '; expires=' + expires.toGMTString();
    if (path)    str += '; path=' + path;
    if (domain)  str += '; domain=' + domain;
    if (secure)  str += '; secure';

    document.cookie = str;
    return true;
}


//____________________ TEMPLATE  ______________________
var Template = (function(){
    var templates = {};

    function getTemplate(name,params,callback){
        if (!isDef(params)||!params) params = {};
        var sresult = "", async = true;
        if (!callback || !_.isFunction(callback)) async = false;
        loadTemplate(name,function(err, result){
            if (!!result) {
                try{
                    sresult = _.template(result, params);
                } catch(exc){
                    console.log(exc);
                }
            }
            if (async) callback(sresult);
        }, async);
        if (!async) return sresult;
    }

    function loadTemplate(name, callback, async){ // return (error, result)
        var template = templates[name];
        if (!template || _.isUndefined(template)){ // load template
            $.ajax({
                url: '../templates/'+name,
                async:async
            }).done(function(result) {
                    if(!result){
                        console.log('ajax return nothing! '+name);
                        callback("error", null);
                        return;
                    }
                    template = result;
                    templates[name] = template;
                    callback(null,template)
                }).error(function(err){
                    console.log('no template! '+ name, err);
                    callback("error", null);
                })
        }
        else callback(null, template)
    }

    return {
        get:getTemplate
    }

}());


//_________________ ERROR_REPORTER  ___________________
var ErrorReporter = (function(){
    init();
    var loged = {};
    function init(){
        window.onerror = function (errorMessage, url, line) {
            if ( window._reportErrors != true ) return;
            if (errorMessage == 'Error loading script' || !line || parseInt(line)<2) return;
            if (url && line){
                if (loged[line+url]) return;
                else loged[line+url] = true;
            }
            sendError({errorMessage:errorMessage, url:url,line:line});
        }
        if (!isDef(window._gameVariationId)) window._gameVariationId=0;
    }

    function sendError(err){
        try{
        $.ajax({
            url : "/gw/error.php",
            type : "POST",
            data : {
                errorMessage : err.errorMessage,
                url : err.url,
                line : err.line,
                gameVariationId : window._gameVariationId
            }
        });
        } catch(e){console.log(e)};
    }

    return {
        sendError:function(err){
            if (!isDef(err.errorMessage)) err.errorMessage = err.message;
            if (!isDef(err.url)) err.url = "";
            if (!isDef(err.line)) err.line = "";
            sendError(err);
        }
    }

}());
//_____________________________________________________


//_________________ ADMIN GAME STATS __________________
(function showGameInfo(d,w){
    var $div;
    var html = '<img class="closeIcon" src="//logic-games.spb.ru/v6-game-client/app/i/close.png"> <table> <tr><td>Дата выпуска</td>   <td id="logic-table-date" contenteditable class="logic-table-edit"></td></tr><tr> <td>Сервер</td>     <td id="logic-table-ss" contenteditable class="logic-table-edit"></td></tr> <tr> <td>Вконтакте</td>     <td id="logic-table-vk" contenteditable class="logic-table-edit"></td></tr> <tr> <td>Реклама</td> <td id="logic-table-advert" contenteditable class="logic-table-edit"></td></tr> </table>';

    function init(){
        console.log('showGameInfo');
        $div = $('<div />').html(html).appendTo('body').attr('id', 'logicGameStats');
        $div.find('.closeIcon').on('click', function(){
            $div.hide();
        });
        $div.find('.logic-table-edit').blur(save);
        $div.hide();
        $div.draggable();
        load();
    }

    function load() {
        $.post('/admin/gameStats.php', {
            load: true,
            gameVariationId: _gameVariationId
        },
        function(data) {
            console.log(data);
            if (data != 'null'){
                data = JSON.parse(data);
                $div.find('#logic-table-date').html(data['date']);
                $div.find('#logic-table-ss').html(data['ss']);
                $div.find('#logic-table-vk').html(data['vk']);
                $div.find('#logic-table-advert').html(data['advert']);
            }
            $div.show();
        });
    }

    function save(){
        var data = {
            date: $div.find('#logic-table-date').html(),
            ss: $div.find('#logic-table-ss').html(),
            vk: $div.find('#logic-table-vk').html(),
            advert: $div.find('#logic-table-advert').html()
        };
        console.log(data);
        $.post('/admin/gameStats.php', {
            save: true,
            gameVariationId: _gameVariationId,
            data: JSON.stringify(data)
        });
    }
    try {
        $(document).ready(function () {
            setTimeout(function () {
                try {
                    var cs = window.cs || (window.controller ? window.controller.getClientServer() : null);
                    if ((cs.isSuperUser())) {
                        init();

                    }
                } catch (e) {
                    console.log(e)
                }
            }, 2000)
        });
    }catch(e){console.log(e)}
}(document, window));


//__________________ VK IFRAME RESIZER ________________
var Resizer = function (wrapper){
    wrapper =  wrapper || 'main-wrapper';
    wrapper = $('#'+wrapper);
    var isVk = window._isVk ||  window._isVK ||  window.isVk ||  window.isVK;
    console.log('Resizer setup', isVk, window.VK, wrapper);
    if (!wrapper.length || !$ || !isVk || !window.VK || !window.VK.callMethod) return;
    var oldHeight, width = $(document).width();
    width = width > 1000 ? 1000 : width;

    setNewIframeSize();

    setInterval(function () {
        if (wrapper.height() != oldHeight){
            setNewIframeSize();
        }
    },100);

    function setNewIframeSize() {
        console.log('Resizer setNewIframeSize', oldHeight, wrapper.height());
        oldHeight = wrapper.height();
        window.VK.callMethod("resizeWindow", width, oldHeight);
    }
};

try {
    $(document).ready(function () {
        setTimeout(function () {
            try {
                Resizer();
            } catch (e) {
                console.log(e)
            }
        }, 100)
    });
}catch(e){console.log(e)}

//_________________ switch locale ________________
$(document).ready(function () {
    var idField = document.getElementById('under-field') ? '#under-field' : '#field';
    var $field = $(idField);
    if (window._lang && !window._isFb && !window._isVk) {
        var lang, langTitle, $a = $('<a>')
        if (window._lang == 'en') {
            lang = 'ru';
            langTitle = 'РУ';
        } else {
            lang = 'en';
            langTitle = 'EN';
        }

        $a.html(langTitle).attr("href", "?lang=" + lang).addClass('switchLocale');
        $field.append($a);
        $a.css({
            top: $field.height()  + 8,
            left: $field.width() + 20,
            position: 'absolute'
        });
    }
    if (window._lang && window._lang != 'ru'){
        $('.lg-vkgroup').hide();
    } else if (!window._isVk){
        $field.append ($('.lg-vkgroup').css({ top: $field.height()  -52, left: $field.width() + 19}));
    }
});
function SafeSharedUI() {
    var that = this;

    var i18n = new I18n();
    i18n.setContext('ui');

    this.renderErrorReason = function (id, reason) {
        if (reason == NOT_LOGGED) {
            $(id).empty().append("<p class='errorMsg'>" + i18n.get("notLoggedNotice") + "</p>");
        } else {
            $(id).empty().append("<p class='errorMsg'>" + i18n.get("unknownLoadingErrorNotice") + "</p>");
        }
    }
}

function SharedUI() {
    var that = this;

    var gc;

    var userProfile;

    that.activePanels = [];

    that.options = {
        showHistoryLength : false,
        showGameLabel : false,
        showWinCount : false
    };

    that.i18n = new I18n();
    that.i18n.setContext('ui');

    this.setGameController = function (_gc) {
        gc = _gc;
    }

    this.getGameController = function () {
        return gc;
    }

    this.getUserProfile = function () {
        return userProfile;
    }

    this.updateUnreadMsgCount = function (unreadMsgCount) {
        userProfile.updateUnreadMsgCount(unreadMsgCount);
    }

    this.hideNotification = function () {
        // STUB!

//        $(".notification").fadeOut("fast");
    }

    this.notifyUser = function (msg, closeManually) {
        // STUB!

//        var closeManually = isDef(closeManually) ? closeManually : false;
//        $("#infoPanel").show();
//        $("#infoPanel").empty()
//            .prepend(
//            "<div id=\"notification" + bubbleId + "\" class=\"bubblePanel bottomSubPanel notification\">"
//                + "<img class='closeBubble' id='closeNotification" + bubbleId
//                + "' src='/img/icons/icon_close.png' alt='Закрыть' />"
//                + "<div class=\"infoPanelMessage\">" + msg
//                + "</div></div>");
//
//        if (closeManually) {
//            $("#notification" + bubbleId).slideDown("fast");
//        } else {
//            $("#notification" + bubbleId).slideDown("fast").delay(2000).fadeOut("fast");
//        }
//
//        $("#closeNotification" + bubbleId).click(function (bubbleId) {
//            return function () {
//                $("#notification" + bubbleId).fadeOut("fast");
//            }
//        }(bubbleId));
//
//        bubbleId++;
    }

    this.alert = function (msg) {
        alert(msg);
    }

    this.setupSharedUI = function () {
        userProfile = new PlayerProfile(gc, this);
        that.userProfile = userProfile;
    }

    this.setGuestUI = function () {
        $("#bbProfile").hide();
        $("#bbLoginRegister").show();
        that.historyRenderer.onLogout();
        if (typeof(_hack_updateParametersUIOnLogout) != "undefined") {
            _hack_updateParametersUIOnLogout();
        }
    }

    this.setUserUI = function () {
        $("#bbProfile").show();
        $("#bbLoginRegister").hide();
        that.historyRenderer.onLogin();

        if (typeof(_hack_updateParametersUIOnLogin) != "undefined") {
            _hack_updateParametersUIOnLogin();
        }

        that.getUserProfile().show();
    }

    this.onRegistration = function () {
        that.hideAllActivePanels();

        that.setUserUI();
    }

    this.setLoading = function (panelId) {
        $(panelId).empty().append("<div style='padding-top: 10px; padding-left:5px; height:25px;'>"
            + "<span style='float: left; color:black;'>" + that.i18n.get("loadingNotice") + "&nbsp;"
            + "</span><img style='float: left; margin-top: -12px;' src='/img/icons/loading.gif'>"
            + "</div>");
    }

    this.serverSortArrowsImg = function (order, style, imageId) {
        var style = isDef(style) && style != "" ? " style='" + style + "' " : "";
        var imageId = isDef(imageId) ? " id='" + imageId + "' " : "";
        return (order ? " &nbsp;<img " + style + imageId + "src='/img/icons/sort-asc.png' alt=''/>" : " &nbsp;<img " + style + imageId + "src='/img/icons/sort-desc.png' alt=''/>");
    }

    this.getOrderHint = function (order) {
        return uiGetOrderHint(order);
    }

    this.hideHint = function () {
        $(".floatingHint").remove();
    }

    this.bindCloseIcon = function (jIcon, panelId) {
        $(jIcon).click(function () {
            that.hidePanel(panelId);
        })
    }

    this.showHint = function (element, text) {
        $("body").append("<p class='floatingHint' id='floatingHint'>" + text + "</p>");
        $("#floatingHint").css("top", $(element).offset().top - 53);
        $("#floatingHint").css("left", $(element).offset().left + 25);
    }

    this.hasActiveInput = function () {
        return isDef($("*:focus").attr("id"));
    }

    this.updateGameStats = function () {
//        _w("updateGameStats");

        var gm = that.gc.getGameManager();

//        alert(gm);

        if (gm) {
            var gameId = gm.getGameId();

            var gameIdHTML = "<span>" + gameId + "</span>";

            //////////

            var gameInfo = gm.getGameInfo();

            var gameInfoHTML = "—";

            if (gameInfo.totalPlayed > 0) {
                gameInfoHTML = (gameInfo.avgWinTime > 0 ? formatGameTimeMS(gameInfo.avgWinTime) : "—")
                    + (that.options.showWinCount?" (" + gameInfo.totalWon + "/" + gameInfo.totalPlayed + ")":"");
            }

            gameInfoHTML = "<span>" + that.i18n.get("ratingLabel") + " " + gameInfoHTML + " </span>";

            if (that.options.showGameLabel) {
                gameInfoHTML = "<span>" + gameInfo.label + "</span> / " + gameInfoHTML;
            }

            //////////

            var historyLengthHTML = "";

            if (that.options.showHistoryLength) {
                historyLengthHTML = "<span>" + that.i18n.get("historyLengthLabel")
                    + " " + that.gc.getGameManager().getHistoryLength() + "</span>";
            }

            //////////

            var gt = gm.getGameTimer();

            var timeMS = gt.getTime();

            var timeStr = formatGameTime(timeMS);

            var totalGameTime = gm.getTotalGameTime();

            var totalGameTimeStr = formatGameTime(totalGameTime);

            if (gt.isFrozen()) {
                var timeHTML = "<span class='frozenTime'>" + that.i18n.get("attemptTimeLabel") + " " + timeStr + "</span>";
                var totalGameTimeHTML = "<span class='frozenTime'>" + that.i18n.get("gameTimeLabel") + " " + totalGameTimeStr + "</span>";
            } else {
                timeHTML = "<span>" + that.i18n.get("attemptTimeLabel") + " " + timeStr + "</span>";
                totalGameTimeHTML = "<span>" + that.i18n.get("gameTimeLabel") + " " + totalGameTimeStr + "</span>";
            }

            //////////

            $("#gameStatePanel").empty().append(gameIdHTML + " / "
                + gameInfoHTML + " / "
                + (that.options.showHistoryLength ? (historyLengthHTML + " / ") : "")
                + timeHTML + " / " + totalGameTimeHTML);
            $("#gameStatePanel").show();

//        if (gc.canAutoComplete()) {
//            $("#tbAutocomplete").removeClass("tbInactive");
//            $("#tbAutocomplete").addClass("tbSuperActive");
//        } else {
//            $("#tbAutocomplete").removeClass("tbSuperActive");
//            $("#tbAutocomplete").addClass("tbInactive");
//        }
//
//        if (gc.getGameManager().canUndo()) {
//            $("#tbUndo").removeClass("tbInactive");
//        } else {
//            $("#tbUndo").addClass("tbInactive");
//        }
//
//        if (gc.getGameManager().canRedo()) {
//            $("#tbRedo").removeClass("tbInactive");
//        } else {
//            $("#tbRedo").addClass("tbInactive");
//        }
        } else {
            that.setGameLoading();
        }
    }

//    this.showGameInfo = function () {
//        $("html, body").animate({
//            scrollTop : 0
//        }, "normal");
//    }

    this.attemptsChanged = function () {
        that.refreshAttempts();
    }

    this.refreshAttempts = function () {
        var gm = that.gc.getGameManager();

        if (gm) {
            var attempts = gm.getAttempts();
            var currentAttempt = gm.getCurrentAttempt();

            var attemptsContents = that.i18n.get("attemptsLabel") + ": ";

            if (attempts.length == 1 && attempts[0].isFresh()) {
                attemptsContents += "—";
            } else {
                for (var i = attempts.length - 1; i >= 0; i--) {
                    var attempt = attempts[i];

                    var cssClass = "";

                    if (attempt == currentAttempt) {
                        cssClass = " bigAttempt ";
                    }

                    if (attempt.isWon()) {
                        cssClass += " wonAttempt ";
                    }

                    attemptsContents += "<span id='restoreAttempt" + i + "' class='restoreAttempt" + cssClass + "'>" + (i + 1) + "</span> ";
                }
            }

            $("#attemptsPanel").empty().append(attemptsContents);

            for (var i = attempts.length - 1; i >= 0; i--) {
                $("#restoreAttempt" + i).click(function (attempt) {
                    return function () {
                        var currentAttempt = that.gc.getGameManager().getCurrentAttempt();
                        if (attempt.isWon() || attempt != currentAttempt) {
                            gm.restoreAttempt(attempt);
                        }
                    }
                }(attempts[i]));
            }
        } else {
            that.setGameLoading();
        }
    }

    this.setGameLoading = function () {
        $("#attemptsPanel").empty();
        $("#gameStatePanel").empty().append("Загрузка игры...");
    }

    this.isGameAreaActive = function () {
        for (var i in that.activePanels) {
            var activePanel = that.activePanels[i];
            if (activePanel.type == OVER_FIELD_PANEL) {
                return false;
            }
        }
        return true;
    }

    this.hideAllActivePanels = function () {
        var _activePanels = that.activePanels;
        that.activePanels = [];
        for (var i in _activePanels) {
            var panel = _activePanels[i];
            if (panel.type == OVER_FIELD_PANEL) {
                $("#welcomeOverlay").hide();
            }
            if (isDef(panel.onClose)) {
                panel.onClose();
            }
            $("#" + panel.id).hide();
            if (panel instanceof BottomSubPanel && isDef(panel.destroy)) {
                panel.destroy();
            }
        }
    }

    this.hidePanel = function (panelId) {
        that.hideAllActivePanels();
        if (panelId instanceof BottomSubPanel) {
            panelId.fireOnClose(HIDE_SINGLE_PANEL);
            panelId.destroy();
        }
    }

    this.showPanel = function (panel) {
        that.hideAllActivePanels();
        if (isDef(panel.type) && panel.type == OVER_FIELD_PANEL) {
            var idField = document.getElementById('game-field') ? '#game-field' : '#field';
            that.centerPanel("#" + panel.id, idField, panel.id=="welcomePanel");
            $("#welcomeOverlay").show();
        }
        that.activePanels.push(panel);
        $("#" + panel.id).show();
        if (panel instanceof BottomSubPanel) {
            panel.fireOnShow();
        }
    }

    this.centerPanel = function (child, parent, leftOnly, noAbs) {
        if (!(isDef(noAbs) && noAbs)) {
            $(child).css("position", "absolute");
        }
        if (!(isDef(leftOnly) && leftOnly)) {
            $(child).css("top", $(parent).position().top + ($(parent).height() - $(child).height()) / 2);
        }
        $(child).css("left", $(parent).position().left + ($(parent).width() - $(child).width()) / 2);
    }

    multiExtendClass(SharedUI, SafeSharedUI, this);

    if (window._isFb || window._isVk) {
        $('.profileLogoutPanel').hide();
        $('.share42init').hide();
        $('#welcomePanel').hide();
        $('#inviteFriend').hide();
        $('#showShared').hide();
        $('.lg-workbaner').hide();
    } else {
        $('.lg-workbaner').show();
    }
}

function uiShowHint(element, text) {
    $("body").append("<p class='floatingHint' id='floatingHint'>" + text + "</p>");
    $("#floatingHint").css("top", $(element).offset().top - 53);
    $("#floatingHint").css("left", $(element).offset().left + 25);
}

function uiHideHint() {
    $(".floatingHint").remove();
}

function uiGetOrderHint(order) {
    if (order) {
        return "<br /><span style='font-size: 6pt;'> (" + I18n.contextGet("ui", "ascOrderHint") + ")</span>";
    } else {
        return "<br /><span style='font-size: 6pt;'> (" + I18n.contextGet("ui", "descOrderHint") + ")</span>";
    }
}

function uiSetLoading(areaId) {
    $(areaId).empty().append("<div style='padding-top: 15px; padding-left:15px; height:30px;'>"
        + "<span style='float: left; color:#444; font-weight: normal;'>"
        + I18n.contextGet("ui", "loadingNotice") + "..."
        + "&nbsp;"
        + "</span><img style='float: left; margin-top: -12px;' src='/img/icons/loading.gif'>"
        + "</div>");
}
function SharedGameManager() {
    var that = this;
//    var that.g;
//
//    var that.gameId;
//
//    var that.serializer;
//
//    var that.gameData;
//
//    var that.attempts;
    that.currentAttempt = null;

//    var this.listeners;
//
    that.silent = false;
//
//    var that.gameInfo;
    this.getGameInfo = function () {
        return that.gameInfo;
    }

    this.getGameId = function () {
        return that.gameId;
    }

    this.getGame = function () {
        return that.g;
    }

    this.getGameTimer = function () {
        return that.currentAttempt.getGameTimer();
    }

    this.getTotalGameTime = function () {
        var total = 0;
        for (var i in that.attempts) {
            var attempt = that.attempts[i];
            if (attempt != that.currentAttempt) {
                total += attempt.getGameTime();
            } else {
                total += attempt.getGameTimer().getTime();
            }
        }
        return total;
    }

    this.getHistory = function () {
        return  that.currentAttempt.getHistory();
    }

    this.getEncodedHistory = function () {
        return  that.currentAttempt.getEncodedHistory();
    }

    this.getAttempts = function () {
        return that.attempts;
    }

    this.getCurrentAttempt = function () {
        return  that.currentAttempt;
    }

    this.getHistoryLength = function () {
        return  that.currentAttempt.getHistory().length;
    }

    this.applyEncodedHistory = function (encodedHistory) {
        that.g.notifyGoSilent(true);
        that.serializer.applyEncodedHistory(that.g, encodedHistory);

//        _w(that.currentAttempt.getHistory().length + " (" + encodedHistory.length + ")");

        if (that.currentAttempt != null && that.currentAttempt.isWon()) {
            that.rewind();
        }
        that.g.notifyGoSilent(false);
    }

    this.removeAttempt = function (attempt) {
        for (var i in that.attempts) {
            if (that.attempts[i] == attempt) {
                that.attempts.splice(i, 1);
                return true;
            }
        }
        return false;
    }

    this.canUndo = function () {
        return that.currentAttempt.getHistory().length > 0;
    }

    this.replay = function () {
        that.finishCurrentAttempt();

        that.currentAttempt = new Attempt(that.serializer);
        that.currentAttempt.setGameId(that.gameId);
        that.attempts.push(that.currentAttempt);
        that.g.setupNewGame();

        that.notifyAttemptsChange();
        that.notifyGameStateUpdate();

//        if (isDef(that.__replay)) {
//            that.__replay();
//        }
    }

    this.isWon = function () {
        if (that.currentAttempt == null) {
            return true;
        } else {
            return  that.currentAttempt.isWon();
        }
    }

    this.hasUserActivity = function () {
        that.currentAttempt.getGameTimer().unfreeze();
    }

    this.finishCurrentAttempt = function () {
        var valueless = hasFunc(that.isGameValueless) ? that.isGameValueless() : false;

        if (that.currentAttempt != null && (!that.currentAttempt.finish() || !that.currentAttempt.isWon() && valueless)) {
            this.removeAttempt(that.currentAttempt);
        } else {
            if (that.currentAttempt != null && !that.currentAttempt.isWon()) {
                this.notifyAttemptUpdated(that.currentAttempt);
            }
        }
        that.currentAttempt = null;
    }

    this.restoreAttempt = function (attempt) {
        that.finishCurrentAttempt();

        that.currentAttempt = attempt;
        that.g.setupNewGame();

        var encodedHistory = attempt.getEncodedHistory();

        that.applyEncodedHistory(encodedHistory);

        that.notifyAttemptsChange();
        that.notifyGameStateUpdate();
        that.notifyAttemptRestored();
    }

    this.notifyGameStateUpdate = function () {
        for (var i = 0; i < this.listeners.length; i++) {
            var l = this.listeners[i];
            if (isDef(l.gameStateChanged)) {
                l.gameStateChanged();
            }
        }
//        _dev_update();
        this.notifyAttemptsChange();
    }

    this.notifyAttemptsChange = function () {
        for (var i = 0; i < this.listeners.length; i++) {
            var l = this.listeners[i];
            if (isDef(l.attemptsChanged)) {
                l.attemptsChanged();
            }
        }
    }

    this.notifyAttemptUpdated = function (attempt) {
        for (var i = 0; i < this.listeners.length; i++) {
            var l = this.listeners[i];
            if (isDef(l.attemptUpdated)) {
                l.attemptUpdated(that.gameId, attempt);
            }
        }
        this.notifyAttemptsChange();
    }

    this.notifyAttemptRestored = function () {
        for (var i = 0; i < this.listeners.length; i++) {
            var l = this.listeners[i];
            if (isDef(l.attemptRestored)) {
                l.attemptRestored();
            }
        }
    }

    this.addListener = function (l) {
        this.listeners.push(l);
    }

    this.gameIsWon = function () {
        if (!that.currentAttempt.isWon()) {
            that.currentAttempt.win();
            this.notifyAttemptUpdated(that.currentAttempt);
            this.notifyAttemptsChange();
        }
    }

    this.wentSilent = function (_silent) {
        if (that.silent == _silent) {
            return;
        }

        that.silent = _silent;

        if (!that.silent) {
            this.notifyGameStateUpdate();
//            _dev_printState();
        }
    }

//    this._dev_setAttempts = function (att) {
//        that.attempts = new Array();
//        that.currentAttempt = null;
//        for (var i in att) {
//            var a = new Attempt(that.serializer);
//            a.setData(att[i]);
//            that.attempts.push(a);
//        }
//        if (that.attempts.length > 0) {
//            this.restoreAttempt(that.attempts[that.attempts.length - 1]);
//        } else {
//            that.currentAttempt = new Attempt(that.serializer);
//        }
//    }

    this.setupSharedGameManager = function () {
        that.listeners = new Array();
    }
}
function SharedGame() {
    var that = this;

    this.notifyWinState = function () {
        for (var i = 0; i < that.listeners.length; i++) {
            var l = that.listeners[i];
            if (isDef(l.gameIsWon)) {
                l.gameIsWon();
            }
        }
    }

    this.notifyNewGameIsSet = function () {
        for (var i = 0; i < that.listeners.length; i++) {
            var l = that.listeners[i];
            if (isDef(l.newGameIsSet)) {
                l.newGameIsSet();
            }
        }
    }

    this.notifyGoSilent = function (isSilent) {
        for (var i = 0; i < that.listeners.length; i++) {
            var l = that.listeners[i];
            if (isDef(l.wentSilent)) {
                l.wentSilent(isSilent);
            }
        }
    }

    this.notifyWinState = function () {
        for (var i = 0; i < that.listeners.length; i++) {
            var l = that.listeners[i];
            if (isDef(l.gameIsWon)) {
                l.gameIsWon();
            }
        }
    }
}
var BEGIN_NEW_ATTEMPT = 1;
var RESTORE_LAST_ATTEMPT = 2;

function SharedController() {
    var that = this;

    that.i18n = new I18n();
    that.i18n.setContext('controller');

    this.reloadPage = function () {
        window.location.href = that.gameURL;
    }

    this.isGameLoaded = function () {
        return that.gm != null;
    }

    this.setupSharedController = function () {
        var historyInterval;
        $("#tbUndo").click(function () {
            if (that.isGameActive()) {
                that.gm.undo();
            }
        }).mousedown(function (){
                clearInterval(historyInterval);
                historyInterval = setInterval(function(){
                    clearInterval(historyInterval);
                    historyInterval = setInterval(function(){
                        if (that.isGameActive()) that.gm.undo();
                        else clearInterval(historyInterval);
                    },50);
                },400);
            }).mouseup(function(){
                clearInterval(historyInterval);
            }).mouseout(function(){
                clearInterval(historyInterval);
            })

        $("#tbRedo").click(function () {
            if (that.isGameActive()) {
                that.gm.redo();
            }
        }).mousedown(function (){
                clearInterval(historyInterval);
                historyInterval = setInterval(function(){
                    clearInterval(historyInterval);
                    historyInterval = setInterval(function(){
                        if (that.isGameActive()) that.gm.redo();
                        else clearInterval(historyInterval);
                    },50);
                },400);
            }).mouseup(function(){
                clearInterval(historyInterval);
            }).mouseout(function(){
                clearInterval(historyInterval);
            })

        $("#tbNewGame").click(function () {
            if (that.isGameActive() && (that.isGameValueless() || confirm(that.i18n.get("startNewGamePrompt")))) {
                that.startNextGame();
            }
        });

        $("#tbReplay").click(function () {
            if (that.isGameActive() && (that.isGameValueless() || confirm(that.i18n.get("replayGamePrompt")))) {
                that.replay();
            }
        });
    }

    this.startNextGame = function (callbackFn) {
        that.requestGame(-1, -1, callbackFn, BEGIN_NEW_ATTEMPT);
    }

    this.replay = function () {
        that.notifyNewAttemptStarted();
        that.gm.replay();
    }

//    this.notifyNewAttemptStarted = function () {
////        alert("PARENT");
//        // ABSTRACT, TODO
//    }

    this.attemptUpdated = function (gameId, attempt) {
        if (isDef(that.__attemptUpdated)) {
            that.__attemptUpdated(gameId, attempt);
        }

//        alert(attempt.isWon());
        if (attempt.isWon()) {
            that.ui.showCongratulations(function () {
                that.cs.uploadAttempt(gameId, attempt, function (result, data) {
                    if (result && isDef(data.bonus)) {
                        that.ui.renderBonus(data.bonus);
                    }
                });
            });
        } else {
            that.cs.uploadAttempt(gameId, attempt);
        }
    }

    this.notifyEsc = function () {
        for (var i = 0; i < that.listeners.length; i++) {
            var l = that.listeners[i];
            if (isDef(l.escKeyDown)) {
                l.escKeyDown();
            }
        }
    }

    multiExtendClass(SharedController, Listener, this);
}
function ProfileClientServer() {
    var that = this;

    this.loadProfile = function (playerId, callbackFn) {
        if (playerId == null) {
            playerId = that.getUserId();
        }
        $.post("/gw/profile/loadProfile.php", {
            sessionId : that.getSessionId(),
            userId : that.getUserId(),
            playerId : playerId
        }, function (data) {
            that.setRecentData(data);
            var response = parseJSON(data);
            if (response != null && response.status == "ok") {
                callbackFn(true, response.profile);
            } else {
                callbackFn(false);
            }
        });
    };

    this.updateProfile = function (callbackFn) {
        $("#profileForm").ajaxSubmit({
            data : {
                sessionId : that.getSessionId(),
                userId : that.getUserId(),
                preupload : 0
            }, success : function (data) {
                that.setRecentData(data);
                var response = parseJSON(data);
                if (response != null && response.status == "ok") {
                    callbackFn(true, response);
                } else {
                    callbackFn(false);
                }
            }
        });
    }

    this.preuploadPhoto = function (callbackFn) {
        $("#profileForm").ajaxSubmit({
            data : {
                sessionId : that.getSessionId(),
                userId : that.getUserId(),
                preupload : 1
            }, success : function (data) {
                that.setRecentData(data);
                var response = parseJSON(data);
                if (response != null && response.status == "ok") {
                    callbackFn(true, response);
                } else {
                    callbackFn(false);
                }
            }
        });
    }

    this.loadConversations = function (callbackFn) {
        $.post("/gw/profile/loadConversations.php", {
            sessionId : that.getSessionId(),
            userId : that.getUserId()
        }, function (data) {
            that.setRecentData(data);
            var response = parseJSON(data);
            if (response != null && response.status == "ok") {
                callbackFn(true, response.conversations);
            } else {
                callbackFn(false);
            }
        });
    }

    this.sendMessage = function (recipient, msg, replyTo, fromAdmin, callbackFn) {
        $.post("/gw/profile/sendMessage.php", {
            sessionId : that.getSessionId(),
            userId : that.getUserId(),
            gameVariationId : that.getGameVariationId(),
            recipient : recipient,
            msg : msg,
            replyTo : replyTo,
            fromAdmin : fromAdmin
        }, function (data) {
            that.setRecentData(data);
            var response = parseJSON(data);
            if (response != null && response.status == "ok") {
                if (isDef(callbackFn)) {
                    callbackFn(true);
                }
            } else {
                if (isDef(callbackFn)) {
                    callbackFn(false);
                }
            }
        });
    }

    this.sendMassMsg = function (text, recipientList, callbackFn) {
        $.post("/gw/profile/sendMassMsg.php", {
            sessionId : that.getSessionId(),
            userId : that.getUserId(),
            gameVariationId : that.getGameVariationId(),
            text : text,
            recipientList : $.toJSON(recipientList)
        }, function (data) {
            that.setRecentData(data);
            var response = parseJSON(data);
            if (response != null && response.status == "ok") {
                if (isDef(callbackFn)) {
                    callbackFn(true);
                }
            } else {
                if (isDef(callbackFn)) {
                    callbackFn(false);
                }
            }
        });
    }

    this.loadConversation = function (opponent, callbackFn) {
        $.post("/gw/profile/loadConversation.php", {
            sessionId : that.getSessionId(),
            userId : that.getUserId(),
            opponent : opponent
        }, function (data) {
            that.setRecentData(data);
            var response = parseJSON(data);
            if (response != null && response.status == "ok") {
                if (isDef(callbackFn)) {
                    callbackFn(true, response);
                }
            } else {
                if (isDef(callbackFn)) {
                    callbackFn(false);
                }
            }
        });
    }

    this.loadRecipients = function (callbackFn) {
        $.post("/gw/profile/loadRecipients.php", {
            sessionId : that.getSessionId(),
            userId : that.getUserId()
        }, function (data) {
            that.setRecentData(data);
            var response = parseJSON(data);
            if (response != null && response.status == "ok") {
                if (isDef(callbackFn)) {
                    callbackFn(true, response.recipients);
                }
            } else {
                if (isDef(callbackFn)) {
                    callbackFn(false);
                }
            }
        });
    }

    this.updateUserSettings = function (settings, callbackFn) {
        cs.sendRequest("/gw/profile/updateUserSettings.php", {
            isInvisible : boolToInt(settings.isInvisible)
        }, callbackFn);
    }
}
var LOGOUT_GATEWAY = "/gw/logout.php";

var UNKNOWN_REASON = 0;
var NOT_LOGGED = 1;

function SharedClientServer() {
    var that = this;

    var recentData = "";

    var sessionId, userId, username, isGuest;

    var beaconCounter = -2;

    this.setSessionId = function (_sessionId) {
        sessionId = _sessionId;
    }

    this.getSessionId = function () {
        return sessionId;
    }

    this.setUser = function (_userId, _username, _isGuest) {
        userId = _userId;
        username = _username;
        isGuest = _isGuest;
    }

    this.getUserId = function () {
        return userId;
    }

    this.getUsername = function () {
        return username;
    }

    this.isGuest = function () {
        return isGuest;
    }

    this.isLogged = function () {
        return !isGuest;
    }

    this.isSuperUser = function () {
        return (
                userId == 40 ||
                userId == 144 ||
                userId == 19729 ||
                userId == 18136 ||
                userId == 448039 ||
                userId == 80911 ||
                userId == 460981 ||
                userId == 708734 ||
                userId == 3172467 ||
                userId == 7123667 ||
                userId == 6720145
            );
    }

    this.setRecentData = function (data) {
        recentData = data;
    };

    this.getRecentData = function () {
        return recentData;
    };

    this.goSynchronous = function () {
        jQuery.ajaxSetup({
            async : false
        });
    }

    this.sendRequest = function (gtw, params, callbackFn) {
        if (!isDef(params.sessionId)) {
            params.sessionId = that.getSessionId();
        }

        if (!isDef(params.userId)) {
            params.userId = that.getUserId();
        }

        if (!isDef(params.gameVariationId)) {
            params.gameVariationId = that.getGameVariationId();
        }

        $.post(gtw, params, function (data) {
            that.setRecentData(data);
            var response = parseJSON(data);
            if (response != null && response.status == "ok") {
                if (isDef(callbackFn)) {
                    if (isDef(response.data)) {
                        callbackFn(true, response.data);
                    } else {
                        callbackFn(true);
                    }
                }
            } else {
                var reason = UNKNOWN_REASON;

                if (response.status == "notlogged") {
                    reason = NOT_LOGGED;
                }

                if (isDef(callbackFn)) {
                    callbackFn(false, null, {
                        reason : reason
                    });
                }
            }
        });
    }

    this.logout = function (callbackFn) {
        that.sendRequest(LOGOUT_GATEWAY, {}, function (result, data) {
            if (result) {
                that.setUser(data.userId, data.username, true);
                if (isDef(callbackFn)) {
                    callbackFn(true);
                }
            } else {
                if (isDef(callbackFn)) {
                    callbackFn(false);
                }
            }
        });
    }

    this.loadGameInfo = function (gameId, callbackFn) {
        $.post("gw/loadGameInfo.php", {
            sessionId : that.getSessionId(),
            userId : that.getUserId(),
            gameId : gameId
        }, function (data) {
            that.setRecentData(data);
            var response = parseJSON(data);
            if (response.status == "ok") {
                var totalPlayed = parseInt(response.totalPlayed);
                var totalWon = parseInt(response.totalWon);
                var averageWinTime = parseInt(response.avgWinTime);
                var baTop = response.bestAttemptTop;
                var comment = response.comment;
                var fav = response.fav;

                if (isDef(callbackFn)) {
                    callbackFn(true, totalPlayed, totalWon, averageWinTime, baTop, comment, fav, response.playerList);
                }
            } else {
                if (isDef(callbackFn)) {
                    callbackFn(false);
                }
            }
        });
    };

    this.saveComment = function (gameId, comment, fav, callbackFn) {
        if (that.isLogged()) {
            this.sendRequest("gw/saveComment.php", {
                gameId : gameId,
                comment : comment,
                fav : fav
            }, callbackFn);
        }
    };

    this.sendBeacon = function (intervalSeconds, timeout, lastActivityDelta, callbackFn) {
        beaconCounter++;

        if (beaconCounter >= intervalSeconds || beaconCounter == -1) {
            beaconCounter = 0;

            $.ajax({
                url : "/gw/beacon.php",
                type : "POST",
                data : {
                    nocache : new Date().getTime(),
                    sessionId : that.getSessionId(),
                    userId : that.getUserId(),
                    gameVariationId : that.getGameVariationId(),
                    lastActivityDelta : lastActivityDelta
                },
                timeout : timeout,
                async : true
            }).done(function (data) {
                    var response = parseJSON(data);
                    if (response != null && response.status == "ok" && isDef(callbackFn)) {
                        callbackFn(true, response);
                    }
                }).error(function (jqXHR, textStatus, errorThrown) {
                    if (isDef(callbackFn)) {
                        callbackFn(false);
                    }
                });
        }
    };
}
function GuestBookRenderer(_gc, _ui, _options) {
    var that = this;

    var gc, ui, cs;

    var options = {
        "suppressScrollTop" : false,
        "gameAreaHeight" : null
    };

    var i18n = new I18n();
    i18n.setContext('guestBook');

    this.run = function () {
        if (!$("#guestBookPanel").is(":visible")) {
            cs = gc.getClientServer();
            ui.setLoading("#gbContents");
            this.loadAndRender(false);
            ui.showPanel({
                id : "guestBookPanel",
                type : BOTTOM_PANEL
            });
        } else {
            ui.hidePanel("guestBookPanel");
        }
    }

    this.loadAndRender = function (repeatLoad) {
        if (repeatLoad) {
            $("#gbLoadingImg").show();
        }
        cs.sendRequest("/gw/guestbook/gbLoadBoard.php", {}, function (result, data) {
            $("#gbLoadingImg").hide();
            if (result) {
                that.render(data);
                if (!repeatLoad) {
                    that.scrollTop();
                }
            }
        });
    }

    this.scrollTop = function () {
        //alert($("#gameArea").width() + " " + ($("#guestBookPanel").offset().top - iDiv($("#gameArea").width(), 3)));
        if (that.options.suppressScrollTop) {
            return;
        }

        var gameAreaHeight;
        if (that.options.gameAreaHeight) {
            gameAreaHeight = that.options.gameAreaHeight;
        } else {
            gameAreaHeight = $("#gameArea").height();
        }

        $("html, body").animate({
            scrollTop : $("#guestBookPanel").offset().top - iDiv(gameAreaHeight, 3)
        }, "normal");
    }

    this.render = function (data) {
        var messages = data.messages;
        var answerMessages = []

        if (messages.length > 0) {
            var messagesHTML = "<table class='smartNoBordersTable' style='width: 100%; padding-top: 25px;'>";
            for (var i in messages) {
                messages[i]._id = messages.length - i;
                if (messages[i].answerId){
                    answerMessages.push(messages[i]);
                } else {
                    messagesHTML += this.renderMessage(messages[i], messages.length - i);
                }
            }

            messagesHTML += "</table>";
        } else {
            messagesHTML = "<div class='gbNoMessagesAlert'>" + i18n.get("noMessagesAlert") + "</div>"
        }

        var suOptions = "";

        if (cs.isSuperUser()) {
            suOptions = "<div style='margin-top: 3px; margin-right: 3px; float: left;'>"
                + "<input type='checkbox' id='gbIsAdminPost'>" + i18n.get("isAdminPostLabel") + "</a>"
                + "</div>";
        }

        var postMessageHTML = "<textarea id='gbPostText' class='gbPostTextArea' rows='3'></textarea>"
            + "<img src='/img/icons/loading.gif' id='gbPostLoadingIcon' alt='" + i18n.get("postLoadingAltText") + "'/>"
            + suOptions
            + "<div id='gbPostBtn' class='constantWidthBtn'>" + i18n.get("postButtonLabel") + "</div>"
            + "<div class='clear'></div>";

        var guestBookHTML = "<h4>" + i18n.get("header") + "</h4>"
            + postMessageHTML + messagesHTML;

        $("#gbContents").empty().append(guestBookHTML);
        that.renderAnswerMessages(answerMessages);

        that.bind();

        if (cs.isSuperUser()) {
            that.bindAdminEditables(messages);
        }
    }

    this.renderAnswerMessages = function(messages){
        var answer, $div, $td, msgText;
        for (var i = messages.length-1; i >= 0; i--){
            answer = messages[i];
            $td = $($('.smartNoBordersTable tr[data-id='+answer.answerId+'] td')[0]);
            msgText = answer.text.replace(/\n/gi, "<br />");
            msgText = "<span class='gbUsername'>" + answer.username + "</span>"
                    + "&nbsp;&nbsp;&nbsp;&nbsp;"
                    + "<div class='gbAnswerText "
                    + "' id='gbMsgTextTd"+answer.msgId+"'><div>"
                    + answer.text.replace(/\n/gi, "<br />") + "</div>"
                    + "</div>";

            $div = $('<div>').html(msgText).addClass('gbAnswerMessage '+ (answer.byAdmin?"gbAdminMsg":""));

            $td.append($div);
            $('.gbAnswerButton[data-id='+answer.answerId+']').hide();
        }
    }

    this.addAnswerBlock = function(e) {
        var id = $(e.target).attr('data-id');
        $('.gbPostAnswer').remove();
        var suOptions = '';
        if (cs.isSuperUser()) {
            suOptions = "<div style='margin-top: 3px; margin-right: 3px; float: left;'>"
            + "<input type='checkbox' id='gbIsAdminAnswer' checked>" + i18n.get("isAdminPostLabel") + "</a>"
            + "</div>";
        }
        var postMessageHTML = "<textarea id='gbPostAnswerText' class='gbPostTextArea' rows='3'></textarea>"
            + "<img src='/img/icons/loading.gif' id='gbPostLoadingIcon' alt='" + i18n.get("postLoadingAltText") + "'/>"
            + suOptions
            + "<div id='gbPostAnswerBtn' class='constantWidthBtn'>" + i18n.get("postButtonLabel") + "</div>"
            + "<div class='clear'></div>";
        var $div = $('<div>');
        $div.addClass('gbPostAnswer');
        $div.html(postMessageHTML);
        var $td = $($('.smartNoBordersTable tr[data-id='+id+'] td')[0]);
        $td.append($div);

        $('#gbPostAnswerBtn').click(function(){
            var text = $.trim($("#gbPostAnswerText").val());

            if (text.length != 0) {
                cs.sendRequest("/gw/guestbook/gbPostMessage.php",
                    {
                        text : text,
                        answerId: id,
                        isAdminPost : bool2Int($("#gbIsAdminAnswer").is(":checked"))
                    }, function (result, data) {
                        $("#gbPostLoadingIcon").hide();
                        if (result) {
                            that.render(data);
                        }
                    });
                $('.gbPostAnswer').remove();
                $("#gbPostLoadingIcon").show();
            }
        });
        console.log($(e.target).attr('data-id'));
    }

    this.bindAdminEditables = function (messages) {
        for (var i in messages) {
            var msg = messages[i];
            var msgId = msg.msgId;

            //if (msg.byAdmin) {
            $("#gbMsgTextTd" + msgId).dblclick(function (msg) {
                return function () {
                    that.makeMessageEditable(msg);
                }
            }(msg));
            //}
        }
    }

    this.makeMessageEditable = function (msg) {
        var editAreaHTML = "<textarea style='width: 100%' rows='5' id='gbEditAreaText" + msg.msgId + "'>"
            + msg.text
            + "</textarea>"
            + "<br/>"
            + "<input type='submit' value='" + i18n.get("saveChangesButtonLabel") + "' id='gbEditAreaSave" + msg.msgId + "'></input>"
            + "<input type='submit' value='" + "Удалить" + "' id='gbEditAreaDelete" + msg.msgId + "'></input>"
            + "<input type='submit' style='float: right;' value='" + "Отмена" + "' id='gbEditAreaCancel" + msg.msgId + "'></input>";

        $("#gbMsgTextTd" + msg.msgId).empty().append(editAreaHTML);

        $("#gbEditAreaSave" + msg.msgId).click(function () {
            var newText = $("#gbEditAreaText" + msg.msgId).val();

            cs.sendRequest("/gw/guestbook/gbEditMessage.php", {
                msgId : msg.msgId,
                newText : newText
            }, function (result, data) {
                if (result) {
                    that.render(data);
                }
            });
        });

        $("#gbEditAreaDelete" + msg.msgId).click(function () {
            if (confirm("Удалить сообщение ==" + msg.text + "== от " + msg.username + "?")) {
                cs.sendRequest("/gw/guestbook/gbDeleteMessage.php", {
                    msgId : msg.msgId
                }, function (result, data) {
                    if (result) {
                        that.render(data);
                    }
                });
            }
        });

        $("#gbEditAreaCancel" + msg.msgId).click(function () {
            that.loadAndRender(true);
        });
    }

    this.bind = function () {
        $("#gbPostBtn").click(function () {
            that.postMessage();
        });

        $('.gbAnswerButton').click(that.addAnswerBlock);
    }

    that.postMessage = function () {
        var text = $.trim($("#gbPostText").val());

        if (text.length == 0) {
            alert(i18n.get("emptyMsgAlert"));
        } else {
            $("#gbPostLoadingIcon").show();
            cs.sendRequest("/gw/guestbook/gbPostMessage.php",
                {
                    text : text,
                    isAdminPost : bool2Int($("#gbIsAdminPost").is(":checked"))
                }, function (result, data) {
                    $("#gbPostLoadingIcon").hide();
                    if (result) {
                        that.render(data);
                        that.scrollTop();
                    }
                });
        }
    }

    this.renderMessage = function (msg) {
        var id = msg.msgId;
        var replyDiv = "";
        if (msg.replyTS > 0) {
            replyDiv = "<div class='gbReplyText gbAdminMsg'>"
                + "<b>" + i18n.get("adminUsername") + ": </b>"
                + msg.replyText
                + "</div>";
        }

        var msgText = msg.text.replace(/\n/gi, "<br />");
        msgText = "<div class='gbMessageText "+ (msg.byAdmin ? "gbAdminMsg" : "")
        + "' id='gbMsgTextTd" + msg.msgId + "'> <div>" + msgText + "</div>"
        +  (cs.isSuperUser()?"<span class='gbAnswerButton' data-id='"+ msg.msgId +"'>Ответить</span>":"")
        + "</div>" ;

        var msgHTML = "<tr>"
            + "<td class='gbUsernameDateTd'>"
            + "<span class='gbUsername'>" + msg.username + "</span>"
            + "&nbsp;&nbsp;&nbsp;&nbsp;"
            + "<span class='gbDate'>" + formatDateRu(msg.timestamp) + "</span>"
            + '<span class="gbMessageNumber">#'+msg._id+'</span>'
            + "</td>"
            + "</tr>"
            + "<tr data-id='"+ msg.msgId +"'>"
            + "<td class='gbMsgTextTd' >" + msgText + replyDiv
            + "</td>"
            + "<td style='position: relative'></td>"
            + "</tr>";

        return msgHTML;
    }

    this.bindAll = function () {
//        alert($("#gbShow").is(":visible"));

        $("#gbShow").click(function () {
            that.run();
        });

        ui.bindCloseIcon("#gbCloseIcon", "guestBookPanel");
    }

    gc = _gc;
    ui = _ui;

    if (isDef(_options) && _options != null) {
        mergeObj(options, _options);
    }

    that.options = options;

    this.bindAll();
}
var GTW_UPDATE_USER_SETTINGS = "/gw/shared/updateUserSettings.php";

var PM_PLAY_RANDOM = 0;
var PM_PLAY_SUCC = 1;

var GT_ALL = 0;
var GT_EASY = 1;
var GT_NORMAL = 2;
var GT_HARD = 3;
var GT_UNSOLVED = 4;
var GT_UNPLAYED = 5;

var PF_ALL = 0;
var PF_NOTWON = 1;
var PF_NOTPLAYED = 2;

function ParametersManager(_gc, _ui, _options) {
    var that = this;

    var gc, ui, cs;

    var playMode;
    var gameType;
    var playFilter;

    var options = {};

    var i18n = new I18n();
    i18n.setContext('parameters');

    this.resetSettings = function () {
        if (isDef(options.defaultPlayMode)) {
            playMode = options.defaultPlayMode;
        } else {
            playMode = PM_PLAY_RANDOM;
        }
        gameType = GT_ALL;
        playFilter = PF_ALL;
    }

    this.run = function () {
        $("#gpThemeList").val(that.currentTheme);

        cs = gc.getClientServer();
        if (!$("#parametersPanel").is(":visible")) {
            this.setAndShow();
        }
        else {
            ui.hidePanel("parametersPanel");
        }
    }

    this.setAndShow = function () {
        if (playMode == PM_PLAY_RANDOM) {
            $("#playRandomOption").attr("checked", true);
        } else if (playMode == PM_PLAY_SUCC) {
            $("#playSuccOption").attr("checked", true);
        }

        if (gameType == GT_ALL) {
            $("#playAll").attr("checked", true);
        } else if (gameType == GT_EASY) {
            $("#playEasy").attr("checked", true);
        } else if (gameType == GT_NORMAL) {
            $("#playNormal").attr("checked", true);
        } else if (gameType == GT_HARD) {
            $("#playHard").attr("checked", true);
        } else if (gameType == GT_UNSOLVED) {
            $("#playUnsolved").attr("checked", true);
        } else if (gameType == GT_UNPLAYED) {
            $("#playUnplayed").attr("checked", true);
        }

        $("#dontServePlayedOption").attr("checked", playFilter == PF_NOTPLAYED);
        $("#dontServeWonGamesOption").attr("checked", playFilter == PF_NOTWON);

        $("#gameIdTextField").val("");

        if (options != null && isDef(options.allowToChooseGameType) && !options.allowToChooseGameType) {
            $("#chooseGameTypeSection").hide();

            if (!(isDef(options.allowToChooseCardTheme) && options.allowToChooseCardTheme))
            $("#gpCommitCancelSection").css("margin-top", "30px");
        }

        ui.showPanel({
            id : "parametersPanel",
            type : OVER_FIELD_PANEL
        });
    }

    this.bindAll = function () {
        $("#dontServePlayedOption").change(function () {
            if ($("#dontServePlayedOption").attr("checked")) {
                $("#dontServeWonGamesOption").attr("checked", false);
            }
        });

        $("#dontServeWonGamesOption").change(function () {
            if ($("#dontServeWonGamesOption").attr("checked")) {
                $("#dontServePlayedOption").attr("checked", false);
            }
        });

        $("#gpCommit").bind("click", function () {
            ui.hidePanel("parametersPanel");
            that.updateUserSettings();
            if ($("#gameIdTextField").val() != "") {
                var gameId = parseInt(trimLeadingZeros($("#gameIdTextField").val()));
                if (gameId >= gc.getLowerGameIdBound() && gameId <= gc.getHigherGameIdBound() ||
                    cs.isSuperUser() && gc.isValidGameId(gameId)) {
                    gc.requestGame(gameId);
                } else {
                    ui.alert(
                        i18n.format(
                            "gameIdRangeAlert",
                            gc.getLowerGameIdBound(),
                            gc.getHigherGameIdBound()
                        )
                    );
                }
            } else {
                // gc.startNextGame();
            }

            if ($("#gpThemeList option:selected").val() != that.currentTheme) {
                that.gc.redirectRelative("?theme=" + $("#gpThemeList option:selected").val());
//                window.location = "/kosynka/?theme=" + $("#gpThemeList option:selected").val();
            }
        });

        $("#gpCloseIcon").bind("click", function () {
            ui.hidePanel("parametersPanel");
            that.updateUserSettings();
        });

        $("#gpCancel").bind("click", function () {
            ui.hidePanel("parametersPanel");
        });

        $("#gpThemeList").change(function () {

        });
    }

    this.updateUserSettings = function () {
        if ($("#dontServePlayedOption").is(":checked")) {
            playFilter = PF_NOTPLAYED;
        } else if ($("#dontServeWonGamesOption").is(":checked")) {
            playFilter = PF_NOTWON;
        } else {
            playFilter = PF_ALL;
        }

        if ($("#playRandomOption").is(":checked")) {
            playMode = PM_PLAY_RANDOM;
        } else if ($("#playSuccOption").is(":checked")) {
            playMode = PM_PLAY_SUCC;
        }

        if ($("#playAll").is(":checked")) {
            gameType = GT_ALL;
        } else if ($("#playHard").is(":checked")) {
            gameType = GT_HARD;
        } else if ($("#playNormal").is(":checked")) {
            gameType = GT_NORMAL;
        } else if ($("#playEasy").is(":checked")) {
            gameType = GT_EASY;
        } else if ($("#playUnsolved").is(":checked")) {
            gameType = GT_UNSOLVED;
        } else if ($("#playUnplayed").is(":checked")) {
            gameType = GT_UNPLAYED;
        }

        if (isDef(that.gc.resetNewGameLister)) {
            that.gc.resetNewGameLister();
        }

        that.uploadUserSettings();
    }

    this.uploadUserSettings = function () {
        var settings = new Object();
        settings.playMode = playMode;
        settings.gameType = that.getGameType();
        settings.playFilter = playFilter;

        var JSONSettings = $.toJSON(settings);

        cs.sendRequest(GTW_UPDATE_USER_SETTINGS, {
            settings : JSONSettings
        });
    }

    this.applySettings = function (settings) {
        var settingsObj = parseJSON(settings);
        if (settingsObj != null) {
            if (isDef(settingsObj.playMode)) {
                playMode = settingsObj.playMode;
            }
            if (isDef(settingsObj.gameType)) {
                gameType = settingsObj.gameType;

                if (gameType == GT_UNPLAYED) {
                    gameType = GT_UNSOLVED;
                }
            }
            if (isDef(settingsObj.playFilter)) {
                playFilter = settingsObj.playFilter;

                if (playFilter == PF_NOTPLAYED) {
                    playFilter = PF_ALL;
                }
            }
        }
    }

    this.getPlayMode = function () {
        return playMode;
    }

    this.getGameType = function () {
        if (options != null && isDef(options.allowToChooseGameType) && !options.allowToChooseGameType) {
            return GT_ALL;
        }

        return gameType;
    }

    this.getPlayFilter = function () {
        return playFilter;
    }

    gc = _gc;
    ui = _ui;

    that.gc = gc;
    that.ui = ui;

    if (isDef(_options) && _options != null) {
        options = _options;
    }

    that.options = options;

    that.currentTheme = "windows";

    if (isDef(that.options.allowToChooseCardTheme) && that.options.allowToChooseCardTheme) {
        $("#chooseCardThemeSection").show();
    }

    if (isDef(that.options.currentTheme)) {
        that.currentTheme = that.options.currentTheme;
    }

    this.bindAll();
    this.resetSettings();
}
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
var GTW_HISTORY = "/gw/shared/loadHistory.php";
var GTW_SAVE_COMMENT = "/gw/shared/saveComment.php";

var GH_GAME_LIMIT = 31999;

var GH_SORT_BY_GAME_ID = 0;
var GH_SORT_BY_WIN_TIME_RANK = 1;
var GH_SORT_BY_BEST_ATTEMPT_RANK = 2;
var GH_SORT_BY_DATE = 3;

var NOT_WON_STATUS = 0;
var WIN_STATUS = 1;

var GH_SHOW_ALL_FILTER = 0;
var GH_SHOW_ONLY_FAV_FILTER = 1;
var GH_SHOW_ONLY_UNSOLVED_FILTER = 2;

var HISTORY_SHOW_SHORTCUTS_AFTER = 35;

var DESC = false;
var ASC = true;

var HISTORY_PAGINATOR_COUNT = 250;

function HistoryRenderer(_gc, _ui, _options) {
    var that = this;

    var activeEditedRow;

    var gc, ui, cs;

    var filter = GH_SHOW_ALL_FILTER;
    var sortBy = GH_SORT_BY_DATE;
    var order = DESC;

    var CONTENTS_ID = "#historyContents";

    var options = {
        bindCPButton : false,
        showLabels : false,
        showDays : true,
        showBestAttemptRank : true,
        gameIdLabel : "hand",
        gameIdWidth : "12%"
    };

    var i18n = new I18n();
    i18n.setContext('history');

    this.run = function () {
        if (!$("#historyPanel").is(":visible")) {
            cs = gc.getClientServer();
            ui.setLoading("#historyContents");
            that.paginator = new Paginator(0, HISTORY_PAGINATOR_COUNT, 0);
            that.paginator.addListener(that);
            this.loadAndRender(false);
            ui.showPanel({id : "historyPanel",
                type : BOTTOM_PANEL,
                onClose : function () {
                    if (activeEditedRow != null) {
                        that.saveComment(activeEditedRow);
                    }
                }});
        } else {
            ui.hidePanel("historyPanel");
        }
    }

    this.currentPositionChanged = function () {
        that.loadAndRender(true, true);
    }

    this.loadAndRender = function (repeatLoad, forceScroll) {
        forceScroll = ifDef(forceScroll, false);

        if (repeatLoad) {
            $("#ghLoadingImg").show();
        }

        if (!forceScroll) { // TODO, HACK, REWORK
            that.paginator.reset();
        }

        cs.sendRequest(GTW_HISTORY, {
            sortBy : sortBy,
            order : boolToInt(order),
            filter : filter,
            currentPosition : that.paginator.currentPosition,
            currentCount : that.paginator.currentCount
        }, function (result, data, error) {
            $("#ghLoadingImg").hide();
            if (result) {
                that.render(data);
                if (!repeatLoad || forceScroll) {
                    $("html, body").animate({
                        scrollTop : $("#historyPanel").offset().top - 1 * iDiv($("#gameArea").width(), 5)
                    }, "normal");
                }
            } else {
                that.ui.renderErrorReason(CONTENTS_ID, error.reason);
            }
        });
    }

    this.generateHeader = function (id, title, columnSortBy) {
        var headerStyle = "padding-top: 8px;";

        return "<span"
            + (sortBy == columnSortBy ? " class='activeSortHeader actionText4'" : " class='actionText4'")
            + " id='" + id + "'>" + title // + "<br />"
            + (sortBy == columnSortBy ? ui.getOrderHint(order) : "")
            + "</span>";

//            + (sortBy == columnSortBy ?
//            ui.serverSortArrowsImg(order, headerStyle) + ui.getOrderHint(order) :
//            " &nbsp;<img style='" + headerStyle + "' src='/img/icons/sort-both.png' alt=''/>")
    }

    this.bindHeaderAction = function (jId, columnSortBy, columnDefaultOrder) {
        $(jId).click(function () {
            if (sortBy != columnSortBy) {
                sortBy = columnSortBy;
                order = columnDefaultOrder;
            } else {
                order = !order;
            }
            that.loadAndRender(true);
        });
    }

    this.generateSortImg = function (id, columnSortBy) {
        return (sortBy == columnSortBy ?
            ui.serverSortArrowsImg(order, "", id) :
            " &nbsp;<img src='/img/icons/sort-both.png' id='" + id + "' alt=''/>");
    }

    this.render = function (data) {
        var history = data.history;
        var userRankBySolvedCount = data.userRankBySolvedCount;
        var total = data.total;

        that.paginator.setTotal(total);

        // that.paginator.next(); // TODO, HACK

        activeEditedRow = null;

        var gameIdHeader = this.generateHeader("ghSortByGameId", i18n.get("gameIdLabel", that.options.gameIdLabel), GH_SORT_BY_GAME_ID);
        var winTimeRankHeader = this.generateHeader("ghSortByWinTimeRank", i18n.get("wtLabel"), GH_SORT_BY_WIN_TIME_RANK);
        var bestAttemptRankHeader = this.generateHeader("ghSortByBestAttemptRank", i18n.get("baLabel"), GH_SORT_BY_BEST_ATTEMPT_RANK);
        var dateHeader = this.generateHeader("ghSortByDate", options.showDays ? i18n.get("dateDaysLabel") : i18n.get("dateLabel"), GH_SORT_BY_DATE);

        var tableContents = "<table class='standartTable' style='clear:both;' " +
            " width='100%' border='0' vspace='0' cellspacing='0' hspace='0'><tr style='height: 42px;'>"
            + "<th colspan='" + (that.options.showLabels ? 3 : 2) + "' class='secondLevelRow nonSelectable' width='" + that.options.gameIdWidth + "'>" + gameIdHeader + "</th>"
            + "<th class='secondLevelRow'>" + i18n.get("commentLabel") + "</th>"
            + "<th class='secondLevelRow nonSelectable' colspan='3' width='15%'>" + winTimeRankHeader + "</th>"
            + (options.showBestAttemptRank ? ("<th class='secondLevelRow nonSelectable' colspan='3' width='15%' >" + bestAttemptRankHeader + "</th>") : "")
            + "<th class='secondLevelRow nonSelectable' width='1%'>" + dateHeader + "</th>"
            + "</tr>";

        tableContents += "<tr class='auxRow'>"
            + "<td class='ghArrows' colspan='" + (that.options.showLabels ? 3 : 2) + "'>"
            + that.generateSortImg("ghSortByGameIdImg", GH_SORT_BY_GAME_ID)
            + "</td>"
            + "<td class='ghNoArrows'>&nbsp;</td>"
            + "<td class='ghArrows' colspan='3'>"
            + that.generateSortImg("ghSortByWinTimeRankImg", GH_SORT_BY_WIN_TIME_RANK)
            + "</td>"
            + (options.showBestAttemptRank ? ("<td class='ghArrows' colspan='3'>"
            + that.generateSortImg("ghSortByBestAttemptRankImg", GH_SORT_BY_BEST_ATTEMPT_RANK)
            + "</td>") : "")
            + "<td class='ghArrows'>"
            + that.generateSortImg("ghSortByDateImg", GH_SORT_BY_DATE)
            + "</td>"
            + "</tr>";

        var totalRows = 0;
        var totalPlayed = 0;
        var totalWon = 0;
        var totalWinTime = 0;

//        var strRankBySolvedCount = "";
//
//        if (rankBySolvedCount > 0) {
//            strRankBySolvedCount = "&nbsp;&nbsp;(" + rankBySolvedCount + " место)";
//        }

        for (var i = 0; i < history.length; i++) {
            var gh = history[i];

            var strTimestamp = formatDate(gh.timestamp);

            if (gh.status == WIN_STATUS && gh.peek != 1) {
                totalWon++;
                totalWinTime += gh.winTime;
            }

            totalPlayed++;

            var rowClass = "";

            if (gh.status == NOT_WON_STATUS) {
                rowClass = " rowPlayed ";
            } else {
                rowClass = " rowWon ";
            }

            var strGameId;

            if (filter == GH_SHOW_ONLY_FAV_FILTER && gh.fav == 0) {
                continue;
            }

            if (filter == GH_SHOW_ONLY_UNSOLVED_FILTER && gh.status == WIN_STATUS) {
                continue;
            }

            totalRows++;

            strGameId = "<span " + (gh.gameId >= GH_GAME_LIMIT ? "style='color: #C42E21;'" : "")
                + " class='linkAlike nonSelectable' id='ghPlay"
                + gh.gameId
                + "'>"
                + gh.gameId
                + "</span>";

            var strWinTimeRank = "—", strBestAttemptRank = "—";

            if (gh.status == WIN_STATUS && gh.peek != 1) {
                strWinTimeRank = gh.wtRank;
                strBestAttemptRank = gh.baRank;
            }

            var winTimeAlignment = " style='text-align: right;'";

            if (gh.winTime == 0) {
                winTimeAlignment = " style='text-align: right; color: #777;'";
            }

            var bestAttemptTimeAlignment = " style='text-align: right;'";

            if (gh.status != WIN_STATUS || gh.peek) {
                bestAttemptTimeAlignment = " style='text-align: center;'";
            }

            if (that.options.showLabels) {
                var labelParagraph = "<p style='display: inline; color: #777;'>" + gh.label + "&nbsp;</p>";
            }

            tableContents = tableContents
                + "<tr class='ghRow" + rowClass + "' id='ghRow" + gh.gameId + "' " + ">"
                + "<td class='noRightBorder'>"
                + "<img id='ghFav" + gh.gameId + "' " + (gh.fav == 0 ? "style='display: none;'" : "") + " class='ghFavImg' src='/img/icons/fav-2.png' alt=''/>"
                + "</td>"
                + "<td id='ghGameIdTd" + gh.gameId + "' style='cursor: pointer; white-space: nowrap; padding-left: 5px;'" + (that.options.showLabels ? " class='noRightBorder'" : "") + ">"
                + "<p class='ghGameId nonSelectable' style='inline;'>&nbsp;"
                + strGameId
                + "</p>"
                + "</td>"
                + (that.options.showLabels
                ? "<td id='ghLabelTd" + gh.gameId + "' style='white-space: nowrap; cursor: pointer;'>" + labelParagraph + "</td>"
                : "")
                + "<td id='ghCommentTd"
                + gh.gameId
                + "'><p>"
                + that.generateFullComment(gh)
                + "</p></td>"
                + "<td class='noRightBorder' " + winTimeAlignment + ">" + (gh.winTime == 0 ? "<span>" + formatGameTimeMS(gh.totalGameTime) + "</span>" : formatGameTimeMS(gh.winTime)) + "</td>"
                + "<td class='noRightBorder'>/</td>"
                + (strWinTimeRank==0?'<td title="ваше место будет вычислено позднее">—</td>':'<td>'+strWinTimeRank + '</td>')
                + (options.showBestAttemptRank ?
                ("<td class='noRightBorder' " + bestAttemptTimeAlignment + ">" + (gh.bestAttemptTime == 0 ? "—" : formatGameTimeMS(gh.bestAttemptTime)) + "</td>"
                    + "<td class='noRightBorder'>/</td>"
                    + (strBestAttemptRank==0?'<td title="ваше место будет вычислено позднее">—</td>':'<td>'+strBestAttemptRank + '</td>')) : "")
                + "<td><p>" + strTimestamp + (options.showDays ? "&nbsp;/&nbsp;" + (gh.playDays + 1) : "")
                + "</p></td></tr>";
        }

        if (history.length == 0) {
            tableContents += "<tr><td colspan='10'><div class='ghNoDataAlert'>" + i18n.get("noGamesByFilterAlert") + "</div></td></tr>";
        }

        tableContents = tableContents + "</table>";

//        if (totalRows > 15) {
//            $("#historyAuxPanel").show();
//        } else {
//            $("#historyAuxPanel").hide();
//        }

        $("#historyContents").empty();

        if (history.length == 0 && filter == GH_SHOW_ALL_FILTER) {
            $("#historyContents").append("<div class='ghNoDataAlert'>" + i18n.get("noGamesAlert") + "</div>");
        } else {
            $("#historyContents")
                .append(
                "<p class='ghFilterPanel'>"
                    + "<span class='auxText'>" + i18n.get("filtersLabel") + ":&nbsp;&nbsp;&nbsp;</span><span class="
                    + (filter != GH_SHOW_ALL_FILTER ? "'linkAlike'"
                    : "'linkAlikeDisabled'")
                    + " id='ghShowAll'>" + i18n.get("allFilterLabel") + "</span>&nbsp;&nbsp;&nbsp;"
                    + "<span class="
                    + (filter != GH_SHOW_ONLY_FAV_FILTER ? "'linkAlike'"
                    : "'linkAlikeDisabled'")
                    + " id='ghShowOnlyFav'>" + i18n.get("favoritesFilterLabel") + "</span>&nbsp;&nbsp;&nbsp;"
                    + "<span class="
                    + (filter != GH_SHOW_ONLY_UNSOLVED_FILTER ? "'linkAlike'"
                    : "'linkAlikeDisabled'")
                    + " id='ghShowOnlyUnsolved'>" + i18n.get("unsolvedFilterLabel") + "</span>"
                    + "<img id='ghLoadingImg' alt='" + i18n.get("loadingAltText") + "' src='/img/icons/loading.gif'>"
                    + "</p>");

//        $("#historyContents")
//            .append(
//            "<p class='ghSummaryStats'>"
//                + "решено: " + totalWon + "&nbsp;&nbsp;&nbsp;&nbsp;"
//                + "сыграно: " + totalPlayed + strRankBySolvedCount
//                + "</p>");

            $("#historyContents").append(tableContents);
        }

        var paginatorRenderer = new PaginatorRenderer(that.paginator, "userHistory");

        $("#historyContents").append(paginatorRenderer.render());

        paginatorRenderer.bindEvents();

        var averageWinTime;
        if (totalWon > 0) {
            averageWinTime = Math.round(totalWinTime / totalWon);
        } else {
            averageWinTime = 0;
        }

        // margin-bottom: -10px;
//        $("#historyContents").append(
//            "<div style='margin-left: 5px; margin-top: 20px;'>"
//                + "<p>Среднее время решения: " + (averageWinTime == 0 ? "—" : formatGameTimeMS(averageWinTime)) + "</p></div>");

        if (history.length > HISTORY_SHOW_SHORTCUTS_AFTER) {
            var auxAppendix = "<div style='padding-top: 10px; margin-top: 20px; background-color: white;  border-top: 1px dashed #CCC;'>";
            auxAppendix += "<div class='bspAuxBtn' style='float: left;' id='historyScroll'>[" + i18n.get("auxScrollTop") + "]</div>";
            auxAppendix += "<div class='bspAuxBtn' style='float: right;' id='historyClose'>[" + i18n.get("auxClose") + "]</div>";
            auxAppendix += "<div class='clear'></div>";
            auxAppendix += "</div>";

            $("#historyContents").append(auxAppendix);

            $("#historyScroll").click(function () {
                $("html, body").animate({scrollTop : $("#historyPanel").offset().top - iDiv($("#gameArea").width(), 3)});
            });

            $("#historyClose").click(function () {
                ui.hidePanel("historyPanel");
            });
        }

        $("#ghShowAll").click(function () {
            if (filter != GH_SHOW_ALL_FILTER) {
                filter = GH_SHOW_ALL_FILTER;
//                that.paginator.reset();
                that.loadAndRender(true);
            }
        });

        $("#ghShowOnlyFav").click(function () {
            if (filter != GH_SHOW_ONLY_FAV_FILTER) {
                filter = GH_SHOW_ONLY_FAV_FILTER;
//                that.paginator.reset();
                that.loadAndRender(true);
            }
        });

        $("#ghShowOnlyUnsolved").click(function () {
            if (filter != GH_SHOW_ONLY_UNSOLVED_FILTER) {
                filter = GH_SHOW_ONLY_UNSOLVED_FILTER;
//                that.paginator.reset();
                that.loadAndRender(true);
            }
        });

        that.bindActions(history);
    }

    this.bindActions = function (history) {
        for (var i = 0; i < history.length; i++) {
            var gh = history[i];

            $("#ghGameIdTd" + gh.gameId
                + (that.options.showLabels
                ? (", #ghLabelTd" + gh.gameId)
                : ""))
                .click(function (gh) {
                return function () {
                    gc.requestGame(gh.gameId, null, function () {
//                        $("html, body").animate({ scrollTop : 0 }, "fast");
                        ui.showGameInfo(gh.gameId, false);
                    });
                }
            }(gh));

            $("#ghCommentTd" + gh.gameId).dblclick(function (gh) {
                return function () {
                    that.addCommentEditor(gh);
                }
            }(gh));
        }

        that.bindHeaderAction("#ghSortByGameId, #ghSortByGameIdImg",
            GH_SORT_BY_GAME_ID, true);

        that.bindHeaderAction("#ghSortByWinTimeRank, #ghSortByWinTimeRankImg",
            GH_SORT_BY_WIN_TIME_RANK, true);

        that.bindHeaderAction("#ghSortByBestAttemptRank, #ghSortByBestAttemptRankImg",
            GH_SORT_BY_BEST_ATTEMPT_RANK, true);

        that.bindHeaderAction("#ghSortByDate, #ghSortByDateImg",
            GH_SORT_BY_DATE, false);
    }

    this.addCommentEditor = function (gh) {
        if ($("#ghCommentTd" + gh.gameId).html().indexOf("textarea") != -1) {
            return;
        }

        var checked = (gh.fav == 1) ? "checked" : 0;

        if (activeEditedRow != null) {
            that.saveComment(activeEditedRow);
        }

        activeEditedRow = gh;

        $("#ghCommentTd" + gh.gameId).empty().append("<div class='ghCommentEditArea'>"
            + "<textarea id='ghGameComment" + gh.gameId + "' rows='10' style='width:98%'></textarea>"
            + "<br /><input type='checkbox' id='ghInFavorites"
            + gh.gameId + "'" + checked + "/>" + i18n.get("addToFavoritesCheckBoxLabel")
            + "<br /> <br />"
            + "<div id='ghSaveCommentBtn" + gh.gameId + "' class='button nonSelectable'>" + i18n.get("saveButtonLabel") + "</div>"
            + "<div id='ghDiscardCommentBtn" + gh.gameId + "' class='button nonSelectable'>" + i18n.get("dismissButtonLabel") + "</div>"
            + "<div class='clear'></div>"
            + "</div>");

        $("#ghGameComment" + gh.gameId).focus().val("").val(gh.comment);

        $("#ghSaveCommentBtn" + gh.gameId).click(function () {
            that.saveComment(gh);
        });

        $("#ghDiscardCommentBtn" + gh.gameId).click(function () {
            $("#ghCommentTd" + gh.gameId).empty().append(that.generateFullComment(gh));
            activeEditedRow = null;
        });
    }

    this.generateFullComment = function (gh) {
        var fullCommentString = "";

        if (gh.peek != 0) {
            fullCommentString += " [" + i18n.get("pokeSolutionShortLabel") + "] ";
        }

        fullCommentString += that.formatComment(gh.comment);

        return fullCommentString;
    }

    this.formatComment = function (comment) {
        var newComment = comment.replace(/\n/gi, "<br />");
        if (newComment.length == 0)
            return "";
        else {
            var pieces = comment.split(" ");
            var totalLength = 0;
            var i = 0;
            while (i < pieces.length && totalLength + pieces[i].length <= 22) {
                totalLength += pieces[i].length;
                if (i < pieces.length - 1)
                    totalLength++;
                i++;
            }
            totalLength = 0;
            while (i < pieces.length && totalLength + pieces[i].length <= 35) {
                totalLength += pieces[i].length;
                if (i < pieces.length - 1)
                    totalLength++;
                i++;
            }
            if (i > 0) {
                for (var j = 0; j < pieces.length; j++) {
                    pieces[j] = pieces[j].substr(0, 27);
                }
                return that.join(pieces, i);
            }
            else if (i == 0 && pieces.length > 0)
                return pieces[0].substr(0, 25) + "...";
        }
    }

    this.join = function (pieces, maxLength) {
        var result = "";
        for (var i = 0; i < Math.min(maxLength, pieces.length); i++) {
            if (result != "")
                result += " ";
            result += pieces[i];
        }
        if (maxLength < pieces.length)
            result += "...";
        return result;
    }

    that.saveComment = function (gh) {
        var newComment = $("#ghGameComment" + gh.gameId).val();
        var iNewFav = $("#ghInFavorites" + gh.gameId).is(":checked") ? 1 : 0;

        gc.getClientServer().sendRequest(GTW_SAVE_COMMENT, {
            gameId : gh.gameId,
            comment : newComment,
            fav : iNewFav
        }, function (result) {
            if (!result) {
                ; // TODO: notify user
            }
        });

        that.gsUpdateRow(gh, newComment, iNewFav);

        activeEditedRow = null;
    }

    that.gsUpdateRow = function (gh, newComment, newFav) {
        gh.comment = newComment;
        gh.fav = newFav;

        if (gh.fav) {
            $("#ghFav" + gh.gameId).show();
        } else {
            $("#ghFav" + gh.gameId).hide();
        }

        $("#ghCommentTd" + gh.gameId).empty().append(that.generateFullComment(gh));
    }

//    this.onLogout = function () {
//        $("#bbHistory").empty().append("<span style='color: #777;'>История</span>");
////            + "<br/>"
////            + "<span style='color: #C42E21; font-weight: bold; font-size: 7pt;'>зарег. польз.</span>");
//    }
//
//    this.onLogin = function () {
//        $("#bbHistory").empty().append("История");
//    }

    this.bindAll = function () {
        $("#closeHistoryPanel").click(function () {
            ui.hidePanel("historyPanel");
        });

        if (isDef(that.options.bindCPButton) && that.options.bindCPButton) {
            $("#bbHistory").click(function () {
                //if (gc.getClientServer().isLogged()) {
                that.run();
//                } else {
//                    that.gc.doNotLoggedAction();
//                }
            });
        }
    }

    gc = _gc;
    ui = _ui;

    that.gc = gc;
    that.ui = ui;

    if (isDef(_options) && _options != null) {
        mergeObj(options, _options);
    }

    that.options = options;

    that.bindAll();
}
function BonusRenderer(_gc, _ui, _options) {
    var that = this;

    var gc, ui, cs;

    var options = null;

    var i18n = new I18n();
    i18n.setContext('bonus');

    this.render = function (bonus) {
        if ($("#winBox").is(":visible")) {
            $("#bonusNotice").empty();
            if (bonus.winBonus == "fastest") {
                $("#bonusNotice").append("<p>" + i18n.get("fastestBonus") + "</p>");
            } else if (bonus.winBonus == "first") {
                $("#bonusNotice").append("<p>" + i18n.get("firstBonus") + "</p>");
            }

            if (bonus.winBonus != "") {
                var deltaStr;

                if (bonus.winBonus != "first" && bonus.oldGameInfo.avgWinTime > 0) {
                    if (bonus.newUserRanks.winTime < bonus.oldGameInfo.avgWinTime) {
                        deltaStr = "<br/>(" + i18n.get("lessThanAveragePrefix") + " "
                            + formatGameTimeMS(bonus.oldGameInfo.avgWinTime - bonus.newUserRanks.winTime) + ")";
                    } else {
                        deltaStr = "<br/>(" + i18n.get("greaterThanAveragePrefix") + " "
                            + formatGameTimeMS(bonus.newUserRanks.winTime - bonus.oldGameInfo.avgWinTime) + ")";
                    }
                } else {
                    deltaStr = "";
                }

                $("#bonusNotice").append("<p>" + i18n.get("winTimeRankLabel") + ": "
                    + (bonus.newUserRanks.wtRank != 0?bonus.newUserRanks.wtRank+ " / ":"")
                    + formatGameTimeMS(bonus.newUserRanks.winTime)
                    + deltaStr + "</p>");
            }

            if (bonus.winBonus != "first" && bonus.attemptBonus == "best_attempt") {
                $("#bonusNotice").append("<p style='margin-top: 15px;'>"
                    + i18n.get("bestAttemptBonus")
                    + "</p>");
            }

            if (bonus.winBonus != "first" && bonus.attemptBonus == "better_attempt") {
                $("#bonusNotice").append("<p style='margin-top: 15px;'>"
                    + i18n.get("betterAttemptBonus")
                    + "</p>");
            }

            if (bonus.newUserRanks.baRank != 0 && bonus.attemptBonus != "") {
                $("#bonusNotice").append("<p>" + i18n.get("bestAttemptRankLabel") + ": " + bonus.newUserRanks.baRank
                    + " / " + formatGameTimeMS(bonus.newUserRanks.bestAttemptTime) + "</p>");
            }

            if (bonus.winBonus == "" && bonus.attemptBonus != "") {
                if (bonus.oldBestAttemptRank <= bonus.newUserRanks.baRank) {
                    $("#bonusNotice").append("<p>"
                        + i18n.get("bestAttemptRankNoChangeNotice")
                        + "</p>");
                } else {
                    var prepositionRU = i18n.get("rangeFromPrepositionAlpha");
                    if (bonus.oldBestAttemptRank == 2) {
                        prepositionRU = i18n.get("rangeFromPrepositionBeta");
                    }
                    $("#bonusNotice").append(
                        i18n.format(
                            "bestAttemptRankChangeNotice",
                            bonus.oldBestAttemptRank,
                            bonus.newUserRanks.baRank,
                            prepositionRU
                        )
                    );
                }
            }

            if (bonus.newRankBySolvedCount < bonus.oldRankBySolvedCount) {
                var prepositionRU = i18n.get("rangeFromPrepositionAlpha");

                if (bonus.oldRankBySolvedCount == 2) {
                    prepositionRU = i18n.get("rangeFromPrepositionBeta");
                }

                $("#bonusNotice").append(
                    i18n.format(
                        "ratingRankChangeNotice",
                        bonus.oldRankBySolvedCount,
                        bonus.newRankBySolvedCount,
                        prepositionRU
                    )
                );
            }

            var bonusNoticeHeight = $("#bonusNotice").height();

            var margin = iDiv(345 - $("#bonusNotice").height() - $("#winBox").height(), 3);

            var winBoxDeltaMargin = typeof(WINBOX_DELTA_MARGIN) != "undefined" ? WINBOX_DELTA_MARGIN : 0;

            $("#winBox").animate({"top" : 125 + margin + winBoxDeltaMargin}, function () {
                $("#bonusNotice").css("top", 125 + margin + $("#winBox").height() + margin + winBoxDeltaMargin);
                $("#bonusNotice").fadeIn("fast");
            });

//            alert(123);
        }
    }

    this.bindAll = function () {
        ;
    }

    gc = _gc;
    ui = _ui;
    options = _options;

    this.bindAll();
}
function trimMsg(text) {
    text = text.replace(/\n/gi, " ");
    if (text.length > 55) {
        return text.substr(0, 50) + "...";
    } else {
        return text;
    }
}

var INBOX = 0;
var OUTBOX = 1;

var SHOW_MAIN_TAB = 0;
var SHOW_SUBTAB = 1;

function PlayerProfile(_gc, _ui) {
    var that = this;
    var unreadMessagesCount = 0;
    var loaded = false;

    var jLoadingIcon = null;

    var preuploaded = false;

    var gc, ui, cs;

    var i18n = new I18n();
    i18n.setContext('profile');

    this.setUnreadMsgCount = function (count) {
        unreadMessagesCount = count;
    }

    this.getUnreadMsgCount = function () {
        return unreadMessagesCount;
    }

    this.run = function () {
        if (gc.getClientServer().isGuest()) {
            return;
        }

        if (!$("#profilePanel").is(":visible")) {
            if (that.getUnreadMsgCount() == 0) {
                that.show();
            } else {
                that.showInbox();
            }
        } else {
            ui.hidePanel("profilePanel");
        }
    }

    this.show = function () {
        that.setLoading(SHOW_MAIN_TAB);

        cs.loadProfile(null, function (result, profile) {
            $("#profilePIStatic").empty().append(PlayerProfile.renderProfilePI(profile, false));
            $("#profilePIStaticLayout").show();
            $("#profileEditBtn").show();
            $("#profilePIEditable").hide();

            preuploaded = false;

            $("#profileSubTab").hide();
            $("#profileSubTab").empty();
            $("#profileMainTab").show();

            loaded = true;

            jLoadingIcon = $("#profileLoadingIcon");
            $("#profileLoadingIcon").hide();

            if (result && profile != null) {
                $("#profileWhere").val(profile.fromwhere);
                $("#profileLink").val(profile.link);
                $("#profileMail").val(profile.mail);
                $("#profileAbout").val(profile.about);
                $("#profileBirthDay").val(profile.birthDay);
                $("#profileBirthMonth").val(profile.birthMonth);
                $("#profileBirthYear").val(profile.birthYear);

                if (profile.photoThumb != null) {
                    $("#profilePhotoFrame").css("border", "none");
                    $("#profilePhotoFrame").empty().append(
                        "<img class='profilePhoto'"
                            + "src='" + profile.photoThumb + "'/>");
                } else {
                    $("#profilePhotoFrame").css("border", "1px solid #CCC");
                    $("#profilePhotoFrame").empty().append(
                        "<img class='profilePhoto'"
                            + "src='/images/nophoto-" + I18n.get("locale") + ".png'/>");
                }

                $("#profileSideActivity").empty();

                if (false && profile.sideActivity != null && cs.isSuperUser()) {
                    var sideActivityListHTML = "";

                    for (var i in profile.sideActivity) {
                        var entity = profile.sideActivity[i];

                        sideActivityListHTML +=
                            "<li>" + formatTime(entity.timestamp, {separator : "", clarify : true}) + ", " + formatGame(entity.gameVariationId) + "</li>";
                    }

                    var sideActivity = "<div id='profileSideActivity'>"
                        + "<h4 class='profileH4'>" + i18n.get("sideActivityHeader") + ":</h4>"
                        + "<ol style='line-height: 25px;'>"
                        + sideActivityListHTML
                        + "</ol>"
                        + "</div>";
                }

                $("#profileSideActivity").append(sideActivity);
            } else {
                $("#profileWhere").val("");
                $("#profileLink").val("");
                $("#profileMail").val("");
                $("#profileAbout").val("");
                $("#profileBirthDay").val(0);
                $("#profileBirthMonth").val(0);
                $("#profileBirthYear").val(0);

                $("#profilePhotoFrame").css("border", "1px solid #CCC");
                $("#profilePhotoFrame").empty().append(
                    "<img class='profilePhotoFrame'"
                        + "src='/images/nophoto-" + I18n.get("locale") + ".png'/>");

                $("#profileSideActivity").empty();
            }

            $("#profileGoInvisible").attr("checked", !!profile.isInvisible);

            $("#profileLoading").hide();

            if (profile.unreadMsgCount > 0) {
                that.updateUnreadMsgCount(profile.unreadMsgCount);
            }

            $("#profileContents").show();
            $("html, body").scrollTop($("#profilePanel").offset().top);
        });
    }

    this.save = function () {
        $('#profileMail').val($.trim($('#profileMail').val()));
        if (!$('#profileMail').val()=='' && !validateMail($('#profileMail').val())){
            alert('Адрес почты не содержит точку или @');
            return;
        }
        $("#profileLoadingImg").show();

        cs.updateProfile(function (result, response) {
            $("#profileLoadingImg").hide();
            if (result) {
                if (!preuploaded && response.thumbFilename != null) {
                    $("#profilePhotoFrame").css("border", "none");
                    $("#profilePhotoFrame").empty().append(
                        "<img class='profilePhoto'"
                            + "src='" + response.thumbFilename + "'/>");
                }

                $("#profilePhotoField").val("");

                if (isDef(response.profile)) {
                    $("#profilePIStatic").empty().append(PlayerProfile.renderProfilePI(response.profile, false));
                }

                $("#profilePIEditable").hide();
                $("#profilePIStaticLayout").show();
                $("#profileEditBtn").show();
            }
        });
    }

    this.setLoading = function (showWhat) {
        if ($("#profilePanel").is(":visible")) {
            if (jLoadingIcon != null) {
                jLoadingIcon.show();
            }
        } else {
            $("#profileUsername").empty().append(cs.getUsername());
            $("#profileLoading").show();
            $("#profileContents").hide();
            $("#profileUnreadMsgAlert").hide();

            ui.showPanel({id : "profilePanel"});
            $("html, body").scrollTop($("#profilePanel").offset().top);
        }
    }

    this.showInbox = function () {
        that.setLoading(SHOW_SUBTAB);

        cs.loadConversations(function (result, conversations) {
            var messagesContent = "<div class='pmCP'>";
            messagesContent += "<h4 class='pmShowInbox nonSelectable' id='pmShowInbox'>" + i18n.get("inboxHeader") + "</h4>";
            messagesContent += "<h4 class='pmShowOutbox activeOption nonSelectable' id='pmSendMsg'>" + i18n.get("sendMsgMenuAction") + "</h4>";
            messagesContent += "</div>";

            messagesContent += "<img src='/img/icons/loading.gif' class='profileLoadingIcon' id='pmInboxLoadingIcon' />";

            messagesContent += "<div class='clear'></div>";

            if (conversations.length == 0) {
                messagesContent += "<p style='padding-left: 10px;'>" + i18n.get("noDialogsAlert") + "</p>";
            } else {
                messagesContent += "<table class='standartTable' width='100%' style='margin-top: 12px;'>";
                messagesContent += "<tr>"
                    + "<th width='10%'>" + i18n.get("opponentLabel") + "</th>"
                    + "<th>" + i18n.get("msgTextLabel") + "</th>"
                    + "<th width='10%'>" + i18n.get("sentDateTimeLabel") + "</th>"
                    + "</tr>";
                for (var i in conversations) {
                    var conversation = conversations[i];
                    var trStyle = (!conversation.hasNewMessages ? "" : "font-weight: bold;");
                    var ownMessage = conversation.ownMessage ? " ownMessage" : "";
                    messagesContent += "<tr id='conversation" + conversation.opponent + "' style='" + trStyle + "'>"
                        + "<td style='text-align: center;' class='pmSenderNameTd'><p class='pmSenderName'>" + conversation.opponentName + "</p></td>"
                        + "<td><p class='msgShort" + ownMessage + "'>" + trimMsg(conversation.msg) + "</p></td>"
                        + "<td style='text-align: center; white-space: nowrap;'>" + formatTime(conversation.timestamp, {putTimeInBrackets : true}) + "</td>"
                        + "</tr>";
                }
                messagesContent += "</table>";
            }

            var inboxPanel = new BottomSubPanel();
            inboxPanel.fillContents(messagesContent);
            inboxPanel.onClose(function () {
//                if (loaded) {
//                    $("#profileMainTab").show();
//                    $("#profileSubTab").hide();
//                    $("html, body").scrollTop($("#profilePanel").offset().top - iDiv($("#gameArea").width(), 3));
//                } else {
                that.show();
//                }
            });
            inboxPanel.renderContents("profileSubTab");
            $("#profileMainTab").hide();
            $("html, body").scrollTop($("#profilePanel").offset().top - iDiv($("#gameArea").width(), 3));
            jLoadingIcon = $("#pmInboxLoadingIcon");

            $("#pmSendMsg").click(function () {
                that.showSendMsg();
            });

            if (conversations.length > 0) {
                for (var i in conversations) {
                    var msg = conversations[i];
                    $("#conversation" + msg.opponent).click(function (msg) {
                        return function () {
                            that.setLoading(SHOW_SUBTAB);

                            cs.loadConversation(msg.opponent, function (result, response) {
                                that.updateUnreadMsgCount(response.unreadMsgCount);
                                that.renderConversation(msg.opponent, msg.opponentName, response.conversation, function () {
                                    that.showInbox();
                                });
                            });
                        }
                    }(msg));
                }
            }
        });
    }

    this.openAdminDialog = function(){
        cs.loadConversation(-1, function (result, response) {
            that.updateUnreadMsgCount(response.unreadMsgCount);
            that.renderConversation(-1, "Админ", response.conversation, function () {
                that.showInbox();
            }, true);
        });
    }

    this.renderConversation = function (opponent, opponentName, conversation, onClose, fReplyActive) {
        var conversationText;

        conversationText = "<table class='pmDlgLayout'>";
        for (var i = conversation.length - 1; i >= 0; i--) {
            var msg = conversation[i];
            conversationText += "<tr>"
                + "<td>"
                + "<p class='pmDlgSender'>" + msg.senderName + "</p>"
                + "<p class='pmDlgText'>" + msg.msg.replace(/\n/gi, "<br />") + "</p>"
                + "</td>"
                + "<td class='pmDlgSendDate'>" + formatDate(msg.sentTS) + "</td>"
                + "</tr>";
        }
        conversationText += "</table>";

        var msgPanel = new BottomSubPanel();
        var msgContents = "<h4 style='float: left;'>" + i18n.get("conversationWithPrefix") + " " + opponentName + "</h4>";
        msgContents += "<img src='/img/icons/loading.gif' class='profileLoadingIcon' id='pmMsgLoadingIcon' />";
        msgContents += "<div class='clear'></div>";

        msgContents += "<div class='msgText' id='msgText'><div class='msgPadding'>"
            + conversationText
            + "</div></div>";
        msgContents += "<div class='clear'></div>";

        msgContents += "<div class='pdSendMsgPanel' id='replyToPanel'>"
            + "<div class='pdSendMsgPanelPadding'>"
            + "<h4>" + i18n.get("msgRecipientPrefix") + " &laquo;" + opponentName + "&raquo;</h4>"
            + "<textarea id='replyText' style='width: 100%'></textarea>"
            + "<div class='constantWidthBtn nonSelectable pdSendMsgBtn' id='sendReplyBtn'>" + i18n.get("sendReplyButtonLabel") + "</div>"
            + "<div class='clear'></div>"
            + "</div></div>"

        msgPanel.fillContents(msgContents);
        msgPanel.onClose(onClose);
        msgPanel.renderContents("profileSubTab");
        $("#profileMainTab").hide();
        jLoadingIcon = $("#pmMsgLoadingIcon");

        $("html, body").scrollTop($("#profileSubTab").offset().top + $("#profileSubTab").height());

        $("#replyToBtn").click(function () {
            $("#replyToBtn").hide();
            $("#replyToPanel").show();
            $("html, body").scrollTop($("#replyToPanel").offset().top);
            $("#replyText").focus();
        });

        $("#sendReplyBtn").click(function () {
            var text = $("#replyText").val();
            if (text.length > 0) {
                cs.sendMessage(opponent, text, 0, 0, function (result) {
                    onClose();
                })
            } else {
                alert(i18n.get("emptyMsgAlert"));
            }
        });

        if (fReplyActive){
            $("#replyToBtn").hide();
            $("#replyToPanel").show();
            $("html, body").scrollTop($("#replyToPanel").offset().top);
            $("#replyText").focus();
        }
    }

    this.showSendMsg = function () {
        that.setLoading(SHOW_SUBTAB);

        var subPanel = new BottomSubPanel();
        var contents = "<h4 style='float: left;'>" + i18n.get("sendPMHeader") + "</h4>";
        contents += "<img src='/img/icons/loading.gif' class='profileLoadingIcon' id='pmSubPanelLoadingIcon' />";
        contents += "<div class='clear'></div>";
        contents += "<div style='margin-right: 4px;'>";
        contents += "<textarea id='msgText' style='width: 100%; margin-top: 10px;'></textarea>";
        contents += "</div>";
        contents += "<div class='constantWidthBtn nonSelectable profileActionBtn' id='chooseRecipientsBtn'>"
            + i18n.get("selectRecipientsButtonLabel")
            + "</div>"
        contents += "<div style='border: 1px dashed #CCC' id='pmRecipientList'></div>";
        contents += "<div class='constantWidthBtn nonSelectable profileActionBtn' id='pmSendMsgBtn'>"
            + i18n.get("sendMsgButtonLabel")
            + "</div>"
        contents += "<div class='clear'></div>";

        subPanel.fillContents(contents);
        subPanel.onClose(function () {
            that.showInbox();
        });
        subPanel.renderContents("profileSubTab");

        $("#profileMainTab").hide();
        jLoadingIcon = $("#pmSubPanelLoadingIcon");

        $("#chooseRecipientsBtn").click(function () {
            $("#pmSubPanelLoadingIcon").show();
            cs.loadRecipients(function (result, recipients) {
                if (result) {
                    $("#pmSubPanelLoadingIcon").hide();
                    $("#chooseRecipientsBtn").hide();
                    for (var i in recipients) {
                        var rcp = recipients[i];
                        $("#pmRecipientList").append("<div style='width: 25%; display: inline-block;'>"
                            + "<input class='pmRcpCheckBox' type='checkbox' value='" + rcp.playerId + "'>" + rcp.username
                            + "</div>");
                    }
                    $("#pmRecipientList").show();
                    $("#pmSendMsgBtn").show();
                    $("html, body").scrollTop($("#pmRecipientList").offset().top);
                }
            });
        });

        $("#pmSendMsgBtn").click(function () {
            var recipientList = [];
            $('.pmRcpCheckBox').each(function () {
                if (this.checked) {
                    recipientList.push(parseInt(this.value));
                }
            });
            var text = $("#msgText").val();
            if ($.trim(text).length == 0) {
                alert(i18n.get("emptyMsgAlert"));
            } else if (recipientList.length == 0) {
                alert(i18n.get("noRecipientAlert"));
            } else {
                $("#pmSubPanelLoadingIcon").show();
                cs.sendMassMsg(text, recipientList, function (result) {
                    that.showInbox();
                })
            }
        });
    }

    this.bindAll = function () {
        $("#bbProfile").click(function () {
            that.run();
        });

        $("#profileLogoutBtn").click(function () {
            setCookie("vk_app_3960668", " ", new Date(0), '/', '.logic-games.spb.ru');
            gc.logout();
        });

        $("#profileCloseImg").click(function () {
            ui.hidePanel("profilePanel");
        });

        $("#profileEditBtn").click(function () {
            $("#profilePIStaticLayout").hide();
            $("#profilePIEditable").show();
        });

        $("#profilePhotoField").change(function () {
            that.preuploadPhoto();
        });

        $("#profileSaveBtn").click(function () {
            that.save();
        });

        $("#profileDiscardChangesBtn").click(function () {
            that.show();
        });

        $("#profileReadMsgBtn, #profileGoToInbox").click(function () {
            that.showInbox();
        });

        $("#sendToAdmin").click(function(){
            that.openAdminDialog();
        });

        $("#changePassword").click(function(){
            $('#cpOldPassword').val("");
            $('#cpNewPassword1').val("");
            $('#cpNewPassword2').val("");
            ui.showPanel({id : "changePassPanel",type : OVER_FIELD_PANEL});
        });

        $('#cpCancel, #cpCloseIcon').click(function(){
            that.run();
        });
        $('#cpCommit').click(
            function(){
                that.changePassword();
         });

        $("#profileGoInvisible").click(function () {
            var isInvisible = $("#profileGoInvisible").is(":checked");

            $("#profileGoInvisible").attr("disabled", "disabled");
            $("#profileGoInvisibleLoadingImg").show();

            cs.updateUserSettings({
                isInvisible : isInvisible
            }, function (result) {
                $("#profileGoInvisible").removeAttr("disabled");
                $("#profileGoInvisibleLoadingImg").hide();
            });
        });

        $('#shareBtn').click(function(){
            if ($('.share42init').css('display')=='block')
                $('.share42init').hide();
            else $('.share42init').show();
        });
    }

    this.preuploadPhoto = function () {
        $("#profileLoadingImg").show();

        cs.preuploadPhoto(function (result, response) {
            $("#profileLoadingImg").hide();

            if (result) {
                $("#profilePhotoFrame").css("border", "none");
                $("#profilePhotoFrame").empty().append(
                    "<img class='profilePhoto'"
                        + "src='" + response.thumbFilename + "'/>");

                preuploaded = true;
            }
        });
    }

    this.bindActions = function (profile) {
        $("#sendMsg" + profile.playerId).click(function () {
//            $("#sendMsg" + profile.playerId).hide();
            $("#pdSendMsgResult" + profile.playerId).hide();
            $("#pdSendMsgPanel" + profile.playerId).toggle("fast");
        });

        $("#pdSendMsgBtn" + profile.playerId).click(function () {
            var msg = $("#pdMsg" + profile.playerId).val();
            if (msg != "") {
                var fromAdmin = (cs.isSuperUser()&&$("#pdFromAdmin").is(':checked'))?1:0;
                cs.sendMessage(profile.playerId, msg, 0,fromAdmin, function (result) {
                    if (result) {
                        ;
                    }
                    $("#pdSendMsgResult" + profile.playerId).empty().append(i18n.get("msgSentSuccessfullyAlert"));
                    $("#pdSendMsgResult" + profile.playerId).show();
                    $("#pdSendMsgResult" + profile.playerId).delay(2000).fadeOut();
                    $("#pdSendMsgPanel" + profile.playerId).hide();
                    $("#pdMsg" + profile.playerId).val("");
                    $("#sendMsg" + profile.playerId).show();
                });
            }
            $("#pdMsg" + profile.playerId).val("");
        });
    }

    this.updateUnreadMsgCount = function (unreadMsgCount) {
        that.setUnreadMsgCount(unreadMsgCount);
        if (cs.isLogged() && unreadMsgCount > 0) {
            $("#bbProfileLabel").hide();
            $("#bbUnreadMsgCount").empty().append(i18n.get("newMessagesLabel") + ": " + unreadMsgCount);
            $("#profileReadMsgBtn").empty().append(i18n.get("newMessagesLabel") + ": " + unreadMsgCount);
            $("#profileGoToInbox").hide();
            $("#profileUnreadMsgAlert").show();
            if (unreadMsgCount >= 10) {
                $("#bbUnreadMsgCount").css("font-size", "7pt");
            } else {
                $("#bbUnreadMsgCount").css("font-size", "8pt");
            }
        } else {
            $("#profileGoToInbox").show();
            $("#bbProfileLabel").show();
            $("#bbUnreadMsgCount").empty();
            $("#profileUnreadMsgAlert").hide();
        }
    }

    this.renderProfile = function (profile) {
        return PlayerProfile.renderProfile(profile, gc.getClientServer().isGuest());
    }

    this.changePassword = function(){
        var cs = gc.getClientServer();
        var oldp = $.trim($('#cpOldPassword').val());
        var newp1 = $.trim($('#cpNewPassword1').val());
        var newp2 = $.trim($('#cpNewPassword2').val());
        var msg = null;
        if (!oldp || !newp1 || !newp2)msg = "Заполните все поля";
        else {
            if (newp1 == oldp) msg = "Старый и новый пароль совпадают!";
            if (newp1.length > 0 && newp1.length < 5) {
                msg = "Минимальная длина 5 символов.";
            } else if (newp1.length > 25) {
                msg = "Максимальная длина 25 символов.";
            } else if (newp1 != newp2) msg = "Введённые пароли не совпадают";
        }
        if (msg){
            $('#cpResult').show();
            $('#cpResult').empty().append("<div class='lrRedAlert'>"+ msg + "</div>");
            $("#cpResult").delay(2000).fadeOut("fast");
            return;
        } else {
            cs.sendRequest(CNP_GATEWAY, {
                old:oldp,
                new:newp1
            },function(result, data){
                if (data.result == "ok"){
                    alert("Пароль успешно изменен");
                    that.run();
                } else {
                    $('#cpResult').show();
                    $('#cpResult').empty().append("<div class='lrRedAlert'>"+data.result+"</div>");
                    $("#cpResult").delay(2000).fadeOut("fast");
                }
            });
        }
    }

    gc = _gc;
    ui = _ui;
    cs = gc.getClientServer();
    that.cs = cs;

    if (!PlayerProfile.BOUND) {
        that.bindAll();
        PlayerProfile.BOUND = true;
    }
}

PlayerProfile.BOUND = false;

//var ruMonths = [
//    'января',
//    'февраля',
//    'марта',
//    'апреля',
//    'мая',
//    'июня',
//    'июля',
//    'августа',
//    'сентября',
//    'октября',
//    'ноября',
//    'декабря'
//];

function filterField(field) {
    if (field == "") {
        return "<span class='profileAbsentField'>" + I18n.contextGet("profile", "emptyFieldStub") + "</span>";
    } else {
        return field;
    }
}

function filterLink(validLink, link) {
    if (validLink == "") {
        return filterField(link);
    } else {
        if (validLink.length > 32) {
            var linkText = validLink.substr(0, 32) + "...";
        } else {
            linkText = validLink;
        }
        return "<a href='" + validLink + "' target=_blank>" + linkText + "</a>";
    }
}

PlayerProfile.renderProfile = function (profile, isGuest) {
    isGuest = ifDef(isGuest, false);

    var playerProfile = "<div class='playerProfile'><table class='playerProfileLayout'><tr>";

    var borderClass = "";
    if (profile.photoThumb == null) {
        borderClass = " profilePhotoBorder";
    }

    playerProfile += "<td style='width: 1%; text-align: left; padding-right: 10px;'><div class='profilePhotoFrame" + borderClass + "'>"
        + (profile.photoThumb == null
        ?
        "<img class='profilePhoto' src='/images/nophoto-" + I18n.get("locale") + ".png' />"
        :
        "<a href='" + profile.photo + "' rel='lightbox'>"
            + "<img class='profilePhoto' src='" + profile.photoThumb + "' /></a>")
        + "</div></td>";

    playerProfile += "<td>"
        + PlayerProfile.renderProfilePI(profile)
        + (!isGuest ? "<div class='constantWidthBtn nonSelectable pdSendMsg' id='sendMsg"
        + profile.playerId
        + "'>" + I18n.contextGet("profile", "pdSendPMButtonLabel") + "</div>" : "")
        + "</td>";

    playerProfile += "</tr>";

    if (!isGuest) {
        var f = ((typeof controller === "undefined")?cs:controller.cs)
            f = (!!f && f.isSuperUser())
        playerProfile += "<tr>"
            + "<td colspan='2'><div class='pdSendMsgResult' id='pdSendMsgResult" + profile.playerId + "'></div>"
            + "<div class='pdSendMsgPanel' id='pdSendMsgPanel" + profile.playerId + "'>"
            + "<div class='pdSendMsgPanelPadding'>"
            + "<h4>"
            + I18n.contextGet("profile", "pdRecipientHeaderPrefix") + " &laquo;" + profile.playerName
            + "&raquo;</h4>"
            + "<textarea id='pdMsg" + profile.playerId + "' style='width: 100%'></textarea>"
            + (f?"<input type='checkbox' id='pdFromAdmin'>От Админа</input>":"")
            + "<div class='constantWidthBtn nonSelectable pdSendMsgBtn' id='pdSendMsgBtn" + profile.playerId + "'>"
            + I18n.contextGet("profile", "pdSendButtonLabel")
            + "</div>"
            + "<div class='clear'></div>"
            + "</div>"
            + "</div>"
            + "</td>"
            + "</tr>";
    }

    playerProfile += "</table></div>";

    return playerProfile;
}

PlayerProfile.renderProfilePI = function (profile, isPublic) {
    var isPublic = ifDef(isPublic, true);

    var bDay = "";

    if (profile.birthDay > 0 && profile.birthMonth > 0) {
        bDay = profile.birthDay + " " + I18n.contextGet("monthsBeta", profile.birthMonth);
    }

    if (profile.birthYear > 0) {
        if (bDay != "") {
            bDay += " ";
        }
        bDay += profile.birthYear;
    }

    var about = profile.about.replace(/\n/gi, "<br />");

    return '<table class="playerProfileTable" style=" width: 100%;word-wrap: break-word; table-layout: fixed; ">'
        + "<tr>"
        + "<td>" + I18n.contextGet("profile", "birthdayLabel") + ": </td>"
        //+ "<td>&nbsp;</td>"
        + "<td>" + filterField(bDay) + "</td>"
        + "</tr>"
        + "<tr>"
        + "<td>" + I18n.contextGet("profile", "fromwhereLabel") + ": </td>"
        //+ "<td>&nbsp;</td>"
        + "<td>" + filterField(profile.fromwhere) + "</td>"
        + "</tr>"
        + "<tr>"
        + "<td>" + I18n.contextGet("profile", "linkLabel") + ": </td>"
        //+ "<td>&nbsp;</td>"
        + "<td>" + filterLink(profile.validLink, profile.link) + "</td>"
        + "</tr>"
        + (!isPublic?"<tr>"
        + "<td title=\"Для восстановления пароля\">"+I18n.get("email")+"</td>"
        //+ "<td>&nbsp;</td>"
        + "<td title=\"Для восстановления пароля\">" + filterField(profile.mail) + "</td>"
        + "</tr>":"")
        + "<tr>"
        + "<td>" + I18n.contextGet("profile", "aboutLabel") + ": </td>"
        //+ "<td>&nbsp;</td>"
        + "<td>" + filterField(about) + "</td>"
        + "</tr>"
        + "<tr>"
        + "<td>" + I18n.contextGet("profile", "regDateLabel") + ": </td>"
        //+ "<td>&nbsp;</td>"
        + "<td>" + formatDateRu(profile.regTimeTS) + "</td>"
        + (profile.lastActiveTS ? "</tr>"
        + "<tr>"
        + "<td>" + "Последнее посещение сайта" + ": </td>"
        //+ "<td>&nbsp;</td>"
        + "<td>" + formatDateRu2(profile.lastActiveTS) + "</td>"
        + "</tr>" : "")
//        + "<tr>"
//        + (showTotalGameTime && cs.isSuperUser() ? "<td>Игровое время: </td>"
//        + "<td>&nbsp;</td>"
//        + "<td>" + formatLargeGameTime(profile.totalGameTime) + "</td>" : "")
//        + "</tr>"
        + "</table>";
}

function validateMail(mail){
    var re = /\S+@\S+\.\S+/;
    return (mail && mail.length>3 && re.test(mail));
}
var GTW_USERNAME_FILTER = "/gw/shared/usernameFilter.php";
var GTW_RATINGS = "/gw/shared/loadRatingsBySolvedCount.php";
var GTW_PLAYER_DETAIL = "/gw/shared/loadPlayerDetail.php";

var SHOW_DUP_USER_ROW_AFTER = 20;

var MAX_VISIBLE_USERNAME_LENGTH = 17;

var SHOW_SHORTCUTS_AFTER = 35;

var OFFLINE_COLOR = "#FFFFFF";
var ONLINE_COLOR = "#D7FACF";
var INACTIVE_COLOR = "#EFF9DB";

var RL_SHOW_ALL_RATINGS = 0;
var RL_SHOW_ONLINE_RATINGS = 1;
var RL_SHOW_GUEST_RATINGS = 2;
var RL_SHOW_COMMON_RATING = 3;

var RL_SORT_BY_SOLVED_COUNT = 0;
var RL_SORT_BY_BA_RANK = 1;
var RL_SORT_BY_WT_RANK = 2;
var RL_SORT_BY_PLAYED_COUNT = 3;
var RL_SORT_BY_SOLVED_RATIO = 4;
var RL_SORT_BY_REG_DATE = 5;
var RL_SORT_BY_TOTAL_GAME_TIME = 6;
var RL_SORT_BY_AVERAGE_WIN_TIME = 7;
var RL_SORT_BY_TOTAL_GAME_RATING = 8;
var RL_SORT_BY_TOTAL_WIN_TIME = 9;
var RL_SORT_BY_BEST_COUNT = 10;

var RL_DEFAULT_LOAD_COUNT = 500;

var rlFilter = RL_SHOW_ALL_RATINGS;
var rlSortBy = RL_SORT_BY_SOLVED_COUNT;
var rlOrder = true;

var DESC = false;
var ASC = true;

function RatingsRenderer(_gc, _ui, _options) {
    var that = this;

    var gc, ui, cs;

    var CONTENTS_ID = "#ratingsContents";

    var options = {
        showLabels : false,
        showBestAttemptCount : false,
        canFilter : false,
        filterLabel : "",
        noFilterLabel : "",
        showTimeRatings : false
    };

    var filter = RL_SHOW_ALL_RATINGS;
    var sortBy = RL_SORT_BY_SOLVED_COUNT;
    var order = ASC;
    var usernamePrefixFilter = "";

    that.activeSubFilter = null;

    that.timeFilter = null;

    that.activeSegmentFilter = 0;

    var i18n = new I18n();
    i18n.setContext('rating');

    this.resetSettings = function () {
        filter = RL_SHOW_ALL_RATINGS;
        sortBy = RL_SORT_BY_SOLVED_COUNT;
        order = ASC;
        usernamePrefixFilter = "";
        that.activeSegmentFilter = 0;

        that.activeSubFilter = null;
        that.timeFilter = null;
    }

    this.run = function () {
        if (!$("#ratingsPanel").is(":visible")) {
            that.resetSettings();
            cs = gc.getClientServer();

            that.loader = new Loader(0, RL_DEFAULT_LOAD_COUNT);
            that.loader.addListener(that);

            ui.setLoading("#ratingsContents");
            this.loadAndRender(false);
            ui.showPanel({
                id : "ratingsPanel",
                contentsId : CONTENTS_ID,
                type : BOTTOM_PANEL
            });
        } else {
            ui.hidePanel("ratingsPanel");
        }
    }

    this.countChanged = function () {
        that.loadAndRender(true, false);
    }

    this.loadAndRender = function (repeatLoad, resetLoader) {
        if (repeatLoad) {
            $("#rlLoadingImg").show();
        }

        // TODO, REWORK, HACK
        resetLoader = ifDef(resetLoader, true);

        if (resetLoader) { // TODO, HACK, REWORK
            that.loader.reset();
        }

        if (that.timeFilter || filter != RL_SHOW_ALL_RATINGS) {
            that.activeSegmentFilter = 0;
        }
        cs.sendRequest(GTW_RATINGS, {
                sortBy : sortBy,
                order : bool2Int(order),
                filter : filter,
                usernamePrefixFilter : usernamePrefixFilter,
                count : that.loader.count,
                subFilter : that.activeSubFilter ? that.activeSubFilter.value : 0,
                timeFilter : that.timeFilter ? (that.timeFilter.year + "-" + that.timeFilter.month) : 0,
                segmentFilter : that.activeSegmentFilter
            },
            function (result, data, error) {
                $("#rlLoadingImg").hide();
                if (result) {
                    that.render(data);
                    if (!repeatLoad) {
                        $("html, body").animate({
                            scrollTop : $("#ratingsPanel").offset().top - iDiv($("#gameArea").width(), 3)
                        }, "normal");
                    }
                    // DEV !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
//                    that.fillPlayerDetail(8347, "Саша");
                } else {
                    that.ui.renderErrorReason(CONTENTS_ID, error.reason);
                }
            }
        )
        ;
    }

    this.bindHeaderAction = function (jId, columnSortBy, columnDefaultOrder, onlyDefaultOrder) {
        onlyDefaultOrder = ifDef(onlyDefaultOrder, false);

        $(jId).click(function () {
            if (sortBy != columnSortBy || onlyDefaultOrder) {
                sortBy = columnSortBy;
                order = columnDefaultOrder;
            } else {
                order = !order;
            }
            that.loadAndRender(true);
        });
    }

    this.generateHeader = function (id, title, columnSortBy, showOrderHint) {
        return "<span"
            + (sortBy == columnSortBy ? " class='activeSortHeader actionText3'" : " class='actionText3'")
            + " id='" + id + "'>" + title
            + (showOrderHint ? (sortBy == columnSortBy ? ui.getOrderHint(order) : "") : "")
            + "</span>";
    }

    this.generateSortImg = function (id, columnSortBy) {
        return (sortBy == columnSortBy ?
            ui.serverSortArrowsImg(order, "", id) :
            " &nbsp;<img src='/img/icons/sort-both.png' id='" + id + "' alt=''/>");
    }

    this.applyTimeFilter = function (year, month) {
        that.timeFilter = {
            year : year,
            month : month
        };
        that.loadAndRender(true);
    }

    this.applySubFilter = function (subFilter) {
        that.activeSubFilter = subFilter;
        that.loadAndRender(true);
    }

    this.renderSubFilters = function (subFilters) {
        if (subFilters) {
            var rlSubFilters = "";

            for (i in subFilters) {
                var subFilter = subFilters[i];

                var rlClass = (that.activeSubFilter && subFilter.id == that.activeSubFilter.id) ? "disabledText" : "actionText2";

                rlSubFilters +=
                    "<span class='" + rlClass + "' id='" + subFilter.id + "'>" + subFilter.name + "</span>"
                        + "&nbsp;&nbsp;&nbsp;&nbsp;";
            }

            return rlSubFilters;
        } else {
            return  "";
        }
    }

    that.locateActiveSubFilter = function (subFilters, activeSubFilterId) {
        for (i in subFilters) {
            if (subFilters[i].id == activeSubFilterId) {
                that.activeSubFilter = subFilters[i];
            }
        }

//        alert(activeSubFilterId);
    }

    this.setSort = function (_sortBy, _order) {
        sortBy = _sortBy;
        order = _order;
    }

    this.renderFilter = function (filterData) {
        $("#rlFilterSection").empty();

        var options = "<option value='nofilter'>" + that.options.noFilterLabel + "</option>";

        for (var i in filterData) {
            var filter = filterData[i];

            options += "<option value='" + filter.val + "'>" + filter.text + "</option>";
        }

        $("#rlFilterSection").append("<table style='margin-bottom: 5px;'>"
            + "<tr>"
            + "<td style='vertical-align: middle !important;'>"
            + "<span style='color: #777;'>" + that.options.filterLabel + ": </span>"
            + "</td>"
            + "<td>&nbsp;&nbsp;</td>"
            + "<td>"
            + "<select style='width: 220px' id='rlFilter'>"
            + options
            + "</select>"
            + "</td>"
            + "</tr>"
            + "</table>");

        if (that.activeSegmentFilter) {
            $("#rlFilter").val(that.activeSegmentFilter);
        }

        $("#rlFilter").change(function (e) {
            that.onFilterChange();
        });

        $("#rlFilter").chosen({
            disable_search : true
        });
    }

    this.onFilterChange = function () {
        var value = $("#rlFilter option:selected").val();

        if (value == "nofilter") {
            that.activeSegmentFilter = 0;
        } else {
            that.activeSegmentFilter = value;
        }

        that.loadAndRender(true);
    }

    this.render = function (data) {
        that.loader.setTotal(data.total);

        that.locateActiveSubFilter(data.subFilters, data.activeSubFilterId);

        if (that.options.canFilter && (!that.timeFilter && filter == RL_SHOW_ALL_RATINGS)) {
            var filterData = data.filterData;
            that.renderFilter(filterData);
        } else {
            $("#rlFilterSection").empty();
        }

        var ratings = data.ratings;

        ui.hideHint();

        var doShowExtendedColumns = (that.timeFilter == null && that.activeSegmentFilter == 0);

//        var bestWinTimeCountTitle =
//            that.options.showBestAttemptCount ?
//                "1-х мест<br />по<br />времени" :
//                "1-x мест";

        var tdr = new TableDataRenderer(sortBy, order, {
            thClass : "rlHeader"
        });

        tdr.addColumn({
            title : i18n.get("placeLabel"),
            hint : i18n.get("sortByPlaceHint"),
            headerId : "rlSortByPlace",
            enableSort : true,
            sortBy : RL_SORT_BY_SOLVED_COUNT,
            defaultOrder : true,
            onlyDefaultOrder : true,
            showOrderHint : false,
            hasRightBorder : false
        });

        tdr.addColumn({
            title : i18n.get("usernameLabel"),
            enableSort : false,
            hasRightBorder : false,
            colspan : 2,
            customSortImgTdFunc : function () {
                return "<td class='noRightBorder rlArrows' colspan='2' style='text-align: left !important;'>"
                    + "<table width='100%' class='noBordersTable' style='border-collapse: collapse;' cellpadding='0' cellspacing='0'>"
                    + "<tr>"
                    + "<td style='padding-left: 0; padding-right: 10px; color: #777;'>" + i18n.get("searchByUsernameLabel") + ": </td>"
                    + "<td width='50%' style='padding: 0 0 0 0;'>"
                    + "<input id='rlUsernameFilter' style='width:100% !important; min-width: 75px; display: inline;' value='" + usernamePrefixFilter + "'/>"
                    + "</td>"
                    + "<td width='50%' id='rlClearUsernamePrefixFilterTd'>"
                    + "<img src='/img/icons/cross_12_12_a64.png' style='padding-left: 10px;' alt='' />"
                    + "</td>"
                    + "<td width='50%' id='rlFilterUsernamePrefixTd'>"
                    + "<img src='/img/icons/accept_12_12_a64.png' style='padding-left: 10px;' alt='' />"
                    + "</td>"
                    + "</tr>"
                    + "</table>"
                    + "</td>";
            }
        });

        tdr.addColumn({
            title : i18n.get("regDateLabel"),
            hint : i18n.get("sortByDateHint"),
            headerId : "rlSortByRegDate",
            enableSort : true,
            sortBy : RL_SORT_BY_REG_DATE,
            defaultOrder : false,
            onlyDefaultOrder : false,
            showOrderHint : true,
            hasRightBorder : false
        });

        tdr.addColumn({
            title : i18n.get("solvedCountLabel"),
            enableSort : false,
            hasRightBorder : false,
            insertSeparatorAfter : true
        });

        tdr.addColumn({
            title : i18n.get("playedCountLabel"),
            enableSort : false,
            hasRightBorder : false
        });

        tdr.addColumn({
            title : "%",
            hint : i18n.get("sortBySolvedRatio"),
            headerId : "rlSortBySolvedRatio",
            enableSort : true,
            sortBy : RL_SORT_BY_SOLVED_RATIO,
            defaultOrder : false,
            onlyDefaultOrder : false,
            showOrderHint : true,
            hasRightBorder : true
        });

        if (doShowExtendedColumns) {
            tdr.addColumn({
                title : (
                    that.options.showBestAttemptCount
                        ? i18n.get("bestWinTimeCountLabel")
                        : i18n.get("bestWinTimeCountShortLabel")
                    ),
                headerId : "rlSortByWinTimeRank",
                sortBy : RL_SORT_BY_BEST_COUNT,
                enableSort : true,
                defaultOrder : false,
                showOrderHint : true,
                hasRightBorder : true
            });

//            var suAvWinTimeAndTotalGameTimeTh = "";
            if (cs.isSuperUser() && !that.activeSegmentFilter) {
                tdr.addColumn({
                    title : i18n.get("totalGameTimeShortLabel"),
                    headerId : "rlSortByTotalGameTime",
                    enableSort : true,
                    sortBy : RL_SORT_BY_TOTAL_GAME_TIME,
                    defaultOrder : false,
                    showOrderHint : true,
                    hasRightBorder : false
                });

                tdr.addColumn({
                    title : i18n.get("averageWinTimeShortLabel"),
                    headerId : "rlSortByAverageWinTime",
                    enableSort : true,
                    sortBy : RL_SORT_BY_AVERAGE_WIN_TIME,
                    defaultOrder : true,
                    showOrderHint : true,
                    hasRightBorder : false
                });

                tdr.addColumn({
                    title : i18n.get("totalGameRatingShortLabel"),
                    headerId : "rlSortByTotalGameRating",
                    enableSort : true,
                    sortBy : RL_SORT_BY_TOTAL_GAME_RATING,
                    defaultOrder : false,
                    showOrderHint : true,
                    hasRightBorder : true
                });

//
//                suAvWinTimeAndTotalGameTimeTh = "<th class='rlHeader noRightBorder'>"
//                    + that.generateHeader("rlSortByTotalGameTime", "Общ вр", RL_SORT_BY_TOTAL_GAME_TIME, true)
//                    + "</th>"
//                    + "<th class='rlHeader noRightBorder'>"
//                    + that.generateHeader("rlSortByAverageWinTime", "Ср вр", RL_SORT_BY_AVERAGE_WIN_TIME, true)
//                    + "</th>"
//                    + "<th class='rlHeader'>"
//                    + that.generateHeader("rlSortByTotalGameRating", "Сумм рейт", RL_SORT_BY_TOTAL_GAME_RATING, true)
//                    + "</th>";
//                + "<th class='rlHeader noRightBorder'>"
//                + that.generateHeader("rlSortByTotalWinTime", "Сумм вр реш", RL_SORT_BY_TOTAL_WIN_TIME, true)
//                + "</th>";
            }
        }

//        var placeHeader = "<span"
//            + (sortBy == RL_SORT_BY_SOLVED_COUNT ? " class='activeSortHeader actionText3'" : " class='actionText3'")
//            + " id='rlSortByPlace'>Место"
//            //+ (sortBy == RL_SORT_BY_SOLVED_COUNT ? ui.getOrderHint(order) : "")
//            + "</span>";

        //var regDateHeader = that.generateHeader("rlSortByRegDate", "Дата", RL_SORT_BY_REG_DATE, true);

//        var solvedCountHeader =
//            "<span"
//            + (sortBy == RL_SORT_BY_SOLVED_COUNT ? " class='activeSortHeader simpleText'" : " class='simpleText'")
//            + " id='rlSortBySolvedCount'>Решено"
//            + (sortBy == RL_SORT_BY_SOLVED_COUNT ? ui.getOrderHint(!order) : "")
//            + "</span>";
//            "<span class='simpleText' id='rlSortBySolvedCount'>Решено</span>";

//        var playedCountHeader = "<span"
//            + (sortBy == RL_SORT_BY_PLAYED_COUNT ? " class='activeSortHeader simpleText'" : " class='simpleText'")
//            + " id='rlSortByPlayedCount'>Всего"
//            + (sortBy == RL_SORT_BY_PLAYED_COUNT ? ui.getOrderHint(order) : "")
//            + "</span>";
//
//        var solvedRatioHeader = "<span"
//            + (sortBy == RL_SORT_BY_SOLVED_RATIO ? " class='activeSortHeader actionText3'" : " class='actionText3'")
//            + " id='rlSortBySolvedRatio'>%"
//            + (sortBy == RL_SORT_BY_SOLVED_RATIO ? ui.getOrderHint(order) : "")
//            + "</span>";

//        var baRankHeader = "<span" + (sortBy == RL_SORT_BY_BA_RANK ? " class='activeSortHeader simpleText'" : " class='simpleText'")
//            + " id='rlSortByRank'>Лучших<br />попыток"
//            + (sortBy == RL_SORT_BY_BA_RANK ? ui.getOrderHint(order) : "")
//            + "</span>";
//
//        var wtRankHeader = "<span" + (sortBy == RL_SORT_BY_WT_RANK ? " class='activeSortHeader simpleText'" : " class='simpleText'")
//            + " id='rlSortByRank2'>"
//            + bestWinTimeCountTitle
//            + (sortBy == RL_SORT_BY_WT_RANK ? ui.getOrderHint(order) : "")
//            + "</span>";

        // generate and append table contents
        var tableContents = "<table class='standartTable' style='clear:both; border-collapse: collapse;' "
            + " width='100%' border='0' vspace='0' cellspacing='0' hspace='0'><tr>"
            + tdr.renderTableHeader()
            //"<th class='rlHeader noRightBorder'>" + placeHeader + "</th>" // placeHeader // colspan='2'
            //+ "<th width='75%' class='rlHeader noRightBorder' colspan='2'>Имя</th>"
            //+ "<th class='rlHeader noRightBorder'>" + regDateHeader + "</th>"
            //+ "<th class='rlHeader noRightBorder'>" + solvedCountHeader + "</th>"
            //+ "<th class='rlHeader noRightBorder'>&nbsp;</th>"
            //+ "<th class='rlHeader noRightBorder'>" + playedCountHeader + "</th>"
//            + "<th class='rlHeader'>" + solvedRatioHeader + "</th>"
//            + (doShowExtendedColumns ? /* "<th width='1%' class='rlHeader'>" + wtRankHeader + "</th>" */ ""
//            + suAvWinTimeAndTotalGameTimeTh
//        :
//        ""
//        )
//            + (cs.isSuperUser() ? ("<th width='1%' class='rlHeader'>" + baRankHeader + "</th>") : "")
            + "</tr>";

        //ui.serverSortArrowsImg(order, "", "rlSortByPlaceImg")

//        var suSortImg = "<td class='rlArrows noRightBorder' style='text-align: center;'>"
//            + that.generateSortImg("rlSortByTotalGameTimeImg", RL_SORT_BY_TOTAL_GAME_TIME)
//            + "</td>"
//            + "<td class='rlArrows noRightBorder' style='text-align: center;'>"
//            + that.generateSortImg("rlSortByAverageWinTimeImg", RL_SORT_BY_AVERAGE_WIN_TIME)
//            + "</td>"
//            + "<td class='rlArrows' style='text-align: center;'>"
//            + that.generateSortImg("rlSortByTotalGameRatingImg", RL_SORT_BY_TOTAL_GAME_RATING)
//            + "</td>";
//            + "<td class='rlArrows' style='text-align: center;'>"
//            + that.generateSortImg("rlSortByTotalWinTimeImg", RL_SORT_BY_TOTAL_WIN_TIME)
//            + "</td>";

        tableContents += "<tr class='rlArrowsRow'>"
            + tdr.renderTableSortTrContents()
            + "</tr>";

//        tableContents += "<tr class='rlArrowsRow'>"
//            + "<td class='noRightBorder "
//            + (sortBy == RL_SORT_BY_SOLVED_COUNT ? "noArrows" : "rlArrows")
//            + "'>" //  colspan='2'
//            + (sortBy == RL_SORT_BY_SOLVED_COUNT ? "&nbsp;" : " &nbsp;<img src='/img/icons/sort-both.png' id='rlSortByPlaceImg' alt=''/>")
//            + "</td>"
////            + "<td class='noRightBorder rlArrows'>&nbsp;</td>"
//            + "<td class='noRightBorder rlArrows' colspan='2' style='text-align: left !important;'>"
//            + "<table width='100%' class='noBordersTable' style='border-collapse: collapse;' cellpadding='0' cellspacing='0'>"
//            + "<tr>"
//            + "<td style='padding-left: 0; padding-right: 10px; color: #777;'>Поиск: </td>"
//            + "<td width='50%' style='padding: 0 0 0 0;'>"
//            + "<input id='rlUsernameFilter' style='width:100% !important; min-width: 75px; display: inline;' value='" + usernamePrefixFilter + "'/>"
//            + "</td>"
//            + "<td width='50%' id='rlClearUsernamePrefixFilterTd'>"
//            + "<img src='/img/icons/cross_12_12_a64.png' style='padding-left: 10px;' alt='' />"
//            + "</td>"
//            + "<td width='50%' id='rlFilterUsernamePrefixTd'>"
//            + "<img src='/img/icons/accept_12_12_a64.png' style='padding-left: 10px;' alt='' />"
//            + "</td>"
//            + "</tr>"
//            + "</table>"
//            + "</td>"
//            + "<td class='noRightBorder rlArrows' style='text-align: center;'>"
//            + (sortBy == RL_SORT_BY_REG_DATE ? ui.serverSortArrowsImg(order, "", "rlSortByRegDateImg") : " &nbsp;<img src='/img/icons/sort-both.png' id='rlSortByRegDateImg' alt=''/>")
//            + "</td>"
////            + "<td class='noRightBorder rlArrows'>"
////            + (sortBy == RL_SORT_BY_SOLVED_COUNT ? ui.serverSortArrowsImg(!order, "", "rlSortBySolvedCountImg") : " &nbsp;<img src='/img/icons/sort-both.png' id='rlSortBySolvedCountImg' alt=''/>")
////            + "</td>"
//            + "<td class='noRightBorder noArrows'>&nbsp;</td>"
//            + "<td class='noRightBorder noArrows'>&nbsp;</td>"
////            + "<td class='noRightBorder rlArrows'>"
////            + (sortBy == RL_SORT_BY_PLAYED_COUNT ? ui.serverSortArrowsImg(order, "", "rlSortByPlayedCountImg") : " &nbsp;<img src='/img/icons/sort-both.png' id='rlSortByPlayedCountImg' alt=''/>")
////            + "</td>"
//            + "<td class='noRightBorder noArrows'>&nbsp;</td>"
//            + "<td class='rlArrows'>"
//            + (sortBy == RL_SORT_BY_SOLVED_RATIO ? ui.serverSortArrowsImg(order, "", "rlSortBySolvedRatioImg") : " &nbsp;<img src='/img/icons/sort-both.png' id='rlSortBySolvedRatioImg' alt=''/>")
//            + "</td>"
////            + "<td class='rlArrows'>"
////            + (sortBy == RL_SORT_BY_WT_RANK ? ui.serverSortArrowsImg(order, "", "rlSortByRank2Img") : " &nbsp;<img src='/img/icons/sort-both.png' id='rlSortByRank2Img' alt=''/>")
////            + "</td>"
//            + (
//            doShowExtendedColumns ? "<td class='noArrows'>&nbsp;</td>"
//                + (cs.isSuperUser() ? suSortImg : "") : ""
//            )
////            + (cs.isSuperUser() ? ("<td class='rlArrows'>"
////            + (sortBy == RL_SORT_BY_BA_RANK ? ui.serverSortArrowsImg(order, "", "rlSortByRankImg") : " &nbsp;<img src='/img/icons/sort-both.png' id='rlSortByRankImg' alt=''/>")
////            + "</td>") : "")
//            + "</tr>";

//        if (sortBy == RL_SORT_BY_SOLVED_COUNT) {
//            ratingList.sortBy('place', order);
//        } else if (sortBy == RL_SORT_BY_REG_DATE) {
//            ratingList.sortBy('regTimeTS', order);
//        } else if (sortBy == RL_SORT_BY_SOLVED_COUNT) {
//            ratingList.sortBy('solvedCount', order);
//        } else if (sortBy == RL_SORT_BY_PLAYED_COUNT) {
//            ratingList.sortBy('playedCount', order);
//        } else if (sortBy == RL_SORT_BY_SOLVED_RATIO) {
//            ratingList.sortByMultipleFields({
//                    field1 : {field : 'solvedRatio', order : order},
//                    field2 : {field : 'solvedCount', order : order}
//                }
//            );
//        } else if (sortBy == RL_SORT_BY_BA_RANK) {
//            ratingList.sortBy('firstPlacesByRank', order);
//        } else if (sortBy == RL_SORT_BY_WT_RANK) {
//            ratingList.sortBy('firstPlacesByRank2', order);
//        }

//        var ratingDataSet = ratingList.getDataSet();

        var place = -1;

        var tableInternals = "";

        var userRating = null;
        var userData = null;
        var userStyle = "";

        for (var rowNumber = 0; rowNumber < ratings.length; rowNumber++) {
            var rating = ratings[rowNumber];

            if (filter == RL_SHOW_ALL_RATINGS && rating.isGuest) {
                continue;
            }

            if (filter == RL_SHOW_ONLINE_RATINGS && (!rating.isOnline || rating.isGuest && !cs.isSuperUser())) {
                continue;
            }

            if (filter == RL_SHOW_GUEST_RATINGS && (!rating.isGuest || !cs.isSuperUser())) {
                continue;
            }

            var isCurrentUser = rating.playerId == cs.getUserId();

            var tableData = that.rlGenerateTableData(rating, false, doShowExtendedColumns);

            var color = OFFLINE_COLOR;

            if (rating.isOnline) {
                color = ONLINE_COLOR;
            }

//            if (rating.playerId == 40) {
//                rating.isOnline = true;
//                rating.isAway = true;
//            }

            if (rating.isOnline && !rating.isActive) {
                color = INACTIVE_COLOR;
            }

            if (isCurrentUser) {
                color = ONLINE_COLOR;
            }

//            if (!cs.isSuperUser()) {
//                color = OFFLINE_COLOR;
//            }

            var style = "background-color: " + color + ";";

            if (isCurrentUser) {
                style = style + " font-weight:bold;"
                place = rating.place;
                if (rowNumber >= SHOW_DUP_USER_ROW_AFTER) {
                    userStyle = "background-color: #F7F7F7;";
                    userRating = rating;
                }
            }

            tableInternals += "<tr style='" + style + ";' id='rlRow" + rowNumber + "'>"
                + tableData
                + "</tr>";
        }

//        if (userRating != null) {
        if (data.userRatingRow != null) {
//        var userRow = "<tr style='font-weight: bold; border-bottom:2px solid #AAA; height: 40px;'>"
//            + "<td class='noRightBorder' style='vertical-align: middle; white-space: nowrap; text-align: center;' width='35%'><p>Ваше место: " + userRating.place
//            + "</p></td>" + "<td class='noRightBorder'>&nbsp;</td>"
//            + "<td style='vertical-align: middle;' class='noRightBorder'><p>"
//            + userRating.solvedCount + "<sup class='greenSup'>"
//            + (userRating.todayWonTotal > 0 ? "+" + userRating.todayWonTotal : "&nbsp;") + "</sup></p>"
//            + "<td style='vertical-align: middle;' class='noRightBorder'><p>/</p></td>"
//            + "<td style='vertical-align: middle;' class='noRightBorder'><p>"
//            + userRating.playedCount + "<sup class='greenSup'>"
//            + (userRating.todayPlayedTotal > 0 ? "+" + userRating.todayPlayedTotal : "&nbsp;") + "</sup></p></td>"
//            + "<td><p class='rlWonPercentage'>" + calcPercent(userRating.solvedCount, userRating.playedCount) + "%<sup>&nbsp;</sup></p></td>"
//            + "<td style='text-align: center; vertical-align: middle;' width='25%'><p>" + userRating.firstPlacesByRank2 + "</p></td>"
//            + "<td style='text-align: center; vertical-align: middle;' width='25%'><p>" + userRating.firstPlacesByRank + "</p></td>"
//            + "</tr>"

            var userData = that.rlGenerateTableData(data.userRatingRow, true, doShowExtendedColumns);

            tableContents += "<tr style='" + userStyle + " border-bottom:2px solid #AAA; height: 30px;'>" + userData + "</tr>" + tableInternals + "</table>";
        } else {
            tableContents += tableInternals + "</table>";
        }

        $("#ratingsContents").empty();

//    if (place != -1) {
//        $("#ratingsContents").append("<p style='margin-top:0px; float: left;'>Ваше место: " + place + "</p>");
//    }

        var rlGuestFilter = "";

//        + (filter != RL_SHOW_ALL_RATINGS ? "'actionText2'" : "'disabledText'")
//                + " id='showAllRatings'>все игроки</span>"
//                + rlOnlineFilter

//        if (cs.isSuperUser()) {
//            rlOnlineFilter = "&nbsp;&nbsp;&nbsp;&nbsp;"
//                + "<span class="
//                + (filter != RL_SHOW_ONLINE_RATINGS ? "'actionText2'" : "'disabledText'")
//                + " id='showOnlineRatings'>сейчас на сайте</span>";
//        }

        if (cs.isSuperUser()) {
            rlGuestFilter =
                renderMenu([
                    {
                        id : "showCommonRating",
                        text : "все игроки",
                        isActive : filter == RL_SHOW_COMMON_RATING
                    },
                    {
                        id : "showAllRatings",
                        text : "зарег.",
                        isActive : filter == RL_SHOW_ALL_RATINGS
                    },
                    {
                        id : "showGuestRatings",
                        text : "гости",
                        isActive : filter == RL_SHOW_GUEST_RATINGS
                    },
                    {
                        id : "showOnlineRatings",
                        text : "сейчас на сайте",
                        isActive : filter == RL_SHOW_ONLINE_RATINGS
                    }
                ])
//                + "<span class=" +
//                (filter != RL_SHOW_GUEST_RATINGS ? "'actionText2'" : "'disabledText'")
//                + " id='showGuestRatings'>только гости</span>"
//                + "&nbsp;&nbsp;&nbsp;&nbsp;"
//                + "<span class=" +
//                (filter != RL_SHOW_COMMON_RATING ? "'actionText2'" : "'disabledText'")
//                + " id='showCommonRating'>все игроки</span>"
                + "&nbsp;&nbsp;&nbsp;&nbsp;"
                + "<a style='color: #006699;' target='_blank' href='/admin/'>Админка</a>"
                + "&nbsp;&nbsp;&nbsp;&nbsp;"
                + "<a style='color: #006699;' target='_blank' href='/kosynka/_stats/_profiles.php'>профили</a>"
                + "&nbsp;&nbsp;&nbsp;&nbsp;"
                + "<a style='color: #006699;' target='_blank' href='https://docs.google.com/spreadsheet/ccc?key=0AqEgIQ1K8gzAdHB2dEJGRUlJb2xya2JCdUM2WFZwd0E#gid=5'>план р-ты</a>"
                + "<br /><br />";
        }

        if (that.options.showTimeRatings || cs.isSuperUser()) {
            var rlTimeFilters = "";
//            var rlTimeFilters = renderMenu([
//                {
//                    id : "rlAbsolute",
//                    text : i18n.get("absoluteRatingMenuLabel"),
//                    isActive : that.timeFilter == null
//                },
//                {
//                    id : "rlPast2012",
//                    text : "2012",
//                    isActive : that.timeFilter != null && that.timeFilter.year == 2012 && that.timeFilter.month == 0
//                },
//                {
//                    id : "rlPast2013",
//                    text : "2013",
//                    isActive : that.timeFilter != null && that.timeFilter.year == 2013 && that.timeFilter.month == 0
//                },
//                {
//                    id : "rl2013_1",
//                    text : i18n.getMonthShort(I18n.JANUARY) + " 2013",
//                    isActive : that.timeFilter != null && that.timeFilter.year == 2013 && that.timeFilter.month == 1
//                },
//                {
//                    id : "rl2013_2",
//                    text : i18n.getMonthShort(I18n.FEBRUARY) + " 2013",
//                    isActive : that.timeFilter != null && that.timeFilter.year == 2013 && that.timeFilter.month == 2
//                },
//                {
//                    id : "rl2013_3",
//                    text : i18n.getMonthShort(I18n.MARCH) + " 2013",
//                    isActive : that.timeFilter != null && that.timeFilter.year == 2013 && that.timeFilter.month == 3
//                },
//                {
//                    id : "rl2013_4",
//                    text : i18n.getMonthShort(I18n.APRIL) + " 2013",
//                    isActive : that.timeFilter != null && that.timeFilter.year == 2013 && that.timeFilter.month == 4
//                }
//            ], "&nbsp;&nbsp;&nbsp;") + "&nbsp;&nbsp;&nbsp;&nbsp;";
        } else {
            rlTimeFilters = "";
        }

        var rlOnlineFilter = "";

        var rlSubFilters = that.renderSubFilters(data.subFilters);

        if (cs.isSuperUser()) {
            rlOnlineFilter = "&nbsp;&nbsp;&nbsp;&nbsp;"
                + "<span class="
                + (filter != RL_SHOW_ONLINE_RATINGS ? "'actionText2'" : "'disabledText'")
                + " id='showOnlineRatings'>сейчас на сайте</span>";
        }

        if (cs.isSuperUser()) {
            $("#ratingsContents").append("<p style='margin-top:3px; margin-bottom:10px; margin-left: 1px; float: left;'>"
//                "<span class="
//                + (filter != RL_SHOW_ALL_RATINGS ? "'actionText2'" : "'disabledText'")
//                + " id='showAllRatings'>все игроки</span>"
//                + rlOnlineFilter
                + rlGuestFilter
                + rlTimeFilters
                + rlSubFilters
                + "<img src='/img/icons/loading.gif' id='rlLoadingImg' />"
                + "</p>");
        } else {
            $("#ratingsContents").append("<p style='margin-top:3px; margin-bottom:10px; margin-left: 1px; float: left;'>"
                + rlTimeFilters
                + rlSubFilters
                + "&nbsp;"
                + "<img src='/img/icons/loading.gif' id='rlLoadingImg' />"
                + "</p>");
        }

//        if (cs.isSuperUser()) {
//            $("#rlLoadingImg").css("left", "505px");
//        }

        $("#showAllRatings").click(function () {
            filter = RL_SHOW_ALL_RATINGS;
            that.loadAndRender(true);
        });

        $("#showOnlineRatings").click(function () {
            filter = RL_SHOW_ONLINE_RATINGS;
            that.loadAndRender(true);
        });

        $("#showGuestRatings").click(function () {
            filter = RL_SHOW_GUEST_RATINGS;
            that.loadAndRender(true);
        });

        $("#showCommonRating").click(function () {
            filter = RL_SHOW_COMMON_RATING;
            that.loadAndRender(true);
        });

        $("#ratingsContents").append(tableContents);

        if (cs.isSuperUser() && filter == RL_SHOW_ALL_RATINGS && usernamePrefixFilter == "" && !that.timeFilter && !that.activeSegmentFilter) {
            var loaderRenderer = new LoaderRenderer(that.loader, "players"); // , "userHistory"

            $("#ratingsContents").append(loaderRenderer.render());

            loaderRenderer.bindEvents();
        }

        if (usernamePrefixFilter == "") {
            $("#rlClearUsernamePrefixFilterTd").hide();
            $("#rlFilterUsernamePrefixTd").show();
        } else {
            $("#rlFilterUsernamePrefixTd").hide();
            $("#rlClearUsernamePrefixFilterTd").show();
        }

        $("#rlFilterUsernamePrefixTd").click(function () {
            usernamePrefixFilter = $("#rlUsernameFilter").val();
            that.loadAndRender(true);
        });

        $("#rlClearUsernamePrefixFilterTd").click(function () {
            usernamePrefixFilter = "";
            that.loadAndRender(true);
        });

        if (!cs.isLogged()) {
            $("#ratingsContents").append("<p class='ratingsRegPrompt'>"
                + i18n.get("regForRatingAlert") + "</p>");
            $("#rlReg").click(function () {
                ui.showRegPanel();
            });
        }

        if (ratings.length > SHOW_SHORTCUTS_AFTER) {
            var auxAppendix = "<div style='padding-top: 10px; background-color: white;'>";
            auxAppendix += "<div class='bspAuxBtn' style='float: left;' id='ratingsScroll'>[" + i18n.get("auxScrollTop") + "]</div>";
            auxAppendix += "<div class='bspAuxBtn' style='float: right;' id='ratingsClose'>[" + i18n.get("auxClose") + "]</div>";
            auxAppendix += "<div class='clear'></div>";
            auxAppendix += "</div>";

            $("#ratingsContents").append(auxAppendix);

            $("#ratingsScroll").click(function () {
                $("html, body").animate({scrollTop : $("#ratingsPanel").offset().top - iDiv($("#gameArea").width(), 3)});
            });

            $("#ratingsClose").click(function () {
                ui.hidePanel("ratingsPanel");
            });
        }

        for (var i = 0; i < ratings.length; i++) {
            var playerId = ratings[i].playerId;
            var playerName = i18n.transliterate(ratings[i].username);

            if (filter == RL_SHOW_ONLINE_RATINGS && !rating.isOnline) {
                continue;
            }

            $("#rlShowPlayerDetail" + playerId).click(function (_playerId, playerName) {
                return function () {
                    that.fillPlayerDetail(_playerId, playerName, false);
                };
            }(playerId, playerName));

            if (playerId == cs.getUserId()) {
                $("#rlShowPlayerDetail" + playerId + "u").click(function (_playerId, playerName) {
                    return function () {
                        that.fillPlayerDetail(_playerId, playerName, true);
                    };
                }(playerId, playerName));
            }
        }

        if (data.subFilters) {
            for (i in data.subFilters) {
                var subFilter = data.subFilters[i];

                $("#" + subFilter.id).click(function (subFilter) {
                    return function () {
                        that.applySubFilter(subFilter);
                    }
                }(subFilter));
            }
        }

        if (that.options.showTimeRatings || cs.isSuperUser()) {
            $("#rlAbsolute").click(function () {
                that.timeFilter = null;
                that.loadAndRender(true);
            });

            $("#rlPast2012").click(function () {
                that.applyTimeFilter(2012, 0);
            });

            $("#rlPast2013").click(function () {
                that.applyTimeFilter(2013, 0);
            });

            $("#rl2013_1").click(function () {
                that.applyTimeFilter(2013, 1);
            });

            $("#rl2013_2").click(function () {
                that.applyTimeFilter(2013, 2);
            });
            $("#rl2013_3").click(function () {
                that.applyTimeFilter(2013, 3);
            });
            $("#rl2013_4").click(function () {
                that.applyTimeFilter(2013, 4);
            });
        }

        tdr.bindHeaderActions(that);

//        if (sortBy != RL_SORT_BY_SOLVED_COUNT) {
//            that.bindHeaderAction("#rlSortByPlace, #rlSortByPlaceImg", RL_SORT_BY_SOLVED_COUNT, true, true);
//        }

//        that.bindHeaderAction("#rlSortByRank2, #rlSortByRank2Img", RL_SORT_BY_WT_RANK, false);
//        that.bindHeaderAction("#rlSortByRegDate, #rlSortByRegDateImg", RL_SORT_BY_REG_DATE, false);
//        that.bindHeaderAction("#rlSortBySolvedCount, #rlSortBySolvedCountImg", RL_SORT_BY_SOLVED_COUNT, false);
//        that.bindHeaderAction("#rlSortByPlayedCount, #rlSortByPlayedCountImg", RL_SORT_BY_PLAYED_COUNT, false);
//        that.bindHeaderAction("#rlSortBySolvedRatio, #rlSortBySolvedRatioImg", RL_SORT_BY_SOLVED_RATIO, false);

        //rlSortByTotalGameTime
//        that.bindHeaderAction("#rlSortByTotalGameTime, #rlSortByTotalGameTimeImg",
//            RL_SORT_BY_TOTAL_GAME_TIME, false);
//        that.bindHeaderAction("#rlSortByAverageWinTime, #rlSortByAverageWinTimeImg",
//            RL_SORT_BY_AVERAGE_WIN_TIME, true);
//
//        that.bindHeaderAction("#rlSortByTotalGameRating, #rlSortByTotalGameRatingImg",
//            RL_SORT_BY_TOTAL_GAME_RATING, false);

//        that.bindHeaderAction("#rlSortByTotalWinTime, #rlSortByTotalWinTimeImg",
//            RL_SORT_BY_TOTAL_WIN_TIME, false);

//        if (sortBy != RL_SORT_BY_SOLVED_COUNT) {
//            $("#rlSortByPlace").mouseenter(function () {
//                ui.showHint("#rlSortByPlace", "Сортировать по<br />месту в рейтинге");
//            });
//
//            $("#rlSortByPlaceImg").mouseenter(function () {
//                ui.showHint("#rlSortByPlaceImg", "Сортировать по<br />месту в рейтинге");
//            });
//        }

//        $("#rlSortByRegDate").mouseenter(function () {
//            ui.showHint("#rlSortByRegDate", "Сортировать по<br />дате регистрации");
//        });
//
//        $("#rlSortByRegDateImg").mouseenter(function () {
//            ui.showHint("#rlSortByRegDateImg", "Сортировать по<br />дате регистрации");
//        });

//        $("#rlSortBySolvedCount").mouseenter(function () {
//            ui.showHint("#rlSortBySolvedCount", "Сортировать по<br />количеству решённых раскладов");
//        });
//
//        $("#rlSortBySolvedCountImg").mouseenter(function () {
//            ui.showHint("#rlSortBySolvedCountImg", "Сортировать по<br />количеству решённых раскладов");
//        });

//        $("#rlSortByPlayedCount").mouseenter(function () {
//            ui.showHint("#rlSortByPlayedCount", "Сортировать по<br />количеству сыгранных раскладов");
//        });
//
//        $("#rlSortByPlayedCountImg").mouseenter(function () {
//            ui.showHint("#rlSortByPlayedCountImg", "Сортировать по<br />количеству сыгранных раскладов");
//        });

//        $("#rlSortBySolvedRatio").mouseenter(function () {
//            ui.showHint("#rlSortBySolvedRatio", "Сортировать по<br />проценту выигранных раскладов");
//        });
//
//        $("#rlSortBySolvedRatioImg").mouseenter(function () {
//            ui.showHint("#rlSortBySolvedRatioImg", "Сортировать по<br />проценту выигранных раскладов");
//        });

//        $("#rlSortByRank").mouseenter(function () {
//            ui.showHint("#rlSortByRank", "Сортировать по количеству<br />лучших попыток");
//        });

//        $("#rlSortByRankImg").mouseenter(function () {
//            ui.showHint("#rlSortByRankImg", "Сортировать по количеству<br />лучших попыток");
//        });
//
//        $("#rlSortByRank2").mouseenter(function () {
//            ui.showHint("#rlSortByRank2", "Сортировать по количеству<br />1-х мест по времени до решения");
//        });
//
//        $("#rlSortByRank2Img").mouseenter(function () {
//            ui.showHint("#rlSortByRank2Img", "Сортировать по количеству<br />1-х мест по времени до решения");
//        });

//        "#rlSortByPlace, #rlSortByPlaceImg, "        +

//        $("#rlSortByRegDate, #rlSortByRegDateImg, "
////            + "#rlSortBySolvedCount, #rlSortBySolvedCountImg, "
////            + /"#rlSortByPlayedCount, #rlSortByPlayedCountImg, "
//            + "#rlSortBySolvedRatio, #rlSortBySolvedRatioImg, "
////            + "#rlSortByRank, #rlSortByRankImg, "
////            + "#rlSortByRank2, #rlSortByRank2Img"
//        ).mouseleave(function () {
//                ui.hideHint();
//            });

        $("#rlUsernameFilter").autocomplete({
            source : function (request, response) {
                cs.sendRequest(GTW_USERNAME_FILTER, {
                    usernamePrefix : request.term,
                    subFilter : that.activeSubFilter ? that.activeSubFilter.value : null
                }, function (result, data) {
                    response(data);
                });
            },
            minLength : 1,
            select : function (event, ui) {
                usernamePrefixFilter = ui.item ? ui.item.value : this.value;
                that.loadAndRender(true);
            }
        });

        $("#rlUsernameFilter").keydown(function (event) {
            if (event.which == KEY_ENTER) {
                usernamePrefixFilter = ui.item ? ui.item.value : this.value;
                that.loadAndRender(true);
                event.preventDefault();
            } else if (event.which == KEY_ESC) {
                usernamePrefixFilter = "";
                that.loadAndRender(true);
                event.preventDefault();
            } else {
                $("#rlClearUsernamePrefixFilterTd").hide();
                $("#rlFilterUsernamePrefixTd").show();
            }
        });
    }

    this.rlGenerateTableData = function (rating, isUserSpecialRow, doShowExtendedColumns) {
        var isUserSpecialRow = isDef(isUserSpecialRow) ? isUserSpecialRow : false;
        var idAppx = isUserSpecialRow ? "u" : "";

        rating.username = i18n.transliterate(rating.username);

        var isNovice = Math.abs(rating.appearanceTS - nowTS()) <= 24 * 3600;

        var suAvWinTimeAndTotalGameTimeTd = "";
        if (cs.isSuperUser() && !that.activeSegmentFilter) {
            suAvWinTimeAndTotalGameTimeTd = "<td nowrap='true' style='color: #AAA; vertical-align: top !important; text-align: right;' class='noRightBorder'>"
                + "<span>" + suFormatTotalGameTime(rating.totalGameTime) + "</span>" + "<sup>&nbsp;</sup></td>"
                + "<td nowrap='true' style='color: #AAA; vertical-align: top !important; text-align: right;' class='noRightBorder'>"
                + "<span>" + (rating.averageWinTime ? formatGameTimeMS(rating.averageWinTime) : "—") + "</span>" + "<sup>&nbsp;</sup></td>"
                + "<td nowrap='true' style='color: #AAA; vertical-align: top !important; text-align: right;'>"
                + "<span>" + suFormatTotalGameTime(rating.totalGameRating) + "</span>" + "<sup>&nbsp;</sup></td>";
//                + "<td nowrap='true' style='color: #AAA; vertical-align: top !important; text-align: right;'>"
//                + "<span>" + suFormatTotalGameTime(rating.totalWinTime) + "</span>" + "<sup>&nbsp;</sup></td>"
        }

        var championMark = "<sup>&nbsp;</sup>";

        if (that.timeFilter && that.timeFilter.year && !that.timeFilter.month) {
            var championMarkAppx = " " + that.timeFilter.year + " " + i18n.get("yearChampionMarkAppx");
        } else if (that.timeFilter && that.timeFilter.year && that.timeFilter.month) {
            championMarkAppx = " " + i18n.getMonthBeta(that.timeFilter.month); // + " " + that.timeFilter.year + " года";
        } else {
            championMarkAppx = "";
        }

        if (that.activeSegmentFilter != 0) {
            championMarkAppx = " " + i18n.get("segmentChampionMarkAppx");
        }

        if (!that.timeFilter && that.activeSegmentFilter == 0) {
            var championMarkPrefix = i18n.get("absoluteChampionMarkPrefix") + " ";
        } else {
            championMarkPrefix = "";
        }

        if (!rating.isGuest) {
            if (rating.place == 1) {
                var championMark = "<sup style='color: #C42E21;'> " + championMarkPrefix + i18n.get("championMark") + championMarkAppx + "</sup>";
            } else if (rating.wasChampion && rating.place > 1 || rating.championship) {
                championMark = "<sup style='color: #C42E21;'> " + i18n.get("exChampionMark") + "</sup>";

                if (rating.championship) {
                    championMark = "<sup style='color: #C42E21;'> " + rating.championship + "</sup>";
                }
            }
        }


        var ratingPlaceString = rating.place + ".";

        if (rating.place == 0) {
            ratingPlaceString = "";
        }

        if (cs.isSuperUser()) {
//            var suIsActiveTd = (rating.isOnline && !rating.isActive) ? "<span><img alt='' src='/img/away.png' /></span>&nbsp;&nbsp;" : "";
            //var placeColspan = "";
        } else {
//            suIsActiveTd = "";
            //var placeColspan = " colspan='2'";
        }

        if (isUserSpecialRow) {
            var placeString = (rating.place != 0) ? (" (" + rating.place + " " + i18n.get("placeSuffix") + ")") : "";

            var ratingPlaceUsernamePhotoString = "<td class='noRightBorder' style='white-space: nowrap; vertical-align: top !important; text-align: right;'>"
                + "<span><b> </b></span><sup>&nbsp;</sup>"
                + "</td>"
                + "<td colspan='2' class='noRightBorder' style='white-space: nowrap; vertical-align: top !important;'>"
                + "<span><b>" + i18n.get("userRowPrefix") + ":</b></span><sup>&nbsp;</sup>"
                + "<span>" + formatUsername(rating.username)
                + placeString + "</span><sup>&nbsp;</sup>"
                + "</td>";
        } else {
            var ratingPlaceUsernamePhotoString =
                "<td class='noRightBorder' style='white-space: nowrap; vertical-align: top !important; text-align: right;'>"
                    + "<span>" + ratingPlaceString + "</span>" + "<sup>&nbsp;</sup></td>"
                    + "<td class='noRightBorder' style='white-space: nowrap; vertical-align: top !important;' width='30%'>"
                    + "<span class='activeText' id='rlShowPlayerDetail" + rating.playerId + idAppx + "'>"
                    + formatUsername(rating.username) + "</span>" + championMark
                    // + "<div style='display: none;' class='rlPlayerDetailContent' id='rlPlayerDetailContent" + rating.playerId + idAppx + "'></div>"
                    + "</td>"
                    + "<td class='noRightBorder' style='width: 1%; padding-right: 10px; vertical-align: middle !important;'>"
                    + (rating.photo != null ? "<a href='" + rating.photo + "' rel='lightbox'><img src='/img/icons/camera.png' alt=''/></a>" : "")
                    + "</td>";
        }

        var tableData = ratingPlaceUsernamePhotoString
            + "<td style='color: #AAA; vertical-align: top !important; text-align: center;' class='noRightBorder'>" + (
            isNovice ?
                "<span style='color: #C42E21 !important;'>" + i18n.get("noviceMark") + "</span>"
                :
                "<span>" + formatDate(rating.appearanceTS) + "</span>"
            ) + "<sup>&nbsp;</sup></td>" //  + " <span style='font-size: 6pt;'>(" + formatDate(rating.appearanceTS) + ")</span>"
            + "<td style='vertical-align: top !important;' class='noRightBorder'><p>"
            + "<span id='rlShowSolved" + rating.playerId + idAppx + "'>" + rating.solvedCount + "</span>"
            + "<sup class='greenSup'>"
            + (rating.todayWonTotal > 0 ? "+" + rating.todayWonTotal : "&nbsp;")
            + "</sup></p></td>"
            + "<td style='vertical-align: top !important;' class='noRightBorder'><span>/</span><sup>&nbsp;</sup></td>"
            + "<td style='vertical-align: top !important;' class='noRightBorder'><p>"
            + "<span id='rlShowPlayed" + rating.playerId + idAppx + "'>" + rating.playedCount + "</span>"
            + "<sup class='greenSup'>"
            + (rating.todayPlayedTotal > 0 ? "+" + rating.todayPlayedTotal : "&nbsp;")
            + "</sup></p></td>"
            + "<td style='vertical-align: top !important; text-align: center;'><p class='rlWonPercentage'>"
            + calcPercent(rating.solvedCount, rating.playedCount) + "<sup>&nbsp;</sup></p>"
            + "</td>"
            + (doShowExtendedColumns ? "<td style='vertical-align: top !important; text-align: center;' width='25%'><p>"
            + ((rating.isGuest || !rating.firstPlacesByRank2) ? "—" : rating.firstPlacesByRank2)
            + "<sup>&nbsp;</sup></p></td>"
            + suAvWinTimeAndTotalGameTimeTd : "");
//            + (cs.isSuperUser() ? ("<td style='vertical-align: top !important; text-align: center;' width='25%'><p>"
//            + (rating.isGuest ? "—" : rating.firstPlacesByRank)
//            + "<sup>&nbsp;</sup></p></td>") : "");

        return tableData;
    }

    this.fillPlayerDetail = function (playerId, playerUsername, isUserSpecialRow) {
        var isUserSpecialRow = isDef(isUserSpecialRow) ? isUserSpecialRow : false;
        var idAppx = isUserSpecialRow ? "u" : "";

        $("#rlLoadingImg").show();

        cs.sendRequest(GTW_PLAYER_DETAIL, {
            playerId : playerId,
            subFilter : that.activeSubFilter ? that.activeSubFilter.value : null
        }, function (result, data) {
            var playerDetail = data.playerDetail;
            var playerTotalGameTime = data.totalGameTime;
            var playerAverageWinTime = data.averageWinTime;
            var profile = data.profile;

            var self = (playerId == cs.getUserId());

            $("#rlLoadingImg").hide();

            var playerDetailContents = "<h4 style='padding-left: 5px; text-align: center;'>" + playerUsername + "</h4>";

            playerDetailContents += PlayerProfile.renderProfile(profile, cs.isGuest());

            var playerGames = "<table width='93%' class='noBordersTable' style='margin-bottom: 10px; margin-left: 10px;' cellpadding='0' cellspacing='0'>";
//            var wonGameCount = 0;
            var userGames = "<table width='93%' class='noBordersTable' style='margin-bottom: 10px; margin-left: 10px;' cellpadding='0' cellspacing='0'>";
//            var unsolvedGameCount = 0;

            var totalWinTime = 0;

//            if (cs.isSuperUser()) {
//                playerGames += "<tr class='pdRow'>"
//                    + "<th>Расклад</th>"
//                    + "<th style='text-align: right'>/</th>"
//                    + "<th style='text-align: right'>вр реш</th>"
//                    + "<th style='text-align: left'>(</th>"
//                    + "<th style='text-align: right'>вр реш " + cs.getUsername() + "</th>"
//                    + "<th>)</th>"
//                    + "</tr>"
//                    + "<tr><td colspan='6'>&nbsp;</td></tr>";
//
//                userGames += "<tr class='pdRow'>"
//                    + "<th>Расклад</th>"
//                    + "<th style='text-align: right'>/</th>"
//                    + "<th style='text-align: right'>вр реш</th>"
//                    + "<th style='text-align: left'>(</th>"
//                    + "<th style='text-align: right'>вр реш " + cs.getUsername() + "</th>"
//                    + "<th>)</th>"
//                    + "</tr>"
//                    + "<tr><td colspan='6'>&nbsp;</td></tr>";
//            }

//            var playerTotalGameTime = 0;
            var playerTotalWinTime = 0;
            var playerWinCount = 0;

            for (var i = 0; i < playerDetail.length; i++) {
                var gameId = playerDetail[i].gameId;
//                var winTime = playerDetail[i].winTime;
//                var totalElapsed = playerDetail[i].totalElapsed;

                var pd = playerDetail[i];

                var suTd = "";
                var playerTableRowClass = "";

//                if (cs.isSuperUser()) {
//                    var suWinTime = playerDetail[i].suWinTime;
//                    var suGameTime = playerDetail[i].suGameTime;
//                    if (suGameTime > 0) {
//                        suTd = "<td " + (suWinTime == 0 ? " class='faded'" : "") + ">(</td>"
//                            + "<td style='float: right;' " + (suWinTime == 0 ? " class='faded'" : "") + ">" + (
//                            suWinTime == 0 ?
//                                formatGameTimeMS(suGameTime) :
//                                formatGameTimeMS(suWinTime)
//                            ) + "</td>"
//                            + "<td " + (suWinTime == 0 ? " class='faded'" : "") + ">)</td>";
//                    }
//
//                    if (suWinTime > 0) {
//                        playerTableRowClass = " class='pdRow rowWon'";
//                    } else if (suGameTime > 0) {
//                        playerTableRowClass = " class='pdRow rowPlayed'";
//                    } else {
//                        playerTableRowClass = " class='pdRow'";
//                    }
//                } else {
//                    playerTableRowClass = " class='pdRow'";
//                }

//                playerTableRowClass = " class='pdRow'";

//                playerTotalGameTime += pd.playerTotalGameTime;

                if (pd.playerWinTime > 0) {
                    var playerTableRowClass = " class='pdRow rowWon'";
                    var formatedPlayerGameTime = formatGameTimeMS(pd.playerWinTime);

                    playerTotalWinTime += pd.playerWinTime;
                    playerWinCount++;
                } else {
                    playerTableRowClass = " class='pdRow rowPlayed'";
                    formatedPlayerGameTime = "<span class='pdTotalGameTime'>" + formatGameTimeMS(pd.playerTotalGameTime) + "</span>";
                }

                playerGames +=
                    "<tr" + playerTableRowClass + ">"
                        + "<td style='float: right;'>"
                        + "<span class='actionText' id='pdPlayGame" + gameId + "B'>" + gameId + "</span>"
                        + "</td>"
                        + (that.options.showLabels ? "<td style='color: #777;'>/</td><td style='white-space: nowrap; color: #777;'>" + pd.label + "</td>" : "")
                        + "<td>/</td>"
                        + "<td class='gameTime'>"
                        + formatedPlayerGameTime
                        + "</td>"
                        + "<td width='99%' style='text-align: right !important; padding-right: 20px;'>"
                        + formatDate( playerDetail[i].time)+"</td>"
//                            + suTd
                    + "</tr>"
                    + "<tr class='pdSpacingRow'><td colspan='4'></td></tr>";

                if (pd.userWinTime > 0) {
                    var userTableRowClass = " class='pdRow rowWon'";
                    var formatedUserGameTime = formatGameTimeMS(pd.userWinTime);
                } else if (pd.userTotalGameTime > 0) {
                    userTableRowClass = " class='pdRow rowPlayed'";
                    formatedUserGameTime = "<span class='pdTotalGameTime'>" + formatGameTimeMS(pd.userTotalGameTime) + "</span>";
                } else {
                    userTableRowClass = " class='pdRow rowUnplayed'";
                }

                if (pd.userTotalGameTime > 0) {
                    userGames +=
                        "<tr" + userTableRowClass + ">"
                            + "<td style='float: right;'>"
                            + "<span class='actionText' id='pdPlayGame" + gameId + "'>" + gameId + "</span>"
                            + "</td>"
                            + (that.options.showLabels ? "<td style='color: #777;'>/</td><td style='white-space: nowrap; color: #777;'>" + pd.label + "</td>" : "")
                            + "<td>/</td>"
                            + "<td class='gameTime'>"
                            + formatedUserGameTime
                            + "</td>"
                            + "<td width='99%'>&nbsp;</td>"
                            + "</tr>"
                            + "<tr class='pdSpacingRow'><td colspan='4'></td></tr>";
                } else {
                    userGames +=
                        "<tr" + userTableRowClass + ">"
                            + "<td colspan='4'>—</td>"
                            + "</tr>"
                            + "<tr class='pdSpacingRow'><td colspan='4'></td></tr>";
                }
            }
            playerGames += "</table>";
            userGames += "</table>";

//            alert(playerGames);

//            userGames += "</table>";

//            if (wonGameCount > 0) {
//                var playerAverageWinTime = totalWinTime / wonGameCount;
//            }

            // +++TODO
//            if (playerWinCount > 0) {
//                var playerAverageWinTime = playerTotalWinTime / playerWinCount;
//            } else {
//                playerAverageWinTime = 0;
//            }

            // "<p class='pdAverageWinTime'>Среднее время решения: " + formatGameTimeMS(playerAverageWinTime) + "</p>"

//
            var summary = "<td style='text-align: center' width='50%'>"
                + i18n.get("averageWinTimeLabel") + ": "
                + formatGameTimeMS(playerAverageWinTime)
                + "</td>";
            if (cs.isSuperUser()) {
                summary+= "<td style='text-align: center'>"
                    + i18n.get("totalGameTimeLabel") + ": "
                    + formatLargeGameTime(playerTotalGameTime);
            }
            summary+= "</td>";
//            } else {
//                var summary = "<td style='text-align: center' width='100%'>Среднее время решения: "
//                    + formatGameTimeMS(playerAverageWinTime) + "</td>";
//            }

            playerDetailContents += "<table style='width: 100%; border: 1px #CCC solid; padding-bottom: 10px; padding-top: 10px;'><tr>"
                + summary
                + "</tr></table>";

            if (!self) {
                playerDetailContents += "<table class='standartTable' style='margin-top:10px;' width='100%' border='0' vspace='0' cellspacing='0' hspace='0'><tr>"
                    + "<th width='50%'>" + i18n.format("playerResultHeader", playerUsername) + "</th>"
                    + "<th width='50%'>" + i18n.get("userResultHeader") + "</th>"
                    + "</tr>";

                playerDetailContents += "<tr>"
                    + "<td>" + playerGames + "</td>"
                    + "<td>" + userGames + "</td>"
                    + "</tr>";

                playerDetailContents += "</table>";
            } else {
                playerDetailContents += "<div class='pdSelfHint'>" + i18n.get("selfHistoryHint") + "</div>"
            }

//            alert(playerGames);

            if (playerDetail.length > SHOW_SHORTCUTS_AFTER && !self) {
                playerDetailContents += "<div style='margin-top: 5px;'>";
                playerDetailContents += "<div class='bspAuxBtn' style='float: left;' id='pdScroll" + playerId + "'>[" + i18n.get("auxScrollTop") + "]</div>";
                playerDetailContents += "<div class='bspAuxBtn' style='float: right;' id='pdClose" + playerId + "'>[" + i18n.get("auxClose") + "]</div>";
                playerDetailContents += "<div class='clear'></div>";
                playerDetailContents += "</div>";
            }

            var panel = new BottomSubPanel();
            panel.fillContents(playerDetailContents);
            panel.onClose(function (closeType) {
                if (closeType == HIDE_SINGLE_PANEL) {
                    ui.showPanel({id : "ratingsPanel"});
                    $("html, body").scrollTop($("#ratingsPanel").offset().top - iDiv($("#gameArea").width(), 3));
                }
            });
            panel.onShow(function () {
                $("html, body").animate({scrollTop : $("#" + panel.getId()).offset().top - iDiv($("#gameArea").width(), 3)});
            });

//            panel.renderContents("ratingsContents");
            panel.render();

            if (self) {
                $("#pdShowHistory").click(function () {
                    ui.showHistoryPanel();
                });
            }

            if (playerDetail.length > SHOW_SHORTCUTS_AFTER) {
                $("#pdScroll" + playerId).click(function () {
                    $("html, body").animate({scrollTop : $("#" + panel.getId()).offset().top - iDiv($("#gameArea").width(), 3)});
                });
                $("#pdClose" + playerId).click(function () {
                    ui.hidePanel(panel);
                });
            }

            for (var i = 0; i < playerDetail.length; i++) {
                var _gameId = playerDetail[i].gameId;
                $("#pdPlayGame" + _gameId + ", #pdPlayGame" + _gameId + "B").click(function (_gameId) {
//                    alert(_gameId);
                    return function () {
//                        alert(_gameId);
                        if (data.canPlayGames) {
                            gc.requestGame(_gameId, null, function () {
                                ui.showGameInfo(_gameId, false);
                            });
                        } else {
                            alert(i18n.get("wrongGameVariationAlert"));
                        }
                    };
                }(_gameId));
            }
            ui.getUserProfile().bindActions(profile);
        });
//    }

//else {
//        $(".rlPlayerDetailContent").hide();
//    }
//    pdRecentFilter = onlySolved;
    }

//    that.clearIdx = 0;
//
//    this.clearRows = function () {
//        $("#rlRow" + that.clearIdx).remove();
//        that.clearIdx++;
//        if (that.clearIdx <= 500) {
//            setTimeout(function () {
//                    that.clearRows()
//                }, 100
//            );
//        }
//    }

    this.bindAll = function () {
        $("#closeRatingsPanel").click(function () {
            ui.hidePanel("ratingsPanel");

//            that.clearIdx = 0;

//            that.clearRows();
        });
    }

    gc = _gc;
    ui = _ui;

    that.gc = gc;
    that.ui = ui;

    if (isDef(_options) && _options != null) {
        mergeObj(options, _options);
    }

    if (!that.gc.getClientServer().isSuperUser()) {
        options.canFilter = false;
    }

    that.options = options;

    this.bindAll();
}

function suFormatTotalGameTime(time) {
    if (time == 0) {
        return "—";
    }

    time = iDiv(time, 1000);

    var sec = time % 60;
    var min = iDiv(time, 60) % 60;
    var hrs = iDiv(time, 3600);
    var days = iDiv(hrs, 24);

    if (days > 0) {
        return days + " " + I18n.get("daysShortSuffix");
    } else if (hrs > 0) {
        return hrs + " " + I18n.get("hoursShortSuffix");
    } else if (min > 0) {
        return min + " " + I18n.get("minutesShortSuffix");
    } else {
        return sec + " " + I18n.get("secondsShortSuffix");
    }
}

function calcPercent(part, total) {
    var percent = iDiv(part * 100, total);
    if (percent == 99 && part % total > 0){
        percent = parseFloat(percent+'.'+(iDiv(part * 1000, total)-percent*10));
    }
    return percent;
}

function formatUsername(username) {
    if (username.length <= MAX_VISIBLE_USERNAME_LENGTH) {
        return username;
    } else {
        return username.substr(0, MAX_VISIBLE_USERNAME_LENGTH - 3) + "...";
    }
}

function renderMenu(menu, separator) {
    var HTML = "";

    var separator = ifDef(separator, "&nbsp;&nbsp;&nbsp;&nbsp;");

    for (var i = 0; i < menu.length; i++) {
        var item = menu[i];

        itemClass = item.isActive ? "disabledText boldText" : "actionText2";

        HTML += "<span class='" + itemClass + "' id='" + item.id + "'>" + item.text + "</span>"
            + (i < menu.length - 1 ? separator : "");
    }

    return HTML;
}

//function convertMonth(month) {
//    switch (month) {
//        case 1:
//            return "января";
//        case 2:
//            return "февраля";
//        case 3:
//            return "марта";
//        case 4:
//            return "апреля";
//        case 5:
//            return "мая";
//        case 6:
//            return "июня";
//        case 7:
//            return "июля";
//        case 8:
//            return "августа";
//        case 9:
//            return "сентября";
//        case 10:
//            return "октября";
//        case 11:
//            return "ноября";
//        case 12:
//            return "декабря";
//        default:
//            return "";
//    }
//}
var GWT_GAMELIST = "/gw/shared/loadGameList.php";
var GWT_PLAYERLIST = "/gw/shared/loadPlayerList.php";

var GL_SORT_BY_GAME_ID = 0;
var GL_SORT_BY_GAME_RATING = 1;
var GL_SORT_BY_TOTAL_WON = 2;
var GL_SORT_BY_TOTAL_PLAYED = 3;
var GL_SORT_BY_PLAYER_RATING = 4;
var GL_SORT_BY_TOTAL_GAME_RATING = 5;
var GL_SORT_BY_DIFFICULT = 6;

var GL_ALL = 0;
var GL_WON_ONLY = 1;
var GL_PLAYED_ONLY = 2;

var GL_DEFAULT_LOAD_COUNT = 250;

var DESC = false;
var ASC = true;

function GameListRenderer(_gc, _ui, _options) {
    var that = this;

    var gc, ui, cs;

    var CONTENTS_ID = "#gameListContents";

    var options = {
        bindCPButton : false,
        showLabels : false,
        moreLabel : "hands",
        defaultSortBy : GL_SORT_BY_GAME_ID,
        defaultOrder : ASC,
        canFilter : false,
        filterLabel : "",
        noFilterLabel : "",
        showDifficult : false
    };

    var glRecentRequestedGame = -1;

    var sortBy; // = GL_SORT_BY_GAME_RATING;
    var order; // = DESC;
    var count = GL_DEFAULT_LOAD_COUNT;

    that.activeSegmentFilter = 0;

    var i18n = new I18n();
    i18n.setContext('gameList');

    this.run = function () {
        if (!$("#gameListPanel").is(":visible")) {
            cs = gc.getClientServer();
            ui.setLoading("#gameListContents");
            that.loader = new Loader(0, GL_DEFAULT_LOAD_COUNT);
            that.loader.addListener(that);
            this.loadAndRender(false);
            $("#glAuxPanel").hide();
            $("#glFilterSection").empty();
            ui.showPanel({
                id : "gameListPanel",
                type : BOTTOM_PANEL
            });
        } else {
            ui.hidePanel("gameListPanel");
        }
    }

    this.countChanged = function () {
        that.loadAndRender(true, false);
    }

    this.loadAndRender = function (repeatLoad, resetLoader) {
        // TODO, REWORK, HACK
        resetLoader = ifDef(resetLoader, true);

        if (resetLoader) { // TODO, HACK, REWORK
            that.loader.reset();
        }

        if (repeatLoad) {
            $("#glLoadingImg").show();
        }
        cs.sendRequest(GWT_GAMELIST, {
            sortBy : sortBy,
            order : boolToInt(order),
            count : that.loader.count,
            filter : that.activeSegmentFilter
        }, function (result, data, error) {
            $("#glLoadingImg").hide();
            if (result) {
                that.render(data);
                if (!repeatLoad) {
                    $("html, body").animate({
                        scrollTop : $("#gameListContents").offset().top - 1 * iDiv($("#gameArea").width(), 5)
                    }, "normal");
                }
            } else {
                that.ui.renderErrorReason(CONTENTS_ID, error.reason);
            }
        });
    }

    this.bindHeaderAction = function (jId, columnSortBy, columnDefaultOrder) {
        $(jId).click(function () {
            if (sortBy != columnSortBy) {
                sortBy = columnSortBy;
                order = columnDefaultOrder;
            } else {
                order = !order;
            }
            count = GL_DEFAULT_LOAD_COUNT;
            that.loadAndRender(true);
        });
    }

    this.renderFilter = function (filterData) {
        $("#glFilterSection").empty();

        var options = "<option value='nofilter'>" + that.options.noFilterLabel + "</option>";

        for (var i in filterData) {
            var filter = filterData[i];

            options += "<option value='" + filter.val + "'>" + filter.text + "</option>";
        }

        $("#glFilterSection").append("<table style='margin-bottom: 5px;'>"
            + "<tr>"
            + "<td>"
            + "<span style='color: #777;'>" + that.options.filterLabel + ": </span>"
            + "</td>"
            + "<td>&nbsp;&nbsp;</td>"
            + "<td>"
            + "<select style='width: 220px' id='glFilter'>"
            + options
            + "</select>"
            + "</td>"
            + "</tr>"
            + "</table>");

        if (that.activeSegmentFilter) {
            $("#glFilter").val(that.activeSegmentFilter);
        }

        $("#glFilter").change(function (e) {
            that.onFilterChange();
        });

        $("#glFilter").chosen({
            disable_search : true
        });
    }

    this.onFilterChange = function () {
        var value = $("#glFilter option:selected").val();

        if (value == "nofilter") {
            that.activeSegmentFilter = 0;
        } else {
            that.activeSegmentFilter = value;
        }
        that.loadAndRender(true);
    }

    this.render = function (data) {
        var gameList = data.gameList;
        var total = data.total;

        if (that.options.canFilter) {
            var filterData = data.filterData;
            that.renderFilter(filterData);
        }

        that.loader.setTotal(data.total);

        ui.hideHint();

        var width = 20;

//        if (cs.isSuperUser()) {
//            width = iDiv(100, 6);
//        }

        // generate and append table contents
        var tableContents = "<table id='gameListTable' class='standartTable' style='clear:both; border-collapse: collapse;' " +
            " width=\"100%\" border=\"0\" vspace=\"0\" cellspacing=\"0\" hspace=\"0\"><tr>"
            + "<th colspan='" + (that.options.showLabels ? 3 : 2) + "' width='" + width + "%' "+(sortBy == GL_SORT_BY_GAME_ID ?" style='background-color: rgb(255, 255, 224);'":"")+">"
            + "<span" + (sortBy == GL_SORT_BY_GAME_ID ? " class='actionText4 activeSortHeader'" : " class='actionText4'")
            + " id='glSortByGameId'><div class='glHeader'>" + i18n.get("gameIdLabel") + "</div>"
            + (sortBy == GL_SORT_BY_GAME_ID ? ui.serverSortArrowsImg(order) + ui.getOrderHint(order) : " &nbsp;<img src='/img/icons/sort-both.png' alt=''/>")
            + "</span></th>"

            + "<th width='" + width + "%' "+(sortBy == GL_SORT_BY_GAME_RATING ?" style='background-color: rgb(255, 255, 224);'":"")+"><span"
            + (sortBy == GL_SORT_BY_GAME_RATING ? " class='actionText4 activeSortHeader'" : " class='actionText4'")
            + " id='glSortByGameRating'><div class='glHeader'>" + i18n.get("gameRatingLabel") + "</div><div class='glHeaderDescr'>" + i18n.get("gameRatingDescription") + "</div>"
            + (sortBy == GL_SORT_BY_GAME_RATING ? ui.serverSortArrowsImg(order) + ui.getOrderHint(order) : " &nbsp;<img src='/img/icons/sort-both.png' alt=''/>")
            + "</span></th>"

            +(options.showDifficult?"<th width='" + width + "%' "+(sortBy == GL_SORT_BY_DIFFICULT ?" style='background-color: rgb(255, 255, 224);'":"")+"><span"
            + (sortBy == GL_SORT_BY_DIFFICULT ? " class='actionText4 activeSortHeader'" : " class='actionText4'")
            + " id='glSortByDifficult'><div class='glHeader' title='Количество начальных цифр'>" + "Цифр" + "</div><div class='glHeaderDescr'>" + "" + "</div>"
            + (sortBy == GL_SORT_BY_DIFFICULT ? ui.serverSortArrowsImg(order) + ui.getOrderHint(order) : " &nbsp;<img src='/img/icons/sort-both.png' alt=''/>")
            + "</span></th>"
            :"")

            + "<th colspan='4' width='" + width + "%'"+(sortBy == GL_SORT_BY_PLAYER_RATING ?" style='background-color: rgb(255, 255, 224);'":"")+"><span"
            + (sortBy == GL_SORT_BY_PLAYER_RATING ? " class='actionText4 activeSortHeader'" : " class='actionText4'")
            + " id='glSortByPlayerRating'><div class='glHeader'>" + i18n.get("winTimeAndRankLabel") + "</div><div class='glHeaderDescr'>" + i18n.get("winTimeAndRankDescription") + "</div>"
            + (sortBy == GL_SORT_BY_PLAYER_RATING ? ui.serverSortArrowsImg(order) + ui.getOrderHint(order) : " &nbsp;<img src='/img/icons/sort-both.png' alt=''/>")
            + "</span></th>"

            + "<th width='" + width + "%' "+(sortBy == GL_SORT_BY_TOTAL_WON ?" style='background-color: rgb(255, 255, 224);'":"")+"><span"
            + (sortBy == GL_SORT_BY_TOTAL_WON ? " class='actionText4 activeSortHeader'" : " class='actionText4'")
            + " id='glSortByGameTotalWon'><div class='glHeader'>" + i18n.get("solvedLabel") + "</div>"
            + (sortBy == GL_SORT_BY_TOTAL_WON ? ui.serverSortArrowsImg(order) + ui.getOrderHint(order) : " &nbsp;<img src='/img/icons/sort-both.png' alt=''/>")
            + "</span></th>"

            + "<th width='" + width + "%' "+(sortBy == GL_SORT_BY_TOTAL_PLAYED ?" style='background-color: rgb(255, 255, 224);'":"")+"><span"
            + (sortBy == GL_SORT_BY_TOTAL_PLAYED ? " class='actionText4 activeSortHeader'" : " class='actionText4'")
            + " id='glSortByGameTotalPlayed'><div class='glHeader'>" + i18n.get("playedLabel") + "</div>"
            + (sortBy == GL_SORT_BY_TOTAL_PLAYED ? ui.serverSortArrowsImg(order) + ui.getOrderHint(order) : " &nbsp;<img src='/img/icons/sort-both.png' alt=''/>")
            + "</span></th>"
            + "</tr>";

        if (gameList.length > 15) {
            $("#glAuxPanel").show();
        } else {
            $("#glAuxPanel").hide();
        }

        var tableInternals = "";

        var infinityParagraph = "<img src='/img/icons/infinity.png' alt='" + i18n.get("noRatingAltText") + "'/>"

        for (var i = 0; i < gameList.length; i++) { // gameList.length
            var game = gameList[i];

            var playerWinTime = game.playerWinTime;
            var playerTotalGameTime = game.playerTotalGameTime;

            var gameRatingParagraph;

            if (game.gameRating == 0) {
                gameRatingParagraph = infinityParagraph;
            } else {
                gameRatingParagraph = "<p>"
                    + formatGameTimeMS(game.gameRating)
                    + "</p>";
            }

            var playerWinTimeParagraph;

            if (playerWinTime > 0) {
                playerWinTimeParagraph = "<p>" + formatGameTimeMS(playerWinTime) + "</p>";
            } else {
                playerWinTimeParagraph = "—";
            }

            var playerWinTimeAlignment = "";

            var playerWinTimeBlock;

            if (playerWinTime > 0) {
                var formattedGameTime = formatGameTimeMS(playerWinTime);
            } else {
                formattedGameTime = "<span class='pdTotalGameTime'>"
                    + formatGameTimeMS(playerTotalGameTime)
                    + "</span>";
            }

            if (playerTotalGameTime > 0) {
                if (cs.isLogged()) {
                    playerWinTimeBlock = "<td class='noRightBorder' style='text-align: right;'>"
                        + "<p>" + formattedGameTime + "</p>"
                        + "</td>" + (playerWinTime > 0 ?
                        "<td class='noRightBorder' >/</td>"
                            + "<td class='noRightBorder' >" + game.playerWinTimeRank + "</td>"
                            + "<td>&nbsp;</td>" : "<td colspan='3'>&nbsp;</td>");
                } else {
                    playerWinTimeBlock = "<td class='noRightBorder' style='text-align: right;'>"
                        + "<p>" + formattedGameTime + "</p>"
                        + "</td>"
                        + "<td colspan='3'>&nbsp;</td>";
                }
            } else {
                playerWinTimeBlock = "<td class='noRightBorder' style='text-align: right;'>—</td>"
                    + "<td colspan='3'>&nbsp;</td>";
            }

//            var totalGameRatingParagraph = 0;

//            if (cs.isSuperUser()) {
//                if (game.totalGameRating == 0) {
//                    totalGameRatingParagraph = infinityParagraph;
//                } else {
//                    totalGameRatingParagraph = "<p>" + formatGameTimeMS(game.totalGameRating) + "</p>";
//                }
//            }

//        <p style='display: inline' id='glPlay" + game.gameId + "' class='actionText'>" + game.gameId
//        + "</p>"

            var gameIdParagraph = "<p style='display: inline; "
                + (game.gameId > gc.getHigherGameIdBound() ? "color: #C42E21 !important;" : "")
                + "' id='glPlay" + game.gameId + "' class='actionText'>"
                + game.gameId
                + "</p>";

            if (that.options.showLabels) {
                var labelParagraph = "<p style='display: inline; color: #777;'>" + game.label + "&nbsp;</p>";
            }

            var padding = 6;

            if (cs.isSuperUser()) {
                padding = 4;
            }

            var tableData = "<td class='noRightBorder noLeftRightPadding' style='white-space: nowrap;'>" + (game.fav == 1 ? " &nbsp;<img src='/img/icons/fav-2.png' alt=''/>" : "") + "</td>"
                + "<td id='glGameIdTd" + game.gameId + "' "
                + (that.options.showLabels ? "class='noRightBorder'" : "")
                + " style='text-align: right; white-space: nowrap; cursor: pointer; "
                + (that.options.showLabels ? "" : "padding-right: " + padding + "%;")
                + "'>"
                + gameIdParagraph
                + "</td>"
                + (that.options.showLabels ?
                "<td id='glLabelTd" + game.gameId + "' style='cursor: pointer; white-space: nowrap;'>" + labelParagraph + "</td>"
                : "")
                + "<td style='text-align: right; padding-right: " + padding + "%;'>" + gameRatingParagraph + "</td>"
                +(options.showDifficult?"<td style='text-align: center;'>"+game.difficult+"</td>":"")
                + playerWinTimeBlock
                + "<td style='text-align: center;'><p id='glShowGameDetail" + game.gameId + "'" + (game.totalWon > 0 ? " class='activeText'" : "") + ">"
                + game.totalWon
                + "</p>" + "<div class='glGameDetailContent' id='glGameDetailContent" + game.gameId + "'></div>" + "</td>"
                + "<td style='text-align: center;'><p id='glShowGameDetail" + game.gameId + "_2'" + (game.totalPlayed > 0 ? " class='activeText'" : "") + ">" + game.totalPlayed
                + "</p>" + "<div class='glGameDetailContent' id='glGameDetailContent" + game.gameId + "_2'></div>" + "</td>";

            var rowColor = "white";

            if (game.status == 0) {
                rowColor = PLAYED_GAME_COLOR;
            } else if (game.status == WIN_STATUS) {
                rowColor = WON_GAME_COLOR;
            }

//        if (game.status != -1) {
//            t++;
//        }

            tableInternals += "<tr class='glRow' id='glRow" + game.gameId + "' style='background-color: " + rowColor + ";'>"
                + tableData
                + "</tr>";
        }

//    alert(t);

        tableContents += tableInternals + "</table>";

        $("#gameListContents").empty();

        $("#gameListContents").append(tableContents);

//        if (count > 0 && count < total) {
//            $("#gameListContents").append("<table border='1' style='margin-top: 10px;' width='100%' class='noBordersTable' id='glShowPanel'>"
//                + "<tr>"
//                + "<td width='50%'>"
//                + "<p class='glShowMore' id='glShowMore'>" + i18n.get("paginatorMorePrefix") + " " + Math.min(GL_DEFAULT_LOAD_COUNT, total - count) + " " + i18n.get("paginatorMoreSuffix", that.options.moreLabel) + "</p>"
//                + "</td>"
//                + "<td width='50%'>"
//                + "<p class='glShowAll' id='glShowAll'>" + i18n.get("paginatorShowAll") + "</p>"
//                + "</td>"
//                + "</tr>"
//                + "<tr>"
//                + "<td colspan='2' class='glPaginationStats' style='text-align: center !important;'>" + count + " " + i18n.get("paginatorOf") + " " + total + "</td>"
//                + "</tr>"
//                + "</table>");
//        }

        var loaderRenderer = new LoaderRenderer(that.loader, that.options.moreLabel); // , "userHistory"

        $("#gameListContents").append(loaderRenderer.render());

        loaderRenderer.bindEvents();

        for (var i = 0; i < gameList.length; i++) {
            var _gameId = gameList[i].gameId;

//            alert("#glGameIdTd" + _gameId
//                + that.options.showLabels
//                ? (", #glLabelTd" + _gameId)
//                : "");

            $("#glGameIdTd" + _gameId
                + (that.options.showLabels ? ", #glLabelTd" + _gameId : "")
            ).click(function (_gameId) {
                return function () {
//                    requestNewGameByGameId(_gameId, function () {
//                        glRecentRequestedGame = _gameId;
//                        $("html, body").animate({ scrollTop : 0 }, "fast");
//                        showAndFillGameInfoPanel(_gameId, true, {
//                            gameId : _gameId,
//                            onClose : function (prevState) {
//                                $(".glRow").css("font-weight", "normal");
//                                $("#glRow" + prevState.gameId).css("font-weight", "bold");
//                                showPanel("#gameListPanel");
//                                $("html, body").animate({ scrollTop : $("#glRow" + prevState.gameId).offset().top - iDiv($(window).height(), 2)});
//                            }
//                        });
//                    });
                    gc.requestGame(_gameId, null, function () {
                        glRecentRequestedGame = _gameId;
//                        $("html, body").animate({ scrollTop : 0 }, "fast");
                        ui.showGameInfo(_gameId, false);
                    })
                };
            }(_gameId));

            if (gameList[i].totalWon > 0) {
                $("#glShowGameDetail" + _gameId).click(function (_gameId) {
                    return function () {
                        if (!$("#glGameDetailContent" + _gameId).is(":visible")) {
                            $(".glActiveGameDetailContent").hide();
                            $("#glGameDetailContent" + _gameId).empty().append("<div style=\"padding-top: 20px; padding-left:20px; height:35px;\">" +
                                "<span style=\"float: left; color:black;\">" + i18n.get("loadingAlert") + "&nbsp;" +
                                "</span><img style=\"float: left; margin-top: -10px;\" src=\"/img/icons/loading_transparent.gif\"></div>");
                            $("#glGameDetailContent" + _gameId).show();
                            cs.sendRequest(GWT_PLAYERLIST, {
                                gameId : _gameId
                            }, function (result, data) {
                                if (result) {
                                    var playerList = data.playerList;
                                    var playerListContents = "<table class='noBordersTable' style='padding-bottom: 0px; margin-bottom:7px; padding-right: 20px;'>";
                                    var winIndex = 1;
                                    for (var i = 0; i < playerList.length; i++) {
                                        var username = i18n.transliterate(playerList[i].username);
                                        var winTime = playerList[i].winTime;
                                        if (winTime > 0) {
                                            playerListContents +=
                                                "<tr>"
                                                    + "<td style='float: right;'>" + winIndex + ".</td>"
                                                    + "<td>" + username.replace(/\s+/g, "&nbsp;") + "</td>"
                                                    + "<td>/</td>"
                                                    + "<td class='gameTime'>" + formatGameTimeMS(winTime) + "</td>"
                                                    + "</tr>";
                                            winIndex++;
                                        }
                                    }
                                    playerListContents + "</table>";
                                    $("#glGameDetailContent" + _gameId).empty().append(playerListContents);
                                    $("#glGameDetailContent" + _gameId).addClass("glActiveGameDetailContent");
                                }
                            });
                        } else {
                            $("#glGameDetailContent" + _gameId).hide();
                            $("#glGameDetailContent" + _gameId).removeClass("glActiveGameDetailContent");
                        }
                    };
                }(_gameId));
            }

            if (gameList[i].totalPlayed > 0) {
                $("#glShowGameDetail" + _gameId + "_2").click(function (_gameId) {
                    return function () {
                        if (!$("#glGameDetailContent" + _gameId + "_2").is(":visible")) {
                            $(".glActiveGameDetailContent").hide();
                            $("#glGameDetailContent" + _gameId + "_2").empty().append("<div style=\"padding-top: 20px; padding-left:20px; height:35px;\">" +
                                "<span style=\"float: left; color:black;\">" + i18n.get("loadingAlert") + "&nbsp;" +
                                "</span><img style=\"float: left; margin-top: -10px;\" src=\"/img/icons/loading_transparent.gif\"></div>");
                            $("#glGameDetailContent" + _gameId + "_2").show();
                            cs.sendRequest(GWT_PLAYERLIST, {
                                gameId : _gameId
                            }, function (result, data) {
                                if (result) {
                                    var playerList = data.playerList;
                                    var playerListContents = "<table class='noBordersTable' style='padding-bottom: 0px; margin-bottom:7px; padding-right: 20px;'>";
                                    for (var i = 0; i < playerList.length; i++) {
                                        var username = i18n.transliterate(playerList[i].username);
                                        var winTime = playerList[i].winTime;
                                        playerListContents +=
                                            "<tr>"
                                                + "<td style='float: right;'>" + (i + 1) + ".</td>"
                                                + "<td>" + username.replace(/\s+/g, "&nbsp;") + "</td>"
                                                + (winTime > 0 ? ("<td>/</td>"
                                                + "<td class='gameTime'>" + formatGameTimeMS(winTime) + "</td>") :
                                                "")
                                                + "</tr>";
                                    }
                                    playerListContents + "</ol>";
                                    $("#glGameDetailContent" + _gameId + "_2").empty().append(playerListContents);
                                    $("#glGameDetailContent" + _gameId + "_2").addClass("glActiveGameDetailContent");
                                }
                            });
                        } else {
                            $("#glGameDetailContent" + _gameId + "_2").hide();
                            $("#glGameDetailContent" + _gameId + "_2").removeClass("glActiveGameDetailContent");
                        }
                    };
                }(_gameId));
            }
        }

        that.bindHeaderAction("#glSortByGameId", GL_SORT_BY_GAME_ID, true);
        that.bindHeaderAction("#glSortByGameRating", GL_SORT_BY_GAME_RATING, false);
//        that.bindHeaderAction("#glSortByTotalGameRating", GL_SORT_BY_TOTAL_GAME_RATING, false);
        that.bindHeaderAction("#glSortByPlayerRating", GL_SORT_BY_PLAYER_RATING, false);
        that.bindHeaderAction("#glSortByGameTotalWon", GL_SORT_BY_TOTAL_WON, false);
        that.bindHeaderAction("#glSortByGameTotalPlayed", GL_SORT_BY_TOTAL_PLAYED, false);
        if (options.showDifficult)that.bindHeaderAction("#glSortByDifficult", GL_SORT_BY_DIFFICULT, false);

        $("#glSortByGameId").mouseenter(function () {
            ui.showHint("#glSortByGameId", i18n.get("sortByGameIdHint"));
        });

        $("#glSortByGameRating").mouseenter(function () {
            ui.showHint("#glSortByGameRating", i18n.get("sortByGameRatingHint"));
        });

        $("#glSortByPlayerRating").mouseenter(function () {
            ui.showHint("#glSortByPlayerRating", i18n.get("sortByWinTimeHint"));
        });

        $("#glSortByGameTotalWon").mouseenter(function () {
            ui.showHint("#glSortByGameTotalWon", i18n.get("sortByWonCountHint"));
        });

        $("#glSortByGameTotalPlayed").mouseenter(function () {
            ui.showHint("#glSortByGameTotalPlayed", i18n.get("sortByPlayedCountHint"));
        });

        $("#glSortByGameId, #glSortByGameRating, #glSortByPlayerRating, #glSortByGameTotalWon, #glSortByGameTotalPlayed").mouseleave(function () {
            ui.hideHint();
        });

//        $("#glShowMore").click(function () {
//            $("#glShowPanel").empty().append("<p class='giLoadingMore'>" + i18n.get("loadingAlert") + "&nbsp;<img style='margin-bottom:-10px;' src='/img/icons/loading.gif'></p>");
//            count = count + GL_DEFAULT_LOAD_COUNT;
//            that.loadAndRender(true);
//        });
//
//        $("#glShowAll").click(function () {
//            $("#glShowPanel").empty().append("<p class='giLoadingMore'>" + i18n.get("loadingAlert") + "&nbsp;<img style='margin-bottom:-10px;' src='/img/icons/loading.gif'></p>");
//            count = 0;
//            that.loadAndRender(true);
//        });

        $("#glLoadingImg").hide();
    }

    this.bindAll = function () {
        $("#closeGameListPanel").click(function () {
            ui.hidePanel("gameListPanel");
        });

        $("#glAuxClose").click(function () {
            ui.hidePanel("gameListPanel");
        });

        $("#glAuxRewind").click(function () {
            $("html, body").animate({ scrollTop : $("#gameListContents").offset().top - 1 * iDiv($("#gameArea").width(), 5) }, "normal");
        });

        if (isDef(that.options.bindCPButton) && that.options.bindCPButton) {
            $("#bbGameList").click(function () {
                that.run();
            });
        }
    }

    gc = _gc;
    ui = _ui;

    that.gc = gc;
    that.ui = ui;

    if (isDef(_options) && _options != null) {
        mergeObj(options, _options);
    }

    that.options = options;

    sortBy = that.options.defaultSortBy;
    order = that.options.defaultOrder;

    that.bindAll();
}
var GTW_GAMEINFO = "/gw/shared/loadGameInfo.php";
var GTW_SAVE_COMMENT = "/gw/shared/saveComment.php";

function GameInfoRenderer(_gc, _ui, _options) {
    var that = this;

    var gc, ui, cs;

    var CONTENTS_ID = "#gameInfoContents";

    var options = {
        bindCPButton : false,
        showBestAttemptRating : false,
        showLabels : false,
        gameIdLabel : "hand"
    };

    var doAutoSaveComment, showRegMePanelForGuests;

    var giGameId = -1;

    var i18n = new I18n();
    i18n.setContext('gameInfo');

    this.run = function (gameId, showCommentFavArea) {
        var showCommentFavArea = ifDef(showCommentFavArea, true);

        if (!$("#gameInfoPanel").is(":visible") && gc.isGameLoaded()) {
            cs = gc.getClientServer();
            doAutoSaveComment = true;
            showRegMePanelForGuests = false;
            giGameId = gameId;
            $("#giEditable").hide();
            if (showCommentFavArea) {
                $("#giCommentFavArea").show();
            } else {
                $("#giCommentFavArea").hide();
            }
            ui.setLoading("#gameInfoContents");
            this.loadAndRender(gameId);
            if (options.showSolution) {
                $("#showSolution").show();
            } else {
                $("#showSolution").hide();
            }
            ui.showPanel({
                id : "gameInfoPanel",
                type : BOTTOM_PANEL,
                onClose : function () {
                    that.onClose();
                }
            });
        } else {
            ui.hidePanel("gameInfoPanel");
        }
    }

    this.loadAndRender = function (gameId, showPlayersResults) {
        cs.sendRequest(GTW_GAMEINFO, {
            gameId : gameId,
            showPlayersResults:showPlayersResults||0
        }, function (result, data, error) {
            if (result) {
                that.render(data);
                $("html, body").animate({
                    scrollTop : $("#gameInfoContents").offset().top - 1 * iDiv($("#gameArea").width(), 5)
                }, "normal");
            } else {
                that.ui.renderErrorReason(CONTENTS_ID, error.reason);
            }
        });
    }

    this.render = function (data) {
        var gameId = data.gameId;
        var totalPlayed = data.totalPlayed;
        var totalWon = data.totalWon;
        var averageWinTime = data.averageWinTime;
        var top = data.bestAttemptTop||[];
        var comment = data.comment;
        var fav = data.fav;
        var playerList = data.playerList||[];

        var tableContents = "<table class='gameInfoContentsTable standartTable' width='100%' border='0' vspace='0' cellspacing='0' hspace='0'>"
            + "<tr>"
            + "<th width='33%'>" + i18n.get("byWinTimeLabel") + "</th>"
            + (that.options.showBestAttemptRating ? "<th width='33%'>" + i18n.get("byBestAttemptTimeLabel") + "</th>" : "")
            + "<th width='34%'>" + i18n.get("unsolvedListLabel") + "</th>"
            + "</tr>";

        var bestAttemptTop = "";

        if (top.length > 0) {
            bestAttemptTop = "<table class='noBordersTable' style='padding-left: 5px; padding-right: 5px; margin-bottom: 0; width: 100%'>";
            for (var i = 0; i < top.length; i++) {
                var highlightStyle = "";
                if (top[i].username == cs.getUsername()) {
                    highlightStyle = " font-weight: bold;";
                }
                bestAttemptTop += "<tr style='font-size:10pt !important; height: 25px;" + highlightStyle + "'>" +
                    "<td>" + (i + 1) + "." + "</td>" +
                    "<td>" + i18n.transliterate(top[i].username.replace(/\s+/g, "&nbsp;")) + "</td>" +
                    "<td>" + "/" + "</td>" +
                    "<td class='gameTime'>" + formatGameTimeMS(top[i].minElapsed) + "</td>" +
                    "</tr>";
            }
            bestAttemptTop += "</table>";
        }

        var wonPlayerList = "<table class='noBordersTable' style='padding-left: 5px; padding-right: 5px; margin-bottom: 0; width: 100%'>";
        var unsolvedPlayerList = "<table class='noBordersTable' style='padding-left: 5px; padding-right: 5px; margin-bottom: 0; width: 100%'>";

        var totalWon = 0;
        var wtRank = 1;

        var unsolvedPlayerCount = 0;
        for (var i = 0; i < playerList.length; i++) {
            var highlightStyle = "";

            var isGuest = playerList[i].username.indexOf("Гость") != -1;

            if (playerList[i].username == cs.getUsername()) {
                highlightStyle = " font-weight: bold;";
            }
            if (playerList[i].winTime > 0) {
                if (!isGuest) {
                    var strRank = wtRank + ".";
                    wtRank++;
                } else {
                    strRank = "";
                    highlightStyle += " color: #777";
                }

                wonPlayerList += "<tr style='font-size:10pt !important; height: 25px;" + highlightStyle + "'>" +
                    "<td>" + strRank + "</td>" +
                    "<td>" + i18n.transliterate(playerList[i].username.replace(/\s+/g, "&nbsp;")) + "</td>" +
                    "<td>" + "/" + "</td>" +
                    "<td class='gameTime'>" + formatGameTimeMS(playerList[i].winTime) + "</td>" +
                    "</tr>";

                totalWon++;
            } else {
                unsolvedPlayerList += "<tr style='font-size:10pt !important; height: 25px;" + highlightStyle + "'>"
                    + "<td>" + (unsolvedPlayerCount + 1) + "." + "</td>"
                    + "<td>" + i18n.transliterate(playerList[i].username.replace(/\s+/g, "&nbsp;")) + "</td>"
                    + (cs.isSuperUser()
                    ?
                    ("<td class='faded'>" + "/" + "</td>"
                        + "<td class='faded gameTime'>" + formatGameTimeMS(playerList[i].totalGameTime) + "</td>")
                    :
                    ""
                    )
                    + "</tr>";

                unsolvedPlayerCount++;
            }
        }
        wonPlayerList += "</table>";
        unsolvedPlayerList += "</table>";

        if (totalWon == 0) {
            wonPlayerList = "<p class='giNoResult'>—</p>";
            bestAttemptTop = "<p class='giNoResult'>—</p>";
        }

        if (unsolvedPlayerCount == 0) {
            unsolvedPlayerList = "<p class='giNoResult'>—</p>";
        }

        tableContents += "<tr>"
            + "<td"+((data.showPlayersResults==0 && data.totalPlayed>5)?' style="border-bottom:none;" ':'')+">"
            + "<div class='giResults'>"
            + wonPlayerList
            + ((data.showPlayersResults==0 && data.totalPlayed>5&&totalWon>4)?"<div style='text-align: center;'>...</div>":"")
            + "</div>"
            + "</td>"
            + (that.options.showBestAttemptRating ? "<td"+((data.showPlayersResults==0 && data.totalPlayed>5)?' style="border-bottom:none;" ':'')+">"
            + "<div class='giResults'>"
            + bestAttemptTop
            + ((data.showPlayersResults==0 && data.totalPlayed>5&&totalWon>4)?"<div style='text-align: center;'>...</div>":"")
            + "</div>"
            + "</td>" : "")
            + "<td"+((data.showPlayersResults==0 && data.totalPlayed>5)?' style="border-bottom:none;" ':'')+">"
            + "<div class='giResults'>"
            + unsolvedPlayerList
            + ((data.showPlayersResults==0 && data.totalPlayed>5&&unsolvedPlayerCount>4)?"<div style='text-align: center;'>...</div>":"")
            + "</div>"
            + "</td>"
            + "</tr>";
        if (data.showPlayersResults==0 && data.totalPlayed>5){
            tableContents +="<tr><td style='border:none;'><br><br></td>"
                + (that.options.showBestAttemptRating ? "<td style='border:none;'><br></td>" : "")
                + "<td style='border-bottom-style:none; border-left-style: none;'><br></td>"
                + "</tr>";

            tableContents += "</table>";
            tableContents += '<div style="margin: 0 auto; width: 180px; float: none !important; margin-top: -26px;" class="constantWidthBtn" id="giShowPlayersResults">'+i18n.get("allResults")+'</div>';
        } else
        tableContents += "</table>";

        totalWon = data.totalWon;

        // жёсткий хак, потом нужно отрефакторить, если будет актуально в других играх
        if (that.gc.getClientServer().getGameVariationId() == 10) {
            _kosynka_hack = " (по одной карте)"
        } else if (that.gc.getClientServer().getGameVariationId() == 1) {
            _kosynka_hack = " (по три карты)"
        } else {
            var _kosynka_hack = "";
        }

        var gameStatusParagraph =
            "<p style='margin-top:5px; margin-left:5px; font-size:8pt;'>"
                + i18n.get("gameIdLabel", that.options.gameIdLabel) + gameId //  + " (" + "<span id='giShowSolution' class='actionText'>показать решение</span>" + ")"
                + (that.options.showLabels ? " / " + data.label : "") + _kosynka_hack
//                + "&nbsp;&nbsp;&nbsp;рейтинг расклада: " + (averageWinTime == 0 ? "—" : formatGameTimeMS(averageWinTime))
//                + "&nbsp;&nbsp;&nbsp;выиграло: " + totalWon
//                + "&nbsp;&nbsp;&nbsp;играло: " + totalPlayed
            + "</p>";

        $("#gameStatusContents").empty().append(gameStatusParagraph);

        $("#gameInfoContents").empty().append("<h4 style='text-align: center; padding-bottom: 5px; padding-top: 20px;'>" + i18n.get("playerResultsHeader")
            + "</h4>");

        $("#gameInfoContents").append(
            "<p style='padding-left: 5px; font-size:8pt;'>" + i18n.get("gameRatingLabel") + ": " + (averageWinTime == 0 ? "—" : formatGameTimeMS(averageWinTime))
                + "&nbsp;&nbsp;&nbsp;" + i18n.get("wonCountLabel") + ": " + totalWon
                + "&nbsp;&nbsp;&nbsp;" + i18n.get("playedCountLabel") + ": " + totalPlayed
                + "</p>"
            + (data.userName?"<p style='padding-left: 5px; font-size:8pt;'>"+ i18n.get("bestAttempt") + formatGameTimeMS(data.bestWinTime)+" ("+data.userName+") ":"")
            + (data.userWinTime>0?"<p style='padding-left: 5px; font-size:8pt;'>"+ i18n.get("YourAttempt") + formatGameTimeMS(data.userWinTime):"")
        );

        if (playerList.length>0) $("#gameInfoContents").append(tableContents);

        if (cs.isLogged()) {
            if (comment != "") {
                $("#giComment").val("").val(comment);
                $("#giComment").removeClass("greyComment");
            } else {
                $("#giComment").val("").val(i18n.get("commentLabel"));
                $("#giComment").addClass("greyComment");
                $("#giComment").focus(function () {
                    if ($(this).hasClass("greyComment")) {
                        $(this).removeClass("greyComment");
                        this.value = "";
                        return false;
                    }
                });
            }

            $("#giComment").blur(function () {
                if (this.value == "") {
                    $("#giComment").val("").val(i18n.get("commentLabel"));
                    $("#giComment").addClass("greyComment");
                    return false;
                }
            });

            if (fav) {
                $("#giFav").attr("checked", true);
            }
            else {
                $("#giFav").attr("checked", false);
            }
        } else {
            $("#giComment").val("").val(i18n.get("onlyForSignedUsersAlert"));
            $("#giComment").addClass("greyComment");
            $("#giComment").attr("disabled", true);
            $("#giFav").attr("disabled", true);
        }

        $('#giShowPlayersResults').click(function(){that.loadAndRender(gameId, 1)});

        $("#giEditable").show();
    }

    this.saveComment = function () {
//        alert("SAVE COMM!");

//        var newComment = $("#giComment").val();
//        var newFav = $("#giFav").is(":checked") ? 1 : 0;
//
//        if ($("#giComment").hasClass("greyComment")) {
//            newComment = "";
//        }

        if (cs.isLogged()) {
            var comment = $("#giComment").val();
            var bFav = $("#giFav").is(":checked");
//            comment = comment.replace(/\|/g, " ");

            if ($("#giComment").hasClass("greyComment")) {
                comment = "";
            }

            var iFav = bool2Int(bFav);

            cs.sendRequest(GTW_SAVE_COMMENT, {
                gameId : giGameId,
                comment : comment,
                fav : iFav
            }, function (result) {
                if (!result) {
                    ; // TODO: notify user
                }
            });

//            cs.saveComment(giGameId, comment, iFav, function (result) {
//                if (!result) {
//                    ; // TODO: notify user
//                }
//            });
        } else {
            if (showRegMePanelForGuests) {
                doAutoSaveComment = false;
                ui.showRegPanel();
            }
        }
    }

    this.onClose = function () {
        if (doAutoSaveComment) {
            that.saveComment();
        }
    }

    this.bindAll = function () {
        $("#giCommit, #giCancel").click(function () {
            var commitHit = $(this).attr("id") == "giCommit";
            var cancelHit = $(this).attr("id") == "giCancel";
            if (commitHit) {
                showRegMePanelForGuests = true;
            }
            if (cancelHit) {
                doAutoSaveComment = false;
            }
            ui.hidePanel("gameInfoPanel");
        });

        ui.bindCloseIcon("#giCloseIcon", "gameInfoPanel");

        if (isDef(that.options.bindCPButton) && that.options.bindCPButton) {
            $("#bbGameInfo").click(function () {
                that.run(gc.getGameManager().getGameId());
            });
        }
    }

    gc = _gc;
    ui = _ui;

    that.gc = gc;
    that.ui = ui;

    if (isDef(_options) && _options != null) {
        mergeObj(options, _options);
    }

    that.options = options;

    this.bindAll();
}
var X_MARGINS = 40;

function InformationReneder(gc, ui, options) {
    var that = this;

    that.options = {
        widthElement : "gameArea"
    };

    this.run = function () {
        $("#informationMain").width($("#" + that.options.widthElement).width() + X_MARGINS);
        $("#fullShadow").css("height", $(document).height());
        $("#fullShadow").show();
        $("#informationBubble").fadeIn("fast", function() {
            $("#fullShadow").css("height", $(document).height());
        });
        $("html, body").animate({ scrollTop : 0 }, "fast");
    }

    this.hide = function() {
        $("#informationBubble").hide();
        $("#fullShadow").hide();
    }

    this.escKeyDown = function () {
        that.hide();
    }

    this.bindAll = function () {
        $("#title").click(function () {
            that.run();
        });

        $("#showDescription").click(function () {
            that.run();
        });

        $("#closeInformationBubble").click(function () {
            that.hide();
        });

        that.gc.addListener(that);
    }

    that.gc = gc;
    that.ui = ui;

    if (isDef(options) && options != null) {
        mergeObj(that.options, options);
    }

    that.bindAll();
}
function TableDataRenderer(sortBy, order, options) {
    var that = this;

    that.columns = [];
    that.sortBy = sortBy;
    that.order = order;

    that.options = {};

    if (isDef(options) && options != null) {
        mergeObj(that.options, options);
    }

    this.fillDefault = function (column, property, defaultValue) {
        if (!isDef(column[property])) {
            column[property] = defaultValue;
        }
    }

    this.addColumn = function (column) {
        that.fillDefault(column, "enableSort", false);
        that.fillDefault(column, "onlyDefaultOrder", false);
        that.fillDefault(column, "showOrderHint", true);
        that.fillDefault(column, "hasRightBorder", true);
        that.fillDefault(column, "insertSeparatorAfter", false);
        that.fillDefault(column, "colspan", 1);
        that.fillDefault(column, "customSortImgTdFunc", null);
        that.fillDefault(column, "hint", null);

        that.columns.push(column);
    }

//    tdr.addColumn({
//        title : "%",
//        headerId : "rlSortBySolvedRatio",
//        enableSort : true,
//        sortBy : RL_SORT_BY_SOLVED_RATIO,
//        defaultOrder : false,
//        onlyDefaultOrder : false,
//        showOrderHint : true,
//        hasRightBorder : true
//    });

    this.bindHeaderAction = function (model, column) {
        if (!column.enableSort || column.enableSort && column.onlyDefaultOrder && column.sortBy == that.sortBy) {
            return;
        }

        var jCombinedId = "#" + column.headerId + ", #" + column.headerId + "Img";

        $(jCombinedId).click(function () {
            if (that.sortBy != column.sortBy || column.onlyDefaultOrder) {
                model.setSort(column.sortBy, column.defaultOrder);
            } else {
                model.setSort(that.sortBy, !that.order);
            }
            model.loadAndRender(true);
        });

        if (column.hint) {
            $("#" + column.headerId).mouseenter(function () {
                uiShowHint("#" + column.headerId, column.hint);
            });
            $("#" + column.headerId + "Img").mouseenter(function () {
                uiShowHint("#" + column.headerId + "Img", column.hint);
            });
            $(jCombinedId).mouseleave(function () {
                uiHideHint();
            });
        }
    }

    this.bindHeaderActions = function (model) {
        for (var i in that.columns) {
            var column = that.columns[i];

            that.bindHeaderAction(model, column);
        }
    }

    this.renderOrderHint = function (order) {
//        if (order) {
//            return "<br /><span style='font-size: 6pt;'> (по возр.)</span>";
//        } else {
//            return "<br /><span style='font-size: 6pt;'> (по убыв.)</span>";
//        }
        return uiGetOrderHint(order);
    }

    this.renderColumnHeader = function (column) {
        var colspanString = (column.colspan > 1) ? ("colspan='" + column.colspan + "' ") : "";
        var background = (column.enableSort && that.sortBy == column.sortBy)?'style="background-color: rgb(252, 252, 216);"':'';

        if (!column.hasRightBorder) {
            var columnHeader = "<th " + colspanString + "class='" + that.options.thClass + " noRightBorder";
        } else {
            columnHeader = "<th " + colspanString + " class='" + that.options.thClass;
        }
        columnHeader+="' "+background+" >";

        if (column.enableSort && that.sortBy == column.sortBy) {
            var cssClass = "activeSortHeader ";
        } else {
            cssClass = "";
        }

        if (!column.onlyDefaultOrder || column.onlyDefaultOrder && that.sortBy != column.sortBy) {
            cssClass += "actionText3";
        } else {
            cssClass += "simpleText";
        }

        if (column.enableSort) {
            columnHeader += "<span class='" + cssClass + "'"
                + " id='" + column.headerId + "'"
                + ">"
                + column.title
                + (column.showOrderHint && that.sortBy == column.sortBy ? that.renderOrderHint(that.order) : "")
                + "</span>";
        } else {
            columnHeader += "<span class='simpleText'>" + column.title + "</span>";
        }

        columnHeader += "</th>";

        if (column.insertSeparatorAfter) {
            columnHeader += "<th class='" + that.options.thClass + " noRightBorder'>&nbsp;</th>";
        }

        return columnHeader;
    }

    this.serverSortArrowsImg = function (order, style, imageId) {
        var style = isDef(style) && style != "" ? " style='" + style + "' " : "";
        var imageId = isDef(imageId) ? " id='" + imageId + "' " : "";
        return (order ? " &nbsp;<img " + style + imageId + "src='/img/icons/sort-asc.png' alt=''/>" : " &nbsp;<img " + style + imageId + "src='/img/icons/sort-desc.png' alt=''/>");
    }

    this.generateSortImg = function (id, columnSortBy) {
        return (that.sortBy == columnSortBy ?
            that.serverSortArrowsImg(that.order, "", id) :
            " &nbsp;<img src='/img/icons/sort-both.png' id='" + id + "' alt=''/>");
    }

    this.renderColumnSortImgTd = function (column, id) {
        if (column.customSortImgTdFunc) {
            return column.customSortImgTdFunc(column);
        }

        var colspanString = (column.colspan > 1) ? ("colspan='" + column.colspan + "' ") : "";

        var showSortControls = column.enableSort && (!column.onlyDefaultOrder || column.onlyDefaultOrder && that.sortBy != column.sortBy);

        var cssClass = showSortControls ? "rlArrows" : "noArrows";

        var background = (column.enableSort && that.sortBy == column.sortBy)?' background-color: rgb(252, 252, 216); ':'';

        if (!column.hasRightBorder) {
            var columnSortImgTd = "<td " + colspanString + "class='" + cssClass + " noRightBorder' style='text-align: center; ";
        } else {
            columnSortImgTd = "<td " + colspanString + " class='" + cssClass + "' style='text-align: center; ";
        }
        columnSortImgTd+=background+"'>";

        if (showSortControls) {
            columnSortImgTd += that.generateSortImg(column.headerId + "Img", column.sortBy);
        } else {
            columnSortImgTd += "&nbsp;";
        }

        columnSortImgTd += "</td>";

        if (column.insertSeparatorAfter) {
            columnSortImgTd += "<td class='noArrows noRightBorder'>&nbsp;</td>";
        }

        return columnSortImgTd;
    }

    this.renderTableHeader = function () {
        var tableHeader = "";

        for (var i in that.columns) {
            var column = that.columns[i];

            tableHeader += that.renderColumnHeader(column);
        }

        return tableHeader;
    }

    this.renderTableSortTrContents = function () {
        var sortTrContents = "";

        for (var i in that.columns) {
            var column = that.columns[i];

            sortTrContents += that.renderColumnSortImgTd(column, i);
        }

        return sortTrContents;
    }
}

function NewGameLister() {
    var that = this;

    that.currentPosition = null;
    that.gameIdList = [];

    this.resetNewGameLister = function () {
        that.currentPosition = null;
        that.gameIdList = [];

        __w_clear();
        __w_arr(that.gameIdList, that.currentPosition);
    }

    this.contains = function (gameId) {
        for (var i in that.gameIdList) {
            if (that.gameIdList[i] == gameId) {
                return true;
            }
        }

        return false;
    }

    this.addGameId = function (gameId) {
        if (!that.contains(gameId)) {
            that.gameIdList.push(gameId);
            that.currentPosition = that.gameIdList.length - 1;

            __w_clear();
            __w_arr(that.gameIdList, that.currentPosition);
        }
    }

    this.hasNext = function () {
        return that.currentPosition != null && that.currentPosition < that.gameIdList.length - 1;
    }

    this.next = function () {
        that.currentPosition++;

        __w_clear();
        __w_arr(that.gameIdList, that.currentPosition);

        return that.gameIdList[that.currentPosition];
    }

    this.hasPrevious = function () {
        return that.currentPosition && that.currentPosition > 0;
    }

    this.previous = function () {
        that.currentPosition--;

        __w_clear();
        __w_arr(that.gameIdList, that.currentPosition);

        return that.gameIdList[that.currentPosition];
    }

    that.resetNewGameLister();
}

function Paginator(total, count, currentPosition) {
    var that = this;

    this.hasNext = function () {
        return that.currentPosition + that.count - 1 < that.total - 1;
    }

    this.next = function () {
        if (that.hasNext()) {
            that.currentPosition += that.count;
            that.computeCount();
            that.notify("currentPositionChanged");
        }
    }

    this.hasPrevious = function () {
        return that.currentPosition > 0;
    }

    this.previous = function () {
        if (that.hasPrevious()) {
            that.currentPosition -= that.count;
            if (that.currentPosition < 0) {
                that.currentPosition = 0;
            }
            that.computeCount();
            that.notify("currentPositionChanged");
        }
    }

    this.showAll = function () {
        that.currentPosition = 0;
        that.currentCount = 0;
        that.notify("currentPositionChanged");
    }

    this.computeCount = function () {
        if (that.total == 0) {
            that.currentCount = that.count;
        } else {
            that.currentCount = Math.min(that.count, that.total - that.currentPosition);
        }
    }

    this.setTotal = function (total) {
        that.total = total;
        that.computeCount();
    }

    this.getPreviousCount = function () {
        return Math.min(that.currentPosition, that.count);
    }

    this.getNextCount = function () {
        return Math.min(that.total - that.currentPosition, that.count);
    }

    this.reset = function () {
        that.total = 0;
        that.currentPosition = 0;
        that.computeCount();
    }

    multiExtendClass(Paginator, Listener, this);

    that.total = total;
    that.count = count;
    that.currentPosition = currentPosition;

    that.computeCount();
}

function PaginatorRenderer(paginator, prefix) {
    var that = this;

    that.paginator = paginator;
    that.prefix = prefix;

    that.prevLinkId = that.prefix + "ShowPrevious";
    that.nextLinkId = that.prefix + "ShowNext";
    that.paginatorId = that.prefix + "Paginator";
    that.paginatorStatsId = that.prefix + "PaginatorStats";

    var i18n = new I18n();
    i18n.setContext('paginator');

    this.render = function () {
        if (!that.paginator.hasNext() && !that.paginator.hasPrevious()) {
            return "";
        }

        var strRange = (that.paginator.currentPosition + 1)
            + " &ndash; "
            + (that.paginator.currentPosition + that.paginator.currentCount);

        return "<table border='1' style='margin-top: 10px;' width='100%' class='noBordersTable' id='" + that.paginatorId + "'>"
            + "<tr>"
            + "<td width='50%'>"
            + (that.paginator.hasPrevious()
            ? "<p class='paginatorNavigation paginatorActiveNavigation' id='" + that.prevLinkId + "'>" + i18n.get("previousPrefix") + " " + that.paginator.getPreviousCount() + "</p>"
            : "<p class='paginatorNavigation paginatorInactiveNavigation'>—</p>")
            + "</td>"
            + "<td width='50%'>"
            + (that.paginator.hasNext()
            ? "<p class='paginatorNavigation paginatorActiveNavigation' id='" + that.nextLinkId + "'>" + i18n.get("nextPrefix") + " " + that.paginator.getNextCount() + "</p>"
            : "<p class='paginatorNavigation paginatorInactiveNavigation'>—</p>")
            + "</td>"
            + "</tr>"
            + "<tr>"
            + "<td colspan='2' class='paginatorStats' id='" + that.paginatorStatsId + "' style='text-align: center !important;'>"
            + strRange + " " + i18n.get("rangeOf") + " " + that.paginator.total
            + "</td>"
            + "</tr>"
            + "</table>";
    }

    this.setLoading = function () {
        $("#" + that.paginatorStatsId).empty().append("<img style='width: 32px;' src='/img/icons/loading.gif' />");
    }

    this.bindEvents = function () {
        $("#" + that.prevLinkId).click(function () {
            that.paginator.previous();
            that.setLoading();
        });

        $("#" + that.nextLinkId).click(function () {
            that.paginator.next();
            that.setLoading();
        });
    }
}
function Loader(total, loadCount) {
    var that = this;

    this.isSinglePaged = function () {
        return that.count >= that.total;
    }

    this.computeCount = function () {
        /*
         При первом открытии списка нам ещё не известно общее количество позиций, но
         уже нужно передать какое-то значение загрузчику. Логично передать loadCount —
         если общее количество позиций будет меньше — скорректируем после загрузки.
         */
        if (that.total == 0) {
            that.count = that.loadCount;
        } else {
            if (that.count == 0) {
                that.count = that.total;
            } else {
                if (that.count < that.loadCount) {
                    that.count = that.loadCount;
                }

                that.count = Math.min(that.count, that.total);
            }
        }
    }

    this.setTotal = function (total) {
        that.total = total;

        that.computeCount();
    }

    this.reset = function () {
        that.total = 0;
        that.computeCount();
    }

    this.getMoreCount = function () {
        return Math.min(that.loadCount, that.total - that.count);
    }

    this.showMore = function () {
        that.count = that.count + that.loadCount;
        that.computeCount();
        that.notify("countChanged");
    }

    this.showAll = function () {
        that.count = 0;
        that.notify("countChanged");
    }

    multiExtendClass(Paginator, Listener, this);

    that.total = total;
    that.loadCount = loadCount;

    that.computeCount();
}

function LoaderRenderer(loader, moreLabel) {
    var that = this;

    var i18n = new I18n();
    i18n.setContext('loader');

    this.render = function () {
        if (that.loader.isSinglePaged()) {
            return "";
        }

        return "<table border='1' style='margin-top: 10px;' width='100%' class='noBordersTable' id='glShowPanel'>"
            + "<tr>"
            + "<td width='50%'>"
            + "<p class='glShowMore' id='glShowMore'>" + i18n.get("loaderMorePrefix") + " " + loader.getMoreCount() + " " + i18n.get("loaderMoreSuffix", that.options.moreLabel) + "</p>"
            + "</td>"
            + "<td width='50%'>"
            + "<p class='glShowAll' id='glShowAll'>" + i18n.get("loaderShowAll") + "</p>"
            + "</td>"
            + "</tr>"
            + "<tr>"
            + "<td colspan='2' class='glPaginationStats' style='text-align: center !important;'>" + loader.count + " " + i18n.get("loaderOf") + " " + loader.total + "</td>"
            + "</tr>"
            + "</table>";
    }

    this.bindEvents = function () {
        $("#glShowMore").click(function () {
            $("#glShowPanel").empty().append("<p class='giLoadingMore'>" + i18n.get("loadingAlert") + "&nbsp;<img style='margin-bottom:-10px;' src='/img/icons/loading.gif'></p>");
            that.loader.showMore();
        });

        $("#glShowAll").click(function () {
            $("#glShowPanel").empty().append("<p class='giLoadingMore'>" + i18n.get("loadingAlert") + "&nbsp;<img style='margin-bottom:-10px;' src='/img/icons/loading.gif'></p>");
            that.loader.showAll();
//            count = 0;
//            that.loadAndRender(true);
        });
    }

    that.loader = loader;

    that.options = [];
    that.options.moreLabel = moreLabel; //"hands";
}
//_________________ RATING RENDER _____________________
//TODO: version load for template
var RatingRender = (function(){
    var _RANK = 'rank', _NAME = 'username';
    var _click = ' rating-table-clickcol ',_grey = ' rating-table-greycol ', _userid = 'data-rating-userid';
    var _imgarrows = ['/img/icons/sort-asc.png','/img/icons/sort-both.png','/img/icons/sort-desc.png'];
    var _online= 'class="rplayer-online"', _active='class="rplayer-active"';
    var _novice = '<span style="color: #C42E21 !important;">новичок</span>';
    var columns = [], tabs = [], subTabs = [], currentTab, currentSubTab, orderedColumn;
    var max = 500, offset = 0;
    var infoUser = null;
    var div = null, oldSearch = '';

    var functions={
        onColumnClick:null, onClose:null, onFilter:null, onTabClicked:null, onUserClick:null,onShowMore:null, autocomplete:null
    };

    function setColumns(cols){
        if (!cols || !cols.length){
            throw new Error('No columns to set!');
        }
        columns = [];
        for (var i = 0; i < cols.length; i++){
            columns.push(new Column(cols[i]));
        }
        infoUser = null;
    }

    function setTabs(newtabs){
        if (!newtabs || !newtabs.length){
            throw new Error('No tabs to set!');
        }
        tabs = newtabs;
        tabs[0].active = true;
        currentTab = tabs[0].id;
    }

    function setSubTabs(newsabtabs){
        if (!newsabtabs || !newsabtabs.length){
            throw new Error('No tabs to set!');
        }
        subTabs = newsabtabs;
        subTabs[0].active = true;
        currentSubTab = subTabs[0].id;
    }

    function render(data){
        var table='', head='', body='', showMoreButton='', stabs='';

        if (isDef(data.tabs) && data.tabs) setColumns(data.tabs);
        if (isDef(data.columns) && data.columns) setColumns(data.columns);
        if (isDef(data.sort) && data.sort) setColumnOrder(getColumn(data.sort.column),data.sort.order);

        stabs = renderTabs();
        stabs +=renderSubTabs();

        head = renderHeaders();
        if (isDef(data.infoUser) && !!data.infoUser) infoUser = data.infoUser;
        if (infoUser) head += renderUserRow(infoUser);

        if (isDef(data.infoAllUsers) && !!data.infoAllUsers) body = renderTBody(data.infoAllUsers);
        table = Template.get("rating/table.html",{ head:head, body:body});

        if (data.infoAllUsers && data.infoAllUsers.length>=max)
            showMoreButton = Template.get("rating/div_show_more.html",{count:max});

        return Template.get("rating/div_main.html",{data:table+showMoreButton, tabs:stabs});
    }

    function append(data){
        unbindEvents();
        if (isDef(data.infoAllUsers) && !!data.infoAllUsers)
            $('.rating-table > tbody:last').append(renderTBody(data.infoAllUsers));
        if (data.infoAllUsers && data.infoAllUsers.length>=max)
            $('#ratingShowMore').show();
        else $('#ratingShowMore').hide();
        bindEvents();
    }

    function renderTabs(){
        var stabs = '', i;
        for (i = 0; i<tabs.length; i++){
            stabs+= Template.get("rating/tab.html",{
                id:'tab_'+tabs[i].id,
                tabid:tabs[i].id,
                title:tabs[i].title,
                cclass:(tabs[i].active?'rating_link_active':'rating_link_unactive')
            });
        }
        return stabs;
    }

    function renderSubTabs(){
        if (subTabs.length == 0) return '';
        var stabs = '<br>', i;
        for (i = 0; i<subTabs.length; i++){
            stabs+= Template.get("rating/tab.html",{
                id:'stab_'+subTabs[i].id,
                tabid:subTabs[i].id,
                title:subTabs[i].title,
                cclass:(subTabs[i].active?'rating_link_active':'rating_link_unactive')
            });
        }
        return stabs;
    }

    function renderHeaders(){
        var tophead='', midhead='', i, col;
        for(i = 0; i<columns.length; i++){
            col = columns[i];
            // заголовки
            tophead+=Template.get(col.isSorted()?"rating/th_sort.html":"rating/th.html",{ title:'', data:col.title, id:null });
            // кнопки сортировок под заголовками и поле поиска
            if (col.id==_RANK) midhead += Template.get("rating/th_rate.html",{});
            else if (col.id==_NAME) midhead += Template.get("rating/th_name.html",{value:oldSearch});
            else {
                midhead += Template.get(col.isSorted()?"rating/th_sort.html":"rating/th.html",
                    {   title:col.toptitle, id:col.id,
                        data:col.order!=null?('<img src="'+_imgarrows[col.order+1]+'">'):''
                    });
            }
        }
        tophead =  Template.get("rating/tr_head.html",{ height:40, data:tophead });
        midhead =  Template.get("rating/tr_head.html",{ height:30, data:midhead });
        return tophead + midhead;
    }

    function renderUserRow(infoUser){
        if (typeof functions.onEach == "function") functions.onEach(infoUser);
        var userrow='', i, col;
        for(i = 0; i<columns.length; i++){
            col = columns[i];
            if (col.id==_RANK) userrow += Template.get("rating/td_user_rate.html?v=1");
            else if (col.id==_NAME) userrow += Template.get("rating/td_user_name.html?v=1",infoUser);
            else {
                userrow += renderColumn(infoUser, col);
            }
        }

        return Template.get("rating/tr_user.html?v=1",{ userid:infoUser.userid, username:'', rank:'', data:userrow});
    }

    function renderColumn(data, column){
        var cclass='', style='',val;
        if (column.isSorted()) orderedColumn = column;
        switch (column.id){

            case _RANK:
                return Template.get("rating/td.html?v=1",{id:column.id,cclass:'',style:'',title:'',other:'', data:data.rank});
                break;
            case _NAME:
                data.username = data.username.substr(0,20);
                var photo = '';
                if (isDef(data.photo) && !!data.photo){
                    if (data.photo.substring(0,4) != "http") data.photo = '/images/profile/' + data.photo;
                    photo =  Template.get("rating/div_phot.html", data);
                }
                return Template.get("rating/td.html?v=1",{id:column.id,cclass:'',style:'',title:'', other:_userid+'="'+data.userid+'"',
                    data:Template.get("rating/div_name.html?v=1", data)+photo
                });
                break;
            default :
                val = data[column.id];
                if (column.isDate){
                    if (typeof val == "string") val = Date.parse(val.substr(0,10));
                    if (new Date() - val<172800000) val = _novice;
                    else val = formatDate(val/1000);
                }
                cclass = (column.isClicked()?_click:'')+(column.isGrey?_grey:'');
                if (column.sup && isDef(data[column.id+'_sup']))
                    val = Template.get("rating/div_sup.html",{data:val, data_sup:(data[column.id+'_sup']?'+'+data[column.id+'_sup']:'')});

                return Template.get("rating/td.html?v=1",{
                    id:column.id,
                    cclass:(cclass!=''?'class = "'+cclass+'"':''),
                    style:(style?'style = "'+style+'"':''),
                    title:(column.tooltip&&isDef(data[column.id+'_tooltip'])?'title="'+data[column.id+'_tooltip']+'"':''),
                    other:'',
                    data:val
                });

        }
    }

    function renderTBody(data){
        var body='';
        for (var i = 0; i<data.length && i<max; i++){
            if (!!data[i])body += renderRow(data[i]);
        }
        return body;
    }

    function renderRow(row){
        if (typeof functions.onEach == "function") functions.onEach(row, {sort:getSort(), filter:getFilter(), tabid:currentTab, subtabid:currentSubTab, limit:getLimit()});
        var srow='', i;
        for (i = 0; i<columns.length; i++){
            srow+=renderColumn(row,columns[i]);
        }
        return Template.get("rating/tr.html",{cclass:(row.online&&row.online!="0")?(row.active!="0"?_active:_online):'',style:'',title:'',other:'', data:srow, userid:row.userid});
    }

    function bindEvents(){
        var col, i;
        $('#rating_close_icon').click(close);
        $('#rating_close_btn').click(close);
        $('#jump-top').click(scrollUp);
        $('#ratingShowMore').click(showMoreClicked);

        $('.rating-profile').click(userClicked);

        for (i = 0; i<columns.length; i++){
            col = columns[i];
            if(col.order!=null){
                $('#'+col.id).click(columnClicked);
            }
            if (col.isClicked()){
                $('.rating-table-clickcol').click(cellClicked)
            }
        }

        for (i = 0; i<tabs.length; i++){
            $('#tab_'+tabs[i].id).click(tabClicked)
        }
        for (i = 0; i<subTabs.length; i++){
            $('#stab_'+subTabs[i].id).click(subTabClicked)
        }

        $("#rating-autocomplete").keydown(function (event) {
            if (event.which == 13) {
                filter(this.value);
                event.preventDefault();
            }
        });

        if (functions.autocomplete){
            $('#rating-autocomplete').autocomplete({ source : functions.autocomplete });
        }
    }

    function columnClicked(e){
        var col = getColumn(e.currentTarget.id);
        if (!col) throw new Error('No column with id: '+ e.currentTarget.id);
        setColumnOrder(col,col.nextSort());
        offset = 0;
        if (typeof functions.onColumnClick == "function")
            functions.onColumnClick({
                sort:getSort(), filter:getFilter(), tabid:currentTab, subtabid:currentSubTab, limit:getLimit(), column:col
            });
    }

    function cellClicked(e){
        console.log(e.currentTarget);
        var id = e.currentTarget.getAttribute('idcol');
        var col = getColumn(id);
        var userid = e.currentTarget.parentNode.getAttribute('userid');
        col.click({userid:userid, columnid:id, tabid:currentTab, subtabid:currentSubTab, filter:getFilter(), column:col});
    }

    function showMoreClicked(e){
        offset+=max;
        if (typeof functions.onShowMore == "function")
            functions.onShowMore({
                sort:getSort(), filter:getFilter(), tabid:currentTab, subtabid:currentSubTab, limit:getLimit()
            });
    }

    function getFilter(){
        oldSearch = $('#rating-autocomplete').val()||"";
        return oldSearch.trim();
    }

    function getSort(){
        if (!orderedColumn || !orderedColumn.isSorted()) return null;
        var sort={};
        sort[orderedColumn.id] = orderedColumn.order<0?'DESC':'ASC';
        return sort;
    }

    function getLimit() {
        return {offset:offset, limit:max};
    }

    function tabClicked(e){
        var id = e.currentTarget.getAttribute('tabid'), tab;
        if (id=="admin") window.location = "/admin";
        for (var i = 0; i < tabs.length; i++)
            if (tabs[i].id == id){
                tab = tabs[i];
                tab.active = true;
                $('#tab_'+tab.id).removeClass('rating_link_unactive').addClass('rating_link_active');
                currentTab = tab.id;
            } else {
                tabs[i].active = false;
                $('#tab_'+tabs[i].id).removeClass('rating_link_active').addClass('rating_link_unactive');
            }
        offset = 0;
        if (typeof functions.onTabClicked == "function")
            functions.onTabClicked({
                sort:getSort(), filter:getFilter(), tabid:currentTab, subtabid:currentSubTab, limit:getLimit()
            });
    }

    function subTabClicked(e){
        var id = e.currentTarget.getAttribute('tabid'), tab;
        for (var i = 0; i < subTabs.length; i++)
            if (subTabs[i].id == id){
                tab = subTabs[i];
                tab.active = true;
                $('#stab_'+tab.id).removeClass('rating_link_unactive').addClass('rating_link_active');
                currentSubTab = tab.id;
            } else {
                subTabs[i].active = false;
                $('#stab_'+subTabs[i].id).removeClass('rating_link_active').addClass('rating_link_unactive');
            }
        offset = 0;
        if (typeof functions.onTabClicked == "function")
            functions.onTabClicked({
                sort:getSort(), filter:getFilter(), tabid:currentTab, subtabid:currentSubTab, limit:getLimit()
            });
    }

    function userClicked(e){
        var userid = e.currentTarget.getAttribute('userid');
        var username = e.currentTarget.getAttribute('username');
        if (typeof functions.onUserClick == "function")
            functions.onUserClick({userid:userid, username:username, tabid:currentTab, subtabid:currentSubTab});
    }

    function setCurrentSubTab(tabId){
        for (var i = 0; i < subTabs.length; i++)
            if (subTabs[i].id == tabId){
                tab = subTabs[i];
                tab.active = true;
                $('#stab_'+tab.id).removeClass('rating_link_unactive').addClass('rating_link_active');
                currentSubTab = tab.id;
            } else {
                subTabs[i].active = false;
                $('#stab_'+subTabs[i].id).removeClass('rating_link_active').addClass('rating_link_unactive');
            }
    }

    function setColumnOrder(col, order){
        for (var i = 0; i < columns.length; i++){
            if (columns[i] == col){
                col.order = order;
                orderedColumn = col;
            } else if (columns[i].order!=null) columns[i].order = 0;
        }
    }

    function getColumn(id){
        if (columns && columns.length>0){
            for (var i = 0; i < columns.length; i++)
                if (columns[i].id == id){
                    return columns[i];
                }
        }
        return null;
    }

    function filter(value){
        offset = 0;
        if (typeof functions.onFilter == "function")
            functions.onFilter({
                sort:getSort(), filter:getFilter(), tabid:currentTab, subtabid:currentSubTab, limit:getLimit()
            });
    }

    function close(){
        if (typeof functions.onClose == "function") functions.onClose();
    }

    function scrollUp(){
        $("html, body").animate({scrollTop : $(".rating-table").offset().top-50});
    }

    function unbindEvents() {
        var col, i;
        $('#rating_close_icon,#rating_close_btn,#jump-top,.rating-profile,.rating-table-clickcol,#ratingShowMore').unbind('click');

        for (i = 0; i<columns.length; i++){
            $('#'+columns[i].id).unbind('click');
        }

        for (i = 0; i<tabs.length; i++){
            $('#tab_'+tabs[i].id).unbind('click');
        }

        for (i = 0; i<subTabs.length; i++){
            $('#stab_'+subTabs[i].id).unbind('click');
        }

        $("#rating-autocomplete").unbind('keydown');
    }



    function Column(data){
        /* order:
         -1 - desc;
         1 asc;
         0 - can be ordered
         null - can't

         onClick(userId, columnId, currentTabId)
         */
        var that = this;

        this.id = data.id;
        this.title = data.title;
        this.toptitle = isDef(data.toptitle)?data.toptitle:this.title;
        this.order = isDef(data.order)?data.order:null;
        this.sup = isDef(data.sup)?data.sup:false;
        this.tooltip = isDef(data.tooltip)?data.tooltip:false;
        this.click = (isDef(data.onClick) && typeof data.onClick == "function")?data.onClick:null;
        this.isDate = isDef(data.isDate)?data.isDate:false;
        this.isGrey = isDef(data.isGrey)?data.isGrey:false;

        this.isSorted = function(){ return that.order!=null && that.order!==0; };
        this.isClicked = function(){ return !!that.click; };
        this.nextSort = function(){
            if (that.order == null) return null;
            switch (that.order){
                case 0: return 1;
                case 1: return -1;
                case -1: return 1;
            }
            return null;
        }
    }



    // ----------------------------------------------------------------------------

    return {

        setDiv:function(_div){
            if (!_div) return;
            if (typeof _div == "string") div = $('#'+_div);
            else div = _div;
        },

        render: function(data){
            if (!div) return render(data);
            if (!$(div)) throw new Error('no div for table!');
            $(div).html(render(data));
            bindEvents();
            return true;
        },

        append:append,

        bindEvents: function(){
            bindEvents();
        },

        setColumns: setColumns,

        setTabs: setTabs,

        setSubTabs:setSubTabs,

        onColumnClick:function(func){
            if (typeof func == "function"){
                functions.onColumnClick = func;
            }
            return this;
        },

        onTabClicked:function(func){
            if (typeof func == "function"){
                functions.onTabClicked = func;
            }
            return this;
        },

        onUserClick:function(func){
            if (typeof func == "function"){
                functions.onUserClick = func;
            }
            return this;
        },

        onClose:function(func){
            if (typeof func == "function"){
                functions.onClose = func;
            }
            return this;
        },

        onFilter:function(func){
            if (typeof func == "function"){
                functions.onFilter = func;
            }
            return this;
        },
        onEach:function(func){
            if (typeof func == "function"){
                functions.onEach = func;
            }
            return this;
        },
        onShowMore:function(func){
            if (typeof func == "function"){
                functions.onShowMore = func;
            }
            return this;
        },
        autocomplete:function(func){
            if (typeof func == "function"){
                functions.autocomplete = func;
            }
            return this;
        },
        unbind:function(){
            unbindEvents();
            return this;
        },
        setCurrentSubTab:setCurrentSubTab
    }

}());
/**\
 * LogicGame client
 * use: LogicGame.init(function(){
 *     console.log("ready", controller.cs.isSuperUser());
 * })
 */
var LogicGame = function(){
    var ui;
    var controller;
    var func;
    var isInit=false;

    function ClientServer(_gameVariationId) {
        var that = this;
        var gameVariationId;
        var beaconCounter = -2;
        that.globalAsync = true;
        that.globalTimeout = 15000;

        this.isLogged = function () {
            return !that.isGuest();
        }

        this.getGameVariationId = function () {
            return gameVariationId;
        }

        this.sendBeacon = function (threshold, timeout, callbackFn) {
            beaconCounter++;
            if (beaconCounter >= threshold || beaconCounter == -1) {
                beaconCounter = 0;

                $.ajax({
                    url : "/gw/beacon.php",
                    type : "POST",
                    data : {
                        nocache : new Date().getTime(),
                        sessionId : that.getSessionId(),
                        userId : that.getUserId(),
                        gameVariationId : that.getGameVariationId()
                    },
                    timeout : timeout,
                    async : true
                }).done(function (data) {
                        var response = parseJSON(data);
                        if (response != null && response.status == "ok" && isDef(callbackFn)) {
                            callbackFn(true, response);
                        }
                    }).error(function (jqXHR, textStatus, errorThrown) {
                        if (isDef(callbackFn)) {
                            callbackFn(false);
                        }
                    });
            }
        };
        multiExtendClass(ClientServer, ProfileClientServer, this);
        multiExtendClass(ClientServer, SharedClientServer, this);
        gameVariationId = _gameVariationId;
        that.attemptLocalStorage = new AttemptLocalStorage(that);
    }

    function GameController(_cs, _serializer) {
        var that = this;
        var cs;
        var beacon;
        that.gameURL = location.href.substr(0,location.href.lastIndexOf('/')+1);
        var KEY_ESC = 27;

        this.getClientServer = function () {
            return cs;
        }

        this.setup = function () {
            jQuery(document).keydown(this.keyDown);
            that.ui = ui = new UI(this);
            that.cs = cs;
            beacon = new Beacon(this, ui);

            var timer = $.timer(function () {
                beacon.sendBeacon();
            });

            timer.set({
                time : 1000, autostart : true
            });
        }
        this.keyDown = function (e) {
            var key = e.which;
            if (key == KEY_ESC) {
                that.notifyEsc();
                ui.hideAllActivePanels();
            }
        }

        this.logout = function () {
            cs.logout(function (result) {
                    if (result) {
                        //window.location = that.gameURL;
                        location.reload();
                    }
                }
            );
        }

        this.setAboutToLogin = function (_aboutToLogin) {
            aboutToLogin = _aboutToLogin;
        }


        multiExtendClass(GameController, SharedController, this);
        cs = _cs;
        that.cs = cs;
    }

    function UI(_gc) {
        var that = this;
        var OVER_FIELD_PANEL = 0;
        var BOTTOM_PANEL = 1;

        var guestBookRenderer,
            loginRegisterManager;

        this.showRegPanel = function () {
            loginRegisterManager.showRegMePanel();
        }

        multiExtendClass(UI, SharedUI, this);
        that.setGameController(_gc);
        that.setupSharedUI();
        var gc = _gc;
        that.gc = _gc;
        guestBookRenderer = new GuestBookRenderer(gc, this, null);
        loginRegisterManager = new LoginRegisterManager(_isFreshUser, this, gc, {
            showWelcomePanel : true
        });

        this.hidePanel = function (panelId) {
            $(".buttonMenu.downmeny a").removeClass('on');
            that.hideAllActivePanels();
            if (panelId instanceof BottomSubPanel) {
                panelId.fireOnClose(HIDE_SINGLE_PANEL);
                panelId.destroy();
            }
        }

        this.setGuestUI = function () {
            $("#bbProfile").hide();
            $("#bbLoginRegister").show();
            that.showPanel({
                id : "welcomePanel",
                type : OVER_FIELD_PANEL
            });
        }

        this.setUserUI = function () {
            $("#bbProfile").show();
            $("#bbLoginRegister").hide();
            that.hidePanel("welcomePanel");
        }

        this.showGuestBook = function(){
            guestBookRenderer.run();
        }

        //console.log('UI', this.userProfile.updateUnreadMsgCount);
    }

    function ready() {
        if (!_gameVariationId) throw new Error("_gameVariationId undefined");
        if (!_sessionId) throw new Error("_sessionId undefined");
        if (!_userId) throw new Error("_userId undefined");
        if (!_username) throw new Error("_username undefined");

        if (window.controller || window.cs || window.ui) throw new Error("client already initialized");
        var cs = new ClientServer(_gameVariationId);
        cs.setSessionId(_sessionId);
        cs.setUser(_userId, _username, _isGuest);
        controller = new GameController(cs, null);
        controller.setup();
        window.controller = controller;
        window.ui = ui;
        isInit = true;
        if (typeof _isGuest != "undefined"){
            if (_isGuest) ui.setGuestUI(); else ui.setUserUI();
        }
        if (func) func();
    }

    return {
        init: function(callback){
            if (callback && typeof callback == "function") func = callback;
            if (jQuery) jQuery(document).ready(ready);
            else setTimeout(ready, 1000);
        },
        isSuperUser :function(){
            return controller.cs.isSuperUser();
        },
        isInit: function(){
            return isInit;
        },
        hidePanels: function(){
            ui.hideAllActivePanels();
        },
        setupVKResizer: function(wrapper){
            window.Resizer(wrapper);
        },
        showGuestBook: function(){
            ui.showGuestBook();
        }
    }
}();




function I18n() {
    var that = this;

    var translation = null;

    this.setContext = function (context) {
        translation = contexts[context];
    }

    this.get = function (id, variation) {
        if (translation) {
            if (isDef(translation[id])) {
                if (isDef(variation)) {
                    return translation[id][variation];
                } else {
                    return translation[id];
                }
            }
            if (isDef(contexts["shared"][id])) {
                if (isDef(variation)) {
                    return contexts["shared"][id][variation];
                } else {
                    return contexts["shared"][id];
                }
            }
        } else {
            return "";
        }
    }

    this.format = function (id) {
        var template = that.get(id);

        var result = "";

        var state = 0;

        var buffer = "";

        for (var i = 0; i < template.length; i++) {
            var c = template.charAt(i);

            if (c == '{' && state == 0) {
                state = 1;
            } else if (c == '{' && state == 1) {
                state = 2;
            } else if (c != '{' && c != '}' && state == 2) {
                buffer += c;
            } else if (c == '}' && state == 2) {
                result += arguments[parseInt(buffer) + 1];
                state = 1;
                buffer = "";
            } else if (c == '}' && state == 1) {
                state = 0;
            } else {
                result += c;
            }
        }

        return result;
    }

    this.transliterate = function (s) {
        if (!I18n.get("isLatin")) {
            return s;
        }

        var map = I18n.get("symbolMap");

        return s.replace("Гость", "Guest").split('').map(function (char) {
            return ifDef(map[char], char);
        }).join("");
    }

    this.getMonth = function (monthNumber) {
        return contexts["months"][monthNumber];
    }

    this.getMonthShort = function (monthNumber) {
        return contexts["monthsShort"][monthNumber];
    }

    this.getMonthBeta = function (monthNumber) {
        return contexts["monthsBeta"][monthNumber];
    }
}

I18n.get = function (id) {
    if (isDef(contexts["shared"][id])) {
        return contexts["shared"][id];
    } else {
        return "";
    }
}

I18n.contextGet = function (context, id) {
    if (isDef(contexts[context]) && isDef(contexts[context][id])) {
        return contexts[context][id];
    } else {
        return "";
    }
}

I18n.JANUARY = 1;
I18n.FEBRUARY = 2;
I18n.MARCH = 3;
I18n.APRIL = 4;
I18n.MAY = 5;
I18n.JUNE = 6;
I18n.JULY = 7;
I18n.AUGUST = 8;
I18n.SEPTEMBER = 9;
I18n.OCTOBER = 10;
I18n.NOVEMBER = 11;
I18n.DECEMBER = 12;
/*

 Queue.js

 A function to represent a queue

 Created by Stephen Morley - http://code.stephenmorley.org/ - and released under
 the terms of the CC0 1.0 Universal legal code:

 http://creativecommons.org/publicdomain/zero/1.0/legalcode

 */

/* Creates a new queue. A queue is a first-in-first-out (FIFO) data structure -
 * items are added to the end of the queue and removed from the front.
 */
function Queue() {

    // initialise the queue and offset
    var queue = [];
    var offset = 0;

    /* Returns the length of the queue.
     */
    this.length = function () {

        // return the length of the queue
        return (queue.length - offset);

    }

    /* Returns true if the queue is empty, and false otherwise.
     */
    this.isEmpty = function () {

        // return whether the queue is empty
        return (queue.length - offset == 0);

    }

    /* Enqueues the specified item. The parameter is:
     *
     * item - the item to enqueue
     */
    this.enqueue = function (item) {

        // enqueue the item
        queue.push(item);

    }

    /* Dequeues an item and returns it. If the queue is empty then undefined is
     * returned.
     */
    this.dequeue = function () {

        // if the queue is empty, return undefined
        if (queue.length == 0) return undefined;

        // store the item at the front of the queue
        var item = queue[offset];

        // increment the offset and remove the free space if necessary
//        if (++offset * 2 >= queue.length) {
//            queue = queue.slice(offset);
//            offset = 0;
//        }
        offset++;

        // return the dequeued item
        return item;

    }

    /* Returns the item at the front of the queue (without dequeuing it). If the
     * queue is empty then undefined is returned.
     */
    this.peek = function () {

        // return the item at the front of the queue
        return (queue.length > 0 ? queue[offset] : undefined);

    }

}
