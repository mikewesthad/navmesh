// Modified DefinitelyTyped definitions for javascript-astar. The original ones did not play nicely
// with importing it as a module.

declare module "javascript-astar" {
  interface GridNode {
    x: number;
    y: number;
    weight: number;
    toString(): string;
    getCost(node: GridNode): number;
    isWall(): boolean;
  }

  interface PointLike {
    x: number;
    y: number;
  }

  interface Heuristic {
    (pos0: any, pos1: any): number;
  }

  export class Graph<NodeType extends GridNode> {
    grid: Array<Array<NodeType>>;
    constructor(grid: Array<Array<number>>, options?: { diagonal?: boolean });

    init(): void;
    cleanDirty(): void;
    markDirty(): void;
    neighbors(node: NodeType): NodeType[];
    toString(): string;
  }

  export namespace astar {
    function search<NodeType>(
      graph: Graph<NodeType>,
      start: { x: number; y: number },
      end: { x: number; y: number },
      options?: {
        closest?: boolean;
        heuristic?: Heuristic;
      }
    ): Array<NodeType>;

    var heuristics: {
      manhattan: Heuristic;
      diagonal: Heuristic;
    };
  }
}
