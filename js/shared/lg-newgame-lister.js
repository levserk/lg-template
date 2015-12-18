function NewGameLister() {
    var that = this;

    that.currentPosition = null;
    that.gameIdList = [];

    this.resetNewGameLister = function () {
        that.currentPosition = null;
        that.gameIdList = [];

        __w_clear();
        __w_arr(that.gameIdList, that.currentPosition);
    }

    this.contains = function (gameId) {
        for (var i in that.gameIdList) {
            if (that.gameIdList[i] == gameId) {
                return true;
            }
        }

        return false;
    }

    this.addGameId = function (gameId) {
        if (!that.contains(gameId)) {
            that.gameIdList.push(gameId);
            that.currentPosition = that.gameIdList.length - 1;

            __w_clear();
            __w_arr(that.gameIdList, that.currentPosition);
        }
    }

    this.hasNext = function () {
        return that.currentPosition != null && that.currentPosition < that.gameIdList.length - 1;
    }

    this.next = function () {
        that.currentPosition++;

        __w_clear();
        __w_arr(that.gameIdList, that.currentPosition);

        return that.gameIdList[that.currentPosition];
    }

    this.hasPrevious = function () {
        return that.currentPosition && that.currentPosition > 0;
    }

    this.previous = function () {
        that.currentPosition--;

        __w_clear();
        __w_arr(that.gameIdList, that.currentPosition);

        return that.gameIdList[that.currentPosition];
    }

    that.resetNewGameLister();
}
