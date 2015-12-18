function Paginator(total, count, currentPosition) {
    var that = this;

    this.hasNext = function () {
        return that.currentPosition + that.count - 1 < that.total - 1;
    }

    this.next = function () {
        if (that.hasNext()) {
            that.currentPosition += that.count;
            that.computeCount();
            that.notify("currentPositionChanged");
        }
    }

    this.hasPrevious = function () {
        return that.currentPosition > 0;
    }

    this.previous = function () {
        if (that.hasPrevious()) {
            that.currentPosition -= that.count;
            if (that.currentPosition < 0) {
                that.currentPosition = 0;
            }
            that.computeCount();
            that.notify("currentPositionChanged");
        }
    }

    this.showAll = function () {
        that.currentPosition = 0;
        that.currentCount = 0;
        that.notify("currentPositionChanged");
    }

    this.computeCount = function () {
        if (that.total == 0) {
            that.currentCount = that.count;
        } else {
            that.currentCount = Math.min(that.count, that.total - that.currentPosition);
        }
    }

    this.setTotal = function (total) {
        that.total = total;
        that.computeCount();
    }

    this.getPreviousCount = function () {
        return Math.min(that.currentPosition, that.count);
    }

    this.getNextCount = function () {
        return Math.min(that.total - that.currentPosition, that.count);
    }

    this.reset = function () {
        that.total = 0;
        that.currentPosition = 0;
        that.computeCount();
    }

    multiExtendClass(Paginator, Listener, this);

    that.total = total;
    that.count = count;
    that.currentPosition = currentPosition;

    that.computeCount();
}

function PaginatorRenderer(paginator, prefix) {
    var that = this;

    that.paginator = paginator;
    that.prefix = prefix;

    that.prevLinkId = that.prefix + "ShowPrevious";
    that.nextLinkId = that.prefix + "ShowNext";
    that.paginatorId = that.prefix + "Paginator";
    that.paginatorStatsId = that.prefix + "PaginatorStats";

    var i18n = new I18n();
    i18n.setContext('paginator');

    this.render = function () {
        if (!that.paginator.hasNext() && !that.paginator.hasPrevious()) {
            return "";
        }

        var strRange = (that.paginator.currentPosition + 1)
            + " &ndash; "
            + (that.paginator.currentPosition + that.paginator.currentCount);

        return "<table border='1' style='margin-top: 10px;' width='100%' class='noBordersTable' id='" + that.paginatorId + "'>"
            + "<tr>"
            + "<td width='50%'>"
            + (that.paginator.hasPrevious()
            ? "<p class='paginatorNavigation paginatorActiveNavigation' id='" + that.prevLinkId + "'>" + i18n.get("previousPrefix") + " " + that.paginator.getPreviousCount() + "</p>"
            : "<p class='paginatorNavigation paginatorInactiveNavigation'>—</p>")
            + "</td>"
            + "<td width='50%'>"
            + (that.paginator.hasNext()
            ? "<p class='paginatorNavigation paginatorActiveNavigation' id='" + that.nextLinkId + "'>" + i18n.get("nextPrefix") + " " + that.paginator.getNextCount() + "</p>"
            : "<p class='paginatorNavigation paginatorInactiveNavigation'>—</p>")
            + "</td>"
            + "</tr>"
            + "<tr>"
            + "<td colspan='2' class='paginatorStats' id='" + that.paginatorStatsId + "' style='text-align: center !important;'>"
            + strRange + " " + i18n.get("rangeOf") + " " + that.paginator.total
            + "</td>"
            + "</tr>"
            + "</table>";
    }

    this.setLoading = function () {
        $("#" + that.paginatorStatsId).empty().append("<img style='width: 32px;' src='/img/icons/loading.gif' />");
    }

    this.bindEvents = function () {
        $("#" + that.prevLinkId).click(function () {
            that.paginator.previous();
            that.setLoading();
        });

        $("#" + that.nextLinkId).click(function () {
            that.paginator.next();
            that.setLoading();
        });
    }
}