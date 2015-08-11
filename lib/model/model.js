var Core = require('crate-core');

var GUID = require('./guid.js');
var Signaling = require('./signaling.js');

/*!
 * \brief the whole model of the application is contained within this object
 */
function Model(signalingOptions, webRTCOptions, name){
    // #1 initialize internal variables
    this.uid = GUID();
    this.name = name;
    this.date = new Date(); // (TODO) change
    this.webRTCOptions = webRTCOptions;
    
    this.core = new Core(this.uid,
                         {config:webRTCOptions});
    this.signaling = new Signaling(this.core.broadcast.source,
                                   signalingOptions);
    
    // #2 grant fast access
    this.broadcast = this.core.broadcast;
    this.rps = this.core.broadcast.source;
    this.sequence = this.core.sequence;
    this.causality = this.broadcast.causality;
    this.signalingOptions = this.signaling.signalingOptions;
    
};

module.exports = Model;
