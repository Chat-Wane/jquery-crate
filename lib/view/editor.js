
function Editor(container, id){
    this.div = jQuery('<div>').appendTo(container)
        .attr('id','crate-'+id)
        .css('min-height', '400px');
    this.editor = ace.edit('crate-'+id);

    this.editor.$blockScrolling = Infinity;
    this.editor.setTheme("ace/theme/chrome");
    this.editor.getSession().setUseWrapMode(true); // word wrapping
    this.editor.setHighlightActiveLine(false); // not highlighting current line
    this.editor.setShowPrintMargin(false); // no 80 column margin
    this.editor.renderer.setShowGutter(false); // no line numbers
};

module.exports = Editor;
