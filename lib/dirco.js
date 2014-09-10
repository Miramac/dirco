var fs = require('fs')
, co = require('co')
, path = require('path')
;

function getFile(fullPath) {
  return function(fn){
    fs.stat(fullPath, function(err, stats){
      if (err) return fn(err);
      fn(null, {"name": path.basename(fullPath), "path":fullPath, "type": ((stats.isDirectory()) ? 'directory': 'file'), "stats": stats});
    });
  };
}

function getDirectory(fullPath) {
  return function(fn){
    fs.readdir(fullPath, function(err, files){
      if (err) return fn(err);
      fn(null, {"directory":fullPath, "files": files});
    });
  };
}

function *file(fullPath){
  return yield getFile(fullPath);
}

function *directory(fullPath){
  return yield getDirectory(fullPath);
}

function testFilter(str, filters) {
  var i;
  if(filters) {
    try {
      filters = (typeof filters === 'string') ? filters.split(',') : filters;
      for (i=0; i<filters.length; i++) {
        if (str.match(filters[i])){
          return true;
        }
      }
      return false;
    } catch(e) {  
      return false;
    }
  } else {
    return true;
  }
}

function *get(rootPath, options, level) {
  //parameter level is for internal use only!
  options = options || { };
  options.depth = (typeof options.depth !== 'undefined') ? options.depth : -1;
  options.stats = (typeof options.stats !== 'undefined') ? options.stats : true;
  options.flat = (typeof options.flat !== 'undefined') ? options.flat : false;
  options.filters = (typeof options.filters !== 'undefined') ? options.filters : false; //Flters make more sense with flat option ist true
  level = level || 0;
  
  var fsNode = yield file(rootPath)
  , currentDir
  , dirItem
  , fullPath
  , files = []
  , tmp
  , stats = {}
  , children
  , i;
  
  if ( fsNode.stats.isDirectory() ) {
    currentDir = yield directory(rootPath);
    for (i=0; i<currentDir.files.length; i++) { 
      dirItem = {};
      children = null;
      stats = {};
      children = [];
      fullPath = path.join(currentDir.directory, currentDir.files[i]);
      dirItem = yield file(fullPath);
      if(dirItem.stats.isDirectory() && (options.depth === -1 || options.depth >= level)) {
        children = yield get( dirItem.path , options, level+1);
        if(options.flat) {
          files = files.concat(children)
        } else {
          dirItem.children = children;
        }
      }
       if (options.stats !== true){
        if (typeof options.stats === 'string'){
          stats[options.stats] = dirItem.stats[options.stats];
          dirItem.stats = stats;
        } else {
          delete dirItem.stats;
        }
      } 
      if(testFilter(dirItem.name, options.filters)) {
        files.push(dirItem);
      }
    }
  }
  return yield files;
}

var dirco = function(rootPath, options, cb) {
  cb = (typeof cb !== 'undefined') ? cb : options;  
  options = (cb !== options) ? options : {};
  co(function *(){
    var result = yield get(rootPath, options); 
    cb(null,result);
  })();
};

module.exports = dirco;
