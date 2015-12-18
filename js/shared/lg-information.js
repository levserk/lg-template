var X_MARGINS = 40;

function InformationReneder(gc, ui, options) {
    var that = this;

    that.options = {
        widthElement : "gameArea"
    };

    this.run = function () {
        $("#informationMain").width($("#" + that.options.widthElement).width() + X_MARGINS);
        $("#fullShadow").css("height", $(document).height());
        $("#fullShadow").show();
        $("#informationBubble").fadeIn("fast", function() {
            $("#fullShadow").css("height", $(document).height());
        });
        $("html, body").animate({ scrollTop : 0 }, "fast");
    }

    this.hide = function() {
        $("#informationBubble").hide();
        $("#fullShadow").hide();
    }

    this.escKeyDown = function () {
        that.hide();
    }

    this.bindAll = function () {
        $("#title").click(function () {
            that.run();
        });

        $("#showDescription").click(function () {
            that.run();
        });

        $("#closeInformationBubble").click(function () {
            that.hide();
        });

        that.gc.addListener(that);
    }

    that.gc = gc;
    that.ui = ui;

    if (isDef(options) && options != null) {
        mergeObj(that.options, options);
    }

    that.bindAll();
}