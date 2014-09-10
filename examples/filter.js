var dirco = require('../') //used the ES5 version, use require('../lib/dirco') for ES6
; 



dirco(__dirname+'/../', {filters:[/^.+\.js$/i], flat:true, stats:false},function(err, result) {
  console.log(result)
});
