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
                        //init();

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


    $(window).resize(function(){
        setNewIframeSize();
    });
    setInterval(function () {
        if (wrapper.height() != oldHeight){
            setNewIframeSize();
        }
    },100);

    function setNewIframeSize() {
        width = wrapper.width();
        width = width > 1000 ? 1000 : width;
        console.log('Resizer setNewIframeSize', oldHeight, $('body').height(), width);
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
        //var lang, langTitle, $a = $('<a>');
        //if (window._lang == 'en') {
        //    lang = 'ru';
        //    langTitle = 'РУ';
        //} else {
        //    lang = 'en';
        //    langTitle = 'EN';
        //}
        //
        //$a.html(langTitle).attr("href", "?lang=" + lang).addClass('switchLocale');
        //$field.append($a);
        //$a.css({
        //    top: $field.height()  + 8,
        //    left: $field.width() + 20,
        //    position: 'absolute'
        //});
    }
    if (window._isVk){
        try{
           $('.lg-vkgroup').appendTo(document.body).css(
               {
                   right: '3px', bottom: '3px', top: 'auto'
               }
           )
        } catch(e){}
    }
    if (window._lang && window._lang != 'ru'){
        $('.lg-vkgroup').hide();
    }

    if (window._isIframe) {
        $('a[href^="/"]').attr('target','_blank');
    }

    if (window._isFb){
        //hide banner
        $('.lg-banner').hide();
        $('#lg-activity-container').show();
    }
});