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