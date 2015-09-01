

function Preview(container){
    this.div = jQuery('<div>').appendTo(container)
        .css('min-height', '400px')
        .hide();
};

module.exports = Preview;
