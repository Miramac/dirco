dirco
=====
Node.js module for listing directories and files recursively. It's using ES 6 generators and [co](https://github.com/visionmedia/co).

It comes also with the [regenerator](https://github.com/facebook/regenerator) runtime so it can be used with ES 5 engines like node 0.10 or below.

## Install
```
  npm install dirco
```

## Usage
```js
//ES6
var dirco = require('dirco');
//ES5: 
var dirco = require('dirco/es5');


dirco(path [, options] , callback);
```

```js
//using ES5: 
var dirco = require('dirco/es5')
, util = require('util');

dirco('./node_modules', {depth:2}, function(err, result) {
    console.log(util.inspect((result), {showHidden: false, depth: null}));
});
```

## Options
````
depth: number (-1)                    // level of search depth, -1 is infinity
flat: bool (false)                   // list items in one array without hierarchy
stats: bool|array|string (true)       // append fs.Stats object
`````

Returns directories and files with name, path and fs.Stats info as a tree. 
```js
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
  
## Examples

Get total size of the directory (using flat option)
```js
//using ES5: 
var dirco = require('dirco/es5')

dirco('./', {flat:true},function(err, result) {
    var i, totalSize = 0;
    for(i=0; i<result.length; i++) {
        totalSize += result[i].stats.size;
    }
    console.log(Math.round((totalSize / 1024), 10) + ' KB') ; // 142 KB
});
```

var dirco = require('../es5') //using the ES5 version, use require('../') for ES6
; 
dirco(__dirname+'/../', {filters:[/^.+\.js$/i], flat:true, stats:false}, function(err, result) {
  console.log(result);
});


Searching in directory and file names using the filter option
````js
dirco(__dirname+'/../', {filters:[/^.+\.js$/i], flat:true, stats:false}, function(err, result) {
  console.log(result);
});

````

