
function StatesHeader(model, container){
    this.model = model;
    
    this.red = "#cd2626";
    this.yellow = "#eead0e";
    this.green = "#228b22";
    this.blue = "#00BFFF";
    
    this.signalingState = jQuery('<i>').appendTo(container)
        .addClass('fa fa-circle-o-notch fa-2x')
        .attr('data-trigger', 'hover').attr('data-toggle', 'popover')
        .attr('title', 'Signaling server status')
        .attr('data-html', 'true').attr('data-content', '')
        .attr('data-placement', 'bottom')
        .css('margin-right', '10px')
        .popover()
        .hide();

    this.networkState = jQuery('<i>').appendTo(container)
        .addClass('fa fa-globe fa-2x')
        .attr('data-trigger', 'hover').attr('data-toggle', 'popover')
        .attr('title', 'Network status')
        .attr('data-html', 'true')
        .attr('data-content', 'Disconnected: you are currently'+
              ' editing <span class="alert-info">on your own</span>.')
        .attr('data-placement', 'bottom')
        .css('margin-right', '10px')
        .css('margin-top', '2px')
        .popover();
};

StatesHeader.prototype.setNetworkState = function(state){
    switch (state){
    case "connected":
        var connectedString =
            "<span class='alert-success'>Congratulations</span>"+
            "! You are connected to people, and people are "+
            "connected to you. <span class='alert-info'>You can start editing "+
            "together</span>.";
        this.networkState.css("color", this.green);
        this.networkState.attr("data-content", connectedString);
        break;
    case "partiallyconnected":
        var partiallyConnectedString =
            "<span class='alert-warning'>Partially"+
            " connected</span>: either you are connected to people, or people "+
            "are connected to you. "+
            "<i>This is an undesired intermediary state. If it persists, "+
            "please consider rejoining the network.</i>";
        this.networkState.css("color", this.yellow);
        this.networkState.attr("data-content", partiallyConnectedString);
        break;
    case "disconnected":
        var disconnectedString =
            "<span class='alert-danger'>Disconnected</span>:"+
            " you are currently editing <span class='alert-info'>on"+
            " your own</span>.";
        this.networkState.css("color", this.red);
        this.networkState.attr("data-content", disconnectedString);
        break;
    };
};

StatesHeader.prototype.setSignalingState = function(state){
    var self = this;
    function blink(){
        self.signalingState.show();
        setTimeout( function(){
            if (self.model.signaling.startedSocket){
                blink();
            } else {
                self.setSignalingState("done");
            };
        }, 1000);
    };
    
    switch (state){
    case "waitSignaling":
        this.signalingState.show();
        this.signalingState.removeClass("fa-spin");
        this.signalingState.css("color", this.yellow);
        var waitSignalingString = "<span class='alert-warning'>Connecting"+
            "</span>: establishing a connection with the signaling server. "+
            "The latter allows people to join the editing session by using "+
            "the provided link. "+
            "<i>If this state persists, consider reloading the page.</i>";
        this.signalingState.attr("data-content", waitSignalingString);
        blink();
        break;
    case "waitSharer":
        this.signalingState.show();
        this.signalingState.addClass("fa-spin");
        this.signalingState.css("color", this.blue);
        var waitSharerString = "The connection to the signaling server has "+
            "been successfully established! <span class='alert-info'>Waiting "+
            "for the sharer now</span>.";
        this.signalingState.attr("data-content", waitSharerString);
        blink();
        break;
    case "waitJoiners":
        this.signalingState.css("color", this.blue);
        this.signalingState.addClass("fa-spin");
        var waitJoinersString = "The connection to the signaling server has "+
            "been <span class='alert-success'>successfully</span> "+
            "established! "+
            "The server allows people to join the editing session by using "+
            "the provided link. "+
            "<span class='alert-info'>Waiting for the collaborators</span>."
        this.signalingState.attr("data-content", waitJoinersString);
        blink();
        break;
    case "done":
        this.signalingState.show();
        this.signalingState.removeClass("fa-spin");
        var doneString = "The connection to the signaling server has been "+
            "<span class='alert-info'>terminated</span>.";
        this.signalingState.attr("data-content", doneString);
        this.signalingState.css("color", this.green);
        this.signalingState.fadeOut(6000, "linear");
        break;
    };
};

module.exports = StatesHeader;
