require('jquery-qrcode');

function StatesHeader(model, statesView, linkView, shareView){
    var self = this;
    this.model = model;
    this.statesView = statesView;

    this.startSharingText = '<i class="fa fa-link"></i>';
    this.startSharingTooltip = 'start sharing';
    this.stopSharingText = '<i class="fa fa-unlink"></i>';
    this.stopSharingTooltip = 'stop sharing';
    
    model.broadcast.source.on("statechange", function(state){
        switch (state){
        case "connect": statesView.setNetworkState('connected'); break;
        case "partial": statesView.setNetworkState('partiallyConnected'); break;
        case "disconnect": statesView.setNetworkState('disconnected'); break;
        };
    });

    shareView.button.unbind("click").click( function(){
        var socket, action, client;
        if (model.signaling.startedSocket){
            model.signaling.stopSharing();
            return ; // ugly as hell
        };
        // #0 create the proper call to the server
        socket = model.signaling.startSharing();
        statesView.setSignalingState("waitSignaling");
        socket.on("connect", function(){
            shareView.button.removeAttr("disabled");
            statesView.setSignalingState("waitJoiners");
            shareView.button.html(self.stopSharingText);
            shareView.button.attr('title', self.stopSharingTooltip)
                .tooltip('fixTitle');
        });
        socket.on("disconnect", function(){
            shareView.button.html(self.startSharingText);
            shareView.button.attr('title', self.startSharingTooltip)
                .tooltip('fixTitle');
        });
        shareView.button.attr("disabled","disabled");
        // #1 modify the view
        if (model.signaling.startedSocket){
            // #A clean the address from args
            var address = (window.location.href).split('?')[0];
            // #B add the new argument
            action = linkView.printLink(address +"?"+
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
        var address = model.signaling.address +
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
