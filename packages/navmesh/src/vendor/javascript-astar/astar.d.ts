// Adapted from NavMesh's previous javascript-astar ambient declaration.
interface GridNode {
  x: number;
  y: number;
  weight: number;
  toString(): string;
  getCost(node: GridNode): number;
  isWall(): boolean;
}

export class Graph<NodeType extends GridNode> {
  grid: NodeType[][];
  constructor(grid: number[][], options?: { diagonal?: boolean });

  init(): void;
  cleanDirty(): void;
  markDirty(node: NodeType): void;
  neighbors(node: NodeType): NodeType[];
  toString(): string;
}

export namespace astar {
  function search<NodeType extends GridNode>(
    graph: Graph<NodeType>,
    start: NodeType,
    end: NodeType,
    options?: {
      closest?: boolean;
      heuristic?: (start: NodeType, end: NodeType) => number;
    }
  ): NodeType[];
}
