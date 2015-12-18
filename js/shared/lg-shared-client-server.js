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
                userId == 3172467 ||
                userId == 7123667 ||
                userId == 12050588 ||
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