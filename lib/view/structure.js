
function Structure(container){
    // #A create the global header
    var header = jQuery('<div>').appendTo(container)
        .css('width', '100%')
        .css('box-shadow', '0px 1px 5px #ababab')
        .css('border-top-left-radius', '4px')
        .css('border-top-right-radius', '4px')
        .css('color', '#ececec')
        .css('background-color', '#242b32');

    var headerContainer = jQuery('<div>').appendTo(header)
        .addClass('container')
        .css('width','inherit');

    // #B Divide the header in four parts with different purposes
    this.headerLeft = jQuery('<div>').appendTo(headerContainer)
        .addClass('pull-left')
        .css('padding-top','10px')
        .css('padding-bottom','10px');

    this.headerRightRightRight = jQuery('<div>').appendTo(headerContainer)
        .addClass('pull-right')
        .css('padding-top', '10px')
        .css('padding-bottom', '10px')
        .css('height', '34px');

    this.headerRightRight = jQuery('<div>').appendTo(headerContainer)
        .addClass('pull-right')
        .css('padding-top','10px')
        .css('padding-bottom','10px')
        .css('height','34px')
        .css('margin-top', '2px');

    this.headerRight = jQuery('<div>').appendTo(headerContainer)
        .addClass('pull-right')
        .css('padding-top','10px')
        .css('padding-bottom','10px')
        .css('height','34px')
        .css('margin-right', '20px');

    this.body = jQuery('<div>').appendTo(container)
        .css('box-shadow', '0px 1px 5px #ababab')
        .css('border-bottom-left-radius', '4px')
        .css('border-bottom-right-radius', '4px')
        .css('margin-bottom', '20px')
        .css('padding', '30px 15px')
        .css('background-color', '#ffffff');
};

module.exports = Structure;
