/**
 * Based on continuation-local-storage package
 * (https://github.com/othiym23/node-continuation-local-storage)
 */
import assert from 'assert';
import wrapEmitter from 'emitter-listener';

const CONTEXTS_SYMBOL = 'cls@contexts';
const ERROR_SYMBOL = 'error@context';

// load polyfill if native support is unavailable
if (!(process as any).addAsyncListener) require('async-listener');

export class Namespace {
  private name: string;
  public active: any = null;
  private _set: any[] = [];
  public id: any = null;

  constructor(name: string) {
    this.name   = name;
  }

  set(key: string, value: any) {
    if (!this.active) {
      throw new Error('No context available. ns.run() or ns.bind() must be called first.');
    }

    this.active[key] = value;
    return value;
  }

  get(key: string) {
    if (!this.active) return undefined;

    return this.active[key];
  }

  createContext() {
    return Object.create(this.active);
  }

  run(fn: any) {
    var context = this.createContext();
    this.enter(context);
    try {
      fn(context);
      return context;
    }
    catch (exception) {
      if (exception) {
        exception[ERROR_SYMBOL] = context;
      }
      throw exception;
    }
    finally {
      this.exit(context);
    }
  }

  runAndReturn(fn: any) {
    var value;
    this.run(function (context: any) {
      value = fn(context);
    });
    return value;
  }

  bind(fn: any, context: any) {
    if (!context) {
      if (!this.active) {
        context = this.createContext();
      }
      else {
        context = this.active;
      }
    }

    var self = this;
    return function (this: any, ...args: any[]) {
      self.enter(context);
      try {
        return fn.apply(this, args);
      }
      catch (exception) {
        if (exception) {
          exception[ERROR_SYMBOL] = context;
        }
        throw exception;
      }
      finally {
        self.exit(context);
      }
    };
  }

  enter(context: any) {
    assert.ok(context, 'context must be provided for entering');

    this._set.push(this.active);
    this.active = context;
  }

  exit(context: any) {
    assert.ok(context, 'context must be provided for exiting');

    // Fast path for most exits that are at the top of the stack
    if (this.active === context) {
      assert.ok(this._set.length, 'can\'t remove top context');
      this.active = this._set.pop();
      return;
    }

    // Fast search in the stack using lastIndexOf
    var index = this._set.lastIndexOf(context);

    assert.ok(index >= 0, 'context not currently entered; can\'t exit');
    assert.ok(index,      'can\'t remove top context');

    this._set.splice(index, 1);
  }

  bindEmitter(emitter: any) {
    assert.ok(emitter.on && emitter.addListener && emitter.emit, 'can only bind real EEs');

    var namespace  = this;
    var thisSymbol = 'context@' + this.name;

    // Capture the context active at the time the emitter is bound.
    function attach(listener: any) {
      if (!listener) return;
      if (!listener[CONTEXTS_SYMBOL]) listener[CONTEXTS_SYMBOL] = Object.create(null);

      listener[CONTEXTS_SYMBOL][thisSymbol] = {
        namespace : namespace,
        context   : namespace.active
      };
    }

    // At emit time, bind the listener within the correct context.
    function bind(unwrapped: any) {
      if (!(unwrapped && unwrapped[CONTEXTS_SYMBOL])) return unwrapped;

      var wrapped  = unwrapped;
      var contexts = unwrapped[CONTEXTS_SYMBOL];
      Object.keys(contexts).forEach(function (name) {
        var thunk = contexts[name];
        wrapped = thunk.namespace.bind(wrapped, thunk.context);
      });
      return wrapped;
    }

    wrapEmitter(emitter, attach, bind);
  }

  /**
   * If an error comes out of a namespace, it will have a context attached to it.
   * This function knows how to find it.
   *
   * @param {Error} exception Possibly annotated error.
   */
  fromException(exception: any) {
    return exception[ERROR_SYMBOL];
  }
}

function get(name: any) {
  return (process as any).namespaces[name] as Namespace;
}

function create(name: string) {
  assert.ok(name, 'namespace must be given a name!');

  var namespace = new Namespace(name);
  namespace.id = (process as any).addAsyncListener({
    create : function () { return namespace.active; },
    before : function (context: any, storage: any) { if (storage) namespace.enter(storage); },
    after  : function (context: any, storage: any) { if (storage) namespace.exit(storage); },
    error  : function (storage: any) { if (storage) namespace.exit(storage); }
  });

  (process as any).namespaces[name] = namespace;
  return namespace;
}

function destroy(name: string) {
  var namespace = get(name);

  assert.ok(namespace,    'can\'t delete nonexistent namespace!');
  assert.ok(namespace.id, 'don\'t assign to process.namespaces directly!');

  (process as any).removeAsyncListener(namespace.id);
  (process as any).namespaces[name] = null;
}

function reset() {
  // must unregister async listeners
  if ((process as any).namespaces) {
    Object.keys((process as any).namespaces).forEach(function (name) {
      destroy(name);
    });
  }
  (process as any).namespaces = Object.create(null);
}
if (!(process as any).namespaces) reset(); // call immediately to set up

export {
  get as getNamespace,
  create as createNamespace,
  destroy as destroyNamespace,
  reset as reset
};
