fileSaver = {};
if (Meteor.isServer) {
    _FileSaver_Collection = new Mongo.Collection("fileSaver");
    Unique_ids = new Mongo.Collection("fileSaverUnique_ids");
    fileSaver.host = "";
    fileSaver.Url = "/f";
    fileSaver.download = "/f/d";
    fileSaver.path = null;
    fileSaver.saveFile = function(blob, file, encoding, user) {

    };
    fileSaver.acceptableFiles = ["image/jpg", "image/gif", "image/jpeg", "image/jpg", "image/JPG", "image/pjpeg", "image/x-png", "image/png"];
    fileSaver.File = function(unique_id, creator, filePath, file) {
        this._id = unique_id;
        this.creator = creator;
        this.file_path = filePath;
        this.file = file;
        this.created = new Date();
        this._status = "waiting_upload";
    };
    fileSaver.start = function () {
        Router.route(fileSaver.Url+'/:_id', fileSaver.serveFile, {where: "server"});
        Router.route(fileSaver.download+'/:_id', fileSaver.downloadFunc, {where: 'server'});
    };
    function unique_id(n) {
        var unique_id = Random.id(n);
        for (var i = 0; i < 100; i++) {
            var Unique = Unique_ids.findOne({'unique_id': unique_id});
            console.log(Unique);
            if (typeof(Unique) === 'undefined'){
                var insert = {
                    "unique_ids": unique_id,
                }
                Unique_ids.insert(insert);
                break;
            } else {
                unique_id = Random.id(n);
                if (i > 99){
                    return false;
                }
            }
        }
        return unique_id;
    }
    Meteor.methods({
        fileSaver_saveFile: function(blob, file, encoding){
            if (fileSaver.acceptableFiles.indexOf(file.type) === -1)
                throw new Meteor.Error(500, "invalid file");
            var user = Meteor.userId();
            if (typeof(fileSaver.path) !== "string")
                throw new Meteor.Error(500, "invalid file");
            var _id = unique_id(20);
            var save_path = fileSaver.path+"/"+_id;

            fs = Npm.require('fs'),
                encoding = encoding || 'binary';
            // Clean up the path. Remove any initial and final '/' -we prefix them-,
            // any sort of attempt to go to the parent directory '..' and any empty directories in
            // between '/////' - which may happen after removing '..'
            // TODO Add file existance checks, etc...
            var insert = new fileSaver.File(_id, user, save_path, file);
            _FileSaver_Collection.insert(insert, function(e, r){
                console.log(e);
                console.log(r);
            });
            //TODO TYLER: ADD A FINISHED FUNCTION
            fs.writeFile(save_path, blob, encoding, function(err) {
                console.log(save_path);
                if (err) {
                    var now = new Date();
                    _FileSaver_Collection.update({"save_path": save_path}, {$set: {_status: "uploaded", completed_at: now}}, function(e, r){
                        console.log(e);
                        console.log(r);
                    });
                    throw (new Meteor.Error(500, 'Failed to save file.', err));
                } else {
                    var now = new Date();
                    _FileSaver_Collection.update({"save_path": save_path}, {$set: {_status: "uploaded", completed_at: now}}, function(e, r){
                        console.log(e);
                        console.log(r);
                    })
                }
            });
            return {url: fileSaver.host + fileSaver.Url +'/'+_id};

            function cleanPath(str) {
                if (str) {
                    return str.replace(/\.\./g,'').replace(/\/+/g,'').
                    replace(/^\/+/,'').replace(/\/+$/,'');
                }
            }
            function cleanName(str) {
                return str.replace(/\.\./g,'').replace(/\//g,'');
            }
        }
    })
}

if (Meteor.isClient) {
    fileSaver.clientFunc = function (){
        console.log("hi "+Meteor.userId());
    };
    fileSaver.call_saveFile = function (_file, callback) {
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
            }
            Meteor.call('fileSaver_saveFile', file.srcElement.result, _send, encoding, function(e, r){
                if (!e)
                    callback(r);
            });
        };
        fileReader[method](_file);
    }
}

