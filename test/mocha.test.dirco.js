/*jshint laxcomma: true, node: true, esnext:true*/
/*global describe, it*/
var assert = require('assert')
, path = require('path')
;

describe('dirco', function(){

  describe('#find', function(){

    it('should it find this file', function(done){
      var dirco = require("../es5");
      dirco(__filename, function(err, data){
        if (err) throw err;
          assert.equal(data[0].name, path.basename(__filename));
          done();
      });
    });

    it('should it find this file path', function(done){
      var dirco = require("../es5");
      dirco(__filename, function(err, data){
        if (err) throw err;
          assert.equal(data[0].path, __filename);
          done();
      });
    });

    it('should it find at least one file', function(done){
      var dirco = require("../es5");
      dirco('./', function(err, data){
        if (err) throw err;
           assert.equal((data.length > 0), true, data.length + ' > 0');
          done();
      });
    });

  });


  describe('#stats', function(){

    it('this file should have a size', function(done){
      var dirco = require("../es5");
      dirco(__filename, function(err, data){
        if (err) throw err;
          assert.equal((data[0].stats.size > 0), true, data[0].stats.size + ' > 0');
          done();
      });
    });

  });

});
