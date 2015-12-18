function SharedGame() {
    var that = this;

    this.notifyWinState = function () {
        for (var i = 0; i < that.listeners.length; i++) {
            var l = that.listeners[i];
            if (isDef(l.gameIsWon)) {
                l.gameIsWon();
            }
        }
    }

    this.notifyNewGameIsSet = function () {
        for (var i = 0; i < that.listeners.length; i++) {
            var l = that.listeners[i];
            if (isDef(l.newGameIsSet)) {
                l.newGameIsSet();
            }
        }
    }

    this.notifyGoSilent = function (isSilent) {
        for (var i = 0; i < that.listeners.length; i++) {
            var l = that.listeners[i];
            if (isDef(l.wentSilent)) {
                l.wentSilent(isSilent);
            }
        }
    }

    this.notifyWinState = function () {
        for (var i = 0; i < that.listeners.length; i++) {
            var l = that.listeners[i];
            if (isDef(l.gameIsWon)) {
                l.gameIsWon();
            }
        }
    }
}