/*! 
 * Conbo.js: Lightweight MVC application framework for JavaScript
 * http://conbojs.mesmotronic.com/
 * 
 * Copyright (c) 2013 Mesmotronic Limited
 * Released under the MIT license
 * http://www.mesmotronic.com/legal/mit
 */

/**
 * CONBO.JS
 * 
 * Conbo.js is a lightweight MVC application framework for JavaScript featuring 
 * dependency injection, context and encapsulation, data binding, command 
 * pattern and an event model which enables callback scoping and consistent 
 * event handling
 * 
 * Dependencies
 *
 * Lite: None
 * Core and Complete: jQuery 1.7+
 * 
 * @author		Neil Rackett
 * @see			http://www.mesmotronic.com/
 */

(function(window, document, undefined)
{
	var create = function($)
	{
		var conbo = 
		{
			VERSION:'2.0.0',
			
			toString: function() 
			{ 
				return 'Conbo '+this.VERSION; 
			}
		};
		
		if (!!$)
		{
			conbo.$ = $;
		}
		
/*
 * Utility methods
 * A modified subset of Underscore.js methods, plus loads of our own
 */

var _ = {};

(function() 
{
	// Establish the object that gets returned to break out of a loop iteration.
	var breaker = {};

	// Save bytes in the minified (but not gzipped) version:
	var
		ArrayProto = Array.prototype, 
		ObjProto = Object.prototype, 
		FuncProto = Function.prototype;

	// Create quick reference variables for speed access to core prototypes.
	var
		push			= ArrayProto.push,
		slice			= ArrayProto.slice,
		concat			= ArrayProto.concat,
		toString		= ObjProto.toString,
		hasOwnProperty	= ObjProto.hasOwnProperty;

	// All **ECMAScript 5** native function implementations that we hope to use
	// are declared here.
	var
		nativeForEach		= ArrayProto.forEach,
		nativeMap			= ArrayProto.map,
		nativeReduce		= ArrayProto.reduce,
		nativeReduceRight	= ArrayProto.reduceRight,
		nativeFilter		= ArrayProto.filter,
		nativeEvery			= ArrayProto.every,
		nativeSome			= ArrayProto.some,
		nativeIndexOf		= ArrayProto.indexOf,
		nativeLastIndexOf	= ArrayProto.lastIndexOf,
		nativeIsArray		= Array.isArray,
		nativeKeys			= Object.keys,
		nativeBind			= FuncProto.bind;

	// Collection Functions
	// --------------------

	// The cornerstone, an `each` implementation, aka `forEach`.
	// Handles objects with the built-in `forEach`, arrays, and raw objects.
	// Delegates to **ECMAScript 5**'s native `forEach` if available.
	var each = _.each = function(obj, iterator, context) {
		if (obj == null) return obj;
		if (nativeForEach && obj.forEach === nativeForEach) {
			obj.forEach(iterator, context);
		} else if (obj.length === +obj.length) {
			for (var i = 0, length = obj.length; i < length; i++) {
				if (iterator.call(context, obj[i], i, obj) === breaker) return;
			}
		} else {
			var keys = _.keys(obj);
			for (var i = 0, length = keys.length; i < length; i++) {
				if (iterator.call(context, obj[keys[i]], keys[i], obj) === breaker) return;
			}
		}
		return obj;
	};

	// Return the results of applying the iterator to each element.
	// Delegates to **ECMAScript 5**'s native `map` if available.
	_.map = function(obj, iterator, context) {
		var results = [];
		if (obj == null) return results;
		if (nativeMap && obj.map === nativeMap) return obj.map(iterator, context);
		each(obj, function(value, index, list) {
			results.push(iterator.call(context, value, index, list));
		});
		return results;
	};

	var reduceError = 'Reduce of empty array with no initial value';

	// **Reduce** builds up a single result from a list of values, aka `inject`,
	// or `foldl`. Delegates to **ECMAScript 5**'s native `reduce` if available.
//	_.reduce = _.foldl = _.inject = function(obj, iterator, memo, context) {
//		var initial = arguments.length > 2;
//		if (obj == null) obj = [];
//		if (nativeReduce && obj.reduce === nativeReduce) {
//			if (context) iterator = _.bind(iterator, context);
//			return initial ? obj.reduce(iterator, memo) : obj.reduce(iterator);
//		}
//		each(obj, function(value, index, list) {
//			if (!initial) {
//				memo = value;
//				initial = true;
//			} else {
//				memo = iterator.call(context, memo, value, index, list);
//			}
//		});
//		if (!initial) throw new TypeError(reduceError);
//		return memo;
//	};

	// The right-associative version of reduce, also known as `foldr`.
	// Delegates to **ECMAScript 5**'s native `reduceRight` if available.
//	_.reduceRight = _.foldr = function(obj, iterator, memo, context) {
//		var initial = arguments.length > 2;
//		if (obj == null) obj = [];
//		if (nativeReduceRight && obj.reduceRight === nativeReduceRight) {
//			if (context) iterator = _.bind(iterator, context);
//			return initial ? obj.reduceRight(iterator, memo) : obj.reduceRight(iterator);
//		}
//		var length = obj.length;
//		if (length !== +length) {
//			var keys = _.keys(obj);
//			length = keys.length;
//		}
//		each(obj, function(value, index, list) {
//			index = keys ? keys[--length] : --length;
//			if (!initial) {
//				memo = obj[index];
//				initial = true;
//			} else {
//				memo = iterator.call(context, memo, obj[index], index, list);
//			}
//		});
//		if (!initial) throw new TypeError(reduceError);
//		return memo;
//	};

	// Return the first value which passes a truth test. Aliased as `detect`.
	_.find = function(obj, predicate, context) {
		var result;
		any(obj, function(value, index, list) {
			if (predicate.call(context, value, index, list)) {
				result = value;
				return true;
			}
		});
		return result;
	};

	// Return all the elements that pass a truth test.
	// Delegates to **ECMAScript 5**'s native `filter` if available.
	// Aliased as `select`.
	_.filter = function(obj, predicate, context) {
		var results = [];
		if (obj == null) return results;
		if (nativeFilter && obj.filter === nativeFilter) return obj.filter(predicate, context);
		each(obj, function(value, index, list) {
			if (predicate.call(context, value, index, list)) results.push(value);
		});
		return results;
	};

	// Return all the elements for which a truth test fails.
//	_.reject = function(obj, predicate, context) {
//		return _.filter(obj, function(value, index, list) {
//			return !predicate.call(context, value, index, list);
//		}, context);
//	};

	// Determine whether all of the elements match a truth test.
	// Delegates to **ECMAScript 5**'s native `every` if available.
	// Aliased as `all`.
	_.every = function(obj, predicate, context) {
		predicate || (predicate = _.identity);
		var result = true;
		if (obj == null) return result;
		if (nativeEvery && obj.every === nativeEvery) return obj.every(predicate, context);
		each(obj, function(value, index, list) {
			if (!(result = result && predicate.call(context, value, index, list))) return breaker;
		});
		return !!result;
	};

	// Determine if at least one element in the object matches a truth test.
	// Delegates to **ECMAScript 5**'s native `some` if available.
	// Aliased as `any`.
	var any = _.any = function(obj, predicate, context) {
		predicate || (predicate = _.identity);
		var result = false;
		if (obj == null) return result;
		if (nativeSome && obj.some === nativeSome) return obj.some(predicate, context);
		each(obj, function(value, index, list) {
			if (result || (result = predicate.call(context, value, index, list))) return breaker;
		});
		return !!result;
	};

	// Determine if the array or object contains a given value (using `===`).
	_.contains = function(obj, target) {
		if (obj == null) return false;
		if (nativeIndexOf && obj.indexOf === nativeIndexOf) return obj.indexOf(target) != -1;
		return any(obj, function(value) {
			return value === target;
		});
	};

	// Invoke a method (with arguments) on every item in a collection.
	_.invoke = function(obj, method) {
		var args = slice.call(arguments, 2);
		var isFunc = _.isFunction(method);
		return _.map(obj, function(value) {
			return (isFunc ? method : value[method]).apply(value, args);
		});
	};

	// Convenience version of a common use case of `map`: fetching a property.
	_.pluck = function(obj, key) {
		return _.map(obj, _.property(key));
	};

	// Convenience version of a common use case of `filter`: selecting only objects
	// containing specific `key:value` pairs.
//	_.where = function(obj, attrs) {
//		return _.filter(obj, _.matches(attrs));
//	};

	// Convenience version of a common use case of `find`: getting the first object
	// containing specific `key:value` pairs.
//	_.findWhere = function(obj, attrs) {
//		return _.find(obj, _.matches(attrs));
//	};

	// Return the maximum element or (element-based computation).
	// Can't optimize arrays of integers longer than 65,535 elements.
	// See [WebKit Bug 80797](https://bugs.webkit.org/show_bug.cgi?id=80797)
	_.max = function(obj, iterator, context) {
		if (!iterator && _.isArray(obj) && obj[0] === +obj[0] && obj.length < 65535) {
			return Math.max.apply(Math, obj);
		}
		var result = -Infinity, lastComputed = -Infinity;
		each(obj, function(value, index, list) {
			var computed = iterator ? iterator.call(context, value, index, list) : value;
			if (computed > lastComputed) {
				result = value;
				lastComputed = computed;
			}
		});
		return result;
	};

	// Return the minimum element (or element-based computation).
	_.min = function(obj, iterator, context) {
		if (!iterator && _.isArray(obj) && obj[0] === +obj[0] && obj.length < 65535) {
			return Math.min.apply(Math, obj);
		}
		var result = Infinity, lastComputed = Infinity;
		each(obj, function(value, index, list) {
			var computed = iterator ? iterator.call(context, value, index, list) : value;
			if (computed < lastComputed) {
				result = value;
				lastComputed = computed;
			}
		});
		return result;
	};

	// Shuffle an array, using the modern version of the
	// [Fisher-Yates shuffle](http://en.wikipedia.org/wiki/Fisher–Yates_shuffle).
	_.shuffle = function(obj) {
		var rand;
		var index = 0;
		var shuffled = [];
		each(obj, function(value) {
			rand = _.random(index++);
			shuffled[index - 1] = shuffled[rand];
			shuffled[rand] = value;
		});
		return shuffled;
	};

	// Sample **n** random values from a collection.
	// If **n** is not specified, returns a single random element.
	// The internal `guard` argument allows it to work with `map`.
//	_.sample = function(obj, n, guard) {
//		if (n == null || guard) {
//			if (obj.length !== +obj.length) obj = _.values(obj);
//			return obj[_.random(obj.length - 1)];
//		}
//		return _.shuffle(obj).slice(0, Math.max(0, n));
//	};

	// An internal function to generate lookup iterators.
	var lookupIterator = function(value) {
		if (value == null) return _.identity;
		if (_.isFunction(value)) return value;
		return _.property(value);
	};

	// Sort the object's values by a criterion produced by an iterator.
	_.sortBy = function(obj, iterator, context) {
		iterator = lookupIterator(iterator);
		return _.pluck(_.map(obj, function(value, index, list) {
			return {
				value: value,
				index: index,
				criteria: iterator.call(context, value, index, list)
			};
		}).sort(function(left, right) {
			var a = left.criteria;
			var b = right.criteria;
			if (a !== b) {
				if (a > b || a === void 0) return 1;
				if (a < b || b === void 0) return -1;
			}
			return left.index - right.index;
		}), 'value');
	};

	// An internal function used for aggregate "group by" operations.
//	var group = function(behavior) {
//		return function(obj, iterator, context) {
//			var result = {};
//			iterator = lookupIterator(iterator);
//			each(obj, function(value, index) {
//				var key = iterator.call(context, value, index, obj);
//				behavior(result, key, value);
//			});
//			return result;
//		};
//	};

	// Groups the object's values by a criterion. Pass either a string attribute
	// to group by, or a function that returns the criterion.
//	_.groupBy = group(function(result, key, value) {
//		_.has(result, key) ? result[key].push(value) : result[key] = [value];
//	});

	// Indexes the object's values by a criterion, similar to `groupBy`, but for
	// when you know that your index values will be unique.
//	_.indexBy = group(function(result, key, value) {
//		result[key] = value;
//	});

	// Counts instances of an object that group by a certain criterion. Pass
	// either a string attribute to count by, or a function that returns the
	// criterion.
//	_.countBy = group(function(result, key) {
//		_.has(result, key) ? result[key]++ : result[key] = 1;
//	});

	// Use a comparator function to figure out the smallest index at which
	// an object should be inserted so as to maintain order. Uses binary search.
//	_.sortedIndex = function(array, obj, iterator, context) {
//		iterator = lookupIterator(iterator);
//		var value = iterator.call(context, obj);
//		var low = 0, high = array.length;
//		while (low < high) {
//			var mid = (low + high) >>> 1;
//			iterator.call(context, array[mid]) < value ? low = mid + 1 : high = mid;
//		}
//		return low;
//	};

	// Safely create a real, live array from anything iterable.
	_.toArray = function(obj) {
		if (!obj) return [];
		if (_.isArray(obj)) return slice.call(obj);
		if (obj.length === +obj.length) return _.map(obj, _.identity);
		return _.values(obj);
	};

	// Return the number of elements in an object.
	_.size = function(obj) {
		if (obj == null) return 0;
		return (obj.length === +obj.length) ? obj.length : _.keys(obj).length;
	};

	// Array Functions
	// ---------------

	// Get the first element of an array. Passing **n** will return the first N
	// values in the array. Aliased as `head` and `take`. The **guard** check
	// allows it to work with `_.map`.
//	_.first = _.head = _.take = function(array, n, guard) {
//		if (array == null) return void 0;
//		if ((n == null) || guard) return array[0];
//		if (n < 0) return [];
//		return slice.call(array, 0, n);
//	};

	// Returns everything but the last entry of the array. Especially useful on
	// the arguments object. Passing **n** will return all the values in
	// the array, excluding the last N. The **guard** check allows it to work with
	// `_.map`.
//	_.initial = function(array, n, guard) {
//		return slice.call(array, 0, array.length - ((n == null) || guard ? 1 : n));
//	};

	// Get the last element of an array. Passing **n** will return the last N
	// values in the array. The **guard** check allows it to work with `_.map`.
	_.last = function(array, n, guard) {
		if (array == null) return void 0;
		if ((n == null) || guard) return array[array.length - 1];
		return slice.call(array, Math.max(array.length - n, 0));
	};

	// Returns everything but the first entry of the array. Aliased as `tail` and `drop`.
	// Especially useful on the arguments object. Passing an **n** will return
	// the rest N values in the array. The **guard**
	// check allows it to work with `_.map`.
	_.rest = _.tail = _.drop = function(array, n, guard) {
		return slice.call(array, (n == null) || guard ? 1 : n);
	};

	// Trim out all falsy values from an array.
	_.compact = function(array) {
		return _.filter(array, _.identity);
	};

	// Internal implementation of a recursive `flatten` function.
	var flatten = function(input, shallow, output) {
		if (shallow && _.every(input, _.isArray)) {
			return concat.apply(output, input);
		}
		each(input, function(value) {
			if (_.isArray(value) || _.isArguments(value)) {
				shallow ? push.apply(output, value) : flatten(value, shallow, output);
			} else {
				output.push(value);
			}
		});
		return output;
	};

	// Flatten out an array, either recursively (by default), or just one level.
	_.flatten = function(array, shallow) {
		return flatten(array, shallow, []);
	};

	// Return a version of the array that does not contain the specified value(s).
	_.without = function(array) {
		return _.difference(array, slice.call(arguments, 1));
	};

	// Split an array into two arrays: one whose elements all satisfy the given
	// predicate, and one whose elements all do not satisfy the predicate.
	_.partition = function(array, predicate) {
		var pass = [], fail = [];
		each(array, function(elem) {
			(predicate(elem) ? pass : fail).push(elem);
		});
		return [pass, fail];
	};

	// Produce a duplicate-free version of the array. If the array has already
	// been sorted, you have the option of using a faster algorithm.
	// Aliased as `unique`.
	_.uniq = function(array, isSorted, iterator, context) {
		if (_.isFunction(isSorted)) {
			context = iterator;
			iterator = isSorted;
			isSorted = false;
		}
		var initial = iterator ? _.map(array, iterator, context) : array;
		var results = [];
		var seen = [];
		each(initial, function(value, index) {
			if (isSorted ? (!index || seen[seen.length - 1] !== value) : !_.contains(seen, value)) {
				seen.push(value);
				results.push(array[index]);
			}
		});
		return results;
	};

	// Produce an array that contains the union: each distinct element from all of
	// the passed-in arrays.
	_.union = function() {
		return _.uniq(_.flatten(arguments, true));
	};

	// Produce an array that contains every item shared between all the
	// passed-in arrays.
	_.intersection = function(array) {
		var rest = slice.call(arguments, 1);
		return _.filter(_.uniq(array), function(item) {
			return _.every(rest, function(other) {
				return _.contains(other, item);
			});
		});
	};

	// Take the difference between one array and a number of other arrays.
	// Only the elements present in just the first array will remain.
	_.difference = function(array) {
		var rest = concat.apply(ArrayProto, slice.call(arguments, 1));
		return _.filter(array, function(value){ return !_.contains(rest, value); });
	};

	// Zip together multiple lists into a single array -- elements that share
	// an index go together.
//	_.zip = function() {
//		var length = _.max(_.pluck(arguments, 'length').concat(0));
//		var results = new Array(length);
//		for (var i = 0; i < length; i++) {
//			results[i] = _.pluck(arguments, '' + i);
//		}
//		return results;
//	};

	// Converts lists into objects. Pass either a single array of `[key, value]`
	// pairs, or two parallel arrays of the same length -- one of keys, and one of
	// the corresponding values.
	_.object = function(list, values) {
		if (list == null) return {};
		var result = {};
		for (var i = 0, length = list.length; i < length; i++) {
			if (values) {
				result[list[i]] = values[i];
			} else {
				result[list[i][0]] = list[i][1];
			}
		}
		return result;
	};

	// If the browser doesn't supply us with indexOf (I'm looking at you, **MSIE**),
	// we need this function. Return the position of the first occurrence of an
	// item in an array, or -1 if the item is not included in the array.
	// Delegates to **ECMAScript 5**'s native `indexOf` if available.
	// If the array is large and already in sort order, pass `true`
	// for **isSorted** to use binary search.
	_.indexOf = function(array, item, isSorted) {
		if (array == null) return -1;
		var i = 0, length = array.length;
		if (isSorted) {
			if (typeof isSorted == 'number') {
				i = (isSorted < 0 ? Math.max(0, length + isSorted) : isSorted);
			} else {
				i = _.sortedIndex(array, item);
				return array[i] === item ? i : -1;
			}
		}
		if (nativeIndexOf && array.indexOf === nativeIndexOf) return array.indexOf(item, isSorted);
		for (; i < length; i++) if (array[i] === item) return i;
		return -1;
	};

	// Delegates to **ECMAScript 5**'s native `lastIndexOf` if available.
//	_.lastIndexOf = function(array, item, from) {
//		if (array == null) return -1;
//		var hasIndex = from != null;
//		if (nativeLastIndexOf && array.lastIndexOf === nativeLastIndexOf) {
//			return hasIndex ? array.lastIndexOf(item, from) : array.lastIndexOf(item);
//		}
//		var i = (hasIndex ? from : array.length);
//		while (i--) if (array[i] === item) return i;
//		return -1;
//	};

	// Generate an integer Array containing an arithmetic progression. A port of
	// the native Python `range()` function. See
	// [the Python documentation](http://docs.python.org/library/functions.html#range).
	_.range = function(start, stop, step) {
		if (arguments.length <= 1) {
			stop = start || 0;
			start = 0;
		}
		step = arguments[2] || 1;

		var length = Math.max(Math.ceil((stop - start) / step), 0);
		var idx = 0;
		var range = new Array(length);

		while(idx < length) {
			range[idx++] = start;
			start += step;
		}

		return range;
	};

	// Function (ahem) Functions
	// ------------------

	// Reusable constructor function for prototype setting.
	var ctor = function(){};

	// Create a function bound to a given object (assigning `this`, and arguments,
	// optionally). Delegates to **ECMAScript 5**'s native `Function.bind` if
	// available.
	_.bind = function(func, context) {
		var args, bound;
		if (nativeBind && func.bind === nativeBind) return nativeBind.apply(func, slice.call(arguments, 1));
		if (!_.isFunction(func)) throw new TypeError;
		args = slice.call(arguments, 2);
		return bound = function() {
			if (!(this instanceof bound)) return func.apply(context, args.concat(slice.call(arguments)));
			ctor.prototype = func.prototype;
			var self = new ctor;
			ctor.prototype = null;
			var result = func.apply(self, args.concat(slice.call(arguments)));
			if (Object(result) === result) return result;
			return self;
		};
	};

	// Partially apply a function by creating a version that has had some of its
	// arguments pre-filled, without changing its dynamic `this` context. _ acts
	// as a placeholder, allowing any combination of arguments to be pre-filled.
	_.partial = function(func) {
		var boundArgs = slice.call(arguments, 1);
		return function() {
			var position = 0;
			var args = boundArgs.slice();
			for (var i = 0, length = args.length; i < length; i++) {
				if (args[i] === _) args[i] = arguments[position++];
			}
			while (position < arguments.length) args.push(arguments[position++]);
			return func.apply(this, args);
		};
	};

	// Bind a number of an object's methods to that object. Remaining arguments
	// are the method names to be bound. Useful for ensuring that all callbacks
	// defined on an object belong to it.
	_.bindAll = function(obj) {
		var funcs = slice.call(arguments, 1);
		if (funcs.length === 0) funcs = _.functions(obj);
		each(funcs, function(f) { obj[f] = _.bind(obj[f], obj); });
		return obj;
	};
	
	// Memoize an expensive function by storing its results.
//	_.memoize = function(func, hasher) {
//		var memo = {};
//		hasher || (hasher = _.identity);
//		return function() {
//			var key = hasher.apply(this, arguments);
//			return _.has(memo, key) ? memo[key] : (memo[key] = func.apply(this, arguments));
//		};
//	};

	// Delays a function for the given number of milliseconds, and then calls
	// it with the arguments supplied.
	_.delay = function(func, wait) {
		var args = slice.call(arguments, 2);
		return setTimeout(function(){ return func.apply(null, args); }, wait);
	};

	// Defers a function, scheduling it to run after the current call stack has
	// cleared.
	_.defer = function(func) {
		return _.delay.apply(_, [func, 1].concat(slice.call(arguments, 1)));
	};

	// Returns a function, that, when invoked, will only be triggered at most once
	// during a given window of time. Normally, the throttled function will run
	// as much as it can, without ever going more than once per `wait` duration;
	// but if you'd like to disable the execution on the leading edge, pass
	// `{leading: false}`. To disable execution on the trailing edge, ditto.
//	_.throttle = function(func, wait, options) {
//		var context, args, result;
//		var timeout = null;
//		var previous = 0;
//		options || (options = {});
//		var later = function() {
//			previous = options.leading === false ? 0 : _.now();
//			timeout = null;
//			result = func.apply(context, args);
//			context = args = null;
//		};
//		return function() {
//			var now = _.now();
//			if (!previous && options.leading === false) previous = now;
//			var remaining = wait - (now - previous);
//			context = this;
//			args = arguments;
//			if (remaining <= 0) {
//				clearTimeout(timeout);
//				timeout = null;
//				previous = now;
//				result = func.apply(context, args);
//				context = args = null;
//			} else if (!timeout && options.trailing !== false) {
//				timeout = setTimeout(later, remaining);
//			}
//			return result;
//		};
//	};

	// Returns a function, that, as long as it continues to be invoked, will not
	// be triggered. The function will be called after it stops being called for
	// N milliseconds. If `immediate` is passed, trigger the function on the
	// leading edge, instead of the trailing.
//	_.debounce = function(func, wait, immediate) {
//		var timeout, args, context, timestamp, result;
//
//		var later = function() {
//			var last = _.now() - timestamp;
//			if (last < wait) {
//				timeout = setTimeout(later, wait - last);
//			} else {
//				timeout = null;
//				if (!immediate) {
//					result = func.apply(context, args);
//					context = args = null;
//				}
//			}
//		};
//
//		return function() {
//			context = this;
//			args = arguments;
//			timestamp = _.now();
//			var callNow = immediate && !timeout;
//			if (!timeout) {
//				timeout = setTimeout(later, wait);
//			}
//			if (callNow) {
//				result = func.apply(context, args);
//				context = args = null;
//			}
//
//			return result;
//		};
//	};

	// Returns a function that will be executed at most one time, no matter how
	// often you call it. Useful for lazy initialization.
	_.once = function(func) {
		var ran = false, memo;
		return function() {
			if (ran) return memo;
			ran = true;
			memo = func.apply(this, arguments);
			func = null;
			return memo;
		};
	};

	// Returns the first function passed as an argument to the second,
	// allowing you to adjust arguments, run code before and after, and
	// conditionally execute the original function.
	_.wrap = function(func, wrapper) {
		return _.partial(wrapper, func);
	};

	// Returns a function that is the composition of a list of functions, each
	// consuming the return value of the function that follows.
//	_.compose = function() {
//		var funcs = arguments;
//		return function() {
//			var args = arguments;
//			for (var i = funcs.length - 1; i >= 0; i--) {
//				args = [funcs[i].apply(this, args)];
//			}
//			return args[0];
//		};
//	};

	// Returns a function that will only be executed after being called N times.
//	_.after = function(times, func) {
//		return function() {
//			if (--times < 1) {
//				return func.apply(this, arguments);
//			}
//		};
//	};

	// Object Functions
	// ----------------

	// Retrieve the names of an object's properties.
	// Delegates to **ECMAScript 5**'s native `Object.keys`
	_.keys = function(obj) {
		if (!_.isObject(obj)) return [];
		if (nativeKeys) return nativeKeys(obj);
		var keys = [];
		for (var key in obj) if (_.has(obj, key)) keys.push(key);
		return keys;
	};

	// Retrieve the values of an object's properties.
	_.values = function(obj) {
		var keys = _.keys(obj);
		var length = keys.length;
		var values = new Array(length);
		for (var i = 0; i < length; i++) {
			values[i] = obj[keys[i]];
		}
		return values;
	};

	// Convert an object into a list of `[key, value]` pairs.
	_.pairs = function(obj) {
		var keys = _.keys(obj);
		var length = keys.length;
		var pairs = new Array(length);
		for (var i = 0; i < length; i++) {
			pairs[i] = [keys[i], obj[keys[i]]];
		}
		return pairs;
	};

//	// Invert the keys and values of an object. The values must be serializable.
//	_.invert = function(obj) {
//		var result = {};
//		var keys = _.keys(obj);
//		for (var i = 0, length = keys.length; i < length; i++) {
//			result[obj[keys[i]]] = keys[i];
//		}
//		return result;
//	};

	// Return a sorted list of the function names available on the object.
	// Aliased as `methods`
//	_.functions = _.methods = function(obj) {
	_.functions = function(obj) {
		var names = [];
		for (var key in obj) {
			if (_.isFunction(obj[key])) names.push(key);
		}
		return names.sort();
	};

	// Extend a given object with all the properties in passed-in object(s).
	_.extend = function(obj) 
	{
		each(slice.call(arguments, 1), function(source) 
		{
			if (source)
			{
				for (var propName in source) 
				{
					conbo.cloneProperty(source, propName, obj);
				}
			}
		});
		return obj;
	};

	// Return a copy of the object only containing the whitelisted properties.
	_.pick = function(obj) {
		var copy = {};
		var keys = concat.apply(ArrayProto, slice.call(arguments, 1));
		each(keys, function(key) {
			if (key in obj)
			{
				conbo.cloneProperty(obj, key, copy);
			}
		});
		return copy;
	};

	 // Return a copy of the object without the blacklisted properties.
	_.omit = function(obj) {
		var copy = {};
		var keys = concat.apply(ArrayProto, slice.call(arguments, 1));
		for (var key in obj) 
		{
			if (!_.contains(keys, key))
			{
				conbo.cloneProperty(obj, key, copy);
			}
		}
		return copy;
	};

	// Fill in a given object with default properties.
	_.defaults = function(obj) 
	{
		each(slice.call(arguments, 1), function(source) 
		{
			if (source) 
			{
				for (var propName in source) 
				{
					if (obj[propName] !== void 0) continue;
					conbo.cloneProperty(source, propName, obj);
				}
			}
		});
		return obj;
	};

	// Create a (shallow-cloned) duplicate of an object.
	_.clone = function(obj) {
		if (!_.isObject(obj)) return obj;
		return _.isArray(obj) ? obj.slice() : _.extend({}, obj);
	};

	// Invokes interceptor with the obj, and then returns obj.
	// The primary purpose of this method is to "tap into" a method chain, in
	// order to perform operations on intermediate results within the chain.
//	_.tap = function(obj, interceptor) {
//		interceptor(obj);
//		return obj;
//	};

	// Internal recursive comparison function for `isEqual`.
	var eq = function(a, b, aStack, bStack) {
		// Identical objects are equal. `0 === -0`, but they aren't identical.
		// See the [Harmony `egal` proposal](http://wiki.ecmascript.org/doku.php?id=harmony:egal).
		if (a === b) return a !== 0 || 1 / a == 1 / b;
		// A strict comparison is necessary because `null == undefined`.
		if (a == null || b == null) return a === b;
		// Unwrap any wrapped objects.
		// Compare `[[Class]]` names.
		var className = toString.call(a);
		if (className != toString.call(b)) return false;
		switch (className) {
			// Strings, numbers, dates, and booleans are compared by value.
			case '[object String]':
				// Primitives and their corresponding object wrappers are equivalent; thus, `"5"` is
				// equivalent to `new String("5")`.
				return a == String(b);
			case '[object Number]':
				// `NaN`s are equivalent, but non-reflexive. An `egal` comparison is performed for
				// other numeric values.
				return a != +a ? b != +b : (a == 0 ? 1 / a == 1 / b : a == +b);
			case '[object Date]':
			case '[object Boolean]':
				// Coerce dates and booleans to numeric primitive values. Dates are compared by their
				// millisecond representations. Note that invalid dates with millisecond representations
				// of `NaN` are not equivalent.
				return +a == +b;
			// RegExps are compared by their source patterns and flags.
			case '[object RegExp]':
				return a.source == b.source &&
							 a.global == b.global &&
							 a.multiline == b.multiline &&
							 a.ignoreCase == b.ignoreCase;
		}
		if (typeof a != 'object' || typeof b != 'object') return false;
		// Assume equality for cyclic structures. The algorithm for detecting cyclic
		// structures is adapted from ES 5.1 section 15.12.3, abstract operation `JO`.
		var length = aStack.length;
		while (length--) {
			// Linear search. Performance is inversely proportional to the number of
			// unique nested structures.
			if (aStack[length] == a) return bStack[length] == b;
		}
		// Objects with different constructors are not equivalent, but `Object`s
		// from different frames are.
		var aCtor = a.constructor, bCtor = b.constructor;
		if (aCtor !== bCtor && !(_.isFunction(aCtor) && (aCtor instanceof aCtor) &&
														 _.isFunction(bCtor) && (bCtor instanceof bCtor))
												&& ('constructor' in a && 'constructor' in b)) {
			return false;
		}
		// Add the first object to the stack of traversed objects.
		aStack.push(a);
		bStack.push(b);
		var size = 0, result = true;
		// Recursively compare objects and arrays.
		if (className == '[object Array]') {
			// Compare array lengths to determine if a deep comparison is necessary.
			size = a.length;
			result = size == b.length;
			if (result) {
				// Deep compare the contents, ignoring non-numeric properties.
				while (size--) {
					if (!(result = eq(a[size], b[size], aStack, bStack))) break;
				}
			}
		} else {
			// Deep compare objects.
			for (var key in a) {
				if (_.has(a, key)) {
					// Count the expected number of properties.
					size++;
					// Deep compare each member.
					if (!(result = _.has(b, key) && eq(a[key], b[key], aStack, bStack))) break;
				}
			}
			// Ensure that both objects contain the same number of properties.
			if (result) {
				for (key in b) {
					if (_.has(b, key) && !(size--)) break;
				}
				result = !size;
			}
		}
		// Remove the first object from the stack of traversed objects.
		aStack.pop();
		bStack.pop();
		return result;
	};

	// Perform a deep comparison to check if two objects are equal.
	_.isEqual = function(a, b) {
		return eq(a, b, [], []);
	};

	// Is a given array, string, or object empty?
	// An "empty" object has no enumerable own-properties.
	_.isEmpty = function(obj) {
		if (obj == null) return true;
		if (_.isArray(obj) || _.isString(obj)) return obj.length === 0;
		for (var key in obj) if (_.has(obj, key)) return false;
		return true;
	};

	// Is a given value a DOM element?
	_.isElement = function(obj) {
		return !!(obj && obj.nodeType === 1);
	};

	// Is a given value an array?
	// Delegates to ECMA5's native Array.isArray
	_.isArray = nativeIsArray || function(obj) {
		return toString.call(obj) == '[object Array]';
	};

	// Is a given variable an object?
	_.isObject = function(obj) {
		return obj === Object(obj);
	};

	// Add some isType methods: isArguments, isFunction, isString, isNumber, isDate, isRegExp.
	each(['Arguments', 'Function', 'String', 'Number', 'Date', 'RegExp'], function(name) {
		_['is' + name] = function(obj) {
			return toString.call(obj) == '[object ' + name + ']';
		};
	});

	// Define a fallback version of the method in browsers (ahem, IE), where
	// there isn't any inspectable "Arguments" type.
	if (!_.isArguments(arguments)) {
		_.isArguments = function(obj) {
			return !!(obj && _.has(obj, 'callee'));
		};
	}
	
	// Optimize `isFunction` if appropriate.
	if (typeof (/./) !== 'function') {
		_.isFunction = function(obj) {
			return typeof obj === 'function';
		};
	}
	
	// Is a given object a finite number?
	_.isFinite = function(obj) {
		return isFinite(obj) && !isNaN(parseFloat(obj));
	};

	// Is the given value `NaN`? (NaN is the only number which does not equal itself).
	_.isNaN = function(obj) {
		return _.isNumber(obj) && obj != +obj;
	};

	// Is a given value a boolean?
	_.isBoolean = function(obj) {
		return obj === true || obj === false || toString.call(obj) == '[object Boolean]';
	};

	// Is a given value equal to null?
	_.isNull = function(obj) {
		return obj === null;
	};

	// Is a given variable undefined?
	_.isUndefined = function(obj) {
		return obj === void 0;
	};

	// Shortcut function for checking if an object has a given property directly
	// on itself (in other words, not on a prototype).
	_.has = function(obj, key) {
		return hasOwnProperty.call(obj, key);
	};

	// Utility Functions
	// -----------------

	// Keep the identity function around for default iterators.
	_.identity = function(value) {
		return value;
	};
	
//	_.constant = function(value) {
//		return function () {
//			return value;
//		};
//	};

	_.property = function(key) {
		return function(obj) {
			return obj[key];
		};
	};

	// Returns a predicate for checking whether an object has a given set of `key:value` pairs.
	_.matches = function(attrs) {
		return function(obj) {
			if (obj === attrs) return true; //avoid comparing an object to itself.
			for (var key in attrs) {
				if (attrs[key] !== obj[key])
					return false;
			}
			return true;
		}
	};

//	// Run a function **n** times.
//	_.times = function(n, iterator, context) {
//		var accum = Array(Math.max(0, n));
//		for (var i = 0; i < n; i++) accum[i] = iterator.call(context, i);
//		return accum;
//	};

	// Return a random integer between min and max (inclusive).
	_.random = function(min, max) {
		if (max == null) {
			max = min;
			min = 0;
		}
		return min + Math.floor(Math.random() * (max - min + 1));
	};

	// A (possibly faster) way to get the current timestamp as an integer.
	_.now = Date.now || function() { return new Date().getTime(); };

//	// List of HTML entities for escaping.
//	var entityMap = {
//		escape: {
//			'&': '&amp;',
//			'<': '&lt;',
//			'>': '&gt;',
//			'"': '&quot;',
//			"'": '&#x27;'
//		}
//	};
//	entityMap.unescape = _.invert(entityMap.escape);
//
//	// Regexes containing the keys and values listed immediately above.
//	var entityRegexes = {
//		escape:	 new RegExp('[' + _.keys(entityMap.escape).join('') + ']', 'g'),
//		unescape: new RegExp('(' + _.keys(entityMap.unescape).join('|') + ')', 'g')
//	};
//
//	// Functions for escaping and unescaping strings to/from HTML interpolation.
//	_.each(['escape', 'unescape'], function(method) {
//		_[method] = function(string) {
//			if (string == null) return '';
//			return ('' + string).replace(entityRegexes[method], function(match) {
//				return entityMap[method][match];
//			});
//		};
//	});

	// If the value of the named `property` is a function then invoke it with the
	// `object` as context; otherwise, return it.
//	_.result = function(object, property) {
//		if (object == null) return void 0;
//		var value = object[property];
//		return _.isFunction(value) ? value.call(object) : value;
//	};

//	// Add your own custom functions to the Underscore object.
//	_.mixin = function(obj) {
//		each(_.functions(obj), function(name) {
//			var func = _[name] = obj[name];
//			_.prototype[name] = function() {
//				var args = [this._wrapped];
//				push.apply(args, arguments);
//				return result.call(this, func.apply(_, args));
//			};
//		});
//	};

	// Generate a unique integer id (unique within the entire client session).
	// Useful for temporary DOM ids.
	var idCounter = 0;
	_.uniqueId = function(prefix) {
		var id = ++idCounter + '';
		return prefix ? prefix + id : id;
	};

//	// By default, Underscore uses ERB-style template delimiters, change the
//	// following template settings to use alternative delimiters.
//	_.templateSettings = {
//		evaluate		: /<%([\s\S]+?)%>/g,
//		interpolate : /<%=([\s\S]+?)%>/g,
//		escape			: /<%-([\s\S]+?)%>/g
//	};
//
//	// When customizing `templateSettings`, if you don't want to define an
//	// interpolation, evaluation or escaping regex, we need one that is
//	// guaranteed not to match.
//	var noMatch = /(.)^/;
//
//	// Certain characters need to be escaped so that they can be put into a
//	// string literal.
//	var escapes = {
//		"'":			"'",
//		'\\':		 '\\',
//		'\r':		 'r',
//		'\n':		 'n',
//		'\t':		 't',
//		'\u2028': 'u2028',
//		'\u2029': 'u2029'
//	};
//
//	var escaper = /\\|'|\r|\n|\t|\u2028|\u2029/g;
//
//	// JavaScript micro-templating, similar to John Resig's implementation.
//	// Underscore templating handles arbitrary delimiters, preserves whitespace,
//	// and correctly escapes quotes within interpolated code.
//	_.template = function(text, data, settings) {
//		var render;
//		settings = _.defaults({}, settings, _.templateSettings);
//
//		// Combine delimiters into one regular expression via alternation.
//		var matcher = new RegExp([
//			(settings.escape || noMatch).source,
//			(settings.interpolate || noMatch).source,
//			(settings.evaluate || noMatch).source
//		].join('|') + '|$', 'g');
//
//		// Compile the template source, escaping string literals appropriately.
//		var index = 0;
//		var source = "__p+='";
//		text.replace(matcher, function(match, escape, interpolate, evaluate, offset) {
//			source += text.slice(index, offset)
//				.replace(escaper, function(match) { return '\\' + escapes[match]; });
//
//			if (escape) {
//				source += "'+\n((__t=(" + escape + "))==null?'':_.escape(__t))+\n'";
//			}
//			if (interpolate) {
//				source += "'+\n((__t=(" + interpolate + "))==null?'':__t)+\n'";
//			}
//			if (evaluate) {
//				source += "';\n" + evaluate + "\n__p+='";
//			}
//			index = offset + match.length;
//			return match;
//		});
//		source += "';\n";
//
//		// If a variable is not specified, place data values in local scope.
//		if (!settings.variable) source = 'with(obj||{}){\n' + source + '}\n';
//
//		source = "var __t,__p='',__j=Array.prototype.join," +
//			"print=function(){__p+=__j.call(arguments,'');};\n" +
//			source + "return __p;\n";
//
//		try {
//			render = new Function(settings.variable || 'obj', '_', source);
//		} catch (e) {
//			e.source = source;
//			throw e;
//		}
//
//		if (data) return render(data, _);
//		var template = function(data) {
//			return render.call(this, data, _);
//		};
//
//		// Provide the compiled function source as a convenience for precompilation.
//		template.source = 'function(' + (settings.variable || 'obj') + '){\n' + source + '}';
//
//		return template;
//	};

//	// Add a "chain" function, which will delegate to the wrapper.
//	_.chain = function(obj) {
//		return _(obj).chain();
//	};
//
//	// OOP
//	// ---------------
//	// If Underscore is called as a function, it returns a wrapped object that
//	// can be used OO-style. This wrapper holds altered versions of all the
//	// underscore functions. Wrapped objects may be chained.
//
//	// Helper function to continue chaining intermediate results.
//	var result = function(obj) {
//		return this._chain ? _(obj).chain() : obj;
//	};
//
//	// Add all of the Underscore functions to the wrapper object.
//	_.mixin(_);
//
//	// Add all mutator Array functions to the wrapper.
//	each(['pop', 'push', 'reverse', 'shift', 'sort', 'splice', 'unshift'], function(name) {
//		var method = ArrayProto[name];
//		_.prototype[name] = function() {
//			var obj = this._wrapped;
//			method.apply(obj, arguments);
//			if ((name == 'shift' || name == 'splice') && obj.length === 0) delete obj[0];
//			return result.call(this, obj);
//		};
//	});
//	
//	// Add all accessor Array functions to the wrapper.
//	each(['concat', 'join', 'slice'], function(name) {
//		var method = ArrayProto[name];
//		_.prototype[name] = function() {
//			return result.call(this, method.apply(this._wrapped, arguments));
//		};
//	});
//
//	_.extend(_.prototype, {
//
//		// Start chaining a wrapped Underscore object.
//		chain: function() {
//			this._chain = true;
//			return this;
//		},
//
//		// Extracts the result from a wrapped and chained object.
//		value: function() {
//			return this._wrapped;
//		}
//
//	});
	
	// Add Underscore functions to Conbo
	each(_.functions(_), function(name) 
	{
		if (name in conbo) return;
		conbo[name] = _[name];
	});
	
})();


/**
 * Is Conbo supported by the current browser?
 */
conbo.isSupported = !!Object.defineProperty && !!Object.getOwnPropertyDescriptor;

/**
 * Convert dash-or_underscore separated words into camelCaseWords
 */
conbo.toCamelCase = function(string)
{
	return (string || '').replace(/([-_])([a-z])/g, function (g) { return g[1].toUpperCase(); });
};

/**
 * Is the value a Conbo class?
 */
conbo.isClass = function(value)
{
	return !!value && typeof value == 'function' && value.prototype instanceof conbo.Class;
};

/**
 * Copies a property, including defined properties and accessors, 
 * from one object to another
 * 
 * @param	source			Source object
 * @param	sourceName		Name of the property on the source
 * @param	target			Target object
 * @param	targetName		Name of the property on the target (default: sourceName)
 */
conbo.cloneProperty = function(source, sourceName, target, targetName)
{
	targetName || (targetName = sourceName);
	
	var descriptor = Object.getOwnPropertyDescriptor(source, sourceName) 
		|| {value:source[sourceName], configurable:true, writable:true, enumerable:true};
	
	Object.defineProperty(target, sourceName, descriptor);
};

/**
 * Is the object an instance of the specified class(es) or implement the
 * specified pseudo-interface(s)?
 * 
 * @example						var b = conbo.instanceOf(obj, conbo.EventDispatcher);
 * @example						var b = conbo.instanceOf(obj, conbo.View, conbo.Injectable);
 * @param	obj					The class instance
 * @param	classOrInterface	The Conbo class or pseudo-interface to compare against
 */
conbo.instanceOf = function(obj, classOrInterface)
{
	var partials = conbo.rest(arguments);
	
	for (var p=0, c=partials.length; p<c; p++)
	{
		classOrInterface = partials[p];
		
		if (!classOrInterface) return false;
		
		if (conbo.isClass(classOrInterface))
		{
			if (!(obj instanceof classOrInterface)) return false;
		}
		else
		{
			for (var a in classOrInterface)
			{
				if (!(a in obj) || conbo.isFunction(obj[a]) != conbo.isFunction(classOrInterface[a])) 
				{
					return false;
				}
			}
		}
	}
	
	return true;
};

/**
 * Loads a CSS and apply it to the DOM
 * @param 	{String}	url		The CSS file's URL
 * @param 	{String}	media	The media attribute (defaults to 'all')
 */
conbo.loadCss = function(url, media)
{
	if (!('document' in window) || !!document.querySelector('[href='+url+']'))
	{
		return this;
	}
	
    var link, head; 
    
    link = document.createElement('link');
    link.rel  = 'stylesheet';
    link.type = 'text/css';
    link.href = url;
    link.media = media || 'all';
    
	head = document.getElementsByTagName('head')[0];
    head.appendChild(link);
    
	return this;
};


/*
 * Property utilities
 */

/**
 * Return the names of all the enumerable properties on the specified object, 
 * i.e. all of the keys that aren't functions
 */
conbo.properties = function(obj)
{
	return conbo.difference(conbo.keys(obj), conbo.functions(obj));
};

/**
 * Create one or more property on this object that can be bound
 * without using the get or set methods; if no property names are
 * passed, all existing properties will be made bindable
 * 
 * @param	(String)	obj
 * @param	(String)	propNames
 */
conbo.bindProperties = function(obj, propNames)
{
	propNames || (propNames = conbo.properties(obj));
	
	propNames.forEach(function(propName)
	{
		_defineProperty(obj, propName);
	});
	
	return this;
};

/**
 * Was the property created using Object.defineProperty()?
 * @returns		Boolean
 */
conbo.isAccessor = function(obj, propName)
{
	var descriptor = Object.getOwnPropertyDescriptor(obj, propName);
	return !!descriptor && (!!descriptor.set || !!descriptor.get);
}

/**
 * Is the specified property bindable?
 * @returns		Boolean
 */
conbo.isBindableProperty = function(obj, propName)
{
	if (!conbo.isAccessor(obj, propName))
	{
		return false;
	}
	
	var descriptor = Object.getOwnPropertyDescriptor(obj, propName);
	return !!descriptor.set && descriptor.set.bindable;
};

/*
 * Polyfill methods for useful ECMAScript 5 methods that aren't quite universal
 */

if (!String.prototype.trim) 
{
	String.prototype.trim = function () 
	{
		return this.replace(/^\s+|\s+$/g,''); 
	};
}

if (!window.requestAnimationFrame)
{
	window.requestAnimationFrame = (function()
	{
		return window.webkitRequestAnimationFrame
			|| window.mozRequestAnimationFrame
			|| function(callback)
			{
				window.setTimeout(callback, 1000 / 60);
			};
	})();
}


/*
 * Logging
 */

/**
 * Enable logging?
 */
conbo.logEnabled = true;

/**
 * Logging
 */

var logMethods = ['log','warn','info','error'];

logMethods.forEach(function(method)
{
	conbo[method] = function()
	{
		if (!console || !conbo.logEnabled) return;
		console[method].apply(console, arguments);
	}
});

/*
 * Internal utility methods
 */

/**
 * Dispatch a property change event from the specified object
 */
var _dispatchChange = function(obj, propName, value)
{
	if (!(obj instanceof conbo.EventDispatcher)) return;
	
	var options = {property:propName, value:value};
	
	obj.dispatchEvent(new conbo.ConboEvent('change:'+propName, options));
	obj.dispatchEvent(new conbo.ConboEvent('change', options));
};

/**
 * Creates a property which can be bound to DOM elements and others
 * 
 * @param	(Object)	obj			The EventDispatcher object on which the property will be defined
 * @param	(String)	propName	The name of the property to be defined
 * @param	(*)			value		The initial value of the property (optional)
 * @param	(Function)	getter		The getter function (optional)
 * @param	(Function)	setter		The setter function (optional)
 * @param	(Boolean)	enumerable	Whether of not the property should be enumerable (optional, default: true)
 */
var _defineProperty = function(obj, propName, getter, setter, enumerable)
{
	if (conbo.isAccessor(obj, propName))
	{
		return this;
	}
	
	var value = obj[propName],
		nogs = !getter && !setter;
	
	enumerable = (enumerable !== false);
		
	if (nogs)
	{
		getter = function()
		{
			return value;
		};
	
		setter = function(newValue)
		{
			if (newValue === value) return;
			value = newValue;
			
			_dispatchChange(this, propName, value);
		};
	}
	else if (!!setter)
	{
		setter = conbo.wrap(setter, function(fn, newValue)
		{
			fn.call(this, newValue);
			_dispatchChange(this, propName, obj[propName]);
		});
		
		setter.bindable = true;
	}
	
	Object.defineProperty(obj, propName, {enumerable:enumerable, configurable:true, get:getter, set:setter});
	
	return this;
};

/**
 * Define property that can't be enumerated
 */
var _defineIncalculableProperty = function(obj, propName, value)
{
	Object.defineProperty(obj, propName, {enumerable:false, configurable:true, writable:true, value:value});
	return this;
};

/**
 * Convert all enumerable properties of the specified object into non-enumerable ones
 */
var _denumerate = function(obj)
{
	var props = arguments.length > 1
		? conbo.rest(arguments)
		: conbo.keys(obj);
	
	props.forEach(function(propName)
	{
		var descriptor = Object.getOwnPropertyDescriptor(obj, propName) 
			|| {value:obj[propName], configurable:true, writable:true};
		
		descriptor.enumerable = false;
		
		Object.defineProperty(obj, propName, descriptor);
	});
	
	return this;
};

/*
 * jQuery plug-ins and expressions
 * @author		Neil Rackett
 */

if (!!$)
{
	$.fn.cbAttrs = function(camelCase)
	{
		var data = {},
			attrs = this.get()[0].attributes,
			count = 0,
			propertyName;
		
		for (var i=0; i<attrs.length; ++i)
		{
			if (attrs[i].name.indexOf('cb-') != 0) continue;
			
			propertyName = attrs[i].name.substr(3);
			
			if (camelCase !== false)
			{
				propertyName = conbo.toCamelCase(propertyName);
			}
			
			data[propertyName] = attrs[i].value;
			
			++count;
		}
		
		return !!count ? data : undefined;
	}
	
	$.expr[':'].cbAttr = function(el, index, meta, stack)
	{
		var $el = $(el),
			args = (meta[3] || '').split(','),
			cb = $el.cbAttrs();
		
		if (!cb) return false;
		if (!!cb && !args.length) return true;
		if (!!args[0] && !args[1]) return args[0] in cb;
		if (!!args[0] && !!args[1]) return cb[args[0]] == args[1];
		return false;
	};
	
}
/**
 * CSS styles and utilities
 * @author 	Neil Rackett
 */

if (!!$)
{
	$(function()
	{
		var $head = $('head');
		
		if (!!$head.find('#cb-css').length)
		{
			return;
		}
		
		$('head').append($
		(
			'<style id="cb-css" type="text/css">'+
				'.cb-hide { visibility:hidden !important; }'+
				'.cb-exclude { display:none !important; }'+
				'.cb-disable { pointer-events:none !important; cursor:default !important; }'+
			'</style>'
		));
	});
}

/**
 * Class
 * Extendable base class from which all others extend
 */
conbo.Class = function(options) 
{
	this.initialize.apply(this, arguments);
};

conbo.Class.prototype =
{
	/**
	 * Entry point
	 * 
	 * In most circumstances, custom classes should override initialize 
	 * and use it as your class constructor
	 */
	initialize: function() {},
	
	/**
	 * Calls the specified method on the _super object, scoped to this
	 * @param 	methodName		String
	 * @param	...				Zero or more additional parameters
	 */
	callSuper: function(methodName)
	{
		if (!this._super[methodName]) return undefined;
		return this._super[methodName].apply(this, conbo.rest(arguments));
	},
	
	/**
	 * Calls the specified function after the current call stack has cleared
	 */
	defer: function(callback)
	{
		conbo.defer(this.bind.apply(this, [callback].concat(conbo.rest(arguments))));
		return this;
	},
	
	/**
	 * Scope one or more methods to this class instance
	 * @param 	method
	 * @returns
	 */
	bind: function(method)
	{
		return conbo.bind.apply(_, [method, this].concat(conbo.rest(arguments)));
	},
	
	/**
	 * Scope all methods of this class instance to this class instance
	 * @returns this
	 */
	bindAll: function()
	{
		conbo.bindAll.apply(_, [this].concat(conbo.toArray(arguments)))
		return this;
	},
	
	toString: function()
	{
		return 'conbo.Class';
	}
		
};

_denumerate(conbo.Class.prototype);

conbo.Class.extend = function(protoProps, staticProps)
{
	var child, parent=this;
	
	/**
	 * The constructor function for the new subclass is either defined by you
	 * (the 'constructor' property in your `extend` definition), or defaulted
	 * by us to simply call the parent's constructor.
	 */
	child = protoProps && conbo.has(protoProps, 'constructor')
		? protoProps.constructor
		: function() { return parent.apply(this, arguments); };
	
	conbo.extend(child, parent, staticProps);
	
	/**
	 * Set the prototype chain to inherit from parent, without calling
	 * parent's constructor
	 */
	var Surrogate = function(){ this.constructor = child; };
	Surrogate.prototype = parent.prototype;
	child.prototype = new Surrogate;
	
	if (protoProps)
	{
		conbo.extend(child.prototype, protoProps);
	}
	
	conbo.bindProperties(child.prototype);
	
	return child;
};

/**
 * Implements the specified pseudo-interface(s) on the class, copying 
 * the default methods or properties from the partial(s) if they have 
 * not already been implemented.
 * 
 * @example					var MyClass = conbo.Class.extend().implement(conbo.Injectable);
 * @param	{Object}		Object containing one or more properties or methods to be implemented
 * @returns	{conbo.Class}
 */
conbo.Class.implement = function()
{
	conbo.defaults.apply(conbo, conbo.union([this.prototype], arguments));
	return this;
};

/**
 * Interface class for data renderers, for example an item renderer for
 * use with the cb-repeat attribute
 * 
 * @author Neil Rackett
 */
conbo.IDataRenderer =
{
	data: undefined
}
/**
 * Injectable
 * 
 * Partial class that enables the Conbo.js framework to add the Context class 
 * to inject specified dependencies (properties of undefined value which match 
 * registered singletons); should be used via the Class.implement method
 * 
 * @example		var C = conbo.Class.extend().implement(conbo.Injectable);
 * @author		Neil Rackett
 */

conbo.Injectable =
{
	get context()
	{
		return this.__context__;
	},
	
	set context(value)
	{
		if (value == this.__context__) return;
		
		if (value instanceof conbo.Context) 
		{
			value.injectSingletons(this);
		}
		
		this.__context__ = value;
	}
};
/**
 * Event class
 * 
 * Base class for all events triggered in Conbo.js
 * 
 * @author		Neil Rackett
 */
conbo.Event = conbo.Class.extend
({
	//cancelBubble: false,
	//defaultPrevented: false,
	//immediatePropagationStopped: false,
	
	//currentTarget: undefined,
	//target: undefined,
	//type: undefined,
	
	/**
	 * Constructor: DO NOT override! (Use initialize instead)
	 * @param options
	 */
	constructor: function(type)
	{
		if (conbo.isString(type)) this.type = type;
		else conbo.defaults(this, type);
		
		if (!this.type) throw new Error('Invalid or undefined event type');
		
		this.initialize.apply(this, arguments);
	},
	
	/**
	 * Initialize: Override this!
	 * @param type
	 */
	initialize: function(type) {},
	
	/**
	 * Create an identical clone of this event
	 * @returns 	Event
	 */
	clone: function()
	{
		return conbo.clone(this);
	},
	
	/**
	 * Prevent whatever the default framework action for this event is
	 */
	preventDefault: function() 
	{
		this.defaultPrevented = true;
	},
	
	/**
	 * Not currently used
	 */
	stopPropagation: function() 
	{
		this.cancelBubble = true;
	},
	
	/**
	 * Keep the rest of the handlers from being executed
	 */
	stopImmediatePropagation: function() 
	{
		this.immediatePropagationStopped = true;
		this.stopPropagation();
	},
	
	toString: function()
	{
		return 'conbo.Event';
	}
},
{
	ALL: 'all',
	
	/**
	 * Get all event types separated by spaces
	 */
	all: function(asArray)
	{
		var types = [];
		
		for (var a in this)
		{
			if (!conbo.isString(this[a]) || this[a] == this.ALL) continue;
			types.push(this[a]);
		}
		
		if (asArray) return types;
		return types.join(' ');
	}
});

_denumerate(conbo.Event.prototype);

/**
 * conbo.Event
 * 
 * Default event class for events fired by Conbo.js
 * 
 * For consistency, callback parameters of Backbone.js derived classes 
 * are event object properties in Conbo.js
 * 
 * @author		Neil Rackett
 */
conbo.ConboEvent = conbo.Event.extend
({
	initialize: function(type, options)
	{
		conbo.defaults(this, options);
	},
	
	toString: function()
	{
		return 'conbo.ConboEvent';
	}
},
// Static properties
{
	ERROR:		"error", 	// (Properties: model, xhr, options) � when a model's save call fails on the server.
	INVALID:	"invalid", 	// (Properties: model, error, options) � when a model's validation fails on the client.
	CHANGE:		"change", 	// (Properties: model, options) � when a Bindable instance's attributes have changed.
							// "change:[attribute]" (Properties: model, value, options � when a specific attribute has been updated.
	ADD:		"add", 		// (Properties: model, collection, options) � when a model is added to a collection.
	REMOVE:		"remove", 	// (Properties: model, collection, options) � when a model is removed from a collection.
	DESTROY:	"destroy", 	// (Properties: model, collection, options) � when a model is destroyed.
	RESET:		"reset", 	// (Properties: collection, options) � when the collection's entire contents have been replaced.
	SORT:		"sort", 	// (Properties: collection, options) � when the collection has been re-sorted.
	
	REQUEST:	"request", 	// (Properties: model, xhr, options) � when a model (or collection) has started a request to the server.
	SYNC:		"sync", 	// (Properties: model, response, options) � when a model (or collection) has been successfully synced with the server.
	
	ROUTE:		"route", 	// (Properties: router, route, params) � Fired by history (or router) when any route has been matched.
							// "route:[name]" // (Properties: params) � Fired by the router when a specific route is matched.
	
	TEMPLATE_LOADED:	"templateloaded",
	ELEMENT_CHANGE:		"elementchange",
	
	ALL:		"all", 		// special event fires for any triggered event
});

_denumerate(conbo.ConboEvent.prototype);

/**
 * Event Dispatcher
 * 
 * Event model designed to bring events into line with DOM events and those 
 * found in HTML DOM, jQuery and ActionScript 2 & 3, offering a more 
 * predictable, object based approach to event dispatching and handling
 * 
 * Should be used as the base class for any class that won't be used for 
 * data binding
 * 
 * @author	Neil Rackett
 * @see		conbo.EventDispatcher
 */
conbo.EventDispatcher = conbo.Class.extend
({
	/**
	 * Do not override: use initialize
	 * @private
	 */
	constructor: function(options)
	{
		this.initialize.apply(this, arguments);
		conbo.bindProperties(this, this.bindable);
	},
	
	/**
	 * Add a listener for a particular event type
	 * @param type		Type of event ('change') or events ('change blur')
	 * @param handler	Function that should be called
	 */
	addEventListener: function(type, handler, scope, priority, once)
	{
		if (!type) throw new Error('Event type undefined');
		if (!handler || !conbo.isFunction(handler)) throw new Error('Event handler is undefined or not a function');

		if (conbo.isString(type)) type = type.split(' ');
		if (conbo.isArray(type)) conbo.each(type, function(value, index, list) { this._addEventListener(value, handler, scope, priority, !!once); }, this);
		else conbo.each(type, function(value, key, list) { this._addEventListener(key, value, scope, priority, !!once); }, this); 
		
		return this;
	},
	
	/**
	 * Remove a listener for a particular event type
	 * @param type		Type of event ('change') or events ('change blur')
	 * @param handler	Function that should be called
	 * @param scope	The scope
	 */
	removeEventListener: function(type, handler, scope)
	{
		if (!arguments.length)
		{
			this.__queue__ = {};
			return this;
		}
		
		if (!type) throw new Error('Event type undefined');
		if (arguments.length == 2 && !handler) return this;
		
		var a = arguments;
		
		if (conbo.isString(type)) type = type.split(' ');
		if (conbo.isArray(type)) conbo.each(type, function(value, index, list) { this._removeEventListener.apply(this, a); }, this);
		else conbo.each(type, function(value, key, list) { this._removeEventListener.apply(this, a); }, this);
		
		return this;
	},
	
	/**
	 * Dispatch the event to listeners
	 * @param event		conbo.Event class instance or event type (e.g. 'change')
	 */
	dispatchEvent: function(event)
	{
		if (!event) throw new Error('Event undefined');
		
		var isString = conbo.isString(event);
		
		if (isString)
		{
			console.warn('Use of dispatchEvent("'+event+'") is deprecated, please use dispatchEvent(new conbo.Event("'+event+'"))');
		}
		
		if (isString || !(event instanceof conbo.Event))
		{
			event = new conbo.Event(event);
		}
		
		if (!this.__queue__ || (!(event.type in this.__queue__) && !this.__queue__.all)) return this;
		
		if (!event.target) event.target = this;
		event.currentTarget = this;
		
		var queue = conbo.union(this.__queue__[event.type] || [], this.__queue__.all || []);
		if (!queue || !queue.length) return this;
		
		for (var i=0, length=queue.length; i<length; ++i)
		{
			var value = queue[i];
			var returnValue = value.handler.call(value.scope || this, event);
			if (value.once) this._removeEventListener(event.type, value.handler, value.scope);
			if (returnValue === false || event.immediatePropagationStopped) break;
		}
		
		return this;
	},
	
	dispatchChange: function(propName)
	{
		_dispatchChange(this, propName);
	},
	
	/**
	 * @private
	 */
	_addEventListener: function(type, handler, scope, priority, once)
	{
		if (type == '*') type = 'all';
		if (!this.__queue__) _defineIncalculableProperty(this, '__queue__', {});
		this._removeEventListener(type, handler, scope);
		
		if (!(type in this.__queue__)) this.__queue__[type] = [];
		this.__queue__[type].push({handler:handler, scope:scope, once:once, priority:priority||0});
		this.__queue__[type].sort(function(a,b){return b.priority-a.priority});
	},
	
	/**
	 * @private
	 */
	_removeEventListener: function(type, handler, scope)
	{
		if (!this.__queue__ || !(type in this.__queue__)) return this;
		
		var queue = this.__queue__[type];
		
		if (arguments.length == 1)
		{
			delete this.__queue__[type];
			return this;
		}
		
		var i;
		
		for (i=0; i<queue.length; i++)
		{
			if ((queue[i].handler == handler || !queue[i].handler)
				&& (queue[i].scope == scope || !queue[i].scope))
			{
				queue.splice(i--, 1);
			}
		}
		
		return this;
	},
	
	/**
	 * Get the value of a property
	 * @param	attribute
	 * @example	instance.get('n');
	 * @returns
	 */
	get: function(propName)
	{
		return this[propName];
	},
	
	/**
	 * Set the value of one or more property and dispatch a change:[propertyName] event
	 * 
	 * Event handlers, in line with conbo.Model change:[propertyName] handlers, 
	 * should be in the format handler(source, value) {...}
	 * 
	 * @param 	attribute
	 * @param 	value
	 * @param 	options
	 * @example	instance.set('n', 123);
	 * @example	instance.set({n:123, s:'abc'});
	 * @returns	this
	 */
	set: function(propName, value)
	{
		if (conbo.isObject(propName))
		{
			conbo.each(propName, function(value, key) { this.set(key, value); }, this);
			return this;
		}
		
		if (this[propName] === value)
		{
			return this;
		}
		
		this[propName] = value;
		
		// We're assuming accessors will dispatch their own change events
		if (!conbo.isAccessor(this, propName))
		{
			_dispatchChange(this, propName);
		}
		
		return this;
	},
	
//	/**
//	 * Delete a property and dispatch a change:[propertyName] event
//	 * @param 	value
//	 * @returns	this
//	 */
//	unset: function(attribute)
//	{
//		delete this[attribute];
//		this.dispatchChangeEvent(attribute)
//		return this;
//	},
	
	toString: function()
	{
		return 'conbo.EventDispatcher';
	}	
	
});

//(function()
//{
//	var value;
//	
//	Object.defineProperty
//	(
//		conbo.Injectable.prototype,
//		'bindable',
//		
//		{
//			configurable: true,
//			enumerable: false,
//			
//			get: function()
//			{
//				return value;
//			},
//			
//			set: function(newValue)
//			{
//				if (!newValue || newValue == value) return;
//				
//				value = newValue;
//				conbo.bindable.apply(conbo, [this].concat(newValue));
//			}
//		}
//	);
//	
//})();

_defineIncalculableProperty(conbo.EventDispatcher.prototype, 'bindable');
_denumerate(conbo.EventDispatcher.prototype);

/**
 * conbo.Context
 * 
 * This is your application's event bus and dependency injector, and is
 * usually where all your models and web service classes are registered,
 * using mapSingleton(...), and Command classes are mapped to events 
 * 
 * @author		Neil Rackett
 */
conbo.Context = conbo.EventDispatcher.extend
({
	/**
	 * Constructor: DO NOT override! (Use initialize instead)
	 * @param options
	 */
	constructor: function(options)
	{
		options || (options = {});
		
		_defineIncalculableProperty(this, '__commands__', {});
		_defineIncalculableProperty(this, '__singletons__', {});
		
		this.app = options.app;
		
		this.addEventListener(conbo.Event.ALL, this._allHandler);
		this.initialize.apply(this, arguments);
		
		conbo.bindProperties(this, this.bindable);
	},
	
	/**
	 * Initialize: Override this
	 * @param options
	 */
	initialize: function(options) {},
	
	/**
	 * Map specified Command class the given event
	 */
	mapCommand: function(eventType, commandClass)
	{
		if (!eventType) throw new Error('eventType cannot be undefined');
		if (!commandClass) throw new Error('commandClass cannot be undefined');
		
		if (this._mapMulti(eventType, commandClass, this.mapCommand)) return;
		
		if (this.__commands__[eventType] && this.__commands__[eventType].indexOf(commandClass) != -1)
		{
			return;
		}
		
		this.__commands__[eventType] = this.__commands__[eventType] || [];
		this.__commands__[eventType].push(commandClass);
		
		return this;
	},
	
	/**
	 * Unmap specified Command class from given event
	 */
	unmapCommand: function(eventType, commandClass)
	{
		if (!eventType) throw new Error('eventType cannot be undefined');
		if (this._mapMulti(eventType, commandClass, this.unmapCommand)) return;
		
		if (commandClass === undefined)
		{
			delete this.__commands__[eventType];
			return;
		}
		
		if (!this.__commands__[eventType]) return;
		var index = this.__commands__[eventType].indexOf(commandClass);
		if (index == -1) return;
		this.__commands__[eventType].splice(index, 1);
		
		return this;
	},
	
	/**
	 * Map class instance to a property name
	 * 
	 * To inject a property into a class, register the property name
	 * with the Context and set the value of the property in your
	 * class to 'use inject' 
	 * 
	 * @example		context.mapSingleton('myProperty', MyModel);
	 * @example		myProperty: undefined
	 */
	mapSingleton: function(propertyName, singletonClass)
	{
		if (!propertyName) throw new Error('propertyName cannot be undefined');
		if (!singletonClass) throw new Error('singletonClass cannot be undefined');
		
		if (this._mapMulti(propertyName, singletonClass, this.mapSingleton)) return;
		
		this.__singletons__[propertyName] = conbo.isClass(singletonClass)
			// TODO Improved dynamic class instantiation
			? new singletonClass(arguments[2], arguments[3], arguments[4])
			: singletonClass;
			
		return this;
	},
	
	/**
	 * Unmap class instance from a property name
	 */
	unmapSingleton: function(propertyName)
	{
		if (!propertyName) throw new Error('propertyName cannot be undefined');
		if (this._mapMulti(propertyName, null, this.unmapSingleton)) return;
		
		if (!this.__singletons__[propertyName]) return;
		delete this.__singletons__[propertyName];
		
		return this;
	},
	
	/**
	 * Add this context to the specified Object
	 */
	addTo: function(obj)
	{
		return conbo.extend(obj || {}, {context:this});
	},
	
	/**
	 * Inject singleton instances into specified object
	 */
	injectSingletons: function(obj)
	{
		for (var a in obj)
		{
			if (obj[a] !== undefined) continue;
			
			if (a in this.__singletons__)
			{
				obj[a] = this.__singletons__[a];
			}
		}
		
		return this;
	},
	
	toString: function()
	{
		return 'conbo.Context';
	},
	
	/**
	 * @private
	 */
	_allHandler: function(event)
	{
		var commands = conbo.union(this.__commands__.all || [], this.__commands__[event.type] || []);
		if (!commands.length) return;
		
		conbo.each(commands, function(commandClass, index, list)
		{
			this._executeCommand(commandClass, event);
		}, 
		this);
	},
	
	/**
	 * @private
	 */
	_executeCommand: function(commandClass, event)
	{
		var command, options;
		
		options = {event:event};
		
		command = new commandClass(this.addTo(options));
		command.execute();
		command = null;
		
		return this;
	},
	
	/**
	 * @private
	 */
	_mapMulti: function(n, c, f)
	{
		if (conbo.isArray(n) || n.indexOf(' ') == -1) return false;
		var names = conbo.isArray(n) ? n : n.split(' ');
		conbo.each(names, function(e) { f(e,c); }, this);
		return true;
	}
	
});

_denumerate(conbo.Context.prototype);

/**
 * conbo.Hash
 * 
 * A Hash is a bindable object of associated keys and values
 * 
 * @example	
 * 	this.set('fun', 123};
 * 	this.get('fun');
 * 
 * @author		Neil Rackett
 */

conbo.Hash = conbo.EventDispatcher.extend
({
	/**
	 * Constructor: DO NOT override! (Use initialize instead)
	 * @param options
	 */
	constructor: function(properties, options)
	{
		if (!!options) this.context = options.context;
		
		conbo.defaults(this, properties, this.defaults)		
		_defineIncalculableProperty(this, '__properties__', this);
		
		this.initialize.apply(this, arguments);
		
		conbo.bindProperties.apply(conbo, [this].concat(this.bindable || []));
	},
	
	/**
	 * Return an object that can easily be converted into JSON
	 */
	toJSON: function()
	{
		var keys = conbo.keys(this.__properties__),
			filter = function(value) { return String(value).indexOf('_') != 0; };
		
		return conbo.pick(this.__properties__, conbo.filter(keys, filter));
	},
	
	toString: function()
	{
		return 'conbo.Hash';
	}
	
}).implement(conbo.Injectable);

//Underscore methods that we want to implement on the Model.
var hashMethods = ['keys', 'values', 'pairs', 'invert', 'pick', 'omit', 'size'];

//Mix in each available Lo-Dash/Underscore method as a proxy to `Model#attributes`.
conbo.each(hashMethods, function(method)
{
	if (!(method in conbo)) return;
	
	conbo.Hash.prototype[method] = function() 
	{
		return conbo[method].apply(conbo, [this.__properties__].concat(conbo.rest(arguments)));
	};
});

_denumerate(conbo.Hash.prototype);

/**
 * List
 * 
 * A bindable Array wrapper that can be used as a lightweight alternative to 
 * conbo.Collection for collections that don't require web service connectivity.
 * 
 * Unlike Collection, List doesn't automatically convert added items into
 * Hash or Model, but does automatically detect if Bindable objects are added
 * to it and automatically watches them for changes
 */
conbo.List = conbo.EventDispatcher.extend
({
	/**
	 * Constructor: DO NOT override! (Use initialize instead)
	 * @param options
	 */
	constructor: function(models, options) 
	{
		options || (options = {});
		
		this.bindAll('_redispatch');
		this.length = 0;
		
		this._models = (models || []).slice();
		this.context = options.context;
		
		this.initialize.apply(this, arguments);
		conbo.bindProperties(this, this.bindable);
	},
	
	/**
	 * Initialize is an empty function by default. Override it with your own
	 * initialization logic.
	 */
	initialize: function(){},
	
	/**
	 * The JSON representation of a Collection is an array of the
	 * models' attributes.
	 */
	toJSON: function() 
	{
		return this;
	},
	
	/**
	 * Add a model to the end of the collection.
	 */
	push: function(model)
	{
		this.length = this._models.push.apply(this._models, arguments);
		this._handleChange(conbo.toArray(arguments));
		this.dispatchEvent(new conbo.ConboEvent(conbo.ConboEvent.ADD));
		
		return this.length;
	},
	
	/**
	 * Remove a model from the end of the collection.
	 */
	pop: function(options)
	{
		if (!this.length) return;
		
		var model = this._models.pop();
		
		this._handleChange(model, false);
		this.length = this._models.length;
		this.dispatchEvent(new conbo.ConboEvent(conbo.ConboEvent.REMOVE));
		
		return model;
	},
	
	/**
	 * Add a model to the beginning of the collection.
	 */
	unshift: function(model) 
	{
		this.length = this._models.unshift.apply(this._models, arguments);
		this._handleChange(conbo.toArray(arguments));
		this.dispatchEvent(new conbo.ConboEvent(conbo.ConboEvent.ADD));
		
		return this.length;
	},
	
	/**
	 * Remove a model from the beginning of the collection.
	 */
	shift: function()
	{
		if (!this.length) return;
		
		var model;
		
		this._handleChange(model = this._models.shift(), false);
		this.length = this._models.length;
		this.dispatchEvent(new conbo.ConboEvent(conbo.ConboEvent.REMOVE));
		
		return model;
	},
	
	/**
	 * Slice out a sub-array of models from the collection.
	 */
	slice: function(begin, length)
	{
		return this._models.slice(begin, length);
	},
	
	/**
	 * Splice out a sub-array of models from the collection.
	 */
	splice: function(begin, length)
	{
		var inserts = conbo.rest(arguments,2).length;
		
		var models = this._models.splice(begin, length, inserts);
		this.length = this._models.length;
		
		if (models.length) this.dispatchEvent(new conbo.ConboEvent(conbo.ConboEvent.REMOVE));
		if (inserts.length) this.dispatchEvent(new conbo.ConboEvent(conbo.ConboEvent.ADD));
		
		return models;
	},
	
	/**
	 * Get the item at the given index; similar to array[index]
	 */
	get: function(index) 
	{
		return this._models[index];
	},
	
	/**
	 * Add (or replace) item at given index with the one specified,
	 * similar to array[index] = value;
	 */
	set: function(index, model)
	{
		var replaced = this._models[index];
		this._handleChange(replaced, false);
		
		this._models[index] = model
		this._handleChange(model);
		
		if (this._models.length > this.length)
		{
			this.length = this._models.length;
			this.dispatchEvent(new conbo.ConboEvent(conbo.ConboEvent.ADD));
		}
		
		this.dispatchEvent(new conbo.ConboEvent(conbo.ConboEvent.CHANGE, {model:model}));
		
		return replaced;
	},
	
	/**
	 * @see	get
	 */
	at: function(index) 
	{
		return this.get(index);
	},
	
	/**
	 * Force the collection to re-sort itself. You don't need to call this under
	 * normal circumstances, as the set will maintain sort order as each item
	 * is added.
	 */
	sort: function(compareFunction) 
	{
		this._models.sort(compareFunction);
		this.dispatchEvent(new conbo.ConboEvent(conbo.ConboEvent.SORT));
		
		return this;
	},
	
	/**
	 * Create a new collection with an identical list of models as this one.
	 */
	clone: function() 
	{
		return new this.constructor(this._models);
	},

	toString: function()
	{
		return 'conbo.List';
	},
	
	/**
	 * Listen to the events of Bindable values so we can detect changes
	 * @param 	{any}		models
	 * @param 	{Boolean}	enabled
	 */
	_handleChange: function(models, enabled)
	{
		var method = enabled === false ? 'off' : 'on'
		
		models = (conbo.isArray(models) ? models : [models]).slice();
		
		while (models.length)
		{
			var model = models.pop();
			
			if (model instanceof conbo.EventDispatcher)
			{
				model[method](conbo.ConboEvent.CHANGE, this._redispatch);
			}
		}
	},
	
	/**
	 * Passthrough event to bubble events dispatched by Bindable array elements 
	 */
	_redispatch: function(event)
	{
		this.dispatchEvent(event);
	}
	
}).implement(conbo.Injectable);

// Underscore methods that we want to implement on the List.
var methods = 
[
	'forEach', 'each', 'map', 'collect', 'reduce', 'foldl',
	'inject', 'reduceRight', 'foldr', 'find', 'detect', 'filter', 'select',
	'reject', 'every', 'all', 'some', 'any', 'include', 'contains', 'invoke',
	'max', 'min', 'toArray', 'size', 'first', 'head', 'take', 'initial', 'rest',
	'tail', 'drop', 'last', 'without', 'indexOf', 'shuffle', 'lastIndexOf',
	'isEmpty', 'chain'
];

// Mix in each available Underscore/Lo-Dash method as a proxy to `Collection#models`.
conbo.each(methods, function(method) 
{
	if (!(method in _)) return;
	
	conbo.List.prototype[method] = function() 
	{
		var args = [].slice.call(arguments);
		args.unshift(this._models);
		return _[method].apply(_, args);
	};
});

// Underscore methods that take a property name as an argument.
var attributeMethods = ['groupBy', 'countBy', 'sortBy'];

// Use attributes instead of properties.
conbo.each(attributeMethods, function(method)
{
	if (!(method in conbo)) return;
	
	conbo.List.prototype[method] = function(value, context) 
	{
		var iterator = conbo.isFunction(value) ? value : function(model) 
		{
			return model.get(value);
		};
		
		return conbo[method](this._models, iterator, context);
	};
});

_denumerate(conbo.List.prototype);

/**
 * Attribute Bindings
 * 
 * Functions that can be used to bind DOM elements to properties of Bindable 
 * class instances to DOM elements via their attributes
 * 
 * @example		<div cb-hide="property">Hello!</div>
 * @author 		Neil Rackett
 */
conbo.AttributeBindings = conbo.Class.extend
({
	initialize: function()
	{
		this.cbClass.multiple = true;
	},
	
	/**
	 * Can the given attribute be bound to multiple properties at the same time?
	 * @param 	{String}	attribute
	 * @returns {Boolean}
	 */
	canHandleMultiple: function(attribute)
	{
		var f = conbo.toCamelCase(attribute);
		
		return (f in this)
			? !!this[f].multiple
			: false;
	},
	
	/**
	 * Makes an element visible
	 * 
	 * @param value
	 * @param el
	 */
	cbShow: function(value, el)
	{
		this.cbHide(!value, el);
	},
	
	/**
	 * Hides an element by making it invisible, but does not remove
	 * if from the layout of the page, meaning a blank space will remain
	 * 
	 * @param value
	 * @param el
	 */
	cbHide: function(value, el)
	{
		var $el = $(el);
		
		!!value
			? $el.addClass('cb-hide')
			: $el.removeClass('cb-hide');
	},
	
	/**
	 * Include an element on the screen and in the layout of the page
	 * 
	 * @param value
	 * @param el
	 */
	cbInclude: function(value, el)
	{
		this.cbExclude(!value, el);
	},
	
	/**
	 * Remove an element from the screen and prevent it having an effect
	 * on the layout of the page
	 * 
	 * @param value
	 * @param el
	 */
	cbExclude: function(value, el)
	{
		var $el = $(el);
		
		!!value
			? $el.addClass('cb-exclude')
			: $el.removeClass('cb-exclude');
	},
	
	/**
	 * Inserts raw HTML into the element, which is rendered as HTML
	 * 
	 * @param value
	 * @param el
	 */
	cbHtml: function(value, el)
	{
		$(el).html(value);
	},
	
	/**
	 * Inserts text into the element so that it appears on screen exactly as
	 * it's written by converting special characters (<, >, &, etc) into HTML
	 * entities before rendering them, e.g. "8 < 10" -> "8 &lt; 10"
	 * 
	 * @param value
	 * @param el
	 */
	cbText: function(value, el)
	{
		if (!value) value = '';
		
		var textArea;
		
		textArea = document.createElement('textarea');
		textArea.innerHTML = value;
		
		$(el).html(textArea.innerHTML);
	},
	
	/**
	 * Applies or removes a CSS class to or from the element based on the value
	 * of the bound property, e.g. cb-css-my-class="myValue" will apply the 
	 * "my-class" CSS class to the element when "myValue" equates to true.
	 * 
	 * @param value
	 * @param el
	 */
	cbClass: function(value, el, options, className)
	{
		if (!className)
		{
			throw new Error('cb-class attributes must specify one or more CSS classes in the format cb-class="myProperty;class-name"');
		}
		
		var $el = $(el);
		
		!!value
			? $el.addClass(className)
			: $el.removeClass(className);
	},
	
	/**
	 * Repeat the selected element
	 * 
	 * @param value
	 * @param el
	 */
	cbRepeat: function(values, el, options, itemRendererClassName)
	{
		var a, 
			args = conbo.toArray(arguments),
			$el = $(el),
			viewClass;
		
		if (options && options.context && options.context.app)
		{
			viewClass = options.context.app.getClass(itemRendererClassName);
		}
		
		viewClass || (viewClass = conbo.View);
		el.cbRepeat || (el.cbRepeat = {});
		
		elements = el.cbRepeat.elements || [];
		
		$el.removeClass('cb-exclude');
		
		if (el.cbRepeat.list != values && values instanceof conbo.List)
		{
			if (!!el.cbRepeat.list)
			{
				el.cbRepeat.list.removeEventListener('add remove change', el.cbRepeat.changeHandler);
			}
			
			el.cbRepeat.changeHandler = this.bind(function(event)
			{
				this.cbRepeat.apply(this, args);
			});
			
			values.addEventListener('add remove change', el.cbRepeat.changeHandler);
			el.cbRepeat.list = values;
		}
		
		switch (true)
		{
			case values instanceof Array:
				a = values;
				break;
				
			case values instanceof conbo.List:
				a = values.toArray();
				break;
				
			default:
				a = [];
				break;
		}
		
		if (!!elements.length)
		{
			$(elements[0]).before($el);
		}
		
		while (elements.length)
		{
			$(elements.pop()).remove();
		}
		
		a.forEach(function(value)
		{
			if (!(value instanceof conbo.Hash))
			{
				value = new conbo.Hash(value);
			}
			
			var $clone = $el.clone().removeAttr('cb-repeat'),
				view = new viewClass(conbo.extend({data:value, el:$clone}, options));
			
			view.$el.addClass('cb-repeat');
			
			elements.push(view.el);
		});
		
		$el.after(elements);
		el.cbRepeat.elements = elements;
		
		!!elements.length
			? $el.remove()
			: $el.addClass('cb-exclude');
	}
	
});
/**
 * Binding utility class
 * 
 * Used to bind properties of EventDispatcher class instances to DOM elements, 
 * other EventDispatcher class instances or setter functions
 * 
 * @author Neil Rackett
 */
conbo.BindingUtils = conbo.Class.extend({},
{
	_attrBindings: new conbo.AttributeBindings(),
	
	/**
	 * Bind a property of a EventDispatcher class instance (e.g. Hash or Model) 
	 * to a DOM element's value/content, using Conbo's best judgement to
	 * work out how the value should be bound to the element.
	 * 
	 * This method of binding also allows for the use of a parse function,
	 * which can be used to manipulate bound data in real time
	 * 
	 * @param 		{conbo.EventDispatcher}	source				Class instance which extends from conbo.EventDispatcher (e.g. Hash or Model)
	 * @param 		{String} 				propertyName		Property name to bind
	 * @param 		{DOMElement} 			element				DOM element to bind value to (two-way bind on input/form elements)
	 * @param 		{Function}				parseFunction		Optional method used to parse values before outputting as HTML
	 * 
	 * @returns		{Array}										Array of bindings
	 */
	bindElement: function(source, propertyName, element, parseFunction)
	{
		if (!(source instanceof conbo.EventDispatcher))
		{
			throw new Error('Source is not EventDispatcher');
		}
		
		if (!element)
		{
			throw new Error('element is undefined');
		}
		
		var bindings = [],
			eventType,
			eventHandler;
		
		parseFunction || (parseFunction = this.defaultParseFunction);
		
		$(element).each(function(index, el)
		{
			var $el = $(el);
			var tagName = $el[0].tagName;
			
			switch (tagName)
			{
				case 'INPUT':
				case 'SELECT':
				case 'TEXTAREA':
				{	
					var type = ($el.attr('type') || tagName).toLowerCase();
					
					switch (type)
					{
						case 'checkbox':
						{
							$el.prop('checked', !!source.get(propertyName));
							
							eventType = 'change:'+propertyName;
							
							eventHandler = function(event)
							{
								$el.prop('checked', !!event.value);
							};
							
							source.addEventListener(eventType, eventHandler);
							bindings.push([source, eventType, eventHandler]);
							
							eventType = 'input change';
							
							eventHandler = function(event)
							{	
								source.set(propertyName, $el.is(':checked'));
							};
							
							$el.on(eventType, eventHandler);
							bindings.push([$el, eventType, eventHandler]);
							
							return;
						}
						
						case 'radio':
						{
							if ($el.val() == source.get(propertyName)) $el.prop('checked', true);
							
							eventType = 'change:'+propertyName;
							
							eventHandler = function(event)
							{
								if ($el.val() != event.value) return; 
								$el.prop('checked', true);
							};
							
							source.addEventListener(eventType, eventHandler);
							bindings.push([source, eventType, eventHandler]);
							
							break;
						}
						
						default:
						{
							$el.val(source.get(propertyName));
						
							eventType = 'change:'+propertyName;
							
							eventHandler = function(event)
							{
								if ($el.val() == event.value) return;
								$el.val(event.value);
							};
							
							source.addEventListener(eventType, eventHandler);
							bindings.push([source, eventType, eventHandler]);
							
							break;
						}
					}
					
					eventType = 'input change';
					
					eventHandler = function(event)
					{	
						source.set(propertyName, $el.val() || $el.html());
					};
					
					$el.on(eventType, eventHandler);
					bindings.push([$el, eventType, eventHandler]);
					
					break;
				}
				
				default:
				{
					$el.html(parseFunction(source.get(propertyName)));
					
					eventType = 'change:'+propertyName;
					
					eventHandler = function(event) 
					{
						var html = parseFunction(event.value);
						$el.html(html);
					};
					
					source.addEventListener(eventType, eventHandler);
					bindings.push([source, eventType, eventHandler]);
					
					break;
				}
			}
			
		});
		
		return bindings;
	},
	
	/**
	 * Bind a DOM element to the property of a EventDispatcher class instance,
	 * e.g. Hash or Model, using cb-* attributes to specify how the binding
	 * should be made.
	 * 
	 * Two way bindings will automatically be applied where the attribute name 
	 * matches a property on the target element, meaning your EventDispatcher object 
	 * will automatically be updated when the property changes.
	 * 
	 * @param 	{conbo.EventDispatcher}	source			Class instance which extends from conbo.EventDispatcher (e.g. Hash or Model)
	 * @param 	{String}			propertyName	Property name to bind
	 * @param 	{DOMElement}		element			DOM element to bind value to (two-way bind on input/form elements)
	 * @param 	{String}			attributeName	The cb-* property to bind against in camelCase, e.g. "propName" for "cb-prop-name"
	 * @param 	{Function} 			parseFunction	Method used to parse values before outputting as HTML (optional)
	 * @param	{Object}			options			Options related to this attribute binding (optional)
	 * 
	 * @returns	{Array}								Array of bindings
	 */
	bindAttribute: function(source, propertyName, element, attributeName, parseFunction, options)
	{
		if (this._isReservedAttribute(attributeName))
		{
			return [];
		}
		
		if (!element)
		{
			throw new Error('element is undefined');
		}
		
		if (attributeName == "bind" || attributeName == "model")
		{
			return this.bindElement(source, propertyName, element, parseFunction);
		}
		
		var scope = this,
			bindings = [],
			isConbo = false,
			isNative = false,
			eventType,
			eventHandler,
			args = conbo.toArray(arguments).slice(5),
			camelCase = conbo.toCamelCase('cb-'+attributeName),
			split = attributeName.split('-');
		
		switch (true)
		{
			case split[0] == 'attr':
			{
				attributeName = attributeName.substr(5);
				isNative = attributeName in element;
				break;
			}
			
			default:
			{
				isConbo = camelCase in this._attrBindings;
				isNative = !isConbo && attributeName in element;
			}
		}
		
		parseFunction || (parseFunction = this.defaultParseFunction);
		
		switch (true)
		{
			// If we have a bespoke handler for this attribute, use it
			case isConbo:
			{
				if (!(source instanceof conbo.EventDispatcher))
				{
					throw new Error('Source is not EventDispatcher');
				}
				
				eventHandler = function(event)
				{
					scope._attrBindings[camelCase].apply
					(
						scope._attrBindings, 
						[parseFunction(source.get(propertyName)), element].concat(args)
					);
				}
				
				eventType = 'change:'+propertyName;
				
				source.addEventListener(eventType, eventHandler);
				eventHandler();
				
				bindings.push([source, eventType, eventHandler]);
				
				break;
			}
			
			case isNative:
			{
				switch (true)
				{
					case !attributeName.indexOf('on') == 0 && conbo.isFunction(element[attributeName]):
						console.warn('cb-'+attributeName+' is not a recognised attribute, did you mean cb-on'+attributeName+'?');
						break;
						
					// If it's an event, add a listener
					case attributeName.indexOf('on') == 0:
					{
						if (!conbo.isFunction(source[propertyName]))
						{
							throw new Error(propertyName+' is not a function and cannot be bound to DOM events');
						}
						
						$(element).on(attributeName.substr(2), source[propertyName]);
						return this;
					}
					
					// ... otherwise, bind to the native property
					default:
					{
						if (!(source instanceof conbo.EventDispatcher))
						{
							throw new Error('Source is not EventDispatcher');
						}
						
						eventHandler = function()
						{
							var value;
							
							value = parseFunction(source.get(propertyName));
							value = conbo.isBoolean(element[attributeName]) ? !!value : value;
							
							element[attributeName] = value;
						}
					    
						eventType = 'change:'+propertyName;
						source.addEventListener(eventType, eventHandler);
						eventHandler();
						
						bindings.push([source, eventType, eventHandler]);
						
						var $el = $(element);
						
						eventHandler = function()
		     			{
		     				source.set(propertyName, element[attributeName]);
		     			};
						
		     			eventType = 'input change';
						$el.on(eventType, eventHandler);
						
						bindings.push([$el, eventType, eventHandler]);
						
						break;
					}
				}
				
				break;
			}
			
			default:
			{
				console.warn('cb-'+attributeName+' is not recognised or does not exist on specified element');
				break;
			}
		}
		
		return bindings;
	},
	
	/**
	 * Bind everything within the DOM scope of a View to the specified 
	 * properties of EventDispatcher class instances (e.g. Hash or Model)
	 * 
	 * @param 	{conbo.View}		view		The View class controlling the element
	 * @returns	{this}
	 */
	bindView: function(view)
	{
		if (!view)
		{
			throw new Error('view is undefined');
		}
		
		if (!!view.__bindings__)
		{
			this.unbindView(view);
		}
		
		var options = {view:view},
			bindings = [],
			$nestedViews = view.$('.cb-view, [cb-view], .cb-app, [cb-app]'),
			$ignored = view.$('[cb-repeat]'),
			scope = this;
		
		if (!!view.context) view.context.addTo(options);
		
		view.$('*').add(view.el).filter(function()
		{
			if (this == view.el) return true;
			if (!!$nestedViews.find(this).length || !!$nestedViews.filter(this).length) return false;
			if (!!$ignored.find(this).length) return false;
			return true;
		})
		.each(function(index, el)
		{
			var cbData = $(el).cbAttrs(false);
			
			if (!cbData) 
			{
				return;
			}
			
			var keys = conbo.keys(cbData);
			
			keys.forEach(function(key)
			{
				if (scope._isReservedAttribute(key))
				{
					return;
				}
				
				var a, i, f,
					d = cbData[key],
					b = d.split('|'),
					splits = scope._splitAttribute('cb-'+key, b[0]);
				
				if (!splits)
				{
					throw new Error('cb-'+key+' attribute cannot be empty');
				}
				
				try
				{
					f = !!b[1] ? eval('view.'+scope.cleanPropertyName(b[1])) : undefined;
					f = conbo.isFunction(f) ? f : undefined;
				}
				catch (e) {}
				
				for (a in splits)
				{
					var param = splits[a],
						split = scope.cleanPropertyName(a).split('.'),
						property = split.pop(),
						model;
					
					try
					{
						model = !!split.length ? eval('view.'+split.join('.')) : view;
					}
					catch (e) {}
					
					if (!model) throw new Error(a+' is not defined in this View');
					if (!property) throw new Error('Unable to bind to undefined property: '+property);
					
					var args = [model, property, el, key, f, options, param];
	
					bindings = bindings.concat(scope.bindAttribute.apply(scope, args));
				}
				
			});
			
		});
		
		_defineIncalculableProperty(view, '__bindings__', bindings);
		
		return this;
	},
	
	/**
	 * Removes all data binding from the specified View instance
	 * @param 	{conbo.View}	view
	 * @return	{this}
	 */
	unbindView: function(view)
	{
		if (!view)
		{
			throw new Error('view is undefined');
		}
		
		if (!view.__bindings__ || !view.__bindings__.length)
		{
			return this;
		}
		
		var bindings = view.__bindings__;
		
		while (bindings.length)
		{
			var binding = bindings.pop();
			
			try
			{
				switch (true)
				{
					case binding[0] instanceof $:
					{
						binding[0].off(binding[1], binding[2]);
						break;
					}
					
					case binding[0] instanceof conbo.EventDispatcher:
					case !!binding[0] && !!binding[0].removeEventListener:
					{
						binding[0].removeEventListener(binding[1], binding[2]);
						break;
					}
					
					default:
					{
						// Looks like the object's been deleted!
						break;
					}
				}
			}
			catch (e) 
			{
				// TODO ?
			}
		}
		
		delete view.__bindings__;
		
		return this;
	},
	
	/**
	 * Bind the property of one EventDispatcher class instance (e.g. Hash or Model) to another
	 * 
	 * @param 	{conbo.EventDispatcher}	source						Class instance which extends conbo.EventDispatcher
	 * @param 	{String}			sourcePropertyName			Source property name
	 * @param 	{any}				destination					Object or class instance which extends conbo.EventDispatcher
	 * @param 	{String}			destinationPropertyName		Optional (default: sourcePropertyName)
	 * @param 	{Boolean}			twoWay						Optional (default: false)
	 * 
	 * @returns	{this}
	 */
	bindProperty: function(source, sourcePropertyName, destination, destinationPropertyName, twoWay)
	{
		if (!(source instanceof conbo.EventDispatcher)) throw new Error('Source is not EventDispatcher');
		
		destinationPropertyName || (destinationPropertyName = sourcePropertyName);
		
		source.addEventListener('change:'+sourcePropertyName, function(event)
		{
			if (!(destination instanceof conbo.EventDispatcher))
			{
				destination[destinationPropertyName] = event.value;
				return;
			}
			
			destination.set(destinationPropertyName, event.value);
		});
		
		if (twoWay && destination instanceof conbo.EventDispatcher)
		{
			this.bindProperty(destination, destinationPropertyName, source, sourcePropertyName);
		}
		
		return this;
	},
	
	/**
	 * Call a setter function when the specified property of a EventDispatcher 
	 * class instance (e.g. Hash or Model) is changed
	 * 
	 * @param 	{conbo.EventDispatcher}	source				Class instance which extends conbo.EventDispatcher
	 * @param 	{String}			propertyName
	 * @param 	{Function}			setterFunction
	 */
	bindSetter: function(source, propertyName, setterFunction)
	{
		if (!(source instanceof conbo.EventDispatcher)) throw new Error('Source is not EventDispatcher');
		
		if (!conbo.isFunction(setterFunction))
		{
			if (!setterFunction || !(propertyName in setterFunction))
			{
				throw new Error('Invalid setter function');
			}
			
			setterFunction = setterFunction[propertyName];
		}
		
		source.addEventListener('change:'+propertyName, function(event)
		{
			setterFunction(event.value);
		});
		
		return this;
	},
	
	/**
	 * Default parse function
	 * 
	 * @param	value
	 * @returns	{any}
	 */
	defaultParseFunction: function(value)
	{
		return typeof(value) == 'undefined' ? '' : value;
	},
	
	/**
	 * Remove everything except alphanumberic and dots from Strings
	 * 
	 * @private
	 * @param 		{String}	view		String value to clean
	 * @returns		{String}
	 */
	cleanPropertyName: function(value)
	{
		return (value || '').replace(/[^\w\._]/g, '');
	},
	
	toString: function()
	{
		return 'conbo.BindingUtils';
	},
	
	/**
	 * Reserved attributes
	 * @private
	 */
	_reservedAttributes: ['app', 'view'],
	
	/**
	 * Is the specified attribute reserved for another purpose?
	 * 
	 * @private
	 * @param 		{String}	value
	 * @returns		{Boolean}
	 */
	_isReservedAttribute: function(value)
	{
		return this._reservedAttributes.indexOf(value) != -1;
	},
	
	/**
	 * Split JSON-ish attribute values into usable chunks
	 * @private
	 * @param value
	 */
	_splitAttribute: function(attribute, value)
	{
		if (!conbo.isString(value))
		{
			return;
		}
		
		var a = value.split(','),
			o = {},
			i;
		
		var c = this._attrBindings.canHandleMultiple(attribute)
			? a.length
			: 1;
		
		for (i=0; i<c; ++i)
		{
			s = a[i].split(':');
			o[s[0]] = s[1];
		}
		
		return o;
	}
	
});

/**
 * Glimpse
 * 
 * A lightweight View that has no dependencies, doesn't take any options 
 * and doesn't support data binding
 */
conbo.Glimpse = conbo.EventDispatcher.extend
({
	/**
	 * Constructor: DO NOT override! (Use initialize instead)
	 * @param options
	 */
	constructor: function(options)
	{
		if (conbo.isObject(options) && !!options.el)
		{
			this.setElement(options.el);
		}
		
		this._ensureElement();
		this.initialize.apply(this, arguments);
		
		conbo.bindProperties(this, this.bindable);
	},
	
	/**
	 * The default `tagName` of a View's element is `"div"`.
	 */
	tagName: 'div',
	
	/**
	 * Initialize is an empty function by default. Override it with your own
	 * initialization logic.
	 */
	initialize: function(){},
	
	/**
	 * Your class should override **render**, which is called automatically 
	 * after your View is initialized. If you're using a template, this means
	 * **render** is called immediately after the template is applied to your
	 * View's element (`this.el`).
	 * 
	 * If you want to apply Lo-Dash, Mustache or any other third party
	 * templating to your View, this is the place to do it.
	 * 
	 * The convention is for **render** to always return `this`.
	 */
	render: function() 
	{
		return this;
	},
	
	/**
	 * Change the view's element (`this.el` property)
	 */
	setElement: function(element)
	{
		if (!!this.el) delete this.el.cbView;
		
		_defineIncalculableProperty(this, 'el', element);
		
		this.el.cbView = this;
		this.dispatchEvent(new conbo.ConboEvent(conbo.ConboEvent.ELEMENT_CHANGE));
		
		return this;
	},
	
	toString: function()
	{
		return 'conbo.Glimpse';
	},
	
	/**
	 * Ensure that the View has a DOM element to render into.
	 * If `this.el` is a string, pass it through `$()`, take the first
	 * matching element, and re-assign it to `el`. Otherwise, create
	 * an element from the `id`, `className` and `tagName` properties.
	 * 
	 * @private
	 */
	_ensureElement: function() 
	{
		if (!this.el) 
		{
			var attrs = conbo.extend({}, this.attributes);
			var el = document.createElement(this.tagName);
			
			if (!!this.id) el.id = this.id;
			if (!!this.className) el.className = this.className;
			
			conbo.extend(el, attrs);
			
			this.setElement(el);
		}
		else 
		{
			this.setElement(this.el);
			if (!!this.className) this.el.className += ' '+this.className;
		}
	},
	
}).implement(conbo.Injectable);

_denumerate(conbo.Glimpse.prototype);

/**
 * View
 * 
 * Creating a conbo.View creates its initial element outside of the DOM,
 * if an existing element is not provided...
 * 
 * Some methods derived from the Backbone.js class of the same name
 */
conbo.View = conbo.Glimpse.extend
({
	/**
	 * Constructor: DO NOT override! (Use initialize instead)
	 * @param options
	 */
	constructor: function(options)
	{
		options = conbo.clone(options) || {};
		
		var viewOptions = ['data', 'el', 'id', 'attributes', 'className', 'tagName', 'template', 'templateUrl'];	
		conbo.extend(this, conbo.pick(options, viewOptions));
		
		this._ensureElement();
		
		this.context = options.context;
		
 		this.initialize.apply(this, arguments);
 		
		conbo.bindProperties(this, this.bindable);
		
		var templateUrl = this.templateUrl,
			template = this.template;
		
		if (!!templateUrl)
		{
			this.loadTemplate(templateUrl);
		}
		else
		{
			if (!!template && conbo.isString(template))
			{
				this.$el.html(template);
			}
			
			this.render();
			this.bindView();
		}
	},
	
	/**
	 * jQuery delegate for element lookup, scoped to DOM elements within the
	 * current view. This should be prefered to global lookups where possible.
	 */
	$: function(selector)
	{
		return this.$el.find(selector);
	},
	
	/**
	 * Remove this view by taking the element out of the DOM, and removing any
	 * applicable events listeners.
	 */
	remove: function() 
	{
		this.unbindView()
			.removeEventListener();
		
		this.$el.remove();
		
		return this;
	},
	
	/**
	 * Change the view's element (`this.el` property) and re-bind events
	 */
	setElement: function(element)
	{
		var isBound = !!this.__bindings__;
		
		if (!!this.el) delete this.el.cbView;
		if (isBound) this.unbindView();
		
		_defineIncalculableProperty(this, '$el', $(element));
		_defineIncalculableProperty(this, 'el', this.$el[0]);
		
		this.el.cbView = this;
		
		if (isBound) this.bindView();
		
		this.dispatchEvent(new conbo.ConboEvent(conbo.ConboEvent.ELEMENT_CHANGE));
		
		return this;
	},
	
	/**
	 * Append this DOM element from one View class instance this class 
	 * instances DOM element
	 * 
	 * @param 		view
	 * @returns 	this
	 */
	appendView: function(view)
	{
		if (arguments.length > 1)
		{
			conbo.each(arguments, function(view, index, list) {
				this.appendView(view);
			}, this);
			
			return this;
		}
		
		if (!(view instanceof conbo.View))
			throw new Error('Parameter must be instance of conbo.View class');
		
		this.$el.append(view.el);
		return this;
	},
	
	/**
	 * Prepend this DOM element from one View class instance this class 
	 * instances DOM element
	 * 
	 * @param 		view
	 * @returns 	this
	 */
	prependView: function(view)
	{
		if (arguments.length > 1)
		{
			conbo.each(arguments, function(view, index, list) {
				this.prependView(view);
			}, this);
			
			return this;
		}
		
		if (!(view instanceof conbo.View))
			throw new Error('Parameter must be instance of conbo.View class');
		
		this.$el.prepend(view.el);
		return this;
	},
	
	/**
	 * Automatically bind elements to properties of this View
	 * 
	 * @example	<div cb-bind="property|parseMethod" cb-hide="property">Hello!</div> 
	 * @returns	this
	 */
	bindView: function()
	{
		conbo.BindingUtils.bindView(this);
		return this;
	},
	
	/**
	 * Unbind elements from class properties
	 * @returns	this
	 */
	unbindView: function() 
	{
		conbo.BindingUtils.unbindView(this);
		return this;
	},
	
	/**
	 * Loads HTML template and apply it to this.el, storing the loaded
	 * template will in this.template
	 * 
	 * @param 	{String}	url			A string containing the URL to which the request is sent
	 * @param 	{Object}	data		A plain object or string that is sent to the server with the request
	 * @param 	{Function} 	callback	Callback in format function(responseText, textStatus, xmlHttpRequest)
	 * 
	 * @see					https://api.jquery.com/load/
	 */
	loadTemplate: function(url, data, callbackFunction)
	{
		this.unbindView();
		
		var completeHandler = this.bind(function(response, status, xhr)
		{
			this.template = response;
			
			if (!!callbackFunction)
			{
				callbackFunction.apply(this, arguments);
			}
			
			this.dispatchEvent(new conbo.ConboEvent(conbo.ConboEvent.TEMPLATE_LOADED));
			this.render();
			this.bindView();
		});
		
		this.$el.load(url, data, completeHandler);
	},	
	
	toString: function()
	{
		return 'conbo.View';
	},
	
	/**
	 * Ensure that the View has a DOM element to render into.
	 * If `this.el` is a string, pass it through `$()`, take the first
	 * matching element, and re-assign it to `el`. Otherwise, create
	 * an element from the `id`, `className` and `tagName` properties.
	 * 
	 * @private
	 */
	_ensureElement: function() 
	{
		if (!this.el) 
		{
			var attrs = conbo.extend({}, this.attributes);
			if (this.id) attrs.id = this.id;
			if (this.className) attrs['class'] = this.className;
			var $el = $('<'+this.tagName+'>').attr(attrs);
			this.setElement($el);
		}
		else 
		{
			this.setElement(this.el);
			if (!!this.className) this.$el.addClass(this.className);
		}
		
		if (this instanceof conbo.Application)
		{
			this.$el.addClass('cb-app');
		}
		
		this.$el.addClass('cb-view');
	},
});

_denumerate(conbo.View.prototype);

/**
 * Application
 * 
 * Base application class for client-side applications
 * 
 * @author		Neil Rackett
 */
conbo.Application = conbo.View.extend
({
	/**
	 * Default context class to use
	 * You'll normally want to override this with your own
	 */
	contextClass: conbo.Context,
	
	/**
	 * Constructor: DO NOT override! (Use initialize instead)
	 * @param options
	 */
	constructor: function(options)
	{
		options = conbo.clone(options) || {};
		
		var prefix = options.prefix || this.prefix || '';
		var namespace = options.namespace || this.namespace;
		
		_defineIncalculableProperty(this, 'prefix', prefix);
		_defineIncalculableProperty(this, 'namespace', namespace);
		
		options.app = this;
		options.context = new this.contextClass(options);
		options.el || (options.el = this._findAppElement());
		
		conbo.View.prototype.constructor.call(this, options);
		
		this.applyViews();
	},
	
	/**
	 * Apply View classes child DOM elements based on their cb-view attribute
	 */
	applyViews: function()
	{
		var selector = '[cb-view]';
		
		this.$(selector).not('.cb-view').each(this.bind(function(index, el)
		{
			var view = this.$(el).cbAttrs().view,
				viewClass;
			
			if (viewClass = this.getClass(view))
			{
				new viewClass(this.context.addTo({el:el}));
			}
			
		}));
		
		return this;
	},
	
	/**
	 * Attempt to convert string into a conbo.Class
	 * @param name
	 * @returns
	 */
	getClass: function(name)
	{
		if (!name) return;
		
		var viewClass = !!this.namespace
			? this.namespace[name]
			: eval(name);
		
		if (conbo.isClass(viewClass)) 
		{
			return viewClass;
		}		
	},
	
	toString: function()
	{
		return 'conbo.Application';
	},
	
	/**
	 * Find element with matching cb-app attribute, if it exists
	 */
	_findAppElement: function()
	{
		var $apps = $('[cb-app]');
		
		if (!$apps.length) return undefined;
		
		if (!this.namespace)
		{
			if (!!$apps.length)
			{
				console.warn('Application namespace not specified: unable to bind to cb-app element');
			}
			
			return undefined;
		}
		
		var appName;
		
		for (var a in this.namespace)
		{
			if (this instanceof this.namespace[a])
			{
				appName = a;
				break;
			}
		}
		
		if (!appName) return undefined;
		
		var selector = '[cb-app="'+this._addPrefix(appName)+'"]',
			el = $(selector)[0];
		
		return !!el ? el : undefined;
	},
	
	/**
	 * Returns prefixed class name
	 * @param 	name
	 * @returns
	 */
	_addPrefix: function(name)
	{
		name || (name = '');
		return !!this.prefix ? this.prefix+'.'+name : name;
	}

});

_denumerate(conbo.Application.prototype);

/**
 * conbo.Command
 * 
 * Base class for commands to be registered in your Context 
 * using mapCommand(...)
 * 
 * @author		Neil Rackett
 */
conbo.Command = conbo.EventDispatcher.extend
({
	/**
	 * Constructor: DO NOT override! (Use initialize instead)
	 * @param options
	 */
	constructor: function(options)
	{
		if (!!options) this.context = options.context;
		this.event = options.event || {};
		this.initialize.apply(this, arguments);
		conbo.bindProperties(this, this.bindable);
	},
	
	/**
	 * Initialiser included for consistency, but should probably never be used
	 */
	initialize: function() {},
	
	/**
	 * Execute: should be overridden
	 * 
	 * When a Command is called in response to an event registered with the
	 * Context, the class is instantiated, this method is called then the 
	 * class instance is destroyed
	 */
	execute: function() {},
	
	toString: function()
	{
		return 'conbo.Command';
	}
	
}).implement(conbo.Injectable);

_denumerate(conbo.Command.prototype);

/**
 * Server Application 
 * 
 * Base class for applications that don't require DOM, e.g. Node.js
 * 
 * @author		Neil Rackett
 */
conbo.ServerApplication = conbo.EventDispatcher.extend
({
	/**
	 * Default context class to use
	 * You'll normally want to override this with your own
	 */
	contextClass: conbo.Context,
	
	/**
	 * Constructor: DO NOT override! (Use initialize instead)
	 * @param options
	 */
	constructor: function(options)
	{
		options = conbo.clone(options) || {};
		options.app = this;
		options.context || (options.context = new this.contextClass(options));
		
		this.context = options.context;
		this.initialize.apply(this, arguments);
		
		conbo.bindProperties(this, this.bindable);
	},
	
	toString: function()
	{
		return 'conbo.ServerApplication';
	}
	
}).implement(conbo.Injectable);

_denumerate(conbo.ServerApplication.prototype);

/**
 * conbo.Model
 *
 * Create a new model, with defined attributes. A client id (`cid`)
 * is automatically generated and assigned for you.
 * 
 * Derived from the Backbone.js class of the same name
 */
conbo.Model = conbo.Hash.extend
({
	/**
	 * Constructor: DO NOT override! (Use initialize instead)
	 * @param options
	 */
	constructor: function(properties, options) 
	{
		var defaults;
		var props = properties || {};
		
		options || (options = {});
		
		this.cid = conbo.uniqueId('c');
		
		_defineIncalculableProperty(this, '__properties__', {});
		conbo.extend(this, conbo.pick(options, ['url','urlRoot','collection']));
		
		if (options.parse)
		{
			props = this.parse(props, options) || {};
		}
		
		props = conbo.defaults({}, props, this.defaults);
		
		this.set(props, options);
		
		if (!!options) this.context = options.context;
		this.initialize.apply(this, arguments);
		
		conbo.bindProperties(this, this.bindable);
	},
	
	/**
	 * A hash of attributes whose current and previous value differ.
	 */
	changed: null,

	/**
	 * The value returned during the last failed validation.
	 */
	validationError: null,

	/**
	 * The default name for the JSON `id` attribute is `"id"`. MongoDB and
	 * CouchDB users may want to set this to `"_id"`.
	 */
	idProperty: 'id',

	/**
	 * Initialize is an empty function by default. Override it with your own
	 * initialization logic.
	 */
	initialize: function(){},

	/**
	 * Proxy `conbo.sync` by default -- but override this if you need
	 * custom syncing semantics for *this* particular model.
	 */
	sync: function() 
	{
		return conbo.sync.apply(this, arguments);
	},

	/**
	 * Get the value of an attribute.
	 */
	get: function(attr) 
	{
		return this.__properties__[attr];
	},

	/**
	 * Get the HTML-escaped value of an attribute.
	 */
	escape: function(attr) 
	{
		return conbo.escape(this.get(attr));
	},

	/**
	 * Returns `true` if the attribute contains a value that is not null
	 * or undefined.
	 */
	has: function(attr) 
	{
		return this.get(attr) != null;
	},

	/**
	 * Set a hash of model attributes on the object, firing `"change"`. This is
	 * the core primitive operation of a model, updating the data and notifying
	 * anyone who needs to know about the change in state. The heart of the beast.
	 */
	set: function(key, val, options) 
	{
		var attr, attrs, unset, changes, silent, changing, prev, current;
		
		if (key == null)
		{
			return this;
		}

		// Handle both `"key", value` and `{key: value}` -style arguments.
		if (typeof key === 'object')
		{
			attrs = key;
			options = val;
		}
		else
		{
			(attrs = {})[key] = val;
		}

		options || (options = {});

		// Run validation.
		if (!this._validate(attrs, options))
		{
			return false;
		}
		
		// Extract attributes and options.
		unset					 = options.unset;
		silent					= options.silent;
		changes				 = [];
		changing				= this._changing;
		this._changing	= true;
		
		if (!changing) 
		{
			this._previousAttributes = conbo.clone(this.__properties__);
			this.changed = {};
		}
		
		current = this.__properties__;
		prev = this._previousAttributes;

		// Check for changes of `id`.
		if (this.idProperty in attrs)
		{
			this.id = attrs[this.idProperty];
		}

		// For each `set` attribute, update or delete the current value.
		for (attr in attrs) 
		{
			val = attrs[attr];
			
			if (!conbo.isEqual(current[attr], val)) 
			{
				changes.push(attr);
			}
			
			if (!conbo.isEqual(prev[attr], val)) 
			{
				this.changed[attr] = val;
			}
			else 
			{
				delete this.changed[attr];
			}
			
			unset ? delete current[attr] : current[attr] = val;
		}
		
		// Trigger all relevant attribute changes.
		if (!silent) 
		{
			if (changes.length) this._pending = true;
			
			for (var i=0, l=changes.length; i<l; i++) 
			{
				this.dispatchEvent(new conbo.ConboEvent('change:'+changes[i],
				{
					model: this,
					value: current[changes[i]], 
					options: options, 
					attribute: changes[i]
				}));
			}
		}
		
		// You might be wondering why there's a `while` loop here. Changes can
		// be recursively nested within `"change"` events.
		if (changing)
		{
			return this;
		}
		
		if (!silent) 
		{
			while (this._pending) 
			{
				this._pending = false;
				
				this.dispatchEvent(new conbo.ConboEvent(conbo.ConboEvent.CHANGE,
				{
					model: this,
					options: options
				}));
			}
		}
		
		this._pending = false;
		this._changing = false;
		
		return this;
	},

	/**
	 * Remove an attribute from the model, firing `"change"`. `unset` is a noop
	 * if the attribute doesn't exist.
	 */
	unset: function(attr, options) 
	{
		return this.set(attr, undefined, conbo.extend({}, options, {unset: true}));
	},

	/**
	 * Clear all attributes on the model, firing `"change"`.
	 */
	clear: function(options) 
	{
		var attrs = {};
		for (var key in this.__properties__) attrs[key] = undefined;
		return this.set(attrs, conbo.extend({}, options, {unset: true}));
	},

	/**
	 * Determine if the model has changed since the last `"change"` event.
	 * If you specify an attribute name, determine if that attribute has changed.
	 */
	hasChanged: function(attr) 
	{
		if (attr == null) return !conbo.isEmpty(this.changed);
		return attr in this.changed;
	},
	
	/**
	 * Return an object containing all the attributes that have changed, or
	 * false if there are no changed attributes. Useful for determining what
	 * parts of a view need to be updated and/or what attributes need to be
	 * persisted to the server. Unset attributes will be set to undefined.
	 * You can also pass an attributes object to diff against the model,
	 * determining if there *would be* a change.
	 */
	changedAttributes: function(diff) 
	{
		if (!diff) return this.hasChanged() ? conbo.clone(this.changed) : false;
		var val, changed = false;
		var old = this._changing ? this._previousAttributes : this.__properties__;
		for (var attr in diff) {
			if (conbo.isEqual(old[attr], (val = diff[attr]))) continue;
			(changed || (changed = {}))[attr] = val;
		}
		return changed;
	},

	/**
	 * Get the previous value of an attribute, recorded at the time the last
	 * `"change"` event was fired.
	 */
	previous: function(attr) 
	{
		if (attr == null || !this._previousAttributes) return null;
		return this._previousAttributes[attr];
	},

	/**
	 * Get all of the attributes of the model at the time of the previous
	 * `"change"` event.
	 */
	previousAttributes: function() 
	{
		return conbo.clone(this._previousAttributes);
	},

	/**
	 * Fetch the model from the server. If the server's representation of the
	 * model differs from its current attributes, they will be overridden,
	 * triggering a `"change"` event.
	 */
	fetch: function(options) 
	{
		options = options ? conbo.clone(options) : {};
		
		if (options.parse === undefined)
		{
			options.parse = true;
		}
		
		var success = options.success;
		
		options.success = this.bind(function(resp)
		{
			if (!this.set(this.parse(resp, options), options))
			{
				return false;
			}
			
			if (!!success) 
			{
				success(this, resp, options);
			}
			
			this.dispatchEvent(new conbo.ConboEvent(conbo.ConboEvent.SYNC,
			{
				model:		this,
				response:	resp,
				options:	options
			}));
		});
		
		wrapError(this, options);
		
		return this.sync('read', this, options);
	},
	
	/**
	 * Set a hash of model attributes, and sync the model to the server.
	 * If the server returns an attributes hash that differs, the model's
	 * state will be `set` again.
	 */
	save: function(key, val, options) 
	{
		var attrs, method, xhr, attributes = this.__properties__;
		
		// Handle both `"key", value` and `{key: value}` -style arguments.
		if (key == null || typeof key === 'object')
		{
			attrs = key;
			options = val;
		}
		else
		{
			(attrs = {})[key] = val;
		}

		// If we're not waiting and attributes exist, save acts as `set(attr).save(null, opts)`.
		if (attrs && (!options || !options.wait) && !this.set(attrs, options)) 
		{
			return false;
		}

		options = conbo.extend({validate: true}, options);

		// Do not persist invalid models.
		if (!this._validate(attrs, options)) 
		{
			return false;
		}

		// Set temporary attributes if `{wait: true}`.
		if (attrs && options.wait)
		{
			this.__properties__ = conbo.extend({}, attributes, attrs);
		}

		// After a successful server-side save, the client is (optionally)
		// updated with the server-side state.
		if (options.parse === undefined) 
		{
			options.parse = true;
		}
			
		var model = this;
		var success = options.success;
			
		options.success = function(resp) 
		{
			// Ensure attributes are restored during synchronous saves.
			model.__properties__ = attributes;
			
			var serverAttrs = model.parse(resp, options);
			
			if (options.wait) 
			{
				serverAttrs = conbo.extend(attrs || {}, serverAttrs);
			}
			
			if (conbo.isObject(serverAttrs) && !model.set(serverAttrs, options)) 
			{
				return false;
			}
			
			if (success) 
			{
				success(model, resp, options);
			}
			
			model.dispatchEvent(new conbo.ConboEvent(conbo.ConboEvent.SYNC,
			{
				model: model,
				response: resp, 
				options: options
			}));
		};
			
		wrapError(this, options);

		method = this.isNew() ? 'create' : (options.patch ? 'patch' : 'update');
		if (method === 'patch') options.attrs = attrs;
		xhr = this.sync(method, this, options);

		// Restore attributes.
		if (attrs && options.wait) this.__properties__ = attributes;
		
		return xhr;
	},

	/**
	 * Destroy this model on the server if it was already persisted.
	 * Optimistically removes the model from its collection, if it has one.
	 * If `wait: true` is passed, waits for the server to respond before removal.
	 */
	destroy: function(options) 
	{
		options = options ? conbo.clone(options) : {};
		
		var model = this;
		var success = options.success;
		
		var destroy = this.bind(function() 
		{
			this.dispatchEvent(new conbo.ConboEvent(conbo.ConboEvent.DESTROY,
			{
				model: this,
				collection: model.collection,
				options: options
			}));
		});
		
		options.success = function(resp)
		{
			if (options.wait || model.isNew())
			{
				destroy();
			}
			
			if (success) 
			{
				success(model, resp, options);
			}
			
			if (!model.isNew()) 
			{
				model.dispatchEvent(new conbo.ConboEvent(conbo.ConboEvent.SYNC, 
				{
					model: model, 
					response: resp, 
					options: options
				}));
			}
		};
		
		if (this.isNew()) 
		{
			options.success();
			return false;
		}
		
		wrapError(this, options);

		var xhr = this.sync('delete', this, options);
		if (!options.wait) destroy();
		
		return xhr;
	},

	/**
	 * Default URL for the model's representation on the server -- if you're
	 * using conbo's restful methods, override this to change the endpoint
	 * that will be called.
	 */
	url: function() 
	{
		var base = this.urlRoot || this.collection.url || urlError();
		if (this.isNew()) return base;
		return base + (base.charAt(base.length - 1) === '/' ? '' : '/') + encodeURIComponent(this.id);
	},

	/**
	 * Converts a response into the hash of attributes to be `set` on
	 * the model. The default implementation is just to pass the response along.
	 */
	parse: function(resp, options) 
	{
		return resp;
	},

	/**
	 * Create a new model with identical attributes to this one.
	 */
	clone: function() 
	{
		return new this.constructor(this.__properties__);
	},

	/**
	 * A model is new if it has never been saved to the server, and lacks an id.
	 */
	isNew: function() 
	{
		return this.id == null;
	},

	/**
	 * Check if the model is currently in a valid state.
	 */
	isValid: function(options) 
	{
		return this._validate({}, conbo.extend(options || {}, { validate: true }));
	},
	
	toString: function()
	{
		return 'conbo.Model';
	},

	/**
	 * Run validation against the next complete set of model attributes,
	 * returning `true` if all is well. Otherwise, fire an `"invalid"` event.
	 */
	_validate: function(attrs, options) 
	{
		if (!options.validate || !this.validate) return true;
		attrs = conbo.extend({}, this.__properties__, attrs);
		var error = this.validationError = this.validate(attrs, options) || null;
		if (!error) return true;
		
		this.dispatchEvent(new conbo.ConboEvent(conbo.ConboEvent.INVALID,
		{
			model: 		this,
			error: 		error,
			options: 	conbo.extend(options || {}, {validationError: error})
		}));
		
		return false;
	}
});

//TODO Don't have this here?
//Wrap an optional error callback with a fallback error event.
var wrapError = function (model, options)
{
	var callback = options.error;
	
	options.error = function(resp) 
	{
		if (!!callback) callback(model, resp, options);
		
		model.dispatchEvent(new conbo.ConboEvent(conbo.ConboEvent.ERROR,
		{
			model:model, 
			response:resp, 
			options:options
		}));
	};
};

_denumerate(conbo.Model.prototype);

/**
 * Collection
 *
 * Provides a standard collection class for our sets of models, ordered
 * or unordered. If a `comparator` is specified, the Collection will maintain
 * its models in sort order, as they're added and removed.
 * 
 * Derived from the Backbone.js class of the same name
 */
conbo.Collection = conbo.List.extend
({
	/**
	 * The default model class for a collection is conbo.Model.
	 * This should be overridden in most cases.
	 */
	modelClass: conbo.Model,
	
	/**
	 * Constructor: DO NOT override! (Use initialize instead)
	 * @param options
	 */
	constructor: function(models, options) 
	{
		options || (options = {});
		
		if (options.url) this.url = options.url;
		if (options.comparator !== undefined) this.comparator = options.comparator;
		
		// options.model and this.model are deprecated, but included for backward compatibility
		if (options.modelClass || options.model || this.model)
		{
			this.modelClass = options.modelClass || options.model || this.model;
		}
		
		this._reset();
		if (!!options) this.context = options.context;
		
		if (models) 
		{
			this.reset(models, conbo.extend({silent: true}, options));
		}
		
		this.initialize.apply(this, arguments);
		conbo.bindProperties(this, this.bindable);
	},

	/**
	 * Initialize is an empty function by default. Override it with your own
	 * initialization logic.
	 */
	initialize: function(){},

	/**
	 * The JSON representation of a Collection is an array of the
	 * models' attributes.
	 */
	toJSON: function(options) 
	{
		return this.map(function(model){ return model.toJSON(options); });
	},

	/**
	 * Proxy `conbo.sync` by default.
	 */
	sync: function() 
	{
		return conbo.sync.apply(this, arguments);
	},

	/**
	 * Add a model, or list of models to the set.
	 */
	add: function(models, options)
	{
		return this.set(models, conbo.defaults(options || {}, {add:true, merge:false, remove:false}));
	},

	/**
	 * Remove a model, or a list of models from the set.
	 */
	remove: function(models, options)
	{
		models = conbo.isArray(models) ? models.slice() : [models];
		options || (options = {});
		
		var i, l, index, model;
		
		for (i = 0, l = models.length; i < l; i++) 
		{
			model = this.get(models[i]);
			
			if (!model) 
			{
				continue;
			}
			
			delete this._byId[model.id];
			delete this._byId[model.cid];
			
			index = this.indexOf(model);
			
			this._models.splice(index, 1);
			this.length--;
			
			if (!options.silent) 
			{
				options.index = index;
						
				this.dispatchEvent(new conbo.ConboEvent(conbo.ConboEvent.REMOVE,
				{
					model: model,
					collection: this,
					options: options
				}));
			}
			
			this._removeReference(model);
		}
		
		return this;
	},
	
	/**
	 * Update a collection by `set`-ing a new list of models, adding new ones,
	 * removing models that are no longer present, and merging models that
	 * already exist in the collection, as necessary. Similar to Model#set,
	 * the core operation for updating the data contained by the collection.
	 */
	set: function(models, options) 
	{
		options = conbo.defaults(options || {}, {add: true, remove: true, merge: true});
		
		if (options.parse) models = this.parse(models, options);
		if (!conbo.isArray(models)) models = models ? [models] : [];
		
		var i, l, model, existing, sort = false;
		var at = options.at;
		var sortable = this.comparator && (at == null) && options.sort !== false;
		var sortAttr = conbo.isString(this.comparator) ? this.comparator : null;
		var toAdd = [], toRemove = [], modelMap = {};

		// Turn bare objects into model references, and prevent invalid models
		// from being added.
		for (i=0, l=models.length; i<l; i++) 
		{
			if (!(model = this._prepareModel(models[i], options))) continue;

			// If a duplicate is found, prevent it from being added and
			// optionally merge it into the existing model.
			if (existing = this.get(model)) 
			{
				if (options.remove) 
				{
					modelMap[existing.cid] = true;
				}
				
				if (options.merge) 
				{
					existing.set(model.__properties__, options);
					if (sortable && !sort && existing.hasChanged(sortAttr)) sort = true;
				}

			} 
			// This is a new model, push it to the `toAdd` list.
			else if (options.add) 
			{
				toAdd.push(model);

				// Listen to added models' events, and index models for lookup by
				// `id` and by `cid`.
				model.addEventListener('all', this._onModelEvent, this);
				
				this._byId[model.cid] = model;
				
				if (model.id != null) 
				{
					this._byId[model.id] = model;
				}
			}
		}

		// Remove nonexistent models if appropriate.
		if (options.remove) 
		{
			for (i = 0, l = this.length; i < l; ++i) 
			{
				if (!modelMap[(model = this._models[i]).cid]) toRemove.push(model);
			}
			
			if (toRemove.length) 
			{
				this.remove(toRemove, options);
			}
		}

		// See if sorting is needed, update `length` and splice in new models.
		if (toAdd.length) 
		{
			if (sortable) sort = true;
			
			this.length += toAdd.length;
			
			if (at != null) 
			{
				[].splice.apply(this._models, [at, 0].concat(toAdd));
			}
			else 
			{
				[].push.apply(this._models, toAdd);
			}
		}
		
		// Silently sort the collection if appropriate.
		if (sort) this.sort({silent: true});

		if (options.silent) return this;

		// Trigger `add` events.
		for (i=0, l=toAdd.length; i<l; i++) 
		{
			var model = toAdd[i];
			
			model.dispatchEvent(new conbo.ConboEvent(conbo.ConboEvent.ADD, 
			{
				model:model, 
				collection:this, 
				options:options
			}));
		}
		
		// Trigger `sort` if the collection was sorted.
		if (sort)
		{
			this.dispatchEvent(new conbo.ConboEvent(conbo.ConboEvent.SORT, 
   			{
   				collection:this, 
   				options:options
   			}));
		}
		
		return this;
	},

	/**
	 * When you have more items than you want to add or remove individually,
	 * you can reset the entire set with a new list of models, without firing
	 * any `add` or `remove` events. Fires `reset` when finished.
	 */
	reset: function(models, options) 
	{
		options || (options = {});
		
		for (var i = 0, l = this._models.length; i < l; i++) 
		{
			this._removeReference(this._models[i]);
		}
		
		options.previousModels = this._models;
		
		this._reset();
		this.add(models, conbo.extend({silent: true}, options));
				
		if (!options.silent) 
		{
			this.dispatchEvent(new conbo.ConboEvent(conbo.ConboEvent.RESET,
			{
				collection: this,
				options: options
			}));
		}
		
		return this;
	},
	
	/**
	 * Add a model to the end of the collection.
	 */
	push: function(model, options)
	{
		model = this._prepareModel(model, options);
		this.add(model, conbo.extend({at: this.length}, options));
		return model;
	},
	
	/**
	 * Remove a model from the end of the collection.
	 */
	pop: function(options)
	{
		var model = this.at(this.length - 1);
		this.remove(model, options);
		return model;
	},

	/**
	 * Add a model to the beginning of the collection.
	 */
	unshift: function(model, options) 
	{
		model = this._prepareModel(model, options);
		this.add(model, conbo.extend({at: 0}, options));
		return model;
	},

	/**
	 * Remove a model from the beginning of the collection.
	 */
	shift: function(options) 
	{
		var model = this.at(0);
		this.remove(model, options);
		return model;
	},

	/**
	 * Slice out a sub-array of models from the collection.
	 */
	slice: function(begin, end) 
	{
		return this._models.slice(begin, end);
	},
	
	/**
	 * Get a model from the set by id.
	 */
	get: function(obj) 
	{
		if (obj == null) return undefined;
		this._idAttr || (this._idAttr = this.modelClass.prototype.idProperty);
		return this._byId[obj.id || obj.cid || obj[this._idAttr] || obj];
	},

	/**
	 * Get the model at the given index.
	 */
	at: function(index) 
	{
		return this._models[index];
	},

	/**
	 * Return models with matching attributes. Useful for simple cases of `filter`.
	 */
	where: function(attrs, first) 
	{
		if (conbo.isEmpty(attrs)) return first ? undefined : [];
		
		return this[first ? 'find' : 'filter'](function(model) 
		{
			for (var key in attrs) 
			{
				if (attrs[key] !== model.get(key)) return false;
			}
			
			return true;
		});
	},

	/**
	 * Return the first model with matching attributes. Useful for simple cases
	 * of `find`.
	 */
	findWhere: function(attrs) 
	{
		return this.where(attrs, true);
	},
		
	/**
	 * Force the collection to re-sort itself. You don't need to call this under
	 * normal circumstances, as the set will maintain sort order as each item
	 * is added.
	 */
	sort: function(options) 
	{
		if (!this.comparator) throw new Error('Cannot sort a set without a comparator');
		options || (options = {});
		
		// Run sort based on type of `comparator`.
		if (conbo.isString(this.comparator) || this.comparator.length === 1) 
		{
			this._models = this.sortBy(this.comparator, this);
		}
		else 
		{
			this._models.sort(conbo.bind(this.comparator, this));
		}

		if (!options.silent) 
		{
			this.dispatchEvent(new conbo.ConboEvent(conbo.ConboEvent.SORT,
			{
				collection: this,
				options: options
			}));
		}
		
		return this;
	},

	/**
	 * Figure out the smallest index at which a model should be inserted so as
	 * to maintain order.
	 */
	sortedIndex: function(model, value, context) 
	{
		value || (value = this.comparator);
		
		var iterator = conbo.isFunction(value) ? value : function(model) 
		{
			return model.get(value);
		};
		
		return conbo.sortedIndex(this._models, model, iterator, context);
	},

	/**
	 * Pluck an attribute from each model in the collection.
	 */
	pluck: function(attr)
	{
		return conbo.invoke(this._models, 'get', attr);
	},

	/**
	 * Fetch the default set of models for this collection, resetting the
	 * collection when they arrive. If `reset: true` is passed, the response
	 * data will be passed through the `reset` method instead of `set`.
	 */
	fetch: function(options) 
	{
		options = options ? conbo.clone(options) : {};
		
		if (options.parse === undefined) options.parse = true;
		
		var success = options.success;
		var collection = this;
		
		options.success = function(resp)
		{
			var method = options.reset ? 'reset' : 'set';
			
			collection[method](resp, options);
			
			if (success)
			{
				success(collection, resp, options);
			}
			
			collection.dispatchEvent(new conbo.ConboEvent(conbo.ConboEvent.SYNC,
			{
				collection:	collection,
				response:	resp,
				options:	options
			}));
		};
		
		wrapError(this, options);
		
		return this.sync('read', this, options);
	},
		
	/**
	 * Create a new instance of a model in this collection. Add the model to the
	 * collection immediately, unless `wait: true` is passed, in which case we
	 * wait for the server to agree.
	 */
	create: function(model, options) 
	{
		options = options ? conbo.clone(options) : {};
		
		if (!(model = this._prepareModel(model, options))) return false;
		if (!options.wait) this.add(model, options);
		
		var collection = this;
		var success = options.success;
		
		options.success = function(resp) 
		{
			if (options.wait) collection.add(model, options);
			if (success) success(model, resp, options);
		};
		
		model.save(null, options);
		
		return model;
	},
		
	/**
	 * parse converts a response into a list of models to be added to the
	 * collection. The default implementation is just to pass it through.
	 */
	parse: function(resp, options) 
	{
		return resp;
	},

	/**
	 * Create a new collection with an identical list of models as this one.
	 */
	clone: function() 
	{
		return new this.constructor(this._models);
	},
	
	// List methods that aren't available on Collection
	
	splice: function()
	{
		throw new Error('splice is not available on conbo.Collection');
	},
	
	/**
	 * Private method to reset all internal state. Called when the collection
	 * is first initialized or reset.
	 */
	_reset: function() 
	{
		this.length = 0;
		this._models = [];
		this._byId	= {};
	},
	
	/**
	 * Prepare a hash of attributes (or other model) to be added to this
	 * collection.
	 */
	_prepareModel: function(attrs, options) 
	{
		if (attrs instanceof conbo.Model) 
		{
			if (!attrs.collection) attrs.collection = this;
			return attrs;
		}
		
		options || (options = {});
		options.collection = this;
		
		var model = new this.modelClass(attrs, options);
		
		if (!model._validate(attrs, options)) 
		{
			this.dispatchEvent(new conbo.ConboEvent(conbo.ConboEvent.INVALID,
			{
				collection:	this,
				attrs:		attrs,
				options:	options
			}));
			
			return false;
		}
		
		return model;
	},
		
	/**
	 * Internal method to sever a model's ties to a collection.
	 */
	_removeReference: function(model) {
		if (this === model.collection) delete model.collection;
		model.removeEventListener('all', this._onModelEvent, this);
	},

	/**
	 * Internal method called every time a model in the set fires an event.
	 * Sets need to update their indexes when models change ids. All other
	 * events simply proxy through. "add" and "remove" events that originate
	 * in other collections are ignored.
	 * 
	 * @example		_onModelEvent: function(event, model, collection, options) 
	 */
	_onModelEvent: function(event)
	{
		if ((event.type == conbo.ConboEvent.ADD 
			|| event.type == conbo.ConboEvent.REMOVE) && event.collection != this)
		{
			return;
		}
		
		var model = event.model;
		
		if (event.type == conbo.ConboEvent.DESTROY) 
		{
			this.remove(model, event.options);
		}
		
		if (model && event.type == 'change:' + model.idProperty) 
		{
			delete this._byId[event.model.previous(model.idProperty)];
			
			if (model.id != null) 
			{
				this._byId[model.id] = model;
			}
		}
		
		this.dispatchEvent(event);
	},

	toString: function()
	{
		return 'conbo.Collection';
	}
});

_denumerate(conbo.Collection.prototype);


// Cached regex for stripping a leading hash/slash and trailing space.
var routeStripper = /^[#\/]|\s+$/g;

// Cached regex for stripping leading and trailing slashes.
var rootStripper = /^\/+|\/+$/g;

// Cached regex for detecting MSIE.
var isExplorer = /msie [\w.]+/;

// Cached regex for removing a trailing slash.
var trailingSlash = /\/$/;

/**
 * conbo.History
 * 
 * Handles cross-browser history management, based on either
 * [pushState](http://diveintohtml5.info/history.html) and real URLs, or
 * [onhashchange](https://developer.mozilla.org/en-US/docs/DOM/window.onhashchange)
 * and URL fragments. If the browser supports neither (old IE, natch),
 * falls back to polling.
 * 
 * Derived from the Backbone.js class of the same name
 */
conbo.History = conbo.EventDispatcher.extend
({
	/**
	 * Has the history handling already been started?
	 */
	started: false,
	
	/**
	 * The default interval to poll for hash changes, if necessary, is
	 * twenty times a second.
	 */
	interval: 50,
	
	/**
	 * Constructor: DO NOT override! (Use initialize instead)
	 * @param options
	 */
	constructor: function(options)
	{
		this.handlers = [];
		this.bindAll('checkUrl');
		
		// Ensure that `History` can be used outside of the browser.
		if (typeof window !== 'undefined')
		{
			this.location = window.location;
			this.history = window.history;
		}
		
		if (!!options) this.context = options.context;
		this.initialize.apply(this, arguments);
	},
	
	/**
	 * Gets the true hash value. Cannot use location.hash directly due
	 * to bug
	 * in Firefox where location.hash will always be decoded.
	 */
	getHash: function(window)
	{
		var match = (window || this).location.href.match(/#(.*)$/);
		return match ? match[1]: '';
	},
	
	/**
	 * Get the cross-browser normalized URL fragment, either from the
	 * URL,
	 * the hash, or the override.
	 */
	getFragment: function(fragment, forcePushState)
	{
		if (fragment == null)
		{
			if (this._hasPushState || !this._wantsHashChange
					|| forcePushState)
			{
				fragment = this.location.pathname;
				var root = this.root.replace(trailingSlash, '');
				if (!fragment.indexOf(root)) fragment = fragment
						.substr(root.length);
			}
			else
			{
				fragment = this.getHash();
			}
		}
		return fragment.replace(routeStripper, '');
	},
	
	/**
	 * Start the hash change handling, returning `true` if the current
	 * URL matches an existing route, and `false` otherwise.
	 */
	start: function(options)
	{
		if (this.started) throw new Error("conbo.history has already been started");
		this.started = true;
		
		// Figure out the initial configuration. Do we need an iframe?
		// Is pushState desired ... is it available?
		this.options = conbo.extend({}, {root:'/'}, this.options, options);
		this.root = this.options.root;
		this._wantsHashChange = this.options.hashChange !== false;
		this._wantsPushState = !!this.options.pushState;
		this._hasPushState = !!(this.options.pushState && this.history && this.history.pushState);
		var fragment = this.getFragment();
		var docMode = document.documentMode;
		var oldIE = (isExplorer.exec(navigator.userAgent.toLowerCase()) && (!docMode || docMode <= 7));
		
		// Normalize root to always include a leading and trailing
		// slash.
		this.root = ('/' + this.root + '/').replace(rootStripper, '/');
		
		if (oldIE && this._wantsHashChange)
		{
			this.iframe = $(
					'<iframe src="javascript:0" tabindex="-1" />')
					.hide().appendTo('body')[0].contentWindow;
			this.navigate(fragment);
		}
		
		// Depending on whether we're using pushState or hashes, and whether 
		// 'onhashchange' is supported, determine how we check the URL state.
		if (this._hasPushState)
		{
			$(window).on('popstate', this.checkUrl);
		}
		else if (this._wantsHashChange && ('onhashchange' in window)
				&& !oldIE)
		{
			$(window).on('hashchange', this.checkUrl);
		}
		else if (this._wantsHashChange)
		{
			this._checkUrlInterval = setInterval(this.checkUrl,
					this.interval);
		}
		
		// Determine if we need to change the base url, for a pushState
		// link
		// opened by a non-pushState browser.
		this.fragment = fragment;
		var loc = this.location;
		var atRoot = loc.pathname.replace(/[^\/]$/, '$&/') === this.root;
		
		// If we've started off with a route from a `pushState`-enabled
		// browser,
		// but we're currently in a browser that doesn't support it...
		if (this._wantsHashChange && this._wantsPushState
				&& !this._hasPushState && !atRoot)
		{
			this.fragment = this.getFragment(null, true);
			this.location.replace(this.root + this.location.search
					+ '#' + this.fragment);
			// Return immediately as browser will do redirect to new url
			return true;
			
			// Or if we've started out with a hash-based route, but
			// we're currently
			// in a browser where it could be `pushState`-based
			// instead...
		}
		else if (this._wantsPushState && this._hasPushState && atRoot
				&& loc.hash)
		{
			this.fragment = this.getHash().replace(routeStripper, '');
			this.history.replaceState(
			{}, document.title, this.root + this.fragment + loc.search);
		}
		
		if (!this.options.silent) return this.loadUrl();
	},
	
	/**
	 * Disable conbo.history, perhaps temporarily. Not useful in a real app,
	 * but possibly useful for unit testing Routers.
	 */
	stop: function()
	{
		$(window).off('popstate', this.checkUrl).off('hashchange', this.checkUrl);
		clearInterval(this._checkUrlInterval);
		this.started = false;
	},
	
	/**
	 * Add a route to be tested when the fragment changes. Routes added
	 * later may override previous routes.
	 */
	route: function(route, callback)
	{
		this.handlers.unshift({route:route, callback:callback});
	},
	
	/**
	 * Checks the current URL to see if it has changed, and if it has,
	 * calls `loadUrl`, normalizing across the hidden iframe.
	 */
	checkUrl: function(e)
	{
		var current = this.getFragment();
		if (current === this.fragment && this.iframe)
		{
			current = this.getFragment(this.getHash(this.iframe));
		}
		if (current === this.fragment) return false;
		if (this.iframe) this.navigate(current);
		this.loadUrl() || this.loadUrl(this.getHash());
	},
	
	/**
	 * Attempt to load the current URL fragment. If a route succeeds with a
	 * match, returns `true`. If no defined routes matches the fragment, returns `false`.
	 */
	loadUrl: function(fragmentOverride)
	{
		var fragment = this.fragment = this.getFragment(fragmentOverride);
		
		var matched = conbo.any(this.handlers, function(handler)
		{
			if (handler.route.test(fragment))
			{
				handler.callback(fragment);
				return true;
			}
		});
		return matched;
	},
	
	/**
	 * Save a fragment into the hash history, or replace the URL state
	 * if the 'replace' option is passed. You are responsible for properly
	 * URL-encoding the fragment in advance.
	 * 
	 * The options object can contain `trigger: true` if you wish to have the
	 * route callback be fired (not usually desirable), or `replace: true`, if
	 * you wish to modify the current URL without adding an entry to the history.
	 */
	navigate: function(fragment, options)
	{
		if (!this.started) return false;
		if (!options || options === true) options =
		{
			trigger: options
		};
		fragment = this.getFragment(fragment || '');
		if (this.fragment === fragment) return;
		this.fragment = fragment;
		var url = this.root + fragment;
		
		// If pushState is available, we use it to set the fragment as a
		// real URL.
		if (this._hasPushState)
		{
			this.history[options.replace ? 'replaceState': 'pushState']({}, document.title, url);
			
			// If hash changes haven't been explicitly disabled, update
			// the hash
			// fragment to store history.
		}
		else if (this._wantsHashChange)
		{
			this._updateHash(this.location, fragment, options.replace);
			
			if (this.iframe && (fragment !== this.getFragment(this.getHash(this.iframe))))
			{
				// Opening and closing the iframe tricks IE7 and earlier
				// to push a history entry on hash-tag change. When replace is
				// true, we don't want this.
				if (!options.replace) this.iframe.document.open().close();
				this._updateHash(this.iframe.location, fragment, options.replace);
			}
			
			// If you've told us that you explicitly don't want fallback
			// hashchange-based history, then `navigate` becomes a page refresh.
		}
		else
		{
			return this.location.assign(url);
		}
		
		if (options.trigger) this.loadUrl(fragment);
	},
	
	toString: function()
	{
		return 'conbo.History';
	},
	
	/**
	 * Update the hash location, either replacing the current entry, or
	 * adding a new one to the browser history.
	 */
	_updateHash: function(location, fragment, replace)
	{
		if (replace)
		{
			var href = location.href.replace(/(javascript:|#).*$/, '');
			location.replace(href + '#/' + fragment);
		}
		else
		{
			// Some browsers require that `hash` contains a leading #.
			location.hash = '#/' + fragment;
		}
	}
	
}).implement(conbo.Injectable);

_denumerate(conbo.History.prototype);

// Create default instance of the History class
conbo.history = new conbo.History();

var optionalParam = /\((.*?)\)/g;
var namedParam		= /(\(\?)?:\w+/g;
var splatParam		= /\*\w+/g;
var escapeRegExp	= /[\-{}\[\]+?.,\\\^$|#\s]/g;

/**
 * Router
 * 
 * Routers map faux-URLs to actions, and fire events when routes are
 * matched. Creating a new one sets its `routes` hash, if not set statically.
 * 
 * Derived from the Backbone.js class of the same name
 */
conbo.Router = conbo.EventDispatcher.extend
({
	/**
	 * Constructor: DO NOT override! (Use initialize instead)
	 * @param options
	 */
	constructor: function(options) 
	{
		options || (options = {});
		if (options.routes) this.routes = options.routes;
		this._bindRoutes();
		
		if (!!options) this.context = options.context;
		this.initialize.apply(this, arguments);
	},
	
	/**
	 * Manually bind a single named route to a callback. For example:
	 * 
	 * @example
	 * 		this.route('search/:query/p:num', 'search', function(query, num) {
	 * 			 ...
	 * 		});
	 */ 
	route: function(route, name, callback) 
	{
		if (!conbo.isRegExp(route)) 
		{
			route = this._routeToRegExp(route);
		}
		
		if (!callback) 
		{
			callback = this[name];
		}
		
		if (conbo.isFunction(name)) 
		{
			callback = name;
			name = '';
		}
		
		if (!callback) 
		{
			callback = this[name];
		}
		
		conbo.history.route(route, this.bind(function(fragment)
		{
			var args = this._extractParameters(route, fragment);
			callback && callback.apply(this, args);
			
			var options = 
			{
				router:		this,
				route:		route,
				name:		name,
				parameters:	args
			}
			
			this.dispatchEvent(new conbo.ConboEvent('route:'+name, options));
			this.dispatchEvent(new conbo.ConboEvent(conbo.ConboEvent.ROUTE, options));
			
			conbo.history.dispatchEvent(new conbo.ConboEvent(conbo.ConboEvent.ROUTE, options));
		}));
		
		return this;
	},

	/**
	 * Simple proxy to `conbo.history` to save a fragment into the history.
	 */
	navigate: function(fragment, options) 
	{
		conbo.history.navigate(fragment, options);
		return this;
	},
	
	toString: function()
	{
		return 'conbo.Router';
	},
	
	/**
	 * Bind all defined routes to `conbo.history`. We have to reverse the
	 * order of the routes here to support behavior where the most general
	 * routes can be defined at the bottom of the route map.
	 * 
	 * @private
	 */
	_bindRoutes: function() 
	{
		if (!this.routes) return;
		this.routes = this.routes;
		var route, routes = conbo.keys(this.routes);
		while ((route = routes.pop()) != null) {
			this.route(route, this.routes[route]);
		}
	},

	/**
	 * Convert a route string into a regular expression, suitable for matching
	 * against the current location hash.
	 * 
	 * @private
	 */
	_routeToRegExp: function(route) 
	{
		route = route.replace(escapeRegExp, '\\$&')
			.replace(optionalParam, '(?:$1)?')
			.replace(namedParam, function(match, optional){
				return optional ? match : '([^\/]+)';
			})
			.replace(splatParam, '(.*?)');
		
		return new RegExp('^' + route + '$');
	},

	/**
	 * Given a route, and a URL fragment that it matches, return the array of
	 * extracted decoded parameters. Empty or unmatched parameters will be
	 * treated as `null` to normalize cross-browser behavior.
	 * 
	 * @private
	 */
	_extractParameters: function(route, fragment) 
	{
		var params = route.exec(fragment).slice(1);
		return conbo.map(params, function(param) {
			return param ? decodeURIComponent(param) : null;
		});
	}
	
}).implement(conbo.Injectable);

_denumerate(conbo.Router.prototype);

/**
 * Sync
 * 
 * Override this function to change the manner in which conbo persists
 * models to the server. You will be passed the type of request, and the
 * model in question. By default, makes a RESTful Ajax request
 * to the model's `url()`. Some possible customizations could be:
 * 
 * - Use `setTimeout` to batch rapid-fire updates into a single request.
 * - Send up the models as XML instead of JSON.
 * - Persist models via WebSockets instead of Ajax.
 * 
 * Turn on `conbo.emulateHTTP` in order to send `PUT` and `DELETE` requests
 * as `POST`, with a `_method` parameter containing the true HTTP method,
 * as well as all requests with the body as `application/x-www-form-urlencoded`
 * instead of `application/json` with the model in a param named `model`.
 * Useful when interfacing with server-side languages like **PHP** that make
 * it difficult to read the body of `PUT` requests.
 * 
 * Derived from the Backbone.js method of the same name
 */
conbo.sync = function(method, model, options) 
{
	var type = methodMap[method];

	// Default options, unless specified.
	conbo.defaults(options || (options = {}), 
	{
		emulateHTTP: conbo.emulateHTTP,
		emulateJSON: conbo.emulateJSON
	});

	// Default JSON-request options.
	var params =
	{
		type: type, 
		dataType: options.dataType || model.dataType || 'json'
	};

	// Ensure that we have a URL.
	if (!options.url) 
	{
		var url = model.url;
		if (!url) throw new Error('"url" must be specified');
		params.url = url;
	}
	
	// Ensure that we have the appropriate request data.
	if (options.data == null && model && (method === 'create' || method === 'update' || method === 'patch')) 
	{
		params.contentType = 'application/json';
		params.data = JSON.stringify(options.attrs || model.toJSON(options));
	}

	// For older servers, emulate JSON by encoding the request into an HTML-form.
	if (options.emulateJSON)
	{
		params.contentType = 'application/x-www-form-urlencoded';
		params.data = params.data ? {model: params.data} : {};
	}

	// For older servers, emulate HTTP by mimicking the HTTP method with `_method`
	// And an `X-HTTP-Method-Override` header.
	if (options.emulateHTTP && (type === 'PUT' || type === 'DELETE' || type === 'PATCH')) 
	{
		params.type = 'POST';
		
		if (options.emulateJSON)
		{
			params.data._method = type;
		}
		
		var beforeSend = options.beforeSend;
		
		options.beforeSend = function(xhr) 
		{
			xhr.setRequestHeader('X-HTTP-Method-Override', type);
			if (beforeSend) return beforeSend.apply(this, arguments);
		};
	}

	// Don't process data on a non-GET request.
	if (params.type !== 'GET' && !options.emulateJSON) 
	{
		params.processData = false;
	}
	
	// Enable the use of non-JSON data formats; must use parse() in model/collection
	if (params.dataType != 'json')
	{
		params.contentType = options.contentType || model.dataType || 'application/json';
			params.processData = false;
	}
	
	// If we're sending a `PATCH` request, and we're in an old Internet Explorer
	// that still has ActiveX enabled by default, override jQuery to use that
	// for XHR instead. Remove this line when jQuery supports `PATCH` on IE8.
	if (params.type === 'PATCH' && window.ActiveXObject &&
		!(window.external && window.external.msActiveXFilteringEnabled)) 
	{
		params.xhr = function()
		{
			return new ActiveXObject("Microsoft.XMLHTTP");
		};
	}

	// Make the request, allowing the user to override any Ajax options.
	var xhr = options.xhr = conbo.ajax(conbo.extend(params, options));
	
	model.dispatchEvent(new conbo.ConboEvent(conbo.ConboEvent.REQUEST,
	{
		model: model, 
		xhr: xhr, 
		options: options
	}));
	
	return xhr;
};

/** 
 * Map from CRUD to HTTP for our default `conbo.sync` implementation.
 */
var methodMap = 
{
	'create':	'POST',
	'update':	'PUT',
	'patch':	'PATCH',
	'delete':	'DELETE',
	'read':		'GET'
};

/**
 * Set the default implementation of `conbo.ajax` to proxy through to `$`.
 * Override this if you'd like to use a different library.
 */
conbo.ajax = function() 
{
	return $.ajax.apply($, arguments);
};


		return conbo;
	}
	
	// Node.js
	if (typeof module !== 'undefined' && module.exports)
	{
		var $;
		
		try { $ = require('jQuery'); } catch (e) {
		try { $ = require('jquery'); } catch (e) {}}
		
    	module.exports = create($);
    }
    // AMD
    else if (typeof define === 'function' && define.amd) 
	{
		define('conbo', ['jquery'], function ($)
		{
			return create($);
		});
	}
	// Global
	else
	{
		window.conbo = create(window.jQuery || window.Zepto || window.ender);
	}
	
})(this, document);
