var Core = require('crate-core');

var GUID = require('./guid.js');
var Signaling = require('./signaling.js');


function Model(signalingOptions, webRTCOptions, name, importFromJSON){
    // #1A initialize internal variables
    this.uid = GUID();
    this.name = name;
    this.date = new Date(); // (TODO) change
    this.webRTCOptions = webRTCOptions;

    this.core = new Core(this.uid, {config:webRTCOptions});
    this.signaling = new Signaling(this.core.broadcast.source,signalingOptions);

    // #1B if it is imported from an existing object, initialize it with these
    if (importFromJSON){
        this.core.sequence.fromJSON(importFromJSON.sequence);
        this.core.broadcast.causality.fromJSON(importFromJSON.causality);
    };    
    
    // #2 grant fast access
    this.broadcast = this.core.broadcast;
    this.rps = this.core.broadcast.source;
    this.sequence = this.core.sequence;
    this.causality = this.broadcast.causality;
    this.signalingOptions = this.signaling.signalingOptions;
    
};

module.exports = Model;
