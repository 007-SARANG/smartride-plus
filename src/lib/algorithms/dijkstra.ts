// Dijkstra's Algorithm Implementation for Route Optimization
// Optimized for public transport with crowd and delay factors

interface Node {
  id: string;
  distance: number;
  previous: string | null;
}

interface Edge {
  to: string;
  distance: number;
  crowd: number;
  delay: number;
}

export class DijkstraGraph {
  private nodes: Map<string, Edge[]>;

  constructor() {
    this.nodes = new Map();
  }

  addNode(id: string): void {
    if (!this.nodes.has(id)) {
      this.nodes.set(id, []);
    }
  }

  addEdge(
    from: string,
    to: string,
    distance: number,
    crowd: number = 0,
    delay: number = 0
  ): void {
    if (!this.nodes.has(from)) {
      this.addNode(from);
    }
    if (!this.nodes.has(to)) {
      this.addNode(to);
    }

    // Add bidirectional edges
    this.nodes.get(from)!.push({ to, distance, crowd, delay });
    this.nodes.get(to)!.push({ to: from, distance, crowd, delay });
  }

  // Calculate weight with crowd and delay factors
  private calculateWeight(edge: Edge): number {
    // Weight formula: distance + (crowd_factor * 0.02) + (delay * 0.15)
    // This prioritizes routes with lower crowd and delays
    const crowdFactor = edge.crowd * 0.02;
    const delayFactor = edge.delay * 0.15;
    return edge.distance + crowdFactor + delayFactor;
  }

  shortestPath(
    start: string,
    end: string
  ): { path: string[]; distance: number } {
    const distances: Map<string, number> = new Map();
    const previous: Map<string, string | null> = new Map();
    const unvisited: Set<string> = new Set();

    // Initialize
    for (const node of this.nodes.keys()) {
      distances.set(node, Infinity);
      previous.set(node, null);
      unvisited.add(node);
    }
    distances.set(start, 0);

    while (unvisited.size > 0) {
      // Find node with minimum distance
      let current: string | null = null;
      let minDistance = Infinity;

      for (const node of unvisited) {
        const distance = distances.get(node)!;
        if (distance < minDistance) {
          minDistance = distance;
          current = node;
        }
      }

      if (current === null || current === end) {
        break;
      }

      unvisited.delete(current);

      // Update distances to neighbors
      const neighbors = this.nodes.get(current) || [];
      for (const edge of neighbors) {
        if (unvisited.has(edge.to)) {
          const weight = this.calculateWeight(edge);
          const newDistance = distances.get(current)! + weight;

          if (newDistance < distances.get(edge.to)!) {
            distances.set(edge.to, newDistance);
            previous.set(edge.to, current);
          }
        }
      }
    }

    // Reconstruct path
    const path: string[] = [];
    let current: string | null = end;

    while (current !== null) {
      path.unshift(current);
      current = previous.get(current) || null;
    }

    return {
      path: path.length > 0 && path[0] === start ? path : [],
      distance: distances.get(end) || Infinity,
    };
  }

  // A* variant for faster pathfinding (optional enhancement)
  aStarPath(
    start: string,
    end: string,
    heuristic: (a: string, b: string) => number
  ): { path: string[]; distance: number } {
    const openSet: Set<string> = new Set([start]);
    const cameFrom: Map<string, string> = new Map();
    const gScore: Map<string, number> = new Map();
    const fScore: Map<string, number> = new Map();

    // Initialize scores
    for (const node of this.nodes.keys()) {
      gScore.set(node, Infinity);
      fScore.set(node, Infinity);
    }
    gScore.set(start, 0);
    fScore.set(start, heuristic(start, end));

    while (openSet.size > 0) {
      // Find node with lowest fScore
      let current: string | null = null;
      let minScore = Infinity;

      for (const node of openSet) {
        const score = fScore.get(node)!;
        if (score < minScore) {
          minScore = score;
          current = node;
        }
      }

      if (current === end) {
        // Reconstruct path
        const path: string[] = [current];
        while (cameFrom.has(current!)) {
          current = cameFrom.get(current!)!;
          path.unshift(current);
        }
        return { path, distance: gScore.get(end)! };
      }

      if (current === null) break;

      openSet.delete(current);

      // Check neighbors
      const neighbors = this.nodes.get(current) || [];
      for (const edge of neighbors) {
        const tentativeGScore =
          gScore.get(current)! + this.calculateWeight(edge);

        if (tentativeGScore < gScore.get(edge.to)!) {
          cameFrom.set(edge.to, current);
          gScore.set(edge.to, tentativeGScore);
          fScore.set(edge.to, tentativeGScore + heuristic(edge.to, end));
          openSet.add(edge.to);
        }
      }
    }

    return { path: [], distance: Infinity };
  }
}

// Helper function to optimize route
export function optimizeRoute(
  stops: any[],
  crowdData: Map<string, number>,
  delayData: Map<string, number>
): string[] {
  const graph = new DijkstraGraph();

  // Add all stops as nodes
  stops.forEach((stop) => graph.addNode(stop.id));

  // Add edges between consecutive stops
  for (let i = 0; i < stops.length - 1; i++) {
    const from = stops[i].id;
    const to = stops[i + 1].id;
    const crowd = crowdData.get(to) || 0;
    const delay = delayData.get(to) || 0;
    
    // Calculate distance (simplified - in production use real geo distance)
    const distance = 1.0;
    
    graph.addEdge(from, to, distance, crowd, delay);
  }

  const result = graph.shortestPath(stops[0].id, stops[stops.length - 1].id);
  return result.path;
}
