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