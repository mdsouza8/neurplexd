// JavaScript Document
"use strict";
//-------------------------------------------
// Implementation of a Set in javascript
//
// Supports any element type that can uniquely be identified
//    with its string conversion (e.g. toString() operator).
// This includes strings, numbers, dates, etc...
// It does not include objects or arrays though
//    one could implement a toString() operator
//    on an object that would uniquely identify
//    the object.
// 
// Uses a javascript object to hold the Set
//
// s.add(key)                      // adds a key to the Set (if it doesn't already exist)
// s.add(key1, key2, key3)         // adds multiple keys
// s.add([key1, key2, key3])       // adds multiple keys
// s.add(otherSet)                 // adds another Set to this Set
// s.add(arrayLikeObject)          // adds anything that a subclass returns true on _isPseudoArray()
// s.remove(key)                   // removes a key from the Set
// s.remove(["a", "b"]);           // removes all keys in the passed in array
// s.remove("a", "b", ["first", "second"]);   // removes all keys specified
// s.has(key)                      // returns true/false if key exists in the Set
// s.hasAll(args)                  // returns true if s has all the keys in args
// s.equals(otherSet)              // returns true if s has exactly the same keys in it as otherSet
// s.isEmpty()                     // returns true/false for whether Set is empty
// s.keys()                        // returns an array of keys in the Set
// s.clear()                       // clears all data from the Set
// s.union(t)                      // return new Set that is union of both s and t
// s.intersection(t)               // return new Set that has keys in both s and t
// s.difference(t)                 // return new Set that has keys in s, but not in t
// s.isSubset(t)                   // returns boolean whether every element in s is in t
// s.isSuperset(t)                 // returns boolean whether every element of t is in s
// s.each(fn)                      // iterate over all items in the Set (return this for method chaining)
// s.eachReturn(fn)                // iterate over all items in the Set (return true/false if iteration was not stopped)
// s.filter(fn)                    // return a new Set that contains keys that passed the filter function
// s.map(fn)                       // returns a new Set that contains whatever the callback returned for each item
// s.every(fn)                     // returns true if every element in the Set passes the callback, otherwise returns false
// s.some(fn)                      // returns true if any element in the Set passes the callback, otherwise returns false
//-------------------------------------------


// polyfill for Array.isArray
if (!Array.isArray) {
    Array.isArray = function (vArg) {
        return Object.prototype.toString.call(vArg) === "[object Array]";
    };
}

function Set( /*initialData*/ ) {
    // Usage:
    // new Set()
    // new Set(1,2,3,4,5)
    // new Set(["1", "2", "3", "4", "5"])
    // new Set(otherSet)
    // new Set(otherSet1, otherSet2, ...)
    this.data = {};
    this.add.apply(this, arguments);
}

Set.prototype = {
    // usage:
    // add(key)
    // add([key1, key2, key3])
    // add(otherSet)
    // add(key1, [key2, key3, key4], otherSet)
    // add supports the EXACT same arguments as the constructor
    add: function() {
        var key;
        for (var i = 0; i < arguments.length; i++) {
            key = arguments[i];
            if (Array.isArray(key) || this._isPseudoArray(key)) {
                for (var j = 0; j < key.length; j++) {
                    this._add(key[j]);
                }
            } else if (key instanceof Set) {
                var self = this;
                key.each(function(val, key) {
                    self._add(key, val);
                });
            } else {
                // just a key, so add it
                this._add(key);
            }
        }
        return this;
    },
    // private methods (used internally only)
    // these make non-public assumptions about the internal data format
    // add a single item to the Set, make sure key is a string
    _add: function(key, val) {
        if (typeof val === "undefined") {
            // store the val (before being converted to a string key)
            val = key;
        }
        this.data[this._makeKey(key)] = val;
        return this;
    },
    // private: fetch current key
    // overridden by subclasses for custom key handling
    _getKey: function(arg) {
        return arg;
    },
    // private: fetch current key or coin a new one if there isn't already one
    // overridden by subclasses for custom key handling
    _makeKey: function(arg) {
        return arg;
    },
    // private: to remove a single item
    // does not have all the argument flexibility that remove does
    _removeItem: function(key) {
        delete this.data[this._getKey(key)];
    },
    // private: asks subclasses if this is something we want to treat like an array
    // default implementation is false
    _isPseudoArray: function(item) {
        return false;
    },
    // usage:
    // remove(key)
    // remove(key1, key2, key3)
    // remove([key1, key2, key3])
    remove: function(key) {
        // can be one or more args
        // each arg can be a string key or an array of string keys
        var item;
        for (var j = 0; j < arguments.length; j++) {
            item = arguments[j];
            if (Array.isArray(item) || this._isPseudoArray(item)) {
                // must be an array of keys
                for (var i = 0; i < item.length; i++) {
                    this._removeItem(item[i]);
                }
            } else {
                this._removeItem(item);
            }
        }
        return this;
    },
    // returns true/false on whether the key exists
    has: function(key) {
        key = this._makeKey(key);
        return Object.prototype.hasOwnProperty.call(this.data, key);
    },
    // returns true/false for whether the current Set contains all the passed in keys
    // takes arguments just like the constructor or .add()
    hasAll: function(args) {
        var testSet = this.makeNew.apply(this, arguments);
        var self = this;
        return testSet.every(function(data, key) {
            return self.has(key);
        });
    },
	// if first arg is not a set, make it into one
	// otherwise just return it
	makeSet: function(args) {
		if (!(args instanceof Set)) {
			// pass all arguments here
			return this.makeNew.apply(this, arguments);
		}
		return args;
	},
    equals: function(otherSet) {
		otherSet = this.makeSet(otherSet);
        // this is not particularly efficient, but it's simple
        // the only way you can be a subset and a superset it to be the same Set
        return this.isSubset(otherSet) && this.isSuperset(otherSet);
    },
    // tells you if the Set is empty or not
    isEmpty: function() {
        for (var key in this.data) {
            if (this.has(key)) {
                return false;
            }
        }
        return true;
    },
    // returns an array of all keys in the Set
    // returns the original key (not the string converted form)
    keys: function() {
        var results = [];
        this.each(function(data) {
            results.push(data);
        });
        return results;
    },
    // clears the Set
    clear: function() {
        this.data = {}; 
        return this;
    },
    // makes a new Set of the same type and configuration as this one
    // regardless of what derived type of object we actually are
    // accepts same arguments as a constructor for initially populating the Set
    makeNew: function() {
        var newSet = new this.constructor();
        if (arguments.length) {
            newSet.add.apply(newSet, arguments);
        }
        return newSet;
    },
    // s.union(t)
    // returns a new Set that is the union of two sets
    union: function(otherSet) {
		otherSet = this.makeSet(otherSet);
        var newSet = this.makeNew(this);
        newSet.add(otherSet);
        return newSet;
    },
    // s.intersection(t)
    // returns a new Set that contains the keys that are
    // in both sets
    intersection: function(otherSet) {
		otherSet = this.makeSet(otherSet);
        var newSet = this.makeNew();
        this.each(function(data, key) {
            if (otherSet.has(key)) {
                newSet._add(key, data);
            }
        });
        return newSet;
    },
    // s.difference(t)
    // returns a new Set that contains the keys that are
    // s but not in t
    difference: function(otherSet) {
		otherSet = this.makeSet(otherSet);
        var newSet = this.makeNew();
        this.each(function(data, key) {
            if (!otherSet.has(key)) {
                newSet._add(key, data);
            }
        });
        return newSet;
    },
    // s.notInBoth(t) 
    // returns a new Set that contains the keys that
    // are in either Set, but not both sets
    notInBoth: function(otherSet){
		otherSet = this.makeSet(otherSet);
        // get items in s, but not in t
        var newSet = this.difference(otherSet);
        // add to the result items in t, but not in s
        return newSet.add(otherSet.difference(this));
    },
    // s.isSubset(t)
    // returns boolean whether every element of s is in t
    isSubset: function(otherSet) {
		otherSet = this.makeSet(otherSet);
        return this.eachReturn(function(data, key) {
            if (!otherSet.has(key)) {
                return false; 
            }
        });
    },
    // s.isSuperset(t)
    // returns boolean whether every element of t is in s
    isSuperset: function(otherSet) {
		otherSet = this.makeSet(otherSet);
        var self = this;
        return otherSet.eachReturn(function(data, key) {
            if (!self.has(key)) {
                return false;
            }
        });
    },
    // iterate over all elements in the Set until callback returns false
    // myCallback(key) is the callback form
    // If the callback returns false, then the iteration is stopped
    // returns the Set to allow method chaining
    each: function(fn) {
        this.eachReturn(fn);
        return this;
    },
    // iterate all elements until callback returns false
    // myCallback(key) is the callback form
    // returns false if iteration was stopped
    // returns true if iteration completed
    eachReturn: function(fn) {
        for (var key in this.data) {
            if (this.has(key)) {
                if (fn.call(this, this.data[key], key) === false) {
                    return false;
                }
            }
        }
        return true;
    },
    // iterate all elements and call callback function on each one
    // myCallback(key) - returns true to include in returned Set
    // returns new Set
    filter: function(fn) {
        var newSet = this.makeNew();
        this.each(function(data, key) {
            if (fn.call(this, key) === true) {
                newSet._add(key, data);
            }
        });
        return newSet;
    },
    // iterate all elements and call callback on each one
    // myCallback(key) - whatever value is returned is put in the returned Set
    // if the  return value from the callback is undefined, 
    //   then nothing is added to the returned Set
    // returns new Set
    map: function(fn) {
        var newSet = this.makeNew();
        this.each(function(data, key) {
            var ret = fn.call(this, key);
            if (typeof ret !== "undefined") {
                newSet._add(key, data);
            }
        });
        return newSet;
    },
    // tests whether some element in the Set passes the test
    // myCallback(key) - returns true or false
    // returns true if callback returns true for any element,
    //    otherwise returns false
    some: function(fn) {
        var found = false;
        this.eachReturn(function(key) {
            if (fn.call(this, key) === true) {
                found = true;
                return false;
            }
        });
        return found;
    },
    // tests whether every element in the Set passes the test
    // myCallback(key) - returns true or false
    // returns true if callback returns true for every element
    every: function(fn) {
        return this.eachReturn(fn);
    }
};

Set.prototype.constructor = Set;
var all = new Set(["R MR", "L MR", "R SR", "L SR", "R IR", "L IR", "R LR", "L LR", "R SO", "L SO", "R IO", "L IO", "R MLF", "L MLF"]);
var horizontal_LZ = new Set (["R MR", "R LR", "L MR", "L LR", "L MLF", "R MLF"]);
var diagonal_LZ = new Set (["R IO", "L IO", "R SR", "L SR", "R IR", "L IR"]);
var vertical_LZ = new Set (["L IO", "R IO", "L SO", "R SO", "L IR", "R IR", "L SR", "R SR"]);
var leftLG_LZ = new Set (["L LR", "R MR", "R IO", "R SO", "L SR", "L IR", "R MLF"]);
var rightLG_LZ = new Set (["R LR", "L MR", "L IO", "L SO", "R SR", "R IR", "L MLF"]);
var lefthyper_LZ = new Set(["L SO", "L IR", "R SR", "R IO", "L MLF"]);
var righthyper_LZ = new Set(["R SO", "R IR", "L SR", "L IO", "R MLF"]);
var nohyper_LZ = new Set(["L LR", "R LR", "L MR", "R MR", "L MLF", "R MLF"])
//var convergence_intact_LZ = new Set (["R SR", "L SR", "R IR", "L IR", "R LR", "L LR", "R SO", "L SO", "R IO", "L IO", "R MLF", "L MLF"]);
//var convergence_impaired_LZ = new Set (["R MR", "L MR", "R SR", "L SR", "R IR", "L IR", "R LR", "L LR", "R SO", "L SO", "R IO", "L IO", "R MLF", "L MLF"]);
var lefttilt_LZ = new Set (["L SR", "L SO", "R IR", "R IO"]);
var righttilt_LZ = new Set (["R SR", "R SO", "L IR", "L IO"]);
var rightlarger_LZ = new Set(["R parasympathetic", "L sympathetic"]);
var leftlarger_LZ = new Set(["L parasympathetic", "R sympathetic"]);
var dark_LZ = new Set (["L sympathetic", "R sympathetic"]);
var light_LZ = new Set (["R parasympathetic", "L parasympathetic"]);
var ddx_list = new Set("R INO", "L INO", "R CN III Palsy", "L CN III Palsy", "R CN IV Palsy", "L CN IV Palsy", "R CN VI Palsy", "L CN VI Palsy", "Intracranial Aneurysm", "Cavernous Sinus", "Horner", "Midbrain at the Level of the Superior Cerebellar Peduncle", "Dorsal Pons", "Base of the Midbrain", "Increased ICP", "Tegmentum of the Midbrain");
var RINO = new Set(["R MLF", "nystagmus", "impaired_adduction"]);
var LINO = new Set("L MLF", "nystagmus", "impaired_adduction");
var RCNIIIPalsy = new Set("ptosis", "R MR", "R IO", "R SR", "R IR", "R parasympathetic", "eye_pain", "convergence_impaired", "impaired_adduction");
var LCNIIIPalsy = new Set("ptosis", "L MR", "L IO", "L SR", "L IR", "L parasympathetic", "eye_pain",  "convergence_impaired", "impaired_adduction");
var RCNIVPalsy = new Set("eye_pain", "R SO");
var LCNIVPalsy = new Set("eye_pain", "L SO");
var RCNVIPalsy = new Set("eye_pain", "R LR");
var LCNVIPalsy = new Set("eye_pain", "L LR");
var IncreasedICP = new Set("R LR", "L LR", "headache", "L parasympathetic", "R parasympathetic");
var IntracranialAneurysm = new Set(["ptosis", "R MR", "R IO", "R SR", "R IR", "L MR", "L IO", "L SR", "L IR", "R parasympathetic", "convergence_impaired", "impaired_adduction", "headache"]);
var CavernousSinus = new Set(["R sympathetic", "L sympathetic", "R MR", "R IO", "R SR", "R IR", "L MR", "L IO", "L SR", "L IR","L SO", "R SO", "L LR", "R LR", "facial_numbness", "ptosis", "eye_pain"]);
var MidbrainattheLeveloftheSuperiorCerebellarPeduncle = new Set("ptosis", "R MR", "R IO", "R SR", "R IR", "R parasympathetic", "ipsilateral_ataxia", "nystagmus", "R MLF", "L MLF", "L MR", "L IO", "L SR", "L IR", "L parasympathetic", "impaired_adduction");
var BaseoftheMidbrain = new Set("R MR", "R IO", "R SR", "R IR", "L MR", "L IO", "L SR", "L IR","contralateral_hemiparesis");
var Horner = new Set(["R sympathetic", "L sympathetic", "ptosis"]);
var DorsalPons = new Set(["L LR", "R LR", "L MLF", "R MLF", "ipsilateral_hemiface_weakness", "impaired_adduction"]);
var TegmentumoftheMidbrain = new Set("R MR", "R IO", "R SR", "R IR", "L MR", "L IO", "L SR", "L IR", "R parasympathetic", "ipsilateral_ataxia", "contralateral_ataxia", "contralateral_hemiparesis", "nystagmus");
//Eight-and-a-half syndrome presents with an ipsilateral conjugate horizontal gaze palsy and ipsilateral INO, and an ipsilateral lower motor neuron facial nerve palsy. due to lesions in the dorsal pons 
//One-and-one-half syndrome describes a lesion that involves the abducens nucleus, PPRF, and MLF ipsilaterally. This results in a conjugate horizontal gaze palsy in one direction and an INO in the other direction. 
//Weber Syndrome at base of midbrain - crossed hemiparesis
//Tegmentum of midbrain - contralateral ataxia and tremor, hemiparesis
//Parinaud


$(document).ready(function () {
	$('.accordion__header').click(function () {

    $(".accordion__body").not($(this).next()).slideUp(400);
    $(this).next().slideToggle(400);

    $(".accordion__item").not($(this).closest(".accordion__item")).removeClass("open-accordion");
    $(this).closest(".accordion__item").toggleClass("open-accordion");
  });
	
	$(":checkbox").click(function(){
		var finalSet = new Set ([]); //2. "aLocalF" = reset of localization
		 var finalSymptoms = new Set([]);
		 var finalDx = new Set([]);
		 var overlapLocal = new Set([]);
		var overlapDDx = new Set([]);
	 if ($(":checkbox").is(":checked")){
		 if ($(":checkbox[class=checkbox-input]").is(":checked")) {
			 $(":checkbox[class=checkbox-input]:checked").each(function(){ //3. Add to the array
				 var curSetName = ($(this).attr("id"))+"_LZ";
				 var curSet = eval(curSetName);
				 if (finalSet.isEmpty()) {
					 finalSet = finalSet.union(curSet);
				 } else {
					 finalSet = finalSet.intersection(curSet);
				 }
			 });
		 }
		 
		 if (finalSet.isEmpty()) {
			 $("#a-local").html("No localizations found!");
			 $("#a-ddx").html("");
			 
		 } else {
			 $("#a-local").html("");
			 $("#a-ddx").html("");
			 
			 for (const item of finalSet.keys()) {
				 var curLZli = "<li>" + item + "</li>";
				 $("#a-local").append(curLZli);
			 };
//				 for (const item2 of ddx_list.keys()) {
//					 var itemNoSpace = item2.replace(/\s+/g, "");
//					 var curddx = eval(itemNoSpace);
//					 
//					 if (curddx.has(item)){
//						 if (checkList.has(item2)==false) {
//							 $("#a-ddx").append("<li>" + item2 + "</li>");
//							 checkList.add(item2);
//						 }
//						
//					 };
//				 };
			
			 var noset = new Set([]);
			 if ($(":checkbox[class*=symptoms]").is(":checked")) {
				 $("#a-ddx").html("");
				 
				 	
				 $(":checkbox[class*=symptoms]:checked").each(function() {
					 var cur_symptom = $(this).attr("id");
					 noset = noset.add(cur_symptom);
					 var curRunningSet = new Set ([]);
	
//					 alert(cur_symptom);
//					 var curCheckSet = new Set([]);
//					 curCheckSet = finalSet.add(cur_symptom);
//					 alert(curCheckSet.keys());
//					 finalSet = finalSet.add(cur_symptom);
					 for (const curDxSpace of ddx_list.keys()) {
//						 alert(curDxSpace);
					 	let curDxNoSpace = curDxSpace.replace(/\s+/g, "");
					 	let curDxSet = eval(curDxNoSpace);
//						 alert(curDxSet.keys());
						 overlapLocal = curDxSet.has(cur_symptom);
						 
						 
//						 alert("does the DDX have " + cur_symptom+ " " + overlapLocal);
						 overlapDDx = curDxSet.intersection(finalSet);
//						 alert(overlapDDx.keys());
					 
					 	if ((overlapLocal == true) && (overlapDDx.isEmpty()==false)){
							curRunningSet = curRunningSet.add(curDxSpace);
					 	};
					 };
					 
					 if (finalDx.equals(curRunningSet)== false) {
						finalDx = finalDx.union(curRunningSet.difference(finalDx)); 
					 }
//					 if (finalDx.isEmpty()) {
//						 finalDx = finalDx.union(curRunningSet);
//					 } else {
//						 finalDx = finalDx.intersection(curRunningSet);
//					 }
				 });
				 var topSet = new Set([]);
				 var secondSet = new Set([]);
//				 for (const item4 of finalDx.keys()) {
//					 $("#a-ddx").append("<li>" + item4 + "</li>");
//				 };
				 var topddxcount = 0;
				 var topddx = "";
				 var seconddx = "";
				 var seconddxcount = 0;
				 var secondMultipleSet = new Set([]);
				 var topMultipleSet = new Set([]);
				 
				 finalSet = finalSet.union(noset);
//				 alert (finalSet.keys());
				 for (const item4 of finalDx.keys()) {
					 let testcount = 0;
//					 alert (item4);
					 let item4nospace = item4.replace(/\s+/g, "");
//					 alert (item4nospace);
					 let item4set = eval(item4nospace);
//					 alert (item4set.keys());
					 let inter = item4set.intersection(finalSet);
//					 alert (inter.keys());
					 inter.each(function(){
						 testcount++;
					 });
//					 alert ("# of common: " + item4 + "  " + testcount);
					 if ((topddxcount==0)&&(seconddxcount==0)) {
						 topddxcount=testcount;
						 topddx=item4;
						 topSet = inter;
						 seconddxcount=testcount;
						 seconddx=item4;
						 secondSet = inter;
					 } else if (testcount > topddxcount){
						 seconddxcount = topddxcount;
						 seconddx = topddx;
						 secondSet = topSet;
						 topddxcount = testcount;
//						 alert(item4 + " placing in 1");
						 topddx = item4;
						 topSet = inter;
						 secondMultipleSet=secondMultipleSet.clear();
						 secondMultipleSet = topMultipleSet.union(secondMultipleSet);
						 topMultipleSet=topMultipleSet.clear();
					 } else if (testcount==topddxcount) {
//						 alert("running topset" + item4);
						 topMultipleSet = topMultipleSet.add(topddx);
					 	 topMultipleSet = topMultipleSet.add(item4);
					 } else if (testcount > seconddxcount){
						 seconddxcount = testcount;
//						 alert(item4 + " placing in 2");
						 seconddx=item4;
						 secondSet = inter;
						secondMultipleSet = secondMultipleSet.clear();	
					 } else if (testcount==seconddxcount) {
//						 alert("running secondset" + item4);
						 secondMultipleSet = secondMultipleSet.add(seconddx);
						 secondMultipleSet = secondMultipleSet.add(item4);
					 } else {}; 
//					 alert("top Set: " + topMultipleSet.keys());
//					 alert("second Set: " + secondMultipleSet.keys());
					 
					 
					 
					 
//0 0 | 2 | 2 2 | 3 | 3 2 | 5 | 5 3 | 4 | 5 3
//if both 0, change both to testcount, 
					 

//					 let testcount = inter.keys().count;
//					 alert (testcount);
				 };
				 
				 if (topMultipleSet.isEmpty()==false){
					 
					  $("#area1").html("Multiple differentials likely! <br>");
					 for (const topkey of topMultipleSet.keys()) {
						 $("#area1").append("<li>" + topkey + "</li>");
					 }
				 } else {
					 $("#area1").html("<strong>" + topddx + "</strong>: <br/>");
					 for (const topSetkey of topSet.keys()) {
						 $("#area1").append("<li>" + topSetkey + "</li>");
					 };
				 };
				 
				 if (secondMultipleSet.isEmpty()==false){
					  $("#area2").html("Also consider the following: <br>");
					 for (const top2key of secondMultipleSet.keys()) {
						 $("#area2").append("<li>" + top2key + "</li>");
					 }
				 } else {
					 $("#area2").html("<strong>" + seconddx + "</strong>: <br/>");
				 	for (const secondSetKey of secondSet.keys()) {
						$("#area2").append("<li>" + secondSetKey + "</li>");
					};					 
				 }
				 if ((topMultipleSet.has(seconddx)) || (topddx==seconddx)) {
						 $("#area2").html("No additional differentials");
				 }
				 
//				 	alert ("topddx: " + topddx);
//				 $("#area1").html("<strong>" + topddx + "</strong>: <br/>");
//				 for (const topSetkey of topSet.keys()) {
//					 $("#area1").append("<li>" + topSetkey + "</li>");
//				 };
//					 alert ("seconddx: " + seconddx);

//				 finalDx.each(function(){
//					 let thisnospace = this.replace(/\s+/g, "");
//					 let cur3set = eval(thisnospace);
//					 alert(cur3set);
//				 });
//				 for (const item4 of finalDx.keys()) {
//					 let item4nospace = item4.replace(/\s+/g, "");
//					 item4nospace = eval(item4nospace);
//					 alert(item4);
//					alert(item4nospace.intersection(finalSet).keys());
////					 alert(finalSet.intersection(item4nospace).count);
////					 let totalcount = finalSet.intersection(item4nospace).count;
////					 $("#a-ddx").append("<li>" + item4 + " " + totalcount + " </li>");
//				 };
				 
//				 for (const item of ddx_list.keys()) {
//					 var itemNoSpace = item.replace(/\s+/g, "");
//					 var curddx = eval(itemNoSpace);
//					 
//					 if (curddx.isSubset(finalSet)){
//						 $("#a-ddx").append("<li>" + item + "</li>");
//					 };
//				 };
			 } else {
				$("#area1").html("");
				$("#area2").html("");
			 } ;
		 };
	 } else {
		 alert ("Nothing checked!");
		 $("#a-local").html("No localizations found!");
		 $("#a-ddx").html("");
	 }; //Nothing checked
	});
});