require('jquery-qrcode');

function StatesHeader(model, statesView, linkView, shareButton){
    this.model = model;
    this.statesView = statesView;
    
    model.broadcast.source.on("statechange", function(state){
        switch (state){
        case "connect": statesView.setNetworkState('connected'); break;
        case "partial": statesView.setNetworkState('partiallyConnected'); break;
        case "disconnect": statesView.setNetworkState('disconnected'); break;
        };
    });

    shareButton.unbind("click").click( function(){
        var socket, action, client, self;
        if (model.signaling.startedSocket){
            model.signaling.stopSharing();
            return ; // ugly as hell
        };
        // #0 create the proper call to the server
        socket = model.signaling.startSharing();
        statesView.setSignalingState("waitSignaling");
        socket.on("connect", function(){
            shareButton.removeAttr("disabled");
            statesView.setSignalingState("waitJoiners");
            shareButton.html("<i class='fa fa-unlink'></i> Unhare");
        });
        socket.on("disconnect", function(){
            shareButton.html("<i class='fa fa-link'></i> Share");
        });
        shareButton.attr("disabled","disabled");
        // #1 modify the view
        if (model.signaling.startedSocket){
            action = linkView.printLink(model.signalingOptions.server+
                                        "/index.html?"+
                                        model.signalingOptions.session);
            client = new ZeroClipboard(action);
            client.on("ready", function(event){
                client.on( "copy", function( event ){
                    var clipboard = event.clipboardData;
                    clipboard.setData( "text/plain",
                                       linkView.input.val() );
                });
            });
        };        
    });

    linkView.qrcode.click(function(){
        var address = model.signalingOptions.address +
            "/index.html?" +
            model.signalingOptions.session;
        linkView.qrcodeCanvas.html("");
        linkView.qrcodeCanvas.qrcode({
            size:400,
            text:address
        });
    });    
};

StatesHeader.prototype.startJoining = function(signalingOptions){
    var socket = this.model.signaling.startJoining(signalingOptions);
    this.statesView.setSignalingState('waitSignaling');
    
    var self = this;
    socket.on('connect',
              function(){ self.statesView.setSignalingState('waitSharer'); });
};

module.exports = StatesHeader;
