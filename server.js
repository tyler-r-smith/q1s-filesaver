if (Meteor.isServer) {
    _FileSaver_Collection = new Mongo.Collection("fileSaver");
    Unique_ids = new Mongo.Collection("fileSaverUnique_ids");
    Meteor.fileSaver = {};

    fs = Npm.require("fs");
    Meteor.fileSaver.serveFile = function () {
        var file_db = _FileSaver_Collection.findOne({_id: this.params._id});
        var file = file_db.file_path;

        // Attempt to read the file size
        var stat = null;
        try {
            stat = fs.statSync(file);
        } catch (_error) {
            return fail(this.response);
        }

        // The hard-coded attachment filename
        var attachmentFilename = file_db.file.name;

        // Set the headers
        this.response.writeHead(200, {
            'Content-Type': file_db.file.type,
        });

        // Pipe the file contents to the response
        fs.createReadStream(file).pipe(this.response);
    };

    Meteor.fileSaver.downloadFunc = function () {
        var file_db = _FileSaver_Collection.find({_id: this.params._id}).fetch()[0];
        var file = file_db.file_path;

        // Attempt to read the file size
        var stat = null;
        try {
            stat = fs.statSync(file);
        } catch (_error) {
            return fail(this.response);
        }

        // The hard-coded attachment filename
        console.log(file_db);
        var attachmentFilename = file_db.file.name;

        // Set the headers
        this.response.writeHead(200, {
            'Content-Type': file_db.file.type,
            'Content-Disposition': 'attachment; filename=' + attachmentFilename,
            'Content-Length': stat.size
        });

        // Pipe the file contents to the response
        fs.createReadStream(file).pipe(this.response);
    }

    Meteor.methods({
        fileSaver_saveFile: function(blob, file, encoding, fileSaverName, client_id){
            let fileSaver = Meteor.fileSaver[fileSaverName];
            if (typeof fileSaver === 'undefined') {
                throw new Meteor.Error(500, 'fileSaverName must be defined');
            }
            var callback = fileSaver.callback;
            if (typeof callback !== 'function') {
                callback(Meteor.Error(500, "Invalid Callback Function"));
                throw new Meteor.Error(500, "invalid Callback Function");
            }
            if (fileSaver.acceptableFiles.indexOf(file.type) === -1) {
                callback(Meteor.Error(500, "Invalid File"));
                throw new Meteor.Error(500, "invalid file");
            }
            if (typeof Meteor.userId === "function")
                var user = Meteor.userId();
            else
                var user = null;
            if (typeof(fileSaver.path) !== "string") {
                callback(Meteor.Error(500, "Invalid Path in filesaver"));
                throw new Meteor.Error(500, "Invalid Path in filesaver");
            }
            var _id = unique_id(20);
            var save_path = fileSaver.path+"/"+_id;
            fs = Npm.require('fs'),
                encoding = encoding || 'binary';

            var insert = new fileSaver.File(_id, user, save_path, file);
            _FileSaver_Collection.insert(insert, function(e, r){
                console.log(e);
                console.log(r);
            });
            fs.writeFile(save_path, blob, encoding, Meteor.bindEnvironment(function(err, result) {
                if (err) {
                    console.log(err); 
                    var now = new Date();
                    _FileSaver_Collection.update({"save_path": save_path}, {$set: {_status: "error", completed_at: now}}, function(e, r){});
                    let err = new Meteor.Error(500, "Failed to save file", err);
                    Meteor.call("call_client", client_id, "FileSaverCallback", {err: err, insert_id: insert});
                    callback(err, insert);
                    throw err;
                } else {
                    var now = new Date();
                    _FileSaver_Collection.update({"save_path": save_path}, {$set: {_status: "uploaded", completed_at: now}}, function(e, r){
                        console.log(e);
                        console.log(r);
                    })
                    Meteor.call("call_client", client_id, "FileSaverCallback", {err: null, insert_id: insert});
                    callback(null, insert);
                }
            }));
            return {url: fileSaver.host + fileSaver.Url +'/'+_id};
        }
    })
}