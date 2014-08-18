var dirco = require('../')
, util = require('util')
, patter = /^\.bin$/i;

 dirco("../node_modules",  function(err, result) {
    var i;
    for(i=0; i<result.length; i++) {
      if(patter.test(result[i].name)) {
        console.log(util.inspect(result[i], {showHidden: false, depth: null}));
      }
    }
  });
