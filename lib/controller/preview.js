//var markdown = require('markdown').markdown;
var marked = require('marked');
marked.setOptions({
    renderer: new marked.Renderer(),
    gfm: true,
    tables: true,
    breaks: false,
    pedantic: false,
    sanitize: false,
    smartLists: true,
    smartypants: false
});


function Preview(buttonView, editorView, previewView){
    var self = this;
    
    this.isPreviewing = false;
    this.startPreviewText = '<i class="fa fa-eye"></i>';
    this.stopPreviewText = '<i class="fa fa-eye-slash"></i>';
    
    buttonView.button.click(function(){
        if (!self.isPreviewing){
            self.isPreviewing = true;
            editorView.div.hide();
            previewView.div.html(marked(editorView.editor.getValue()));
            previewView.div.show();
            buttonView.button.html(self.stopPreviewText);
        } else {
            self.isPreviewing = false;
            previewView.div.hide();
            editorView.div.show();
            buttonView.button.html(self.startPreviewText);
        };
        
    });
};

module.exports = Preview;
