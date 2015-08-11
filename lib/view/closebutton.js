
function CloseButton(container){
    this.button =  jQuery('<button>').appendTo(container)
        .attr('type', 'button')
        .addClass('close')
        .css('color', 'white')
        .append(jQuery('<span>')
                .attr('aria-hidden', 'true')
                .html('&nbsp;&nbsp;&times'));
};

module.exports = CloseButton;
