function AttemptLocalStorage(cs) {
    var that = this;

    var multiAttemptData;

    this.load = function () {
        multiAttemptData = store.get("attemptDelayed_gVId" + that.cs.getGameVariationId() + "_uId" + that.cs.getUserId());

        if (!isDef(multiAttemptData) || !multiAttemptData) {
            multiAttemptData = [];
        }
    }

    this.save = function () {
        store.set("attemptDelayed_gVId" + that.cs.getGameVariationId() + "_uId" + that.cs.getUserId(),
            multiAttemptData);

        //_w("SAVE! " + $.toJSON(multiAttemptData), _DEV_LOCALSTORAGE);
    }

    this.compareAttemptData = function (attemptDataA, attemptDataB) {
        return attemptDataA.gameId == attemptDataB.gameId && attemptDataA.hash == attemptDataB.hash ||
            attemptDataA.gameId == attemptDataB.gameId && attemptDataA.history == attemptDataB.history ||
            attemptDataA.gameId == attemptDataB.gameId && attemptDataA.attemptId == attemptDataB.attemptId;
    }

    this.sync = function (attempt) {
        if (!attempt.isFresh() && !(attempt.isWon() && attempt.attemptId == -1)) {
            that.load();

            var found = false;

            for (var i in multiAttemptData) {
                var attemptData = multiAttemptData[i];

                if (that.compareAttemptData(attemptData, attempt.getFreshData())) {
                    multiAttemptData[i] = attempt.getFreshData();
                    found = true;
                }
            }

            if (!found) {
                multiAttemptData.push(attempt.getFreshData());
            }

            that.save();
        }
    }

    this.remove = function (attemptData) {
        that.load();

        var newMultiAttemptData = [];

        for (var i in multiAttemptData) {
            var storedAttemptData = multiAttemptData[i];

            if (!that.compareAttemptData(attemptData, storedAttemptData)) {
                newMultiAttemptData.push(storedAttemptData);
            }
        }

        multiAttemptData = newMultiAttemptData;

        that.save();
    }

    this.reuploadAttempts = function () {
        that.load();

        for (var i in multiAttemptData) {
            var storedAttemptData = multiAttemptData[i];

            if (isDef(storedAttemptData)) {
                that.cs.reuploadAttempt(storedAttemptData.gameId, null, storedAttemptData, {
                    async : false
                });
            }
        }
    }

    that.cs = cs;
}
