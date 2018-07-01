(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory(require("phaser"));
	else if(typeof define === 'function' && define.amd)
		define(["phaser"], factory);
	else if(typeof exports === 'object')
		exports["PhaserNavMeshPlugin"] = factory(require("phaser"));
	else
		root["PhaserNavMeshPlugin"] = factory(root["Phaser"]);
})(window, function(__WEBPACK_EXTERNAL_MODULE__1__) {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 2);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

var __WEBPACK_AMD_DEFINE_FACTORY__, __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;// javascript-astar 0.4.2
// http://github.com/bgrins/javascript-astar
// Freely distributable under the MIT License.
// Implements the astar search algorithm in javascript using a Binary Heap.
// Includes Binary Heap (with modifications) from Marijn Haverbeke.
// http://eloquentjavascript.net/appendix2.html
(function(definition) {
  /* global module, define */
  if (typeof module === 'object' && typeof module.exports === 'object') {
    module.exports = definition();
  } else if (true) {
    !(__WEBPACK_AMD_DEFINE_ARRAY__ = [], __WEBPACK_AMD_DEFINE_FACTORY__ = (definition),
				__WEBPACK_AMD_DEFINE_RESULT__ = (typeof __WEBPACK_AMD_DEFINE_FACTORY__ === 'function' ?
				(__WEBPACK_AMD_DEFINE_FACTORY__.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__)) : __WEBPACK_AMD_DEFINE_FACTORY__),
				__WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
  } else { var exports; }
})(function() {

function pathTo(node) {
  var curr = node;
  var path = [];
  while (curr.parent) {
    path.unshift(curr);
    curr = curr.parent;
  }
  return path;
}

function getHeap() {
  return new BinaryHeap(function(node) {
    return node.f;
  });
}

var astar = {
  /**
  * Perform an A* Search on a graph given a start and end node.
  * @param {Graph} graph
  * @param {GridNode} start
  * @param {GridNode} end
  * @param {Object} [options]
  * @param {bool} [options.closest] Specifies whether to return the
             path to the closest node if the target is unreachable.
  * @param {Function} [options.heuristic] Heuristic function (see
  *          astar.heuristics).
  */
  search: function(graph, start, end, options) {
    graph.cleanDirty();
    options = options || {};
    var heuristic = options.heuristic || astar.heuristics.manhattan;
    var closest = options.closest || false;

    var openHeap = getHeap();
    var closestNode = start; // set the start node to be the closest if required

    start.h = heuristic(start, end);
    graph.markDirty(start);

    openHeap.push(start);

    while (openHeap.size() > 0) {

      // Grab the lowest f(x) to process next.  Heap keeps this sorted for us.
      var currentNode = openHeap.pop();

      // End case -- result has been found, return the traced path.
      if (currentNode === end) {
        return pathTo(currentNode);
      }

      // Normal case -- move currentNode from open to closed, process each of its neighbors.
      currentNode.closed = true;

      // Find all neighbors for the current node.
      var neighbors = graph.neighbors(currentNode);

      for (var i = 0, il = neighbors.length; i < il; ++i) {
        var neighbor = neighbors[i];

        if (neighbor.closed || neighbor.isWall()) {
          // Not a valid node to process, skip to next neighbor.
          continue;
        }

        // The g score is the shortest distance from start to current node.
        // We need to check if the path we have arrived at this neighbor is the shortest one we have seen yet.
        var gScore = currentNode.g + neighbor.getCost(currentNode);
        var beenVisited = neighbor.visited;

        if (!beenVisited || gScore < neighbor.g) {

          // Found an optimal (so far) path to this node.  Take score for node to see how good it is.
          neighbor.visited = true;
          neighbor.parent = currentNode;
          neighbor.h = neighbor.h || heuristic(neighbor, end);
          neighbor.g = gScore;
          neighbor.f = neighbor.g + neighbor.h;
          graph.markDirty(neighbor);
          if (closest) {
            // If the neighbour is closer than the current closestNode or if it's equally close but has
            // a cheaper path than the current closest node then it becomes the closest node
            if (neighbor.h < closestNode.h || (neighbor.h === closestNode.h && neighbor.g < closestNode.g)) {
              closestNode = neighbor;
            }
          }

          if (!beenVisited) {
            // Pushing to heap will put it in proper place based on the 'f' value.
            openHeap.push(neighbor);
          } else {
            // Already seen the node, but since it has been rescored we need to reorder it in the heap
            openHeap.rescoreElement(neighbor);
          }
        }
      }
    }

    if (closest) {
      return pathTo(closestNode);
    }

    // No result was found - empty array signifies failure to find path.
    return [];
  },
  // See list of heuristics: http://theory.stanford.edu/~amitp/GameProgramming/Heuristics.html
  heuristics: {
    manhattan: function(pos0, pos1) {
      var d1 = Math.abs(pos1.x - pos0.x);
      var d2 = Math.abs(pos1.y - pos0.y);
      return d1 + d2;
    },
    diagonal: function(pos0, pos1) {
      var D = 1;
      var D2 = Math.sqrt(2);
      var d1 = Math.abs(pos1.x - pos0.x);
      var d2 = Math.abs(pos1.y - pos0.y);
      return (D * (d1 + d2)) + ((D2 - (2 * D)) * Math.min(d1, d2));
    }
  },
  cleanNode: function(node) {
    node.f = 0;
    node.g = 0;
    node.h = 0;
    node.visited = false;
    node.closed = false;
    node.parent = null;
  }
};

/**
 * A graph memory structure
 * @param {Array} gridIn 2D array of input weights
 * @param {Object} [options]
 * @param {bool} [options.diagonal] Specifies whether diagonal moves are allowed
 */
function Graph(gridIn, options) {
  options = options || {};
  this.nodes = [];
  this.diagonal = !!options.diagonal;
  this.grid = [];
  for (var x = 0; x < gridIn.length; x++) {
    this.grid[x] = [];

    for (var y = 0, row = gridIn[x]; y < row.length; y++) {
      var node = new GridNode(x, y, row[y]);
      this.grid[x][y] = node;
      this.nodes.push(node);
    }
  }
  this.init();
}

Graph.prototype.init = function() {
  this.dirtyNodes = [];
  for (var i = 0; i < this.nodes.length; i++) {
    astar.cleanNode(this.nodes[i]);
  }
};

Graph.prototype.cleanDirty = function() {
  for (var i = 0; i < this.dirtyNodes.length; i++) {
    astar.cleanNode(this.dirtyNodes[i]);
  }
  this.dirtyNodes = [];
};

Graph.prototype.markDirty = function(node) {
  this.dirtyNodes.push(node);
};

Graph.prototype.neighbors = function(node) {
  var ret = [];
  var x = node.x;
  var y = node.y;
  var grid = this.grid;

  // West
  if (grid[x - 1] && grid[x - 1][y]) {
    ret.push(grid[x - 1][y]);
  }

  // East
  if (grid[x + 1] && grid[x + 1][y]) {
    ret.push(grid[x + 1][y]);
  }

  // South
  if (grid[x] && grid[x][y - 1]) {
    ret.push(grid[x][y - 1]);
  }

  // North
  if (grid[x] && grid[x][y + 1]) {
    ret.push(grid[x][y + 1]);
  }

  if (this.diagonal) {
    // Southwest
    if (grid[x - 1] && grid[x - 1][y - 1]) {
      ret.push(grid[x - 1][y - 1]);
    }

    // Southeast
    if (grid[x + 1] && grid[x + 1][y - 1]) {
      ret.push(grid[x + 1][y - 1]);
    }

    // Northwest
    if (grid[x - 1] && grid[x - 1][y + 1]) {
      ret.push(grid[x - 1][y + 1]);
    }

    // Northeast
    if (grid[x + 1] && grid[x + 1][y + 1]) {
      ret.push(grid[x + 1][y + 1]);
    }
  }

  return ret;
};

Graph.prototype.toString = function() {
  var graphString = [];
  var nodes = this.grid;
  for (var x = 0; x < nodes.length; x++) {
    var rowDebug = [];
    var row = nodes[x];
    for (var y = 0; y < row.length; y++) {
      rowDebug.push(row[y].weight);
    }
    graphString.push(rowDebug.join(" "));
  }
  return graphString.join("\n");
};

function GridNode(x, y, weight) {
  this.x = x;
  this.y = y;
  this.weight = weight;
}

GridNode.prototype.toString = function() {
  return "[" + this.x + " " + this.y + "]";
};

GridNode.prototype.getCost = function(fromNeighbor) {
  // Take diagonal weight into consideration.
  if (fromNeighbor && fromNeighbor.x != this.x && fromNeighbor.y != this.y) {
    return this.weight * 1.41421;
  }
  return this.weight;
};

GridNode.prototype.isWall = function() {
  return this.weight === 0;
};

function BinaryHeap(scoreFunction) {
  this.content = [];
  this.scoreFunction = scoreFunction;
}

BinaryHeap.prototype = {
  push: function(element) {
    // Add the new element to the end of the array.
    this.content.push(element);

    // Allow it to sink down.
    this.sinkDown(this.content.length - 1);
  },
  pop: function() {
    // Store the first element so we can return it later.
    var result = this.content[0];
    // Get the element at the end of the array.
    var end = this.content.pop();
    // If there are any elements left, put the end element at the
    // start, and let it bubble up.
    if (this.content.length > 0) {
      this.content[0] = end;
      this.bubbleUp(0);
    }
    return result;
  },
  remove: function(node) {
    var i = this.content.indexOf(node);

    // When it is found, the process seen in 'pop' is repeated
    // to fill up the hole.
    var end = this.content.pop();

    if (i !== this.content.length - 1) {
      this.content[i] = end;

      if (this.scoreFunction(end) < this.scoreFunction(node)) {
        this.sinkDown(i);
      } else {
        this.bubbleUp(i);
      }
    }
  },
  size: function() {
    return this.content.length;
  },
  rescoreElement: function(node) {
    this.sinkDown(this.content.indexOf(node));
  },
  sinkDown: function(n) {
    // Fetch the element that has to be sunk.
    var element = this.content[n];

    // When at 0, an element can not sink any further.
    while (n > 0) {

      // Compute the parent element's index, and fetch it.
      var parentN = ((n + 1) >> 1) - 1;
      var parent = this.content[parentN];
      // Swap the elements if the parent is greater.
      if (this.scoreFunction(element) < this.scoreFunction(parent)) {
        this.content[parentN] = element;
        this.content[n] = parent;
        // Update 'n' to continue at the new position.
        n = parentN;
      }
      // Found a parent that is less, no need to sink any further.
      else {
        break;
      }
    }
  },
  bubbleUp: function(n) {
    // Look up the target element and its score.
    var length = this.content.length;
    var element = this.content[n];
    var elemScore = this.scoreFunction(element);

    while (true) {
      // Compute the indices of the child elements.
      var child2N = (n + 1) << 1;
      var child1N = child2N - 1;
      // This is used to store the new position of the element, if any.
      var swap = null;
      var child1Score;
      // If the first child exists (is inside the array)...
      if (child1N < length) {
        // Look it up and compute its score.
        var child1 = this.content[child1N];
        child1Score = this.scoreFunction(child1);

        // If the score is less than our element's, we need to swap.
        if (child1Score < elemScore) {
          swap = child1N;
        }
      }

      // Do the same checks for the other child.
      if (child2N < length) {
        var child2 = this.content[child2N];
        var child2Score = this.scoreFunction(child2);
        if (child2Score < (swap === null ? elemScore : child1Score)) {
          swap = child2N;
        }
      }

      // If the element needs to be moved, swap it, and continue.
      if (swap !== null) {
        this.content[n] = this.content[swap];
        this.content[swap] = element;
        n = swap;
      }
      // Otherwise, we are done.
      else {
        break;
      }
    }
  }
};

return {
  astar: astar,
  Graph: Graph
};

});

/***/ }),
/* 1 */
/***/ (function(module, exports) {

module.exports = __WEBPACK_EXTERNAL_MODULE__1__;

/***/ }),
/* 2 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);

// EXTERNAL MODULE: external {"root":"Phaser","commonjs":"phaser","commonjs2":"phaser","amd":"phaser"}
var external_root_Phaser_commonjs_phaser_commonjs2_phaser_amd_phaser_ = __webpack_require__(1);
var external_root_Phaser_commonjs_phaser_commonjs2_phaser_amd_phaser_default = /*#__PURE__*/__webpack_require__.n(external_root_Phaser_commonjs_phaser_commonjs2_phaser_amd_phaser_);

// EXTERNAL MODULE: C:/Users/mikewesthad/Documents/GitHub/phaser-navmesh/node_modules/javascript-astar/astar.js
var astar = __webpack_require__(0);
var astar_default = /*#__PURE__*/__webpack_require__.n(astar);

// CONCATENATED MODULE: C:/Users/mikewesthad/Documents/GitHub/phaser-navmesh/packages/navmesh/src/math/vector-2.js
var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * Stripped down version of Phaser's Vector2 with just the functionality needed for navmeshes
 *
 * @export
 * @class Vector2
 */
var Vector2 = function () {
  function Vector2(x, y) {
    _classCallCheck(this, Vector2);

    this.x = x || 0;
    this.y = y || 0;
  }

  _createClass(Vector2, [{
    key: "equals",
    value: function equals(v) {
      return this.x === v.x && this.y === v.y;
    }
  }, {
    key: "angle",
    value: function angle(v) {
      return Math.atan2(v.y - this.y, v.x - this.x);
    }
  }, {
    key: "distance",
    value: function distance(v) {
      var dx = v.x - this.x;
      var dy = v.y - this.y;
      return Math.sqrt(dx * dx + dy * dy);
    }
  }, {
    key: "add",
    value: function add(v) {
      this.x += v.x;
      this.y += v.y;
    }
  }, {
    key: "subtract",
    value: function subtract(v) {
      this.x -= v.x;
      this.y -= v.y;
    }
  }, {
    key: "clone",
    value: function clone() {
      return new Vector2(this.x, this.y);
    }
  }]);

  return Vector2;
}();

/* harmony default export */ var vector_2 = (Vector2);
// CONCATENATED MODULE: C:/Users/mikewesthad/Documents/GitHub/phaser-navmesh/packages/navmesh/src/navpoly.js
var navpoly_createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function navpoly_classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }



/**
 * A class that represents a navigable polygon with a navmesh. It is built on top of a
 * {@link Polygon}. It implements the properties and fields that javascript-astar needs - weight,
 * toString, isWall and getCost. See GPS test from astar repo for structure:
 * https://github.com/bgrins/javascript-astar/blob/master/test/tests.js
 *
 * @class NavPoly
 */

var navpoly_NavPoly = function () {
  /**
   * Creates an instance of NavPoly.
   * @param {number} id
   * @param {Polygon} polygon
   *
   * @memberof NavPoly
   */
  function NavPoly(id, polygon) {
    navpoly_classCallCheck(this, NavPoly);

    this.id = id;
    this.polygon = polygon;
    this.edges = polygon.edges;
    this.neighbors = [];
    this.portals = [];
    this.centroid = this.calculateCentroid();
    this.boundingRadius = this.calculateRadius();

    this.weight = 1; // jsastar property
  }

  /**
   * Returns an array of points that form the polygon.
   *
   * @returns {Vector2[]}
   * @memberof NavPoly
   */


  navpoly_createClass(NavPoly, [{
    key: "getPoints",
    value: function getPoints() {
      return this.polygon.points;
    }

    /**
     * Check if the given point-like object is within the polygon
     *
     * @param {object} point Object of the form {x, y}
     * @returns {boolean}
     * @memberof NavPoly
     */

  }, {
    key: "contains",
    value: function contains(point) {
      // Phaser's polygon check doesn't handle when a point is on one of the edges of the line. Note:
      // check numerical stability here. It would also be good to optimize this for different shapes.
      return this.polygon.contains(point.x, point.y) || this.isPointOnEdge(point);
    }

    /**
     * Only rectangles are supported, so this calculation works, but this is not actually the centroid
     * calculation for a polygon. This is just the average of the vertices - proper centroid of a
     * polygon factors in the area.
     *
     * @returns {Vector2}
     * @memberof NavPoly
     */

  }, {
    key: "calculateCentroid",
    value: function calculateCentroid() {
      var centroid = new vector_2(0, 0);
      var length = this.polygon.points.length;
      this.polygon.points.forEach(function (p) {
        return centroid.add(p);
      });
      centroid.x /= length;
      centroid.y /= length;
      return centroid;
    }

    /**
     * Calculate the radius of a circle that circumscribes the polygon.
     *
     * @returns {number}
     * @memberof NavPoly
     */

  }, {
    key: "calculateRadius",
    value: function calculateRadius() {
      var boundingRadius = 0;
      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = this.polygon.points[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var point = _step.value;

          var d = this.centroid.distance(point);
          if (d > boundingRadius) boundingRadius = d;
        }
      } catch (err) {
        _didIteratorError = true;
        _iteratorError = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion && _iterator.return) {
            _iterator.return();
          }
        } finally {
          if (_didIteratorError) {
            throw _iteratorError;
          }
        }
      }

      return boundingRadius;
    }

    /**
     * Check if the given point-like object is on one of the edges of the polygon.
     *
     * @param {object} Point-like object in the form { x, y }
     * @returns {boolean}
     * @memberof NavPoly
     */

  }, {
    key: "isPointOnEdge",
    value: function isPointOnEdge(_ref) {
      var x = _ref.x,
          y = _ref.y;
      var _iteratorNormalCompletion2 = true;
      var _didIteratorError2 = false;
      var _iteratorError2 = undefined;

      try {
        for (var _iterator2 = this.edges[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
          var edge = _step2.value;

          if (edge.pointOnSegment(x, y)) return true;
        }
      } catch (err) {
        _didIteratorError2 = true;
        _iteratorError2 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion2 && _iterator2.return) {
            _iterator2.return();
          }
        } finally {
          if (_didIteratorError2) {
            throw _iteratorError2;
          }
        }
      }

      return false;
    }
  }, {
    key: "destroy",
    value: function destroy() {
      this.neighbors = [];
      this.portals = [];
    }

    // jsastar methods

  }, {
    key: "toString",
    value: function toString() {
      return "NavPoly(id: " + this.id + " at: " + this.centroid + ")";
    }
  }, {
    key: "isWall",
    value: function isWall() {
      return this.weight === 0;
    }
  }, {
    key: "centroidDistance",
    value: function centroidDistance(navPolygon) {
      return this.centroid.distance(navPolygon.centroid);
    }
  }, {
    key: "getCost",
    value: function getCost(navPolygon) {
      return this.centroidDistance(navPolygon);
    }
  }]);

  return NavPoly;
}();

/* harmony default export */ var navpoly = (navpoly_NavPoly);
// CONCATENATED MODULE: C:/Users/mikewesthad/Documents/GitHub/phaser-navmesh/packages/navmesh/src/navgraph.js
var navgraph_createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function navgraph_classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }



/**
 * Graph for javascript-astar. It implements the functionality for astar. See GPS test from astar
 * repo for structure: https://github.com/bgrins/javascript-astar/blob/master/test/tests.js
 *
 * @class NavGraph
 * @private
 */

var NavGraph = function () {
  function NavGraph(navPolygons) {
    navgraph_classCallCheck(this, NavGraph);

    this.nodes = navPolygons;
    this.init();
  }

  navgraph_createClass(NavGraph, [{
    key: "neighbors",
    value: function neighbors(navPolygon) {
      return navPolygon.neighbors;
    }
  }, {
    key: "navHeuristic",
    value: function navHeuristic(navPolygon1, navPolygon2) {
      return navPolygon1.centroidDistance(navPolygon2);
    }
  }, {
    key: "destroy",
    value: function destroy() {
      this.cleanDirty();
      this.nodes = [];
    }
  }]);

  return NavGraph;
}();

NavGraph.prototype.init = astar_default.a.Graph.prototype.init;
NavGraph.prototype.cleanDirty = astar_default.a.Graph.prototype.cleanDirty;
NavGraph.prototype.markDirty = astar_default.a.Graph.prototype.markDirty;

/* harmony default export */ var navgraph = (NavGraph);
// CONCATENATED MODULE: C:/Users/mikewesthad/Documents/GitHub/phaser-navmesh/packages/navmesh/src/utils.js
/**
 * Twice the area of the triangle formed by a, b and c
 * @returns {number}
 * @private
 */
function triarea2(a, b, c) {
  var ax = b.x - a.x;
  var ay = b.y - a.y;
  var bx = c.x - a.x;
  var by = c.y - a.y;
  return bx * ay - ax * by;
}

/**
 * Clamp value between min and max
 * @returns {number}
 * @private
 */
function clamp(value, min, max) {
  if (value < min) value = min;
  if (value > max) value = max;
  return value;
}

/**
 * Check if two values within a small margin of one another
 * @returns {boolean}
 * @private
 */
function almostEqual(value1, value2) {
  var errorMargin = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 0.0001;

  if (Math.abs(value1 - value2) <= errorMargin) return true;else return false;
}

/**
 * Find the smallest angle difference between two angles
 * https://gist.github.com/Aaronduino/4068b058f8dbc34b4d3a9eedc8b2cbe0
 * @returns {number}
 * @private
 */
function angleDifference(x, y) {
  var a = x - y;
  var i = a + Math.PI;
  var j = Math.PI * 2;
  a = i - Math.floor(i / j) * j; // (a+180) % 360; this ensures the correct sign
  a -= Math.PI;
  return a;
}

/**
 * Check if two lines are collinear (within a marign)
 * @returns {boolean}
 * @private
 */
function areCollinear(line1, line2) {
  var errorMargin = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 0.0001;

  // Figure out if the two lines are equal by looking at the area of the triangle formed
  // by their points
  var area1 = triarea2(line1.start, line1.end, line2.start);
  var area2 = triarea2(line1.start, line1.end, line2.end);
  if (almostEqual(area1, 0, errorMargin) && almostEqual(area2, 0, errorMargin)) {
    return true;
  } else return false;
}
// CONCATENATED MODULE: C:/Users/mikewesthad/Documents/GitHub/phaser-navmesh/packages/navmesh/src/channel.js
var channel_createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function channel_classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

// Mostly sourced from PatrolJS at the moment. TODO: come back and reimplement this as an incomplete
// funnel algorithm so astar checks can be more accurate.



/**
 * @private
 */

var channel_Channel = function () {
  function Channel() {
    channel_classCallCheck(this, Channel);

    this.portals = [];
  }

  channel_createClass(Channel, [{
    key: "push",
    value: function push(p1) {
      var p2 = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;

      if (p2 === null) p2 = p1;
      this.portals.push({
        left: p1,
        right: p2
      });
    }
  }, {
    key: "stringPull",
    value: function stringPull() {
      var portals = this.portals;
      var pts = [];
      // Init scan state
      var portalApex, portalLeft, portalRight;
      var apexIndex = 0,
          leftIndex = 0,
          rightIndex = 0;

      portalApex = portals[0].left;
      portalLeft = portals[0].left;
      portalRight = portals[0].right;

      // Add start point.
      pts.push(portalApex);

      for (var i = 1; i < portals.length; i++) {
        // Find the next portal vertices
        var left = portals[i].left;
        var right = portals[i].right;

        // Update right vertex.
        if (triarea2(portalApex, portalRight, right) <= 0.0) {
          if (portalApex.equals(portalRight) || triarea2(portalApex, portalLeft, right) > 0.0) {
            // Tighten the funnel.
            portalRight = right;
            rightIndex = i;
          } else {
            // Right vertex just crossed over the left vertex, so the left vertex should
            // now be part of the path.
            pts.push(portalLeft);

            // Restart scan from portal left point.

            // Make current left the new apex.
            portalApex = portalLeft;
            apexIndex = leftIndex;
            // Reset portal
            portalLeft = portalApex;
            portalRight = portalApex;
            leftIndex = apexIndex;
            rightIndex = apexIndex;
            // Restart scan
            i = apexIndex;
            continue;
          }
        }

        // Update left vertex.
        if (triarea2(portalApex, portalLeft, left) >= 0.0) {
          if (portalApex.equals(portalLeft) || triarea2(portalApex, portalRight, left) < 0.0) {
            // Tighten the funnel.
            portalLeft = left;
            leftIndex = i;
          } else {
            // Left vertex just crossed over the right vertex, so the right vertex should
            // now be part of the path
            pts.push(portalRight);

            // Restart scan from portal right point.

            // Make current right the new apex.
            portalApex = portalRight;
            apexIndex = rightIndex;
            // Reset portal
            portalLeft = portalApex;
            portalRight = portalApex;
            leftIndex = apexIndex;
            rightIndex = apexIndex;
            // Restart scan
            i = apexIndex;
            continue;
          }
        }
      }

      if (pts.length === 0 || !pts[pts.length - 1].equals(portals[portals.length - 1].left)) {
        // Append last point to path.
        pts.push(portals[portals.length - 1].left);
      }

      this.path = pts;
      return pts;
    }
  }]);

  return Channel;
}();

/* harmony default export */ var src_channel = (channel_Channel);
// CONCATENATED MODULE: C:/Users/mikewesthad/Documents/GitHub/phaser-navmesh/packages/navmesh/src/math/line.js
var line_createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function line_classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }



/**
 * Stripped down version of Phaser's Line with just the functionality needed for navmeshes
 *
 * @export
 * @class Line
 */

var line_Line = function () {
  function Line(x1, y1, x2, y2) {
    line_classCallCheck(this, Line);

    this.start = new vector_2(x1, y1);
    this.end = new vector_2(x2, y2);

    this.left = Math.min(x1, x2);
    this.right = Math.max(x1, x2);
    this.top = Math.min(y1, y2);
    this.bottom = Math.max(y1, y2);
  }

  line_createClass(Line, [{
    key: "pointOnSegment",
    value: function pointOnSegment(x, y) {
      return x >= this.left && x <= this.right && y >= this.top && y <= this.bottom && this.pointOnLine(x, y);
    }
  }, {
    key: "pointOnLine",
    value: function pointOnLine(x, y) {
      // Compare slope of line start -> xy to line start -> line end
      return (x - this.left) * (this.bottom - this.top) === (this.right - this.left) * (y - this.top);
    }
  }]);

  return Line;
}();

/* harmony default export */ var math_line = (line_Line);
// CONCATENATED MODULE: C:/Users/mikewesthad/Documents/GitHub/phaser-navmesh/packages/navmesh/src/math/polygon.js
var polygon_createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function polygon_classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }



/**
 * Stripped down version of Phaser's Polygon with just the functionality needed for navmeshes
 *
 * @export
 * @class Polygon
 */

var polygon_Polygon = function () {
  function Polygon(points) {
    var closed = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;

    polygon_classCallCheck(this, Polygon);

    this.points = points;
    this.edges = [];

    for (var i = 1; i < points.length; i++) {
      var p1 = points[i - 1];
      var p2 = points[i];
      this.edges.push(new math_line(p1.x, p1.y, p2.x, p2.y));
    }
    if (closed) {
      var first = points[0];
      var last = points[points.length - 1];
      this.edges.push(new math_line(first.x, first.y, last.x, last.y));
    }
  }

  polygon_createClass(Polygon, [{
    key: "contains",
    value: function contains(x, y) {
      var inside = false;

      for (var i = -1, j = this.points.length - 1; ++i < this.points.length; j = i) {
        var ix = this.points[i].x;
        var iy = this.points[i].y;

        var jx = this.points[j].x;
        var jy = this.points[j].y;

        if ((iy <= y && y < jy || jy <= y && y < iy) && x < (jx - ix) * (y - iy) / (jy - iy) + ix) {
          inside = !inside;
        }
      }

      return inside;
    }
  }]);

  return Polygon;
}();

/* harmony default export */ var math_polygon = (polygon_Polygon);
// CONCATENATED MODULE: C:/Users/mikewesthad/Documents/GitHub/phaser-navmesh/packages/navmesh/src/navmesh.js
var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var navmesh_createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function navmesh_classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }










/**
 * The workhorse that represents a navigation mesh built from a series of polygons. Once built, the
 * mesh can be asked for a path from one point to another point. Some internal terminology usage:
 * - neighbor: a polygon that shares part of an edge with another polygon
 * - portal: when two neighbor's have edges that overlap, the portal is the overlapping line segment
 * - channel: the path of polygons from starting point to end point
 * - pull the string: run the funnel algorithm on the channel so that the path hugs the edges of the
 *   channel. Equivalent to having a string snaking through a hallway and then pulling it taut.
 *
 * @class NavMesh
 */

var navmesh_NavMesh = function () {
  /**
   * Creates an instance of NavMesh.
   * @param {object[][]} meshPolygonPoints Array where each element is an array of point-like
   * objects that defines a polygon.
   * @param {number} [meshShrinkAmount=0] The amount (in pixels) that the navmesh has been
   * shrunk around obstacles (a.k.a the amount obstacles have been expanded)
   * @memberof NavMesh
   */
  function NavMesh(meshPolygonPoints) {
    var meshShrinkAmount = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;

    navmesh_classCallCheck(this, NavMesh);

    this._meshShrinkAmount = meshShrinkAmount;

    var newPolys = meshPolygonPoints.map(function (polyPoints) {
      var vectors = polyPoints.map(function (p) {
        return new vector_2(p.x, p.y);
      });
      return new math_polygon(vectors);
    });

    this._navPolygons = newPolys.map(function (polygon, i) {
      return new navpoly(i, polygon);
    });

    this._calculateNeighbors();

    // Astar graph of connections between polygons
    this._graph = new navgraph(this._navPolygons);
  }

  /**
   * Get the NavPolys that are in this navmesh.
   *
   * @returns {NavPoly[]}
   * @memberof NavMesh
   */


  navmesh_createClass(NavMesh, [{
    key: "getPolygons",
    value: function getPolygons() {
      return this._navPolygons;
    }

    /**
     * Cleanup method to remove references.
     *
     * @memberof NavMesh
     */

  }, {
    key: "destroy",
    value: function destroy() {
      this._graph.destroy();
      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = this._navPolygons[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var poly = _step.value;
          poly.destroy();
        }
      } catch (err) {
        _didIteratorError = true;
        _iteratorError = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion && _iterator.return) {
            _iterator.return();
          }
        } finally {
          if (_didIteratorError) {
            throw _iteratorError;
          }
        }
      }

      this._navPolygons = [];
    }

    /**
     * Find a path from the start point to the end point using this nav mesh.
     *
     * @param {object} startPoint A point-like object in the form {x, y}
     * @param {object} endPoint A point-like object in the form {x, y}
     * @returns {Vector2[]|null} An array of points if a path is found, or null if no path
     *
     * @memberof NavMesh
     */

  }, {
    key: "findPath",
    value: function findPath(startPoint, endPoint) {
      var startPoly = null;
      var endPoly = null;
      var startDistance = Number.MAX_VALUE;
      var endDistance = Number.MAX_VALUE;
      var d = void 0,
          r = void 0;
      var startVector = new vector_2(startPoint.x, startPoint.y);
      var endVector = new vector_2(endPoint.x, endPoint.y);

      // Find the closest poly for the starting and ending point
      var _iteratorNormalCompletion2 = true;
      var _didIteratorError2 = false;
      var _iteratorError2 = undefined;

      try {
        for (var _iterator2 = this._navPolygons[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
          var navPoly = _step2.value;

          r = navPoly.boundingRadius;
          // Start
          d = navPoly.centroid.distance(startVector);
          if (d <= startDistance && d <= r && navPoly.contains(startVector)) {
            startPoly = navPoly;
            startDistance = d;
          }
          // End
          d = navPoly.centroid.distance(endVector);
          if (d <= endDistance && d <= r && navPoly.contains(endVector)) {
            endPoly = navPoly;
            endDistance = d;
          }
        }

        // If the start point wasn't inside a polygon, run a more liberal check that allows a point
        // to be within meshShrinkAmount radius of a polygon
      } catch (err) {
        _didIteratorError2 = true;
        _iteratorError2 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion2 && _iterator2.return) {
            _iterator2.return();
          }
        } finally {
          if (_didIteratorError2) {
            throw _iteratorError2;
          }
        }
      }

      if (!startPoly && this._meshShrinkAmount > 0) {
        var _iteratorNormalCompletion3 = true;
        var _didIteratorError3 = false;
        var _iteratorError3 = undefined;

        try {
          for (var _iterator3 = this._navPolygons[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
            var _navPoly = _step3.value;

            // Check if point is within bounding circle to avoid extra projection calculations
            r = _navPoly.boundingRadius + this._meshShrinkAmount;
            d = _navPoly.centroid.distance(startVector);
            if (d <= r) {
              // Check if projected point is within range of a polgyon and is closer than the
              // previous point
              var _projectPointToPolygo = this._projectPointToPolygon(startVector, _navPoly),
                  distance = _projectPointToPolygo.distance;

              if (distance <= this._meshShrinkAmount && distance < startDistance) {
                startPoly = _navPoly;
                startDistance = distance;
              }
            }
          }
        } catch (err) {
          _didIteratorError3 = true;
          _iteratorError3 = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion3 && _iterator3.return) {
              _iterator3.return();
            }
          } finally {
            if (_didIteratorError3) {
              throw _iteratorError3;
            }
          }
        }
      }

      // Same check as above, but for the end point
      if (!endPoly && this._meshShrinkAmount > 0) {
        var _iteratorNormalCompletion4 = true;
        var _didIteratorError4 = false;
        var _iteratorError4 = undefined;

        try {
          for (var _iterator4 = this._navPolygons[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
            var _navPoly2 = _step4.value;

            r = _navPoly2.boundingRadius + this._meshShrinkAmount;
            d = _navPoly2.centroid.distance(endVector);
            if (d <= r) {
              var _projectPointToPolygo2 = this._projectPointToPolygon(endVector, _navPoly2),
                  _distance = _projectPointToPolygo2.distance;

              if (_distance <= this._meshShrinkAmount && _distance < endDistance) {
                endPoly = _navPoly2;
                endDistance = _distance;
              }
            }
          }
        } catch (err) {
          _didIteratorError4 = true;
          _iteratorError4 = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion4 && _iterator4.return) {
              _iterator4.return();
            }
          } finally {
            if (_didIteratorError4) {
              throw _iteratorError4;
            }
          }
        }
      }

      // No matching polygons locations for the start or end, so no path found
      if (!startPoly || !endPoly) return null;

      // If the start and end polygons are the same, return a direct path
      if (startPoly === endPoly) return [startVector, endVector];

      // Search!
      var astarPath = astar_default.a.astar.search(this._graph, startPoly, endPoly, {
        heuristic: this._graph.navHeuristic
      });

      // While the start and end polygons may be valid, no path between them
      if (astarPath.length === 0) return null;

      // jsastar drops the first point from the path, but the funnel algorithm needs it
      astarPath.unshift(startPoly);

      // We have a path, so now time for the funnel algorithm
      var channel = new src_channel();
      channel.push(startVector);
      for (var i = 0; i < astarPath.length - 1; i++) {
        var navPolygon = astarPath[i];
        var nextNavPolygon = astarPath[i + 1];

        // Find the portal
        var portal = null;
        for (var _i = 0; _i < navPolygon.neighbors.length; _i++) {
          if (navPolygon.neighbors[_i].id === nextNavPolygon.id) {
            portal = navPolygon.portals[_i];
          }
        }

        // Push the portal vertices into the channel
        channel.push(portal.start, portal.end);
      }
      channel.push(endVector);

      // Pull a string along the channel to run the funnel
      channel.stringPull();

      // Clone path, excluding duplicates
      var lastPoint = null;
      var phaserPath = [];
      var _iteratorNormalCompletion5 = true;
      var _didIteratorError5 = false;
      var _iteratorError5 = undefined;

      try {
        for (var _iterator5 = channel.path[Symbol.iterator](), _step5; !(_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done); _iteratorNormalCompletion5 = true) {
          var p = _step5.value;

          var newPoint = p.clone();
          if (!lastPoint || !newPoint.equals(lastPoint)) phaserPath.push(newPoint);
          lastPoint = newPoint;
        }
      } catch (err) {
        _didIteratorError5 = true;
        _iteratorError5 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion5 && _iterator5.return) {
            _iterator5.return();
          }
        } finally {
          if (_didIteratorError5) {
            throw _iteratorError5;
          }
        }
      }

      return phaserPath;
    }
  }, {
    key: "_calculateNeighbors",
    value: function _calculateNeighbors() {
      // Fill out the neighbor information for each navpoly
      for (var i = 0; i < this._navPolygons.length; i++) {
        var navPoly = this._navPolygons[i];

        for (var j = i + 1; j < this._navPolygons.length; j++) {
          var otherNavPoly = this._navPolygons[j];

          // Check if the other navpoly is within range to touch
          var d = navPoly.centroid.distance(otherNavPoly.centroid);
          if (d > navPoly.boundingRadius + otherNavPoly.boundingRadius) continue;

          // The are in range, so check each edge pairing
          var _iteratorNormalCompletion6 = true;
          var _didIteratorError6 = false;
          var _iteratorError6 = undefined;

          try {
            for (var _iterator6 = navPoly.edges[Symbol.iterator](), _step6; !(_iteratorNormalCompletion6 = (_step6 = _iterator6.next()).done); _iteratorNormalCompletion6 = true) {
              var edge = _step6.value;
              var _iteratorNormalCompletion7 = true;
              var _didIteratorError7 = false;
              var _iteratorError7 = undefined;

              try {
                for (var _iterator7 = otherNavPoly.edges[Symbol.iterator](), _step7; !(_iteratorNormalCompletion7 = (_step7 = _iterator7.next()).done); _iteratorNormalCompletion7 = true) {
                  var otherEdge = _step7.value;

                  // If edges aren't collinear, not an option for connecting navpolys
                  if (!areCollinear(edge, otherEdge)) continue;

                  // If they are collinear, check if they overlap
                  var overlap = this._getSegmentOverlap(edge, otherEdge);
                  if (!overlap) continue;

                  // Connections are symmetric!
                  navPoly.neighbors.push(otherNavPoly);
                  otherNavPoly.neighbors.push(navPoly);

                  // Calculate the portal between the two polygons - this needs to be in
                  // counter-clockwise order, relative to each polygon

                  var _overlap = _slicedToArray(overlap, 2),
                      p1 = _overlap[0],
                      p2 = _overlap[1];

                  var edgeStartAngle = navPoly.centroid.angle(edge.start);
                  var a1 = navPoly.centroid.angle(overlap[0]);
                  var a2 = navPoly.centroid.angle(overlap[1]);
                  var d1 = angleDifference(edgeStartAngle, a1);
                  var d2 = angleDifference(edgeStartAngle, a2);
                  if (d1 < d2) {
                    navPoly.portals.push(new math_line(p1.x, p1.y, p2.x, p2.y));
                  } else {
                    navPoly.portals.push(new math_line(p2.x, p2.y, p1.x, p1.y));
                  }

                  edgeStartAngle = otherNavPoly.centroid.angle(otherEdge.start);
                  a1 = otherNavPoly.centroid.angle(overlap[0]);
                  a2 = otherNavPoly.centroid.angle(overlap[1]);
                  d1 = angleDifference(edgeStartAngle, a1);
                  d2 = angleDifference(edgeStartAngle, a2);
                  if (d1 < d2) {
                    otherNavPoly.portals.push(new math_line(p1.x, p1.y, p2.x, p2.y));
                  } else {
                    otherNavPoly.portals.push(new math_line(p2.x, p2.y, p1.x, p1.y));
                  }

                  // Two convex polygons shouldn't be connected more than once! (Unless
                  // there are unnecessary vertices...)
                }
              } catch (err) {
                _didIteratorError7 = true;
                _iteratorError7 = err;
              } finally {
                try {
                  if (!_iteratorNormalCompletion7 && _iterator7.return) {
                    _iterator7.return();
                  }
                } finally {
                  if (_didIteratorError7) {
                    throw _iteratorError7;
                  }
                }
              }
            }
          } catch (err) {
            _didIteratorError6 = true;
            _iteratorError6 = err;
          } finally {
            try {
              if (!_iteratorNormalCompletion6 && _iterator6.return) {
                _iterator6.return();
              }
            } finally {
              if (_didIteratorError6) {
                throw _iteratorError6;
              }
            }
          }
        }
      }
    }

    // Check two collinear line segments to see if they overlap by sorting the points.
    // Algorithm source: http://stackoverflow.com/a/17152247

  }, {
    key: "_getSegmentOverlap",
    value: function _getSegmentOverlap(line1, line2) {
      var points = [{ line: line1, point: line1.start }, { line: line1, point: line1.end }, { line: line2, point: line2.start }, { line: line2, point: line2.end }];
      points.sort(function (a, b) {
        if (a.point.x < b.point.x) return -1;else if (a.point.x > b.point.x) return 1;else {
          if (a.point.y < b.point.y) return -1;else if (a.point.y > b.point.y) return 1;else return 0;
        }
      });
      // If the first two points in the array come from the same line, no overlap
      var noOverlap = points[0].line === points[1].line;
      // If the two middle points in the array are the same coordinates, then there is a
      // single point of overlap.
      var singlePointOverlap = points[1].point.equals(points[2].point);
      if (noOverlap || singlePointOverlap) return null;else return [points[1].point, points[2].point];
    }

    /**
     * Project a point onto a polygon in the shortest distance possible.
     *
     * @param {Phaser.Point} point The point to project
     * @param {NavPoly} navPoly The navigation polygon to test against
     * @returns {{point: Phaser.Point, distance: number}}
     *
     * @private
     * @memberof NavMesh
     */

  }, {
    key: "_projectPointToPolygon",
    value: function _projectPointToPolygon(point, navPoly) {
      var closestProjection = null;
      var closestDistance = Number.MAX_VALUE;
      var _iteratorNormalCompletion8 = true;
      var _didIteratorError8 = false;
      var _iteratorError8 = undefined;

      try {
        for (var _iterator8 = navPoly.edges[Symbol.iterator](), _step8; !(_iteratorNormalCompletion8 = (_step8 = _iterator8.next()).done); _iteratorNormalCompletion8 = true) {
          var edge = _step8.value;

          var projectedPoint = this._projectPointToEdge(point, edge);
          var d = point.distance(projectedPoint);
          if (closestProjection === null || d < closestDistance) {
            closestDistance = d;
            closestProjection = projectedPoint;
          }
        }
      } catch (err) {
        _didIteratorError8 = true;
        _iteratorError8 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion8 && _iterator8.return) {
            _iterator8.return();
          }
        } finally {
          if (_didIteratorError8) {
            throw _iteratorError8;
          }
        }
      }

      return { point: closestProjection, distance: closestDistance };
    }
  }, {
    key: "_distanceSquared",
    value: function _distanceSquared(a, b) {
      var dx = b.x - a.x;
      var dy = b.y - a.y;
      return dx * dx + dy * dy;
    }

    // Project a point onto a line segment
    // JS Source: http://stackoverflow.com/questions/849211/shortest-distance-between-a-point-and-a-line-segment

  }, {
    key: "_projectPointToEdge",
    value: function _projectPointToEdge(point, line) {
      var a = line.start;
      var b = line.end;
      // Consider the parametric equation for the edge's line, p = a + t (b - a). We want to find
      // where our point lies on the line by solving for t:
      //  t = [(p-a) . (b-a)] / |b-a|^2
      var l2 = this._distanceSquared(a, b);
      var t = ((point.x - a.x) * (b.x - a.x) + (point.y - a.y) * (b.y - a.y)) / l2;
      // We clamp t from [0,1] to handle points outside the segment vw.
      t = clamp(t, 0, 1);
      // Project onto the segment
      var p = new vector_2(a.x + t * (b.x - a.x), a.y + t * (b.y - a.y));
      return p;
    }
  }]);

  return NavMesh;
}();

/* harmony default export */ var navmesh = (navmesh_NavMesh);
// CONCATENATED MODULE: C:/Users/mikewesthad/Documents/GitHub/phaser-navmesh/packages/navmesh/src/index.js


/* harmony default export */ var src = (navmesh);
// CONCATENATED MODULE: ./phaser-navmesh.js
var phaser_navmesh_createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function phaser_navmesh_classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

 // import the source - not the dist - no need to double build


/**
 * A wrapper around {@link NavMesh} for Phaser 3. Create instances of this class from
 * {@link PhaserNavMeshPlugin}. This is the workhorse that represents a navigation mesh built from a
 * series of polygons. Once built, the mesh can be asked for a path from one point to another point.
 *
 * Compared to {@link NavMesh}, this adds visual debugging capabilities and converts paths to
 * Phaser-compatible point instances.
 *
 * @export
 * @class PhaserNavMesh
 */

var phaser_navmesh_PhaserNavMesh = function () {
  /**
   * Creates an instance of PhaserNavMesh.
   * @param {PhaserNavMeshPlugin} plugin The plugin that owns this mesh.
   * @param {string} key The key the mesh is stored under within the plugin.
   * @param {object[][]} meshPolygonPoints Array where each element is an array of point-like
   * objects that defines a polygon.
   * @param {number} [meshShrinkAmount=0] The amount (in pixels) that the navmesh has been shrunk
   * around obstacles (a.k.a the amount obstacles have been expanded)
   * @memberof PhaserNavMesh
   */
  function PhaserNavMesh(plugin, key, meshPolygonPoints) {
    var meshShrinkAmount = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 0;

    phaser_navmesh_classCallCheck(this, PhaserNavMesh);

    this.key = key;
    this.plugin = plugin;
    this.scene = plugin.scene;
    this.debugGraphics = null;
    this.navMesh = new src(meshPolygonPoints, meshShrinkAmount);
  }

  /**
   * See {@link NavMesh#findPath}. This implements the same functionality, except that the returned path
   * is converted to Phaser-compatible points.
   *
   * @param {object} startPoint A point-like object in the form {x, y}
   * @param {object} endPoint A point-like object in the form {x, y}
   * @param {class} [PointClass=Phaser.Geom.Point]
   * @returns {object[]|null} An array of points if a path is found, or null if no path
   * @memberof PhaserNavMesh
   */


  phaser_navmesh_createClass(PhaserNavMesh, [{
    key: "findPath",
    value: function findPath(startPoint, endPoint) {
      var PointClass = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : external_root_Phaser_commonjs_phaser_commonjs2_phaser_amd_phaser_default.a.Geom.Point;

      var path = this.navMesh.findPath(startPoint, endPoint);
      return path ? path.map(function (_ref) {
        var x = _ref.x,
            y = _ref.y;
        return new PointClass(x, y);
      }) : path;
    }

    /**
     * Enable the debug drawing graphics. If no graphics object is providied, a new instance will be
     * created.
     *
     * @param {Phaser.GameObjects.Graphics} [graphics] An optional graphics object for the mesh to use
     * for debug drawing. Note, the mesh will destroy this graphics object when the mesh is destroyed.
     * @returns {Phaser.GameObjects.Graphics} The graphics object this mesh uses.
     * @memberof PhaserNavMesh
     */

  }, {
    key: "enableDebug",
    value: function enableDebug(graphics) {
      if (!graphics && !this.debugGraphics) {
        this.debugGraphics = this.scene.add.graphics();
      } else if (graphics) {
        if (this.debugGraphics) this.debugGraphics.destroy();
        this.debugGraphics = graphics;
      }

      this.debugGraphics.visible = true;

      return this.debugGraphics;
    }

    /**
     * Hide the debug graphics, but don't destroy it.
     *
     * @memberof PhaserNavMesh
     */

  }, {
    key: "disableDebug",
    value: function disableDebug() {
      if (this.debugGraphics) this.debugGraphics.visible = false;
    }

    /**
     * Returns true if the debug graphics object is enabled and visible.
     *
     * @returns {boolean}
     * @memberof PhaserNavMesh
     */

  }, {
    key: "isDebugEnabled",
    value: function isDebugEnabled() {
      return this.debugGraphics && this.debugGraphics.visible;
    }

    /**
     * Clear the debug graphics.
     *
     * @memberof PhaserNavMesh
     */

  }, {
    key: "debugDrawClear",
    value: function debugDrawClear() {
      if (this.debugGraphics) this.debugGraphics.clear();
    }

    /**
     * Visualize the polygons in the navmesh by drawing them to the debug graphics.
     *
     * @param {object} options
     * @param {boolean} [options.drawCentroid=true] For each polygon, show the approx centroid
     * @param {boolean} [options.drawBounds=false] For each polygon, show the bounding radius
     * @param {boolean} [options.drawNeighbors=true] For each polygon, show the connections to
     * neighbors
     * @param {boolean} [options.drawPortals=true] For each polygon, show the portal edges
     * @param {number[]} [options.palette=[0x00a0b0, 0x6a4a3c, 0xcc333f, 0xeb6841, 0xedc951]] An array
     * of Phaser-compatible format colors to use when drawing the individual polygons. The first poly
     * uses the first color, the second poly uses the second color, etc. 
     */

  }, {
    key: "debugDrawMesh",
    value: function debugDrawMesh() {
      var _this = this;

      var _ref2 = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
          _ref2$drawCentroid = _ref2.drawCentroid,
          drawCentroid = _ref2$drawCentroid === undefined ? true : _ref2$drawCentroid,
          _ref2$drawBounds = _ref2.drawBounds,
          drawBounds = _ref2$drawBounds === undefined ? false : _ref2$drawBounds,
          _ref2$drawNeighbors = _ref2.drawNeighbors,
          drawNeighbors = _ref2$drawNeighbors === undefined ? true : _ref2$drawNeighbors,
          _ref2$drawPortals = _ref2.drawPortals,
          drawPortals = _ref2$drawPortals === undefined ? true : _ref2$drawPortals,
          _ref2$palette = _ref2.palette,
          palette = _ref2$palette === undefined ? [0x00a0b0, 0x6a4a3c, 0xcc333f, 0xeb6841, 0xedc951] : _ref2$palette;

      if (!this.debugGraphics) return;

      var navPolys = this.navMesh.getPolygons();

      navPolys.forEach(function (poly) {
        var color = palette[poly.id % palette.length];
        _this.debugGraphics.fillStyle(color);
        _this.debugGraphics.fillPoints(poly.getPoints(), true);

        if (drawCentroid) {
          _this.debugGraphics.fillStyle(0x000000);
          _this.debugGraphics.fillCircle(poly.centroid.x, poly.centroid.y, 4);
        }

        if (drawBounds) {
          _this.debugGraphics.lineStyle(1, 0xffffff);
          _this.debugGraphics.strokeCircle(poly.centroid.x, poly.centroid.y, poly.boundingRadius);
        }

        if (drawNeighbors) {
          _this.debugGraphics.lineStyle(2, 0x000000);
          poly.neighbors.forEach(function (n) {
            _this.debugGraphics.lineBetween(poly.centroid.x, poly.centroid.y, n.centroid.x, n.centroid.y);
          });
        }

        if (drawPortals) {
          _this.debugGraphics.lineStyle(10, 0x000000);
          poly.portals.forEach(function (portal) {
            return _this.debugGraphics.lineBetween(portal.start.x, portal.start.y, portal.end.x, portal.end.y);
          });
        }
      });
    }

    /**
     * Visualize a path (array of points) on the debug graphics.
     *
     * @param {object[]} path Array of point-like objects in the form {x, y} 
     * @param {number} [color=0x00FF00]
     * @param {number} [thickness=10]
     * @param {number} [alpha=1]
     */

  }, {
    key: "debugDrawPath",
    value: function debugDrawPath(path) {
      var color = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0x00ff00;
      var thickness = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 10;
      var alpha = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 1;

      if (!this.debugGraphics) return;

      if (path && path.length) {
        // Draw line for path
        this.debugGraphics.lineStyle(thickness, color, alpha);
        this.debugGraphics.strokePoints(path);

        // Draw circle at start and end of path
        this.debugGraphics.fillStyle(color, alpha);
        var d = 1.2 * thickness;
        this.debugGraphics.fillCircle(path[0].x, path[0].y, d, d);

        if (path.length > 1) {
          var lastPoint = path[path.length - 1];
          this.debugGraphics.fillCircle(lastPoint.x, lastPoint.y, d, d);
        }
      }
    }

    /**
     * Destroy the mesh, kill the debug graphic and unregister itself with the plugin.
     *
     * @memberof PhaserNavMesh
     */

  }, {
    key: "destroy",
    value: function destroy() {
      if (this.navMesh) this.navMesh.destroy();
      if (this.debugGraphics) this.debugGraphics.destroy();
      this.plugin.removeMesh(this.key);
      this.navMesh = undefined;
      this.debugGraphics = undefined;
      this.plugin = undefined;
      this.scene = undefined;
    }
  }]);

  return PhaserNavMesh;
}();

/* harmony default export */ var phaser_navmesh = (phaser_navmesh_PhaserNavMesh);
// CONCATENATED MODULE: ./phaser-navmesh-plugin.js
var phaser_navmesh_plugin_createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function phaser_navmesh_plugin_classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }




/**
 * This class can create navigation meshes for use in Phaser 3. The navmeshes can be constructed
 * from convex polygons embedded in a Tiled map. The class that conforms to Phaser 3's plugin
 * structure.
 *
 * @export
 * @class PhaserNavMeshPlugin
 */

var phaser_navmesh_plugin_PhaserNavMeshPlugin = function (_Phaser$Plugins$Scene) {
  _inherits(PhaserNavMeshPlugin, _Phaser$Plugins$Scene);

  function PhaserNavMeshPlugin(scene, pluginManager) {
    phaser_navmesh_plugin_classCallCheck(this, PhaserNavMeshPlugin);

    var _this = _possibleConstructorReturn(this, (PhaserNavMeshPlugin.__proto__ || Object.getPrototypeOf(PhaserNavMeshPlugin)).call(this, scene, pluginManager));

    _this.phaserNavMeshes = {};
    _this.scene = scene;
    _this.systems = scene.sys;

    if (!scene.sys.settings.isBooted) _this.systems.events.once("boot", _this.boot, _this);
    return _this;
  }

  /**
   * Phaser.Scene lifecycle event
   *
   * @memberof PhaserNavMeshPlugin
   */


  phaser_navmesh_plugin_createClass(PhaserNavMeshPlugin, [{
    key: "boot",
    value: function boot() {
      var emitter = this.systems.events;
      emitter.once("destroy", this.destroy, this);
    }

    /**
     * Phaser.Scene lifecycle event - noop in this plugin, but still required.
     *
     * @memberof PhaserNavMeshPlugin
     */

  }, {
    key: "init",
    value: function init() {}

    /**
     * Phaser.Scene lifecycle event - noop in this plugin, but still required.
     *
     * @memberof PhaserNavMeshPlugin
     */

  }, {
    key: "start",
    value: function start() {}

    /**
     * Phaser.Scene lifecycle event - will destroy all navmeshes created.
     *
     * @memberof PhaserNavMeshPlugin
     */

  }, {
    key: "destroy",
    value: function destroy() {
      this.systems.events.off("boot", this.boot, this);
      Object.values(this.phaserNavMeshes).forEach(function (m) {
        return m.destroy();
      });
      this.phaserNavMeshes = [];
      this.scene = undefined;
      this.systems = undefined;
    }

    /**
     * Destroy a navmesh and remove it from the plugin
     *
     * @param {string} key
     * @memberof PhaserNavMeshPlugin
     */

  }, {
    key: "removeMesh",
    value: function removeMesh(key) {
      if (this.phaserNavMeshes[key]) {
        this.phaserNavMeshes[key].destroy();
        this.phaserNavMeshes[key] = undefined;
      }
    }

    /**
     * Load a navmesh from Tiled. Currently assumes that the polygons are squares! Does not support
     * tilemap layer scaling, rotation or position.
     *
     * @param {string} key Key to use when storign this navmesh within the plugin.
     * @param {Phaser.Tilemaps.ObjectLayer} objectLayer The ObjectLayer from a tilemap that contains
     * the polygons that make up the navmesh.
     * @param {number} [meshShrinkAmount=0] The amount (in pixels) that the navmesh has been shrunk
     * around obstacles (a.k.a the amount obstacles have been expanded)
     * @returns {PhaserNavMesh}
     * @memberof PhaserNavMeshPlugin
     */

  }, {
    key: "buildMeshFromTiled",
    value: function buildMeshFromTiled(key, objectLayer) {
      var meshShrinkAmount = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 0;

      if (this.phaserNavMeshes[key]) {
        console.warn("NavMeshPlugin: a navmesh already exists with the given key: " + key);
        return this.phaserNavMeshes[key];
      }

      if (!objectLayer || objectLayer.length === 0) {
        console.warn("NavMeshPlugin: The given tilemap object layer is empty or undefined: " + objectLayer);
      }

      // Load up the object layer
      var objects = objectLayer ? objectLayer.objects : [];

      // Loop over the objects and construct a polygon - assumes a rectangle for now!
      // TODO: support layer position, scale, rotation
      var polygons = objects.map(function (obj) {
        var top = obj.y;
        var bottom = obj.y + obj.height;
        var left = obj.x;
        var right = obj.x + obj.width;
        return [{ x: left, y: top }, { x: left, y: bottom }, { x: right, y: bottom }, { x: right, y: top }];
      });

      var mesh = new phaser_navmesh(this, key, polygons, meshShrinkAmount);

      this.phaserNavMeshes[key] = mesh;

      return mesh;
    }
  }]);

  return PhaserNavMeshPlugin;
}(external_root_Phaser_commonjs_phaser_commonjs2_phaser_amd_phaser_default.a.Plugins.ScenePlugin);

/* harmony default export */ var phaser_navmesh_plugin = (phaser_navmesh_plugin_PhaserNavMeshPlugin);
// CONCATENATED MODULE: ./index.js
/* concated harmony reexport */__webpack_require__.d(__webpack_exports__, "PhaserNavMesh", function() { return phaser_navmesh; });



/* harmony default export */ var index = __webpack_exports__["default"] = (phaser_navmesh_plugin);


/***/ })
/******/ ])["default"];
});
//# sourceMappingURL=phaser-navmesh.js.map