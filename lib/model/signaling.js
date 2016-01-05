var io = require('socket.io-client');

/*!
 * \brief handle the signaling server
 * \param rps the random peer sampling protocol
 */
function Signaling(rps, signalingOptions){
    this.rps = rps;
    this.signalingOptions = signalingOptions;
    // this.address = "file:///Users/chat-wane/Desktop/project/crate/"
    this.address = "http://chat-wane.github.io/CRATE";
    this.socketIOConfig = { "force new connection": true,
                            "reconnection": false };
    this.startedSocket = false;
    this.socket = null;
    this.socketDuration = this.signalingOptions.duration;
    this.timeout = null; // event id of the termination
    this.joiners = 0;
};

/*!
 * \brief create a connection with a socket.io server and initialize the events
 */
Signaling.prototype.createSocket = function(){
    var self = this;
    // #A establish the dialog with the socket.io server
    if(!this.startedSocket){
        this.socket = io(this.signalingOptions.server, this.socketIOConfig);
        this.startedSocket = true;
        this.socket.on("connect", function(){
            console.log("Connection to the signaling server established");
        });
        this.socket.on("launchResponse", function(idJoiner, offerTicket){
            self.joiners = self.joiners + 1;
            self.rps.answer(offerTicket, function(stampedTicket){                
                self.socket.emit("answer", idJoiner, stampedTicket);
            });
        });
        this.socket.on("answerResponse", function(handshakeMessage){
            self.rps.handshake(handshakeMessage);
            self.socket.disconnect();
        });
        this.socket.on("disconnect", function(){
            console.log("Disconnection from the signaling server");
            self.startedSocket = false;
            self.joiners = 0;
            clearTimeout(this.timeout);
        });
    }
    // #B reset timer before closing the connection
    if (this.timeout!==null){ clearTimeout(this.timeout); };
    // #C initialize a timer before closing the connection
    if (this.socketDuration){
        this.timeout = setTimeout(function(){
            self.stopSharing();
        }, this.socketDuration);
    };
};

Signaling.prototype.startSharing = function(){
    var self = this;
    this.createSocket();
    this.socket.on("connect", function(){
        self.socket.emit("share", self.signalingOptions.session);
    });
    return this.socket;
};

Signaling.prototype.stopSharing = function(){
    this.socket.disconnect();
    this.timeout = null;
};

Signaling.prototype.startJoining = function(signalingOptions){
    var self = this;
    this.createSocket();
    this.socket.on("connect", function(){
        self.rps.launch(function(launchMessage){
            self.socket.emit("launch", signalingOptions.session, launchMessage);
        });
    });
    return this.socket;
};


module.exports = Signaling;
