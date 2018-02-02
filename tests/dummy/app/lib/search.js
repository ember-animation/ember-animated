/*
  A* search.

  initialState and goalState are state objects of your own devising. All state objects must support triple equality checks.

  transitions takes a state and returns a list of permissible new states.

  transitionCost takes two states and returns the cost of going from the first one to the second one.

  heuristic is a function that takes two states and returns a cost estimate for getting from the first to the second

  returns a list of states representing the best path from initialState to goalState
*/


export default function search(initialState, goalState, transitions, transitionCost, heuristic) {
  // points we've already evaluated
  let seen = new Set();

  // points remaining to be evaluated. a.k.a. the open set or fringe.
  // TODO: this could become a real priority queue for better efficiency
  let candidates = [initialState];

  // pointer from each point to the previous point from which it can
  // be most efficiently reached
  let cameFrom = new Map();

  // for each point, the measured cost of getting there from the start
  let pathCosts = new Map();
  pathCosts.set(initialState, 0);

  // for each point, the pathCost plus the heuristic cost for the
  // remainder of the way to the goal
  let scores = new Map();
  scores.set(initialState, heuristic(initialState, goalState));

  while (candidates.length > 0) {
    let current = takeBestScoringCandidate(candidates, scores);
    if (current === goalState) {
      return reconstructPath(cameFrom, current);
    }
    seen.add(current);
    let neighbors = transitions(current);
    for (let i = 0; i < neighbors.length; i++) {
      let neighbor = neighbors[i];
      if (seen.has(neighbor)) {
        continue;
      }
      if (!candidates.find(c => c === neighbor)) {
        candidates.push(neighbor);
      }
      let pathCost = pathCosts.get(current) + transitionCost(current, neighbor);
      let prevCost = pathCosts.get(neighbor);
      if (!prevCost || prevCost > pathCost) {
        pathCosts.set(neighbor, pathCost);
        cameFrom.set(neighbor, current);
        scores.set(neighbor, pathCost + heuristic(neighbor, goalState));
      }
    }
  }
}

function reconstructPath(cameFrom, current) {
  let path = [current];
  let pointer = current;
  while (cameFrom.has(pointer)) {
    pointer = cameFrom.get(pointer);
    path.push(pointer);
  }
  return path.reverse();
}

function takeBestScoringCandidate(candidates, scores) {
  let bestScore = Infinity;
  let bestCandidate;
  let bestIndex;
  for (let i = candidates.length - 1; i >= 0 ; i--) {
    let candidate = candidates[i];
    let score = scores.get(candidate);
    if (score < bestScore) {
      bestScore = score;
      bestCandidate = candidate;
      bestIndex = i;
    }
  }
  candidates.splice(bestIndex, 1);
  return bestCandidate;
}
