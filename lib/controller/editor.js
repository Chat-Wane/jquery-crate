var Marker = require('../view/marker.js');

function EditorController(model, viewEditor){
    var self = this, editor = viewEditor.editor;
    this.viewEditor = viewEditor;   
    this.fromRemote = false;
    
    // #B initialize the string within the editor
    function getStringChildNode(childNode){
        var result = '';
        if (childNode.e !== null){ result = childNode.e; };
        for (var i=0; i<childNode.children.length; ++i){
            result += getStringChildNode(childNode.children[i]);
        };
        return result;
    };
    
    editor.setValue(getStringChildNode(model.sequence.root),1);
    
    var insertRemoveOp = false;
    editor.getSession().on('change', function(e){
        switch(e.data.action){
        case 'removeLines':
        case 'removeText':
        case 'insertLines':
        case 'insertText':
            insertRemoveOp = true;
        }
    });
    
    editor.getSession().getSelection().on('changeCursor', function(e, sel){
        if (!insertRemoveOp){
            var range = sel.getRange();
            model.core.caretMoved({
                start: editor.getSession().getDocument().positionToIndex(range.start),
                end: editor.getSession().getDocument().positionToIndex(range.end)
            });
        }
        insertRemoveOp = false;
    });
    
    editor.getSession().on('change', function(e) {
        var begin, end, text, message, j=0;

        if (!self.fromRemote){
            // #1 process the boundaries from range to index and text
            begin = editor.getSession().getDocument().positionToIndex(
                e.data.range.start);
            
            switch (e.data.action){
            case 'removeLines':
                end = begin;
                for (var i=0; i<e.data.lines.length;++i){
                    end += e.data.lines[i].length+1; // +1 because of \n
                };
                remoteCaretsUpdate(begin, begin-end);
                break;  
            case 'removeText':
                if (e.data.text.length === 1){
                    end = begin+1; //faster
                } else {
                    end = editor.getSession().getDocument().positionToIndex(
                        e.data.range.end);
                };
                remoteCaretsUpdate(begin, begin-end);
                break;
            case 'insertLines':
                text = '';
                for (var i=0; i<e.data.lines.length;++i){
                    text = text + (e.data.lines[i]) + '\n';
                };
                end = begin + text.length;
                remoteCaretsUpdate(begin, text.length);
                break;
            case 'insertText':
                text = e.data.text;
                end = editor.getSession().getDocument().positionToIndex(
                    e.data.range.end);
                remoteCaretsUpdate(begin, text.length);
                break;
            };
            // #2 update the underlying CRDT model and broadcast the results
            for (var i=begin; i<end; ++i){
                switch (e.data.action){
                case 'insertText': model.core.insert(text[j], i); break;
                case 'insertLines': model.core.insert(text[j], i); break;
                case 'removeText': model.core.remove(begin); break;
                case 'removeLines': model.core.remove(begin); break;
                };
                ++j;
            };
        };
    });
    
    model.core.on('remoteInsert', function(element, index){
        var aceDocument = editor.getSession().getDocument(),
            delta,
            tempFromRemote;
        if (index!==-1){
            delta = {action: 'insertText',
                     range: { start: aceDocument.indexToPosition(index-1),
                              end:   aceDocument.indexToPosition(index)},
                     text: element},
            tempFromRemote = self.fromRemote;
            self.fromRemote = true;
            aceDocument.applyDeltas([delta]);
            remoteCaretsUpdate(index,1);
            self.fromRemote = tempFromRemote;
        };
    });
    
    model.core.on('remoteRemove', function(index){    
        var aceDocument = editor.getSession().getDocument(),
            delta,
            tempFromRemote;
        if (index !== -1){
            delta = {action: 'removeText',
                     range: { start: aceDocument.indexToPosition(index - 1),
                              end:   aceDocument.indexToPosition(index)},
                     text: null};
            tempFromRemote = self.fromRemote;
            self.fromRemote = true;
            aceDocument.applyDeltas([delta]);
            remoteCaretsUpdate(index,-1);
            self.fromRemote = tempFromRemote;
        };
    });
    
    model.core.on('remoteCaretMoved', function(range, origin){
        if (!origin) return;
        if (editor.session.remoteCarets[origin]){
            // #A update the existing cursor
            var marker = editor.session.remoteCarets[origin];
            marker.cursors = [range]; // save the cursors as indexes
            editor.getSession()._signal('changeFrontMarker');
            marker.refresh();
        }else{
            // #B create a new cursor
            var marker = new Marker(editor.session, origin, range);
            editor.session.addDynamicMarker(marker, true);
            editor.session.remoteCarets[origin] = marker;
            marker.refresh();
            // call marker.session.removeMarker(marker.id) to remove it
            // call marker.redraw after changing one of cursors
        }
    });
    
    editor.session.remoteCarets = {};
    function remoteCaretsUpdate(index, length){
        var change = false, document = editor.session.getDocument();
        for (origin in editor.session.remoteCarets){
            var remoteCaret = editor.session.remoteCarets[origin];
            for (i=0; i<remoteCaret.cursors.length; ++i){
                var cursor = remoteCaret.cursors[i];
                if (cursor.start >= index){
                    cursor.start += length;
                    change = true;
                }
                if (cursor.end >= index){
                    cursor.end += length;
                    change = true;
                }
            }
        }
        if (change){
            editor.session._signal('changeFrontMarker');
        }
    };
    
};

module.exports = EditorController;
