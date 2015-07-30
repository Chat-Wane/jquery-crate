
/*!
 * \brief contains the metadata informations
 * \param model the model of the application
 * \param metadataContainer
 */
function Metadata(model, metadataContainer){
    var metadataString =
        '<ul style="padding: 5px;"><li><b>Session:</b> '+
        model.metadata.session+'</li>'+
        '<li><b>Name:</b> '+ model.metadata.name+'</li>'+
        '<li><b>Date:</b> '+ new Date(model.metadata.date).toString()+'</li>';
    metadataContainer.attr("data-content", metadataString);
};

module.exports = Metadata;
