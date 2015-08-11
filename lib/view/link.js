
function LinkView(container, id){

    this.linkContainer = jQuery('<div>').appendTo(container)
        .addClass('container')
        .css('position', 'relative')
        .css('top', '-100px')
        .css('width', 'inherit')
        .css('z-index', '10')
        .css('opacity', '0.9')
        .hide();
    
    // #0 qr code modal
    var qrCodeModal = jQuery('<div>').appendTo(container)
        .attr('id', 'modalQRCode'+id)
        .attr('tabindex','-1')
        .attr('role','dialog')
        .attr('aria-labelledby','modalQRCodeLabel')
        .attr('aria-hidden', 'true')
        .addClass('modal');
    
    var qrCodeModalDialog = jQuery('<div>').appendTo(qrCodeModal)
        .addClass('modal-dialog');
    var qrCodeModalContent = jQuery('<div>').appendTo(qrCodeModalDialog)
        .addClass('modal-content text-center');
    this.qrcodeCanvas = jQuery('<div>');
    qrCodeModalContent.append(jQuery('<br>'))
        .append(this.qrcodeCanvas)
        .append(jQuery('<br>'));
    
    // #1 overall division
    this.alert = jQuery('<div>').appendTo(this.linkContainer)
        .attr('role', 'alert')
        .addClass('alert alert-warning alert-dismissible');
    // #2 cross to close the division
    this.dismiss = jQuery('<button>').appendTo(this.alert)
        .attr('type', 'button')
        .addClass('close')
        .html('<span  aria-hidden="true">&times;</span><span class="sr-only"> '+
              'Close </span>');
    var rowContainer = jQuery('<div>').appendTo(this.alert)
        .addClass('container');
    var inputGroup = jQuery('<div>').appendTo(rowContainer)
        .addClass('input-group');
    this.input = jQuery('<input>').appendTo(inputGroup)
        .attr('type', 'text')
        .attr('placeholder', 'Nothing to see here, move along.')
        .addClass('form-control');
    
    var inputGroup2 = jQuery('<span>').appendTo(inputGroup)
        .addClass('input-group-btn');

    this.qrcode = jQuery('<button>').appendTo(inputGroup2)
        .attr('aria-label', 'QR-code')
        .attr('type', 'button')
        .attr('data-target', '#modalQRCode'+id)
        .attr('data-toggle', 'modal')
        .addClass('btn btn-default')
        .html('<i class="fa fa-qrcode"></i> QR-Code');

    this.action = jQuery('<button>').appendTo(inputGroup2)
        .attr('aria-label', 'Go!')
        .attr('type', 'button')
        .addClass('btn btn-default')
        .html('Go!')
        .css('z-index', '15');

    var self = this;
    this.dismiss.unbind("click").click(function(){self.linkContainer.hide();});
};

LinkView.prototype.printLink = function(link){
    this.linkContainer.show();
    this.alert.removeClass("alert-info").addClass("alert-warning");
    this.action.html('<i class="fa fa-clipboard"></i> Copy');
    this.action.attr("aria-label", "Copy to clipboard");
    this.input.attr("readonly","readonly");
    this.input.val(link);
    this.qrcode.show();
};

LinkView.prototype.printLaunchLink = function(link){
    this.printLink(link);
    this.input.attr("placeholder",
                    "A link will appear in this field, give it to your "+
                    "friend!");
    this.action.unbind("click");
    this.qrcode.hide();
    return this.action;
};

LinkView.prototype.printAnswerLink = function(link){
    this.printLink(link);
    this.input.attr("placeholder",
                    "A link will appear in this field. Please give it "+
                    "back to your friend.");
    this.action.unbind("click");
    this.qrcode.hide();
    return this.action;
};

LinkView.prototype.askLink = function(){
    this.linkContainer.show();
    this.alert.removeClass("alert-warning").addClass("alert-info");
    this.action.html('Go!');
    this.action.attr("aria-label", "Stamp the ticket");
    this.input.removeAttr("readonly");
    this.input.val("");
    this.action.unbind("click");
    this.qrcode.hide();
};

LinkView.prototype.askLaunchLink = function(){
    this.askLink();
    this.input.attr("placeholder",
                    "Please, copy the ticket of your friend here to stamp "+
                    "it!");
    this.qrcode.hide();
    return this.action;
};

LinkView.prototype.askAnswerLink = function(){
    this.askLink();
    this.input.attr("placeholder", "Copy the stamped ticket to confirm "+
                    "your arrival in the network");
    this.qrcode.hide();
    return this.action;
};

LinkView.prototype.hide = function(){
    this.linkContainer.hide();
};

module.exports = LinkView;
