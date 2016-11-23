'use strict';
var express = require('express');
var router = express.Router();
const docker = require('../utils/dockerAPI');
var db = require('../db/config');
var User = require('../models/User');

router.post('/executeFile', function(req,res) {
  var fileName = req.body.fileName;
  var fileType = fileName.slice(fileName.lastIndexOf('.'));
  if(fileType === '.js') {
    var code = req.body.code;
    var newCode = code.replace(/\n/g, '\\n');
    newCode = newCode.replace(/\"/g, '\\\"');
    newCode = newCode.replace(/'/g, "\\\"");
    var command = 'bash -c "echo -e \'' + newCode + '\' > ' + req.body.filePath + '/' + fileName + '"'
    
    docker.runCommand(req.body.containerName, command, function(err, response) {
      if(err) {
        res.status(500).send(err);
      } else {
        docker.runCommand(req.body.containerName, 'node ' + req.body.filePath + '/' + fileName, function(err1, response1) {
          if(err1) {
            res.status(500).send(err);
          } else {
            res.status(200).send({res: response1, cmd: 'node'});
          }
        });
      }
    });
  } else if (fileType === '.rb') {
    var code = req.body.code;
    var newCode = code.replace(/\n/g, '\\n');
    newCode = newCode.replace(/\"/g, '\\\"');
    newCode = newCode.replace(/'/g, "\\\"");
    var command = 'bash -c "echo -e \'' + newCode + '\' > ' + req.body.filePath + '/' + fileName + '"'
    docker.runCommand(req.body.containerName, command, function(err, response) {
      if(err) {
        res.status(500).send(err);
      } else {
        docker.runCommand(req.body.containerName, 'ruby ' + req.body.filePath + '/' + fileName, function(err1, response1) {
          if(err1) {
            res.status(500).send(err);
          } else {
            res.status(200).send({res: response1, cmd: 'ruby'});
          }
        });
      }
    });
  } else {
    res.status(500).send({msg: "Cannot execute filetype '" + fileType + "'"});
  }
});

router.post('/handleFileBrowserChange', function(req, res) {
  var dir;
  if(req.body.dir.endsWith('/')) {
    dir = req.body.dir + req.body.entry;
  } else {
    dir = req.body.dir + '/' + req.body.entry;
  }
  //const dir = req.body.dir + '/' + req.body.entry
  docker.directoryExists(req.body.containerName, dir, function(dirExists) {
    if(dirExists.indexOf('Directory exists') !== -1) {
      res.status(200).send({type: 'dir', newDir: req.body.entry});
    } else {
      docker.runCommand(req.body.containerName, 'cat ' + dir, function(err, response) {
        if(err) {
          res.status(500).send(err);
        } else {
          res.status(200).send({type: 'file', fileContents: response});
        }
      })
    }
  });
});

router.post('/handleCodeSave', function (req, res) {
  /*
  const fileName = req.body.fileName;
  const containerName = req.body.containerName;
  const code = JSON.stringify(req.body.codeValue).replace(/'/g, "\\\"");
  const echo = "'echo -e ";
  const file = " > " + fileName + "'"
  const command = 'bash -c ' + echo + code + file;
  */
  //Refactor handleCodeSave to work on Windows. If it doesn't work on Mac, you can change it back to the above.
  console.log('IN HANDLE SAVE');
  var containerName = req.body.containerName;
  var code = req.body.codeValue;
  var newCode = code.replace(/\n/g, '\\n');
  newCode = newCode.replace(/\"/g, '\\\"');
  newCode = newCode.replace(/'/g, "\\\"");
  var command = 'bash -c "echo -e \'' + newCode + '\' > ' + req.body.filePath + '/' + req.body.fileName + '"'
  console.log('SAVE_CMD', command);
  docker.runCommand(containerName, command, function(err, response) {
    if (err) {
      console.log('ERR', err);
      res.status(500).send(err);
    } else {
      console.log('RESP', response);
      res.status(200).send(response);
    }
  });
});


module.exports = router;