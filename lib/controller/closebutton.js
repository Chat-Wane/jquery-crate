
function CloseButton(model, button, container){
    // (TODO) remove the model
    button.click(function(){
        // #1 remove the view
        container.remove();
        // #2 disconnect the signaling server
        if (model.signaling.startedSocket){
            model.signaling.stopSharing();
        };
    });
};

module.exports = CloseButton;
    
