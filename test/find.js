var dirco = require('../')
, util = require('util')
, patter = /^\.bin$/i;

dirco("../node_modules", {depth:1, stats:'size'},function(err, result) {
  var i;
 // console.log(util.inspect(result, {showHidden: false, depth: null}));
  for(i=0; i<result.length; i++) {
    if(patter.test(result[i].name)) {
      console.log(util.inspect(result[i], {showHidden: false, depth: null}));
    }
  }
});
