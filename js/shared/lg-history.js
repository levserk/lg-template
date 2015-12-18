var GTW_HISTORY = "/gw/shared/loadHistory.php";
var GTW_SAVE_COMMENT = "/gw/shared/saveComment.php";

var GH_GAME_LIMIT = 31999;

var GH_SORT_BY_GAME_ID = 0;
var GH_SORT_BY_WIN_TIME_RANK = 1;
var GH_SORT_BY_BEST_ATTEMPT_RANK = 2;
var GH_SORT_BY_DATE = 3;

var NOT_WON_STATUS = 0;
var WIN_STATUS = 1;

var GH_SHOW_ALL_FILTER = 0;
var GH_SHOW_ONLY_FAV_FILTER = 1;
var GH_SHOW_ONLY_UNSOLVED_FILTER = 2;

var HISTORY_SHOW_SHORTCUTS_AFTER = 35;

var DESC = false;
var ASC = true;

var HISTORY_PAGINATOR_COUNT = 250;

function HistoryRenderer(_gc, _ui, _options) {
    var that = this;

    var activeEditedRow;

    var gc, ui, cs;

    var filter = GH_SHOW_ALL_FILTER;
    var sortBy = GH_SORT_BY_DATE;
    var order = DESC;

    var CONTENTS_ID = "#historyContents";

    var options = {
        bindCPButton : false,
        showLabels : false,
        showDays : true,
        showBestAttemptRank : true,
        gameIdLabel : "hand",
        gameIdWidth : "12%"
    };

    var i18n = new I18n();
    i18n.setContext('history');

    this.run = function () {
        if (!$("#historyPanel").is(":visible")) {
            cs = gc.getClientServer();
            ui.setLoading("#historyContents");
            that.paginator = new Paginator(0, HISTORY_PAGINATOR_COUNT, 0);
            that.paginator.addListener(that);
            this.loadAndRender(false);
            ui.showPanel({id : "historyPanel",
                type : BOTTOM_PANEL,
                onClose : function () {
                    if (activeEditedRow != null) {
                        that.saveComment(activeEditedRow);
                    }
                }});
        } else {
            ui.hidePanel("historyPanel");
        }
    }

    this.currentPositionChanged = function () {
        that.loadAndRender(true, true);
    }

    this.loadAndRender = function (repeatLoad, forceScroll) {
        forceScroll = ifDef(forceScroll, false);

        if (repeatLoad) {
            $("#ghLoadingImg").show();
        }

        if (!forceScroll) { // TODO, HACK, REWORK
            that.paginator.reset();
        }

        cs.sendRequest(GTW_HISTORY, {
            sortBy : sortBy,
            order : boolToInt(order),
            filter : filter,
            currentPosition : that.paginator.currentPosition,
            currentCount : that.paginator.currentCount
        }, function (result, data, error) {
            $("#ghLoadingImg").hide();
            if (result) {
                that.render(data);
                if (!repeatLoad || forceScroll) {
                    $("html, body").animate({
                        scrollTop : $("#historyPanel").offset().top - 1 * iDiv($("#gameArea").width(), 5)
                    }, "normal");
                }
            } else {
                that.ui.renderErrorReason(CONTENTS_ID, error.reason);
            }
        });
    }

    this.generateHeader = function (id, title, columnSortBy) {
        var headerStyle = "padding-top: 8px;";

        return "<span"
            + (sortBy == columnSortBy ? " class='activeSortHeader actionText4'" : " class='actionText4'")
            + " id='" + id + "'>" + title // + "<br />"
            + (sortBy == columnSortBy ? ui.getOrderHint(order) : "")
            + "</span>";

//            + (sortBy == columnSortBy ?
//            ui.serverSortArrowsImg(order, headerStyle) + ui.getOrderHint(order) :
//            " &nbsp;<img style='" + headerStyle + "' src='/img/icons/sort-both.png' alt=''/>")
    }

    this.bindHeaderAction = function (jId, columnSortBy, columnDefaultOrder) {
        $(jId).click(function () {
            if (sortBy != columnSortBy) {
                sortBy = columnSortBy;
                order = columnDefaultOrder;
            } else {
                order = !order;
            }
            that.loadAndRender(true);
        });
    }

    this.generateSortImg = function (id, columnSortBy) {
        return (sortBy == columnSortBy ?
            ui.serverSortArrowsImg(order, "", id) :
            " &nbsp;<img src='/img/icons/sort-both.png' id='" + id + "' alt=''/>");
    }

    this.render = function (data) {
        var history = data.history;
        var userRankBySolvedCount = data.userRankBySolvedCount;
        var total = data.total;

        that.paginator.setTotal(total);

        // that.paginator.next(); // TODO, HACK

        activeEditedRow = null;

        var gameIdHeader = this.generateHeader("ghSortByGameId", i18n.get("gameIdLabel", that.options.gameIdLabel), GH_SORT_BY_GAME_ID);
        var winTimeRankHeader = this.generateHeader("ghSortByWinTimeRank", i18n.get("wtLabel"), GH_SORT_BY_WIN_TIME_RANK);
        var bestAttemptRankHeader = this.generateHeader("ghSortByBestAttemptRank", i18n.get("baLabel"), GH_SORT_BY_BEST_ATTEMPT_RANK);
        var dateHeader = this.generateHeader("ghSortByDate", options.showDays ? i18n.get("dateDaysLabel") : i18n.get("dateLabel"), GH_SORT_BY_DATE);

        var tableContents = "<table class='standartTable' style='clear:both;' " +
            " width='100%' border='0' vspace='0' cellspacing='0' hspace='0'><tr style='height: 42px;'>"
            + "<th colspan='" + (that.options.showLabels ? 3 : 2) + "' class='secondLevelRow nonSelectable' width='" + that.options.gameIdWidth + "'>" + gameIdHeader + "</th>"
            + "<th class='secondLevelRow'>" + i18n.get("commentLabel") + "</th>"
            + "<th class='secondLevelRow nonSelectable' colspan='3' width='15%'>" + winTimeRankHeader + "</th>"
            + (options.showBestAttemptRank ? ("<th class='secondLevelRow nonSelectable' colspan='3' width='15%' >" + bestAttemptRankHeader + "</th>") : "")
            + "<th class='secondLevelRow nonSelectable' width='1%'>" + dateHeader + "</th>"
            + "</tr>";

        tableContents += "<tr class='auxRow'>"
            + "<td class='ghArrows' colspan='" + (that.options.showLabels ? 3 : 2) + "'>"
            + that.generateSortImg("ghSortByGameIdImg", GH_SORT_BY_GAME_ID)
            + "</td>"
            + "<td class='ghNoArrows'>&nbsp;</td>"
            + "<td class='ghArrows' colspan='3'>"
            + that.generateSortImg("ghSortByWinTimeRankImg", GH_SORT_BY_WIN_TIME_RANK)
            + "</td>"
            + (options.showBestAttemptRank ? ("<td class='ghArrows' colspan='3'>"
            + that.generateSortImg("ghSortByBestAttemptRankImg", GH_SORT_BY_BEST_ATTEMPT_RANK)
            + "</td>") : "")
            + "<td class='ghArrows'>"
            + that.generateSortImg("ghSortByDateImg", GH_SORT_BY_DATE)
            + "</td>"
            + "</tr>";

        var totalRows = 0;
        var totalPlayed = 0;
        var totalWon = 0;
        var totalWinTime = 0;

//        var strRankBySolvedCount = "";
//
//        if (rankBySolvedCount > 0) {
//            strRankBySolvedCount = "&nbsp;&nbsp;(" + rankBySolvedCount + " место)";
//        }

        for (var i = 0; i < history.length; i++) {
            var gh = history[i];

            var strTimestamp = formatDate(gh.timestamp);

            if (gh.status == WIN_STATUS && gh.peek != 1) {
                totalWon++;
                totalWinTime += gh.winTime;
            }

            totalPlayed++;

            var rowClass = "";

            if (gh.status == NOT_WON_STATUS) {
                rowClass = " rowPlayed ";
            } else {
                rowClass = " rowWon ";
            }

            var strGameId;

            if (filter == GH_SHOW_ONLY_FAV_FILTER && gh.fav == 0) {
                continue;
            }

            if (filter == GH_SHOW_ONLY_UNSOLVED_FILTER && gh.status == WIN_STATUS) {
                continue;
            }

            totalRows++;

            strGameId = "<span " + (gh.gameId >= GH_GAME_LIMIT ? "style='color: #C42E21;'" : "")
                + " class='linkAlike nonSelectable' id='ghPlay"
                + gh.gameId
                + "'>"
                + gh.gameId
                + "</span>";

            var strWinTimeRank = "—", strBestAttemptRank = "—";

            if (gh.status == WIN_STATUS && gh.peek != 1) {
                strWinTimeRank = gh.wtRank;
                strBestAttemptRank = gh.baRank;
            }

            var winTimeAlignment = " style='text-align: right;'";

            if (gh.winTime == 0) {
                winTimeAlignment = " style='text-align: right; color: #777;'";
            }

            var bestAttemptTimeAlignment = " style='text-align: right;'";

            if (gh.status != WIN_STATUS || gh.peek) {
                bestAttemptTimeAlignment = " style='text-align: center;'";
            }

            if (that.options.showLabels) {
                var labelParagraph = "<p style='display: inline; color: #777;'>" + gh.label + "&nbsp;</p>";
            }

            tableContents = tableContents
                + "<tr class='ghRow" + rowClass + "' id='ghRow" + gh.gameId + "' " + ">"
                + "<td class='noRightBorder'>"
                + "<img id='ghFav" + gh.gameId + "' " + (gh.fav == 0 ? "style='display: none;'" : "") + " class='ghFavImg' src='/img/icons/fav-2.png' alt=''/>"
                + "</td>"
                + "<td id='ghGameIdTd" + gh.gameId + "' style='cursor: pointer; white-space: nowrap; padding-left: 5px;'" + (that.options.showLabels ? " class='noRightBorder'" : "") + ">"
                + "<p class='ghGameId nonSelectable' style='inline;'>&nbsp;"
                + strGameId
                + "</p>"
                + "</td>"
                + (that.options.showLabels
                ? "<td id='ghLabelTd" + gh.gameId + "' style='white-space: nowrap; cursor: pointer;'>" + labelParagraph + "</td>"
                : "")
                + "<td id='ghCommentTd"
                + gh.gameId
                + "'><p>"
                + that.generateFullComment(gh)
                + "</p></td>"
                + "<td class='noRightBorder' " + winTimeAlignment + ">" + (gh.winTime == 0 ? "<span>" + formatGameTimeMS(gh.totalGameTime) + "</span>" : formatGameTimeMS(gh.winTime)) + "</td>"
                + "<td class='noRightBorder'>/</td>"
                + (strWinTimeRank==0?'<td title="ваше место будет вычислено позднее">—</td>':'<td>'+strWinTimeRank + '</td>')
                + (options.showBestAttemptRank ?
                ("<td class='noRightBorder' " + bestAttemptTimeAlignment + ">" + (gh.bestAttemptTime == 0 ? "—" : formatGameTimeMS(gh.bestAttemptTime)) + "</td>"
                    + "<td class='noRightBorder'>/</td>"
                    + (strBestAttemptRank==0?'<td title="ваше место будет вычислено позднее">—</td>':'<td>'+strBestAttemptRank + '</td>')) : "")
                + "<td><p>" + strTimestamp + (options.showDays ? "&nbsp;/&nbsp;" + (gh.playDays + 1) : "")
                + "</p></td></tr>";
        }

        if (history.length == 0) {
            tableContents += "<tr><td colspan='10'><div class='ghNoDataAlert'>" + i18n.get("noGamesByFilterAlert") + "</div></td></tr>";
        }

        tableContents = tableContents + "</table>";

//        if (totalRows > 15) {
//            $("#historyAuxPanel").show();
//        } else {
//            $("#historyAuxPanel").hide();
//        }

        $("#historyContents").empty();

        if (history.length == 0 && filter == GH_SHOW_ALL_FILTER) {
            $("#historyContents").append("<div class='ghNoDataAlert'>" + i18n.get("noGamesAlert") + "</div>");
        } else {
            $("#historyContents")
                .append(
                "<p class='ghFilterPanel'>"
                    + "<span class='auxText'>" + i18n.get("filtersLabel") + ":&nbsp;&nbsp;&nbsp;</span><span class="
                    + (filter != GH_SHOW_ALL_FILTER ? "'linkAlike'"
                    : "'linkAlikeDisabled'")
                    + " id='ghShowAll'>" + i18n.get("allFilterLabel") + "</span>&nbsp;&nbsp;&nbsp;"
                    + "<span class="
                    + (filter != GH_SHOW_ONLY_FAV_FILTER ? "'linkAlike'"
                    : "'linkAlikeDisabled'")
                    + " id='ghShowOnlyFav'>" + i18n.get("favoritesFilterLabel") + "</span>&nbsp;&nbsp;&nbsp;"
                    + "<span class="
                    + (filter != GH_SHOW_ONLY_UNSOLVED_FILTER ? "'linkAlike'"
                    : "'linkAlikeDisabled'")
                    + " id='ghShowOnlyUnsolved'>" + i18n.get("unsolvedFilterLabel") + "</span>"
                    + "<img id='ghLoadingImg' alt='" + i18n.get("loadingAltText") + "' src='/img/icons/loading.gif'>"
                    + "</p>");

//        $("#historyContents")
//            .append(
//            "<p class='ghSummaryStats'>"
//                + "решено: " + totalWon + "&nbsp;&nbsp;&nbsp;&nbsp;"
//                + "сыграно: " + totalPlayed + strRankBySolvedCount
//                + "</p>");

            $("#historyContents").append(tableContents);
        }

        var paginatorRenderer = new PaginatorRenderer(that.paginator, "userHistory");

        $("#historyContents").append(paginatorRenderer.render());

        paginatorRenderer.bindEvents();

        var averageWinTime;
        if (totalWon > 0) {
            averageWinTime = Math.round(totalWinTime / totalWon);
        } else {
            averageWinTime = 0;
        }

        // margin-bottom: -10px;
//        $("#historyContents").append(
//            "<div style='margin-left: 5px; margin-top: 20px;'>"
//                + "<p>Среднее время решения: " + (averageWinTime == 0 ? "—" : formatGameTimeMS(averageWinTime)) + "</p></div>");

        if (history.length > HISTORY_SHOW_SHORTCUTS_AFTER) {
            var auxAppendix = "<div style='padding-top: 10px; margin-top: 20px; background-color: white;  border-top: 1px dashed #CCC;'>";
            auxAppendix += "<div class='bspAuxBtn' style='float: left;' id='historyScroll'>[" + i18n.get("auxScrollTop") + "]</div>";
            auxAppendix += "<div class='bspAuxBtn' style='float: right;' id='historyClose'>[" + i18n.get("auxClose") + "]</div>";
            auxAppendix += "<div class='clear'></div>";
            auxAppendix += "</div>";

            $("#historyContents").append(auxAppendix);

            $("#historyScroll").click(function () {
                $("html, body").animate({scrollTop : $("#historyPanel").offset().top - iDiv($("#gameArea").width(), 3)});
            });

            $("#historyClose").click(function () {
                ui.hidePanel("historyPanel");
            });
        }

        $("#ghShowAll").click(function () {
            if (filter != GH_SHOW_ALL_FILTER) {
                filter = GH_SHOW_ALL_FILTER;
//                that.paginator.reset();
                that.loadAndRender(true);
            }
        });

        $("#ghShowOnlyFav").click(function () {
            if (filter != GH_SHOW_ONLY_FAV_FILTER) {
                filter = GH_SHOW_ONLY_FAV_FILTER;
//                that.paginator.reset();
                that.loadAndRender(true);
            }
        });

        $("#ghShowOnlyUnsolved").click(function () {
            if (filter != GH_SHOW_ONLY_UNSOLVED_FILTER) {
                filter = GH_SHOW_ONLY_UNSOLVED_FILTER;
//                that.paginator.reset();
                that.loadAndRender(true);
            }
        });

        that.bindActions(history);
    }

    this.bindActions = function (history) {
        for (var i = 0; i < history.length; i++) {
            var gh = history[i];

            $("#ghGameIdTd" + gh.gameId
                + (that.options.showLabels
                ? (", #ghLabelTd" + gh.gameId)
                : ""))
                .click(function (gh) {
                return function () {
                    gc.requestGame(gh.gameId, null, function () {
//                        $("html, body").animate({ scrollTop : 0 }, "fast");
                        //ui.showGameInfo(gh.gameId, false);
                        ui.hidePanel('historyPanel')
                    });
                }
            }(gh));

            $("#ghCommentTd" + gh.gameId).dblclick(function (gh) {
                return function () {
                    that.addCommentEditor(gh);
                }
            }(gh));
        }

        that.bindHeaderAction("#ghSortByGameId, #ghSortByGameIdImg",
            GH_SORT_BY_GAME_ID, true);

        that.bindHeaderAction("#ghSortByWinTimeRank, #ghSortByWinTimeRankImg",
            GH_SORT_BY_WIN_TIME_RANK, true);

        that.bindHeaderAction("#ghSortByBestAttemptRank, #ghSortByBestAttemptRankImg",
            GH_SORT_BY_BEST_ATTEMPT_RANK, true);

        that.bindHeaderAction("#ghSortByDate, #ghSortByDateImg",
            GH_SORT_BY_DATE, false);
    }

    this.addCommentEditor = function (gh) {
        if ($("#ghCommentTd" + gh.gameId).html().indexOf("textarea") != -1) {
            return;
        }

        var checked = (gh.fav == 1) ? "checked" : 0;

        if (activeEditedRow != null) {
            that.saveComment(activeEditedRow);
        }

        activeEditedRow = gh;

        $("#ghCommentTd" + gh.gameId).empty().append("<div class='ghCommentEditArea'>"
            + "<textarea id='ghGameComment" + gh.gameId + "' rows='10' style='width:98%'></textarea>"
            + "<br /><input type='checkbox' id='ghInFavorites"
            + gh.gameId + "'" + checked + "/>" + i18n.get("addToFavoritesCheckBoxLabel")
            + "<br /> <br />"
            + "<div id='ghSaveCommentBtn" + gh.gameId + "' class='button nonSelectable'>" + i18n.get("saveButtonLabel") + "</div>"
            + "<div id='ghDiscardCommentBtn" + gh.gameId + "' class='button nonSelectable'>" + i18n.get("dismissButtonLabel") + "</div>"
            + "<div class='clear'></div>"
            + "</div>");

        $("#ghGameComment" + gh.gameId).focus().val("").val(gh.comment);

        $("#ghSaveCommentBtn" + gh.gameId).click(function () {
            that.saveComment(gh);
        });

        $("#ghDiscardCommentBtn" + gh.gameId).click(function () {
            $("#ghCommentTd" + gh.gameId).empty().append(that.generateFullComment(gh));
            activeEditedRow = null;
        });
    }

    this.generateFullComment = function (gh) {
        var fullCommentString = "";

        if (gh.peek != 0) {
            fullCommentString += " [" + i18n.get("pokeSolutionShortLabel") + "] ";
        }

        fullCommentString += that.formatComment(gh.comment);

        return fullCommentString;
    }

    this.formatComment = function (comment) {
        var newComment = comment.replace(/\n/gi, "<br />");
        if (newComment.length == 0)
            return "";
        else {
            var pieces = comment.split(" ");
            var totalLength = 0;
            var i = 0;
            while (i < pieces.length && totalLength + pieces[i].length <= 22) {
                totalLength += pieces[i].length;
                if (i < pieces.length - 1)
                    totalLength++;
                i++;
            }
            totalLength = 0;
            while (i < pieces.length && totalLength + pieces[i].length <= 35) {
                totalLength += pieces[i].length;
                if (i < pieces.length - 1)
                    totalLength++;
                i++;
            }
            if (i > 0) {
                for (var j = 0; j < pieces.length; j++) {
                    pieces[j] = pieces[j].substr(0, 27);
                }
                return that.join(pieces, i);
            }
            else if (i == 0 && pieces.length > 0)
                return pieces[0].substr(0, 25) + "...";
        }
    }

    this.join = function (pieces, maxLength) {
        var result = "";
        for (var i = 0; i < Math.min(maxLength, pieces.length); i++) {
            if (result != "")
                result += " ";
            result += pieces[i];
        }
        if (maxLength < pieces.length)
            result += "...";
        return result;
    }

    that.saveComment = function (gh) {
        var newComment = $("#ghGameComment" + gh.gameId).val();
        var iNewFav = $("#ghInFavorites" + gh.gameId).is(":checked") ? 1 : 0;

        gc.getClientServer().sendRequest(GTW_SAVE_COMMENT, {
            gameId : gh.gameId,
            comment : newComment,
            fav : iNewFav
        }, function (result) {
            if (!result) {
                ; // TODO: notify user
            }
        });

        that.gsUpdateRow(gh, newComment, iNewFav);

        activeEditedRow = null;
    }

    that.gsUpdateRow = function (gh, newComment, newFav) {
        gh.comment = newComment;
        gh.fav = newFav;

        if (gh.fav) {
            $("#ghFav" + gh.gameId).show();
        } else {
            $("#ghFav" + gh.gameId).hide();
        }

        $("#ghCommentTd" + gh.gameId).empty().append(that.generateFullComment(gh));
    }

//    this.onLogout = function () {
//        $("#bbHistory").empty().append("<span style='color: #777;'>История</span>");
////            + "<br/>"
////            + "<span style='color: #C42E21; font-weight: bold; font-size: 7pt;'>зарег. польз.</span>");
//    }
//
//    this.onLogin = function () {
//        $("#bbHistory").empty().append("История");
//    }

    this.bindAll = function () {
        $("#closeHistoryPanel").click(function () {
            ui.hidePanel("historyPanel");
        });

        if (isDef(that.options.bindCPButton) && that.options.bindCPButton) {
            $("#bbHistory").click(function () {
                //if (gc.getClientServer().isLogged()) {
                that.run();
//                } else {
//                    that.gc.doNotLoggedAction();
//                }
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

    that.bindAll();
}