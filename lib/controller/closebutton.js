
function CloseButton(model, closeView, container){
    // (TODO) remove the model
    closeView.button.click(function(){
        // #1 remove the view
        container.remove();
        // #2 disconnect the signaling server
        if (model.signaling.startedSocket){
            model.signaling.stopSharing();
        };
        // #3 disconnect the network
        model.rps.leave();
    });
};

module.exports = CloseButton;
    
