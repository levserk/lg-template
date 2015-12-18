function TableDataRenderer(sortBy, order, options) {
    var that = this;

    that.columns = [];
    that.sortBy = sortBy;
    that.order = order;

    that.options = {};

    if (isDef(options) && options != null) {
        mergeObj(that.options, options);
    }

    this.fillDefault = function (column, property, defaultValue) {
        if (!isDef(column[property])) {
            column[property] = defaultValue;
        }
    }

    this.addColumn = function (column) {
        that.fillDefault(column, "enableSort", false);
        that.fillDefault(column, "onlyDefaultOrder", false);
        that.fillDefault(column, "showOrderHint", true);
        that.fillDefault(column, "hasRightBorder", true);
        that.fillDefault(column, "insertSeparatorAfter", false);
        that.fillDefault(column, "colspan", 1);
        that.fillDefault(column, "customSortImgTdFunc", null);
        that.fillDefault(column, "hint", null);

        that.columns.push(column);
    }

//    tdr.addColumn({
//        title : "%",
//        headerId : "rlSortBySolvedRatio",
//        enableSort : true,
//        sortBy : RL_SORT_BY_SOLVED_RATIO,
//        defaultOrder : false,
//        onlyDefaultOrder : false,
//        showOrderHint : true,
//        hasRightBorder : true
//    });

    this.bindHeaderAction = function (model, column) {
        if (!column.enableSort || column.enableSort && column.onlyDefaultOrder && column.sortBy == that.sortBy) {
            return;
        }

        var jCombinedId = "#" + column.headerId + ", #" + column.headerId + "Img";

        $(jCombinedId).click(function () {
            if (that.sortBy != column.sortBy || column.onlyDefaultOrder) {
                model.setSort(column.sortBy, column.defaultOrder);
            } else {
                model.setSort(that.sortBy, !that.order);
            }
            model.loadAndRender(true);
        });

        if (column.hint) {
            $("#" + column.headerId).mouseenter(function () {
                uiShowHint("#" + column.headerId, column.hint);
            });
            $("#" + column.headerId + "Img").mouseenter(function () {
                uiShowHint("#" + column.headerId + "Img", column.hint);
            });
            $(jCombinedId).mouseleave(function () {
                uiHideHint();
            });
        }
    }

    this.bindHeaderActions = function (model) {
        for (var i in that.columns) {
            var column = that.columns[i];

            that.bindHeaderAction(model, column);
        }
    }

    this.renderOrderHint = function (order) {
//        if (order) {
//            return "<br /><span style='font-size: 6pt;'> (по возр.)</span>";
//        } else {
//            return "<br /><span style='font-size: 6pt;'> (по убыв.)</span>";
//        }
        return uiGetOrderHint(order);
    }

    this.renderColumnHeader = function (column) {
        var colspanString = (column.colspan > 1) ? ("colspan='" + column.colspan + "' ") : "";
        var background = (column.enableSort && that.sortBy == column.sortBy)?'style="background-color: rgb(252, 252, 216);"':'';

        if (!column.hasRightBorder) {
            var columnHeader = "<th " + colspanString + "class='" + that.options.thClass + " noRightBorder";
        } else {
            columnHeader = "<th " + colspanString + " class='" + that.options.thClass;
        }
        columnHeader+="' "+background+" >";

        if (column.enableSort && that.sortBy == column.sortBy) {
            var cssClass = "activeSortHeader ";
        } else {
            cssClass = "";
        }

        if (!column.onlyDefaultOrder || column.onlyDefaultOrder && that.sortBy != column.sortBy) {
            cssClass += "actionText3";
        } else {
            cssClass += "simpleText";
        }

        if (column.enableSort) {
            columnHeader += "<span class='" + cssClass + "'"
                + " id='" + column.headerId + "'"
                + ">"
                + column.title
                + (column.showOrderHint && that.sortBy == column.sortBy ? that.renderOrderHint(that.order) : "")
                + "</span>";
        } else {
            columnHeader += "<span class='simpleText'>" + column.title + "</span>";
        }

        columnHeader += "</th>";

        if (column.insertSeparatorAfter) {
            columnHeader += "<th class='" + that.options.thClass + " noRightBorder'>&nbsp;</th>";
        }

        return columnHeader;
    }

    this.serverSortArrowsImg = function (order, style, imageId) {
        var style = isDef(style) && style != "" ? " style='" + style + "' " : "";
        var imageId = isDef(imageId) ? " id='" + imageId + "' " : "";
        return (order ? " &nbsp;<img " + style + imageId + "src='/img/icons/sort-asc.png' alt=''/>" : " &nbsp;<img " + style + imageId + "src='/img/icons/sort-desc.png' alt=''/>");
    }

    this.generateSortImg = function (id, columnSortBy) {
        return (that.sortBy == columnSortBy ?
            that.serverSortArrowsImg(that.order, "", id) :
            " &nbsp;<img src='/img/icons/sort-both.png' id='" + id + "' alt=''/>");
    }

    this.renderColumnSortImgTd = function (column, id) {
        if (column.customSortImgTdFunc) {
            return column.customSortImgTdFunc(column);
        }

        var colspanString = (column.colspan > 1) ? ("colspan='" + column.colspan + "' ") : "";

        var showSortControls = column.enableSort && (!column.onlyDefaultOrder || column.onlyDefaultOrder && that.sortBy != column.sortBy);

        var cssClass = showSortControls ? "rlArrows" : "noArrows";

        var background = (column.enableSort && that.sortBy == column.sortBy)?' background-color: rgb(252, 252, 216); ':'';

        if (!column.hasRightBorder) {
            var columnSortImgTd = "<td " + colspanString + "class='" + cssClass + " noRightBorder' style='text-align: center; ";
        } else {
            columnSortImgTd = "<td " + colspanString + " class='" + cssClass + "' style='text-align: center; ";
        }
        columnSortImgTd+=background+"'>";

        if (showSortControls) {
            columnSortImgTd += that.generateSortImg(column.headerId + "Img", column.sortBy);
        } else {
            columnSortImgTd += "&nbsp;";
        }

        columnSortImgTd += "</td>";

        if (column.insertSeparatorAfter) {
            columnSortImgTd += "<td class='noArrows noRightBorder'>&nbsp;</td>";
        }

        return columnSortImgTd;
    }

    this.renderTableHeader = function () {
        var tableHeader = "";

        for (var i in that.columns) {
            var column = that.columns[i];

            tableHeader += that.renderColumnHeader(column);
        }

        return tableHeader;
    }

    this.renderTableSortTrContents = function () {
        var sortTrContents = "";

        for (var i in that.columns) {
            var column = that.columns[i];

            sortTrContents += that.renderColumnSortImgTd(column, i);
        }

        return sortTrContents;
    }
}
