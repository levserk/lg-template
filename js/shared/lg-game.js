/**\
 * LogicGame client
 * use: LogicGame.init(function(){
 *     console.log("ready", controller.cs.isSuperUser());
 * })
 */
var LogicGame = function(){
    var ui;
    var controller;
    var func;
    var isInit=false;

    function ClientServer(_gameVariationId) {
        var that = this;
        var gameVariationId;
        var beaconCounter = -2;
        that.globalAsync = true;
        that.globalTimeout = 15000;

        this.isLogged = function () {
            return !that.isGuest();
        }

        this.getGameVariationId = function () {
            return gameVariationId;
        }

        this.sendBeacon = function (threshold, timeout, callbackFn) {
            beaconCounter++;
            if (beaconCounter >= threshold || beaconCounter == -1) {
                beaconCounter = 0;

                $.ajax({
                    url : "/gw/beacon.php",
                    type : "POST",
                    data : {
                        nocache : new Date().getTime(),
                        sessionId : that.getSessionId(),
                        userId : that.getUserId(),
                        gameVariationId : that.getGameVariationId()
                    },
                    timeout : timeout,
                    async : true
                }).done(function (data) {
                        var response = parseJSON(data);
                        if (response != null && response.status == "ok" && isDef(callbackFn)) {
                            callbackFn(true, response);
                        }
                    }).error(function (jqXHR, textStatus, errorThrown) {
                        if (isDef(callbackFn)) {
                            callbackFn(false);
                        }
                    });
            }
        };
        multiExtendClass(ClientServer, ProfileClientServer, this);
        multiExtendClass(ClientServer, SharedClientServer, this);
        gameVariationId = _gameVariationId;
        that.attemptLocalStorage = new AttemptLocalStorage(that);
    }

    function GameController(_cs, _serializer) {
        var that = this;
        var cs;
        var beacon;
        that.gameURL = location.href.substr(0,location.href.lastIndexOf('/')+1);
        var KEY_ESC = 27;

        this.getClientServer = function () {
            return cs;
        }

        this.setup = function () {
            jQuery(document).keydown(this.keyDown);
            that.ui = ui = new UI(this);
            that.cs = cs;
            beacon = new Beacon(this, ui);

            var timer = $.timer(function () {
                beacon.sendBeacon();
            });

            timer.set({
                time : 1000, autostart : true
            });
        }
        this.keyDown = function (e) {
            var key = e.which;
            if (key == KEY_ESC) {
                that.notifyEsc();
                ui.hideAllActivePanels();
            }
        }

        this.logout = function () {
            cs.logout(function (result) {
                    if (result) {
                        //window.location = that.gameURL;
                        location.reload();
                    }
                }
            );
        }

        this.setAboutToLogin = function (_aboutToLogin) {
            aboutToLogin = _aboutToLogin;
        }


        multiExtendClass(GameController, SharedController, this);
        cs = _cs;
        that.cs = cs;
    }

    function UI(_gc) {
        var that = this;
        var OVER_FIELD_PANEL = 0;
        var BOTTOM_PANEL = 1;

        var guestBookRenderer,
            loginRegisterManager;

        this.showRegPanel = function () {
            loginRegisterManager.showRegMePanel();
        }

        multiExtendClass(UI, SharedUI, this);
        that.setGameController(_gc);
        that.setupSharedUI();
        var gc = _gc;
        that.gc = _gc;
        guestBookRenderer = new GuestBookRenderer(gc, this, null);
        loginRegisterManager = new LoginRegisterManager(_isFreshUser, this, gc, {
            showWelcomePanel : true
        });

        this.hidePanel = function (panelId) {
            $(".buttonMenu.downmeny a").removeClass('on');
            that.hideAllActivePanels();
            if (panelId instanceof BottomSubPanel) {
                panelId.fireOnClose(HIDE_SINGLE_PANEL);
                panelId.destroy();
            }
        }

        this.setGuestUI = function () {
            $("#bbProfile").hide();
            $("#bbLoginRegister").show();
            that.showPanel({
                id : "welcomePanel",
                type : OVER_FIELD_PANEL
            });
        }

        this.setUserUI = function () {
            $("#bbProfile").show();
            $("#bbLoginRegister").hide();
            that.hidePanel("welcomePanel");
        }

        this.showGuestBook = function(){
            guestBookRenderer.run();
        }

       //console.log('UI', this.userProfile.updateUnreadMsgCount);
    }

    function ready() {
        if (!_gameVariationId) throw new Error("_gameVariationId undefined");
        if (!_sessionId) throw new Error("_sessionId undefined");
        if (!_userId) throw new Error("_userId undefined");
        if (!_username) throw new Error("_username undefined");

        if (window.controller || window.cs || window.ui) throw new Error("client already initialized");
        var cs = new ClientServer(_gameVariationId);
        cs.setSessionId(_sessionId);
        cs.setUser(_userId, _username, _isGuest);
        controller = new GameController(cs, null);
        controller.setup();
        window.controller = controller;
        window.ui = ui;
        isInit = true;
        if (typeof _isGuest != "undefined"){
            if (_isGuest) ui.setGuestUI(); else ui.setUserUI();
        }
        if (func) func();

        if (window._isIframe) $('a[href^="/"]').attr('target','_blank');
    }

    return {
        init: function(callback){
            if (callback && typeof callback == "function") func = callback;
            if (jQuery) jQuery(document).ready(ready);
            else setTimeout(ready, 1000);
        },
        isSuperUser :function(){
            return controller.cs.isSuperUser();
        },
        isInit: function(){
            return isInit;
        },
        hidePanels: function(){
            ui.hideAllActivePanels();
        },
        setupVKResizer: function(wrapper){
            window.Resizer(wrapper);
        },
        showGuestBook: function(){
            ui.showGuestBook();
        }
    }
}();



