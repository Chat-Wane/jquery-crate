

function Dropdown(container, title, texts, isDivided){
    var dropdown = jQuery('<div>').appendTo(container)
        .addClass('btn-group')
        .attr('role', 'group').attr('aria-label', 'menu bar')
        .css('margin-right','4px');

    this.button = jQuery('<button>').appendTo(dropdown)
        .addClass('btn btn-default')
        .append( title );
    
    if (isDivided){
        jQuery('<button>').appendTo(dropdown)
            .addClass('btn btn-default dropdown-toggle')
            .html('&nbsp')
            .attr('data-toggle', 'dropdown')
            .attr('aria-expanded', 'false')
            .append( jQuery('<span>')
                     .addClass('caret') );
    } else {
        this.button
            .addClass('dropdown-toggle')
            .attr('data-toggle', 'dropdown')
            .attr('aria-expanded', 'false')
            .append( jQuery('<span>')
                     .addClass('caret'));
    };


    function createDropdown(parent, texts){
        var dropdownElements = [], item, element;
        var ul = jQuery('<ul>').appendTo(parent)
            .addClass('dropdown-menu')
            .attr('role', 'menu');

        for (var i = 0; i < texts.length; ++i){
            if (texts[i]==='divider'){
                jQuery('<li>').appendTo(ul).addClass('divider');
            } else {
                item = jQuery('<li>').appendTo(ul)
                    .attr('role','presentation');
                element = jQuery('<a>').appendTo(item)
                    .attr('href', 'javascript:void(0)')
                    .append(texts[i]);
                dropdownElements.push(element);
            };
        };

        return dropdownElements;
    };

    this.buttons = createDropdown(dropdown, texts);
};

module.exports = Dropdown;
