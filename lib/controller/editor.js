
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
    
    
     var insertRemoveOp = false;
    editor.getSession().on("change", function(e){
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
       console.log("change cursor at row " + sel.selectionLead.row + " column " + sel.selectionLead.column);
       model.core.caretMoved(editor.getSession().getDocument().positionToIndex(sel.selectionLead));
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
        console.log('removeLines');
                end = begin;
                for (var i=0; i<e.data.lines.length;++i){
                    end += e.data.lines[i].length+1; // +1 because of \n
                };
                break;
            case 'removeText':
        console.log('removeText');
                if (e.data.text.length === 1){
                    end = begin+1;
                } else {
                    end = editor.getSession().getDocument().positionToIndex(
                        e.data.range.end);
                };
                break;
            case 'insertLines':
        console.log('insertLines');
                text = "";
                for (var i=0; i<e.data.lines.length;++i){
                    text = text + (e.data.lines[i]) + "\n";
                };
                end = begin + text.length;
                break;
            case 'insertText':
        console.log('insertText');
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
    console.log("remoteInsert at position " + index);
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
    
    model.core.on('remoteCaretMoved', function(guid, index){
    var position = editor.getSession().getDocument().indexToPosition(index);
    if (guid === undefined) return;
    console.log('caretMoved from ' + guid + ' at position ' + position.row + ":" + position.column);
    if (remoteCarets[guid] !== undefined){
        // modifier l'emplacement du caret existant
        var marker = remoteCarets[guid];
        marker.cursors = [{row:position.row, column: position.column}];
        editor.getSession()._signal("changeFrontMarker");
    }else{
        console.log("create a new caret");
        // créer un nouveau caret
        var marker = {}
        marker.cursors = [{row: position.row, column: position.column}]
        marker.color = getRandomColor();
        marker.animal = getRandomAnimal();
        marker.update = function(html, markerLayer, session, config) {
            var start = config.firstRow, end = config.lastRow;
            var cursors = this.cursors;
            for (var i = 0; i < cursors.length; i++) {
                var pos = this.cursors[i];
                if (pos.row < start) {
                    continue;
                } else if (pos.row > end) {
                    break;
                } else {
                    // compute cursor position on screen
                    // this code is based on ace/layer/marker.js
                    var screenPos = session.documentToScreenPosition(pos)

                    var height = config.lineHeight;
                    var width = config.characterWidth;
                    var top = markerLayer.$getTop(screenPos.row, config);
                    var left = markerLayer.$padding + screenPos.column * width;
                    // can add any html here
                    var code = "<div class='remoteCaret' style='" +
                        "border-left: 2px solid " + this.color + ";" +
                        "position: absolute;" +
                        "height:" + height + "px;" +
                        "top:" + top + "px;" +
                        "left:" + left + "px; width:" + width + "px'>";
                    code += '<div style="position:relative;">';
                    code += '<div style="overflow:hidden">';
                    code += '<div style="position:absolute;top:-15px;left:-1px;border: 1px solid red; background-color:white;">' + this.animal + '</div>';
                    code += "</div>";
                    code += "</div>";
                    code += "</div>";
                    html.push(code);
                }
            }
        }
        marker.redraw = function() {
            this.session._signal("changeFrontMarker");
        }
        marker.addCursor = function() {
            // add to this cursors
            
            // trigger redraw
            marker.redraw()
        }
        marker.session = editor.session;
        marker.session.addDynamicMarker(marker, true);
        remoteCarets[guid] = marker;
        // call marker.session.removeMarker(marker.id) to remove it
        // call marker.redraw after changing one of cursors
    }
    });
    
    remoteCarets = {};
    function getRandomColor(){
    var a = ["red","cyan","yellow","pink","orange","green"];
    return a[Math.floor(Math.random() * a.length)];
    }
    function getRandomAnimal(){
    var a = ["Lama", "Dahut", "Chat", "Chien", "Canard", "Ornithorynque"];
    return a[Math.floor(Math.random() * a.length)] + " anonyme";
    }
};

module.exports = EditorController;
