var GTW_USERNAME_FILTER = "/gw/shared/usernameFilter.php";
var GTW_RATINGS = "/gw/shared/loadRatingsBySolvedCount.php";
var GTW_PLAYER_DETAIL = "/gw/shared/loadPlayerDetail.php";

var SHOW_DUP_USER_ROW_AFTER = 20;

var MAX_VISIBLE_USERNAME_LENGTH = 17;

var SHOW_SHORTCUTS_AFTER = 35;

var OFFLINE_COLOR = "#FFFFFF";
var ONLINE_COLOR = "#D7FACF";
var INACTIVE_COLOR = "#EFF9DB";

var RL_SHOW_ALL_RATINGS = 0;
var RL_SHOW_ONLINE_RATINGS = 1;
var RL_SHOW_GUEST_RATINGS = 2;
var RL_SHOW_COMMON_RATING = 3;

var RL_SORT_BY_SOLVED_COUNT = 0;
var RL_SORT_BY_BA_RANK = 1;
var RL_SORT_BY_WT_RANK = 2;
var RL_SORT_BY_PLAYED_COUNT = 3;
var RL_SORT_BY_SOLVED_RATIO = 4;
var RL_SORT_BY_REG_DATE = 5;
var RL_SORT_BY_TOTAL_GAME_TIME = 6;
var RL_SORT_BY_AVERAGE_WIN_TIME = 7;
var RL_SORT_BY_TOTAL_GAME_RATING = 8;
var RL_SORT_BY_TOTAL_WIN_TIME = 9;
var RL_SORT_BY_BEST_COUNT = 10;

var RL_DEFAULT_LOAD_COUNT = 500;

var rlFilter = RL_SHOW_ALL_RATINGS;
var rlSortBy = RL_SORT_BY_SOLVED_COUNT;
var rlOrder = true;

var DESC = false;
var ASC = true;

function RatingsRenderer(_gc, _ui, _options) {
    var that = this;

    var gc, ui, cs;

    var CONTENTS_ID = "#ratingsContents";

    var options = {
        showLabels : false,
        showBestAttemptCount : false,
        canFilter : false,
        filterLabel : "",
        noFilterLabel : "",
        showTimeRatings : false
    };

    var filter = RL_SHOW_ALL_RATINGS;
    var sortBy = RL_SORT_BY_SOLVED_COUNT;
    var order = ASC;
    var usernamePrefixFilter = "";

    that.activeSubFilter = null;

    that.timeFilter = null;

    that.activeSegmentFilter = 0;

    var i18n = new I18n();
    i18n.setContext('rating');

    this.resetSettings = function () {
        filter = RL_SHOW_ALL_RATINGS;
        sortBy = RL_SORT_BY_SOLVED_COUNT;
        order = ASC;
        usernamePrefixFilter = "";
        that.activeSegmentFilter = 0;

        that.activeSubFilter = null;
        that.timeFilter = null;
    }

    this.run = function () {
        if (!$("#ratingsPanel").is(":visible")) {
            that.resetSettings();
            cs = gc.getClientServer();

            that.loader = new Loader(0, RL_DEFAULT_LOAD_COUNT);
            that.loader.addListener(that);

            ui.setLoading("#ratingsContents");
            this.loadAndRender(false);
            ui.showPanel({
                id : "ratingsPanel",
                contentsId : CONTENTS_ID,
                type : BOTTOM_PANEL
            });
        } else {
            ui.hidePanel("ratingsPanel");
        }
    }

    this.countChanged = function () {
        that.loadAndRender(true, false);
    }

    this.loadAndRender = function (repeatLoad, resetLoader) {
        if (repeatLoad) {
            $("#rlLoadingImg").show();
        }

        // TODO, REWORK, HACK
        resetLoader = ifDef(resetLoader, true);

        if (resetLoader) { // TODO, HACK, REWORK
            that.loader.reset();
        }

        if (that.timeFilter || filter != RL_SHOW_ALL_RATINGS) {
            that.activeSegmentFilter = 0;
        }
        cs.sendRequest(GTW_RATINGS, {
                sortBy : sortBy,
                order : bool2Int(order),
                filter : filter,
                usernamePrefixFilter : usernamePrefixFilter,
                count : that.loader.count,
                subFilter : that.activeSubFilter ? that.activeSubFilter.value : 0,
                timeFilter : that.timeFilter ? (that.timeFilter.year + "-" + that.timeFilter.month) : 0,
                segmentFilter : that.activeSegmentFilter
            },
            function (result, data, error) {
                $("#rlLoadingImg").hide();
                if (result) {
                    that.render(data);
                    if (!repeatLoad) {
                        $("html, body").animate({
                            scrollTop : $("#ratingsPanel").offset().top - iDiv($("#gameArea").width(), 3)
                        }, "normal");
                    }
                    // DEV !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
//                    that.fillPlayerDetail(8347, "Саша");
                } else {
                    that.ui.renderErrorReason(CONTENTS_ID, error.reason);
                }
            }
        )
        ;
    }

    this.bindHeaderAction = function (jId, columnSortBy, columnDefaultOrder, onlyDefaultOrder) {
        onlyDefaultOrder = ifDef(onlyDefaultOrder, false);

        $(jId).click(function () {
            if (sortBy != columnSortBy || onlyDefaultOrder) {
                sortBy = columnSortBy;
                order = columnDefaultOrder;
            } else {
                order = !order;
            }
            that.loadAndRender(true);
        });
    }

    this.generateHeader = function (id, title, columnSortBy, showOrderHint) {
        return "<span"
            + (sortBy == columnSortBy ? " class='activeSortHeader actionText3'" : " class='actionText3'")
            + " id='" + id + "'>" + title
            + (showOrderHint ? (sortBy == columnSortBy ? ui.getOrderHint(order) : "") : "")
            + "</span>";
    }

    this.generateSortImg = function (id, columnSortBy) {
        return (sortBy == columnSortBy ?
            ui.serverSortArrowsImg(order, "", id) :
            " &nbsp;<img src='/img/icons/sort-both.png' id='" + id + "' alt=''/>");
    }

    this.applyTimeFilter = function (year, month) {
        that.timeFilter = {
            year : year,
            month : month
        };
        that.loadAndRender(true);
    }

    this.applySubFilter = function (subFilter) {
        that.activeSubFilter = subFilter;
        that.loadAndRender(true);
    }

    this.renderSubFilters = function (subFilters) {
        if (subFilters) {
            var rlSubFilters = "";

            for (i in subFilters) {
                var subFilter = subFilters[i];

                var rlClass = (that.activeSubFilter && subFilter.id == that.activeSubFilter.id) ? "disabledText" : "actionText2";

                rlSubFilters +=
                    "<span class='" + rlClass + "' id='" + subFilter.id + "'>" + subFilter.name + "</span>"
                        + "&nbsp;&nbsp;&nbsp;&nbsp;";
            }

            return rlSubFilters;
        } else {
            return  "";
        }
    }

    that.locateActiveSubFilter = function (subFilters, activeSubFilterId) {
        for (i in subFilters) {
            if (subFilters[i].id == activeSubFilterId) {
                that.activeSubFilter = subFilters[i];
            }
        }

//        alert(activeSubFilterId);
    }

    this.setSort = function (_sortBy, _order) {
        sortBy = _sortBy;
        order = _order;
    }

    this.renderFilter = function (filterData) {
        $("#rlFilterSection").empty();

        var options = "<option value='nofilter'>" + that.options.noFilterLabel + "</option>";

        for (var i in filterData) {
            var filter = filterData[i];

            options += "<option value='" + filter.val + "'>" + filter.text + "</option>";
        }

        $("#rlFilterSection").append("<table style='margin-bottom: 5px;'>"
            + "<tr>"
            + "<td style='vertical-align: middle !important;'>"
            + "<span style='color: #777;'>" + that.options.filterLabel + ": </span>"
            + "</td>"
            + "<td>&nbsp;&nbsp;</td>"
            + "<td>"
            + "<select style='width: 220px' id='rlFilter'>"
            + options
            + "</select>"
            + "</td>"
            + "</tr>"
            + "</table>");

        if (that.activeSegmentFilter) {
            $("#rlFilter").val(that.activeSegmentFilter);
        }

        $("#rlFilter").change(function (e) {
            that.onFilterChange();
        });

        $("#rlFilter").chosen({
            disable_search : true
        });
    }

    this.onFilterChange = function () {
        var value = $("#rlFilter option:selected").val();

        if (value == "nofilter") {
            that.activeSegmentFilter = 0;
        } else {
            that.activeSegmentFilter = value;
        }

        that.loadAndRender(true);
    }

    this.render = function (data) {
        that.loader.setTotal(data.total);

        that.locateActiveSubFilter(data.subFilters, data.activeSubFilterId);

        if (that.options.canFilter && (!that.timeFilter && filter == RL_SHOW_ALL_RATINGS)) {
            var filterData = data.filterData;
            that.renderFilter(filterData);
        } else {
            $("#rlFilterSection").empty();
        }

        var ratings = data.ratings;

        ui.hideHint();

        var doShowExtendedColumns = (that.timeFilter == null && that.activeSegmentFilter == 0);

//        var bestWinTimeCountTitle =
//            that.options.showBestAttemptCount ?
//                "1-х мест<br />по<br />времени" :
//                "1-x мест";

        var tdr = new TableDataRenderer(sortBy, order, {
            thClass : "rlHeader"
        });

        tdr.addColumn({
            title : i18n.get("placeLabel"),
            hint : i18n.get("sortByPlaceHint"),
            headerId : "rlSortByPlace",
            enableSort : true,
            sortBy : RL_SORT_BY_SOLVED_COUNT,
            defaultOrder : true,
            onlyDefaultOrder : true,
            showOrderHint : false,
            hasRightBorder : false
        });

        tdr.addColumn({
            title : i18n.get("usernameLabel"),
            enableSort : false,
            hasRightBorder : false,
            colspan : 2,
            customSortImgTdFunc : function () {
                return "<td class='noRightBorder rlArrows' colspan='2' style='text-align: left !important;'>"
                    + "<table width='100%' class='noBordersTable' style='border-collapse: collapse;' cellpadding='0' cellspacing='0'>"
                    + "<tr>"
                    + "<td style='padding-left: 0; padding-right: 10px; color: #777;'>" + i18n.get("searchByUsernameLabel") + ": </td>"
                    + "<td width='50%' style='padding: 0 0 0 0;'>"
                    + "<input id='rlUsernameFilter' style='width:100% !important; min-width: 75px; display: inline;' value='" + usernamePrefixFilter + "'/>"
                    + "</td>"
                    + "<td width='50%' id='rlClearUsernamePrefixFilterTd'>"
                    + "<img src='/img/icons/cross_12_12_a64.png' style='padding-left: 10px;' alt='' />"
                    + "</td>"
                    + "<td width='50%' id='rlFilterUsernamePrefixTd'>"
                    + "<img src='/img/icons/accept_12_12_a64.png' style='padding-left: 10px;' alt='' />"
                    + "</td>"
                    + "</tr>"
                    + "</table>"
                    + "</td>";
            }
        });

        tdr.addColumn({
            title : i18n.get("regDateLabel"),
            hint : i18n.get("sortByDateHint"),
            headerId : "rlSortByRegDate",
            enableSort : true,
            sortBy : RL_SORT_BY_REG_DATE,
            defaultOrder : false,
            onlyDefaultOrder : false,
            showOrderHint : true,
            hasRightBorder : false
        });

        tdr.addColumn({
            title : i18n.get("solvedCountLabel"),
            enableSort : false,
            hasRightBorder : false,
            insertSeparatorAfter : true
        });

        tdr.addColumn({
            title : i18n.get("playedCountLabel"),
            enableSort : false,
            hasRightBorder : false
        });

        tdr.addColumn({
            title : "%",
            hint : i18n.get("sortBySolvedRatio"),
            headerId : "rlSortBySolvedRatio",
            enableSort : true,
            sortBy : RL_SORT_BY_SOLVED_RATIO,
            defaultOrder : false,
            onlyDefaultOrder : false,
            showOrderHint : true,
            hasRightBorder : true
        });

        if (doShowExtendedColumns) {
            tdr.addColumn({
                title : (
                    that.options.showBestAttemptCount
                        ? i18n.get("bestWinTimeCountLabel")
                        : i18n.get("bestWinTimeCountShortLabel")
                    ),
                headerId : "rlSortByWinTimeRank",
                sortBy : RL_SORT_BY_BEST_COUNT,
                enableSort : true,
                defaultOrder : false,
                showOrderHint : true,
                hasRightBorder : true
            });

//            var suAvWinTimeAndTotalGameTimeTh = "";
            if (cs.isSuperUser() && !that.activeSegmentFilter) {
                tdr.addColumn({
                    title : i18n.get("totalGameTimeShortLabel"),
                    headerId : "rlSortByTotalGameTime",
                    enableSort : true,
                    sortBy : RL_SORT_BY_TOTAL_GAME_TIME,
                    defaultOrder : false,
                    showOrderHint : true,
                    hasRightBorder : false
                });

                tdr.addColumn({
                    title : i18n.get("averageWinTimeShortLabel"),
                    headerId : "rlSortByAverageWinTime",
                    enableSort : true,
                    sortBy : RL_SORT_BY_AVERAGE_WIN_TIME,
                    defaultOrder : true,
                    showOrderHint : true,
                    hasRightBorder : false
                });

                tdr.addColumn({
                    title : i18n.get("totalGameRatingShortLabel"),
                    headerId : "rlSortByTotalGameRating",
                    enableSort : true,
                    sortBy : RL_SORT_BY_TOTAL_GAME_RATING,
                    defaultOrder : false,
                    showOrderHint : true,
                    hasRightBorder : true
                });

//
//                suAvWinTimeAndTotalGameTimeTh = "<th class='rlHeader noRightBorder'>"
//                    + that.generateHeader("rlSortByTotalGameTime", "Общ вр", RL_SORT_BY_TOTAL_GAME_TIME, true)
//                    + "</th>"
//                    + "<th class='rlHeader noRightBorder'>"
//                    + that.generateHeader("rlSortByAverageWinTime", "Ср вр", RL_SORT_BY_AVERAGE_WIN_TIME, true)
//                    + "</th>"
//                    + "<th class='rlHeader'>"
//                    + that.generateHeader("rlSortByTotalGameRating", "Сумм рейт", RL_SORT_BY_TOTAL_GAME_RATING, true)
//                    + "</th>";
//                + "<th class='rlHeader noRightBorder'>"
//                + that.generateHeader("rlSortByTotalWinTime", "Сумм вр реш", RL_SORT_BY_TOTAL_WIN_TIME, true)
//                + "</th>";
            }
        }

//        var placeHeader = "<span"
//            + (sortBy == RL_SORT_BY_SOLVED_COUNT ? " class='activeSortHeader actionText3'" : " class='actionText3'")
//            + " id='rlSortByPlace'>Место"
//            //+ (sortBy == RL_SORT_BY_SOLVED_COUNT ? ui.getOrderHint(order) : "")
//            + "</span>";

        //var regDateHeader = that.generateHeader("rlSortByRegDate", "Дата", RL_SORT_BY_REG_DATE, true);

//        var solvedCountHeader =
//            "<span"
//            + (sortBy == RL_SORT_BY_SOLVED_COUNT ? " class='activeSortHeader simpleText'" : " class='simpleText'")
//            + " id='rlSortBySolvedCount'>Решено"
//            + (sortBy == RL_SORT_BY_SOLVED_COUNT ? ui.getOrderHint(!order) : "")
//            + "</span>";
//            "<span class='simpleText' id='rlSortBySolvedCount'>Решено</span>";

//        var playedCountHeader = "<span"
//            + (sortBy == RL_SORT_BY_PLAYED_COUNT ? " class='activeSortHeader simpleText'" : " class='simpleText'")
//            + " id='rlSortByPlayedCount'>Всего"
//            + (sortBy == RL_SORT_BY_PLAYED_COUNT ? ui.getOrderHint(order) : "")
//            + "</span>";
//
//        var solvedRatioHeader = "<span"
//            + (sortBy == RL_SORT_BY_SOLVED_RATIO ? " class='activeSortHeader actionText3'" : " class='actionText3'")
//            + " id='rlSortBySolvedRatio'>%"
//            + (sortBy == RL_SORT_BY_SOLVED_RATIO ? ui.getOrderHint(order) : "")
//            + "</span>";

//        var baRankHeader = "<span" + (sortBy == RL_SORT_BY_BA_RANK ? " class='activeSortHeader simpleText'" : " class='simpleText'")
//            + " id='rlSortByRank'>Лучших<br />попыток"
//            + (sortBy == RL_SORT_BY_BA_RANK ? ui.getOrderHint(order) : "")
//            + "</span>";
//
//        var wtRankHeader = "<span" + (sortBy == RL_SORT_BY_WT_RANK ? " class='activeSortHeader simpleText'" : " class='simpleText'")
//            + " id='rlSortByRank2'>"
//            + bestWinTimeCountTitle
//            + (sortBy == RL_SORT_BY_WT_RANK ? ui.getOrderHint(order) : "")
//            + "</span>";

        // generate and append table contents
        var tableContents = "<table class='standartTable' style='clear:both; border-collapse: collapse;' "
            + " width='100%' border='0' vspace='0' cellspacing='0' hspace='0'><tr>"
            + tdr.renderTableHeader()
            //"<th class='rlHeader noRightBorder'>" + placeHeader + "</th>" // placeHeader // colspan='2'
            //+ "<th width='75%' class='rlHeader noRightBorder' colspan='2'>Имя</th>"
            //+ "<th class='rlHeader noRightBorder'>" + regDateHeader + "</th>"
            //+ "<th class='rlHeader noRightBorder'>" + solvedCountHeader + "</th>"
            //+ "<th class='rlHeader noRightBorder'>&nbsp;</th>"
            //+ "<th class='rlHeader noRightBorder'>" + playedCountHeader + "</th>"
//            + "<th class='rlHeader'>" + solvedRatioHeader + "</th>"
//            + (doShowExtendedColumns ? /* "<th width='1%' class='rlHeader'>" + wtRankHeader + "</th>" */ ""
//            + suAvWinTimeAndTotalGameTimeTh
//        :
//        ""
//        )
//            + (cs.isSuperUser() ? ("<th width='1%' class='rlHeader'>" + baRankHeader + "</th>") : "")
            + "</tr>";

        //ui.serverSortArrowsImg(order, "", "rlSortByPlaceImg")

//        var suSortImg = "<td class='rlArrows noRightBorder' style='text-align: center;'>"
//            + that.generateSortImg("rlSortByTotalGameTimeImg", RL_SORT_BY_TOTAL_GAME_TIME)
//            + "</td>"
//            + "<td class='rlArrows noRightBorder' style='text-align: center;'>"
//            + that.generateSortImg("rlSortByAverageWinTimeImg", RL_SORT_BY_AVERAGE_WIN_TIME)
//            + "</td>"
//            + "<td class='rlArrows' style='text-align: center;'>"
//            + that.generateSortImg("rlSortByTotalGameRatingImg", RL_SORT_BY_TOTAL_GAME_RATING)
//            + "</td>";
//            + "<td class='rlArrows' style='text-align: center;'>"
//            + that.generateSortImg("rlSortByTotalWinTimeImg", RL_SORT_BY_TOTAL_WIN_TIME)
//            + "</td>";

        tableContents += "<tr class='rlArrowsRow'>"
            + tdr.renderTableSortTrContents()
            + "</tr>";

//        tableContents += "<tr class='rlArrowsRow'>"
//            + "<td class='noRightBorder "
//            + (sortBy == RL_SORT_BY_SOLVED_COUNT ? "noArrows" : "rlArrows")
//            + "'>" //  colspan='2'
//            + (sortBy == RL_SORT_BY_SOLVED_COUNT ? "&nbsp;" : " &nbsp;<img src='/img/icons/sort-both.png' id='rlSortByPlaceImg' alt=''/>")
//            + "</td>"
////            + "<td class='noRightBorder rlArrows'>&nbsp;</td>"
//            + "<td class='noRightBorder rlArrows' colspan='2' style='text-align: left !important;'>"
//            + "<table width='100%' class='noBordersTable' style='border-collapse: collapse;' cellpadding='0' cellspacing='0'>"
//            + "<tr>"
//            + "<td style='padding-left: 0; padding-right: 10px; color: #777;'>Поиск: </td>"
//            + "<td width='50%' style='padding: 0 0 0 0;'>"
//            + "<input id='rlUsernameFilter' style='width:100% !important; min-width: 75px; display: inline;' value='" + usernamePrefixFilter + "'/>"
//            + "</td>"
//            + "<td width='50%' id='rlClearUsernamePrefixFilterTd'>"
//            + "<img src='/img/icons/cross_12_12_a64.png' style='padding-left: 10px;' alt='' />"
//            + "</td>"
//            + "<td width='50%' id='rlFilterUsernamePrefixTd'>"
//            + "<img src='/img/icons/accept_12_12_a64.png' style='padding-left: 10px;' alt='' />"
//            + "</td>"
//            + "</tr>"
//            + "</table>"
//            + "</td>"
//            + "<td class='noRightBorder rlArrows' style='text-align: center;'>"
//            + (sortBy == RL_SORT_BY_REG_DATE ? ui.serverSortArrowsImg(order, "", "rlSortByRegDateImg") : " &nbsp;<img src='/img/icons/sort-both.png' id='rlSortByRegDateImg' alt=''/>")
//            + "</td>"
////            + "<td class='noRightBorder rlArrows'>"
////            + (sortBy == RL_SORT_BY_SOLVED_COUNT ? ui.serverSortArrowsImg(!order, "", "rlSortBySolvedCountImg") : " &nbsp;<img src='/img/icons/sort-both.png' id='rlSortBySolvedCountImg' alt=''/>")
////            + "</td>"
//            + "<td class='noRightBorder noArrows'>&nbsp;</td>"
//            + "<td class='noRightBorder noArrows'>&nbsp;</td>"
////            + "<td class='noRightBorder rlArrows'>"
////            + (sortBy == RL_SORT_BY_PLAYED_COUNT ? ui.serverSortArrowsImg(order, "", "rlSortByPlayedCountImg") : " &nbsp;<img src='/img/icons/sort-both.png' id='rlSortByPlayedCountImg' alt=''/>")
////            + "</td>"
//            + "<td class='noRightBorder noArrows'>&nbsp;</td>"
//            + "<td class='rlArrows'>"
//            + (sortBy == RL_SORT_BY_SOLVED_RATIO ? ui.serverSortArrowsImg(order, "", "rlSortBySolvedRatioImg") : " &nbsp;<img src='/img/icons/sort-both.png' id='rlSortBySolvedRatioImg' alt=''/>")
//            + "</td>"
////            + "<td class='rlArrows'>"
////            + (sortBy == RL_SORT_BY_WT_RANK ? ui.serverSortArrowsImg(order, "", "rlSortByRank2Img") : " &nbsp;<img src='/img/icons/sort-both.png' id='rlSortByRank2Img' alt=''/>")
////            + "</td>"
//            + (
//            doShowExtendedColumns ? "<td class='noArrows'>&nbsp;</td>"
//                + (cs.isSuperUser() ? suSortImg : "") : ""
//            )
////            + (cs.isSuperUser() ? ("<td class='rlArrows'>"
////            + (sortBy == RL_SORT_BY_BA_RANK ? ui.serverSortArrowsImg(order, "", "rlSortByRankImg") : " &nbsp;<img src='/img/icons/sort-both.png' id='rlSortByRankImg' alt=''/>")
////            + "</td>") : "")
//            + "</tr>";

//        if (sortBy == RL_SORT_BY_SOLVED_COUNT) {
//            ratingList.sortBy('place', order);
//        } else if (sortBy == RL_SORT_BY_REG_DATE) {
//            ratingList.sortBy('regTimeTS', order);
//        } else if (sortBy == RL_SORT_BY_SOLVED_COUNT) {
//            ratingList.sortBy('solvedCount', order);
//        } else if (sortBy == RL_SORT_BY_PLAYED_COUNT) {
//            ratingList.sortBy('playedCount', order);
//        } else if (sortBy == RL_SORT_BY_SOLVED_RATIO) {
//            ratingList.sortByMultipleFields({
//                    field1 : {field : 'solvedRatio', order : order},
//                    field2 : {field : 'solvedCount', order : order}
//                }
//            );
//        } else if (sortBy == RL_SORT_BY_BA_RANK) {
//            ratingList.sortBy('firstPlacesByRank', order);
//        } else if (sortBy == RL_SORT_BY_WT_RANK) {
//            ratingList.sortBy('firstPlacesByRank2', order);
//        }

//        var ratingDataSet = ratingList.getDataSet();

        var place = -1;

        var tableInternals = "";

        var userRating = null;
        var userData = null;
        var userStyle = "";

        for (var rowNumber = 0; rowNumber < ratings.length; rowNumber++) {
            var rating = ratings[rowNumber];

            if (filter == RL_SHOW_ALL_RATINGS && rating.isGuest) {
                continue;
            }

            if (filter == RL_SHOW_ONLINE_RATINGS && (!rating.isOnline || rating.isGuest && !cs.isSuperUser())) {
                continue;
            }

            if (filter == RL_SHOW_GUEST_RATINGS && (!rating.isGuest || !cs.isSuperUser())) {
                continue;
            }

            var isCurrentUser = rating.playerId == cs.getUserId();

            var tableData = that.rlGenerateTableData(rating, false, doShowExtendedColumns);

            var color = OFFLINE_COLOR;

            if (rating.isOnline) {
                color = ONLINE_COLOR;
            }

//            if (rating.playerId == 40) {
//                rating.isOnline = true;
//                rating.isAway = true;
//            }

            if (rating.isOnline && !rating.isActive) {
                color = INACTIVE_COLOR;
            }

            if (isCurrentUser) {
                color = ONLINE_COLOR;
            }

//            if (!cs.isSuperUser()) {
//                color = OFFLINE_COLOR;
//            }

            var style = "background-color: " + color + ";";

            if (isCurrentUser) {
                style = style + " font-weight:bold;"
                place = rating.place;
                if (rowNumber >= SHOW_DUP_USER_ROW_AFTER) {
                    userStyle = "background-color: #F7F7F7;";
                    userRating = rating;
                }
            }

            tableInternals += "<tr style='" + style + ";' id='rlRow" + rowNumber + "'>"
                + tableData
                + "</tr>";
        }

//        if (userRating != null) {
        if (data.userRatingRow != null) {
//        var userRow = "<tr style='font-weight: bold; border-bottom:2px solid #AAA; height: 40px;'>"
//            + "<td class='noRightBorder' style='vertical-align: middle; white-space: nowrap; text-align: center;' width='35%'><p>Ваше место: " + userRating.place
//            + "</p></td>" + "<td class='noRightBorder'>&nbsp;</td>"
//            + "<td style='vertical-align: middle;' class='noRightBorder'><p>"
//            + userRating.solvedCount + "<sup class='greenSup'>"
//            + (userRating.todayWonTotal > 0 ? "+" + userRating.todayWonTotal : "&nbsp;") + "</sup></p>"
//            + "<td style='vertical-align: middle;' class='noRightBorder'><p>/</p></td>"
//            + "<td style='vertical-align: middle;' class='noRightBorder'><p>"
//            + userRating.playedCount + "<sup class='greenSup'>"
//            + (userRating.todayPlayedTotal > 0 ? "+" + userRating.todayPlayedTotal : "&nbsp;") + "</sup></p></td>"
//            + "<td><p class='rlWonPercentage'>" + calcPercent(userRating.solvedCount, userRating.playedCount) + "%<sup>&nbsp;</sup></p></td>"
//            + "<td style='text-align: center; vertical-align: middle;' width='25%'><p>" + userRating.firstPlacesByRank2 + "</p></td>"
//            + "<td style='text-align: center; vertical-align: middle;' width='25%'><p>" + userRating.firstPlacesByRank + "</p></td>"
//            + "</tr>"

            var userData = that.rlGenerateTableData(data.userRatingRow, true, doShowExtendedColumns);

            tableContents += "<tr style='" + userStyle + " border-bottom:2px solid #AAA; height: 30px;'>" + userData + "</tr>" + tableInternals + "</table>";
        } else {
            tableContents += tableInternals + "</table>";
        }

        $("#ratingsContents").empty();

//    if (place != -1) {
//        $("#ratingsContents").append("<p style='margin-top:0px; float: left;'>Ваше место: " + place + "</p>");
//    }

        var rlGuestFilter = "";

//        + (filter != RL_SHOW_ALL_RATINGS ? "'actionText2'" : "'disabledText'")
//                + " id='showAllRatings'>все игроки</span>"
//                + rlOnlineFilter

//        if (cs.isSuperUser()) {
//            rlOnlineFilter = "&nbsp;&nbsp;&nbsp;&nbsp;"
//                + "<span class="
//                + (filter != RL_SHOW_ONLINE_RATINGS ? "'actionText2'" : "'disabledText'")
//                + " id='showOnlineRatings'>сейчас на сайте</span>";
//        }

        if (cs.isSuperUser()) {
            rlGuestFilter =
                renderMenu([
                    {
                        id : "showCommonRating",
                        text : "все игроки",
                        isActive : filter == RL_SHOW_COMMON_RATING
                    },
                    {
                        id : "showAllRatings",
                        text : "зарег.",
                        isActive : filter == RL_SHOW_ALL_RATINGS
                    },
                    {
                        id : "showGuestRatings",
                        text : "гости",
                        isActive : filter == RL_SHOW_GUEST_RATINGS
                    },
                    {
                        id : "showOnlineRatings",
                        text : "сейчас на сайте",
                        isActive : filter == RL_SHOW_ONLINE_RATINGS
                    }
                ])
//                + "<span class=" +
//                (filter != RL_SHOW_GUEST_RATINGS ? "'actionText2'" : "'disabledText'")
//                + " id='showGuestRatings'>только гости</span>"
//                + "&nbsp;&nbsp;&nbsp;&nbsp;"
//                + "<span class=" +
//                (filter != RL_SHOW_COMMON_RATING ? "'actionText2'" : "'disabledText'")
//                + " id='showCommonRating'>все игроки</span>"
                + "&nbsp;&nbsp;&nbsp;&nbsp;"
                + "<a style='color: #006699;' target='_blank' href='/admin/'>Админка</a>"
                + "&nbsp;&nbsp;&nbsp;&nbsp;"
                + "<a style='color: #006699;' target='_blank' href='/kosynka/_stats/_profiles.php'>профили</a>"
                + "&nbsp;&nbsp;&nbsp;&nbsp;"
                + "<a style='color: #006699;' target='_blank' href='https://docs.google.com/spreadsheet/ccc?key=0AqEgIQ1K8gzAdHB2dEJGRUlJb2xya2JCdUM2WFZwd0E#gid=5'>план р-ты</a>"
                + "<br /><br />";
        }

        if (that.options.showTimeRatings || cs.isSuperUser()) {
            var rlTimeFilters = "";
//            var rlTimeFilters = renderMenu([
//                {
//                    id : "rlAbsolute",
//                    text : i18n.get("absoluteRatingMenuLabel"),
//                    isActive : that.timeFilter == null
//                },
//                {
//                    id : "rlPast2012",
//                    text : "2012",
//                    isActive : that.timeFilter != null && that.timeFilter.year == 2012 && that.timeFilter.month == 0
//                },
//                {
//                    id : "rlPast2013",
//                    text : "2013",
//                    isActive : that.timeFilter != null && that.timeFilter.year == 2013 && that.timeFilter.month == 0
//                },
//                {
//                    id : "rl2013_1",
//                    text : i18n.getMonthShort(I18n.JANUARY) + " 2013",
//                    isActive : that.timeFilter != null && that.timeFilter.year == 2013 && that.timeFilter.month == 1
//                },
//                {
//                    id : "rl2013_2",
//                    text : i18n.getMonthShort(I18n.FEBRUARY) + " 2013",
//                    isActive : that.timeFilter != null && that.timeFilter.year == 2013 && that.timeFilter.month == 2
//                },
//                {
//                    id : "rl2013_3",
//                    text : i18n.getMonthShort(I18n.MARCH) + " 2013",
//                    isActive : that.timeFilter != null && that.timeFilter.year == 2013 && that.timeFilter.month == 3
//                },
//                {
//                    id : "rl2013_4",
//                    text : i18n.getMonthShort(I18n.APRIL) + " 2013",
//                    isActive : that.timeFilter != null && that.timeFilter.year == 2013 && that.timeFilter.month == 4
//                }
//            ], "&nbsp;&nbsp;&nbsp;") + "&nbsp;&nbsp;&nbsp;&nbsp;";
        } else {
            rlTimeFilters = "";
        }

        var rlOnlineFilter = "";

        var rlSubFilters = that.renderSubFilters(data.subFilters);

        if (cs.isSuperUser()) {
            rlOnlineFilter = "&nbsp;&nbsp;&nbsp;&nbsp;"
                + "<span class="
                + (filter != RL_SHOW_ONLINE_RATINGS ? "'actionText2'" : "'disabledText'")
                + " id='showOnlineRatings'>сейчас на сайте</span>";
        }

        if (cs.isSuperUser()) {
            $("#ratingsContents").append("<p style='margin-top:3px; margin-bottom:10px; margin-left: 1px; float: left;'>"
//                "<span class="
//                + (filter != RL_SHOW_ALL_RATINGS ? "'actionText2'" : "'disabledText'")
//                + " id='showAllRatings'>все игроки</span>"
//                + rlOnlineFilter
                + rlGuestFilter
                + rlTimeFilters
                + rlSubFilters
                + "<img src='/img/icons/loading.gif' id='rlLoadingImg' />"
                + "</p>");
        } else {
            $("#ratingsContents").append("<p style='margin-top:3px; margin-bottom:10px; margin-left: 1px; float: left;'>"
                + rlTimeFilters
                + rlSubFilters
                + "&nbsp;"
                + "<img src='/img/icons/loading.gif' id='rlLoadingImg' />"
                + "</p>");
        }

//        if (cs.isSuperUser()) {
//            $("#rlLoadingImg").css("left", "505px");
//        }

        $("#showAllRatings").click(function () {
            filter = RL_SHOW_ALL_RATINGS;
            that.loadAndRender(true);
        });

        $("#showOnlineRatings").click(function () {
            filter = RL_SHOW_ONLINE_RATINGS;
            that.loadAndRender(true);
        });

        $("#showGuestRatings").click(function () {
            filter = RL_SHOW_GUEST_RATINGS;
            that.loadAndRender(true);
        });

        $("#showCommonRating").click(function () {
            filter = RL_SHOW_COMMON_RATING;
            that.loadAndRender(true);
        });

        $("#ratingsContents").append(tableContents);

        if (cs.isSuperUser() && filter == RL_SHOW_ALL_RATINGS && usernamePrefixFilter == "" && !that.timeFilter && !that.activeSegmentFilter) {
            var loaderRenderer = new LoaderRenderer(that.loader, "players"); // , "userHistory"

            $("#ratingsContents").append(loaderRenderer.render());

            loaderRenderer.bindEvents();
        }

        if (usernamePrefixFilter == "") {
            $("#rlClearUsernamePrefixFilterTd").hide();
            $("#rlFilterUsernamePrefixTd").show();
        } else {
            $("#rlFilterUsernamePrefixTd").hide();
            $("#rlClearUsernamePrefixFilterTd").show();
        }

        $("#rlFilterUsernamePrefixTd").click(function () {
            usernamePrefixFilter = $("#rlUsernameFilter").val();
            that.loadAndRender(true);
        });

        $("#rlClearUsernamePrefixFilterTd").click(function () {
            usernamePrefixFilter = "";
            that.loadAndRender(true);
        });

        if (!cs.isLogged()) {
            $("#ratingsContents").append("<p class='ratingsRegPrompt'>"
                + i18n.get("regForRatingAlert") + "</p>");
            $("#rlReg").click(function () {
                ui.showRegPanel();
            });
        }

        if (ratings.length > SHOW_SHORTCUTS_AFTER) {
            var auxAppendix = "<div style='padding-top: 10px; background-color: white;'>";
            auxAppendix += "<div class='bspAuxBtn' style='float: left;' id='ratingsScroll'>[" + i18n.get("auxScrollTop") + "]</div>";
            auxAppendix += "<div class='bspAuxBtn' style='float: right;' id='ratingsClose'>[" + i18n.get("auxClose") + "]</div>";
            auxAppendix += "<div class='clear'></div>";
            auxAppendix += "</div>";

            $("#ratingsContents").append(auxAppendix);

            $("#ratingsScroll").click(function () {
                $("html, body").animate({scrollTop : $("#ratingsPanel").offset().top - iDiv($("#gameArea").width(), 3)});
            });

            $("#ratingsClose").click(function () {
                ui.hidePanel("ratingsPanel");
            });
        }

        for (var i = 0; i < ratings.length; i++) {
            var playerId = ratings[i].playerId;
            var playerName = i18n.transliterate(ratings[i].username);

            if (filter == RL_SHOW_ONLINE_RATINGS && !rating.isOnline) {
                continue;
            }

            $("#rlShowPlayerDetail" + playerId).click(function (_playerId, playerName) {
                return function () {
                    that.fillPlayerDetail(_playerId, playerName, false);
                };
            }(playerId, playerName));

            if (playerId == cs.getUserId()) {
                $("#rlShowPlayerDetail" + playerId + "u").click(function (_playerId, playerName) {
                    return function () {
                        that.fillPlayerDetail(_playerId, playerName, true);
                    };
                }(playerId, playerName));
            }
        }

        if (data.subFilters) {
            for (i in data.subFilters) {
                var subFilter = data.subFilters[i];

                $("#" + subFilter.id).click(function (subFilter) {
                    return function () {
                        that.applySubFilter(subFilter);
                    }
                }(subFilter));
            }
        }

        if (that.options.showTimeRatings || cs.isSuperUser()) {
            $("#rlAbsolute").click(function () {
                that.timeFilter = null;
                that.loadAndRender(true);
            });

            $("#rlPast2012").click(function () {
                that.applyTimeFilter(2012, 0);
            });

            $("#rlPast2013").click(function () {
                that.applyTimeFilter(2013, 0);
            });

            $("#rl2013_1").click(function () {
                that.applyTimeFilter(2013, 1);
            });

            $("#rl2013_2").click(function () {
                that.applyTimeFilter(2013, 2);
            });
            $("#rl2013_3").click(function () {
                that.applyTimeFilter(2013, 3);
            });
            $("#rl2013_4").click(function () {
                that.applyTimeFilter(2013, 4);
            });
        }

        tdr.bindHeaderActions(that);

//        if (sortBy != RL_SORT_BY_SOLVED_COUNT) {
//            that.bindHeaderAction("#rlSortByPlace, #rlSortByPlaceImg", RL_SORT_BY_SOLVED_COUNT, true, true);
//        }

//        that.bindHeaderAction("#rlSortByRank2, #rlSortByRank2Img", RL_SORT_BY_WT_RANK, false);
//        that.bindHeaderAction("#rlSortByRegDate, #rlSortByRegDateImg", RL_SORT_BY_REG_DATE, false);
//        that.bindHeaderAction("#rlSortBySolvedCount, #rlSortBySolvedCountImg", RL_SORT_BY_SOLVED_COUNT, false);
//        that.bindHeaderAction("#rlSortByPlayedCount, #rlSortByPlayedCountImg", RL_SORT_BY_PLAYED_COUNT, false);
//        that.bindHeaderAction("#rlSortBySolvedRatio, #rlSortBySolvedRatioImg", RL_SORT_BY_SOLVED_RATIO, false);

        //rlSortByTotalGameTime
//        that.bindHeaderAction("#rlSortByTotalGameTime, #rlSortByTotalGameTimeImg",
//            RL_SORT_BY_TOTAL_GAME_TIME, false);
//        that.bindHeaderAction("#rlSortByAverageWinTime, #rlSortByAverageWinTimeImg",
//            RL_SORT_BY_AVERAGE_WIN_TIME, true);
//
//        that.bindHeaderAction("#rlSortByTotalGameRating, #rlSortByTotalGameRatingImg",
//            RL_SORT_BY_TOTAL_GAME_RATING, false);

//        that.bindHeaderAction("#rlSortByTotalWinTime, #rlSortByTotalWinTimeImg",
//            RL_SORT_BY_TOTAL_WIN_TIME, false);

//        if (sortBy != RL_SORT_BY_SOLVED_COUNT) {
//            $("#rlSortByPlace").mouseenter(function () {
//                ui.showHint("#rlSortByPlace", "Сортировать по<br />месту в рейтинге");
//            });
//
//            $("#rlSortByPlaceImg").mouseenter(function () {
//                ui.showHint("#rlSortByPlaceImg", "Сортировать по<br />месту в рейтинге");
//            });
//        }

//        $("#rlSortByRegDate").mouseenter(function () {
//            ui.showHint("#rlSortByRegDate", "Сортировать по<br />дате регистрации");
//        });
//
//        $("#rlSortByRegDateImg").mouseenter(function () {
//            ui.showHint("#rlSortByRegDateImg", "Сортировать по<br />дате регистрации");
//        });

//        $("#rlSortBySolvedCount").mouseenter(function () {
//            ui.showHint("#rlSortBySolvedCount", "Сортировать по<br />количеству решённых раскладов");
//        });
//
//        $("#rlSortBySolvedCountImg").mouseenter(function () {
//            ui.showHint("#rlSortBySolvedCountImg", "Сортировать по<br />количеству решённых раскладов");
//        });

//        $("#rlSortByPlayedCount").mouseenter(function () {
//            ui.showHint("#rlSortByPlayedCount", "Сортировать по<br />количеству сыгранных раскладов");
//        });
//
//        $("#rlSortByPlayedCountImg").mouseenter(function () {
//            ui.showHint("#rlSortByPlayedCountImg", "Сортировать по<br />количеству сыгранных раскладов");
//        });

//        $("#rlSortBySolvedRatio").mouseenter(function () {
//            ui.showHint("#rlSortBySolvedRatio", "Сортировать по<br />проценту выигранных раскладов");
//        });
//
//        $("#rlSortBySolvedRatioImg").mouseenter(function () {
//            ui.showHint("#rlSortBySolvedRatioImg", "Сортировать по<br />проценту выигранных раскладов");
//        });

//        $("#rlSortByRank").mouseenter(function () {
//            ui.showHint("#rlSortByRank", "Сортировать по количеству<br />лучших попыток");
//        });

//        $("#rlSortByRankImg").mouseenter(function () {
//            ui.showHint("#rlSortByRankImg", "Сортировать по количеству<br />лучших попыток");
//        });
//
//        $("#rlSortByRank2").mouseenter(function () {
//            ui.showHint("#rlSortByRank2", "Сортировать по количеству<br />1-х мест по времени до решения");
//        });
//
//        $("#rlSortByRank2Img").mouseenter(function () {
//            ui.showHint("#rlSortByRank2Img", "Сортировать по количеству<br />1-х мест по времени до решения");
//        });

//        "#rlSortByPlace, #rlSortByPlaceImg, "        +

//        $("#rlSortByRegDate, #rlSortByRegDateImg, "
////            + "#rlSortBySolvedCount, #rlSortBySolvedCountImg, "
////            + /"#rlSortByPlayedCount, #rlSortByPlayedCountImg, "
//            + "#rlSortBySolvedRatio, #rlSortBySolvedRatioImg, "
////            + "#rlSortByRank, #rlSortByRankImg, "
////            + "#rlSortByRank2, #rlSortByRank2Img"
//        ).mouseleave(function () {
//                ui.hideHint();
//            });

        $("#rlUsernameFilter").autocomplete({
            source : function (request, response) {
                cs.sendRequest(GTW_USERNAME_FILTER, {
                    usernamePrefix : request.term,
                    subFilter : that.activeSubFilter ? that.activeSubFilter.value : null
                }, function (result, data) {
                    response(data);
                });
            },
            minLength : 1,
            select : function (event, ui) {
                usernamePrefixFilter = ui.item ? ui.item.value : this.value;
                that.loadAndRender(true);
            }
        });

        $("#rlUsernameFilter").keydown(function (event) {
            if (event.which == KEY_ENTER) {
                usernamePrefixFilter = ui.item ? ui.item.value : this.value;
                that.loadAndRender(true);
                event.preventDefault();
            } else if (event.which == KEY_ESC) {
                usernamePrefixFilter = "";
                that.loadAndRender(true);
                event.preventDefault();
            } else {
                $("#rlClearUsernamePrefixFilterTd").hide();
                $("#rlFilterUsernamePrefixTd").show();
            }
        });
    }

    this.rlGenerateTableData = function (rating, isUserSpecialRow, doShowExtendedColumns) {
        var isUserSpecialRow = isDef(isUserSpecialRow) ? isUserSpecialRow : false;
        var idAppx = isUserSpecialRow ? "u" : "";

        rating.username = i18n.transliterate(rating.username);

        var isNovice = Math.abs(rating.appearanceTS - nowTS()) <= 24 * 3600;

        var suAvWinTimeAndTotalGameTimeTd = "";
        if (cs.isSuperUser() && !that.activeSegmentFilter) {
            suAvWinTimeAndTotalGameTimeTd = "<td nowrap='true' style='color: #AAA; vertical-align: top !important; text-align: right;' class='noRightBorder'>"
                + "<span>" + suFormatTotalGameTime(rating.totalGameTime) + "</span>" + "<sup>&nbsp;</sup></td>"
                + "<td nowrap='true' style='color: #AAA; vertical-align: top !important; text-align: right;' class='noRightBorder'>"
                + "<span>" + (rating.averageWinTime ? formatGameTimeMS(rating.averageWinTime) : "—") + "</span>" + "<sup>&nbsp;</sup></td>"
                + "<td nowrap='true' style='color: #AAA; vertical-align: top !important; text-align: right;'>"
                + "<span>" + suFormatTotalGameTime(rating.totalGameRating) + "</span>" + "<sup>&nbsp;</sup></td>";
//                + "<td nowrap='true' style='color: #AAA; vertical-align: top !important; text-align: right;'>"
//                + "<span>" + suFormatTotalGameTime(rating.totalWinTime) + "</span>" + "<sup>&nbsp;</sup></td>"
        }

        var championMark = "<sup>&nbsp;</sup>";

        if (that.timeFilter && that.timeFilter.year && !that.timeFilter.month) {
            var championMarkAppx = " " + that.timeFilter.year + " " + i18n.get("yearChampionMarkAppx");
        } else if (that.timeFilter && that.timeFilter.year && that.timeFilter.month) {
            championMarkAppx = " " + i18n.getMonthBeta(that.timeFilter.month); // + " " + that.timeFilter.year + " года";
        } else {
            championMarkAppx = "";
        }

        if (that.activeSegmentFilter != 0) {
            championMarkAppx = " " + i18n.get("segmentChampionMarkAppx");
        }

        if (!that.timeFilter && that.activeSegmentFilter == 0) {
            var championMarkPrefix = i18n.get("absoluteChampionMarkPrefix") + " ";
        } else {
            championMarkPrefix = "";
        }

        if (!rating.isGuest) {
            if (rating.place == 1) {
                var championMark = "<sup style='color: #C42E21;'> " + championMarkPrefix + i18n.get("championMark") + championMarkAppx + "</sup>";
            } else if (rating.wasChampion && rating.place > 1 || rating.championship) {
                championMark = "<sup style='color: #C42E21;'> " + i18n.get("exChampionMark") + "</sup>";

                if (rating.championship) {
                    championMark = "<sup style='color: #C42E21;'> " + rating.championship + "</sup>";
                }
            }
        }


        var ratingPlaceString = rating.place + ".";

        if (rating.place == 0) {
            ratingPlaceString = "";
        }

        if (cs.isSuperUser()) {
//            var suIsActiveTd = (rating.isOnline && !rating.isActive) ? "<span><img alt='' src='/img/away.png' /></span>&nbsp;&nbsp;" : "";
            //var placeColspan = "";
        } else {
//            suIsActiveTd = "";
            //var placeColspan = " colspan='2'";
        }

        if (isUserSpecialRow) {
            var placeString = (rating.place != 0) ? (" (" + rating.place + " " + i18n.get("placeSuffix") + ")") : "";

            var ratingPlaceUsernamePhotoString = "<td class='noRightBorder' style='white-space: nowrap; vertical-align: top !important; text-align: right;'>"
                + "<span><b> </b></span><sup>&nbsp;</sup>"
                + "</td>"
                + "<td colspan='2' class='noRightBorder' style='white-space: nowrap; vertical-align: top !important;'>"
                + "<span><b>" + i18n.get("userRowPrefix") + ":</b></span><sup>&nbsp;</sup>"
                + "<span>" + formatUsername(rating.username)
                + placeString + "</span><sup>&nbsp;</sup>"
                + "</td>";
        } else {
            var ratingPlaceUsernamePhotoString =
                "<td class='noRightBorder' style='white-space: nowrap; vertical-align: top !important; text-align: right;'>"
                    + "<span>" + ratingPlaceString + "</span>" + "<sup>&nbsp;</sup></td>"
                    + "<td class='noRightBorder' style='white-space: nowrap; vertical-align: top !important;' width='30%'>"
                    + "<span class='activeText' id='rlShowPlayerDetail" + rating.playerId + idAppx + "'>"
                    + formatUsername(rating.username) + "</span>" + championMark
                    // + "<div style='display: none;' class='rlPlayerDetailContent' id='rlPlayerDetailContent" + rating.playerId + idAppx + "'></div>"
                    + "</td>"
                    + "<td class='noRightBorder' style='width: 1%; padding-right: 10px; vertical-align: middle !important;'>"
                    + (rating.photo != null ? "<a href='" + rating.photo + "' rel='lightbox'><img src='/img/icons/camera.png' alt=''/></a>" : "")
                    + "</td>";
        }

        var tableData = ratingPlaceUsernamePhotoString
            + "<td style='color: #AAA; vertical-align: top !important; text-align: center;' class='noRightBorder'>" + (
            isNovice ?
                "<span style='color: #C42E21 !important;'>" + i18n.get("noviceMark") + "</span>"
                :
                "<span>" + formatDate(rating.appearanceTS) + "</span>"
            ) + "<sup>&nbsp;</sup></td>" //  + " <span style='font-size: 6pt;'>(" + formatDate(rating.appearanceTS) + ")</span>"
            + "<td style='vertical-align: top !important;' class='noRightBorder'><p>"
            + "<span id='rlShowSolved" + rating.playerId + idAppx + "'>" + rating.solvedCount + "</span>"
            + "<sup class='greenSup'>"
            + (rating.todayWonTotal > 0 ? "+" + rating.todayWonTotal : "&nbsp;")
            + "</sup></p></td>"
            + "<td style='vertical-align: top !important;' class='noRightBorder'><span>/</span><sup>&nbsp;</sup></td>"
            + "<td style='vertical-align: top !important;' class='noRightBorder'><p>"
            + "<span id='rlShowPlayed" + rating.playerId + idAppx + "'>" + rating.playedCount + "</span>"
            + "<sup class='greenSup'>"
            + (rating.todayPlayedTotal > 0 ? "+" + rating.todayPlayedTotal : "&nbsp;")
            + "</sup></p></td>"
            + "<td style='vertical-align: top !important; text-align: center;'><p class='rlWonPercentage'>"
            + calcPercent(rating.solvedCount, rating.playedCount) + "<sup>&nbsp;</sup></p>"
            + "</td>"
            + (doShowExtendedColumns ? "<td style='vertical-align: top !important; text-align: center;' width='25%'><p>"
            + ((rating.isGuest || !rating.firstPlacesByRank2) ? "—" : rating.firstPlacesByRank2)
            + "<sup>&nbsp;</sup></p></td>"
            + suAvWinTimeAndTotalGameTimeTd : "");
//            + (cs.isSuperUser() ? ("<td style='vertical-align: top !important; text-align: center;' width='25%'><p>"
//            + (rating.isGuest ? "—" : rating.firstPlacesByRank)
//            + "<sup>&nbsp;</sup></p></td>") : "");

        return tableData;
    }

    this.fillPlayerDetail = function (playerId, playerUsername, isUserSpecialRow) {
        var isUserSpecialRow = isDef(isUserSpecialRow) ? isUserSpecialRow : false;
        var idAppx = isUserSpecialRow ? "u" : "";

        $("#rlLoadingImg").show();

        cs.sendRequest(GTW_PLAYER_DETAIL, {
            playerId : playerId,
            subFilter : that.activeSubFilter ? that.activeSubFilter.value : null
        }, function (result, data) {
            var playerDetail = data.playerDetail;
            var playerTotalGameTime = data.totalGameTime;
            var playerAverageWinTime = data.averageWinTime;
            var profile = data.profile;

            var self = (playerId == cs.getUserId());

            $("#rlLoadingImg").hide();

            var playerDetailContents = "<h4 style='padding-left: 5px; text-align: center;'>" + playerUsername + "</h4>";

            playerDetailContents += PlayerProfile.renderProfile(profile, cs.isGuest());

            var playerGames = "<table width='93%' class='noBordersTable' style='margin-bottom: 10px; margin-left: 10px;' cellpadding='0' cellspacing='0'>";
//            var wonGameCount = 0;
            var userGames = "<table width='93%' class='noBordersTable' style='margin-bottom: 10px; margin-left: 10px;' cellpadding='0' cellspacing='0'>";
//            var unsolvedGameCount = 0;

            var totalWinTime = 0;

//            if (cs.isSuperUser()) {
//                playerGames += "<tr class='pdRow'>"
//                    + "<th>Расклад</th>"
//                    + "<th style='text-align: right'>/</th>"
//                    + "<th style='text-align: right'>вр реш</th>"
//                    + "<th style='text-align: left'>(</th>"
//                    + "<th style='text-align: right'>вр реш " + cs.getUsername() + "</th>"
//                    + "<th>)</th>"
//                    + "</tr>"
//                    + "<tr><td colspan='6'>&nbsp;</td></tr>";
//
//                userGames += "<tr class='pdRow'>"
//                    + "<th>Расклад</th>"
//                    + "<th style='text-align: right'>/</th>"
//                    + "<th style='text-align: right'>вр реш</th>"
//                    + "<th style='text-align: left'>(</th>"
//                    + "<th style='text-align: right'>вр реш " + cs.getUsername() + "</th>"
//                    + "<th>)</th>"
//                    + "</tr>"
//                    + "<tr><td colspan='6'>&nbsp;</td></tr>";
//            }

//            var playerTotalGameTime = 0;
            var playerTotalWinTime = 0;
            var playerWinCount = 0;

            for (var i = 0; i < playerDetail.length; i++) {
                var gameId = playerDetail[i].gameId;
//                var winTime = playerDetail[i].winTime;
//                var totalElapsed = playerDetail[i].totalElapsed;

                var pd = playerDetail[i];

                var suTd = "";
                var playerTableRowClass = "";

//                if (cs.isSuperUser()) {
//                    var suWinTime = playerDetail[i].suWinTime;
//                    var suGameTime = playerDetail[i].suGameTime;
//                    if (suGameTime > 0) {
//                        suTd = "<td " + (suWinTime == 0 ? " class='faded'" : "") + ">(</td>"
//                            + "<td style='float: right;' " + (suWinTime == 0 ? " class='faded'" : "") + ">" + (
//                            suWinTime == 0 ?
//                                formatGameTimeMS(suGameTime) :
//                                formatGameTimeMS(suWinTime)
//                            ) + "</td>"
//                            + "<td " + (suWinTime == 0 ? " class='faded'" : "") + ">)</td>";
//                    }
//
//                    if (suWinTime > 0) {
//                        playerTableRowClass = " class='pdRow rowWon'";
//                    } else if (suGameTime > 0) {
//                        playerTableRowClass = " class='pdRow rowPlayed'";
//                    } else {
//                        playerTableRowClass = " class='pdRow'";
//                    }
//                } else {
//                    playerTableRowClass = " class='pdRow'";
//                }

//                playerTableRowClass = " class='pdRow'";

//                playerTotalGameTime += pd.playerTotalGameTime;

                if (pd.playerWinTime > 0) {
                    var playerTableRowClass = " class='pdRow rowWon'";
                    var formatedPlayerGameTime = formatGameTimeMS(pd.playerWinTime);

                    playerTotalWinTime += pd.playerWinTime;
                    playerWinCount++;
                } else {
                    playerTableRowClass = " class='pdRow rowPlayed'";
                    formatedPlayerGameTime = "<span class='pdTotalGameTime'>" + formatGameTimeMS(pd.playerTotalGameTime) + "</span>";
                }

                playerGames +=
                    "<tr" + playerTableRowClass + ">"
                        + "<td style='float: right;'>"
                        + "<span class='actionText' id='pdPlayGame" + gameId + "B'>" + gameId + "</span>"
                        + "</td>"
                        + (that.options.showLabels ? "<td style='color: #777;'>/</td><td style='white-space: nowrap; color: #777;'>" + pd.label + "</td>" : "")
                        + "<td>/</td>"
                        + "<td class='gameTime'>"
                        + formatedPlayerGameTime
                        + "</td>"
                        + "<td width='99%' style='text-align: right !important; padding-right: 20px;'>"
                        + formatDate( playerDetail[i].time)+"</td>"
//                            + suTd
                    + "</tr>"
                    + "<tr class='pdSpacingRow'><td colspan='4'></td></tr>";

                if (pd.userWinTime > 0) {
                    var userTableRowClass = " class='pdRow rowWon'";
                    var formatedUserGameTime = formatGameTimeMS(pd.userWinTime);
                } else if (pd.userTotalGameTime > 0) {
                    userTableRowClass = " class='pdRow rowPlayed'";
                    formatedUserGameTime = "<span class='pdTotalGameTime'>" + formatGameTimeMS(pd.userTotalGameTime) + "</span>";
                } else {
                    userTableRowClass = " class='pdRow rowUnplayed'";
                }

                if (pd.userTotalGameTime > 0) {
                    userGames +=
                        "<tr" + userTableRowClass + ">"
                            + "<td style='float: right;'>"
                            + "<span class='actionText' id='pdPlayGame" + gameId + "'>" + gameId + "</span>"
                            + "</td>"
                            + (that.options.showLabels ? "<td style='color: #777;'>/</td><td style='white-space: nowrap; color: #777;'>" + pd.label + "</td>" : "")
                            + "<td>/</td>"
                            + "<td class='gameTime'>"
                            + formatedUserGameTime
                            + "</td>"
                            + "<td width='99%'>&nbsp;</td>"
                            + "</tr>"
                            + "<tr class='pdSpacingRow'><td colspan='4'></td></tr>";
                } else {
                    userGames +=
                        "<tr" + userTableRowClass + ">"
                            + "<td colspan='4'>—</td>"
                            + "</tr>"
                            + "<tr class='pdSpacingRow'><td colspan='4'></td></tr>";
                }
            }
            playerGames += "</table>";
            userGames += "</table>";

//            alert(playerGames);

//            userGames += "</table>";

//            if (wonGameCount > 0) {
//                var playerAverageWinTime = totalWinTime / wonGameCount;
//            }

            // +++TODO
//            if (playerWinCount > 0) {
//                var playerAverageWinTime = playerTotalWinTime / playerWinCount;
//            } else {
//                playerAverageWinTime = 0;
//            }

            // "<p class='pdAverageWinTime'>Среднее время решения: " + formatGameTimeMS(playerAverageWinTime) + "</p>"

//
            var summary = "<td style='text-align: center' width='50%'>"
                + i18n.get("averageWinTimeLabel") + ": "
                + formatGameTimeMS(playerAverageWinTime)
                + "</td>";
            if (cs.isSuperUser()) {
                summary+= "<td style='text-align: center'>"
                    + i18n.get("totalGameTimeLabel") + ": "
                    + formatLargeGameTime(playerTotalGameTime);
            }
            summary+= "</td>";
//            } else {
//                var summary = "<td style='text-align: center' width='100%'>Среднее время решения: "
//                    + formatGameTimeMS(playerAverageWinTime) + "</td>";
//            }

            playerDetailContents += "<table style='width: 100%; border: 1px #CCC solid; padding-bottom: 10px; padding-top: 10px;'><tr>"
                + summary
                + "</tr></table>";

            if (!self) {
                playerDetailContents += "<table class='standartTable' style='margin-top:10px;' width='100%' border='0' vspace='0' cellspacing='0' hspace='0'><tr>"
                    + "<th width='50%'>" + i18n.format("playerResultHeader", playerUsername) + "</th>"
                    + "<th width='50%'>" + i18n.get("userResultHeader") + "</th>"
                    + "</tr>";

                playerDetailContents += "<tr>"
                    + "<td>" + playerGames + "</td>"
                    + "<td>" + userGames + "</td>"
                    + "</tr>";

                playerDetailContents += "</table>";
            } else {
                playerDetailContents += "<div class='pdSelfHint'>" + i18n.get("selfHistoryHint") + "</div>"
            }

//            alert(playerGames);

            if (playerDetail.length > SHOW_SHORTCUTS_AFTER && !self) {
                playerDetailContents += "<div style='margin-top: 5px;'>";
                playerDetailContents += "<div class='bspAuxBtn' style='float: left;' id='pdScroll" + playerId + "'>[" + i18n.get("auxScrollTop") + "]</div>";
                playerDetailContents += "<div class='bspAuxBtn' style='float: right;' id='pdClose" + playerId + "'>[" + i18n.get("auxClose") + "]</div>";
                playerDetailContents += "<div class='clear'></div>";
                playerDetailContents += "</div>";
            }

            var panel = new BottomSubPanel();
            panel.fillContents(playerDetailContents);
            panel.onClose(function (closeType) {
                if (closeType == HIDE_SINGLE_PANEL) {
                    ui.showPanel({id : "ratingsPanel"});
                    $("html, body").scrollTop($("#ratingsPanel").offset().top - iDiv($("#gameArea").width(), 3));
                }
            });
            panel.onShow(function () {
                $("html, body").animate({scrollTop : $("#" + panel.getId()).offset().top - iDiv($("#gameArea").width(), 3)});
            });

//            panel.renderContents("ratingsContents");
            panel.render();

            if (self) {
                $("#pdShowHistory").click(function () {
                    ui.showHistoryPanel();
                });
            }

            if (playerDetail.length > SHOW_SHORTCUTS_AFTER) {
                $("#pdScroll" + playerId).click(function () {
                    $("html, body").animate({scrollTop : $("#" + panel.getId()).offset().top - iDiv($("#gameArea").width(), 3)});
                });
                $("#pdClose" + playerId).click(function () {
                    ui.hidePanel(panel);
                });
            }

            for (var i = 0; i < playerDetail.length; i++) {
                var _gameId = playerDetail[i].gameId;
                $("#pdPlayGame" + _gameId + ", #pdPlayGame" + _gameId + "B").click(function (_gameId) {
//                    alert(_gameId);
                    return function () {
//                        alert(_gameId);
                        if (data.canPlayGames) {
                            gc.requestGame(_gameId, null, function () {
                                //ui.showGameInfo(_gameId, false);
                                ui.hidePanel()
                            });
                        } else {
                            alert(i18n.get("wrongGameVariationAlert"));
                        }
                    };
                }(_gameId));
            }
            ui.getUserProfile().bindActions(profile);
        });
//    }

//else {
//        $(".rlPlayerDetailContent").hide();
//    }
//    pdRecentFilter = onlySolved;
    }

//    that.clearIdx = 0;
//
//    this.clearRows = function () {
//        $("#rlRow" + that.clearIdx).remove();
//        that.clearIdx++;
//        if (that.clearIdx <= 500) {
//            setTimeout(function () {
//                    that.clearRows()
//                }, 100
//            );
//        }
//    }

    this.bindAll = function () {
        $("#closeRatingsPanel").click(function () {
            ui.hidePanel("ratingsPanel");

//            that.clearIdx = 0;

//            that.clearRows();
        });
    }

    gc = _gc;
    ui = _ui;

    that.gc = gc;
    that.ui = ui;

    if (isDef(_options) && _options != null) {
        mergeObj(options, _options);
    }

    if (!that.gc.getClientServer().isSuperUser()) {
        options.canFilter = false;
    }

    that.options = options;

    this.bindAll();
}

function suFormatTotalGameTime(time) {
    if (time == 0) {
        return "—";
    }

    time = iDiv(time, 1000);

    var sec = time % 60;
    var min = iDiv(time, 60) % 60;
    var hrs = iDiv(time, 3600);
    var days = iDiv(hrs, 24);

    if (days > 0) {
        return days + " " + I18n.get("daysShortSuffix");
    } else if (hrs > 0) {
        return hrs + " " + I18n.get("hoursShortSuffix");
    } else if (min > 0) {
        return min + " " + I18n.get("minutesShortSuffix");
    } else {
        return sec + " " + I18n.get("secondsShortSuffix");
    }
}

function calcPercent(part, total) {
    var percent = iDiv(part * 100, total);
    if (percent == 99 && part % total > 0){
        percent = parseFloat(percent+'.'+(iDiv(part * 1000, total)-percent*10));
    }
    return percent;
}

function formatUsername(username) {
    if (username.length <= MAX_VISIBLE_USERNAME_LENGTH) {
        return username;
    } else {
        return username.substr(0, MAX_VISIBLE_USERNAME_LENGTH - 3) + "...";
    }
}

function renderMenu(menu, separator) {
    var HTML = "";

    var separator = ifDef(separator, "&nbsp;&nbsp;&nbsp;&nbsp;");

    for (var i = 0; i < menu.length; i++) {
        var item = menu[i];

        itemClass = item.isActive ? "disabledText boldText" : "actionText2";

        HTML += "<span class='" + itemClass + "' id='" + item.id + "'>" + item.text + "</span>"
            + (i < menu.length - 1 ? separator : "");
    }

    return HTML;
}

//function convertMonth(month) {
//    switch (month) {
//        case 1:
//            return "января";
//        case 2:
//            return "февраля";
//        case 3:
//            return "марта";
//        case 4:
//            return "апреля";
//        case 5:
//            return "мая";
//        case 6:
//            return "июня";
//        case 7:
//            return "июля";
//        case 8:
//            return "августа";
//        case 9:
//            return "сентября";
//        case 10:
//            return "октября";
//        case 11:
//            return "ноября";
//        case 12:
//            return "декабря";
//        default:
//            return "";
//    }
//}