var GWT_GAMELIST = "/gw/shared/loadGameList.php";
var GWT_PLAYERLIST = "/gw/shared/loadPlayerList.php";

var GL_SORT_BY_GAME_ID = 0;
var GL_SORT_BY_GAME_RATING = 1;
var GL_SORT_BY_TOTAL_WON = 2;
var GL_SORT_BY_TOTAL_PLAYED = 3;
var GL_SORT_BY_PLAYER_RATING = 4;
var GL_SORT_BY_TOTAL_GAME_RATING = 5;
var GL_SORT_BY_DIFFICULT = 6;

var GL_ALL = 0;
var GL_WON_ONLY = 1;
var GL_PLAYED_ONLY = 2;

var GL_DEFAULT_LOAD_COUNT = 250;

var DESC = false;
var ASC = true;

function GameListRenderer(_gc, _ui, _options) {
    var that = this;

    var gc, ui, cs;

    var CONTENTS_ID = "#gameListContents";

    var options = {
        bindCPButton : false,
        showLabels : false,
        moreLabel : "hands",
        defaultSortBy : GL_SORT_BY_GAME_ID,
        defaultOrder : ASC,
        canFilter : false,
        filterLabel : "",
        noFilterLabel : "",
        showDifficult : false
    };

    var glRecentRequestedGame = -1;

    var sortBy; // = GL_SORT_BY_GAME_RATING;
    var order; // = DESC;
    var count = GL_DEFAULT_LOAD_COUNT;

    that.activeSegmentFilter = 0;

    var i18n = new I18n();
    i18n.setContext('gameList');

    this.run = function () {
        if (!$("#gameListPanel").is(":visible")) {
            cs = gc.getClientServer();
            ui.setLoading("#gameListContents");
            that.loader = new Loader(0, GL_DEFAULT_LOAD_COUNT);
            that.loader.addListener(that);
            this.loadAndRender(false);
            $("#glAuxPanel").hide();
            $("#glFilterSection").empty();
            ui.showPanel({
                id : "gameListPanel",
                type : BOTTOM_PANEL
            });
        } else {
            ui.hidePanel("gameListPanel");
        }
    }

    this.countChanged = function () {
        that.loadAndRender(true, false);
    }

    this.loadAndRender = function (repeatLoad, resetLoader) {
        // TODO, REWORK, HACK
        resetLoader = ifDef(resetLoader, true);

        if (resetLoader) { // TODO, HACK, REWORK
            that.loader.reset();
        }

        if (repeatLoad) {
            $("#glLoadingImg").show();
        }
        cs.sendRequest(GWT_GAMELIST, {
            sortBy : sortBy,
            order : boolToInt(order),
            count : that.loader.count,
            filter : that.activeSegmentFilter
        }, function (result, data, error) {
            $("#glLoadingImg").hide();
            if (result) {
                that.render(data);
                if (!repeatLoad) {
                    $("html, body").animate({
                        scrollTop : $("#gameListContents").offset().top - 1 * iDiv($("#gameArea").width(), 5)
                    }, "normal");
                }
            } else {
                that.ui.renderErrorReason(CONTENTS_ID, error.reason);
            }
        });
    }

    this.bindHeaderAction = function (jId, columnSortBy, columnDefaultOrder) {
        $(jId).click(function () {
            if (sortBy != columnSortBy) {
                sortBy = columnSortBy;
                order = columnDefaultOrder;
            } else {
                order = !order;
            }
            count = GL_DEFAULT_LOAD_COUNT;
            that.loadAndRender(true);
        });
    }

    this.renderFilter = function (filterData) {
        $("#glFilterSection").empty();

        var options = "<option value='nofilter'>" + that.options.noFilterLabel + "</option>";

        for (var i in filterData) {
            var filter = filterData[i];

            options += "<option value='" + filter.val + "'>" + filter.text + "</option>";
        }

        $("#glFilterSection").append("<table style='margin-bottom: 5px;'>"
            + "<tr>"
            + "<td>"
            + "<span style='color: #777;'>" + that.options.filterLabel + ": </span>"
            + "</td>"
            + "<td>&nbsp;&nbsp;</td>"
            + "<td>"
            + "<select style='width: 220px' id='glFilter'>"
            + options
            + "</select>"
            + "</td>"
            + "</tr>"
            + "</table>");

        if (that.activeSegmentFilter) {
            $("#glFilter").val(that.activeSegmentFilter);
        }

        $("#glFilter").change(function (e) {
            that.onFilterChange();
        });

        $("#glFilter").chosen({
            disable_search : true
        });
    }

    this.onFilterChange = function () {
        var value = $("#glFilter option:selected").val();

        if (value == "nofilter") {
            that.activeSegmentFilter = 0;
        } else {
            that.activeSegmentFilter = value;
        }
        that.loadAndRender(true);
    }

    this.render = function (data) {
        var gameList = data.gameList;
        var total = data.total;

        if (that.options.canFilter) {
            var filterData = data.filterData;
            that.renderFilter(filterData);
        }

        that.loader.setTotal(data.total);

        ui.hideHint();

        var width = 20;

//        if (cs.isSuperUser()) {
//            width = iDiv(100, 6);
//        }

        // generate and append table contents
        var tableContents = "<table id='gameListTable' class='standartTable' style='clear:both; border-collapse: collapse;' " +
            " width=\"100%\" border=\"0\" vspace=\"0\" cellspacing=\"0\" hspace=\"0\"><tr>"
            + "<th colspan='" + (that.options.showLabels ? 3 : 2) + "' width='" + width + "%' "+(sortBy == GL_SORT_BY_GAME_ID ?" style='background-color: rgb(255, 255, 224);'":"")+">"
            + "<span" + (sortBy == GL_SORT_BY_GAME_ID ? " class='actionText4 activeSortHeader'" : " class='actionText4'")
            + " id='glSortByGameId'><div class='glHeader'>" + i18n.get("gameIdLabel") + "</div>"
            + (sortBy == GL_SORT_BY_GAME_ID ? ui.serverSortArrowsImg(order) + ui.getOrderHint(order) : " &nbsp;<img src='/img/icons/sort-both.png' alt=''/>")
            + "</span></th>"

            + "<th width='" + width + "%' "+(sortBy == GL_SORT_BY_GAME_RATING ?" style='background-color: rgb(255, 255, 224);'":"")+"><span"
            + (sortBy == GL_SORT_BY_GAME_RATING ? " class='actionText4 activeSortHeader'" : " class='actionText4'")
            + " id='glSortByGameRating'><div class='glHeader'>" + i18n.get("gameRatingLabel") + "</div><div class='glHeaderDescr'>" + i18n.get("gameRatingDescription") + "</div>"
            + (sortBy == GL_SORT_BY_GAME_RATING ? ui.serverSortArrowsImg(order) + ui.getOrderHint(order) : " &nbsp;<img src='/img/icons/sort-both.png' alt=''/>")
            + "</span></th>"

            +(options.showDifficult?"<th width='" + width + "%' "+(sortBy == GL_SORT_BY_DIFFICULT ?" style='background-color: rgb(255, 255, 224);'":"")+"><span"
            + (sortBy == GL_SORT_BY_DIFFICULT ? " class='actionText4 activeSortHeader'" : " class='actionText4'")
            + " id='glSortByDifficult'><div class='glHeader' title='Количество начальных цифр'>" + "Цифр" + "</div><div class='glHeaderDescr'>" + "" + "</div>"
            + (sortBy == GL_SORT_BY_DIFFICULT ? ui.serverSortArrowsImg(order) + ui.getOrderHint(order) : " &nbsp;<img src='/img/icons/sort-both.png' alt=''/>")
            + "</span></th>"
            :"")

            + "<th colspan='4' width='" + width + "%'"+(sortBy == GL_SORT_BY_PLAYER_RATING ?" style='background-color: rgb(255, 255, 224);'":"")+"><span"
            + (sortBy == GL_SORT_BY_PLAYER_RATING ? " class='actionText4 activeSortHeader'" : " class='actionText4'")
            + " id='glSortByPlayerRating'><div class='glHeader'>" + i18n.get("winTimeAndRankLabel") + "</div><div class='glHeaderDescr'>" + i18n.get("winTimeAndRankDescription") + "</div>"
            + (sortBy == GL_SORT_BY_PLAYER_RATING ? ui.serverSortArrowsImg(order) + ui.getOrderHint(order) : " &nbsp;<img src='/img/icons/sort-both.png' alt=''/>")
            + "</span></th>"

            + "<th width='" + width + "%' "+(sortBy == GL_SORT_BY_TOTAL_WON ?" style='background-color: rgb(255, 255, 224);'":"")+"><span"
            + (sortBy == GL_SORT_BY_TOTAL_WON ? " class='actionText4 activeSortHeader'" : " class='actionText4'")
            + " id='glSortByGameTotalWon'><div class='glHeader'>" + i18n.get("solvedLabel") + "</div>"
            + (sortBy == GL_SORT_BY_TOTAL_WON ? ui.serverSortArrowsImg(order) + ui.getOrderHint(order) : " &nbsp;<img src='/img/icons/sort-both.png' alt=''/>")
            + "</span></th>"

            + "<th width='" + width + "%' "+(sortBy == GL_SORT_BY_TOTAL_PLAYED ?" style='background-color: rgb(255, 255, 224);'":"")+"><span"
            + (sortBy == GL_SORT_BY_TOTAL_PLAYED ? " class='actionText4 activeSortHeader'" : " class='actionText4'")
            + " id='glSortByGameTotalPlayed'><div class='glHeader'>" + i18n.get("playedLabel") + "</div>"
            + (sortBy == GL_SORT_BY_TOTAL_PLAYED ? ui.serverSortArrowsImg(order) + ui.getOrderHint(order) : " &nbsp;<img src='/img/icons/sort-both.png' alt=''/>")
            + "</span></th>"
            + "</tr>";

        if (gameList.length > 15) {
            $("#glAuxPanel").show();
        } else {
            $("#glAuxPanel").hide();
        }

        var tableInternals = "";

        var infinityParagraph = "<img src='/img/icons/infinity.png' alt='" + i18n.get("noRatingAltText") + "'/>"

        for (var i = 0; i < gameList.length; i++) { // gameList.length
            var game = gameList[i];

            var playerWinTime = game.playerWinTime;
            var playerTotalGameTime = game.playerTotalGameTime;

            var gameRatingParagraph;

            if (game.gameRating == 0) {
                gameRatingParagraph = infinityParagraph;
            } else {
                gameRatingParagraph = "<p>"
                    + formatGameTimeMS(game.gameRating)
                    + "</p>";
            }

            var playerWinTimeParagraph;

            if (playerWinTime > 0) {
                playerWinTimeParagraph = "<p>" + formatGameTimeMS(playerWinTime) + "</p>";
            } else {
                playerWinTimeParagraph = "—";
            }

            var playerWinTimeAlignment = "";

            var playerWinTimeBlock;

            if (playerWinTime > 0) {
                var formattedGameTime = formatGameTimeMS(playerWinTime);
            } else {
                formattedGameTime = "<span class='pdTotalGameTime'>"
                    + formatGameTimeMS(playerTotalGameTime)
                    + "</span>";
            }

            if (playerTotalGameTime > 0) {
                if (cs.isLogged()) {
                    playerWinTimeBlock = "<td class='noRightBorder' style='text-align: right;'>"
                        + "<p>" + formattedGameTime + "</p>"
                        + "</td>" + (playerWinTime > 0 ?
                        "<td class='noRightBorder' >/</td>"
                            + "<td class='noRightBorder' >" + game.playerWinTimeRank + "</td>"
                            + "<td>&nbsp;</td>" : "<td colspan='3'>&nbsp;</td>");
                } else {
                    playerWinTimeBlock = "<td class='noRightBorder' style='text-align: right;'>"
                        + "<p>" + formattedGameTime + "</p>"
                        + "</td>"
                        + "<td colspan='3'>&nbsp;</td>";
                }
            } else {
                playerWinTimeBlock = "<td class='noRightBorder' style='text-align: right;'>—</td>"
                    + "<td colspan='3'>&nbsp;</td>";
            }

//            var totalGameRatingParagraph = 0;

//            if (cs.isSuperUser()) {
//                if (game.totalGameRating == 0) {
//                    totalGameRatingParagraph = infinityParagraph;
//                } else {
//                    totalGameRatingParagraph = "<p>" + formatGameTimeMS(game.totalGameRating) + "</p>";
//                }
//            }

//        <p style='display: inline' id='glPlay" + game.gameId + "' class='actionText'>" + game.gameId
//        + "</p>"

            var gameIdParagraph = "<p style='display: inline; "
                + (game.gameId > gc.getHigherGameIdBound() ? "color: #C42E21 !important;" : "")
                + "' id='glPlay" + game.gameId + "' class='actionText'>"
                + game.gameId
                + "</p>";

            if (that.options.showLabels) {
                var labelParagraph = "<p style='display: inline; color: #777;'>" + game.label + "&nbsp;</p>";
            }

            var padding = 6;

            if (cs.isSuperUser()) {
                padding = 4;
            }

            var tableData = "<td class='noRightBorder noLeftRightPadding' style='white-space: nowrap;'>" + (game.fav == 1 ? " &nbsp;<img src='/img/icons/fav-2.png' alt=''/>" : "") + "</td>"
                + "<td id='glGameIdTd" + game.gameId + "' "
                + (that.options.showLabels ? "class='noRightBorder'" : "")
                + " style='text-align: right; white-space: nowrap; cursor: pointer; "
                + (that.options.showLabels ? "" : "padding-right: " + padding + "%;")
                + "'>"
                + gameIdParagraph
                + "</td>"
                + (that.options.showLabels ?
                "<td id='glLabelTd" + game.gameId + "' style='cursor: pointer; white-space: nowrap;'>" + labelParagraph + "</td>"
                : "")
                + "<td style='text-align: right; padding-right: " + padding + "%;'>" + gameRatingParagraph + "</td>"
                +(options.showDifficult?"<td style='text-align: center;'>"+game.difficult+"</td>":"")
                + playerWinTimeBlock
                + "<td style='text-align: center;'><p id='glShowGameDetail" + game.gameId + "'" + (game.totalWon > 0 ? " class='activeText'" : "") + ">"
                + game.totalWon
                + "</p>" + "<div class='glGameDetailContent' id='glGameDetailContent" + game.gameId + "'></div>" + "</td>"
                + "<td style='text-align: center;'><p id='glShowGameDetail" + game.gameId + "_2'" + (game.totalPlayed > 0 ? " class='activeText'" : "") + ">" + game.totalPlayed
                + "</p>" + "<div class='glGameDetailContent' id='glGameDetailContent" + game.gameId + "_2'></div>" + "</td>";

            var rowColor = "white";

            if (game.status == 0) {
                rowColor = PLAYED_GAME_COLOR;
            } else if (game.status == WIN_STATUS) {
                rowColor = WON_GAME_COLOR;
            }

//        if (game.status != -1) {
//            t++;
//        }

            tableInternals += "<tr class='glRow' id='glRow" + game.gameId + "' style='background-color: " + rowColor + ";'>"
                + tableData
                + "</tr>";
        }

//    alert(t);

        tableContents += tableInternals + "</table>";

        $("#gameListContents").empty();

        $("#gameListContents").append(tableContents);

//        if (count > 0 && count < total) {
//            $("#gameListContents").append("<table border='1' style='margin-top: 10px;' width='100%' class='noBordersTable' id='glShowPanel'>"
//                + "<tr>"
//                + "<td width='50%'>"
//                + "<p class='glShowMore' id='glShowMore'>" + i18n.get("paginatorMorePrefix") + " " + Math.min(GL_DEFAULT_LOAD_COUNT, total - count) + " " + i18n.get("paginatorMoreSuffix", that.options.moreLabel) + "</p>"
//                + "</td>"
//                + "<td width='50%'>"
//                + "<p class='glShowAll' id='glShowAll'>" + i18n.get("paginatorShowAll") + "</p>"
//                + "</td>"
//                + "</tr>"
//                + "<tr>"
//                + "<td colspan='2' class='glPaginationStats' style='text-align: center !important;'>" + count + " " + i18n.get("paginatorOf") + " " + total + "</td>"
//                + "</tr>"
//                + "</table>");
//        }

        var loaderRenderer = new LoaderRenderer(that.loader, that.options.moreLabel); // , "userHistory"

        $("#gameListContents").append(loaderRenderer.render());

        loaderRenderer.bindEvents();

        for (var i = 0; i < gameList.length; i++) {
            var _gameId = gameList[i].gameId;

//            alert("#glGameIdTd" + _gameId
//                + that.options.showLabels
//                ? (", #glLabelTd" + _gameId)
//                : "");

            $("#glGameIdTd" + _gameId
                + (that.options.showLabels ? ", #glLabelTd" + _gameId : "")
            ).click(function (_gameId) {
                return function () {
//                    requestNewGameByGameId(_gameId, function () {
//                        glRecentRequestedGame = _gameId;
//                        $("html, body").animate({ scrollTop : 0 }, "fast");
//                        showAndFillGameInfoPanel(_gameId, true, {
//                            gameId : _gameId,
//                            onClose : function (prevState) {
//                                $(".glRow").css("font-weight", "normal");
//                                $("#glRow" + prevState.gameId).css("font-weight", "bold");
//                                showPanel("#gameListPanel");
//                                $("html, body").animate({ scrollTop : $("#glRow" + prevState.gameId).offset().top - iDiv($(window).height(), 2)});
//                            }
//                        });
//                    });
                    gc.requestGame(_gameId, null, function () {
                        glRecentRequestedGame = _gameId;
//                        $("html, body").animate({ scrollTop : 0 }, "fast");
                        //ui.showGameInfo(_gameId, false);
                        ui.hidePanel('gameListPanel');
                    })
                };
            }(_gameId));

            if (gameList[i].totalWon > 0) {
                $("#glShowGameDetail" + _gameId).click(function (_gameId) {
                    return function () {
                        if (!$("#glGameDetailContent" + _gameId).is(":visible")) {
                            $(".glActiveGameDetailContent").hide();
                            $("#glGameDetailContent" + _gameId).empty().append("<div style=\"padding-top: 20px; padding-left:20px; height:35px;\">" +
                                "<span style=\"float: left; color:black;\">" + i18n.get("loadingAlert") + "&nbsp;" +
                                "</span><img style=\"float: left; margin-top: -10px;\" src=\"/img/icons/loading_transparent.gif\"></div>");
                            $("#glGameDetailContent" + _gameId).show();
                            cs.sendRequest(GWT_PLAYERLIST, {
                                gameId : _gameId
                            }, function (result, data) {
                                if (result) {
                                    var playerList = data.playerList;
                                    var playerListContents = "<table class='noBordersTable' style='padding-bottom: 0px; margin-bottom:7px; padding-right: 20px;'>";
                                    var winIndex = 1;
                                    for (var i = 0; i < playerList.length; i++) {
                                        var username = i18n.transliterate(playerList[i].username);
                                        var winTime = playerList[i].winTime;
                                        if (winTime > 0) {
                                            playerListContents +=
                                                "<tr>"
                                                    + "<td style='float: right;'>" + winIndex + ".</td>"
                                                    + "<td>" + username.replace(/\s+/g, "&nbsp;") + "</td>"
                                                    + "<td>/</td>"
                                                    + "<td class='gameTime'>" + formatGameTimeMS(winTime) + "</td>"
                                                    + "</tr>";
                                            winIndex++;
                                        }
                                    }
                                    playerListContents + "</table>";
                                    $("#glGameDetailContent" + _gameId).empty().append(playerListContents);
                                    $("#glGameDetailContent" + _gameId).addClass("glActiveGameDetailContent");
                                }
                            });
                        } else {
                            $("#glGameDetailContent" + _gameId).hide();
                            $("#glGameDetailContent" + _gameId).removeClass("glActiveGameDetailContent");
                        }
                    };
                }(_gameId));
            }

            if (gameList[i].totalPlayed > 0) {
                $("#glShowGameDetail" + _gameId + "_2").click(function (_gameId) {
                    return function () {
                        if (!$("#glGameDetailContent" + _gameId + "_2").is(":visible")) {
                            $(".glActiveGameDetailContent").hide();
                            $("#glGameDetailContent" + _gameId + "_2").empty().append("<div style=\"padding-top: 20px; padding-left:20px; height:35px;\">" +
                                "<span style=\"float: left; color:black;\">" + i18n.get("loadingAlert") + "&nbsp;" +
                                "</span><img style=\"float: left; margin-top: -10px;\" src=\"/img/icons/loading_transparent.gif\"></div>");
                            $("#glGameDetailContent" + _gameId + "_2").show();
                            cs.sendRequest(GWT_PLAYERLIST, {
                                gameId : _gameId
                            }, function (result, data) {
                                if (result) {
                                    var playerList = data.playerList;
                                    var playerListContents = "<table class='noBordersTable' style='padding-bottom: 0px; margin-bottom:7px; padding-right: 20px;'>";
                                    for (var i = 0; i < playerList.length; i++) {
                                        var username = i18n.transliterate(playerList[i].username);
                                        var winTime = playerList[i].winTime;
                                        playerListContents +=
                                            "<tr>"
                                                + "<td style='float: right;'>" + (i + 1) + ".</td>"
                                                + "<td>" + username.replace(/\s+/g, "&nbsp;") + "</td>"
                                                + (winTime > 0 ? ("<td>/</td>"
                                                + "<td class='gameTime'>" + formatGameTimeMS(winTime) + "</td>") :
                                                "")
                                                + "</tr>";
                                    }
                                    playerListContents + "</ol>";
                                    $("#glGameDetailContent" + _gameId + "_2").empty().append(playerListContents);
                                    $("#glGameDetailContent" + _gameId + "_2").addClass("glActiveGameDetailContent");
                                }
                            });
                        } else {
                            $("#glGameDetailContent" + _gameId + "_2").hide();
                            $("#glGameDetailContent" + _gameId + "_2").removeClass("glActiveGameDetailContent");
                        }
                    };
                }(_gameId));
            }
        }

        that.bindHeaderAction("#glSortByGameId", GL_SORT_BY_GAME_ID, true);
        that.bindHeaderAction("#glSortByGameRating", GL_SORT_BY_GAME_RATING, false);
//        that.bindHeaderAction("#glSortByTotalGameRating", GL_SORT_BY_TOTAL_GAME_RATING, false);
        that.bindHeaderAction("#glSortByPlayerRating", GL_SORT_BY_PLAYER_RATING, false);
        that.bindHeaderAction("#glSortByGameTotalWon", GL_SORT_BY_TOTAL_WON, false);
        that.bindHeaderAction("#glSortByGameTotalPlayed", GL_SORT_BY_TOTAL_PLAYED, false);
        if (options.showDifficult)that.bindHeaderAction("#glSortByDifficult", GL_SORT_BY_DIFFICULT, false);

        $("#glSortByGameId").mouseenter(function () {
            ui.showHint("#glSortByGameId", i18n.get("sortByGameIdHint"));
        });

        $("#glSortByGameRating").mouseenter(function () {
            ui.showHint("#glSortByGameRating", i18n.get("sortByGameRatingHint"));
        });

        $("#glSortByPlayerRating").mouseenter(function () {
            ui.showHint("#glSortByPlayerRating", i18n.get("sortByWinTimeHint"));
        });

        $("#glSortByGameTotalWon").mouseenter(function () {
            ui.showHint("#glSortByGameTotalWon", i18n.get("sortByWonCountHint"));
        });

        $("#glSortByGameTotalPlayed").mouseenter(function () {
            ui.showHint("#glSortByGameTotalPlayed", i18n.get("sortByPlayedCountHint"));
        });

        $("#glSortByGameId, #glSortByGameRating, #glSortByPlayerRating, #glSortByGameTotalWon, #glSortByGameTotalPlayed").mouseleave(function () {
            ui.hideHint();
        });

//        $("#glShowMore").click(function () {
//            $("#glShowPanel").empty().append("<p class='giLoadingMore'>" + i18n.get("loadingAlert") + "&nbsp;<img style='margin-bottom:-10px;' src='/img/icons/loading.gif'></p>");
//            count = count + GL_DEFAULT_LOAD_COUNT;
//            that.loadAndRender(true);
//        });
//
//        $("#glShowAll").click(function () {
//            $("#glShowPanel").empty().append("<p class='giLoadingMore'>" + i18n.get("loadingAlert") + "&nbsp;<img style='margin-bottom:-10px;' src='/img/icons/loading.gif'></p>");
//            count = 0;
//            that.loadAndRender(true);
//        });

        $("#glLoadingImg").hide();
    }

    this.bindAll = function () {
        $("#closeGameListPanel").click(function () {
            ui.hidePanel("gameListPanel");
        });

        $("#glAuxClose").click(function () {
            ui.hidePanel("gameListPanel");
        });

        $("#glAuxRewind").click(function () {
            $("html, body").animate({ scrollTop : $("#gameListContents").offset().top - 1 * iDiv($("#gameArea").width(), 5) }, "normal");
        });

        if (isDef(that.options.bindCPButton) && that.options.bindCPButton) {
            $("#bbGameList").click(function () {
                that.run();
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

    sortBy = that.options.defaultSortBy;
    order = that.options.defaultOrder;

    that.bindAll();
}