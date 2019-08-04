(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define([], factory);
	else if(typeof exports === 'object')
		exports["Phaser2NavMeshPlugin"] = factory();
	else
		root["Phaser2NavMeshPlugin"] = factory();
})(window, function() {
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
/******/ 	return __webpack_require__(__webpack_require__.s = 1);
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
  if ( true && typeof module.exports === 'object') {
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
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);

// EXTERNAL MODULE: D:/GitHub/navmesh/node_modules/javascript-astar/astar.js
var astar = __webpack_require__(0);
var astar_default = /*#__PURE__*/__webpack_require__.n(astar);

// CONCATENATED MODULE: D:/GitHub/navmesh/packages/navmesh/src/math/vector-2.js
/**
 * Stripped down version of Phaser's Vector2 with just the functionality needed for navmeshes
 *
 * @export
 * @class Vector2
 */
class Vector2 {
  constructor(x, y) {
    this.x = x || 0;
    this.y = y || 0;
  }

  equals(v) {
    return this.x === v.x && this.y === v.y;
  }

  angle(v) {
    return Math.atan2(v.y - this.y, v.x - this.x);
  }

  distance(v) {
    const dx = v.x - this.x;
    const dy = v.y - this.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  add(v) {
    this.x += v.x;
    this.y += v.y;
  }

  subtract(v) {
    this.x -= v.x;
    this.y -= v.y;
  }

  clone() {
    return new Vector2(this.x, this.y);
  }

}
// CONCATENATED MODULE: D:/GitHub/navmesh/packages/navmesh/src/navpoly.js

/**
 * A class that represents a navigable polygon with a navmesh. It is built on top of a
 * {@link Polygon}. It implements the properties and fields that javascript-astar needs - weight,
 * toString, isWall and getCost. See GPS test from astar repo for structure:
 * https://github.com/bgrins/javascript-astar/blob/master/test/tests.js
 *
 * @class NavPoly
 */

class navpoly_NavPoly {
  /**
   * Creates an instance of NavPoly.
   * @param {number} id
   * @param {Polygon} polygon
   *
   * @memberof NavPoly
   */
  constructor(id, polygon) {
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


  getPoints() {
    return this.polygon.points;
  }
  /**
   * Check if the given point-like object is within the polygon
   *
   * @param {object} point Object of the form {x, y}
   * @returns {boolean}
   * @memberof NavPoly
   */


  contains(point) {
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


  calculateCentroid() {
    const centroid = new Vector2(0, 0);
    const length = this.polygon.points.length;
    this.polygon.points.forEach(p => centroid.add(p));
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


  calculateRadius() {
    let boundingRadius = 0;

    for (const point of this.polygon.points) {
      const d = this.centroid.distance(point);
      if (d > boundingRadius) boundingRadius = d;
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


  isPointOnEdge({
    x,
    y
  }) {
    for (const edge of this.edges) {
      if (edge.pointOnSegment(x, y)) return true;
    }

    return false;
  }

  destroy() {
    this.neighbors = [];
    this.portals = [];
  } // jsastar methods


  toString() {
    return `NavPoly(id: ${this.id} at: ${this.centroid})`;
  }

  isWall() {
    return this.weight === 0;
  }

  centroidDistance(navPolygon) {
    return this.centroid.distance(navPolygon.centroid);
  }

  getCost(navPolygon) {
    return this.centroidDistance(navPolygon);
  }

}
// CONCATENATED MODULE: D:/GitHub/navmesh/packages/navmesh/src/navgraph.js

/**
 * Graph for javascript-astar. It implements the functionality for astar. See GPS test from astar
 * repo for structure: https://github.com/bgrins/javascript-astar/blob/master/test/tests.js
 *
 * @class NavGraph
 * @private
 */

class NavGraph {
  constructor(navPolygons) {
    this.nodes = navPolygons;
    this.init();
  }

  neighbors(navPolygon) {
    return navPolygon.neighbors;
  }

  navHeuristic(navPolygon1, navPolygon2) {
    return navPolygon1.centroidDistance(navPolygon2);
  }

  destroy() {
    this.cleanDirty();
    this.nodes = [];
  }

}

NavGraph.prototype.init = astar_default.a.Graph.prototype.init;
NavGraph.prototype.cleanDirty = astar_default.a.Graph.prototype.cleanDirty;
NavGraph.prototype.markDirty = astar_default.a.Graph.prototype.markDirty;
/* harmony default export */ var navgraph = (NavGraph);
// CONCATENATED MODULE: D:/GitHub/navmesh/packages/navmesh/src/utils.js
/**
 * Twice the area of the triangle formed by a, b and c
 * @returns {number}
 * @private
 */
function triarea2(a, b, c) {
  const ax = b.x - a.x;
  const ay = b.y - a.y;
  const bx = c.x - a.x;
  const by = c.y - a.y;
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

function almostEqual(value1, value2, errorMargin = 0.0001) {
  if (Math.abs(value1 - value2) <= errorMargin) return true;else return false;
}
/**
 * Find the smallest angle difference between two angles
 * https://gist.github.com/Aaronduino/4068b058f8dbc34b4d3a9eedc8b2cbe0
 * @returns {number}
 * @private
 */

function angleDifference(x, y) {
  let a = x - y;
  const i = a + Math.PI;
  const j = Math.PI * 2;
  a = i - Math.floor(i / j) * j; // (a+180) % 360; this ensures the correct sign

  a -= Math.PI;
  return a;
}
/**
 * Check if two lines are collinear (within a marign)
 * @returns {boolean}
 * @private
 */

function areCollinear(line1, line2, errorMargin = 0.0001) {
  // Figure out if the two lines are equal by looking at the area of the triangle formed
  // by their points
  const area1 = triarea2(line1.start, line1.end, line2.start);
  const area2 = triarea2(line1.start, line1.end, line2.end);

  if (almostEqual(area1, 0, errorMargin) && almostEqual(area2, 0, errorMargin)) {
    return true;
  } else return false;
}
// CONCATENATED MODULE: D:/GitHub/navmesh/packages/navmesh/src/channel.js
// Mostly sourced from PatrolJS at the moment. TODO: come back and reimplement this as an incomplete
// funnel algorithm so astar checks can be more accurate.

/**
 * @private
 */

class channel_Channel {
  constructor() {
    this.portals = [];
  }

  push(p1, p2 = null) {
    if (p2 === null) p2 = p1;
    this.portals.push({
      left: p1,
      right: p2
    });
  }

  stringPull() {
    var portals = this.portals;
    var pts = []; // Init scan state

    var portalApex, portalLeft, portalRight;
    var apexIndex = 0,
        leftIndex = 0,
        rightIndex = 0;
    portalApex = portals[0].left;
    portalLeft = portals[0].left;
    portalRight = portals[0].right; // Add start point.

    pts.push(portalApex);

    for (var i = 1; i < portals.length; i++) {
      // Find the next portal vertices
      var left = portals[i].left;
      var right = portals[i].right; // Update right vertex.

      if (triarea2(portalApex, portalRight, right) <= 0.0) {
        if (portalApex.equals(portalRight) || triarea2(portalApex, portalLeft, right) > 0.0) {
          // Tighten the funnel.
          portalRight = right;
          rightIndex = i;
        } else {
          // Right vertex just crossed over the left vertex, so the left vertex should
          // now be part of the path.
          pts.push(portalLeft); // Restart scan from portal left point.
          // Make current left the new apex.

          portalApex = portalLeft;
          apexIndex = leftIndex; // Reset portal

          portalLeft = portalApex;
          portalRight = portalApex;
          leftIndex = apexIndex;
          rightIndex = apexIndex; // Restart scan

          i = apexIndex;
          continue;
        }
      } // Update left vertex.


      if (triarea2(portalApex, portalLeft, left) >= 0.0) {
        if (portalApex.equals(portalLeft) || triarea2(portalApex, portalRight, left) < 0.0) {
          // Tighten the funnel.
          portalLeft = left;
          leftIndex = i;
        } else {
          // Left vertex just crossed over the right vertex, so the right vertex should
          // now be part of the path
          pts.push(portalRight); // Restart scan from portal right point.
          // Make current right the new apex.

          portalApex = portalRight;
          apexIndex = rightIndex; // Reset portal

          portalLeft = portalApex;
          portalRight = portalApex;
          leftIndex = apexIndex;
          rightIndex = apexIndex; // Restart scan

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

}

/* harmony default export */ var src_channel = (channel_Channel);
// CONCATENATED MODULE: D:/GitHub/navmesh/packages/navmesh/src/math/line.js

/**
 * Stripped down version of Phaser's Line with just the functionality needed for navmeshes
 *
 * @export
 * @class Line
 */

class line_Line {
  constructor(x1, y1, x2, y2) {
    this.start = new Vector2(x1, y1);
    this.end = new Vector2(x2, y2);
    this.left = Math.min(x1, x2);
    this.right = Math.max(x1, x2);
    this.top = Math.min(y1, y2);
    this.bottom = Math.max(y1, y2);
  }

  pointOnSegment(x, y) {
    return x >= this.left && x <= this.right && y >= this.top && y <= this.bottom && this.pointOnLine(x, y);
  }

  pointOnLine(x, y) {
    // Compare slope of line start -> xy to line start -> line end
    return (x - this.left) * (this.bottom - this.top) === (this.right - this.left) * (y - this.top);
  }

}
// CONCATENATED MODULE: D:/GitHub/navmesh/packages/navmesh/src/math/polygon.js

/**
 * Stripped down version of Phaser's Polygon with just the functionality needed for navmeshes
 *
 * @export
 * @class Polygon
 */

class polygon_Polygon {
  constructor(points, closed = true) {
    this.points = points;
    this.edges = [];

    for (let i = 1; i < points.length; i++) {
      const p1 = points[i - 1];
      const p2 = points[i];
      this.edges.push(new line_Line(p1.x, p1.y, p2.x, p2.y));
    }

    if (closed) {
      const first = points[0];
      const last = points[points.length - 1];
      this.edges.push(new line_Line(first.x, first.y, last.x, last.y));
    }
  }

  contains(x, y) {
    let inside = false;

    for (let i = -1, j = this.points.length - 1; ++i < this.points.length; j = i) {
      const ix = this.points[i].x;
      const iy = this.points[i].y;
      const jx = this.points[j].x;
      const jy = this.points[j].y;

      if ((iy <= y && y < jy || jy <= y && y < iy) && x < (jx - ix) * (y - iy) / (jy - iy) + ix) {
        inside = !inside;
      }
    }

    return inside;
  }

}
// CONCATENATED MODULE: D:/GitHub/navmesh/packages/navmesh/src/navmesh.js








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

class navmesh_NavMesh {
  /**
   * Creates an instance of NavMesh.
   * @param {object[][]} meshPolygonPoints Array where each element is an array of point-like
   * objects that defines a polygon.
   * @param {number} [meshShrinkAmount=0] The amount (in pixels) that the navmesh has been
   * shrunk around obstacles (a.k.a the amount obstacles have been expanded)
   * @memberof NavMesh
   */
  constructor(meshPolygonPoints, meshShrinkAmount = 0) {
    this._meshShrinkAmount = meshShrinkAmount;
    const newPolys = meshPolygonPoints.map(polyPoints => {
      const vectors = polyPoints.map(p => new Vector2(p.x, p.y));
      return new polygon_Polygon(vectors);
    });
    this._navPolygons = newPolys.map((polygon, i) => new navpoly_NavPoly(i, polygon));

    this._calculateNeighbors(); // Astar graph of connections between polygons


    this._graph = new navgraph(this._navPolygons);
  }
  /**
   * Get the NavPolys that are in this navmesh.
   *
   * @returns {NavPoly[]}
   * @memberof NavMesh
   */


  getPolygons() {
    return this._navPolygons;
  }
  /**
   * Cleanup method to remove references.
   *
   * @memberof NavMesh
   */


  destroy() {
    this._graph.destroy();

    for (const poly of this._navPolygons) poly.destroy();

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


  findPath(startPoint, endPoint) {
    let startPoly = null;
    let endPoly = null;
    let startDistance = Number.MAX_VALUE;
    let endDistance = Number.MAX_VALUE;
    let d, r;
    const startVector = new Vector2(startPoint.x, startPoint.y);
    const endVector = new Vector2(endPoint.x, endPoint.y); // Find the closest poly for the starting and ending point

    for (const navPoly of this._navPolygons) {
      r = navPoly.boundingRadius; // Start

      d = navPoly.centroid.distance(startVector);

      if (d <= startDistance && d <= r && navPoly.contains(startVector)) {
        startPoly = navPoly;
        startDistance = d;
      } // End


      d = navPoly.centroid.distance(endVector);

      if (d <= endDistance && d <= r && navPoly.contains(endVector)) {
        endPoly = navPoly;
        endDistance = d;
      }
    } // If the start point wasn't inside a polygon, run a more liberal check that allows a point
    // to be within meshShrinkAmount radius of a polygon


    if (!startPoly && this._meshShrinkAmount > 0) {
      for (const navPoly of this._navPolygons) {
        // Check if point is within bounding circle to avoid extra projection calculations
        r = navPoly.boundingRadius + this._meshShrinkAmount;
        d = navPoly.centroid.distance(startVector);

        if (d <= r) {
          // Check if projected point is within range of a polgyon and is closer than the
          // previous point
          const {
            distance
          } = this._projectPointToPolygon(startVector, navPoly);

          if (distance <= this._meshShrinkAmount && distance < startDistance) {
            startPoly = navPoly;
            startDistance = distance;
          }
        }
      }
    } // Same check as above, but for the end point


    if (!endPoly && this._meshShrinkAmount > 0) {
      for (const navPoly of this._navPolygons) {
        r = navPoly.boundingRadius + this._meshShrinkAmount;
        d = navPoly.centroid.distance(endVector);

        if (d <= r) {
          const {
            distance
          } = this._projectPointToPolygon(endVector, navPoly);

          if (distance <= this._meshShrinkAmount && distance < endDistance) {
            endPoly = navPoly;
            endDistance = distance;
          }
        }
      }
    } // No matching polygons locations for the start or end, so no path found


    if (!startPoly || !endPoly) return null; // If the start and end polygons are the same, return a direct path

    if (startPoly === endPoly) return [startVector, endVector]; // Search!

    const astarPath = astar_default.a.astar.search(this._graph, startPoly, endPoly, {
      heuristic: this._graph.navHeuristic
    }); // While the start and end polygons may be valid, no path between them

    if (astarPath.length === 0) return null; // jsastar drops the first point from the path, but the funnel algorithm needs it

    astarPath.unshift(startPoly); // We have a path, so now time for the funnel algorithm

    const channel = new src_channel();
    channel.push(startVector);

    for (let i = 0; i < astarPath.length - 1; i++) {
      const navPolygon = astarPath[i];
      const nextNavPolygon = astarPath[i + 1]; // Find the portal

      let portal = null;

      for (let i = 0; i < navPolygon.neighbors.length; i++) {
        if (navPolygon.neighbors[i].id === nextNavPolygon.id) {
          portal = navPolygon.portals[i];
        }
      } // Push the portal vertices into the channel


      channel.push(portal.start, portal.end);
    }

    channel.push(endVector); // Pull a string along the channel to run the funnel

    channel.stringPull(); // Clone path, excluding duplicates

    let lastPoint = null;
    const phaserPath = [];

    for (const p of channel.path) {
      const newPoint = p.clone();
      if (!lastPoint || !newPoint.equals(lastPoint)) phaserPath.push(newPoint);
      lastPoint = newPoint;
    }

    return phaserPath;
  }

  _calculateNeighbors() {
    // Fill out the neighbor information for each navpoly
    for (let i = 0; i < this._navPolygons.length; i++) {
      const navPoly = this._navPolygons[i];

      for (let j = i + 1; j < this._navPolygons.length; j++) {
        const otherNavPoly = this._navPolygons[j]; // Check if the other navpoly is within range to touch

        const d = navPoly.centroid.distance(otherNavPoly.centroid);
        if (d > navPoly.boundingRadius + otherNavPoly.boundingRadius) continue; // The are in range, so check each edge pairing

        for (const edge of navPoly.edges) {
          for (const otherEdge of otherNavPoly.edges) {
            // If edges aren't collinear, not an option for connecting navpolys
            if (!areCollinear(edge, otherEdge)) continue; // If they are collinear, check if they overlap

            const overlap = this._getSegmentOverlap(edge, otherEdge);

            if (!overlap) continue; // Connections are symmetric!

            navPoly.neighbors.push(otherNavPoly);
            otherNavPoly.neighbors.push(navPoly); // Calculate the portal between the two polygons - this needs to be in
            // counter-clockwise order, relative to each polygon

            const [p1, p2] = overlap;
            let edgeStartAngle = navPoly.centroid.angle(edge.start);
            let a1 = navPoly.centroid.angle(overlap[0]);
            let a2 = navPoly.centroid.angle(overlap[1]);
            let d1 = angleDifference(edgeStartAngle, a1);
            let d2 = angleDifference(edgeStartAngle, a2);

            if (d1 < d2) {
              navPoly.portals.push(new line_Line(p1.x, p1.y, p2.x, p2.y));
            } else {
              navPoly.portals.push(new line_Line(p2.x, p2.y, p1.x, p1.y));
            }

            edgeStartAngle = otherNavPoly.centroid.angle(otherEdge.start);
            a1 = otherNavPoly.centroid.angle(overlap[0]);
            a2 = otherNavPoly.centroid.angle(overlap[1]);
            d1 = angleDifference(edgeStartAngle, a1);
            d2 = angleDifference(edgeStartAngle, a2);

            if (d1 < d2) {
              otherNavPoly.portals.push(new line_Line(p1.x, p1.y, p2.x, p2.y));
            } else {
              otherNavPoly.portals.push(new line_Line(p2.x, p2.y, p1.x, p1.y));
            } // Two convex polygons shouldn't be connected more than once! (Unless
            // there are unnecessary vertices...)

          }
        }
      }
    }
  } // Check two collinear line segments to see if they overlap by sorting the points.
  // Algorithm source: http://stackoverflow.com/a/17152247


  _getSegmentOverlap(line1, line2) {
    const points = [{
      line: line1,
      point: line1.start
    }, {
      line: line1,
      point: line1.end
    }, {
      line: line2,
      point: line2.start
    }, {
      line: line2,
      point: line2.end
    }];
    points.sort(function (a, b) {
      if (a.point.x < b.point.x) return -1;else if (a.point.x > b.point.x) return 1;else {
        if (a.point.y < b.point.y) return -1;else if (a.point.y > b.point.y) return 1;else return 0;
      }
    }); // If the first two points in the array come from the same line, no overlap

    const noOverlap = points[0].line === points[1].line; // If the two middle points in the array are the same coordinates, then there is a
    // single point of overlap.

    const singlePointOverlap = points[1].point.equals(points[2].point);
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


  _projectPointToPolygon(point, navPoly) {
    let closestProjection = null;
    let closestDistance = Number.MAX_VALUE;

    for (const edge of navPoly.edges) {
      const projectedPoint = this._projectPointToEdge(point, edge);

      const d = point.distance(projectedPoint);

      if (closestProjection === null || d < closestDistance) {
        closestDistance = d;
        closestProjection = projectedPoint;
      }
    }

    return {
      point: closestProjection,
      distance: closestDistance
    };
  }

  _distanceSquared(a, b) {
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    return dx * dx + dy * dy;
  } // Project a point onto a line segment
  // JS Source: http://stackoverflow.com/questions/849211/shortest-distance-between-a-point-and-a-line-segment


  _projectPointToEdge(point, line) {
    const a = line.start;
    const b = line.end; // Consider the parametric equation for the edge's line, p = a + t (b - a). We want to find
    // where our point lies on the line by solving for t:
    //  t = [(p-a) . (b-a)] / |b-a|^2

    const l2 = this._distanceSquared(a, b);

    let t = ((point.x - a.x) * (b.x - a.x) + (point.y - a.y) * (b.y - a.y)) / l2; // We clamp t from [0,1] to handle points outside the segment vw.

    t = clamp(t, 0, 1); // Project onto the segment

    const p = new Vector2(a.x + t * (b.x - a.x), a.y + t * (b.y - a.y));
    return p;
  }

}
// CONCATENATED MODULE: D:/GitHub/navmesh/packages/navmesh/src/index.js

/* harmony default export */ var src = (navmesh_NavMesh);
// CONCATENATED MODULE: ./phaser2-navmesh.js
 // import the source - not the dist - no need to double build

/**
 * A wrapper around {@link NavMesh} for Phaser 2 / Phaser CE. Create instances of this class from
 * {@link Phaser2NavMeshPlugin}. This is the workhorse that represents a navigation mesh built from
 * a series of polygons. Once built, the mesh can be asked for a path from one point to another
 * point.
 *
 * Compared to {@link NavMesh}, this adds visual debugging capabilities and converts paths to
 * Phaser-compatible point instances.
 *
 * @export
 * @class Phaser2NavMesh
 */

class phaser2_navmesh_Phaser2NavMesh {
  /**
   * Creates an instance of Phaser2NavMesh.
   * @param {Phaser2NavMeshPlugin} plugin The plugin that owns this mesh.
   * @param {string} key The key the mesh is stored under within the plugin.
   * @param {object[][]} meshPolygonPoints Array where each element is an array of point-like
   * objects that defines a polygon.
   * @param {number} [meshShrinkAmount=0] The amount (in pixels) that the navmesh has been shrunk
   * around obstacles (a.k.a the amount obstacles have been expanded)
   * @memberof Phaser2NavMesh
   */
  constructor(plugin, key, meshPolygonPoints, meshShrinkAmount = 0) {
    this.key = key;
    this.plugin = plugin;
    this.game = plugin.game;
    this.debugGraphics = null;
    this.navMesh = new src(meshPolygonPoints, meshShrinkAmount);
  }
  /**
   * See {@link NavMesh#findPath}. This implements the same functionality, except that the returned
   * path is converted to Phaser-compatible points.
   *
   * @param {object} startPoint A point-like object in the form {x, y}
   * @param {object} endPoint A point-like object in the form {x, y}
   * @param {class} [PointClass=Phaser.Geom.Point]
   * @returns {object[]|null} An array of points if a path is found, or null if no path
   * @memberof Phaser2NavMesh
   */


  findPath(startPoint, endPoint, PointClass = Phaser.Point) {
    const path = this.navMesh.findPath(startPoint, endPoint);
    return path ? path.map(({
      x,
      y
    }) => new PointClass(x, y)) : path;
  }
  /**
   * Enable the debug drawing graphics. If no graphics object is providied, a new instance will be
   * created.
   *
   * @param {Phaser.Graphics} [graphics] An optional graphics object for the mesh to use
   * for debug drawing. Note, the mesh will destroy this graphics object when the mesh is destroyed.
   * @returns {Phaser.Graphics} The graphics object this mesh uses.
   * @memberof Phaser2NavMesh
   */


  enableDebug(graphics) {
    if (!graphics && !this.debugGraphics) {
      this.debugGraphics = this.game.add.graphics();
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
   * @memberof Phaser2NavMesh
   */


  disableDebug() {
    if (this.debugGraphics) this.debugGraphics.visible = false;
  }
  /**
   * Returns true if the debug graphics object is enabled and visible.
   *
   * @returns {boolean}
   * @memberof Phaser2NavMesh
   */


  isDebugEnabled() {
    return this.debugGraphics && this.debugGraphics.visible;
  }
  /**
   * Clear the debug graphics.
   *
   * @memberof Phaser2NavMesh
   */


  debugDrawClear() {
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
   * @memberof Phaser2NavMesh
   */


  debugDrawMesh({
    drawCentroid = true,
    drawBounds = false,
    drawNeighbors = true,
    drawPortals = true,
    palette = [0x00a0b0, 0x6a4a3c, 0xcc333f, 0xeb6841, 0xedc951]
  } = {}) {
    if (!this.debugGraphics) return;
    const navPolys = this.navMesh.getPolygons();
    navPolys.forEach(poly => {
      const color = palette[poly.id % palette.length];
      this.debugGraphics.lineWidth = 0;
      this.debugGraphics.beginFill(color);
      this.debugGraphics.drawPolygon(new Phaser.Polygon(...poly.getPoints()));
      this.debugGraphics.endFill();

      if (drawCentroid) {
        this.debugGraphics.beginFill(0x000000);
        this.debugGraphics.drawEllipse(poly.centroid.x, poly.centroid.y, 4, 4);
        this.debugGraphics.endFill();
      }

      if (drawBounds) {
        this.debugGraphics.lineStyle(1, 0xffffff);
        const r = poly.boundingRadius;
        this.debugGraphics.drawEllipse(poly.centroid.x, poly.centroid.y, r, r);
      }

      if (drawNeighbors) {
        this.debugGraphics.lineStyle(2, 0x000000);
        poly.neighbors.forEach(n => {
          this.debugGraphics.moveTo(poly.centroid.x, poly.centroid.y);
          this.debugGraphics.lineTo(n.centroid.x, n.centroid.y);
        });
      }

      if (drawPortals) {
        this.debugGraphics.lineStyle(10, 0x000000);
        poly.portals.forEach(portal => {
          this.debugGraphics.moveTo(portal.start.x, portal.start.y);
          this.debugGraphics.lineTo(portal.end.x, portal.end.y);
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
   * @memberof Phaser2NavMesh
   */


  debugDrawPath(path, color = 0x00ff00, thickness = 10, alpha = 1) {
    if (!this.debugGraphics) return;

    if (path && path.length) {
      // Draw line for path
      this.debugGraphics.lineStyle(thickness, color, alpha);
      this.debugGraphics.drawShape(new Phaser.Polygon(...path)); // Draw circle at start and end of path

      this.debugGraphics.beginFill(color, alpha);
      const d = 0.5 * thickness;
      this.debugGraphics.drawEllipse(path[0].x, path[0].y, d, d);

      if (path.length > 1) {
        const lastPoint = path[path.length - 1];
        this.debugGraphics.drawEllipse(lastPoint.x, lastPoint.y, d, d);
      }

      this.debugGraphics.endFill();
    }
  }
  /**
   * Destroy the mesh, kill the debug graphic and unregister itself with the plugin.
   *
   * @memberof Phaser2NavMesh
   */


  destroy() {
    if (this.navMesh) this.navMesh.destroy();
    if (this.debugGraphics) this.debugGraphics.destroy();
    this.plugin.removeMesh(this.key);
    this.navMesh = undefined;
    this.debugGraphics = undefined;
    this.plugin = undefined;
    this.scene = undefined;
  }

}
// CONCATENATED MODULE: ./phaser2-navmesh-plugin.js

/**
 * This class can create navigation meshes for use in Phaser 2 / Phaser CE. (For Phaser 3, see
 * {@link PhaserNavMeshPlugin}.) The navmeshes can be constructed from convex polygons embedded in a
 * Tiled map. The class that conforms to Phaser 2's plugin structure.
 *
 * @export
 * @class Phaser2NavMeshPlugin
 */

class phaser2_navmesh_plugin_Phaser2NavMeshPlugin extends Phaser.Plugin {
  constructor(game, pluginManager) {
    super(game, pluginManager);
    this.phaserNavMeshes = {};
  }
  /**
   * Destroy all navmeshes created and the plugin itself
   *
   * @memberof Phaser2NavMeshPlugin
   */


  destroy() {
    const meshes = Object.values(this.phaserNavMeshes);
    this.phaserNavMeshes = {};
    meshes.forEach(m => m.destroy());
    this.game = undefined;
  }
  /**
   * Remove the navmesh stored under the given key from the plugin. This does not destroy the
   * navmesh.
   *
   * @param {string} key
   * @memberof Phaser2NavMeshPlugin
   */


  removeMesh(key) {
    if (this.phaserNavMeshes[key]) this.phaserNavMeshes[key] = undefined;
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
   * @returns {Phaser2NavMesh}
   * @memberof Phaser2NavMeshPlugin
   */


  buildMeshFromTiled(key, objectLayer, meshShrinkAmount = 0) {
    if (this.phaserNavMeshes[key]) {
      console.warn(`NavMeshPlugin: a navmesh already exists with the given key: ${key}`);
      return this.phaserNavMeshes[key];
    }

    if (!objectLayer || objectLayer.length === 0) {
      console.warn(`NavMeshPlugin: The given tilemap object layer is empty or undefined: ${objectLayer}`);
    } // Load up the object layer


    const objects = objectLayer || []; // Loop over the objects and construct a polygon - assumes a rectangle for now!
    // TODO: support layer position, scale, rotation

    const polygons = objects.map(obj => {
      const top = obj.y;
      const bottom = obj.y + obj.height;
      const left = obj.x;
      const right = obj.x + obj.width;
      return [{
        x: left,
        y: top
      }, {
        x: left,
        y: bottom
      }, {
        x: right,
        y: bottom
      }, {
        x: right,
        y: top
      }];
    });
    const mesh = new phaser2_navmesh_Phaser2NavMesh(this, key, polygons, meshShrinkAmount);
    this.phaserNavMeshes[key] = mesh;
    return mesh;
  }

}
// CONCATENATED MODULE: ./index.js
/* concated harmony reexport Phaser2NavMesh */__webpack_require__.d(__webpack_exports__, "Phaser2NavMesh", function() { return phaser2_navmesh_Phaser2NavMesh; });


/* harmony default export */ var index = __webpack_exports__["default"] = (phaser2_navmesh_plugin_Phaser2NavMeshPlugin);


/***/ })
/******/ ])["default"];
});
//# sourceMappingURL=phaser2-navmesh.js.map