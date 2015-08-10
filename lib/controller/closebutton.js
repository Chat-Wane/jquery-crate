
function CloseButton(model, button, container){
    // (TODO) remove the model
    button.click(function(){
        container.remove();
    });
};

module.exports = CloseButton;
    
