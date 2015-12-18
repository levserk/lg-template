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