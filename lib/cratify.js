var Model = require('./model/model.js');
var GUID = require('./model/guid.js');
var ace = require('brace');
require('brace/theme/chrome');

var VStructure = require('./view/structure.js');
var VEditor = require('./view/editor.js');
var VCloseButton = require('./view/closebutton.js');
var VLink = require('./view/link.js');
var VStatesHeader = require('./view/statesheader.js');
var VMetadata = require('./view/metadata.js');
var VRoundButton = require('./view/roundbutton.js');
var VPreview = require('./view/preview.js');

var CStatesHeader = require('./controller/statesheader.js');
var CCloseButton = require('./controller/closebutton.js');
var CEditor = require('./controller/editor.js');
var CPreview = require('./controller/preview.js');

/*!
 * \brief transform the selected division into a distributed and decentralized 
 * collaborative editor.
 * \param options {
 *   signalingOptions: configure the signaling service to join or share the
 *     document. {address: http://example.of.signaling.service.address,
 *                session: the-session-unique-identifier,
 *                connect: true|false}
 *   webRTCOptions: configure the STUN/TURN server to establish WebRTC
 *     connections.
 *   styleOptions: change the default styling options of the editor.
 *   name: the name of the document
 *   importFromJSON: the json object containing the aformentionned options plus
 *     the saved sequence. If any of the other above options are specified, the
 *     option in the json object are erased by them.
 * }
 */
$.fn.cratify = function(options){
    // #0 examine the arguments
    // (TODO) apply style options
    var styleOptions=$.extend({'headerBackgroundColor': '#242b32',
                               'headerColor': '#ececec',
                               'editorBackgroundColor': '#ffffff',
                               'editorHeight': '400px'},
                              (options && options.styleOptions) ||
                              (options && options.importFromJSON &&
                               options.importFromJSON.styleOptions) ||
                              {});
    
    var webRTCOptions = (options && options.webRTCOptions) ||
        (options && options.importFromJSON &&
         options.importFromJSON.webRTCOptions) ||
        {};
    
    var signalingOptions=
        $.extend(
            $.extend({//server: "http://127.0.0.1:5000",
                      server: "https://ancient-shelf-9067.herokuapp.com",
                      session: GUID(),
                      connect: false},
                     (options && options.importFromJSON &&
                      options.importFromJSON.signalingOptions) ||
                     {}),
            (options && options.signalingOptions) || {});

    var name = (options && options.name) ||
        (options && options.importFromJSON &&
         options.importFromJSON.name) ||
        "default";
    
    return this.each(function(){
        // #1 initialize the model
        var m = new Model(signalingOptions, webRTCOptions, name,
                          options.importFromJSON);

        // #2 initialize the view
        var divId = GUID();
        var vs  = new VStructure(this);
        var ve  = new VEditor(vs.body, divId);
        var vcb = new VCloseButton(vs.headerRightRightRight);
        var vm  = new VMetadata(m, vs.headerLeft);
        var vsh = new VStatesHeader(m, vs.headerRight);
        var vl  = new VLink(this, divId);
        var vpb = new VRoundButton(vs.headerRightRight,
                                   '<i class="fa fa-eye"></i>',
                                   'switch to preview');
        var vp  = new VPreview(vs.body);

        var vsb = new VRoundButton(vs.headerRightRight,
                                   '<i class="fa fa-link"></i>',
                                   'start sharing');
        var vset = new VRoundButton(vs.headerRightRight,
                                    '<i class="fa fa-cogs"></i>',
                                    'settings (disabled)');
        // #3 initialize the controllers
        var ccb = new CCloseButton(m, vcb, this);
        var csh = new CStatesHeader(m, vsh, vl, vsb);
        var ce  = new CEditor(m, ve);
        var cp  = new CPreview(vpb, ve, vp);
        
        // #4 grant quick access
        this.header = vs.headerRightRight;
        this.closeButton = vcb.button;
        this.model = m;

        // #5 optionnally join an editing session
        if (signalingOptions.connect){
            csh.startJoining(signalingOptions);
        };
    });
};
