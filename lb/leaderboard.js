// ----------
// Packing:
// submodules/atom/atom.js
// submodules/style/style.js
// src/lb.js
// =atom.noConflict();
// =jQuery.noConflict(true);
// =style.noConflict();
// ----------

// Begin submodules/atom/atom.js
//
// atom.js
// https://github.com/zynga/atom
// Author: Chris Campbell (@quaelin)
// License: BSD
//
(function (undef) {
	'use strict';

	var //submodules/atom/atom.js:10//
		atom,
		name = 'atom',
		VERSION = '0.5.1',

		ObjProto = Object.prototype,
		hasOwn = ObjProto.hasOwnProperty,

		typeObj = 'object',
		typeUndef = 'undefined',
 //submodules/atom/atom.js:20//
		root = typeof window !== typeUndef ? window : global,
		had = hasOwn.call(root, name),
		prev = root[name]
	;


	// Convenience methods
	var slice = Array.prototype.slice;
	var isArray = Array.isArray || function (obj) {
		return ObjProto.toString.call(obj) === '[object Array]'; //submodules/atom/atom.js:30//
	};
	function inArray(arr, value) {
		for (var i = arr.length; --i >= 0;) {
			if (arr[i] === value) {
				return true;
			}
		}
	}
	function toArray(obj) {
		return isArray(obj) ? obj : [obj]; //submodules/atom/atom.js:40//
	}
	function isEmpty(obj) {
		for (var p in obj) {
			if (hasOwn.call(obj, p)) {
				return false;
			}
		}
		return true;
	}
 //submodules/atom/atom.js:50//

	// Property getter
	function get(nucleus, keyOrList, func) {
		var isList = isArray(keyOrList), keys = isList ? keyOrList : [keyOrList],
			key, values = [], props = nucleus.props, missing = {},
			result = { values: values };
		for (var i = keys.length; --i >= 0;) {
			key = keys[i];
			if (!hasOwn.call(props, key)) {
				result.missing = missing; //submodules/atom/atom.js:60//
				missing[key] = true;
			}
			values.unshift(props[key]);
		}
		return func ? func.apply({}, values) : result;
	}


	// Helper to remove an exausted listener from the listeners array
	function removeListener(listeners) { //submodules/atom/atom.js:70//
		for (var i = listeners.length; --i >= 0;) {
			// There should only be ONE exhausted listener.
			if (!listeners[i].calls) {
				return listeners.splice(i, 1);
			}
		}
	}


	// Used to detect listener recursion; a given object may only appear once. //submodules/atom/atom.js:80//
	var objStack = [];

	// Property setter
	function set(nucleus, key, value) {
		var keys, listener, listeners = nucleus.listeners, missing,
			listenersCopy = [].concat(listeners), i = listenersCopy.length,
			props = nucleus.props, oldValue = props[key],
			had = hasOwn.call(props, key),
			isObj = value && typeof value === typeObj;
		props[key] = value; //submodules/atom/atom.js:90//
		if (!had || oldValue !== value || (isObj && !inArray(objStack, value))) {
			if (isObj) {
				objStack.push(value);
			}
			while (--i >= 0) {
				listener = listenersCopy[i];
				keys = listener.keys;
				missing = listener.missing;
				if (missing) {
					if (hasOwn.call(missing, key)) { //submodules/atom/atom.js:100//
						delete missing[key];
						if (isEmpty(missing)) {
							listener.cb.apply({}, get(nucleus, keys).values);
							listener.calls--;
						}
					}
				} else if (inArray(keys, key)) {
					listener.cb.apply({}, get(nucleus, keys).values);
					listener.calls--;
				} //submodules/atom/atom.js:110//
				if (!listener.calls) {
					removeListener(listeners);
				}
			}
			delete nucleus.needs[key];
			if (isObj) {
				objStack.pop();
			}
		}
	} //submodules/atom/atom.js:120//


	// Helper function for setting up providers.
	function provide(nucleus, key, provider) {
		provider(function (result) {
			set(nucleus, key, result);
		});
	}

 //submodules/atom/atom.js:130//
	// Return an instance.
	atom = root[name] = function () {
		var
			args = slice.call(arguments, 0),
			nucleus = { props: {}, needs: {}, providers: {}, listeners: [] },
			props = nucleus.props,
			needs = nucleus.needs,
			providers = nucleus.providers,
			listeners = nucleus.listeners,
			q = [] //submodules/atom/atom.js:140//
		;

		// Execute the next function in the async queue.
		function doNext() {
			if (q) {
				q.pending = q.next = (!q.next && q.length) ?
					q.shift() : q.next;
				q.args = slice.call(arguments, 0);
				if (q.pending) {
					q.next = null; //submodules/atom/atom.js:150//
					q.pending.apply({}, [doNext].concat(q.args));
				}
			}
		}

		var me = {

			// Add a function or functions to the async queue.  Functions added
			// thusly must call their first arg as a callback when done.  Any args
			// provided to the callback will be passed in to the next function in //submodules/atom/atom.js:160//
			// the queue.
			chain: function () {
				if (q) {
					for (var i = 0, len = arguments.length; i < len; i++) {
						q.push(arguments[i]);
						if (!q.pending) {
							doNext.apply({}, q.args || []);
						}
					}
				} //submodules/atom/atom.js:170//
				return me;
			},

			// Remove references to all properties and listeners.  This releases
			// memory, and effective stops the atom from working.
			destroy: function () {
				delete nucleus.props;
				delete nucleus.needs;
				delete nucleus.providers;
				delete nucleus.listeners; //submodules/atom/atom.js:180//
				while (q.length) {
					q.pop();
				}
				nucleus = props = needs = providers = listeners =
					q = q.pending = q.next = q.args = null;
			},

			// Call `func` on each of the specified keys.  The key is provided as
			// the first arg, and the value as the second.
			each: function (keyOrList, func) { //submodules/atom/atom.js:190//
				var keys = toArray(keyOrList), i = -1, len = keys.length, key;
				while (++i < len) {
					key = keys[i];
					func(key, me.get(key));
				}
				return me;
			},

			// Establish two-way binding between a key or list of keys for two
			// different atoms, so that changing a property on either atom will //submodules/atom/atom.js:200//
			// propagate to the other.  If a map is provided for `keyOrListOrMap`,
			// properties on this atom may be bound to differently named properties
			// on `otherAtom`.  Note that entangled properties will not actually be
			// synchronized until the first change *after* entanglement.
			entangle: function (otherAtom, keyOrListOrMap) {
				var
					isList = isArray(keyOrListOrMap),
					isMap = !isList && typeof keyOrListOrMap === typeObj,
					i, key,
					keys = isList ? keyOrListOrMap : isMap ? [] : [keyOrListOrMap], //submodules/atom/atom.js:210//
					map = isMap ? keyOrListOrMap : {}
				;
				if (isMap) {
					for (key in map) {
						if (hasOwn.call(map, key)) {
							keys.push(key);
						}
					}
				} else {
					for (i = keys.length; --i >= 0;) { //submodules/atom/atom.js:220//
						key = keys[i];
						map[key] = key;
					}
				}
				me.each(keys, function (key) {
					var otherKey = map[key];
					me.bind(key, function (value) {
						otherAtom.set(otherKey, value);
					});
					otherAtom.bind(otherKey, function (value) { //submodules/atom/atom.js:230//
						me.set(key, value);
					});
				});
				return me;
			},

			// Get current values for the specified keys.  If `func` is provided,
			// it will be called with the values as args.
			get: function (keyOrList, func) {
				var result = get(nucleus, keyOrList, func); //submodules/atom/atom.js:240//
				return func ? result : typeof keyOrList === 'string' ?
					result.values[0] : result.values;
			},

			// Returns true iff all of the specified keys exist (regardless of
			// value).
			has: function (keyOrList) {
				var keys = toArray(keyOrList);
				for (var i = keys.length; --i >= 0;) {
					if (!hasOwn.call(props, keys[i])) { //submodules/atom/atom.js:250//
						return false;
					}
				}
				return true;
			},

			// Return a list of all keys.
			keys: function () {
				var keys = [];
				for (var key in props) { //submodules/atom/atom.js:260//
					if (hasOwn.call(props, key)) {
						keys.push(key);
					}
				}
				return keys;
			},

			// Add arbitrary properties to this atom's interface.
			mixin: function (obj) {
				for (var p in obj) { //submodules/atom/atom.js:270//
					if (hasOwn.call(obj, p)) {
						me[p] = obj[p];
					}
				}
				return me;
			},

			// Call `func` as soon as all of the specified keys have been set.  If
			// they are already set, the function will be called immediately, with
			// all the values provided as args.  In this, it is identical to //submodules/atom/atom.js:280//
			// `once()`.  However, calling `need()` will additionally invoke
			// providers when possible, in order to try and create the required
			// values.
			need: function (keyOrList, func) {
				var key, keys = toArray(keyOrList), provider;
				for (var i = keys.length; --i >= 0;) {
					key = keys[i];
					provider = providers[key];
					if (!hasOwn.call(props, key) && provider) {
						provide(nucleus, key, provider); //submodules/atom/atom.js:290//
						delete providers[key];
					} else {
						needs[key] = true;
					}
				}
				if (func) {
					me.once(keys, func);
				}
				return me;
			}, //submodules/atom/atom.js:300//

			// Call `func` whenever any of the specified keys is next changed.  The
			// values of all keys will be provided as args to the function.  The
			// function will automatically be unbound after being called the first
			// time, so it is guaranteed to be called no more than once.
			next: function (keyOrList, func) {
				listeners.unshift(
					{ keys: toArray(keyOrList), cb: func, calls: 1 });
				return me;
			}, //submodules/atom/atom.js:310//

			// Unregister a listener `func` that was previously registered using
			// `on()`, `bind()`, `need()`, `next()` or `once()`.
			off: function (func) { // alias: `unbind`
				for (var i = listeners.length; --i >= 0;) {
					if (listeners[i].cb === func) {
						listeners.splice(i, 1);
					}
				}
				return me; //submodules/atom/atom.js:320//
			},

			// Call `func` whenever any of the specified keys change.  The values
			// of the keys will be provided as args to func.
			on: function (keyOrList, func) { // alias: `bind`
				listeners.unshift({ keys: toArray(keyOrList), cb: func,
					calls: Infinity });
				return me;
			},
 //submodules/atom/atom.js:330//
			// Call `func` as soon as all of the specified keys have been set.  If
			// they are already set, the function will be called immediately, with
			// all the values provided as args.  Guaranteed to be called no more
			// than once.
			once: function (keyOrList, func) {
				var keys = toArray(keyOrList),
					results = get(nucleus, keys),
					values = results.values,
					missing = results.missing;
				if (!missing) { //submodules/atom/atom.js:340//
					func.apply({}, values);
				} else {
					listeners.unshift(
						{ keys: keys, cb: func, missing: missing, calls: 1 });
				}
				return me;
			},

			// Register a provider for a particular key.  The provider `func` is a
			// function that will be called if there is a need to create the key. //submodules/atom/atom.js:350//
			// It must call its first arg as a callback, with the value.  Provider
			// functions will be called at most once.
			provide: function (key, func) {
				if (needs[key]) {
					provide(nucleus, key, func);
				} else if (!providers[key]) {
					providers[key] = func;
				}
				return me;
			}, //submodules/atom/atom.js:360//

			// Set value for a key, or if `keyOrMap` is an object then set all the
			// keys' corresponding values.
			set: function (keyOrMap, value) {
				if (typeof keyOrMap === typeObj) {
					for (var key in keyOrMap) {
						if (hasOwn.call(keyOrMap, key)) {
							set(nucleus, key, keyOrMap[key]);
						}
					} //submodules/atom/atom.js:370//
				} else {
					set(nucleus, keyOrMap, value);
				}
				return me;
			}
		};
		me.bind = me.on;
		me.unbind = me.off;

		if (args.length) { //submodules/atom/atom.js:380//
			me.set.apply(me, args);
		}

		return me;
	};

	atom.VERSION = VERSION;

	// For backwards compatibility with < 0.4.0
	atom.create = atom; //submodules/atom/atom.js:390//

	atom.noConflict = function () {
		if (root[name] === atom) {
			root[name] = had ? prev : undef;
			if (!had) {
				try {
					delete root[name];
				} catch (ex) {
				}
			} //submodules/atom/atom.js:400//
		}
		return atom;
	};

	if (typeof module !== typeUndef && module.exports) {
		module.exports = atom;
	}
}());

// End submodules/atom/atom.js


// Begin submodules/style/style.js
//
// style.js is a tiny JavaScript utility that lets you write CSS in a JS object
// notation closely resembling actual CSS syntax.
//
(function (win, doc, undef) {
	var
		style,
		funcName = 'style',
		VERSION = '0.2.2',
		ObjProto = Object.prototype, //submodules/style/style.js:10//
		hasOwn = ObjProto.hasOwnProperty,
		had = hasOwn.call(win, funcName),
		previous = win[funcName],
		defaultEl,
		head,
		keys = {},
		isArray = Array.isArray || function (obj) {
			return ObjProto.toString.call(obj) === '[object Array]';
		}
	; //submodules/style/style.js:20//

	// Create a <style> element, and add it to <head>.
	function createEl() {
		var el = doc.createElement('style');
		el.type = 'text/css';
		head = head || doc.getElementsByTagName('head')[0];
		head.appendChild(el);
		return el;
	}
 //submodules/style/style.js:30//
	// Here is the actual style() function.
	style = win[funcName] = function (css, options, el) {
		var
			key = options && options.key,
			lines = [],
			prefix = options && options.prefix
		;
		if (!el) {
			el = defaultEl = defaultEl || createEl();
		} //submodules/style/style.js:40//
		if (key) {
			if (hasOwn.call(keys, key)) {
				return;
			}
			keys[key] = true;
		}
		function addRule(selector, rule) {
			var finalSelector = prefix ?
				selector.replace(/\./g, '.' + prefix) : selector;
			lines.push(finalSelector + ' {'); //submodules/style/style.js:50//
			if (isArray(rule)) {
				for (var i = -1, len = rule.length; ++i < len;) {
					var line = rule[i];
					lines.push(line[0] + ': ' + line[1] + ';');
				}
			} else {
				for (var prop in rule) {
					if (hasOwn.call(rule, prop)) {
						lines.push(prop + ': ' + rule[prop] + ';');
					} //submodules/style/style.js:60//
				}
			}
			lines.push('}');
		}
		if (typeof css === 'object') {
			if (isArray(css)) {
				for (var i = -1, len = css.length; ++i < len;) {
					var rule = css[i];
					addRule(rule[0], rule[1]);
				} //submodules/style/style.js:70//
			} else {
				for (var selector in css) {
					if (hasOwn.call(css, selector)) {
						addRule(selector, css[selector]);
					}
				}
			}
			css = lines.join('\n');
		}
		if (el.styleSheet) { // IE //submodules/style/style.js:80//
			el.styleSheet.cssText += css;
		} else {
			el.appendChild(doc.createTextNode(css));
		}
	};

	style.VERSION = VERSION;

	style.noConflict = function () {
		if (win[funcName] === style) { //submodules/style/style.js:90//
			win[funcName] = had ? previous : undef;
			if (!had) {
				try {
					delete win[funcName];
				} catch (ex) {
				}
			}
		}
		return style;
	}; //submodules/style/style.js:100//

	// For backwards compatibility, style.add() is an alias for style().
	style.add = style;

	// Force creation of a new <style> element, returning a scoped style()
	// function that will append styles to this new element.
	style.sheet = function () {
		var
			el = createEl(),
			sheetFunc = function (css, options) { //submodules/style/style.js:110//
				style(css, options, el);
			}
		;
		sheetFunc.add = sheetFunc;
		return sheetFunc;
	};

}(this, document));

// End submodules/style/style.js


// Begin src/lb.js
/*global atom, console, jQuery, style*/
(function (atom, $, style, win, doc, undef) {

	var
		lb,
		name = 'lb',
		ver = '0.0.3',
		ObjProto = Object.prototype,
		hasOwn = ObjProto.hasOwnProperty,
		had = hasOwn.call(win, name), //src/lb.js:10//
		previous = win[name],
		slice = Array.prototype.slice,

		a = atom(),
		need = a.need,
		provide = a.provide,
		once = a.once,
		set = a.set,

		each = $.each, //src/lb.js:20//
		getJSON = $.getJSON
	;

	function pre(classes) {
		var result = [];
		classes = classes.split(' ');
		each(classes, function (i, cl) {
			result.push('lb_' + cl);
		});
		return result.join(' '); //src/lb.js:30//
	}

	lb = win[name] = function () {
		var
			args = slice.call(arguments, 0),
			argsLen = args.length,
			params = argsLen ? args[0] : {},
			container = params.container,
			mainClass = pre('main')
		; //src/lb.js:40//
		$(function () {
			var
				body = $(doc.body)
			;
			set({
				body: body,
				container: (container && $(container)) ||
					$('<div></div>').appendTo(body),
				orgs: params.orgs || [
					'orgs/zynga', //src/lb.js:50//
					'orgs/playscript',
					'users/cocos2d'
				]
			});
		});
	};

	// Make these public
	lb.atom = atom;
	lb.style = style; //src/lb.js:60//
	lb.VERSION = ver;

	lb.dump = function () {
		if (console && console.log) {
			a.each(a.keys(), function (key, val) {
				console.log(key + ':', val);
			});
		}
	};
 //src/lb.js:70//
	lb.noConflict = function () {
		if (win[name] === lb) {
			win[name] = had ? previous : undef;
			if (!had) {
				try {
					delete win[name];
				} catch (ex) {
				}
			}
		} //src/lb.js:80//
		return lb;
	};

	function formatTop10(title, list) {
		var
			content = $(
				'<div class="' + pre('top10') + '">' +
					'<div class="' + pre('title') + '">' + title + '</div>' +
					'<ol></ol>' +
				'</div>' //src/lb.js:90//
			),
			ol = content.find('ol')
		;
		each(list, function (i, item) {
			var
				name = item.name,
				score = item.score,
				click = item.click,
				entry = $(
					'<li>' + //src/lb.js:100//
						'<a class="' + pre('item_name') + '" ' +
							'href="https://github.com/' + name + '">' + name + '</a>: ' +
						'<span class="' + pre('item_score') + '">' + score + '</span>' +
					'</li>'
				)
			;
			if (click) {
				entry.click(click);
			}
			ol.append(entry); //src/lb.js:110//
		});
		return content;
	}

	once(['body', 'container'], function (body, container) {
		need('top10reposByForks', function (top10) {
			container.append(formatTop10('Repos (by forks)', top10));
		});
		need('top10reposByWatchers', function (top10) {
			container.append(formatTop10('Repos (by watchers)', top10)); //src/lb.js:120//
		});
		need('top10reposByWatchersPlusForks', function (top10) {
			container.append(formatTop10('Repos (by watchers+forks)', top10));
		});
		need('top10reposByWatchersPlusForksPerKB', function (top10) {
			container.append(formatTop10('Repos (by watchers+forks per KB)', top10));
		});
	});

	function callAPI(method, callback) { //src/lb.js:130//
		var url = 'https://api.github.com/' + method + '?callback=?';
		getJSON(url, function (response) {
			callback(response.data);
		});
	}

	function getTopN(n, list, getName, getScore, done) {
		var len, roster = [];
		each(list, function (i, item) {
			roster.push({ //src/lb.js:140//
				name: getName(item),
				score: getScore(item),
				item: item
			});
		});
		roster.sort(function (a, b) {
			return b.score - a.score;
		});
		len = roster.length;
		if (len > n) { //src/lb.js:150//
			roster.splice(n, len - n);
		}
		done(roster);
	}

	function getRepoName(repo) {
		return repo.full_name;
	}

	provide('top10reposByForks', function (done) { //src/lb.js:160//
		need('repos', function (repos) {
			getTopN(
				10,
				repos,
				getRepoName,
				function (repo) { // getScore
					return +repo.forks || 0;
				},
				done
			); //src/lb.js:170//
		});
	});

	provide('top10reposByWatchers', function (done) {
		need('repos', function (repos) {
			getTopN(
				10,
				repos,
				getRepoName,
				function (repo) { // getScore //src/lb.js:180//
					return +repo.watchers || 0;
				},
				done
			);
		});
	});

	provide('top10reposByWatchersPlusForks', function (done) {
		need('repos', function (repos) {
			getTopN( //src/lb.js:190//
				10,
				repos,
				getRepoName,
				function (repo) { // getScore
					return repo.watchers + repo.forks;
				},
				done
			);
		});
	}); //src/lb.js:200//

	provide('top10reposByWatchersPlusForksPerKB', function (done) {
		need('repos', function (repos) {
			getTopN(
				10,
				repos,
				getRepoName,
				function (repo) { // getScore
					return (((repo.watchers + repo.forks) / repo.size) ||
						0).toFixed(2); //src/lb.js:210//
				},
				done
			);
		});
	});

	provide('repos', function (done) {
		once('orgs', function (orgs) {
			var flow = atom();
			each(orgs, function (i, org) { //src/lb.js:220//
				callAPI(org + '/repos', function (orgRepos) {
					flow.set(org, orgRepos);
				});
			});
			flow.once(orgs, function () {
				var repos = [];
				each(arguments, function (i, orgRepos) {
					repos = repos.concat(orgRepos);
				});
				done(repos); //src/lb.js:230//
			});
		});
	});

}(atom, jQuery, style, this, document));

// End src/lb.js


// Begin =atom.noConflict();
atom.noConflict();

// End =atom.noConflict();


// Begin =jQuery.noConflict(true);
jQuery.noConflict(true);

// End =jQuery.noConflict(true);


// Begin =style.noConflict();
style.noConflict();

// End =style.noConflict();

