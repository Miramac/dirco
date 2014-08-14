(function(
  // Reliable reference to the global object (i.e. window in browsers).
  global,

  // Dummy constructor that we use as the .constructor property for
  // functions that return Generator objects.
  GeneratorFunction,

  // Undefined value, more compressible than void 0.
  undefined
) {
  var hasOwn = Object.prototype.hasOwnProperty;

  if (global.wrapGenerator) {
    return;
  }

  function wrapGenerator(innerFn, outerFn, self, tryList) {
    return new Generator(innerFn, outerFn, self || null, tryList || []);
  }

  global.wrapGenerator = wrapGenerator;
  if (typeof exports !== "undefined") {
    exports.wrapGenerator = wrapGenerator;
  }

  var GenStateSuspendedStart = "suspendedStart";
  var GenStateSuspendedYield = "suspendedYield";
  var GenStateExecuting = "executing";
  var GenStateCompleted = "completed";

  // Returning this object from the innerFn has the same effect as
  // breaking out of the dispatch switch statement.
  var ContinueSentinel = {};

  var Gp = Generator.prototype;
  var GFp = GeneratorFunction.prototype = Object.create(Function.prototype);
  GFp.constructor = GeneratorFunction;
  GFp.prototype = Gp;
  Gp.constructor = GFp;

  wrapGenerator.mark = function(genFun) {
    genFun.__proto__ = GFp;
    genFun.prototype = Object.create(Gp);
    return genFun;
  };

  // Ensure isGeneratorFunction works when Function#name not supported.
  if (GeneratorFunction.name !== "GeneratorFunction") {
    GeneratorFunction.name = "GeneratorFunction";
  }

  wrapGenerator.isGeneratorFunction = function(genFun) {
    var ctor = genFun && genFun.constructor;
    return ctor ? GeneratorFunction.name === ctor.name : false;
  };

  function Generator(innerFn, outerFn, self, tryList) {
    var generator = outerFn ? Object.create(outerFn.prototype) : this;
    var context = new Context(tryList);
    var state = GenStateSuspendedStart;

    function invoke(method, arg) {
      if (state === GenStateExecuting) {
        throw new Error("Generator is already running");
      }

      if (state === GenStateCompleted) {
        throw new Error("Generator has already finished");
      }

      while (true) {
        var delegate = context.delegate;
        if (delegate) {
          try {
            var info = delegate.iterator[method](arg);

            // Delegate generator ran and handled its own exceptions so
            // regardless of what the method was, we continue as if it is
            // "next" with an undefined arg.
            method = "next";
            arg = undefined;

          } catch (uncaught) {
            context.delegate = null;

            // Like returning generator.throw(uncaught), but without the
            // overhead of an extra function call.
            method = "throw";
            arg = uncaught;

            continue;
          }

          if (info.done) {
            context[delegate.resultName] = info.value;
            context.next = delegate.nextLoc;
          } else {
            state = GenStateSuspendedYield;
            return info;
          }

          context.delegate = null;
        }

        if (method === "next") {
          if (state === GenStateSuspendedStart &&
              typeof arg !== "undefined") {
            // https://people.mozilla.org/~jorendorff/es6-draft.html#sec-generatorresume
            throw new TypeError(
              "attempt to send " + JSON.stringify(arg) + " to newborn generator"
            );
          }

          if (state === GenStateSuspendedYield) {
            context.sent = arg;
          } else {
            delete context.sent;
          }

        } else if (method === "throw") {
          if (state === GenStateSuspendedStart) {
            state = GenStateCompleted;
            throw arg;
          }

          if (context.dispatchException(arg)) {
            // If the dispatched exception was caught by a catch block,
            // then let that catch block handle the exception normally.
            method = "next";
            arg = undefined;
          }
        }

        state = GenStateExecuting;

        try {
          var value = innerFn.call(self, context);

          // If an exception is thrown from innerFn, we leave state ===
          // GenStateExecuting and loop back for another invocation.
          state = context.done
            ? GenStateCompleted
            : GenStateSuspendedYield;

          var info = {
            value: value,
            done: context.done
          };

          if (value === ContinueSentinel) {
            if (context.delegate && method === "next") {
              // Deliberately forget the last sent value so that we don't
              // accidentally pass it on to the delegate.
              arg = undefined;
            }
          } else {
            return info;
          }

        } catch (thrown) {
          state = GenStateCompleted;

          if (method === "next") {
            context.dispatchException(thrown);
          } else {
            arg = thrown;
          }
        }
      }
    }

    generator.next = invoke.bind(generator, "next");
    generator.throw = invoke.bind(generator, "throw");

    return generator;
  }

  Gp[typeof Symbol === "function"
     && Symbol.iterator
     || "@@iterator"] = function() {
    return this;
  };

  Gp.toString = function() {
    return "[object Generator]";
  };

  function pushTryEntry(triple) {
    var entry = { tryLoc: triple[0] };

    if (1 in triple) {
      entry.catchLoc = triple[1];
    }

    if (2 in triple) {
      entry.finallyLoc = triple[2];
    }

    this.tryEntries.push(entry);
  }

  function resetTryEntry(entry, i) {
    var record = entry.completion || {};
    record.type = i === 0 ? "normal" : "return";
    delete record.arg;
    entry.completion = record;
  }

  function Context(tryList) {
    // The root entry object (effectively a try statement without a catch
    // or a finally block) gives us a place to store values thrown from
    // locations where there is no enclosing try statement.
    this.tryEntries = [{ tryLoc: "root" }];
    tryList.forEach(pushTryEntry, this);
    this.reset();
  }

  wrapGenerator.keys = function(object) {
    var keys = [];
    for (var key in object) {
      keys.push(key);
    }
    keys.reverse();

    // Rather than returning an object with a next method, we keep
    // things simple and return the next function itself.
    return function next() {
      while (keys.length) {
        var key = keys.pop();
        if (key in object) {
          next.value = key;
          next.done = false;
          return next;
        }
      }

      // To avoid creating an additional object, we just hang the .value
      // and .done properties off the next function object itself. This
      // also ensures that the minifier will not anonymize the function.
      next.done = true;
      return next;
    };
  };

  function values(iterable) {
    var iterator = iterable;
    var Symbol = global.Symbol;
    if (Symbol && Symbol.iterator in iterable) {
      iterator = iterable[Symbol.iterator]();
    } else if (!isNaN(iterable.length)) {
      var i = -1;
      iterator = function next() {
        while (++i < iterable.length) {
          if (i in iterable) {
            next.value = iterable[i];
            next.done = false;
            return next;
          }
        };
        next.done = true;
        return next;
      };
      iterator.next = iterator;
    }
    return iterator;
  }
  wrapGenerator.values = values;

  Context.prototype = {
    constructor: Context,

    reset: function() {
      this.prev = 0;
      this.next = 0;
      this.sent = undefined;
      this.done = false;
      this.delegate = null;

      this.tryEntries.forEach(resetTryEntry);

      // Pre-initialize at least 20 temporary variables to enable hidden
      // class optimizations for simple generators.
      for (var tempIndex = 0, tempName;
           hasOwn.call(this, tempName = "t" + tempIndex) || tempIndex < 20;
           ++tempIndex) {
        this[tempName] = null;
      }
    },

    stop: function() {
      this.done = true;

      var rootEntry = this.tryEntries[0];
      var rootRecord = rootEntry.completion;
      if (rootRecord.type === "throw") {
        throw rootRecord.arg;
      }

      return this.rval;
    },

    dispatchException: function(exception) {
      if (this.done) {
        throw exception;
      }

      var context = this;
      function handle(loc, caught) {
        record.type = "throw";
        record.arg = exception;
        context.next = loc;
        return !!caught;
      }

      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
        var entry = this.tryEntries[i];
        var record = entry.completion;

        if (entry.tryLoc === "root") {
          // Exception thrown outside of any try block that could handle
          // it, so set the completion value of the entire function to
          // throw the exception.
          return handle("end");
        }

        if (entry.tryLoc <= this.prev) {
          var hasCatch = hasOwn.call(entry, "catchLoc");
          var hasFinally = hasOwn.call(entry, "finallyLoc");

          if (hasCatch && hasFinally) {
            if (this.prev < entry.catchLoc) {
              return handle(entry.catchLoc, true);
            } else if (this.prev < entry.finallyLoc) {
              return handle(entry.finallyLoc);
            }

          } else if (hasCatch) {
            if (this.prev < entry.catchLoc) {
              return handle(entry.catchLoc, true);
            }

          } else if (hasFinally) {
            if (this.prev < entry.finallyLoc) {
              return handle(entry.finallyLoc);
            }

          } else {
            throw new Error("try statement without catch or finally");
          }
        }
      }
    },

    _findFinallyEntry: function(finallyLoc) {
      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
        var entry = this.tryEntries[i];
        if (entry.tryLoc <= this.prev &&
            hasOwn.call(entry, "finallyLoc") && (
              entry.finallyLoc === finallyLoc ||
              this.prev < entry.finallyLoc)) {
          return entry;
        }
      }
    },

    abrupt: function(type, arg) {
      var entry = this._findFinallyEntry();
      var record = entry ? entry.completion : {};

      record.type = type;
      record.arg = arg;

      if (entry) {
        this.next = entry.finallyLoc;
      } else {
        this.complete(record);
      }

      return ContinueSentinel;
    },

    complete: function(record) {
      if (record.type === "throw") {
        throw record.arg;
      }

      if (record.type === "break" ||
          record.type === "continue") {
        this.next = record.arg;
      } else if (record.type === "return") {
        this.rval = record.arg;
        this.next = "end";
      }

      return ContinueSentinel;
    },

    finish: function(finallyLoc) {
      var entry = this._findFinallyEntry(finallyLoc);
      return this.complete(entry.completion);
    },

    "catch": function(tryLoc) {
      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
        var entry = this.tryEntries[i];
        if (entry.tryLoc === tryLoc) {
          var record = entry.completion;
          if (record.type === "throw") {
            var thrown = record.arg;
            resetTryEntry(entry, i);
          }
          return thrown;
        }
      }

      // The context.catch method must only be called with a location
      // argument that corresponds to a known catch block.
      throw new Error("illegal catch attempt");
    },

    delegateYield: function(iterable, resultName, nextLoc) {
      this.delegate = {
        iterator: values(iterable),
        resultName: resultName,
        nextLoc: nextLoc
      };

      return ContinueSentinel;
    }
  };
}).apply(this, Function("return [this, function GeneratorFunction(){}]")());

var file = wrapGenerator.mark(function file(fullPath) {
  return wrapGenerator(function file$(context$1$0) {
    while (1) switch (context$1$0.prev = context$1$0.next) {
    case 0:
      context$1$0.next = 2;
      return getFile(fullPath);
    case 2:
      return context$1$0.abrupt("return", context$1$0.sent);
    case 3:
    case "end":
      return context$1$0.stop();
    }
  }, file, this);
});

var directory = wrapGenerator.mark(function directory(fullPath) {
  return wrapGenerator(function directory$(context$1$0) {
    while (1) switch (context$1$0.prev = context$1$0.next) {
    case 0:
      context$1$0.next = 2;
      return getDirectory(fullPath);
    case 2:
      return context$1$0.abrupt("return", context$1$0.sent);
    case 3:
    case "end":
      return context$1$0.stop();
    }
  }, directory, this);
});

var get = wrapGenerator.mark(function get(rootPath, options, level) {
  var fsNode, currentDir, dirItem, fullPath, files, tmp, children;

  return wrapGenerator(function get$(context$1$0) {
    while (1) switch (context$1$0.prev = context$1$0.next) {
    case 0:
      options = options || { };
      options.deep = (options.deep !== 'undefined') ? options.deep : true;
      level = level || 0;

      context$1$0.next = 5;
      return file(rootPath);
    case 5:
      fsNode = context$1$0.sent;
      files = [];

      if (!fsNode.stats.isDirectory()) {
        context$1$0.next = 23;
        break;
      }

      context$1$0.next = 10;
      return directory(rootPath);
    case 10:
      currentDir = context$1$0.sent;
      i=0;
    case 12:
      if (!(i < currentDir.files.length)) {
        context$1$0.next = 23;
        break;
      }

      dirItem = {};
      fullPath = path.join(currentDir.directory, currentDir.files[i]);
      context$1$0.next = 17;
      return file(fullPath);
    case 17:
      dirItem = context$1$0.sent;
      if(dirItem.stats.isDirectory() && (options.deep === true || (options.deep !== false && options.deep >= level))) {
        children = get(fullPath, options, level+1);
        dirItem.children = children;
      }
      files.push(dirItem);
    case 20:
      i++;
      context$1$0.next = 12;
      break;
    case 23:
      context$1$0.next = 25;
      return files;
    case 25:
      return context$1$0.abrupt("return", context$1$0.sent);
    case 26:
    case "end":
      return context$1$0.stop();
    }
  }, get, this);
});

var fs = require('fs')
, co = require('co')
, path = require('path');


function getFile(fullPath) {
  return function(fn){
    fs.stat(fullPath, function(err, stats){
      if (err) return fn(err);
      fn(null, {"name": path.basename(fullPath), "path":fullPath, "stats": stats});
    });
  }
}
function getDirectory(fullPath) {
  return function(fn){
    fs.readdir(fullPath, function(err, files){
      if (err) return fn(err);
      fn(null, {"directory":fullPath, "files": files});
    });
  }
}

function testFilter(str, filters) {
  var i;
	if(filters) {
		try {
			for (i=0; i<filters.length; i++) {
				if (str.match(filters[i])){
					return true;
				}
			}
			return false;
		} catch(e) {	
			return false;
		}
	} else {
		return true;
	}
}


var dirco = function(rootPath, options, cb) {
  co(wrapGenerator.mark(function callee$1$0() {
    var result;

    return wrapGenerator(function callee$1$0$(context$2$0) {
      while (1) switch (context$2$0.prev = context$2$0.next) {
      case 0:
        context$2$0.next = 2;
        return get(rootPath, options);
      case 2:
        result = context$2$0.sent;
        cb(null,result);
      case 4:
      case "end":
        return context$2$0.stop();
      }
    }, callee$1$0, this);
  }))();
};
dirco.prototype.file = file;
dirco.prototype.directory = directory;
dirco.prototype.get = get;

module.exports = dirco;