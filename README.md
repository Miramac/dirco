dirco
=====
Node.js module for listing directories and files recursively. It's using ES 6 generators and [co](https://github.com/visionmedia/co), but wrap with the [regenerator](https://github.com/facebook/regenerator) runtime so it can be used with ES 5 engines like node 0.10 or below.

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
Searching in directory and file names
````js
var dirco = require('dirco')
, patter = /^.+\.js$/i; //find all .js files

dirco('./', {stats:false},function( err, result) {
  console.log(find(result,patter)); 
});

function find(root, patter) {
  var item, items = []
  , i ;
  for(i=0; i<root.length;i++) {
    item = root[i];
    if(item.name.match(patter)) {
      items.push(item.path);
    } else {
      if(item.children) {
        items = items.concat(find(item.children, patter));
      }
    }
  }
  return items;
}

````

Get total size of the directory (using flat option)
```js
var dirco = require('dirco');

dirco('./', {flat:true},function(err, result) {
 var i, totalSize = 0;
 for(i=0; i<result.length; i++) {
  totalSize += result[i].stats.size;
 }
 console.log(Math.round((totalSize / 1024), 10) + ' KB') ; // 142 KB
});
```
