export class FileSaver {
    constructor() {
        this.configuarableFields = ["host", 'Url', "download", "path", "acceptableFiles"];
        this.options = {};
        this.init = (options) => {
            if (typeof options.name !== "string") {
                console.log("Fatal error in initializing file saver, NAME MUST BE A STRING");
                return false;
            }
            if (typeof options.path != 'string') {
                console.log("Fatal error in initializing file saver, PATH MUST BE A STRING");
                return false;
            }

            for (var i in this.configuarableFields) {
                let n = this.configuarableFields[i];
                this[n] = (typeof options[n] === "undefined") ? this[n] : options[n];
            }
            Meteor.fileSaver[options.name] = this;
        };
        this.host = "";
        this.Url = "/f";
        this.download = "/f/d";
        this.path = null;
        this.acceptableFiles = ["image/jpg", "image/gif", "image/jpeg", "image/jpg", "image/JPG", "image/pjpeg", "image/x-png", "image/png"];

        this.callback = function (err, result) {
        };
        this.File = function (unique_id, creator, filePath, file) {
            this._id = unique_id;
            this.creator = creator;
            this.file_path = filePath;
            this.file = file;
            this.created = new Date();
            this._status = "waiting_upload";
        };

        this.start = () => {
            Router.route(this.Url + '/:_id', Meteor.fileSaver.serveFile, {where: "server"});
            Router.route(this.download + '/:_id', Meteor.fileSaver.downloadFunc, {where: 'server'});
        };
    }
}

unique_id = function (n) {
    var unique_id = Random.id(n);
    for (var i = 0; i < 100; i++) {
        var Unique = Unique_ids.findOne({'unique_id': unique_id});
        console.log(Unique);
        if (typeof(Unique) === 'undefined') {
            var insert = {
                "unique_ids": unique_id,
            };
            Unique_ids.insert(insert);
            break;
        } else {
            unique_id = Random.id(n);
            if (i > 99) {
                return false;
            }
        }
    }
    return unique_id;
}

