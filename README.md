# Navigation Meshes in Phaser

In progress.

A Phaser plugin for fast path-finding using navigation meshes.

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

## References

Sources while building this plugin:

- Inspired by [PatrolJS](https://github.com/nickjanssen/PatrolJS), an implementation of navmeshes for threejs
- Navmesh path-finding algorithm explanations:
    - [Game Path Planning by Julian Ceipek](http://jceipek.com/Olin-Coding-Tutorials/pathing.html)
    - [Simple Stupid Funnel Algorithm](http://digestingduck.blogspot.com/2010/03/simple-stupid-funnel-algorithm.html)
- [Advice on astar heuristics](http://theory.stanford.edu/~amitp/GameProgramming/Heuristics.html)