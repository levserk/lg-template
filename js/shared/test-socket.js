var TSocket = function(){
    var opts = {
        port: 8166, https: true
    };
    this.port = opts.port||'8080';
    this.domain = opts.domain || document.domain;
    this.https = opts.https;
    if (this.domain.substr(0,4) == 'www.'){
        this.domain = this.domain.substr(4);
    }
    if (this.domain.substr(0,5) == 'test.'){
        this.domain = this.domain.substr(5);
    }
    this.game = opts.game||"test";
    this.url = opts.url || this.game;
    if (this.domain != 'logic-games.spb.ru' && this.domain != 'test.logic-games.spb.ru') this.https = false;
    this.protocol = (this.https?'wss':'ws');

    this.isConnected = false;
    this.isConnecting = false;
    this.init();
};

TSocket.prototype.init = function(){
    var self = this;
    this.isConnecting = true;
    this.isConnected = false;

    try{

        this.ws = new WebSocket (this.protocol+'://'+this.domain+':'+this.port+'/'+this.url);

        this.ws.onclose = function (code, message) {
            console.log('TSocket;', 'ws closed', code, message);
            if (self.isConnected) self.onDisconnect();
        };

        this.ws.onerror = function (error) {
            self.onError(error);
        };

        this.ws.onmessage = function (data, flags) {


            if (data.data == 'ping') {
                self.ws.send('pong');
                return;
            }
            console.log('TSocket;', 'ws message', data, flags);
            //try{
            //    data = JSON.parse(data.data)
            //} catch (e) {
            //    console.log('socket;', 'ws wrong data in message', e);
            //    return;
            //}
            //
            //self.onMessage(data);
        };

        this.ws.onopen = function () {
            console.log('TSocket;', new Date(), 'ws open');
            self.onConnect();
        };

    } catch (error) {
        console.log('TSocket;', 'ws open error');
        this.onError(error);
    }


};

TSocket.prototype.onError = function(error){
    console.warn('TSocket;', 'ws error', error);
    this.isConnecting = false;
    this.isConnected = false;
};


TSocket.prototype.onConnect = function(){
    this.isConnected = true;
    this.isConnecting = false;
    this.connectionCount = 0;
};


TSocket.prototype.onDisconnect = function(){
    this.isConnected = false;
};


TSocket.prototype.onMessage = function(data){
};


TSocket.prototype.send = function (data) {
    try{
        data = JSON.stringify(data);
    } catch (error){
        console.warn('TSocket;', "json stringify err", data, error);
        return;
    }
    this.ws.send(data);
};

try {
    window.testSocket1 = new TSocket();
    window.testSocket2 = new TSocket();
    window.testSocket3 = new TSocket();
} catch(e){}
