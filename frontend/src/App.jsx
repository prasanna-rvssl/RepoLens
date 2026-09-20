import { useState } from "react";
import axios from "axios";
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  MarkerType,
  Handle,
  Position,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import "./App.css";

/* =========================================================
   REPO LENS LOGO
========================================================= */

function RepoLensLogo({ large = false }) {
  return (
    <div className={`brand ${large ? "brand-large" : ""}`}>
      <div className="logo-box">
        <svg
          viewBox="0 0 64 64"
          className="logo-svg"
          aria-hidden="true"
        >
          {/* Magnifying glass */}
          <circle
            cx="27"
            cy="27"
            r="16"
            fill="none"
            stroke="#1f2937"
            strokeWidth="4"
          />

          <line
            x1="39"
            y1="39"
            x2="51"
            y2="51"
            stroke="#1f2937"
            strokeWidth="5"
            strokeLinecap="round"
          />

          {/* Code brackets */}
          <path
            d="M21 21 L15 27 L21 33"
            fill="none"
            stroke="#1f2937"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          <path
            d="M33 21 L39 27 L33 33"
            fill="none"
            stroke="#1f2937"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Slash */}
          <line
            x1="29"
            y1="20"
            x2="25"
            y2="34"
            stroke="#1f2937"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
        </svg>
      </div>

      <div className="brand-text">
        <strong>RepoLens</strong>
        <span>Understand any codebase in minutes.</span>
      </div>
    </div>
  );
}

/* =========================================================
   FEATURE ICON
========================================================= */

function FeatureIcon({ type }) {
  if (type === "repo") {
    return (
      <svg viewBox="0 0 24 24">
        <path
          d="M4 5h6l2 3h8v11H4z"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinejoin="round"
        />
      </svg>
    );
  }

  if (type === "stack") {
    return (
      <svg viewBox="0 0 24 24">
        <path
          d="M12 3l9 5-9 5-9-5z"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinejoin="round"
        />

        <path
          d="M3 12l9 5 9-5"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        />

        <path
          d="M3 16l9 5 9-5"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24">
      <path
        d="M12 21s-8-4.8-8-11a4.5 4.5 0 018-2.7A4.5 4.5 0 0120 10c0 6.2-8 11-8 11z"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      />
    </svg>
  );
}

/* =========================================================
   SIDEBAR
========================================================= */

function Sidebar({
  page,
  setPage,
  resetAnalysis,
  mobileMenuOpen,
  setMobileMenuOpen,
}) {
  function navigate(nextPage) {
    setPage(nextPage);
    setMobileMenuOpen(false);
  }

  function analyzeAnother() {
    setMobileMenuOpen(false);
    resetAnalysis();
  }

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="sidebar">
        <RepoLensLogo />

        <div className="sidebar-divider" />

        <p className="sidebar-label">NAVIGATION</p>

        <button
          className={`nav-item ${page === "summary" ? "active" : ""}`}
          onClick={() => setPage("summary")}
        >
          <span className="nav-icon">✦</span>
          <span>Repository Analysis</span>
        </button>

        <button
          className={`nav-item ${page === "repomap" ? "active" : ""}`}
          onClick={() => setPage("repomap")}
        >
          <span className="nav-icon">⌘</span>
          <span>RepoMap</span>
        </button>

        <button
          className={`nav-item ${page === "stack" ? "active" : ""}`}
          onClick={() => setPage("stack")}
        >
          <span className="nav-icon">◇</span>
          <span>Tech Stack</span>
        </button>

        <button
          className={`nav-item ${page === "health" ? "active" : ""}`}
          onClick={() => setPage("health")}
        >
          <span className="nav-icon">♡</span>
          <span>Project Health</span>
        </button>

        <div className="sidebar-bottom">
          <button
            className="sidebar-bottom-item"
            onClick={resetAnalysis}
          >
            <span className="nav-icon">↻</span>
            <span>Analyze Another</span>
          </button>

          <div className="sidebar-version">v1.0</div>
        </div>
      </aside>

      {/* Mobile Navigation */}
      <div className="mobile-dashboard-nav">
        <div className="mobile-topbar">
          <RepoLensLogo />

          <button
            className="mobile-menu-btn"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle navigation"
          >
            {mobileMenuOpen ? "✕" : "☰"}
          </button>
        </div>

        {mobileMenuOpen && (
          <div className="mobile-nav-menu">
            <button
              className={page === "summary" ? "active" : ""}
              onClick={() => navigate("summary")}
            >
              <span>✦</span>
              Repository Analysis
            </button>

            <button
              className={page === "repomap" ? "active" : ""}
              onClick={() => navigate("repomap")}
            >
              <span>⌘</span>
              RepoMap
            </button>

            <button
              className={page === "stack" ? "active" : ""}
              onClick={() => navigate("stack")}
            >
              <span>◇</span>
              Tech Stack
            </button>

            <button
              className={page === "health" ? "active" : ""}
              onClick={() => navigate("health")}
            >
              <span>♡</span>
              Project Health
            </button>

            <button onClick={analyzeAnother}>
              <span>↻</span>
              Analyze Another
            </button>
          </div>
        )}
      </div>
    </>
  );
}

/* =========================================================
   REPOSITORY HEADER
========================================================= */

function RepositoryHeader({ data }) {
  const repo = data.repository;

  return (
    <div className="repository-header">
      <div>
        <div className="repo-title-row">
          <h1>{repo.full_name}</h1>
          <span className="public-badge">Public</span>
        </div>

        <p className="repo-description">
          {repo.description || "No repository description available."}
        </p>
      </div>

      <div className="repo-stats">
        <div className="stat-box">
          <strong>{formatNumber(repo.stars)}</strong>
          <span>Stars</span>
        </div>

        <div className="stat-box">
          <strong>{formatNumber(repo.forks)}</strong>
          <span>Forks</span>
        </div>

        <div className="stat-box">
          <strong>{data.analysis.total_files}</strong>
          <span>Files</span>
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   AI / REPOSITORY ANALYSIS
========================================================= */

function AISummary({ data }) {
  const analysis = data.analysis || {};
  const ai = data.ai_analysis || data.ai || {};

  const fallbackSummary = [
    `${data.repository.name} is a ${data.repository.language || "software"} repository designed around its main application logic and supporting project modules.`,
    `The repository structure provides a high-level view of how the project's major components are organized and how they contribute to the overall application.`,
    `RepoLens can trace the relationship between the repository's source code, configuration and supporting modules to build an understandable picture of the codebase.`,
    `The detected technologies and project structure provide context for understanding how the application is built and how its different parts fit together.`,
    `Overall, the repository can be understood by following the flow between its core application components and the supporting resources around them.`,
  ];

  const fallbackObservations = [
    analysis.languages?.length > 0
      ? `Primary language detected: ${analysis.languages[0].name}.`
      : "No primary programming language was detected.",
    analysis.frameworks?.length > 0
      ? `Frameworks/libraries detected: ${analysis.frameworks.join(", ")}.`
      : "No supported framework was detected.",
    (analysis.tests?.count || 0) > 0
      ? `${analysis.tests.count} test-related files were detected.`
      : "No test-related files were detected.",
    (analysis.dependencies || []).length > 0
      ? `${analysis.dependencies.length} dependency or configuration files were detected.`
      : "No dependency or configuration files were detected.",
    analysis.documentation?.readme
      ? "Repository documentation was detected through a README file."
      : "No README documentation was detected.",
  ];

  const summary =
    Array.isArray(ai.summary) && ai.summary.length > 0
      ? ai.summary.slice(0, 5)
      : fallbackSummary;

  const observations =
    Array.isArray(ai.key_observations) && ai.key_observations.length > 0
      ? ai.key_observations.slice(0, 5)
      : fallbackObservations;

  return (
    <section className="page-section summary-page">
      <div className="summary-only-card dashboard-card">
        <div className="summary-only-header">
          <h2>AI Repository Summary</h2>
        </div>

        <div className="ai-summary-paragraph">
          {summary.map((line, index) => (
            <div key={index} className="ai-summary-line">
              {line}
            </div>
          ))}
        </div>

        <div className="observations-card">
          <h3>Key Observations</h3>

          <ul className="observations-list">
            {observations.map((observation, index) => (
              <li key={index}>{observation}</li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

/* =========================================================
   REPOMAP
========================================================= */

/* =========================================================
   REPOMAP
========================================================= */

function ArchitectureNode({ data }) {
  return (
    <div className="architecture-node">
      <div className="architecture-node-accent" />

      {/* Four directional connection points keep relationships on the
          most natural side of each architecture component. */}
      <Handle
        id="top-source"
        type="source"
        position={Position.Top}
        className="architecture-handle architecture-handle-top"
      />
      <Handle
        id="top-target"
        type="target"
        position={Position.Top}
        className="architecture-handle architecture-handle-top"
      />

      <Handle
        id="right-source"
        type="source"
        position={Position.Right}
        className="architecture-handle architecture-handle-right"
      />
      <Handle
        id="right-target"
        type="target"
        position={Position.Right}
        className="architecture-handle architecture-handle-right"
      />

      <Handle
        id="bottom-source"
        type="source"
        position={Position.Bottom}
        className="architecture-handle architecture-handle-bottom"
      />
      <Handle
        id="bottom-target"
        type="target"
        position={Position.Bottom}
        className="architecture-handle architecture-handle-bottom"
      />

      <Handle
        id="left-source"
        type="source"
        position={Position.Left}
        className="architecture-handle architecture-handle-left"
      />
      <Handle
        id="left-target"
        type="target"
        position={Position.Left}
        className="architecture-handle architecture-handle-left"
      />

      <div className="architecture-node-content">
        <div className="architecture-node-category">
          {data.category || "COMPONENT"}
        </div>

        <div className="architecture-node-title">
          {data.label || "Component"}
        </div>

        {data.description && (
          <div className="architecture-node-description">
            {data.description}
          </div>
        )}
      </div>
    </div>
  );
}

const architectureNodeTypes = {
  architecture: ArchitectureNode,
};

function RepoMap({ data }) {
  const architecture = data.architecture || {};

  const rawNodes = Array.isArray(architecture.nodes)
    ? architecture.nodes
    : [];

  /*
    RepoMap uses a deterministic architecture layout instead of relying on
    whatever coordinates the backend happened to return. This keeps the
    diagram readable and makes the downloaded SVG match the browser view.
  */
  function getNodeRole(node, index) {
    const label = String(
      node.data?.label || node.label || node.name || ""
    ).toLowerCase();

    const repoName = String(data.repository?.name || "").toLowerCase();

    if (
      label === repoName ||
      label.includes(repoName) ||
      node.id === "repo" ||
      label.includes("repository")
    ) {
      return "repository";
    }

    if (label.includes("flutter")) return "flutter";
    if (label.includes("flask")) return "flask";
    if (label === "backend" || label.includes("backend")) return "backend";
    if (label.includes("ml") || label.includes("machine learning")) return "ml";
    if (label.includes("ai / model") || label.includes("ai model")) return "model";
    if (label === "frontend" || label.includes("frontend")) return "frontend";
    if (label.includes("readme")) return "readme";

    return `other-${index}`;
  }

  const rolePositions = {
    repository: { x: 470, y: 30 },

    flutter: { x: 170, y: 190 },
    flask: { x: 770, y: 190 },

    ml: { x: 170, y: 400 },
    backend: { x: 770, y: 400 },

    model: { x: 470, y: 400 },

    frontend: { x: 170, y: 610 },
    readme: { x: 770, y: 610 },
  };

  const nodes = rawNodes.map((node, index) => {
    const id = String(node.id || `node-${index}`);

    const nodeData = {
      ...(node.data || {}),
      label:
        node.data?.label ||
        node.label ||
        node.name ||
        `Component ${index + 1}`,
      category:
        node.data?.category ||
        node.category ||
        "COMPONENT",
      description:
        node.data?.description ||
        node.description ||
        "",
    };

    const role = getNodeRole(
      {
        ...node,
        data: nodeData,
      },
      index
    );

    const fallbackPosition = {
      x: 170 + (index % 3) * 300,
      y: 190 + Math.floor(index / 3) * 210,
    };

    return {
      ...node,
      id,
      type: "architecture",
      position: rolePositions[role] || fallbackPosition,
      data: {
        ...nodeData,
        role,
      },
    };
  });

  const nodePositionMap = new Map(
    nodes.map((node) => [node.id, node.position])
  );

  function getConnectionSides(sourceId, targetId) {
    const source = nodePositionMap.get(String(sourceId));
    const target = nodePositionMap.get(String(targetId));

    if (!source || !target) {
      return {
        sourceHandle: "bottom-source",
        targetHandle: "top-target",
      };
    }

    const dx = target.x - source.x;
    const dy = target.y - source.y;

    /*
      Prefer the dominant direction. Since the nodes are deliberately
      arranged in layers, this produces clean vertical/horizontal arrows.
    */
    if (Math.abs(dx) > Math.abs(dy)) {
      return dx > 0
        ? {
            sourceHandle: "right-source",
            targetHandle: "left-target",
          }
        : {
            sourceHandle: "left-source",
            targetHandle: "right-target",
          };
    }

    return dy > 0
      ? {
          sourceHandle: "bottom-source",
          targetHandle: "top-target",
        }
      : {
          sourceHandle: "top-source",
          targetHandle: "bottom-target",
        };
  }

  /*
    Remove exact duplicate relationships. The architecture scanner can
    occasionally produce the same source → target relationship more than once.
  */
  const uniqueEdgeMap = new Map();

  if (Array.isArray(architecture.edges)) {
    architecture.edges.forEach((edge, index) => {
      if (!edge?.source || !edge?.target) return;

      const source = String(edge.source);
      const target = String(edge.target);

      if (
        !nodePositionMap.has(source) ||
        !nodePositionMap.has(target) ||
        source === target
      ) {
        return;
      }

      const relation =
        edge.label ||
        edge.relation ||
        edge.relationship ||
        "";

      const key = `${source}→${target}→${String(relation).toLowerCase()}`;

      if (!uniqueEdgeMap.has(key)) {
        uniqueEdgeMap.set(key, {
          ...edge,
          id: edge.id || `edge-${source}-${target}-${index}`,
          source,
          target,
          relation,
        });
      }
    });
  }

  /*
    Keep the architecture diagram focused. If there are many inferred
    relationships, prioritize explicit relationships over generic duplicates.
  */
  const allEdges = Array.from(uniqueEdgeMap.values());

  const priority = {
    "api / requests": 100,
    api: 95,
    invokes: 90,
    calls: 85,
    contains: 70,
    uses: 60,
  };

  const rankedEdges = [...allEdges].sort((a, b) => {
    const aScore = priority[String(a.relation).toLowerCase()] || 50;
    const bScore = priority[String(b.relation).toLowerCase()] || 50;
    return bScore - aScore;
  });

  const edgesToRender = rankedEdges.slice(0, 9);

  const edges = edgesToRender.map((edge, index) => {
    const connection = getConnectionSides(edge.source, edge.target);

    const relation = edge.relation || "";

    return {
      ...edge,
      id: edge.id || `edge-${index}`,
      sourceHandle: edge.sourceHandle || connection.sourceHandle,
      targetHandle: edge.targetHandle || connection.targetHandle,
      type: "smoothstep",
      animated: false,
      label: relation,
      labelStyle: {
        fill: "#475569",
        fontSize: 10,
        fontWeight: 600,
        ...(edge.labelStyle || {}),
      },
      labelBgStyle: {
        fill: "#ffffff",
        fillOpacity: 0.96,
        ...(edge.labelBgStyle || {}),
      },
      labelBgPadding: [5, 3],
      labelBgBorderRadius: 5,
      markerEnd: {
        type: MarkerType.ArrowClosed,
        width: 18,
        height: 18,
        color: "#64748b",
        ...(typeof edge.markerEnd === "object" ? edge.markerEnd : {}),
      },
      style: {
        stroke: "#94a3b8",
        strokeWidth: 1.8,
        ...(edge.style || {}),
      },
    };
  });

  function downloadDiagram() {
    const nodeWidth = 210;
    const nodeHeight = 95;
    const padding = 80;

    const minX = Math.min(
      ...nodes.map((node) => node.position.x),
      0
    );
    const minY = Math.min(
      ...nodes.map((node) => node.position.y),
      0
    );

    const maxX = Math.max(
      ...nodes.map((node) => node.position.x + nodeWidth),
      1200
    );

    const maxY = Math.max(
      ...nodes.map((node) => node.position.y + nodeHeight),
      800
    );

    const svgWidth = maxX - minX + padding * 2;
    const svgHeight = maxY - minY + padding * 2;

    const offsetX = padding - minX;
    const offsetY = padding - minY;

    const getSvgPoint = (node, handleId) => {
      const x = node.position.x + offsetX;
      const y = node.position.y + offsetY;

      switch (handleId) {
        case "top-source":
        case "top-target":
          return {
            x: x + nodeWidth / 2,
            y,
          };

        case "right-source":
        case "right-target":
          return {
            x: x + nodeWidth,
            y: y + nodeHeight / 2,
          };

        case "left-source":
        case "left-target":
          return {
            x,
            y: y + nodeHeight / 2,
          };

        default:
          return {
            x: x + nodeWidth / 2,
            y: y + nodeHeight,
          };
      }
    };

    const createOrthogonalPath = (sourcePoint, targetPoint, sourceHandle) => {
      const horizontal =
        sourceHandle === "right-source" ||
        sourceHandle === "left-source";

      if (horizontal) {
        const midX = (sourcePoint.x + targetPoint.x) / 2;

        return `M ${sourcePoint.x} ${sourcePoint.y}
                L ${midX} ${sourcePoint.y}
                L ${midX} ${targetPoint.y}
                L ${targetPoint.x} ${targetPoint.y}`;
      }

      const midY = (sourcePoint.y + targetPoint.y) / 2;

      return `M ${sourcePoint.x} ${sourcePoint.y}
              L ${sourcePoint.x} ${midY}
              L ${targetPoint.x} ${midY}
              L ${targetPoint.x} ${targetPoint.y}`;
    };

    const nodeSvg = nodes
      .map((node) => {
        const x = node.position.x + offsetX;
        const y = node.position.y + offsetY;

        const label = escapeXml(
          node.data?.label || "Component"
        );

        const category = escapeXml(
          node.data?.category || "COMPONENT"
        );

        const description = escapeXml(
          node.data?.description || ""
        );

        return `
          <rect
            x="${x}"
            y="${y}"
            width="${nodeWidth}"
            height="${nodeHeight}"
            rx="14"
            fill="white"
            stroke="#dbe2ea"
            stroke-width="1.5"
          />

          <rect
            x="${x}"
            y="${y}"
            width="4"
            height="${nodeHeight}"
            rx="2"
            fill="#6366f1"
          />

          <text
            x="${x + 16}"
            y="${y + 25}"
            font-family="Arial"
            font-size="9"
            font-weight="700"
            letter-spacing="1"
            fill="#6366f1"
          >
            ${category}
          </text>

          <text
            x="${x + 16}"
            y="${y + 48}"
            font-family="Arial"
            font-size="15"
            font-weight="700"
            fill="#111827"
          >
            ${label}
          </text>

          ${
            description
              ? `
                <text
                  x="${x + 16}"
                  y="${y + 69}"
                  font-family="Arial"
                  font-size="10"
                  fill="#64748b"
                >
                  ${description}
                </text>
              `
              : ""
          }
        `;
      })
      .join("");

    const edgeSvg = edges
      .map((edge) => {
        const source = nodes.find(
          (node) => node.id === String(edge.source)
        );

        const target = nodes.find(
          (node) => node.id === String(edge.target)
        );

        if (!source || !target) return "";

        const sourcePoint = getSvgPoint(
          source,
          edge.sourceHandle
        );

        const targetPoint = getSvgPoint(
          target,
          edge.targetHandle
        );

        const path = createOrthogonalPath(
          sourcePoint,
          targetPoint,
          edge.sourceHandle
        );

        const label = escapeXml(edge.label || "");

        const midX = (sourcePoint.x + targetPoint.x) / 2;
        const midY = (sourcePoint.y + targetPoint.y) / 2;

        return `
          <path
            d="${path}"
            fill="none"
            stroke="#94a3b8"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            marker-end="url(#repoLensArrow)"
          />

          ${
            label
              ? `
                <rect
                  x="${midX - Math.max(24, label.length * 3.1 + 8)}"
                  y="${midY - 11}"
                  width="${Math.max(48, label.length * 6.2 + 16)}"
                  height="20"
                  rx="5"
                  fill="white"
                  fill-opacity="0.96"
                />

                <text
                  x="${midX}"
                  y="${midY + 3}"
                  text-anchor="middle"
                  font-family="Arial"
                  font-size="10"
                  font-weight="600"
                  fill="#475569"
                >
                  ${label}
                </text>
              `
              : ""
          }
        `;
      })
      .join("");

    const svg = `
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="${svgWidth}"
        height="${svgHeight}"
        viewBox="0 0 ${svgWidth} ${svgHeight}"
      >
        <defs>
          <marker
            id="repoLensArrow"
            markerWidth="9"
            markerHeight="9"
            refX="8"
            refY="4.5"
            orient="auto"
            markerUnits="strokeWidth"
          >
            <path
              d="M0,0 L9,4.5 L0,9 Z"
              fill="#64748b"
            />
          </marker>
        </defs>

        <rect
          width="100%"
          height="100%"
          fill="white"
        />

        ${edgeSvg}
        ${nodeSvg}
      </svg>
    `;

    const blob = new Blob([svg], {
      type: "image/svg+xml",
    });

    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = `${data.repository.name}-repomap.svg`;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  }

  return (
    <section className="page-section repomap-page">
      <div className="repomap-card dashboard-card">

        <div className="repomap-heading">
          <h2>RepoMap</h2>

          <button
            className="download-button"
            onClick={downloadDiagram}
          >
            ↓ Download Diagram
          </button>
        </div>

        <div className="repomap-flow-container">
          {nodes.length > 0 ? (
            <ReactFlow
              nodes={nodes}
              edges={edges}
              nodeTypes={architectureNodeTypes}
              fitView
              fitViewOptions={{
                padding: 0.16,
                minZoom: 0.2,
                maxZoom: 1.25,
              }}
              nodesDraggable
              nodesConnectable={false}
              elementsSelectable
              proOptions={{ hideAttribution: true }}
            >
              <Background
                gap={24}
                size={1}
                color="#e2e8f0"
              />

              <Controls />

              <MiniMap
                pannable
                zoomable
              />
            </ReactFlow>
          ) : (
            <div className="repomap-empty">
              <strong>No architecture components detected</strong>
              <span>
                RepoLens could not infer a visual architecture
                from the analyzed repository.
              </span>
            </div>
          )}
        </div>

        <div className="repomap-footer">
          <span>
            {nodes.length} architecture components
          </span>

          <span>
            {edges.length} displayed relationships
          </span>

          <span>
            Architecture inferred from repository structure and
            detected technologies.
          </span>
        </div>

      </div>
    </section>
  );
}

/* =========================================================
   TECH STACK PAGE
========================================================= */

function TechStackPage({ data }) {
  const analysis = data.analysis;

  const [modal, setModal] = useState(null);

  const languages = analysis.languages || [];
  const frameworks = analysis.frameworks || [];
  const configFiles = analysis.important_files || [];
  const dependencies = analysis.dependencies || [];
  const structure = analysis.top_level_structure || [];

  return (
    <section className="page-section techstack-page">
      <div className="techstack-five-grid">

        {/* 1. Languages */}
        <div className="dashboard-card tech-card">
          <h3>Languages</h3>

          <div className="language-list">
            {languages.slice(0, 3).map((language, index) => (
              <div className="language-row" key={index}>
                <span className="language-dot" />
                <span>{language.name}</span>
                <strong>{language.files} files</strong>
              </div>
            ))}

            {languages.length === 0 && (
              <p className="empty-text">No languages detected.</p>
            )}
          </div>

          {languages.length > 3 && (
            <button
              className="read-more-button"
              onClick={() =>
                setModal({
                  title: "Languages",
                  items: languages.map(
                    (language) =>
                      `${language.name} — ${language.files} files`
                  ),
                })
              }
            >
              Read more
            </button>
          )}
        </div>

        {/* 2. Frameworks & Libraries */}
        <div className="dashboard-card tech-card">
          <h3>Frameworks &amp; Libraries</h3>

          <div className="tag-list">
            {frameworks.slice(0, 3).map((framework, index) => (
              <span className="tech-tag" key={index}>
                {framework}
              </span>
            ))}

            {frameworks.length === 0 && (
              <p className="empty-text">
                No specific frameworks or libraries detected.
              </p>
            )}
          </div>

          {frameworks.length > 3 && (
            <button
              className="read-more-button"
              onClick={() =>
                setModal({
                  title: "Frameworks & Libraries",
                  items: frameworks,
                })
              }
            >
              Read more
            </button>
          )}
        </div>

        {/* 3. Repository Structure */}
        <div className="dashboard-card tech-card">
          <h3>Repository Structure</h3>

          <div className="structure-preview">
            {structure.slice(0, 3).map((item, index) => (
              <div className="structure-item" key={index}>
                <span>{item.includes(".") ? "▤" : "📁"}</span>
                <span>{item}</span>
              </div>
            ))}

            {structure.length === 0 && (
              <p className="empty-text">No structure detected.</p>
            )}
          </div>

          {structure.length > 3 && (
            <button
              className="read-more-button"
              onClick={() =>
                setModal({
                  title: "Repository Structure",
                  items: structure,
                })
              }
            >
              Read more
            </button>
          )}
        </div>

        {/* 4. Project Configuration */}
        <div className="dashboard-card tech-card">
          <h3>Project Configuration</h3>

          <div className="config-preview">
            {configFiles.slice(0, 3).map((file, index) => (
              <div className="config-item" key={index}>
                <span>▣</span>
                <span>{file}</span>
              </div>
            ))}

            {configFiles.length === 0 && (
              <p className="empty-text">
                No configuration files detected.
              </p>
            )}
          </div>

          {configFiles.length > 3 && (
            <button
              className="read-more-button"
              onClick={() =>
                setModal({
                  title: "Project Configuration",
                  items: configFiles,
                })
              }
            >
              Read more
            </button>
          )}
        </div>

        {/* 5. Dependencies */}
        <div className="dashboard-card tech-card">
          <h3>Dependencies</h3>

          <div className="dependency-preview">
            {dependencies.slice(0, 3).map((dependency, index) => (
              <div className="dependency-row compact-dependency" key={index}>
                <div>
                  <strong>{dependency.file}</strong>
                </div>

                <span className="file-badge">FILE</span>
              </div>
            ))}

            {dependencies.length === 0 && (
              <p className="empty-text">
                No dependency files were detected.
              </p>
            )}
          </div>

          {dependencies.length > 3 && (
            <button
              className="read-more-button"
              onClick={() =>
                setModal({
                  title: "Dependencies",
                  items: dependencies,
                })
              }
            >
              Read more
            </button>
          )}
        </div>
      </div>

      {modal && (
        <DetailModal
          title={modal.title}
          items={modal.items}
          onClose={() => setModal(null)}
        />
      )}
    </section>
  );
}

/* =========================================================
   PROJECT HEALTH
========================================================= */

function ProjectHealth({ data }) {
  const analysis = data.analysis;

  let score = 50;

  if (analysis.documentation?.readme) {
    score += 15;
  }

  if ((analysis.tests?.count || 0) > 0) {
    score += 15;
  }

  if ((analysis.dependencies || []).length > 0) {
    score += 10;
  }

  if ((analysis.total_files || 0) > 20) {
    score += 5;
  }

  score = Math.min(score, 95);

  return (
    <section className="page-section health-page">
      <div className="page-title">
        <h2>Project Health</h2>
      </div>

      <div className="health-top-grid">
        <div className="health-score-card">
          <div>
            <span className="small-label">
              OVERALL HEALTH
            </span>

            <div className="score-number">
              {score}
              <span>/100</span>
            </div>
          </div>

          <div>
            <span className="health-status">
              {score >= 80
                ? "Good"
                : score >= 60
                ? "Moderate"
                : "Needs attention"}
            </span>

            <p>
              Based on documentation, testing,
              dependencies and repository organization.
            </p>
          </div>
        </div>
      </div>

      <div className="health-grid">
        <HealthCard
          title="Documentation"
          value={
            analysis.documentation?.readme
              ? "Detected"
              : "Not detected"
          }
          description="README documentation"
          good={analysis.documentation?.readme}
        />

        <HealthCard
          title="Tests"
          value={`${analysis.tests?.count || 0} test files`}
          description="Test-related files detected"
          good={(analysis.tests?.count || 0) > 0}
        />

        <HealthCard
          title="Dependencies"
          value={
            (analysis.dependencies || []).length > 0
              ? "Detected"
              : "Not detected"
          }
          description="Configuration files found"
          good={(analysis.dependencies || []).length > 0}
        />

        <HealthCard
          title="Repository Size"
          value={`${analysis.total_files || 0} files`}
          description="Files scanned"
          good={true}
        />
      </div>
    </section>
  );
}

/* =========================================================
   HEALTH CARD
========================================================= */

function HealthCard({
  title,
  value,
  description,
  good,
}) {
  return (
    <div className="health-card">
      <div className="health-card-icon">
        {good ? "✓" : "!"}
      </div>

      <h3>{title}</h3>

      <strong>{value}</strong>

      <p>{description}</p>
    </div>
  );
}

/* =========================================================
   HOME PAGE
========================================================= */

function HomePage({
  githubUrl,
  setGithubUrl,
  analyzeRepository,
  loading,
  error,
}) {
  const sampleRepos = [
    {
      name: "OpenAI Whisper",
      url: "https://github.com/openai/whisper",
    },
    {
      name: "React",
      url: "https://github.com/facebook/react",
    },
    {
      name: "Flask",
      url: "https://github.com/pallets/flask",
    },
    {
      name: "Flutter",
      url: "https://github.com/flutter/flutter",
    },
  ];

  return (
    <div className="home-page">
      <header className="home-header">
        <RepoLensLogo large />

        <div className="home-header-links">
          <span>Repository Intelligence</span>
        </div>
      </header>

      <main className="home-main">
        <div className="home-badge">
          ✦ AI-Powered Repository Intelligence
        </div>

        <h1>
          Understand any <span>codebase</span>
          <br />
          in minutes.
        </h1>

        <p className="home-description">
          Paste a public GitHub repository and RepoLens analyzes its structure,
          technology stack and engineering health.
        </p>

        <form
          className="analyze-form"
          onSubmit={(event) => {
            event.preventDefault();
            analyzeRepository();
          }}
        >
          <div className="input-wrapper">
            <span className="github-symbol">◉</span>

            <input
              value={githubUrl}
              onChange={(event) => setGithubUrl(event.target.value)}
              placeholder="https://github.com/user/repository"
            />
          </div>

          <button type="submit" disabled={loading}>
            {loading ? "Analyzing..." : "Analyze Repository →"}
          </button>
        </form>

        {error && <div className="error-message">{error}</div>}

        {/* SAMPLE REPOSITORIES */}
        <div className="sample-repos">
          <span className="sample-label">Try a sample:</span>

          {sampleRepos.map((repo) => (
            <button
              key={repo.name}
              type="button"
              className="sample-repo"
              onClick={() => setGithubUrl(repo.url)}
            >
              {repo.name}
            </button>
          ))}
        </div>

        {/* FEATURES */}
        <div className="feature-grid">
          <div className="feature-card feature-blue">
            <FeatureIcon type="repo" />

            <span className="feature-label">
              REPOSITORY ANALYSIS
            </span>

            <h3>Repository Analysis</h3>

            <p>
              Understand the structure, key modules and how the project is
              organized.
            </p>
          </div>

          <div className="feature-card feature-purple">
            <FeatureIcon type="stack" />

            <span className="feature-label">
              TECHNOLOGY
            </span>

            <h3>Tech Stack Detection</h3>

            <p>
              Detect languages, frameworks, libraries and dependencies
              automatically.
            </p>
          </div>

          <div className="feature-card feature-green">
            <FeatureIcon type="health" />

            <span className="feature-label">
              ENGINEERING
            </span>

            <h3>Project Health</h3>

            <p>
              Analyze documentation, testing, dependencies and overall project
              maintainability.
            </p>
          </div>
        </div>

        <div className="home-footer-points">
          <span>● Open-source friendly</span>
          <span>● No setup required</span>
          <span>● Instant analysis</span>
        </div>
      </main>
    </div>
  );
}

/* =========================================================
   MAIN APP
========================================================= */

function App() {
  const [githubUrl, setGithubUrl] = useState("");
  const [data, setData] = useState(null);
  const [page, setPage] = useState("summary");
  const [loading, setLoading] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [error, setError] = useState("");

  async function analyzeRepository() {
    if (!githubUrl.trim()) {
      setError("Please enter a public GitHub repository URL.");
      return;
    }

    setLoading(true);
    setError("");

    try {
          const API_URL =
  import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

      const response = await axios.post(
  `${API_URL}/analyze`,
  {
    github_url: githubUrl.trim(),
  }
);

      setData(response.data);
      setPage("summary");
    } catch (err) {
      console.error(err);

      if (err.response?.data?.detail) {
        setError(err.response.data.detail);
      } else {
        setError(
          "Unable to analyze repository. Make sure the backend is running."
        );
      }
    } finally {
      setLoading(false);
    }
  }

  function resetAnalysis() {
    setData(null);
    setError("");
    setGithubUrl("");
  }

  if (!data) {
    return (
      <HomePage
        githubUrl={githubUrl}
        setGithubUrl={setGithubUrl}
        analyzeRepository={analyzeRepository}
        loading={loading}
        error={error}
      />
    );
  }

  return (
    <div className="dashboard-layout">
      <Sidebar
        page={page}
        setPage={setPage}
        resetAnalysis={resetAnalysis}
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
      />

      <main className="dashboard-main">
        <RepositoryHeader data={data} />

        {page === "summary" && <AISummary data={data} />}

        {page === "repomap" && <RepoMap data={data} />}

        {page === "stack" && <TechStackPage data={data} />}

        {page === "health" && <ProjectHealth data={data} />}
      </main>
    </div>
  );
}

/* =========================================================
   HELPERS
========================================================= */

function formatNumber(number) {
  if (
    number === undefined ||
    number === null
  ) {
    return "0";
  }

  if (number >= 1000) {
    return (
      (number / 1000).toFixed(1) + "k"
    );
  }

  return number.toString();
}

function escapeXml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

export default App;