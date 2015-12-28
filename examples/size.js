/*jshint laxcomma: true, node: true, esnext:true*/
var dirco = require('../') //for the ES5 version use require('../es5')
; 

dirco(__dirname+'/../', {stats:'size'},function(err, result) {
 console.log(Math.round((size(result) / 1024), 10) + ' KB') ; 
});

function size(root) {
  var item, totalSize = 0
  , i ;
  for(i=0; i<root.length; i++) {
    item = root[i];
    totalSize += item.stats.size;
    if(item.children) {
      totalSize += size(item.children);
    }
  }
  return totalSize;
}


dirco(__dirname+'/../', {stats:'size', flat:true},function(err, result) {
 var i, totalSize = 0;
 for(i=0; i<result.length; i++) {
  totalSize += result[i].stats.size;
 }
 console.log(Math.round((totalSize / 1024), 10) + ' KB');
});


