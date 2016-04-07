var io = require('socket.io-client');

/*!
 * \brief handle the signaling server
 * \param rps the random peer sampling protocol
 * \param signalingOptions specific options for the signaling server(s). For
 * now, it's an object { server, session, duration } where server is
 * the address of the server to contact, session is the editing session to join
 * or share, duration is the optional duration time during which the socket with
 * the signaling server stays open.
 */
function Signaling(rps, signalingOptions){
    this.rps = rps;
    this.signalingOptions = signalingOptions;
    signalingOptions.server = "http://127.0.0.1:5000";
    this.socketIOConfig = { 'force new connection': true,
                            'reconnection': false };
    this.startedSocket = false;
    this.socket = null;
    this.timeout = null; // event id of the termination
    this.joiners = 0;

    var self = this;
    
    var callbacks = function(socket, idJoiner){
        return {
            onInitiate: function(message){
                socket &&
                    socket.emit('launch', signalingOptions.session, message);
            },        
            onAccept: function(message){
                socket &&
                    socket.emit('answer', idJoiner, message);
            },
            onReady: function(){
                if (idJoiner){
                    self.joiner += 1;
                } else {
                    self.socket.disconnect();
                };
            }
        };     
    };

    /*!
     * \brief create a connection with a socket.io server and initialize the
     * events
     */
    function createSocket() {
        // #A establish the dialog with the socket.io server
        if(!self.startedSocket){
            self.socket = io(self.signalingOptions.server, self.socketIOConfig);
            self.startedSocket = true;
            self.socket.on('connect', function(){
                console.log('Connection to the signaling server established');
            });
            self.socket.on('launchResponse', function(idJoiner, message){
                self.rps.connection(callbacks(self.socket, idJoiner), message)
            });
            self.socket.on('answerResponse', function(message){
                self.rps.connection(callbacks(self.socket), message);
            });
            self.socket.on('disconnect', function(){
                console.log('Disconnection from the signaling server');
                self.startedSocket = false;
                self.joiners = 0;
                clearTimeout(this.timeout);
                self.timeout= null;
            });
        }
        // #B reset timer before closing the connection
        if (self.timeout){clearTimeout(self.timeout);self.timeout=null;};
        // #C initialize a timer before closing the connection
        if (self.signalingOptions.duration){
            self.timeout = setTimeout(function(){
                self.stopSharing();
            }, self.signalingOptions.duration);
        };
    };

    this.startSharing = function(){
        createSocket();
        self.socket.on('connect', function(){
            self.socket.emit('share', self.signalingOptions.session);
        });
        return self.socket;
    };
    
    this.stopSharing = function(){
        self.socket.disconnect();
        clearTimeout(self.timeout);
        self.timeout = null;
    };

    this.startJoining = function(signalingOptions){
        createSocket();
        self.socket.on('connect', function(){
            self.rps.connection(callbacks(self.socket));
        });
        return self.socket;
    };
};


module.exports = Signaling;
