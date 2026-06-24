function processGraphData(data) {
const invalid_entries = [];
const duplicate_edges = [];

const validEdges = [];
const seenEdges = new Set();
const duplicateTracker = new Set();

// -----------------------------
// Validation + Duplicate Check
// -----------------------------
for (let entry of data) {
const originalEntry = entry;
entry = entry.trim();

if (!/^[A-Z]->[A-Z]$/.test(entry)) {
  invalid_entries.push(originalEntry);
  continue;
}

const [parent, child] = entry.split("->");

if (parent === child) {
  invalid_entries.push(originalEntry);
  continue;
}

if (seenEdges.has(entry)) {
  if (!duplicateTracker.has(entry)) {
    duplicate_edges.push(entry);
    duplicateTracker.add(entry);
  }
  continue;
}

seenEdges.add(entry);
validEdges.push({ parent, child });


}

// -----------------------------
// Graph Build (First Parent Wins)
// -----------------------------
const graph = {};
const parentMap = {};
const allNodes = new Set();

for (const { parent, child } of validEdges) {
if (parentMap[child]) {
continue;
}


parentMap[child] = parent;

if (!graph[parent]) {
  graph[parent] = [];
}

graph[parent].push(child);

allNodes.add(parent);
allNodes.add(child);


}

// ensure every node exists
for (const node of allNodes) {
if (!graph[node]) {
graph[node] = [];
}
}

// -----------------------------
// Build Undirected Graph
// -----------------------------
const undirected = {};

for (const node of allNodes) {
undirected[node] = [];
}

for (const parent in graph) {
for (const child of graph[parent]) {
undirected[parent].push(child);
undirected[child].push(parent);
}
}

// -----------------------------
// Connected Components
// -----------------------------
const visited = new Set();
const groups = [];

for (const node of allNodes) {
if (visited.has(node)) continue
const component = [];
const stack = [node];

visited.add(node);

while (stack.length) {
  const current = stack.pop();
  component.push(current);

  for (const next of undirected[current]) {
    if (!visited.has(next)) {
      visited.add(next);
      stack.push(next);
    }
  }
}

groups.push(component.sort());


}

// -----------------------------
// Helpers
// -----------------------------
function detectCycle(root, componentSet) {
const state = {};


function dfs(node) {
  state[node] = 1;

  for (const child of graph[node] || []) {
    if (!componentSet.has(child)) continue;

    if (state[child] === 1) return true;

    if (!state[child]) {
      if (dfs(child)) return true;
    }
  }

  state[node] = 2;
  return false;
}

for (const node of componentSet) {
  if (!state[node]) {
    if (dfs(node)) return true;
  }
}

return false;


}

function buildTree(node) {
const children = {};


for (const child of graph[node] || []) {
  children[child] = buildTree(child);
}

return children;


}

function getDepth(node) {
const children = graph[node] || [];


if (children.length === 0) return 1;

let maxDepth = 0;

for (const child of children) {
  maxDepth = Math.max(maxDepth, getDepth(child));
}

return maxDepth + 1;


}

// -----------------------------
// Process Components
// -----------------------------
const hierarchies = [];

let total_trees = 0;
let total_cycles = 0;

let largestDepth = 0;
let largest_tree_root = "";

for (const component of groups) {
const componentSet = new Set(component);

const roots = component.filter(
  node => !parentMap[node]
);

let root;

if (roots.length > 0) {
  roots.sort();
  root = roots[0];
} else {
  root = [...component].sort()[0];
}

const hasCycle = detectCycle(root, componentSet);

if (hasCycle) {
  total_cycles++;

  hierarchies.push({
    root,
    tree: {},
    has_cycle: true
  });

  continue;
}

const tree = {};
tree[root] = buildTree(root);

const depth = getDepth(root);

total_trees++;

if (
  depth > largestDepth ||
  (
    depth === largestDepth &&
    (largest_tree_root === "" || root < largest_tree_root)
  )
) {
  largestDepth = depth;
  largest_tree_root = root;
}

hierarchies.push({
  root,
  tree,
  depth
});

}

return {
hierarchies,
invalid_entries,
duplicate_edges,
summary: {
total_trees,
total_cycles,
largest_tree_root
}
};
}

module.exports = processGraphData;
