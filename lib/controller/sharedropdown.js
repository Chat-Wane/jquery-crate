
function ShareDropdown(model, dropdown, linkView){
    dropdown.buttons[0].click( function(){
        var action = linkView.printLaunchLink("");
        model.rps.launch( function(message){
            setTimeout( function(){
                linkView.input.val(model.signaling.address+
                                   "acceptticket.html?"+
                                   encodeURIComponent(
                                       JSON.stringify(message)));
            }, 1500);
        });
        var client = new ZeroClipboard(action);
        client.on("ready", function(event){
            client.on( "copy", function( event ){
                var clipboard = event.clipboardData;
                clipboard.setData( "text/plain",
                                   linkView.input.val() );
            });
        });
    });

    dropdown.buttons[1].click( function(){
        var action = linkView.askLaunchLink();
        action.unbind("click").click(function(){           
            var message = JSON.parse(
                decodeURIComponent( linkView.input.val().split("?")[1]));
            action = linkView.printLink("");
            model.rps.answer(message, function(message){
                setTimeout(function(){
                    linkView.input.val(model.signaling.address+
                                       "confirmarrival.html?"+
                                       encodeURIComponent(
                                           JSON.stringify(message)));
                }, 1500);
            });
            var client = new ZeroClipboard(action);
            client.on("ready", function(event){
                client.on( "copy", function( event ){
                    var clipboard = event.clipboardData;
                    clipboard.setData( "text/plain",
                                       linkView.input.val() );
                });
            });
        });
    });

    dropdown.buttons[2].click( function(){
        var action = linkView.askAnswerLink();
        action.click( function(){
            var message = JSON.parse(decodeURIComponent(
                linkView.input.val().split("?")[1]));
            model.rps.handshake(message);
            linkView.hide();
        });
    });
    
};

module.exports = ShareDropdown;
