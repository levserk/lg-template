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
    };

    this.initGameInfo = function(){

        that.showDescription = function(){
            $('#description').show();
            $('#main-wrapper').css('min-height', $('#description .description-wrapper').height()+5+'px');
            //$('#app-container').hide();
            //$('#bottom-block').hide();
        };

        that.hideDescription = function(){
            $('#description').hide();
            $('#main-wrapper').css('min-height', '');
        };

        $('#showDescription').click(that.showDescription);
        $('#openDescription').click(that.showDescription);
        $('#closeDescription').click(that.hideDescription);
    };

    this.initGameInfo();

    console.log('hi, im safeshared ui');
}

function SharedUI() {

    console.log('hi, im shared ui');
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