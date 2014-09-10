var dirco = require('../')
, util = require('util')
, patter = /^\.bin$/i;

dirco("../node_modules", {depth:-1, stats:'size'},function(err, result) {
  var i;
 // console.log(util.inspect(result, {showHidden: false, depth: null}));
  console.log(util.inspect(search(result, patter), {showHidden: false, depth: null}));
  
});

function search(root, find) {
  var i, j
  , results = [];
  if(!root.length) return results;
  for (i=0; i<root.length; i++) {console.log(root[i])
    if(root[i].children) {
       console.log(root[i].children)
      for(j=0; root[i].children.length; j++) {
        results = results.concat(search(root[i].children[j], find));
      }
    }
    if (find.test(root[i].name)) {
      results.push(root[i]);
    }
  }
  return results;
}
