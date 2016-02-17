if (Meteor.isServer) {
    fs = Npm.require("fs");
    fileSaver.serveFile = function () {
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

    fileSaver.downloadFunc = function () {
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
}