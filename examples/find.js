var dirco = require('../') //used the ES5 version, use require('../lib/dirco') for ES6
, util = require('util')
, patter = /^.+\.js$/i; //find all .js files

dirco(__dirname+'/../', {depth:-1, stats:false},function(err, result) {
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