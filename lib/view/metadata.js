
var fs = require('fs');
var imdata = fs.readFileSync(__dirname + '/../res/crateicon.png', 'base64');

function Metadata(model, container){
    var metadataString =
        '<ul style="padding: 5px;"><li><b>Session:</b> '+
        model.signalingOptions.session+'</li>'+
        '<li><b>Name:</b> '+ model.name+'</li>'+
        '<li><b>Date:</b> '+ model.date.toString()+'</li>';
    
    var buttonFile = jQuery('<a>').appendTo(container)
        .attr('href','#')
        .attr('data-trigger', 'hover').attr('data-toggle', 'popover')
        .attr('data-placement', 'bottom').attr('data-html', 'true')
        .attr('title','Document').attr('data-content', metadataString)
        .css('color', 'black')
        .css('display', 'inline-block')
        .css('height', '32px')
        .css('width', '32px')
        .css('margin-left', '10px')
        .css('background', 'data:image/png;base64,' + imdata +
             'no-repeat center center')
        .css('background-size', '32px 32px')
        .addClass('crate-icon')
        .css('height','34px').popover();
};

module.exports = Metadata;
