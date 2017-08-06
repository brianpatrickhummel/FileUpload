var fs = require('fs');  
var path = require('path');  
var uid = require('uid2');  
var mime = require('mime'); 
// Parse an incoming multipart/form-data request (uploads). Adds the files and files to req.
var multipart = require('connect-multiparty');
var multipartMiddleware = multipart();

var db = require("../models");

var TARGET_PATH = path.resolve(__dirname, '../imageUploads/');  
var IMAGE_TYPES = ['image/jpeg', 'image/png']; 

module.exports = function(app) {
  app.post("/upload", multipartMiddleware, function(req, res) {
    var is;
    var os;
    var targetPath;
    var targetName;
    // console.log(req.files);
    var tempPath = req.files.file.path;
    //get the mime type of the file
    var type = mime.lookup(req.files.file.path);
    //get the extension of the file
    var extension = req.files.file.path.split(/[. ]+/).pop();

    //check to see if we support the file type
    if (IMAGE_TYPES.indexOf(type) == -1) {
      return res.send(415, 'Supported image formats: jpeg, jpg, jpe, png.');
    }

    //create a new name for the image
    targetName = uid(22) + '.' + extension;

    //determine the new path to save the image
    targetPath = path.join(TARGET_PATH, targetName);

    //create a read stream in order to read the file
    is = fs.createReadStream(tempPath);

    //create a write stream in order to write the a new file
    os = fs.createWriteStream(targetPath);

    is.pipe(os);

    //handle error
    is.on('error', function() {
      if (err) {
        return res.send(500, 'Something went wrong');
      }
    });

    //if we are done moving the file
    is.on('end', function() {

      //delete file from temp folder
      fs.unlink(tempPath, function(err) {
        if (err) {
          return res.send(500, 'Something went wrong');
        }

      });//#end - unlink
    });//#end - on.end
    db.listing.create({
      imageName: targetName
    }).then(function(response) {
       res.send(response);
    });
  });
} 