///Testing Branch
if (Meteor.isClient) {
    Meteor.fileSaver = {};
    Meteor.fileSaver.call_saveFile = function (_file, fileSaver, callback) {
        const _client  = new ClientFromServer();
        _client.new_function("FileSaverCallback", callback);
        var fileReader = new FileReader(),
            method, encoding = 'binary', type = type || 'binary';
        switch (type) {
            case 'text':
                // TODO Is this needed? If we're uploading content from file, yes, but if it's from an input/textarea I think not...
                method = 'readAsText';
                encoding = 'utf8';
                break;
            case 'binary':
                method = 'readAsBinaryString';
                encoding = 'binary';
                break;
            default:
                method = 'readAsBinaryString';
                encoding = 'binary';
                break;
        }
        fileReader.onload = function (file) {
            var _send = {
                name: _file.name,
                type: _file.type,
                lastModifiedDate: _file.lastModifiedDate,
                size: _file.size
            };
            Meteor.call('fileSaver_saveFile', file.srcElement.result, _send, encoding, fileSaver, _client._id, function(e, r){
                if (!e){
                    
                }
                else
                    console.log("call_saveFile failed on server. ", e);
            });
        };
        fileReader[method](_file);
    }
}