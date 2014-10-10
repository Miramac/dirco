/*jshint laxcomma: true, node: true, esnext:true*/
var dirco = require('../es5') //using the ES5 version, use require('../') for ES6
; 


dirco(__dirname+'/../', {filters:[/^.+\.js$/i], flat:true, stats:false}, function(err, result) {
  console.log(result);
});
