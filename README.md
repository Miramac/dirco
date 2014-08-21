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
  
  dirco("./node_modules", {depth:2}, function(err, result) {
    console.log(util.inspect((result), {showHidden: false, depth: null}));
  });
```

## Options
````
depth: number (-1)                    // level of search depth, -1 is infinity
flatt: bool (false)                   // list items without hierarchy (comming...) 
stats: bool|array|string (true)      // append fs.Stats object
`````

Returns directories and files with name, path and fs.Stats info as a tree. 
```
[{
    "name": "co",
    "path": "node_modules/co",
    "type": "directory",
    "stats": {
      //...
    },
    "children": [
      {
        "name": "index.js",
        "path": "node_modules/co/index.js",
        "type": "file",
        "stats": {
         //...
        }
      },
      {
        "name": "package.json",
        "path": "node_modules/co/package.json",
        "type": "file",
        "stats": {
          //...
        }
      },
      {
        "name": "Readme.md",
        "path": "node_modules/co/Readme.md",
        "type": "file",
        "stats": {
          //...
        }
      }
    ]
  }]
  ```
