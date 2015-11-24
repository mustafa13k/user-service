var express = require('express');
var app = express();
var mongoose = require('../config/db.js')();
var url = require('url');
var Busboy = require('busboy');
var Grid = require('gridfs-stream');
Grid.mongo = mongoose.mongo;
var gfs = new Grid(mongoose.connection.db);


module.exports = function(fileService,userService) {

    //routes
    app.get('/file/:id', function(req,res,next) { 

        var fileId=req.params.id;
        if(fileId){
            fileService.getFileById(fileId).then(function(file) { 

                res.set('Content-Type', file.contentType);
                res.set('Content-Disposition', 'attachment; filename="' + file.filename + '"'); 

                var readstream = gfs.createReadStream({
                  _id: file._id
                });

                readstream.on("error", function(err) {                  
                  res.send(500, "Got error while processing stream " + err.message);
                  res.end();
                });

                readstream.pipe(res);

            },function(error){
                return res.send(500, error);
            });
        }else{
            return res.send(500, "Found no file id in the url");
        }
		    
    }); 

    app.post('/file', function(req, res, next) {

        var currentUserId= req.session.passport.user ? req.session.passport.user.id : req.session.passport.user;
        var serverUrl=fullUrl(req);
        var fileHolder;

        var busboy = new Busboy({ headers: req.headers });

        busboy.on('file', function(fieldname, file, filename, encoding, mimetype) {  
       
            userService.getAccountById(currentUserId).then(function(user) {              
                if(user && user.fileId){
                    fileService.deleteFileById(user.fileId);
                }
                return fileService.putFile(file,filename,mimetype);
            }).then(function(savedFile) { 
                fileHolder=savedFile;             
                return userService.updateUserProfilePic(currentUserId,savedFile._id.toString());
            }).then(function(user){   

                //Wrapping for consistency in UI
                var fileObject={};
                fileObject.id=fileHolder._id;
                fileObject.name=fileHolder.filename;
                fileObject.url=serverUrl+"/file/"+fileHolder._id.toString();         
              
                var wrapper={};
                wrapper.document=fileObject;

                return res.status(200).send(wrapper); 
            },function(error){
                return res.status(500).send(error); 
            });

        }).on('finish', function() {
          //console.log('Done parsing form!');
          //res.writeHead(303, { Connection: 'close'});
          //res.end();
        });

        req.pipe(busboy);        
    });  

    app.delete('/file/:id', function(req,res,next) {

        var currentUserId= req.session.passport.user ? req.session.passport.user.id : req.body.userId;
        var fileId=req.params.id;

        if(currentUserId && fileId){

            fileService.deleteFileById(fileId).then(function(resp) {                
                return userService.updateUserProfilePic(currentUserId,null);
            }).then(function(reply){
                return res.status(200).send("Deleted Successfully");    
            },function(error){
                return res.send(500, error);
            });

        }else{
            return res.status(401).send("unauthorized");
        }

    });

    return app;

}

function fullUrl(req) {
  return url.format({
    protocol: req.protocol,
    host: req.get('host')
  });
}