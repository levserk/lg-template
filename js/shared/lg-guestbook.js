function GuestBookRenderer(_gc, _ui, _options) {
    var that = this;

    var gc, ui, cs;

    var options = {
        "suppressScrollTop" : false,
        "gameAreaHeight" : null
    };

    var i18n = new I18n();
    i18n.setContext('guestBook');

    this.run = function () {
        if (!$("#guestBookPanel").is(":visible")) {
            cs = gc.getClientServer();
            ui.setLoading("#gbContents");
            this.loadAndRender(false);
            ui.showPanel({
                id : "guestBookPanel",
                type : BOTTOM_PANEL
            });
        } else {
            ui.hidePanel("guestBookPanel");
        }
    }

    this.loadAndRender = function (repeatLoad) {
        if (repeatLoad) {
            $("#gbLoadingImg").show();
        }
        cs.sendRequest("/gw/guestbook/gbLoadBoard.php", {}, function (result, data) {
            $("#gbLoadingImg").hide();
            if (result) {
                that.render(data);
                if (!repeatLoad) {
                    that.scrollTop();
                }
            }
        });
    }

    this.scrollTop = function () {
        //alert($("#gameArea").width() + " " + ($("#guestBookPanel").offset().top - iDiv($("#gameArea").width(), 3)));
        if (that.options.suppressScrollTop) {
            return;
        }

        var gameAreaHeight;
        if (that.options.gameAreaHeight) {
            gameAreaHeight = that.options.gameAreaHeight;
        } else {
            gameAreaHeight = $("#gameArea").height();
        }

        $("html, body").animate({
            scrollTop : $("#guestBookPanel").offset().top - iDiv(gameAreaHeight, 3)
        }, "normal");
    }

    this.render = function (data) {
        var messages = data.messages;
        var answerMessages = []

        if (messages.length > 0) {
            var messagesHTML = "<table class='smartNoBordersTable' style='width: 100%; padding-top: 25px;'>";
            for (var i in messages) {
                messages[i]._id = messages.length - i;
                if (messages[i].answerId){
                    answerMessages.push(messages[i]);
                } else {
                    messagesHTML += this.renderMessage(messages[i], messages.length - i);
                }
            }

            messagesHTML += "</table>";
        } else {
            messagesHTML = "<div class='gbNoMessagesAlert'>" + i18n.get("noMessagesAlert") + "</div>"
        }

        var suOptions = "";

        if (cs.isSuperUser()) {
            suOptions = "<div style='margin-top: 3px; margin-right: 3px; float: left;'>"
                + "<input type='checkbox' id='gbIsAdminPost'>" + i18n.get("isAdminPostLabel") + "</a>"
                + "</div>";
        }

        var postMessageHTML = "<textarea id='gbPostText' class='gbPostTextArea' rows='3'></textarea>"
            + "<img src='/img/icons/loading.gif' id='gbPostLoadingIcon' alt='" + i18n.get("postLoadingAltText") + "'/>"
            + suOptions
            + "<div id='gbPostBtn' class='constantWidthBtn'>" + i18n.get("postButtonLabel") + "</div>"
            + "<div class='clear'></div>";

        var guestBookHTML = "<h4>" + i18n.get("header") + "</h4>"
            + postMessageHTML + messagesHTML;

        $("#gbContents").empty().append(guestBookHTML);
        that.renderAnswerMessages(answerMessages);

        that.bind();

        if (cs.isSuperUser()) {
            that.bindAdminEditables(messages);
        }
    }

    this.renderAnswerMessages = function(messages){
        var answer, $div, $td, msgText;
        for (var i = messages.length-1; i >= 0; i--){
            answer = messages[i];
            $td = $($('.smartNoBordersTable tr[data-id='+answer.answerId+'] td')[0]);
            msgText = answer.text.replace(/\n/gi, "<br />");
            msgText = "<span class='gbUsername'>" + answer.username + "</span>"
                    + "&nbsp;&nbsp;&nbsp;&nbsp;"
                    + "<div class='gbAnswerText "
                    + "' id='gbMsgTextTd"+answer.msgId+"'><div>"
                    + answer.text.replace(/\n/gi, "<br />") + "</div>"
                    + "</div>";

            $div = $('<div>').html(msgText).addClass('gbAnswerMessage '+ (answer.byAdmin?"gbAdminMsg":""));

            $td.append($div);
            $('.gbAnswerButton[data-id='+answer.answerId+']').hide();
        }
    }

    this.addAnswerBlock = function(e) {
        var id = $(e.target).attr('data-id');
        $('.gbPostAnswer').remove();
        var suOptions = '';
        if (cs.isSuperUser()) {
            suOptions = "<div style='margin-top: 3px; margin-right: 3px; float: left;'>"
            + "<input type='checkbox' id='gbIsAdminAnswer' checked>" + i18n.get("isAdminPostLabel") + "</a>"
            + "</div>";
        }
        var postMessageHTML = "<textarea id='gbPostAnswerText' class='gbPostTextArea' rows='3'></textarea>"
            + "<img src='/img/icons/loading.gif' id='gbPostLoadingIcon' alt='" + i18n.get("postLoadingAltText") + "'/>"
            + suOptions
            + "<div id='gbPostAnswerBtn' class='constantWidthBtn'>" + i18n.get("postButtonLabel") + "</div>"
            + "<div class='clear'></div>";
        var $div = $('<div>');
        $div.addClass('gbPostAnswer');
        $div.html(postMessageHTML);
        var $td = $($('.smartNoBordersTable tr[data-id='+id+'] td')[0]);
        $td.append($div);

        $('#gbPostAnswerBtn').click(function(){
            var text = $.trim($("#gbPostAnswerText").val());

            if (text.length != 0) {
                cs.sendRequest("/gw/guestbook/gbPostMessage.php",
                    {
                        text : text,
                        answerId: id,
                        isAdminPost : bool2Int($("#gbIsAdminAnswer").is(":checked"))
                    }, function (result, data) {
                        $("#gbPostLoadingIcon").hide();
                        if (result) {
                            that.render(data);
                        }
                    });
                $('.gbPostAnswer').remove();
                $("#gbPostLoadingIcon").show();
            }
        });
        console.log($(e.target).attr('data-id'));
    }

    this.bindAdminEditables = function (messages) {
        for (var i in messages) {
            var msg = messages[i];
            var msgId = msg.msgId;

            //if (msg.byAdmin) {
            $("#gbMsgTextTd" + msgId).dblclick(function (msg) {
                return function () {
                    that.makeMessageEditable(msg);
                }
            }(msg));
            //}
        }
    }

    this.makeMessageEditable = function (msg) {
        var editAreaHTML = "<textarea style='width: 100%' rows='5' id='gbEditAreaText" + msg.msgId + "'>"
            + msg.text
            + "</textarea>"
            + "<br/>"
            + "<input type='submit' value='" + i18n.get("saveChangesButtonLabel") + "' id='gbEditAreaSave" + msg.msgId + "'></input>"
            + "<input type='submit' value='" + "Удалить" + "' id='gbEditAreaDelete" + msg.msgId + "'></input>"
            + "<input type='submit' style='float: right;' value='" + "Отмена" + "' id='gbEditAreaCancel" + msg.msgId + "'></input>";

        $("#gbMsgTextTd" + msg.msgId).empty().append(editAreaHTML);

        $("#gbEditAreaSave" + msg.msgId).click(function () {
            var newText = $("#gbEditAreaText" + msg.msgId).val();

            cs.sendRequest("/gw/guestbook/gbEditMessage.php", {
                msgId : msg.msgId,
                newText : newText
            }, function (result, data) {
                if (result) {
                    that.render(data);
                }
            });
        });

        $("#gbEditAreaDelete" + msg.msgId).click(function () {
            if (confirm("Удалить сообщение ==" + msg.text + "== от " + msg.username + "?")) {
                cs.sendRequest("/gw/guestbook/gbDeleteMessage.php", {
                    msgId : msg.msgId
                }, function (result, data) {
                    if (result) {
                        that.render(data);
                    }
                });
            }
        });

        $("#gbEditAreaCancel" + msg.msgId).click(function () {
            that.loadAndRender(true);
        });
    }

    this.bind = function () {
        $("#gbPostBtn").click(function () {
            that.postMessage();
        });

        $('.gbAnswerButton').click(that.addAnswerBlock);
    }

    that.postMessage = function () {
        var text = $.trim($("#gbPostText").val());

        if (text.length == 0) {
            alert(i18n.get("emptyMsgAlert"));
        } else {
            $("#gbPostLoadingIcon").show();
            cs.sendRequest("/gw/guestbook/gbPostMessage.php",
                {
                    text : text,
                    isAdminPost : bool2Int($("#gbIsAdminPost").is(":checked"))
                }, function (result, data) {
                    $("#gbPostLoadingIcon").hide();
                    if (result) {
                        that.render(data);
                        that.scrollTop();
                    }
                });
        }
    }

    this.renderMessage = function (msg) {
        var id = msg.msgId;
        var replyDiv = "";
        if (msg.replyTS > 0) {
            replyDiv = "<div class='gbReplyText gbAdminMsg'>"
                + "<b>" + i18n.get("adminUsername") + ": </b>"
                + msg.replyText
                + "</div>";
        }

        var msgText = msg.text.replace(/\n/gi, "<br />");
        msgText = "<div class='gbMessageText "+ (msg.byAdmin ? "gbAdminMsg" : "")
        + "' id='gbMsgTextTd" + msg.msgId + "'> <div>" + msgText + "</div>"
        +  (cs.isSuperUser()?"<span class='gbAnswerButton' data-id='"+ msg.msgId +"'>Ответить</span>":"")
        + "</div>" ;

        var msgHTML = "<tr>"
            + "<td class='gbUsernameDateTd'>"
            + "<span class='gbUsername'>" + msg.username + "</span>"
            + "&nbsp;&nbsp;&nbsp;&nbsp;"
            + "<span class='gbDate'>" + formatDateRu(msg.timestamp) + "</span>"
            + '<span class="gbMessageNumber">#'+msg._id+'</span>'
            + "</td>"
            + "</tr>"
            + "<tr data-id='"+ msg.msgId +"'>"
            + "<td class='gbMsgTextTd' >" + msgText + replyDiv
            + "</td>"
            + "<td style='position: relative'></td>"
            + "</tr>";

        return msgHTML;
    }

    this.bindAll = function () {
//        alert($("#gbShow").is(":visible"));

        $("#gbShow").click(function () {
            that.run();
        });

        ui.bindCloseIcon("#gbCloseIcon", "guestBookPanel");
    }

    gc = _gc;
    ui = _ui;

    if (isDef(_options) && _options != null) {
        mergeObj(options, _options);
    }

    that.options = options;

    this.bindAll();
}