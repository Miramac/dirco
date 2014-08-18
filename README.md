dirco
=====
Node.js module to list files and directories recursively using ES 6 generators and [co](https://github.com/visionmedia/co).

## Install
```
  npm install dirco
```

## Usage
```js
  dirco(path [, options] , callback)
```

```js
  var dirco = require('dirco')
  , util = require('util');
  
  dirco("./node_modules", {deep:true}, function(err, result) {
    console.log(util.inspect((result), {showHidden: false, depth: null}));
  });
```

Returns simple object with filename, path and fs.Stats: 
```
[{
    "name": "co",
    "path": "node_modules\\co",
    "stats": {
      "dev": 0,
      "mode": 16822,
      "nlink": 1,
      "uid": 0,
      "gid": 0,
      "rdev": 0,
      "ino": 0,
      "size": 0,
      "atime": "2014-08-14T08:36:41.000Z",
      "mtime": "2014-08-14T08:36:41.000Z",
      "ctime": "2014-08-14T08:36:41.000Z"
    },
    "children": [
      {
        "name": "index.js",
        "path": "node_modules\\co\\index.js",
        "stats": {
          "dev": 0,
          "mode": 33206,
          "nlink": 1,
          "uid": 0,
          "gid": 0,
          "rdev": 0,
          "ino": 0,
          "size": 5466,
          "atime": "2014-08-14T08:36:41.000Z",
          "mtime": "2014-08-14T08:36:41.000Z",
          "ctime": "2014-08-14T08:36:41.000Z"
        }
      },
      {
        "name": "package.json",
        "path": "node_modules\\co\\package.json",
        "stats": {
          "dev": 0,
          "mode": 33206,
          "nlink": 1,
          "uid": 0,
          "gid": 0,
          "rdev": 0,
          "ino": 0,
          "size": 1214,
          "atime": "2014-08-14T08:36:41.000Z",
          "mtime": "2014-08-14T08:36:41.000Z",
          "ctime": "2014-08-14T08:36:41.000Z"
        }
      },
      {
        "name": "Readme.md",
        "path": "node_modules\\co\\Readme.md",
        "stats": {
          "dev": 0,
          "mode": 33206,
          "nlink": 1,
          "uid": 0,
          "gid": 0,
          "rdev": 0,
          "ino": 0,
          "size": 8053,
          "atime": "2014-08-14T08:36:41.000Z",
          "mtime": "2014-08-14T08:36:41.000Z",
          "ctime": "2014-08-14T08:36:41.000Z"
        }
      }
    ]
  }]
  ```
