
function EditorController(model, viewEditor){
    var self = this, editor = viewEditor.editor;
    this.viewEditor = viewEditor;   
    this.fromRemote = false;
    
    // #B initialize the string within the editor
    function getStringChildNode(childNode){
        var result = "";
        if (childNode.e !== null){ result = childNode.e; };
        for (var i=0; i<childNode.children.length; ++i){
            result += getStringChildNode(childNode.children[i]);
        };
        return result;
    };
    editor.setValue(getStringChildNode(model.sequence.root),1);

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
                break;
            case 'removeText':
                if (e.data.text.length === 1){
                    end = begin+1;
                } else {
                    end = editor.getSession().getDocument().positionToIndex(
                        e.data.range.end);
                };
                break;
            case 'insertLines':
                text = "";
                for (var i=0; i<e.data.lines.length;++i){
                    text = text + (e.data.lines[i]) + "\n";
                };
                end = begin + text.length;
                break;
            case 'insertText':
                text = e.data.text;
                end = editor.getSession().getDocument().positionToIndex(
                    e.data.range.end);
                break;
            };
            // #2 update the underlying CRDT model and broadcast the results
            for (var i=begin; i<end; ++i){
                switch (e.data.action){
                case "insertText": model.core.insert(text[j], i); break;
                case "insertLines": model.core.insert(text[j], i); break;
                case "removeText": model.core.remove(begin); break;
                case "removeLines": model.core.remove(begin); break;
                };
                ++j;
            };
        };
    });
    
    model.core.on("remoteInsert", function(element, index){
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
            self.fromRemote = tempFromRemote;
        };
    });
    
    model.core.on("remoteRemove", function(index){        
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
            self.fromRemote = tempFromRemote;
        };
    });
};

module.exports = EditorController;
