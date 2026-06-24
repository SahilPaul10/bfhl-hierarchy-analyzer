import { useState } from "react";
import axios from "axios";
import { FaProjectDiagram, FaTree, FaSyncAlt } from "react-icons/fa";
import "./App.css";

function App() {
const [input, setInput] = useState("");
const [response, setResponse] = useState(null);
const [loading, setLoading] = useState(false);

const loadSample = () => {
setInput(`A->B
A->C
B->D
C->E
E->F
X->Y
Y->Z
Z->X
P->Q
Q->R
G->H
G->H
G->I
hello
1->2
A->`);
};

const handleSubmit = async () => {
try {
setLoading(true);


  const dataArray = input
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean);

  const res = await axios.post(
    "http://localhost:3000/bfhl",
    {
      data: dataArray,
    }
  );

  setResponse(res.data);
} catch (err) {
  console.error(err);
  alert("API Request Failed");
} finally {
  setLoading(false);
}

};

return ( <div className="container"> <div className="hero"> <FaProjectDiagram className="hero-icon" /> <h1>BFHL Hierarchy Analyzer</h1> <p>
Analyze Trees, Detect Cycles and Visualize
Graph Structures </p> </div>


  <div className="glass input-section">
    <h2>Input Nodes</h2>

    <textarea
      rows="10"
      value={input}
      onChange={(e) => setInput(e.target.value)}
      placeholder="Enter one node relation per line..."
    />

    <div className="btn-group">
      <button onClick={loadSample}>
        Load Sample
      </button>

      <button onClick={handleSubmit}>
        {loading ? "Analyzing..." : "Analyze"}
      </button>
    </div>
  </div>

  {response && (
    <>
      <div className="stats">
        <div className="card">
          <FaTree />
          <h3>Trees</h3>
          <p>{response.summary.total_trees}</p>
        </div>

        <div className="card">
          <FaSyncAlt />
          <h3>Cycles</h3>
          <p>{response.summary.total_cycles}</p>
        </div>

        <div className="card">
          <FaProjectDiagram />
          <h3>Largest Root</h3>
          <p>{response.summary.largest_tree_root}</p>
        </div>
      </div>

      <div className="results">
        {response.hierarchies.map((item, index) => (
          <div className="glass hierarchy-card" key={index}>
            <h2>Root: {item.root}</h2>

            {item.has_cycle ? (
              <span className="cycle-badge">
                Cycle Detected
              </span>
            ) : (
              <>
                <span className="tree-badge">
                  Valid Tree
                </span>

                <p>
                  Depth: {item.depth}
                </p>
              </>
            )}
          </div>
        ))}
      </div>

      <div className="bottom-grid">
        <div className="glass">
          <h3>Invalid Entries</h3>

          <ul>
            {response.invalid_entries.map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ul>
        </div>

        <div className="glass">
          <h3>Duplicate Edges</h3>

          <ul>
            {response.duplicate_edges.map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ul>
        </div>
      </div>

      <details className="glass raw-json">
        <summary>
          View Raw Response
        </summary>

        <pre>
          {JSON.stringify(response, null, 2)}
        </pre>
      </details>
    </>
  )}
</div>


);
}

export default App;
