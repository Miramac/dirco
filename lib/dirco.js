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
  options = options || { };
  options.depth = (typeof options.depth === 'number') ? options.depth : -1;
  options.stats = (typeof options.stats !== 'undefined') ? options.stats : true;
  options.flatt = (typeof options.flatt !== 'undefined') ? options.flatt : false;
  level = level || 0;
  
  var fsNode = yield file(rootPath)
  , currentDir
  , dirItem
  , fullPath
  , files = []
  , tmp
  , children
  , stats = {};
  if ( fsNode.stats.isDirectory() ) {
    currentDir = yield directory(rootPath);
    for (i=0; i<currentDir.files.length; i++) { 
      dirItem = {};
      children = null;
      stats = {};
      fullPath = path.join(currentDir.directory, currentDir.files[i]);
      dirItem = yield file(fullPath);
      if(dirItem.stats.isDirectory() && (options.depth === -1 || options.depth >= level)) {
        children = get(fullPath, options, level+1);
        dirItem.children = children;
      }
      if (options.stats !== true){
        if (typeof options.stats === 'string'){
          stats[options.stats] = dirItem.stats[options.stats];
          dirItem.stats = stats;
        } else {
          delete dirItem.stats;
        }
    }
      files.push(dirItem);
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
