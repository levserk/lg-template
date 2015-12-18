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
            //if (that.isGameActive() && (that.isGameValueless() || confirm(that.i18n.get("startNewGamePrompt")))) {
                that.startNextGame();
            //}
        });

        $("#tbReplay").click(function () {
            //if (that.isGameActive() && (that.isGameValueless() || confirm(that.i18n.get("replayGamePrompt")))) {
                that.replay();
            //}
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