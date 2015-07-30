var Core = require('crate-core');

var GUID = require('./guid.js');
var Signaling = require('./signaling.js');

/*!
 * \brief the whole model of the application is contained within this object
 */
function Model(config, metadata){
    // #1 initalize
    this.uid = GUID();
    this.core = new Core(this.uid, {config:config});
    this.signaling = new Signaling(this.core.broadcast.source,metadata.session);
    this.metadata = metadata;
    
    // #2 fast access
    this.broadcast = this.core.broadcast;
    this.rps = this.core.broadcast.source;
    this.sequence = this.core.sequence;    
};

module.exports = Model;
