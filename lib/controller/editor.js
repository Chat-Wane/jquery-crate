
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
        console.log('removeLines');
                end = begin;
                for (var i=0; i<e.data.lines.length;++i){
                    end += e.data.lines[i].length+1; // +1 because of \n
                };
                break;
		remoteCaretsUpdate(begin, - (end - begin));
            case 'removeText':
        console.log('removeText');
                if (e.data.text.length === 1){
                    end = begin+1;
                } else {
                    end = editor.getSession().getDocument().positionToIndex(
                        e.data.range.end);
                };
		remoteCaretsUpdate(begin, - e.data.text.length);
                break;
            case 'insertLines':
        console.log('insertLines');
                text = "";
                for (var i=0; i<e.data.lines.length;++i){
                    text = text + (e.data.lines[i]) + "\n";
                };
                end = begin + text.length;
		remoteCaretsUpdate(begin, text.length);
                break;
            case 'insertText':
        console.log('insertText');
                text = e.data.text;
                end = editor.getSession().getDocument().positionToIndex(
                    e.data.range.end);
		remoteCaretsUpdate(begin, e.data.text.length);
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
	console.log("remoteRemove");
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
    
	model.core.on('remoteCaretMoved', function(guid, range){
		if (guid === undefined) return;
		console.log('caretMoved from ' + guid + ' for indexes positions ' + range.start + ";" + range.end);
		if (editor.session.remoteCarets[guid] !== undefined){
			// modifier l'emplacement du caret existant
			var marker = editor.session.remoteCarets[guid];
			marker.cursors = [range]; // save the cursors as indexes
			editor.getSession()._signal("changeFrontMarker");
		}else{
			console.log("create a new caret");
			// créer un nouveau caret
			var marker = {};
			marker.cursors = [range];
			marker.color = getRandomColor();
            marker.colorRGB = "rgb("+marker.color+")";
            marker.colorRGBLight = "rgba("+marker.color+", 0.5)";
			marker.animal = getRandomAnimal();
			marker.update = function(html, markerLayer, session, config) {
				var start = config.firstRow, end = config.lastRow;
				var cursors = this.cursors;
				for (var i = 0; i < cursors.length; i++) {
						var rng = {
							start: session.getDocument().indexToPosition(cursors[i].start),
							end: session.getDocument().indexToPosition(cursors[i].end)
						};
						var startScreenPos = session.documentToScreenPosition(rng.start);
						var endScreenPos = session.documentToScreenPosition(rng.end);
						if (startScreenPos.row == endScreenPos.row){//!range.isMultiLine()){
							// only one line
							var height = config.lineHeight;
							var width = config.characterWidth * (endScreenPos.column - startScreenPos.column);
							var top = markerLayer.$getTop(startScreenPos.row, config);
							var left = markerLayer.$padding + startScreenPos.column * config.characterWidth;
							var range = this.colorRGB;
							if(width != 0){
								range = this.colorRGBLight;
								width = 2;
							}
							var code = "<div class='remoteCaret' style='" +
								"background-color:" +range +";" +
								"height:" + height + "px;" +
								"top:" + top + "px;" +
								"left:" + left + "px;" +
								"width:" + width + "px'>";
							code += '<div class="squareCaret" style="background:' + this.colorRGB + ';">';
							code += '<div class="infoCaret" style="background:' + this.colorRGBLight + ';">' + this.animal + '</div></div></div>';
							html.push(code);
						}else{
							// multi-line
							// first line
							var height = config.lineHeight;
							var top = markerLayer.$getTop(startScreenPos.row, config);
							var left = markerLayer.$padding + startScreenPos.column * config.characterWidth;
							var code = "<div class='remoteCaret selection' style='" +
								"background-color:" + this.colorRGBLight + ";" +
								"height:" + height + "px;" +
								"top:" + top + "px;" +
								"left:" + left + "px;" +
								"right: 0;'>";
							code += '<div class="squareCaret" style="background:' + this.colorRGB + ';">';
							code += '<div class="infoCaret" style="background:' + this.colorRGBLight + ';">' + this.animal + '</div></div></div>';
							// last line
							height = config.lineHeight;
							top = markerLayer.$getTop(endScreenPos.row, config);
							left = markerLayer.$padding;
							width = config.characterWidth * endScreenPos.column;
							code += "<div class='remoteCaret' style='" +
							"background-color:" + this.colorRGBLight + ";" +
							"height:" + height + "px;" +
							"top:" + top + "px;" +
							"left:" + left + "px;" +
							"width:" + width + "px;'></div>";
							// middle lines
							if (endScreenPos.row - startScreenPos.row > 1){
								height = config.lineHeight * (endScreenPos.row - startScreenPos.row - 1);
								top = markerLayer.$getTop(startScreenPos.row + 1, config);
								left = markerLayer.$padding;
								code += "<div class='remoteCaret' style='" +
									"background-color:" + this.colorRGBLight + ";" +
									"height:" + height + "px;" +
									"top:" + top + "px;" +
									"left:" + left + "px;" +
									"right:0;'></div>";
							}
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
			editor.session.remoteCarets[guid] = marker;
			// call marker.session.removeMarker(marker.id) to remove it
			// call marker.redraw after changing one of cursors
		}
    });
    
    editor.session.remoteCarets = {};
    function remoteCaretsUpdate(index, length){
	var change = false;
	for (guid in editor.session.remoteCarets){
		var remoteCaret = editor.session.remoteCarets[guid];
		for (i=0; i<remoteCaret.cursors.length; i++){
			var cursor = remoteCaret.cursors[i];
			if (cursor.start >= index){
				cursor.start += length;
				change = true;
			}
			if (cursor.end >= index){
				cursor.end += length;
			}
		}
	}
	if (change){
		editor.session._signal("changeFrontMarker");
	}
    };
    function getRandomColor(){
    return Math.floor(Math.random()*206+50)+", "+Math.floor(Math.random()*206+50)+", "+Math.floor(Math.random()*206+50);
    }
    function getRandomAnimal(){
    var a = ["Aardvark", 
"Albatross", 
"Alligator", 
"Alpaca", 
"Ant", 
"Anteater", 
"Antelope", 
"Ape", 
"Armadillo", 
"Donkey", 
"Baboon", 
"Badger", 
"Barracuda", 
"Bat", 
"Bear", 
"Beaver", 
"Bee", 
"Bird", 
"Bison", 
"Boar", 
"Buffalo", 
"Butterfly", 
"Camel", 
"Caribou", 
"Cassowary", 
"Cat", 
"Caterpillar", 
"Cattle", 
"Chamois", 
"Cheetah", 
"Chicken", 
"Chimpanzee", 
"Chinchilla", 
"Chough", 
"Coati", 
"Cobra", 
"Cockroach", 
"Cod", 
"Cormorant", 
"Coyote", 
"Crab", 
"Crane", 
"Crocodile", 
"Crow", 
"Curlew", 
"Deer", 
"Dinosaur", 
"Dog", 
"Dogfish", 
"Dolphin", 
"Dotterel", 
"Dove", 
"Dragonfly", 
"Duck", 
"Dugong", 
"Dunlin", 
"Eagle", 
"Echidna", 
"Eel", 
"Eland", 
"Elephant", 
"Elephant seal", 
"Elk", 
"Emu", 
"Falcon", 
"Ferret", 
"Finch", 
"Fish", 
"Flamingo", 
"Fly", 
"Fox", 
"Frog", 
"Gaur", 
"Gazelle", 
"Gerbil", 
"Giant panda", 
"Giraffe", 
"Gnat", 
"Gnu", 
"Goat", 
"Goldfinch", 
"Goosander", 
"Goose", 
"Gorilla", 
"Goshawk", 
"Grasshopper", 
"Grouse", 
"Guanaco", 
"Guinea fowl", 
"Guinea pig", 
"Gull", 
"Hamster", 
"Hare", 
"Hawk", 
"Hedgehog", 
"Heron", 
"Herring", 
"Hippopotamus", 
"Hornet", 
"Horse", 
"Hummingbird", 
"Hyena", 
"Ibex", 
"Ibis", 
"Jackal", 
"Jaguar", 
"Jay", 
"Jellyfish", 
"Kangaroo", 
"Kinkajou", 
"Koala", 
"Komodo dragon", 
"Kouprey", 
"Kudu", 
"Lapwing", 
"Lark", 
"Lemur", 
"Leopard", 
"Lion", 
"Llama", 
"Lobster", 
"Locust", 
"Loris", 
"Louse", 
"Lyrebird", 
"Magpie", 
"Mallard", 
"Mammoth", 
"Manatee", 
"Mandrill", 
"Mink", 
"Mole", 
"Mongoose", 
"Monkey", 
"Moose", 
"Mouse", 
"Mosquito", 
"Narwhal", 
"Newt", 
"Nightingale", 
"Octopus", 
"Okapi", 
"Opossum", 
"Ostrich", 
"Otter", 
"Owl", 
"Oyster", 
"Panther", 
"Parrot", 
"Panda", 
"Partridge", 
"Peafowl", 
"Pelican", 
"Penguin", 
"Pheasant", 
"Pig", 
"Pigeon",
"Platipus",
"Polar bear", 
"Pony", 
"Porcupine", 
"Porpoise", 
"Prairie dog", 
"Quail", 
"Quelea", 
"Quetzal", 
"Rabbit", 
"Raccoon", 
"Ram", 
"Rat", 
"Raven", 
"Red deer", 
"Red panda", 
"Reindeer", 
"Rhinoceros", 
"Rook", 
"Salamander", 
"Salmon", 
"Sand dollar", 
"Sandpiper", 
"Sardine", 
"Sea lion", 
"Sea urchin", 
"Seahorse", 
"Seal", 
"Shark", 
"Sheep", 
"Shrew", 
"Skunk", 
"Sloth", 
"Snail", 
"Snake", 
"Spider", 
"Squirrel", 
"Starling", 
"Swan", 
"Tapir", 
"Tarsier", 
"Termite", 
"Tiger", 
"Toad", 
"Turkey", 
"Turtle",  
"Wallaby", 
"Walrus", 
"Wasp", 
"Water buffalo", 
"Weasel", 
"Whale", 
"Wolf", 
"Wolverine", 
"Wombat", 
"Wren", 
"Yak", 
"Zebra"];
    return "Anonymous " + a[Math.floor(Math.random() * a.length)];
    }
};

module.exports = EditorController;
