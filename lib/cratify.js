var Model = require('./model/model.js');
var GUID = require('./model/guid.js');

var VLink = require('./view/link.js');
var VSignalingState = require('./view/signalingstate.js');
var VNetworkState = require('./view/networkstate.js');
var VMetadata = require('./view/metadata.js');

var CShareButton = require('./controller/sharebutton.js');
var CLaunchButton = require('./controller/launchbutton.js');
var CAnswerButton = require('./controller/answerbutton.js');
var CHandshakeButton = require('./controller/handshakebutton.js');
var CNewButton = require('./controller/newbutton.js');
var COpenButton = require('./controller/openbutton.js');
var QQuickSaveButton = require('./controller/quicksavebutton.js');
var CSaveOnDiskButton = require('./controller/saveondiskbutton.js');

var CNetworkState = require('./controller/networkstate.js');

var CEditor = require('./controller/editor.js');

/*!
 * \brief transform the selected division into a distributed and decentralized 
 * collaborative editor.
 * \param styleOptions the style options 
 * \param connectionOptions WebRTC options
 * \param session the identifier of the editing session
 */
$.fn.cratify = function(styleOptions, connectionOptions, session){
    
    var defaults = {
        'headerBackgroundColor': '#242b32',
        'headerColor': '#ececec',
        'editorBackgroundColor': '#ffffff',
        'editorHeight': '400px'
    };

    // if no session are given, create a default one
    var metadata;
    if (session){
        metadata = { session: session,
                     name: null,
                     date: null };
    } else {
        metadata = { session: GUID(),
                     name: "default",
                     date: new Date() };
    };

    
    var parameters = $.extend(defaults, styleOptions);
    
    return this.each(function(){
        // #A create the header
        var header = jQuery('<div>').appendTo(this)
            .css('width', '100%')
            .css('box-shadow', '0px 1px 5px #ababab')
            .css('border-top-left-radius', '4px')
            .css('border-top-right-radius', '4px')
            .css('color', parameters.headerColor)
            .css('background-color', parameters.headerBackgroundColor);

        var headerContainer = jQuery('<div>').appendTo(header)
            .addClass('container')
            .css('width','inherit');

        // Divide the header in three part with different purpose
        var headerLeft = jQuery('<div>').appendTo(headerContainer)
            .addClass('pull-left')
            .css('padding-top','10px')
            .css('padding-bottom','10px');
        
        var headerRightRight = jQuery('<div>').appendTo(headerContainer)
            .addClass('pull-right')
            .css('padding-top','10px')
            .css('padding-bottom','10px')
            .css('height','34px');

        var headerRightLeft = jQuery('<div>').appendTo(headerContainer)
            .addClass('pull-right')
            .css('padding-top','10px')
            .css('padding-bottom','10px')
            .css('height','34px');

        // Contains data about the document
        var buttonFile = jQuery('<a>').appendTo(headerLeft)
            .attr('href','#')
            .attr('data-trigger', 'hover').attr('data-toggle', 'popover')
            .attr('data-placement', 'bottom').attr('data-html', 'true')
            .attr('title','Document').attr('data-content', '')
            .css('color', 'black').addClass('crate-icon')
            .css('height','34px');

        // Contains awareness information such as network state
        var signalingState = jQuery('<i>').appendTo(headerRightLeft)
            .addClass('fa fa-circle-o-notch fa-2x')
            .attr('data-trigger', 'hover').attr('data-toggle', 'popover')
            .attr('title', 'Signaling server status')
            .attr('data-html', 'true').attr('data-content', '')
            .attr('data-placement', 'bottom')
            .css('margin-right', '10px');
        
        var networkState = jQuery('<i>').appendTo(headerRightLeft)
            .addClass('fa fa-globe fa-2x')
            .attr('data-trigger', 'hover').attr('data-toggle', 'popover')
            .attr('title', 'Network status')
            .attr('data-html', 'true')
            .attr('data-content', 'Disconnected: you are currently'+
                  'editing <span class="alert-info">on your own</span>.')
            .attr('data-placement', 'bottom')
            .css('margin-right', '10px');

        // Rightmost header part containing the dropdown menu
        function createDropdown(parent, texts){
            var dropdownElements = [], item, element;
            var ul = jQuery('<ul>').appendTo(parent)
                .addClass('dropdown-menu')
                .attr('role', 'menu');
            
            for (var i = 0; i < texts.length; ++i){
                if (texts[i]==='divider'){
                    jQuery('<li>').appendTo(ul).addClass('divider');
                } else {
                    item = jQuery('<li>').appendTo(ul)
                        .attr('role','presentation');
                    element = jQuery('<a>').appendTo(item)
                        .attr('href', 'javascript:void(0)')
                        .append(texts[i]);
                    dropdownElements.push(element);
                };
            };
            
            return dropdownElements;
        };
        
        var fileDropdown =  jQuery('<div>').appendTo(headerRightRight)
            .addClass('btn-group')
            .attr('role', 'group').attr('aria-label', 'menu bar')
            .css('margin-right','4px');
        
        jQuery('<button>').appendTo(fileDropdown)
            .addClass('btn btn-default dropdown-toggle')
            .attr('aria-label', 'File text')
            .attr('data-toggle', 'dropdown')
            .append( jQuery('<i>').addClass('fa fa-file-text'))
            .append( ' File ' )
            .append( jQuery('<span>').addClass('caret'));
        
        var fileButtons = createDropdown(fileDropdown, [
            'New',
            'Open',
            'Quick save',
            'Save on Disk' ]);

        var shareDropdown = jQuery('<div>').appendTo(headerRightRight)
            .addClass('btn-group')
            .attr('role', 'group').attr('aria-label', 'menu bar')
            .css('margin-right','4px');
        
        var shareButton = jQuery('<button>').appendTo(shareDropdown)
            .addClass('btn btn-default')
            .append( jQuery('<i>').addClass('fa fa-link'))
            .append( ' Share ' );
        jQuery('<button>').appendTo(shareDropdown)
            .addClass('btn btn-default dropdown-toggle')
            .html('&nbsp')
            .attr('data-toggle', 'dropdown').attr('aria-expanded', 'false')
            .append( jQuery('<span>').addClass('caret') );

        var shareButtons = createDropdown(shareDropdown,[
            '<i class="fa fa-long-arrow-right"></i> Get an entrance ticket',
            '<i class="fa fa-long-arrow-left"></i> Stamp a ticket',
            '<i class="fa fa-exchange"></i> Confirm our arrival',
            'divider',
            '<i class="fa fa-sign-out"></i> Disconnect' ]);        
        
        var settingsDropdown =  jQuery('<div>').appendTo(headerRightRight)
            .addClass('btn-group')
            .attr('role', 'group').attr('aria-label', 'menu bar')
            .css('margin-right', '4px');
        
        jQuery('<button>').appendTo(settingsDropdown)
            .addClass('btn btn-default dropdown-toggle')
            .attr('aria-label', 'File text')
            .attr('data-toggle', 'dropdown')
            .append( jQuery('<i>').addClass('fa fa-cogs'))
            .append( ' Settings ' )
            .append( jQuery('<span>').addClass('caret'));

        var settingsButton = createDropdown( settingsDropdown, [
            '<i class="fa fa-book"></i> Editor',
            '<i class="fa fa-users"></i> Network' ]);
        
        // #B create the editor
        var post = jQuery('<div>').appendTo(this)
            .css('box-shadow', '0px 1px 5px #ababab')
            .css('border-bottom-left-radius', '4px')
            .css('border-bottom-right-radius', '4px')
            .css('margin-bottom', '20px')
            .css('padding', '30px 15px')
            .css('background-color', parameters.editorBackgroundColor);
        
        // (TODO) change id to something more meaningful
        var id = Math.ceil(Math.random()*133742133742);
        var divEditor = jQuery('<div>').appendTo(post).attr('id','miaou'+id)
            .css('min-height', parameters.editorHeight);
        var editor = ace.edit('miaou'+id);

        editor.$blockScrolling = Infinity;
        editor.setTheme("ace/theme/chrome");
        editor.getSession().setUseWrapMode(true); // word wrapping
        editor.setHighlightActiveLine(false); // not highlighting current line
        editor.setShowPrintMargin(false); // no 80 column margin
        editor.renderer.setShowGutter(false); // no line numbers
        
        var linkContainer = jQuery('<div>').appendTo(this)
            .addClass('container')
            .css('position', 'relative')
            .css('top', '-100px')
            .css('width', 'inherit')
            .css('z-index', '10')
            .css('opacity', '0.9')
            .hide();
        
        var m = new Model(connectionOptions, metadata);
        
        var vss = new VSignalingState(m.signaling, signalingState);
        var vns = new VNetworkState(networkState);
        var vl = new VLink(linkContainer, this, id);
        var vm = new VMetadata(m, buttonFile);

        var csb = new CShareButton(m, shareButton, vss, vl);
        var clb = new CLaunchButton(m, shareButtons[0], vl);
        var cab = new CAnswerButton(m, shareButtons[1], vl);
        var chb = new CHandshakeButton(m, shareButtons[2], vl);
        var cns = new CNetworkState(m, vns);
        
        var ce = new CEditor(m, divEditor, editor);

        // Join an existing session
        if (session){ csb.startJoining(session); };
    });
};
