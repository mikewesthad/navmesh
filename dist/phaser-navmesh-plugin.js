(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define([], factory);
	else if(typeof exports === 'object')
		exports["phaserNavmeshPlugin"] = factory();
	else
		root["phaserNavmeshPlugin"] = factory();
})(this, function() {
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
/******/ 	// identity function for calling harmony imports with the correct context
/******/ 	__webpack_require__.i = function(value) { return value; };
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
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
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 4);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (immutable) */ __webpack_exports__["c"] = triarea2;
/* unused harmony export almostEqual */
/* harmony export (immutable) */ __webpack_exports__["b"] = angleDifference;
/* harmony export (immutable) */ __webpack_exports__["a"] = areCollinear;
/**
 * Twice the area of the triangle formed by a, b and c
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
 * @private
 */
function almostEqual(value1, value2) {
    var errorMargin = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 0.0001;

    if (Math.abs(value1 - value2) <= errorMargin) return true;else return false;
}

/**
 * https://gist.github.com/Aaronduino/4068b058f8dbc34b4d3a9eedc8b2cbe0
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

/***/ }),
/* 1 */
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
  } else {
    var exports = definition();
    window.astar = exports.astar;
    window.Graph = exports.Graph;
  }
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
/* 2 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_javascript_astar__ = __webpack_require__(1);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_javascript_astar___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0_javascript_astar__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__nav_poly__ = __webpack_require__(6);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__nav_graph__ = __webpack_require__(5);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__channel__ = __webpack_require__(3);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4__utils__ = __webpack_require__(0);
var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }







/**
 * The workhorse that represents a navigation mesh built from a series of polygons. Once built, the
 * mesh can be asked for a path from one point to another point. It has debug methods for 
 * visualizing paths and visualizing the individual polygons. Some internal terminology usage:
 * 
 * - neighbor: a polygon that shares part of an edge with another polygon
 * - portal: when two neighbor's have edges that overlap, the portal is the overlapping line segment
 * - channel: the path of polygons from starting point to end point
 * - pull the string: run the funnel algorithm on the channel so that the path hugs the edges of the
 *   channel. Equivalent to having a string snaking through a hallway and then pulling it taut.
 */

var NavMesh = function () {
    /**
     * Creates an instance of NavMesh.
     * 
     * @param {Phaser.Game} game
     * @param {Phaser.Polygon[]} polygons
     * @param {number} [meshShrinkAmount=0] The amount (in pixels) that the navmesh has been
     * shrunk around obstacles (a.k.a the amount obstacles have been expanded)
     */
    function NavMesh(game, polygons) {
        var meshShrinkAmount = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 0;

        _classCallCheck(this, NavMesh);

        this.game = game;
        this._debugGraphics = null;
        this._meshShrinkAmount = meshShrinkAmount;

        // Construct NavPoly instances for each polygon
        this._navPolygons = [];
        var _iteratorNormalCompletion = true;
        var _didIteratorError = false;
        var _iteratorError = undefined;

        try {
            for (var _iterator = polygons.entries()[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                var _ref = _step.value;

                var _ref2 = _slicedToArray(_ref, 2);

                var i = _ref2[0];
                var polygon = _ref2[1];

                this._navPolygons.push(new __WEBPACK_IMPORTED_MODULE_1__nav_poly__["a" /* default */](game, i, polygon));
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

        this._calculateNeighbors();

        // Astar graph of connections between polygons
        this._graph = new __WEBPACK_IMPORTED_MODULE_2__nav_graph__["a" /* default */](this._navPolygons);
    }

    /**
     * Cleanup method to remove references so that navmeshes don't hang around from state to state.
     * You don't have to invoke this directly. If you call destroy on the plugin, it will destroy
     * all navmeshes that have been created. 
     * 
     * @memberof NavMesh
     */


    _createClass(NavMesh, [{
        key: "destroy",
        value: function destroy() {
            this._graph.destroy();
            var _iteratorNormalCompletion2 = true;
            var _didIteratorError2 = false;
            var _iteratorError2 = undefined;

            try {
                for (var _iterator2 = this._navPolygons[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                    var poly = _step2.value;
                    poly.destroy();
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

            this._navPolygons = [];
            this.game = null;
            this.disableDebug();
        }

        /**
         * Find a path from the start point to the end point using this nav mesh.
         *
         * @param {Phaser.Point} startPoint
         * @param {Phaser.Point} endPoint
         * @param {object} [drawOptions={}] Options for controlling debug drawing
         * @param {boolean} [drawOptions.drawPolyPath=false] Whether or not to visualize the path
         * through the polygons - e.g. the path that astar found.
         * @param {boolean} [drawOptions.drawFinalPath=false] Whether or not to visualize the path
         * through the path that was returned.
         * @returns {Phaser.Point[]|null} An array of points if a path is found, or null if no path
         *
         * @memberof NavMesh
         */

    }, {
        key: "findPath",
        value: function findPath(startPoint, endPoint) {
            var _ref3 = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {},
                _ref3$drawPolyPath = _ref3.drawPolyPath,
                drawPolyPath = _ref3$drawPolyPath === undefined ? false : _ref3$drawPolyPath,
                _ref3$drawFinalPath = _ref3.drawFinalPath,
                drawFinalPath = _ref3$drawFinalPath === undefined ? false : _ref3$drawFinalPath;

            var startPoly = null;
            var endPoly = null;
            var startDistance = Number.MAX_VALUE;
            var endDistance = Number.MAX_VALUE;
            var d = void 0,
                r = void 0;

            // Find the closest poly for the starting and ending point
            var _iteratorNormalCompletion3 = true;
            var _didIteratorError3 = false;
            var _iteratorError3 = undefined;

            try {
                for (var _iterator3 = this._navPolygons[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
                    var navPoly = _step3.value;

                    r = navPoly.boundingRadius;
                    // Start
                    d = navPoly.centroid.distance(startPoint);
                    if (d <= startDistance && d <= r && navPoly.constains(startPoint)) {
                        startPoly = navPoly;
                        startDistance = d;
                    }
                    // End
                    d = navPoly.centroid.distance(endPoint);
                    if (d <= endDistance && d <= r && navPoly.constains(endPoint)) {
                        endPoly = navPoly;
                        endDistance = d;
                    }
                }

                // If the start point wasn't inside a polygon, run a more liberal check that allows a point
                // to be within meshShrinkAmount radius of a polygon
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

            if (!startPoly && this._meshShrinkAmount > 0) {
                var _iteratorNormalCompletion4 = true;
                var _didIteratorError4 = false;
                var _iteratorError4 = undefined;

                try {
                    for (var _iterator4 = this._navPolygons[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
                        var _navPoly = _step4.value;

                        // Check if point is within bounding circle to avoid extra projection calculations
                        r = _navPoly.boundingRadius + this._meshShrinkAmount;
                        d = _navPoly.centroid.distance(startPoint);
                        if (d <= r) {
                            // Check if projected point is within range of a polgyon and is closer than the
                            // previous point
                            var _projectPointToPolygo = this._projectPointToPolygon(startPoint, _navPoly),
                                distance = _projectPointToPolygo.distance;

                            if (distance <= this._meshShrinkAmount && distance < startDistance) {
                                startPoly = _navPoly;
                                startDistance = distance;
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

            // Same check as above, but for the end point
            if (!endPoly && this._meshShrinkAmount > 0) {
                var _iteratorNormalCompletion5 = true;
                var _didIteratorError5 = false;
                var _iteratorError5 = undefined;

                try {
                    for (var _iterator5 = this._navPolygons[Symbol.iterator](), _step5; !(_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done); _iteratorNormalCompletion5 = true) {
                        var _navPoly2 = _step5.value;

                        r = _navPoly2.boundingRadius + this._meshShrinkAmount;
                        d = _navPoly2.centroid.distance(endPoint);
                        if (d <= r) {
                            var _projectPointToPolygo2 = this._projectPointToPolygon(endPoint, _navPoly2),
                                _distance = _projectPointToPolygo2.distance;

                            if (_distance <= this._meshShrinkAmount && _distance < endDistance) {
                                endPoly = _navPoly2;
                                endDistance = _distance;
                            }
                        }
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
            }

            // No matching polygons locations for the start or end, so no path found
            if (!startPoly || !endPoly) return null;

            // Search!
            var astarPath = __WEBPACK_IMPORTED_MODULE_0_javascript_astar___default.a.astar.search(this._graph, startPoly, endPoly, {
                heuristic: this._graph.navHeuristic
            });
            // jsastar drops the first point from the path, but the funnel algorithm needs it
            astarPath.unshift(startPoly);

            // We have a path, so now time for the funnel algorithm
            var channel = new __WEBPACK_IMPORTED_MODULE_3__channel__["a" /* default */]();
            channel.push(startPoint);
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
            channel.push(endPoint);

            // Pull a string along the channel to run the funnel
            channel.stringPull();

            // Clone path, excluding duplicates
            var lastPoint = null;
            var phaserPath = [];
            var _iteratorNormalCompletion6 = true;
            var _didIteratorError6 = false;
            var _iteratorError6 = undefined;

            try {
                for (var _iterator6 = channel.path[Symbol.iterator](), _step6; !(_iteratorNormalCompletion6 = (_step6 = _iterator6.next()).done); _iteratorNormalCompletion6 = true) {
                    var p = _step6.value;

                    var newPoint = p.clone();
                    if (!lastPoint || !newPoint.equals(lastPoint)) phaserPath.push(newPoint);
                    lastPoint = newPoint;
                }

                // Call debug drawing
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

            if (drawPolyPath) {
                var polyPath = astarPath.map(function (elem) {
                    return elem.centroid;
                });
                this.debugDrawPath(polyPath, 0x00ff00, 5);
            }
            if (drawFinalPath) this.debugDrawPath(phaserPath, 0xffd900, 10);

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
                    var _iteratorNormalCompletion7 = true;
                    var _didIteratorError7 = false;
                    var _iteratorError7 = undefined;

                    try {
                        for (var _iterator7 = navPoly.edges[Symbol.iterator](), _step7; !(_iteratorNormalCompletion7 = (_step7 = _iterator7.next()).done); _iteratorNormalCompletion7 = true) {
                            var edge = _step7.value;
                            var _iteratorNormalCompletion8 = true;
                            var _didIteratorError8 = false;
                            var _iteratorError8 = undefined;

                            try {
                                for (var _iterator8 = otherNavPoly.edges[Symbol.iterator](), _step8; !(_iteratorNormalCompletion8 = (_step8 = _iterator8.next()).done); _iteratorNormalCompletion8 = true) {
                                    var otherEdge = _step8.value;


                                    // If edges aren't collinear, not an option for connecting navpolys
                                    if (!__webpack_require__.i(__WEBPACK_IMPORTED_MODULE_4__utils__["a" /* areCollinear */])(edge, otherEdge)) continue;

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
                                    var d1 = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_4__utils__["b" /* angleDifference */])(edgeStartAngle, a1);
                                    var d2 = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_4__utils__["b" /* angleDifference */])(edgeStartAngle, a2);
                                    if (d1 < d2) {
                                        navPoly.portals.push(new Phaser.Line(p1.x, p1.y, p2.x, p2.y));
                                    } else {
                                        navPoly.portals.push(new Phaser.Line(p2.x, p2.y, p1.x, p1.y));
                                    }

                                    edgeStartAngle = otherNavPoly.centroid.angle(otherEdge.start);
                                    a1 = otherNavPoly.centroid.angle(overlap[0]);
                                    a2 = otherNavPoly.centroid.angle(overlap[1]);
                                    d1 = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_4__utils__["b" /* angleDifference */])(edgeStartAngle, a1);
                                    d2 = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_4__utils__["b" /* angleDifference */])(edgeStartAngle, a2);
                                    if (d1 < d2) {
                                        otherNavPoly.portals.push(new Phaser.Line(p1.x, p1.y, p2.x, p2.y));
                                    } else {
                                        otherNavPoly.portals.push(new Phaser.Line(p2.x, p2.y, p1.x, p1.y));
                                    }

                                    // Two convex polygons shouldn't be connected more than once! (Unless
                                    // there are unnecessary vertices...)
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
            var _iteratorNormalCompletion9 = true;
            var _didIteratorError9 = false;
            var _iteratorError9 = undefined;

            try {
                for (var _iterator9 = navPoly.edges[Symbol.iterator](), _step9; !(_iteratorNormalCompletion9 = (_step9 = _iterator9.next()).done); _iteratorNormalCompletion9 = true) {
                    var edge = _step9.value;

                    var projectedPoint = this._projectPointToEdge(point, edge);
                    var d = point.distance(projectedPoint);
                    if (closestProjection === null || d < closestDistance) {
                        closestDistance = d;
                        closestProjection = projectedPoint;
                    }
                }
            } catch (err) {
                _didIteratorError9 = true;
                _iteratorError9 = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion9 && _iterator9.return) {
                        _iterator9.return();
                    }
                } finally {
                    if (_didIteratorError9) {
                        throw _iteratorError9;
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
            t = Phaser.Math.clamp(t, 0, 1);
            // Project onto the segment
            var p = new Phaser.Point(a.x + t * (b.x - a.x), a.y + t * (b.y - a.y));
            return p;
        }

        /**
         * Enable debug and create graphics overlay (if it hasn't already been created) 
         */

    }, {
        key: "enableDebug",
        value: function enableDebug() {
            if (!this._debugGraphics) {
                this._debugGraphics = this.game.add.graphics(0, 0);
                this._debugGraphics.alpha = 0.5;
            }
        }

        /**
         * Disable debug and destroy associated graphics
         */

    }, {
        key: "disableDebug",
        value: function disableDebug() {
            if (this._debugGraphics) {
                this._debugGraphics.destroy();
                this._debugGraphics = null;
            }
        }

        /**
         * Check whether debug is enabled
         * 
         * @returns {boolean}
         */

    }, {
        key: "isDebugEnabled",
        value: function isDebugEnabled() {
            return this._debugGraphics !== null;
        }

        /**
         * Clear the debug overlay
         */

    }, {
        key: "debugClear",
        value: function debugClear() {
            if (this._debugGraphics) this._debugGraphics.clear();
        }

        /**
         * Visualize the polygons in the nav mesh as an overlay on top of the game
         *
         * @param {object} options
         * @param {boolean} [options.drawCentroid=true] For each polygon, show the approx centroid
         * @param {boolean} [options.drawBounds=false] For each polygon, show the bounding radius
         * @param {boolean} [options.drawNeighbors=true] For each polygon, show the connections to
         * neighbors
         * @param {boolean} [options.drawPortals=true] For each polygon, show the portal edges
         */

    }, {
        key: "debugDrawMesh",
        value: function debugDrawMesh() {
            var _ref4 = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
                _ref4$drawCentroid = _ref4.drawCentroid,
                drawCentroid = _ref4$drawCentroid === undefined ? true : _ref4$drawCentroid,
                _ref4$drawBounds = _ref4.drawBounds,
                drawBounds = _ref4$drawBounds === undefined ? false : _ref4$drawBounds,
                _ref4$drawNeighbors = _ref4.drawNeighbors,
                drawNeighbors = _ref4$drawNeighbors === undefined ? true : _ref4$drawNeighbors,
                _ref4$drawPortals = _ref4.drawPortals,
                drawPortals = _ref4$drawPortals === undefined ? true : _ref4$drawPortals;

            if (!this._debugGraphics) this.enableDebug();
            // Visualize the navigation mesh
            var _iteratorNormalCompletion10 = true;
            var _didIteratorError10 = false;
            var _iteratorError10 = undefined;

            try {
                for (var _iterator10 = this._navPolygons[Symbol.iterator](), _step10; !(_iteratorNormalCompletion10 = (_step10 = _iterator10.next()).done); _iteratorNormalCompletion10 = true) {
                    var navPoly = _step10.value;

                    navPoly.draw(this._debugGraphics, drawCentroid, drawBounds, drawNeighbors, drawPortals);
                }
            } catch (err) {
                _didIteratorError10 = true;
                _iteratorError10 = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion10 && _iterator10.return) {
                        _iterator10.return();
                    }
                } finally {
                    if (_didIteratorError10) {
                        throw _iteratorError10;
                    }
                }
            }
        }

        /**
         * Visualize a path (array of points) on the debug graphics overlay
         * 
         * @param {Phaser.Point[]} path 
         * @param {number} [color=0x00FF00] 
         * @param {number} [thickness=10] 
         */

    }, {
        key: "debugDrawPath",
        value: function debugDrawPath(path) {
            var color = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0x00FF00;
            var thickness = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 10;

            if (!this._debugGraphics) this.enableDebug();
            if (path.length) {
                // Draw line for path
                this._debugGraphics.lineStyle(thickness, color);
                this._debugGraphics.drawShape(new (Function.prototype.bind.apply(Phaser.Polygon, [null].concat(_toConsumableArray(path))))());
                this._debugGraphics.beginFill(color);
                // Draw circle at start and end of path
                var d = 0.5 * thickness;
                this._debugGraphics.drawEllipse(path[0].x, path[0].y, d, d);
                var lastPoint = path[path.length - 1];
                this._debugGraphics.drawEllipse(lastPoint.x, lastPoint.y, d, d);
                this._debugGraphics.endFill();
            }
        }
    }]);

    return NavMesh;
}();

/* harmony default export */ __webpack_exports__["a"] = (NavMesh);

/***/ }),
/* 3 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__utils__ = __webpack_require__(0);
var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

// Mostly sourced from PatrolJS at the moment. TODO: come back and reimplement this as an incomplete
// funnel algorithm so astar checks can be more accurate.



/**
 * @private
 */

var Channel = function () {
    function Channel() {
        _classCallCheck(this, Channel);

        this.portals = [];
    }

    /**
     * @param {Phaser.Point} p1 
     * @param {Phaser.Point} p2 
     * 
     * @memberof Channel
     */


    _createClass(Channel, [{
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
                if (__webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__utils__["c" /* triarea2 */])(portalApex, portalRight, right) <= 0.0) {
                    if (portalApex.equals(portalRight) || __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__utils__["c" /* triarea2 */])(portalApex, portalLeft, right) > 0.0) {
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
                if (__webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__utils__["c" /* triarea2 */])(portalApex, portalLeft, left) >= 0.0) {
                    if (portalApex.equals(portalLeft) || __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__utils__["c" /* triarea2 */])(portalApex, portalRight, left) < 0.0) {
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

/* harmony default export */ __webpack_exports__["a"] = (Channel);

/***/ }),
/* 4 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__nav_mesh__ = __webpack_require__(2);
var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

// const triangulate = require("./triangulate");


/**
 * This plugin can create navigation meshes for use in Phaser. The navmeshes can be constructed from
 * convex polygons embedded in a Tiled map. Instantiate this using game.plugins.add(NavMeshPlugin).
 *
 * @param {Phaser.Game} game
 * @param {Phaser.PluginManager} manager
 */

var NavMeshPlugin = function (_Phaser$Plugin) {
    _inherits(NavMeshPlugin, _Phaser$Plugin);

    function NavMeshPlugin(game, manager) {
        _classCallCheck(this, NavMeshPlugin);

        var _this = _possibleConstructorReturn(this, (NavMeshPlugin.__proto__ || Object.getPrototypeOf(NavMeshPlugin)).call(this, game, manager));

        _this._navMeshes = [];
        return _this;
    }

    /**
     * Load a navmesh from Tiled and switch it to be the current navmesh. Currently assumes that the
     * polygons are squares!
     * 
     * @param {Phaser.Tilemap} tilemap The tilemap that contains polygons under an object layer
     * @param {string} objectKey The name of the object layer in the tilemap
     * @param {number} [meshShrinkAmount=0] The amount (in pixels) that the navmesh has been
     * shrunk around obstacles (a.k.a the amount obstacles have been expanded)
     * 
     * @memberof NavMeshPlugin
     */


    _createClass(NavMeshPlugin, [{
        key: "buildMeshFromTiled",
        value: function buildMeshFromTiled(tilemap, objectKey) {
            var meshShrinkAmount = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 0;

            // Load up the object layer
            var rects = tilemap.objects[objectKey] || [];
            // Loop over the objects and construct a polygon
            var polygons = [];
            var _iteratorNormalCompletion = true;
            var _didIteratorError = false;
            var _iteratorError = undefined;

            try {
                for (var _iterator = rects[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                    var r = _step.value;

                    var top = r.y;
                    var bottom = r.y + r.height;
                    var left = r.x;
                    var right = r.x + r.width;
                    var poly = new Phaser.Polygon(left, top, left, bottom, right, bottom, right, top);
                    polygons.push(poly);
                }
                // Build the navmesh
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

            var mesh = new __WEBPACK_IMPORTED_MODULE_0__nav_mesh__["a" /* default */](this.game, polygons, meshShrinkAmount);
            this._navMeshes.push(mesh);
            return mesh;
        }
    }, {
        key: "destroy",
        value: function destroy() {
            console.log("destroyed");
            var _iteratorNormalCompletion2 = true;
            var _didIteratorError2 = false;
            var _iteratorError2 = undefined;

            try {
                for (var _iterator2 = this._navMeshes[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                    var mesh = _step2.value;
                    mesh.destroy();
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

            this._navMeshes = [];
            _get(NavMeshPlugin.prototype.__proto__ || Object.getPrototypeOf(NavMeshPlugin.prototype), "destroy", this).call(this);
        }

        // /**
        //  * Build a navmesh from an array of convex polygons. This currently tesselates the polygons into
        //  * triangles. They aren't as efficient or as well designed as ones made by hand in Tiled. 
        //  *
        //  * @param {string} levelName The key to use to store the navmesh in the plugin  
        //  * @param {[]} hulls An array of convex polygons describing the obstacles in the
        //  * level. See lighting-plugin/hull-from-tiles.
        //  *
        //  * @memberof NavMeshPlugin
        //  */
        // buildMesh(levelName, hulls) {
        //     const contours = this._buildContours(hulls);
        //     // Get an array of triangulated vertices
        //     const triangles = triangulate(contours, false); // Counter-clockwise ordering!
        //     const polygons = [];
        //     for (let i = 0; i < triangles.length; i += 6) {
        //         const poly = new Phaser.Polygon(
        //             // These should be in counter-clockwise order from triangulate
        //             triangles[i + 0], triangles[i + 1], 
        //             triangles[i + 2], triangles[i + 3], 
        //             triangles[i + 4], triangles[i + 5]
        //         );
        //         polygons.push(poly);
        //     }
        //     const navMesh = new NavMesh(this.game, polygons);
        //     this._navMeshes[levelName] = navMesh;
        //     this._currentNavMesh = navMesh;
        // }

        // /**
        //  * @param {[]} hulls 
        //  * @returns 
        //  * 
        //  * @memberof NavMeshPlugin
        //  */
        // _buildContours(hulls) {
        //     const w = this.game.width;
        //     const h = this.game.height;
        //     // Start the contours
        //     const contours = [
        //         // Full screen - counter clockwise
        //         Float32Array.of(0,0, 0,h, w,h, w,0)
        //     ];
        //     // For each convex hull add the contour
        //     for (const hull of hulls) {
        //         const contour = [];
        //         for (const lineInfo of hull) {
        //             contour.push(lineInfo.line.start.x, lineInfo.line.start.y);
        //         }
        //         contours.push(Float32Array.from(contour));
        //     }
        //     return contours;
        // }

    }]);

    return NavMeshPlugin;
}(Phaser.Plugin);

/* harmony default export */ __webpack_exports__["default"] = (NavMeshPlugin);


Phaser.NavMeshPlugin = NavMeshPlugin;

/***/ }),
/* 5 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_javascript_astar__ = __webpack_require__(1);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_javascript_astar___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0_javascript_astar__);
var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }



/**
 * Graph for javascript-astar. It implements the functionality for astar. See GPS test from astar
 * repo for structure: https://github.com/bgrins/javascript-astar/blob/master/test/tests.js
 *
 * @class NavGraph 
 * @private
 */

var NavGraph = function () {
    function NavGraph(navPolygons) {
        _classCallCheck(this, NavGraph);

        this.nodes = navPolygons;
        this.init();
    }

    _createClass(NavGraph, [{
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

NavGraph.prototype.init = __WEBPACK_IMPORTED_MODULE_0_javascript_astar___default.a.Graph.prototype.init;
NavGraph.prototype.cleanDirty = __WEBPACK_IMPORTED_MODULE_0_javascript_astar___default.a.Graph.prototype.cleanDirty;
NavGraph.prototype.markDirty = __WEBPACK_IMPORTED_MODULE_0_javascript_astar___default.a.Graph.prototype.markDirty;

/* harmony default export */ __webpack_exports__["a"] = (NavGraph);

/***/ }),
/* 6 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

// Debug color palette
var palette = [0x00A0B0, 0x6A4A3C, 0xCC333F, 0xEB6841, 0xEDC951];

/**
 * A class that represents a navigable polygon in a navmesh. It is build from a Phaser.Polygon. It
 * has a drawing function to help visualize it's features:
 *  - polygon
 *  - neighbors - any navpolys that can be reached from this navpoly
 *  - portals - overlapping edges between neighbors
 *  - centroid - not a true centroid, just an approximation.
 *  - boundingRadius - the radius of a circle at the centroid that fits all the points of the poly 
 * 
 * It implements the properties and fields that javascript-astar needs - weight, toString, isWall
 * and getCost. See GPS test from astar repo for structure: 
 * https://github.com/bgrins/javascript-astar/blob/master/test/tests.js
 *
 * @class NavPoly
 * @private
 */

var NavPoly = function () {
    /**
     * Creates an instance of NavPoly.
     * @param {Phaser.Game} game 
     * @param {number} id 
     * @param {Phaser.Polygon} polygon 
     * 
     * @memberof NavPoly
     */
    function NavPoly(game, id, polygon) {
        _classCallCheck(this, NavPoly);

        this.game = game;
        this.id = id;
        this.polygon = polygon;
        this.edges = this._calculateEdges();
        this.neighbors = [];
        this.portals = [];
        this.centroid = this._calculateCentroid();
        this.boundingRadius = this._calculateRadius();

        this.weight = 1; // jsastar property

        var i = this.id % palette.length;
        this._color = palette[i];
    }

    _createClass(NavPoly, [{
        key: "constains",
        value: function constains(point) {
            return this.polygon.contains(point.x, point.y);
        }
    }, {
        key: "destroy",
        value: function destroy() {
            this.game = null;
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
    }, {
        key: "_calculateEdges",
        value: function _calculateEdges() {
            var points = this.polygon.points;
            var edges = [];
            for (var i = 1; i < points.length; i++) {
                var p1 = points[i - 1];
                var p2 = points[i];
                edges.push(new Phaser.Line(p1.x, p1.y, p2.x, p2.y));
            }
            var first = points[0];
            var last = points[points.length - 1];
            edges.push(new Phaser.Line(first.x, first.y, last.x, last.y));
            return edges;
        }
    }, {
        key: "_calculateCentroid",
        value: function _calculateCentroid() {
            // NOTE: this is not actually the centroid, it's the average of the vertices - not the same
            // thing!
            var centroid = new Phaser.Point(0, 0);
            var length = this.polygon.points.length;
            var _iteratorNormalCompletion = true;
            var _didIteratorError = false;
            var _iteratorError = undefined;

            try {
                for (var _iterator = this.polygon.points[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                    var point = _step.value;

                    centroid.add(point.x, point.y);
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

            centroid.divide(length, length);
            return centroid;
        }
    }, {
        key: "_calculateRadius",
        value: function _calculateRadius() {
            var boundingRadius = 0;
            var _iteratorNormalCompletion2 = true;
            var _didIteratorError2 = false;
            var _iteratorError2 = undefined;

            try {
                for (var _iterator2 = this.polygon.points[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                    var point = _step2.value;

                    var d = this.centroid.distance(point);
                    if (d > boundingRadius) boundingRadius = d;
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

            return boundingRadius;
        }

        /**
         * Draw the polygon to given graphics object
         * 
         * @param {Phaser.Graphics} graphics 
         * @param {boolean} [drawCentroid=true] Show the approx centroid
         * @param {boolean} [drawBounds=false] Show the bounding radius
         * @param {boolean} [drawNeighbors=true] Show the connections to neighbors
         * @param {boolean} [drawPortals=true] Show the portal edges
         * 
         * @memberof NavPoly
         */

    }, {
        key: "draw",
        value: function draw(graphics) {
            var drawCentroid = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;
            var drawBounds = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;
            var drawNeighbors = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : true;
            var drawPortals = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : true;

            graphics.lineWidth = 0;
            graphics.beginFill(this._color);
            graphics.drawPolygon(this.polygon);
            graphics.endFill();

            if (drawCentroid) {
                graphics.beginFill(0x000000);
                graphics.drawEllipse(this.centroid.x, this.centroid.y, 4, 4);
                graphics.endFill();
            }

            if (drawBounds) {
                graphics.lineStyle(1, 0xFFFFFF);
                var r = this.boundingRadius;
                graphics.drawEllipse(this.centroid.x, this.centroid.y, r, r);
            }

            if (drawNeighbors) {
                graphics.lineStyle(2, 0x000000);
                var _iteratorNormalCompletion3 = true;
                var _didIteratorError3 = false;
                var _iteratorError3 = undefined;

                try {
                    for (var _iterator3 = this.neighbors[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
                        var n = _step3.value;

                        graphics.moveTo(this.centroid.x, this.centroid.y);
                        graphics.lineTo(n.centroid.x, n.centroid.y);
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

            if (drawPortals) {
                graphics.lineStyle(10, 0x000000);
                var _iteratorNormalCompletion4 = true;
                var _didIteratorError4 = false;
                var _iteratorError4 = undefined;

                try {
                    for (var _iterator4 = this.portals[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
                        var p = _step4.value;

                        graphics.moveTo(p.start.x, p.start.y);
                        graphics.lineTo(p.end.x, p.end.y);
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
        }
    }]);

    return NavPoly;
}();

/* harmony default export */ __webpack_exports__["a"] = (NavPoly);

/***/ })
/******/ ]);
});
//# sourceMappingURL=phaser-navmesh-plugin.js.map