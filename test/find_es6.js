var dirco = require('../lib/dirco')
, util = require('util')
, patter = /^.+\.sql$/i;

dirco("p:\\Daimler\\DC54_01A_DES_2014\\07_SQL_und_Cognos", {depth:-1, stats:false},function(err, result) {
 // console.log(util.inspect(result, {showHidden: false, depth: null}));
  console.log(find(result,patter)); // /^\W*(\d+_)*alt\W*$/ig));
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
