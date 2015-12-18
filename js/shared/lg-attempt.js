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