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