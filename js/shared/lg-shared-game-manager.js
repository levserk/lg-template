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