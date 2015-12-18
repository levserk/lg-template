function trimMsg(text) {
    text = text.replace(/\n/gi, " ");
    if (text.length > 55) {
        return text.substr(0, 50) + "...";
    } else {
        return text;
    }
}

var INBOX = 0;
var OUTBOX = 1;

var SHOW_MAIN_TAB = 0;
var SHOW_SUBTAB = 1;

function PlayerProfile(_gc, _ui) {
    var that = this;
    var unreadMessagesCount = 0;
    var loaded = false;

    var jLoadingIcon = null;

    var preuploaded = false;

    var gc, ui, cs;

    var i18n = new I18n();
    i18n.setContext('profile');

    this.setUnreadMsgCount = function (count) {
        unreadMessagesCount = count;
    }

    this.getUnreadMsgCount = function () {
        return unreadMessagesCount;
    }

    this.run = function () {
        if (gc.getClientServer().isGuest()) {
            return;
        }

        if (!$("#profilePanel").is(":visible")) {
            if (that.getUnreadMsgCount() == 0) {
                that.show();
            } else {
                that.showInbox();
            }
        } else {
            ui.hidePanel("profilePanel");
        }
    }

    this.show = function () {
        that.setLoading(SHOW_MAIN_TAB);

        cs.loadProfile(null, function (result, profile) {
            $("#profilePIStatic").empty().append(PlayerProfile.renderProfilePI(profile, false));
            $("#profilePIStaticLayout").show();
            $("#profileEditBtn").show();
            $("#profilePIEditable").hide();

            preuploaded = false;

            $("#profileSubTab").hide();
            $("#profileSubTab").empty();
            $("#profileMainTab").show();

            loaded = true;

            jLoadingIcon = $("#profileLoadingIcon");
            $("#profileLoadingIcon").hide();

            if (result && profile != null) {
                $("#profileWhere").val(profile.fromwhere);
                $("#profileLink").val(profile.link);
                $("#profileMail").val(profile.mail);
                $("#profileAbout").val(profile.about);
                $("#profileBirthDay").val(profile.birthDay);
                $("#profileBirthMonth").val(profile.birthMonth);
                $("#profileBirthYear").val(profile.birthYear);

                if (profile.photoThumb != null) {
                    $("#profilePhotoFrame").css("border", "none");
                    $("#profilePhotoFrame").empty().append(
                        "<img class='profilePhoto'"
                            + "src='" + profile.photoThumb + "'/>");
                } else {
                    $("#profilePhotoFrame").css("border", "1px solid #CCC");
                    $("#profilePhotoFrame").empty().append(
                        "<img class='profilePhoto'"
                            + "src='/images/nophoto-" + I18n.get("locale") + ".png'/>");
                }

                $("#profileSideActivity").empty();

                if (false && profile.sideActivity != null && cs.isSuperUser()) {
                    var sideActivityListHTML = "";

                    for (var i in profile.sideActivity) {
                        var entity = profile.sideActivity[i];

                        sideActivityListHTML +=
                            "<li>" + formatTime(entity.timestamp, {separator : "", clarify : true}) + ", " + formatGame(entity.gameVariationId) + "</li>";
                    }

                    var sideActivity = "<div id='profileSideActivity'>"
                        + "<h4 class='profileH4'>" + i18n.get("sideActivityHeader") + ":</h4>"
                        + "<ol style='line-height: 25px;'>"
                        + sideActivityListHTML
                        + "</ol>"
                        + "</div>";
                }

                $("#profileSideActivity").append(sideActivity);
            } else {
                $("#profileWhere").val("");
                $("#profileLink").val("");
                $("#profileMail").val("");
                $("#profileAbout").val("");
                $("#profileBirthDay").val(0);
                $("#profileBirthMonth").val(0);
                $("#profileBirthYear").val(0);

                $("#profilePhotoFrame").css("border", "1px solid #CCC");
                $("#profilePhotoFrame").empty().append(
                    "<img class='profilePhotoFrame'"
                        + "src='/images/nophoto-" + I18n.get("locale") + ".png'/>");

                $("#profileSideActivity").empty();
            }

            $("#profileGoInvisible").attr("checked", !!profile.isInvisible);

            $("#profileLoading").hide();

            if (profile.unreadMsgCount > 0) {
                that.updateUnreadMsgCount(profile.unreadMsgCount);
            }

            $("#profileContents").show();
            $("html, body").scrollTop($("#profilePanel").offset().top);
        });
    }

    this.save = function () {
        $('#profileMail').val($.trim($('#profileMail').val()));
        if (!$('#profileMail').val()=='' && !validateMail($('#profileMail').val())){
            alert('Адрес почты не содержит точку или @');
            return;
        }
        $("#profileLoadingImg").show();

        cs.updateProfile(function (result, response) {
            $("#profileLoadingImg").hide();
            if (result) {
                if (!preuploaded && response.thumbFilename != null) {
                    $("#profilePhotoFrame").css("border", "none");
                    $("#profilePhotoFrame").empty().append(
                        "<img class='profilePhoto'"
                            + "src='" + response.thumbFilename + "'/>");
                }

                $("#profilePhotoField").val("");

                if (isDef(response.profile)) {
                    $("#profilePIStatic").empty().append(PlayerProfile.renderProfilePI(response.profile, false));
                }

                $("#profilePIEditable").hide();
                $("#profilePIStaticLayout").show();
                $("#profileEditBtn").show();
            }
        });
    }

    this.setLoading = function (showWhat) {
        if ($("#profilePanel").is(":visible")) {
            if (jLoadingIcon != null) {
                jLoadingIcon.show();
            }
        } else {
            $("#profileUsername").empty().append(cs.getUsername());
            $("#profileLoading").show();
            $("#profileContents").hide();
            $("#profileUnreadMsgAlert").hide();

            ui.showPanel({id : "profilePanel"});
            $("html, body").scrollTop($("#profilePanel").offset().top);
        }
    }

    this.showInbox = function () {
        that.setLoading(SHOW_SUBTAB);

        cs.loadConversations(function (result, conversations) {
            var messagesContent = "<div class='pmCP'>";
            messagesContent += "<h4 class='pmShowInbox nonSelectable' id='pmShowInbox'>" + i18n.get("inboxHeader") + "</h4>";
            //messagesContent += "<h4 class='pmShowOutbox activeOption nonSelectable' id='pmSendMsg'>" + i18n.get("sendMsgMenuAction") + "</h4>";
            messagesContent += "</div>";

            messagesContent += "<img src='/img/icons/loading.gif' class='profileLoadingIcon' id='pmInboxLoadingIcon' />";

            messagesContent += "<div class='clear'></div>";

            if (conversations.length == 0) {
                messagesContent += "<p style='padding-left: 10px;'>" + i18n.get("noDialogsAlert") + "</p>";
            } else {
                messagesContent += "<table class='standartTable' width='100%' style='margin-top: 12px;'>";
                messagesContent += "<tr>"
                    + "<th width='10%'>" + i18n.get("opponentLabel") + "</th>"
                    + "<th>" + i18n.get("msgTextLabel") + "</th>"
                    + "<th width='10%'>" + i18n.get("sentDateTimeLabel") + "</th>"
                    + "</tr>";
                for (var i in conversations) {
                    var conversation = conversations[i];
                    var trStyle = (!conversation.hasNewMessages ? "" : "font-weight: bold;");
                    var ownMessage = conversation.ownMessage ? " ownMessage" : "";
                    messagesContent += "<tr id='conversation" + conversation.opponent + "' style='" + trStyle + "'>"
                        + "<td style='text-align: center;' class='pmSenderNameTd'><p class='pmSenderName'>" + conversation.opponentName + "</p></td>"
                        + "<td><p class='msgShort" + ownMessage + "'>" + trimMsg(conversation.msg) + "</p></td>"
                        + "<td style='text-align: center; white-space: nowrap;'>" + formatTime(conversation.timestamp, {putTimeInBrackets : true}) + "</td>"
                        + "</tr>";
                }
                messagesContent += "</table>";
            }

            var inboxPanel = new BottomSubPanel();
            inboxPanel.fillContents(messagesContent);
            inboxPanel.onClose(function () {
//                if (loaded) {
//                    $("#profileMainTab").show();
//                    $("#profileSubTab").hide();
//                    $("html, body").scrollTop($("#profilePanel").offset().top - iDiv($("#gameArea").width(), 3));
//                } else {
                that.show();
//                }
            });
            inboxPanel.renderContents("profileSubTab");
            $("#profileMainTab").hide();
            $("html, body").scrollTop($("#profilePanel").offset().top - iDiv($("#gameArea").width(), 3));
            jLoadingIcon = $("#pmInboxLoadingIcon");

            $("#pmSendMsg").click(function () {
                that.showSendMsg();
            });

            if (conversations.length > 0) {
                for (var i in conversations) {
                    var msg = conversations[i];
                    $("#conversation" + msg.opponent).click(function (msg) {
                        return function () {
                            that.setLoading(SHOW_SUBTAB);

                            cs.loadConversation(msg.opponent, function (result, response) {
                                that.updateUnreadMsgCount(response.unreadMsgCount);
                                that.renderConversation(msg.opponent, msg.opponentName, response.conversation, function () {
                                    that.showInbox();
                                });
                            });
                        }
                    }(msg));
                }
            }
        });
    }

    this.openAdminDialog = function(){
        cs.loadConversation(-1, function (result, response) {
            that.updateUnreadMsgCount(response.unreadMsgCount);
            that.renderConversation(-1, "Админ", response.conversation, function () {
                that.showInbox();
            }, true);
        });
    }

    this.renderConversation = function (opponent, opponentName, conversation, onClose, fReplyActive) {
        var conversationText;

        conversationText = "<table class='pmDlgLayout'>";
        for (var i = conversation.length - 1; i >= 0; i--) {
            var msg = conversation[i];
            conversationText += "<tr>"
                + "<td>"
                + "<p class='pmDlgSender'>" + msg.senderName + "</p>"
                + "<p class='pmDlgText'>" + msg.msg.replace(/\n/gi, "<br />") + "</p>"
                + "</td>"
                + "<td class='pmDlgSendDate'>" + formatDate(msg.sentTS) + "</td>"
                + "</tr>";
        }
        conversationText += "</table>";

        var msgPanel = new BottomSubPanel();
        var msgContents = "<h4 style='float: left;'>" + i18n.get("conversationWithPrefix") + " " + opponentName + "</h4>";
        msgContents += "<img src='/img/icons/loading.gif' class='profileLoadingIcon' id='pmMsgLoadingIcon' />";
        msgContents += "<div class='clear'></div>";

        msgContents += "<div class='msgText' id='msgText'><div class='msgPadding'>"
            + conversationText
            + "</div></div>";
        msgContents += "<div class='clear'></div>";

        msgContents += "<div class='pdSendMsgPanel' id='replyToPanel'>"
            + "<div class='pdSendMsgPanelPadding'>"
            + "<h4>" + i18n.get("msgRecipientPrefix") + " &laquo;" + opponentName + "&raquo;</h4>"
            + "<textarea id='replyText' style='width: 100%'></textarea>"
            + "<div class='constantWidthBtn nonSelectable pdSendMsgBtn' id='sendReplyBtn'>" + i18n.get("sendReplyButtonLabel") + "</div>"
            + "<div class='clear'></div>"
            + "</div></div>"

        msgPanel.fillContents(msgContents);
        msgPanel.onClose(onClose);
        msgPanel.renderContents("profileSubTab");
        $("#profileMainTab").hide();
        jLoadingIcon = $("#pmMsgLoadingIcon");

        $("html, body").scrollTop($("#profileSubTab").offset().top + $("#profileSubTab").height());

        $("#replyToBtn").click(function () {
            $("#replyToBtn").hide();
            $("#replyToPanel").show();
            $("html, body").scrollTop($("#replyToPanel").offset().top);
            $("#replyText").focus();
        });

        $("#sendReplyBtn").click(function () {
            var text = $("#replyText").val();
            if (text.length > 0) {
                cs.sendMessage(opponent, text, 0, 0, function (result) {
                    onClose();
                })
            } else {
                alert(i18n.get("emptyMsgAlert"));
            }
        });

        if (fReplyActive){
            $("#replyToBtn").hide();
            $("#replyToPanel").show();
            $("html, body").scrollTop($("#replyToPanel").offset().top);
            $("#replyText").focus();
        }
    }

    this.showSendMsg = function () {
        that.setLoading(SHOW_SUBTAB);

        var subPanel = new BottomSubPanel();
        var contents = "<h4 style='float: left;'>" + i18n.get("sendPMHeader") + "</h4>";
        contents += "<img src='/img/icons/loading.gif' class='profileLoadingIcon' id='pmSubPanelLoadingIcon' />";
        contents += "<div class='clear'></div>";
        contents += "<div style='margin-right: 4px;'>";
        contents += "<textarea id='msgText' style='width: 100%; margin-top: 10px;'></textarea>";
        contents += "</div>";
        contents += "<div class='constantWidthBtn nonSelectable profileActionBtn' id='chooseRecipientsBtn'>"
            + i18n.get("selectRecipientsButtonLabel")
            + "</div>"
        contents += "<div style='border: 1px dashed #CCC' id='pmRecipientList'></div>";
        contents += "<div class='constantWidthBtn nonSelectable profileActionBtn' id='pmSendMsgBtn'>"
            + i18n.get("sendMsgButtonLabel")
            + "</div>"
        contents += "<div class='clear'></div>";

        subPanel.fillContents(contents);
        subPanel.onClose(function () {
            that.showInbox();
        });
        subPanel.renderContents("profileSubTab");

        $("#profileMainTab").hide();
        jLoadingIcon = $("#pmSubPanelLoadingIcon");

        $("#chooseRecipientsBtn").click(function () {
            $("#pmSubPanelLoadingIcon").show();
            cs.loadRecipients(function (result, recipients) {
                if (result) {
                    $("#pmSubPanelLoadingIcon").hide();
                    $("#chooseRecipientsBtn").hide();
                    for (var i in recipients) {
                        var rcp = recipients[i];
                        $("#pmRecipientList").append("<div style='width: 25%; display: inline-block;'>"
                            + "<input class='pmRcpCheckBox' type='checkbox' value='" + rcp.playerId + "'>" + rcp.username
                            + "</div>");
                    }
                    $("#pmRecipientList").show();
                    $("#pmSendMsgBtn").show();
                    $("html, body").scrollTop($("#pmRecipientList").offset().top);
                }
            });
        });

        $("#pmSendMsgBtn").click(function () {
            var recipientList = [];
            $('.pmRcpCheckBox').each(function () {
                if (this.checked) {
                    recipientList.push(parseInt(this.value));
                }
            });
            var text = $("#msgText").val();
            if ($.trim(text).length == 0) {
                alert(i18n.get("emptyMsgAlert"));
            } else if (recipientList.length == 0) {
                alert(i18n.get("noRecipientAlert"));
            } else {
                $("#pmSubPanelLoadingIcon").show();
                cs.sendMassMsg(text, recipientList, function (result) {
                    that.showInbox();
                })
            }
        });
    }

    this.bindAll = function () {
        $("#bbProfile").click(function () {
            that.run();
        });

        $("#profileLogoutBtn").click(function () {
            setCookie("vk_app_3960668", " ", new Date(0), '/', '.logic-games.spb.ru');
            gc.logout();
        });

        $("#profileCloseImg").click(function () {
            ui.hidePanel("profilePanel");
        });

        $("#profileEditBtn").click(function () {
            $("#profilePIStaticLayout").hide();
            $("#profilePIEditable").show();
        });

        $("#profilePhotoField").change(function (evt) {
            var files = evt.target.files; // FileList object

            // Loop through the FileList and render image files as thumbnails.
            for (var i = 0, f; f = files[i]; i++) {

                // Only process image files.
                if (!f.type.match('image.*')) {
                    continue;
                }
                that.preuploadPhoto(f);
            }

        });

        $("#profileSaveBtn").click(function () {
            that.save();
        });

        $("#profileDiscardChangesBtn").click(function () {
            that.show();
        });

        $("#profileReadMsgBtn, #profileGoToInbox").click(function () {
            that.showInbox();
        });

        $("#sendToAdmin").click(function(){
            that.openAdminDialog();
        });

        $("#changePassword").click(function(){
            $('#cpOldPassword').val("");
            $('#cpNewPassword1').val("");
            $('#cpNewPassword2').val("");
            ui.showPanel({id : "changePassPanel",type : OVER_FIELD_PANEL});
        });

        $('#cpCancel, #cpCloseIcon').click(function(){
            that.run();
        });
        $('#cpCommit').click(
            function(){
                that.changePassword();
         });

        $("#profileGoInvisible").click(function () {
            var isInvisible = $("#profileGoInvisible").is(":checked");

            $("#profileGoInvisible").attr("disabled", "disabled");
            $("#profileGoInvisibleLoadingImg").show();

            cs.updateUserSettings({
                isInvisible : isInvisible
            }, function (result) {
                $("#profileGoInvisible").removeAttr("disabled");
                $("#profileGoInvisibleLoadingImg").hide();
            });
        });

        $('#shareBtn').click(function(){
            if ($('.share42init').css('display')=='block')
                $('.share42init').hide();
            else $('.share42init').show();
        });
    }

    this.preuploadPhoto = function (f) {

        var reader = new FileReader();

        reader.onload = (function (theFile) {
            return function (e) {
                $("#profilePhotoFrame").css("border", "none");
                $("#profilePhotoFrame").empty().append(
                    "<img class='profilePhoto'"
                    + "src='" + e.target.result + "'/>");
                preuploaded = true;
            };
        })(f);


        reader.readAsDataURL(f);

    }

    this.bindActions = function (profile) {
        $("#sendMsg" + profile.playerId).click(function () {
//            $("#sendMsg" + profile.playerId).hide();
            $("#pdSendMsgResult" + profile.playerId).hide();
            $("#pdSendMsgPanel" + profile.playerId).toggle("fast");
        });

        $("#pdSendMsgBtn" + profile.playerId).click(function () {
            var msg = $("#pdMsg" + profile.playerId).val();
            if (msg != "") {
                var fromAdmin = (cs.isSuperUser()&&$("#pdFromAdmin").is(':checked'))?1:0;
                cs.sendMessage(profile.playerId, msg, 0,fromAdmin, function (result) {
                    if (result) {
                        ;
                    }
                    $("#pdSendMsgResult" + profile.playerId).empty().append(i18n.get("msgSentSuccessfullyAlert"));
                    $("#pdSendMsgResult" + profile.playerId).show();
                    $("#pdSendMsgResult" + profile.playerId).delay(2000).fadeOut();
                    $("#pdSendMsgPanel" + profile.playerId).hide();
                    $("#pdMsg" + profile.playerId).val("");
                    $("#sendMsg" + profile.playerId).show();
                });
            }
            $("#pdMsg" + profile.playerId).val("");
        });
    }

    this.updateUnreadMsgCount = function (unreadMsgCount) {
        that.setUnreadMsgCount(unreadMsgCount);
        if (cs.isLogged() && unreadMsgCount > 0) {
            $("#bbProfileLabel").hide();
            $("#bbUnreadMsgCount").empty().append(i18n.get("newMessagesLabel") + ": " + unreadMsgCount);
            $("#profileReadMsgBtn").empty().append(i18n.get("newMessagesLabel") + ": " + unreadMsgCount);
            $("#profileGoToInbox").hide();
            $("#profileUnreadMsgAlert").show();
            if (unreadMsgCount >= 10) {
                $("#bbUnreadMsgCount").css("font-size", "7pt");
            } else {
                $("#bbUnreadMsgCount").css("font-size", "8pt");
            }
        } else {
            $("#profileGoToInbox").show();
            $("#bbProfileLabel").show();
            $("#bbUnreadMsgCount").empty();
            $("#profileUnreadMsgAlert").hide();
        }
    }

    this.renderProfile = function (profile) {
        return PlayerProfile.renderProfile(profile, gc.getClientServer().isGuest());
    }

    this.changePassword = function(){
        var cs = gc.getClientServer();
        var oldp = $.trim($('#cpOldPassword').val());
        var newp1 = $.trim($('#cpNewPassword1').val());
        var newp2 = $.trim($('#cpNewPassword2').val());
        var msg = null;
        if (!oldp || !newp1 || !newp2)msg = "Заполните все поля";
        else {
            if (newp1 == oldp) msg = "Старый и новый пароль совпадают!";
            if (newp1.length > 0 && newp1.length < 5) {
                msg = "Минимальная длина 5 символов.";
            } else if (newp1.length > 25) {
                msg = "Максимальная длина 25 символов.";
            } else if (newp1 != newp2) msg = "Введённые пароли не совпадают";
        }
        if (msg){
            $('#cpResult').show();
            $('#cpResult').empty().append("<div class='lrRedAlert'>"+ msg + "</div>");
            $("#cpResult").delay(2000).fadeOut("fast");
            return;
        } else {
            cs.sendRequest(CNP_GATEWAY, {
                old:oldp,
                new:newp1
            },function(result, data){
                if (data.result == "ok"){
                    alert("Пароль успешно изменен");
                    that.run();
                } else {
                    $('#cpResult').show();
                    $('#cpResult').empty().append("<div class='lrRedAlert'>"+data.result+"</div>");
                    $("#cpResult").delay(2000).fadeOut("fast");
                }
            });
        }
    }

    gc = _gc;
    ui = _ui;
    cs = gc.getClientServer();
    that.cs = cs;

    if (!PlayerProfile.BOUND) {
        that.bindAll();
        PlayerProfile.BOUND = true;
    }
}

PlayerProfile.BOUND = false;

//var ruMonths = [
//    'января',
//    'февраля',
//    'марта',
//    'апреля',
//    'мая',
//    'июня',
//    'июля',
//    'августа',
//    'сентября',
//    'октября',
//    'ноября',
//    'декабря'
//];

function filterField(field) {
    if (field == "") {
        return "<span class='profileAbsentField'>" + I18n.contextGet("profile", "emptyFieldStub") + "</span>";
    } else {
        return field;
    }
}

function filterLink(validLink, link) {
    if (validLink == "") {
        return filterField(link);
    } else {
        if (validLink.length > 32) {
            var linkText = validLink.substr(0, 32) + "...";
        } else {
            linkText = validLink;
        }
        return "<a href='" + validLink + "' target=_blank>" + linkText + "</a>";
    }
}

PlayerProfile.renderProfile = function (profile, isGuest) {
    isGuest = ifDef(isGuest, false);

    var playerProfile = "<div class='playerProfile'><table class='playerProfileLayout'><tr>";

    var borderClass = "";
    if (profile.photoThumb == null) {
        borderClass = " profilePhotoBorder";
    }

    playerProfile += "<td style='width: 1%; text-align: left; padding-right: 10px;'><div class='profilePhotoFrame" + borderClass + "'>"
        + (profile.photoThumb == null
        ?
        "<img class='profilePhoto' src='/images/nophoto-" + I18n.get("locale") + ".png' />"
        :
        "<a href='" + profile.photo + "' rel='lightbox'>"
            + "<img class='profilePhoto' src='" + profile.photoThumb + "' /></a>")
        + "</div></td>";

    playerProfile += "<td>"
        + PlayerProfile.renderProfilePI(profile)
        + (!isGuest ? "<div class='constantWidthBtn nonSelectable pdSendMsg' id='sendMsg"
        + profile.playerId
        + "'>" + I18n.contextGet("profile", "pdSendPMButtonLabel") + "</div>" : "")
        + "</td>";

    playerProfile += "</tr>";

    if (!isGuest) {
        var f = ((typeof controller === "undefined")?cs:controller.cs)
            f = (!!f && f.isSuperUser())
        playerProfile += "<tr>"
            + "<td colspan='2'><div class='pdSendMsgResult' id='pdSendMsgResult" + profile.playerId + "'></div>"
            + "<div class='pdSendMsgPanel' id='pdSendMsgPanel" + profile.playerId + "'>"
            + "<div class='pdSendMsgPanelPadding'>"
            + "<h4>"
            + I18n.contextGet("profile", "pdRecipientHeaderPrefix") + " &laquo;" + profile.playerName
            + "&raquo;</h4>"
            + "<textarea id='pdMsg" + profile.playerId + "' style='width: 100%'></textarea>"
            + (f?"<input type='checkbox' id='pdFromAdmin'>От Админа</input>":"")
            + "<div class='constantWidthBtn nonSelectable pdSendMsgBtn' id='pdSendMsgBtn" + profile.playerId + "'>"
            + I18n.contextGet("profile", "pdSendButtonLabel")
            + "</div>"
            + "<div class='clear'></div>"
            + "</div>"
            + "</div>"
            + "</td>"
            + "</tr>";
    }

    playerProfile += "</table></div>";

    return playerProfile;
}

PlayerProfile.renderProfilePI = function (profile, isPublic) {
    var isPublic = ifDef(isPublic, true);

    var bDay = "";

    if (profile.birthDay > 0 && profile.birthMonth > 0) {
        bDay = profile.birthDay + " " + I18n.contextGet("monthsBeta", profile.birthMonth);
    }

    if (profile.birthYear > 0) {
        if (bDay != "") {
            bDay += " ";
        }
        bDay += profile.birthYear;
    }

    var about = profile.about.replace(/\n/gi, "<br />");

    return '<table class="playerProfileTable" style=" width: 100%;word-wrap: break-word; table-layout: fixed; ">'
        + "<tr>"
        + "<td>" + I18n.contextGet("profile", "birthdayLabel") + ": </td>"
        //+ "<td>&nbsp;</td>"
        + "<td>" + filterField(bDay) + "</td>"
        + "</tr>"
        + "<tr>"
        + "<td>" + I18n.contextGet("profile", "fromwhereLabel") + ": </td>"
        //+ "<td>&nbsp;</td>"
        + "<td>" + filterField(profile.fromwhere) + "</td>"
        + "</tr>"
        + "<tr>"
        + "<td>" + I18n.contextGet("profile", "linkLabel") + ": </td>"
        //+ "<td>&nbsp;</td>"
        + "<td>" + filterLink(profile.validLink, profile.link) + "</td>"
        + "</tr>"
        + (!isPublic?"<tr>"
        + "<td title=\"Для восстановления пароля\">"+I18n.get("email")+"</td>"
        //+ "<td>&nbsp;</td>"
        + "<td title=\"Для восстановления пароля\">" + filterField(profile.mail) + "</td>"
        + "</tr>":"")
        + "<tr>"
        + "<td>" + I18n.contextGet("profile", "aboutLabel") + ": </td>"
        //+ "<td>&nbsp;</td>"
        + "<td>" + filterField(about) + "</td>"
        + "</tr>"
        + "<tr>"
        + "<td>" + I18n.contextGet("profile", "regDateLabel") + ": </td>"
        //+ "<td>&nbsp;</td>"
        + "<td>" + formatDateRu(profile.regTimeTS) + "</td>"
        + (profile.lastActiveTS ? "</tr>"
        + "<tr>"
        + "<td>" + "Последнее посещение сайта" + ": </td>"
        //+ "<td>&nbsp;</td>"
        + "<td>" + formatDateRu2(profile.lastActiveTS) + "</td>"
        + "</tr>" : "")
//        + "<tr>"
//        + (showTotalGameTime && cs.isSuperUser() ? "<td>Игровое время: </td>"
//        + "<td>&nbsp;</td>"
//        + "<td>" + formatLargeGameTime(profile.totalGameTime) + "</td>" : "")
//        + "</tr>"
        + "</table>";
}

function validateMail(mail){
    var re = /\S+@\S+\.\S+/;
    return (mail && mail.length>3 && re.test(mail));
}