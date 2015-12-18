function BonusRenderer(_gc, _ui, _options) {
    var that = this;

    var gc, ui, cs;

    var options = null;

    var i18n = new I18n();
    i18n.setContext('bonus');

    this.render = function (bonus) {
        if ($("#winBox").is(":visible")) {
            $("#bonusNotice").empty();
            if (bonus.winBonus == "fastest") {
                $("#bonusNotice").append("<p>" + i18n.get("fastestBonus") + "</p>");
            } else if (bonus.winBonus == "first") {
                $("#bonusNotice").append("<p>" + i18n.get("firstBonus") + "</p>");
            }

            if (bonus.winBonus != "") {
                var deltaStr;

                if (bonus.winBonus != "first" && bonus.oldGameInfo.avgWinTime > 0) {
                    if (bonus.newUserRanks.winTime < bonus.oldGameInfo.avgWinTime) {
                        deltaStr = "<br/>(" + i18n.get("lessThanAveragePrefix") + " "
                            + formatGameTimeMS(bonus.oldGameInfo.avgWinTime - bonus.newUserRanks.winTime) + ")";
                    } else {
                        deltaStr = "<br/>(" + i18n.get("greaterThanAveragePrefix") + " "
                            + formatGameTimeMS(bonus.newUserRanks.winTime - bonus.oldGameInfo.avgWinTime) + ")";
                    }
                } else {
                    deltaStr = "";
                }

                $("#bonusNotice").append("<p>" + i18n.get("winTimeRankLabel") + ": "
                    + (bonus.newUserRanks.wtRank != 0?bonus.newUserRanks.wtRank+ " / ":"")
                    + formatGameTimeMS(bonus.newUserRanks.winTime)
                    + deltaStr + "</p>");
            }

            if (bonus.winBonus != "first" && bonus.attemptBonus == "best_attempt") {
                $("#bonusNotice").append("<p style='margin-top: 15px;'>"
                    + i18n.get("bestAttemptBonus")
                    + "</p>");
            }

            if (bonus.winBonus != "first" && bonus.attemptBonus == "better_attempt") {
                $("#bonusNotice").append("<p style='margin-top: 15px;'>"
                    + i18n.get("betterAttemptBonus")
                    + "</p>");
            }

            if (bonus.newUserRanks.baRank != 0 && bonus.attemptBonus != "") {
                $("#bonusNotice").append("<p>" + i18n.get("bestAttemptRankLabel") + ": " + bonus.newUserRanks.baRank
                    + " / " + formatGameTimeMS(bonus.newUserRanks.bestAttemptTime) + "</p>");
            }

            if (bonus.winBonus == "" && bonus.attemptBonus != "") {
                if (bonus.oldBestAttemptRank <= bonus.newUserRanks.baRank) {
                    $("#bonusNotice").append("<p>"
                        + i18n.get("bestAttemptRankNoChangeNotice")
                        + "</p>");
                } else {
                    var prepositionRU = i18n.get("rangeFromPrepositionAlpha");
                    if (bonus.oldBestAttemptRank == 2) {
                        prepositionRU = i18n.get("rangeFromPrepositionBeta");
                    }
                    $("#bonusNotice").append(
                        i18n.format(
                            "bestAttemptRankChangeNotice",
                            bonus.oldBestAttemptRank,
                            bonus.newUserRanks.baRank,
                            prepositionRU
                        )
                    );
                }
            }

            if (bonus.newRankBySolvedCount < bonus.oldRankBySolvedCount) {
                var prepositionRU = i18n.get("rangeFromPrepositionAlpha");

                if (bonus.oldRankBySolvedCount == 2) {
                    prepositionRU = i18n.get("rangeFromPrepositionBeta");
                }

                $("#bonusNotice").append(
                    i18n.format(
                        "ratingRankChangeNotice",
                        bonus.oldRankBySolvedCount,
                        bonus.newRankBySolvedCount,
                        prepositionRU
                    )
                );
            }

            var bonusNoticeHeight = $("#bonusNotice").height();

            var margin = iDiv(345 - $("#bonusNotice").height() - $("#winBox").height(), 3);

            var winBoxDeltaMargin = typeof(WINBOX_DELTA_MARGIN) != "undefined" ? WINBOX_DELTA_MARGIN : 0;

            $("#winBox").animate({"top" : 125 + margin + winBoxDeltaMargin}, function () {
                $("#bonusNotice").css("top", 125 + margin + $("#winBox").height() + margin + winBoxDeltaMargin);
                $("#bonusNotice").fadeIn("fast");
            });

//            alert(123);
        }
    }

    this.bindAll = function () {
        ;
    }

    gc = _gc;
    ui = _ui;
    options = _options;

    this.bindAll();
}