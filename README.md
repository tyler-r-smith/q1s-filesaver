server side
```js
uploadImages = new FileSaver();
uploadImages.init({
    name: "uploadImages",
    path: "/Users/tylersmith/Documents/filesaver/images"
});
uploadImages.start();
```

Client Side
```html
<Template name="upload_images">
    <form>
    <input type="text" id="name" />
    <input type="file" id="file" />
    <input type="submit" />
    </form>
</Template>
```


```js
Meteor.upload_images.events({_
    "submit form": function(e){
       e.preventDefault();
       let file = document.getElementById("file").files[0];
       Meteor.fileSaver.call_saveFile(file, "uploadImages", function (_return){
            _let err = _return.err;
            let _id = _return._id;
            if (err === null){
                Images.insert({
                    image_id: _id,
                    image_name: $("#name").val()
                });
            } else{
                console.log(err);
            }
        });
    }   
})
```