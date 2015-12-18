var GTW_GAMEINFO = "/gw/shared/loadGameInfo.php";
var GTW_SAVE_COMMENT = "/gw/shared/saveComment.php";

function GameInfoRenderer(_gc, _ui, _options) {
    var that = this;

    var gc, ui, cs;

    var CONTENTS_ID = "#gameInfoContents";

    var options = {
        bindCPButton : false,
        showBestAttemptRating : false,
        showLabels : false,
        gameIdLabel : "hand"
    };

    var doAutoSaveComment, showRegMePanelForGuests;

    var giGameId = -1;

    var i18n = new I18n();
    i18n.setContext('gameInfo');

    this.run = function (gameId, showCommentFavArea) {
        var showCommentFavArea = ifDef(showCommentFavArea, true);

        if (!$("#gameInfoPanel").is(":visible") && gc.isGameLoaded()) {
            cs = gc.getClientServer();
            doAutoSaveComment = true;
            showRegMePanelForGuests = false;
            giGameId = gameId;
            $("#giEditable").hide();
            if (showCommentFavArea) {
                $("#giCommentFavArea").show();
            } else {
                $("#giCommentFavArea").hide();
            }
            ui.setLoading("#gameInfoContents");
            this.loadAndRender(gameId);
            if (options.showSolution) {
                $("#showSolution").show();
            } else {
                $("#showSolution").hide();
            }
            ui.showPanel({
                id : "gameInfoPanel",
                type : BOTTOM_PANEL,
                onClose : function () {
                    that.onClose();
                }
            });
        } else {
            ui.hidePanel("gameInfoPanel");
        }
    }

    this.loadAndRender = function (gameId, showPlayersResults) {
        cs.sendRequest(GTW_GAMEINFO, {
            gameId : gameId,
            showPlayersResults:showPlayersResults||0
        }, function (result, data, error) {
            if (result) {
                that.render(data);
                $("html, body").animate({
                    scrollTop : $("#gameInfoContents").offset().top - 1 * iDiv($("#gameArea").width(), 5)
                }, "normal");
            } else {
                that.ui.renderErrorReason(CONTENTS_ID, error.reason);
            }
        });
    }

    this.render = function (data) {
        var gameId = data.gameId;
        var totalPlayed = data.totalPlayed;
        var totalWon = data.totalWon;
        var averageWinTime = data.averageWinTime;
        var top = data.bestAttemptTop||[];
        var comment = data.comment;
        var fav = data.fav;
        var playerList = data.playerList||[];

        var tableContents = "<table class='gameInfoContentsTable standartTable' width='100%' border='0' vspace='0' cellspacing='0' hspace='0'>"
            + "<tr>"
            + "<th width='33%'>" + i18n.get("byWinTimeLabel") + "</th>"
            + (that.options.showBestAttemptRating ? "<th width='33%'>" + i18n.get("byBestAttemptTimeLabel") + "</th>" : "")
            + "<th width='34%'>" + i18n.get("unsolvedListLabel") + "</th>"
            + "</tr>";

        var bestAttemptTop = "";

        if (top.length > 0) {
            bestAttemptTop = "<table class='noBordersTable' style='padding-left: 5px; padding-right: 5px; margin-bottom: 0; width: 100%'>";
            for (var i = 0; i < top.length; i++) {
                var highlightStyle = "";
                if (top[i].username == cs.getUsername()) {
                    highlightStyle = " font-weight: bold;";
                }
                bestAttemptTop += "<tr style='font-size:10pt !important; height: 25px;" + highlightStyle + "'>" +
                    "<td>" + (i + 1) + "." + "</td>" +
                    "<td>" + i18n.transliterate(top[i].username.replace(/\s+/g, "&nbsp;")) + "</td>" +
                    "<td>" + "/" + "</td>" +
                    "<td class='gameTime'>" + formatGameTimeMS(top[i].minElapsed) + "</td>" +
                    "</tr>";
            }
            bestAttemptTop += "</table>";
        }

        var wonPlayerList = "<table class='noBordersTable' style='padding-left: 5px; padding-right: 5px; margin-bottom: 0; width: 100%'>";
        var unsolvedPlayerList = "<table class='noBordersTable' style='padding-left: 5px; padding-right: 5px; margin-bottom: 0; width: 100%'>";

        var totalWon = 0;
        var wtRank = 1;

        var unsolvedPlayerCount = 0;
        for (var i = 0; i < playerList.length; i++) {
            var highlightStyle = "";

            var isGuest = playerList[i].username.indexOf("Гость") != -1;

            if (playerList[i].username == cs.getUsername()) {
                highlightStyle = " font-weight: bold;";
            }
            if (playerList[i].winTime > 0) {
                if (!isGuest) {
                    var strRank = wtRank + ".";
                    wtRank++;
                } else {
                    strRank = "";
                    highlightStyle += " color: #777";
                }

                wonPlayerList += "<tr style='font-size:10pt !important; height: 25px;" + highlightStyle + "'>" +
                    "<td>" + strRank + "</td>" +
                    "<td>" + i18n.transliterate(playerList[i].username.replace(/\s+/g, "&nbsp;")) + "</td>" +
                    "<td>" + "/" + "</td>" +
                    "<td class='gameTime'>" + formatGameTimeMS(playerList[i].winTime) + "</td>" +
                    "</tr>";

                totalWon++;
            } else {
                unsolvedPlayerList += "<tr style='font-size:10pt !important; height: 25px;" + highlightStyle + "'>"
                    + "<td>" + (unsolvedPlayerCount + 1) + "." + "</td>"
                    + "<td>" + i18n.transliterate(playerList[i].username.replace(/\s+/g, "&nbsp;")) + "</td>"
                    + (cs.isSuperUser()
                    ?
                    ("<td class='faded'>" + "/" + "</td>"
                        + "<td class='faded gameTime'>" + formatGameTimeMS(playerList[i].totalGameTime) + "</td>")
                    :
                    ""
                    )
                    + "</tr>";

                unsolvedPlayerCount++;
            }
        }
        wonPlayerList += "</table>";
        unsolvedPlayerList += "</table>";

        if (totalWon == 0) {
            wonPlayerList = "<p class='giNoResult'>—</p>";
            bestAttemptTop = "<p class='giNoResult'>—</p>";
        }

        if (unsolvedPlayerCount == 0) {
            unsolvedPlayerList = "<p class='giNoResult'>—</p>";
        }

        tableContents += "<tr>"
            + "<td"+((data.showPlayersResults==0 && data.totalPlayed>5)?' style="border-bottom:none;" ':'')+">"
            + "<div class='giResults'>"
            + wonPlayerList
            + ((data.showPlayersResults==0 && data.totalPlayed>5&&totalWon>4)?"<div style='text-align: center;'>...</div>":"")
            + "</div>"
            + "</td>"
            + (that.options.showBestAttemptRating ? "<td"+((data.showPlayersResults==0 && data.totalPlayed>5)?' style="border-bottom:none;" ':'')+">"
            + "<div class='giResults'>"
            + bestAttemptTop
            + ((data.showPlayersResults==0 && data.totalPlayed>5&&totalWon>4)?"<div style='text-align: center;'>...</div>":"")
            + "</div>"
            + "</td>" : "")
            + "<td"+((data.showPlayersResults==0 && data.totalPlayed>5)?' style="border-bottom:none;" ':'')+">"
            + "<div class='giResults'>"
            + unsolvedPlayerList
            + ((data.showPlayersResults==0 && data.totalPlayed>5&&unsolvedPlayerCount>4)?"<div style='text-align: center;'>...</div>":"")
            + "</div>"
            + "</td>"
            + "</tr>";
        if (data.showPlayersResults==0 && data.totalPlayed>5){
            tableContents +="<tr><td style='border:none;'><br><br></td>"
                + (that.options.showBestAttemptRating ? "<td style='border:none;'><br></td>" : "")
                + "<td style='border-bottom-style:none; border-left-style: none;'><br></td>"
                + "</tr>";

            tableContents += "</table>";
            tableContents += '<div style="margin: 0 auto; width: 180px; float: none !important; margin-top: -26px;" class="constantWidthBtn" id="giShowPlayersResults">'+i18n.get("allResults")+'</div>';
        } else
        tableContents += "</table>";

        totalWon = data.totalWon;

        // жёсткий хак, потом нужно отрефакторить, если будет актуально в других играх
        if (that.gc.getClientServer().getGameVariationId() == 10) {
            _kosynka_hack = " (по одной карте)"
        } else if (that.gc.getClientServer().getGameVariationId() == 1) {
            _kosynka_hack = " (по три карты)"
        } else {
            var _kosynka_hack = "";
        }

        var gameStatusParagraph =
            "<p style='margin-top:5px; margin-left:5px; font-size:8pt;'>"
                + i18n.get("gameIdLabel", that.options.gameIdLabel) + gameId //  + " (" + "<span id='giShowSolution' class='actionText'>показать решение</span>" + ")"
                + (that.options.showLabels ? " / " + data.label : "") + _kosynka_hack
//                + "&nbsp;&nbsp;&nbsp;рейтинг расклада: " + (averageWinTime == 0 ? "—" : formatGameTimeMS(averageWinTime))
//                + "&nbsp;&nbsp;&nbsp;выиграло: " + totalWon
//                + "&nbsp;&nbsp;&nbsp;играло: " + totalPlayed
            + "</p>";

        $("#gameStatusContents").empty().append(gameStatusParagraph);

        $("#gameInfoContents").empty().append("<h4 style='text-align: center; padding-bottom: 5px; padding-top: 20px;'>" + i18n.get("playerResultsHeader")
            + "</h4>");

        $("#gameInfoContents").append(
            "<p style='padding-left: 5px; font-size:8pt;'>" + i18n.get("gameRatingLabel") + ": " + (averageWinTime == 0 ? "—" : formatGameTimeMS(averageWinTime))
                + "&nbsp;&nbsp;&nbsp;" + i18n.get("wonCountLabel") + ": " + totalWon
                + "&nbsp;&nbsp;&nbsp;" + i18n.get("playedCountLabel") + ": " + totalPlayed
                + "</p>"
            + (data.userName?"<p style='padding-left: 5px; font-size:8pt;'>"+ i18n.get("bestAttempt") + formatGameTimeMS(data.bestWinTime)+" ("+data.userName+") ":"")
            + (data.userWinTime>0?"<p style='padding-left: 5px; font-size:8pt;'>"+ i18n.get("YourAttempt") + formatGameTimeMS(data.userWinTime):"")
        );

        if (playerList.length>0) $("#gameInfoContents").append(tableContents);

        if (cs.isLogged()) {
            if (comment != "") {
                $("#giComment").val("").val(comment);
                $("#giComment").removeClass("greyComment");
            } else {
                $("#giComment").val("").val(i18n.get("commentLabel"));
                $("#giComment").addClass("greyComment");
                $("#giComment").focus(function () {
                    if ($(this).hasClass("greyComment")) {
                        $(this).removeClass("greyComment");
                        this.value = "";
                        return false;
                    }
                });
            }

            $("#giComment").blur(function () {
                if (this.value == "") {
                    $("#giComment").val("").val(i18n.get("commentLabel"));
                    $("#giComment").addClass("greyComment");
                    return false;
                }
            });

            if (fav) {
                $("#giFav").attr("checked", true);
            }
            else {
                $("#giFav").attr("checked", false);
            }
        } else {
            $("#giComment").val("").val(i18n.get("onlyForSignedUsersAlert"));
            $("#giComment").addClass("greyComment");
            $("#giComment").attr("disabled", true);
            $("#giFav").attr("disabled", true);
        }

        $('#giShowPlayersResults').click(function(){that.loadAndRender(gameId, 1)});

        $("#giEditable").show();
    }

    this.saveComment = function () {
//        alert("SAVE COMM!");

//        var newComment = $("#giComment").val();
//        var newFav = $("#giFav").is(":checked") ? 1 : 0;
//
//        if ($("#giComment").hasClass("greyComment")) {
//            newComment = "";
//        }

        if (cs.isLogged()) {
            var comment = $("#giComment").val();
            var bFav = $("#giFav").is(":checked");
//            comment = comment.replace(/\|/g, " ");

            if ($("#giComment").hasClass("greyComment")) {
                comment = "";
            }

            var iFav = bool2Int(bFav);

            cs.sendRequest(GTW_SAVE_COMMENT, {
                gameId : giGameId,
                comment : comment,
                fav : iFav
            }, function (result) {
                if (!result) {
                    ; // TODO: notify user
                }
            });

//            cs.saveComment(giGameId, comment, iFav, function (result) {
//                if (!result) {
//                    ; // TODO: notify user
//                }
//            });
        } else {
            if (showRegMePanelForGuests) {
                doAutoSaveComment = false;
                ui.showRegPanel();
            }
        }
    }

    this.onClose = function () {
        if (doAutoSaveComment) {
            that.saveComment();
        }
    }

    this.bindAll = function () {
        $("#giCommit, #giCancel").click(function () {
            var commitHit = $(this).attr("id") == "giCommit";
            var cancelHit = $(this).attr("id") == "giCancel";
            if (commitHit) {
                showRegMePanelForGuests = true;
            }
            if (cancelHit) {
                doAutoSaveComment = false;
            }
            ui.hidePanel("gameInfoPanel");
        });

        ui.bindCloseIcon("#giCloseIcon", "gameInfoPanel");

        if (isDef(that.options.bindCPButton) && that.options.bindCPButton) {
            $("#bbGameInfo").click(function () {
                that.run(gc.getGameManager().getGameId());
            });
        }
    }

    gc = _gc;
    ui = _ui;

    that.gc = gc;
    that.ui = ui;

    if (isDef(_options) && _options != null) {
        mergeObj(options, _options);
    }

    that.options = options;

    this.bindAll();
}