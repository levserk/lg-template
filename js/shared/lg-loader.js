function Loader(total, loadCount) {
    var that = this;

    this.isSinglePaged = function () {
        return that.count >= that.total;
    }

    this.computeCount = function () {
        /*
         При первом открытии списка нам ещё не известно общее количество позиций, но
         уже нужно передать какое-то значение загрузчику. Логично передать loadCount —
         если общее количество позиций будет меньше — скорректируем после загрузки.
         */
        if (that.total == 0) {
            that.count = that.loadCount;
        } else {
            if (that.count == 0) {
                that.count = that.total;
            } else {
                if (that.count < that.loadCount) {
                    that.count = that.loadCount;
                }

                that.count = Math.min(that.count, that.total);
            }
        }
    }

    this.setTotal = function (total) {
        that.total = total;

        that.computeCount();
    }

    this.reset = function () {
        that.total = 0;
        that.computeCount();
    }

    this.getMoreCount = function () {
        return Math.min(that.loadCount, that.total - that.count);
    }

    this.showMore = function () {
        that.count = that.count + that.loadCount;
        that.computeCount();
        that.notify("countChanged");
    }

    this.showAll = function () {
        that.count = 0;
        that.notify("countChanged");
    }

    multiExtendClass(Paginator, Listener, this);

    that.total = total;
    that.loadCount = loadCount;

    that.computeCount();
}

function LoaderRenderer(loader, moreLabel) {
    var that = this;

    var i18n = new I18n();
    i18n.setContext('loader');

    this.render = function () {
        if (that.loader.isSinglePaged()) {
            return "";
        }

        return "<table border='1' style='margin-top: 10px;' width='100%' class='noBordersTable' id='glShowPanel'>"
            + "<tr>"
            + "<td width='50%'>"
            + "<p class='glShowMore' id='glShowMore'>" + i18n.get("loaderMorePrefix") + " " + loader.getMoreCount() + " " + i18n.get("loaderMoreSuffix", that.options.moreLabel) + "</p>"
            + "</td>"
            + "<td width='50%'>"
            + "<p class='glShowAll' id='glShowAll'>" + i18n.get("loaderShowAll") + "</p>"
            + "</td>"
            + "</tr>"
            + "<tr>"
            + "<td colspan='2' class='glPaginationStats' style='text-align: center !important;'>" + loader.count + " " + i18n.get("loaderOf") + " " + loader.total + "</td>"
            + "</tr>"
            + "</table>";
    }

    this.bindEvents = function () {
        $("#glShowMore").click(function () {
            $("#glShowPanel").empty().append("<p class='giLoadingMore'>" + i18n.get("loadingAlert") + "&nbsp;<img style='margin-bottom:-10px;' src='/img/icons/loading.gif'></p>");
            that.loader.showMore();
        });

        $("#glShowAll").click(function () {
            $("#glShowPanel").empty().append("<p class='giLoadingMore'>" + i18n.get("loadingAlert") + "&nbsp;<img style='margin-bottom:-10px;' src='/img/icons/loading.gif'></p>");
            that.loader.showAll();
//            count = 0;
//            that.loadAndRender(true);
        });
    }

    that.loader = loader;

    that.options = [];
    that.options.moreLabel = moreLabel; //"hands";
}