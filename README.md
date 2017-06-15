# Navigation Meshes in Phaser

In progress. A Phaser plugin for fast path-finding using navigation meshes.

The current path-finding plugins for Phaser use A* on the tiles in a tilemap. If you have a 50 x 50 tilemap, that's 2500 nodes in the A* graph.

This plugin uses navigation meshes to simplify that A* search. Instead of using tiles in a tilemap, it uses a mesh (currently quads) to describe the walkable areas within a map. This can lead to significant improvements in performance (e.g. >100x times faster than Phaser's A* plugin on long paths).

## Temporary Performance Comparison

TODO: make this more readable and add interactive demo

Comparing this plugin against [Phaser's A* plugin](https://github.com/photonstorm/phaser-plugins) and the JS lib [EasyStar.js](https://github.com/prettymuchbryce/easystarjs):

```
Performance Comparison, 100000 iterations, 30x30 tilemap

Short paths (150 - 500 pixel length)

    Average time per iteration:
        AStart Plugin: 0.02470ms
        EasyStar Plugin: 0.02876ms
        NavMesh Plugin: 0.00575ms
    
    Comparison:
        NavMesh is 4.30x faster than Phaser AStar
        NavMesh is 5.00x faster than EasyStar

Long paths (600 pixels and greater length), average time per iteration:

    Average time per iteration:
        AStart Plugin: 1.38710ms
        EasyStar Plugin: 0.15977ms
        NavMesh Plugin: 0.00738ms
    
    Comparison:
        NavMesh is 187.95x faster than Phaser AStar
        NavMesh is 21.65x faster than EasyStar
```

## TODO

- Add tests vs Phaser astar plugin 
- Documentation
    - Better JSDoc coverage
    - Describe the Tiled process. Adding an object layer, setting snapping, making sure vertices overlap...
- Example usage
- Allow non-square navmesh from Tiled - any convex shape
- Custom export that attaches to Phaser game object or exports as a local
- Reimplement the autotessalation version of the lib
    - Try libtess in quad mode
- The astar heuristic & cost functions need another pass. They don't always produce the shortest path. Implement incomplete funneling while building the astar path?
- The navmesh assumes any polygon can reach any other polygon. This probably should be extended to put connected polygons into groups like patroljs.
- There are probably optimization tricks to do when dealing with certain types of shapes. E.g. we are using axis-aligned boxes for the polygons and it is dead simple to calculate if a point is inside one of those...
- Investigate [Points-of-Visibility](http://www.david-gouveia.com/portfolio/pathfinding-on-a-2d-polygonal-map/) pathfinding to compare speed
- Using ES6 is probably suboptimal for performance

## References

Sources while building this plugin:

- Inspired by [PatrolJS](https://github.com/nickjanssen/PatrolJS), an implementation of navmeshes for threejs
- Navmesh path-finding algorithm explanations:
    - [Game Path Planning by Julian Ceipek](http://jceipek.com/Olin-Coding-Tutorials/pathing.html)
    - [Simple Stupid Funnel Algorithm](http://digestingduck.blogspot.com/2010/03/simple-stupid-funnel-algorithm.html)
- [Advice on astar heuristics](http://theory.stanford.edu/~amitp/GameProgramming/Heuristics.html)