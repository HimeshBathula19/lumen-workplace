import { useEffect, useMemo, useState } from "react";
import { Info, ArrowRight, ShieldCheck } from "lucide-react";

const DEFAULT_NODES = [
  {
    id: "workload",
    label: "Workload",
    type: "confounder",
    role: "Confounder",
    description:
      "Baseline workload may influence both meeting demand and recovery. It is therefore included as an adjustment variable.",
  },
  {
    id: "project_pressure",
    label: "Project Pressure",
    type: "confounder",
    role: "Confounder",
    description:
      "Project pressure can increase synchronized meeting demand while independently affecting team recovery.",
  },
  {
    id: "meeting_hours",
    label: "Meeting Load",
    type: "treatment",
    role: "Treatment / Actionable condition",
    description:
      "Weekly synchronized meeting hours. This is the operational condition tested by the causal model and What-If simulation.",
  },
  {
    id: "after_hours",
    label: "After-hours Activity",
    type: "covariate",
    role: "Covariate",
    description:
      "Aggregated after-hours communication activity used as an additional workplace-condition signal.",
  },
  {
    id: "recovery",
    label: "Recovery",
    type: "outcome",
    role: "Outcome",
    description:
      "Team-level recovery index used as the modeled outcome. It represents recovery capacity rather than an individual diagnosis.",
  },
];

const GRAPH_LAYOUT = {
  workload: { x: 54, y: 42, w: 170, h: 68 },
  project_pressure: { x: 54, y: 228, w: 170, h: 68 },
  meeting_hours: { x: 294, y: 135, w: 180, h: 76 },
  after_hours: { x: 518, y: 228, w: 170, h: 68 },
  recovery: { x: 604, y: 42, w: 142, h: 76 },
};

const EDGES = [
  {
    from: "workload",
    to: "meeting_hours",
    path: "M224 76 C250 76 260 125 294 163",
    kind: "backdoor",
  },
  {
    from: "workload",
    to: "recovery",
    path: "M224 68 C350 4 500 12 604 78",
    kind: "backdoor",
  },
  {
    from: "project_pressure",
    to: "meeting_hours",
    path: "M224 262 C250 262 260 218 294 183",
    kind: "backdoor",
  },
  {
    from: "project_pressure",
    to: "recovery",
    path: "M224 274 C365 330 520 306 650 118",
    kind: "backdoor",
  },
  {
    from: "meeting_hours",
    to: "recovery",
    path: "M474 173 L604 82",
    kind: "causal",
  },
  {
    from: "meeting_hours",
    to: "after_hours",
    path: "M424 211 C456 232 482 257 518 262",
    kind: "secondary",
  },
  {
    from: "after_hours",
    to: "recovery",
    path: "M603 228 C626 196 636 160 652 118",
    kind: "secondary",
  },
];

function nodeStyle(type, selected) {
  const styles = {
    treatment: {
      fill: "#f5f5f7",
      stroke: "#0071e3",
      accent: "#0071e3",
    },
    outcome: {
      fill: "#f5f5f7",
      stroke: "#1d1d1f",
      accent: "#1d1d1f",
    },
    confounder: {
      fill: "#fbfbfd",
      stroke: "#a1a1a6",
      accent: "#6e6e73",
    },
    covariate: {
      fill: "#fbfbfd",
      stroke: "#b8b8bd",
      accent: "#6e6e73",
    },
  };

  const style = styles[type] || styles.covariate;

  return {
    ...style,
    strokeWidth: selected ? 2.5 : 1.2,
    shadow: selected
      ? "0 0 0 4px rgba(0,113,227,0.10)"
      : "none",
  };
}

export default function CausalGraph({
  nodes = [],
  selectedNodeId,
  onSelectNode,
}) {
  const mergedNodes = useMemo(() => {
    return DEFAULT_NODES.map((fallback) => {
      const incoming = nodes.find((node) => node.id === fallback.id);

      return {
        ...fallback,
        ...(incoming || {}),
      };
    });
  }, [nodes]);

  const [activeNode, setActiveNode] = useState(
    selectedNodeId || "meeting_hours"
  );

  useEffect(() => {
    if (selectedNodeId) {
      setActiveNode(selectedNodeId);
    }
  }, [selectedNodeId]);

  const selectNode = (id) => {
    setActiveNode(id);
    onSelectNode?.(id);
  };

  const currentNode =
    mergedNodes.find((node) => node.id === activeNode) ||
    mergedNodes.find((node) => node.id === "meeting_hours");

  return (
    <div
      className="causal-graph-container"
      style={{
        background: "#ffffff",
        border: "1px solid #e5e5e7",
        borderRadius: "18px",
        overflow: "hidden",
        boxShadow: "0 12px 40px rgba(0,0,0,0.04)",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "18px 20px",
          borderBottom: "1px solid #ececef",
          background: "#fbfbfd",
        }}
      >
        <div
          style={{
            display: "flex",
            gap: 18,
            alignItems: "center",
            flexWrap: "wrap",
          }}
        >
          {[
            ["treatment", "Treatment"],
            ["outcome", "Outcome"],
            ["confounder", "Confounder"],
            ["covariate", "Covariate"],
          ].map(([type, label]) => (
            <span
              key={type}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 7,
                fontSize: 12,
                color: "#6e6e73",
                fontWeight: 500,
              }}
            >
              <span
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  background:
                    type === "treatment"
                      ? "#0071e3"
                      : type === "outcome"
                        ? "#1d1d1f"
                        : "#a1a1a6",
                }}
              />
              {label}
            </span>
          ))}
        </div>

        <span
          style={{
            fontSize: 11,
            color: "#86868b",
            letterSpacing: ".02em",
          }}
        >
          Select a node to inspect the causal structure
        </span>
      </div>

      <div
        style={{
          width: "100%",
          minHeight: 410,
          padding: "18px 18px 4px",
          boxSizing: "border-box",
          background:
            "linear-gradient(180deg,#ffffff 0%,#fafafa 100%)",
        }}
      >
        <svg
          viewBox="0 0 790 350"
          width="100%"
          height="390"
          preserveAspectRatio="xMidYMid meet"
          role="img"
          aria-label="LUMEN causal directed acyclic graph"
        >
          <defs>
            <marker
              id="lumenArrowGray"
              viewBox="0 0 10 10"
              refX="8"
              refY="5"
              markerWidth="6"
              markerHeight="6"
              orient="auto-start-reverse"
            >
              <path
                d="M 0 0 L 10 5 L 0 10 z"
                fill="#a1a1a6"
              />
            </marker>

            <marker
              id="lumenArrowBlue"
              viewBox="0 0 10 10"
              refX="8"
              refY="5"
              markerWidth="6"
              markerHeight="6"
              orient="auto-start-reverse"
            >
              <path
                d="M 0 0 L 10 5 L 0 10 z"
                fill="#0071e3"
              />
            </marker>

            <filter
              id="lumenSelectedShadow"
              x="-30%"
              y="-30%"
              width="160%"
              height="160%"
            >
              <feDropShadow
                dx="0"
                dy="4"
                stdDeviation="5"
                floodColor="#0071e3"
                floodOpacity=".14"
              />
            </filter>
          </defs>

          {EDGES.map((edge, index) => {
            const active =
              edge.from === activeNode ||
              edge.to === activeNode;

            const causal = edge.kind === "causal";

            return (
              <path
                key={`${edge.from}-${edge.to}-${index}`}
                d={edge.path}
                fill="none"
                stroke={
                  causal
                    ? "#0071e3"
                    : active
                      ? "#6e6e73"
                      : "#c7c7cc"
                }
                strokeWidth={causal ? 2 : active ? 1.8 : 1.2}
                strokeDasharray={
                  edge.kind === "backdoor" ? "5 5" : undefined
                }
                markerEnd={
                  causal
                    ? "url(#lumenArrowBlue)"
                    : "url(#lumenArrowGray)"
                }
                opacity={activeNode && !active ? 0.55 : 1}
              />
            );
          })}

          {mergedNodes.map((node) => {
            const layout = GRAPH_LAYOUT[node.id];

            if (!layout) return null;

            const selected = node.id === activeNode;
            const style = nodeStyle(node.type, selected);

            return (
              <g
                key={node.id}
                role="button"
                tabIndex={0}
                aria-label={`Select ${node.label}`}
                onClick={() => selectNode(node.id)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    selectNode(node.id);
                  }
                }}
                style={{ cursor: "pointer" }}
                filter={selected ? "url(#lumenSelectedShadow)" : undefined}
              >
                <rect
                  x={layout.x}
                  y={layout.y}
                  width={layout.w}
                  height={layout.h}
                  rx="15"
                  fill={style.fill}
                  stroke={style.stroke}
                  strokeWidth={style.strokeWidth}
                />

                <rect
                  x={layout.x}
                  y={layout.y}
                  width="4"
                  height={layout.h}
                  rx="2"
                  fill={style.accent}
                />

                <text
                  x={layout.x + 19}
                  y={layout.y + 28}
                  fill="#1d1d1f"
                  fontSize="14"
                  fontWeight="650"
                  fontFamily="-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Helvetica Neue', Arial, sans-serif"
                >
                  {node.label}
                </text>

                <text
                  x={layout.x + 19}
                  y={layout.y + 49}
                  fill="#6e6e73"
                  fontSize="11"
                  fontFamily="-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif"
                >
                  {node.role}
                </text>

                {selected && (
                  <circle
                    cx={layout.x + layout.w - 17}
                    cy={layout.y + 17}
                    r="4"
                    fill={style.accent}
                  />
                )}
              </g>
            );
          })}

          <text
            x="384"
            y="30"
            textAnchor="middle"
            fill="#86868b"
            fontSize="11"
            fontFamily="-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif"
          >
            Adjustment / backdoor paths
          </text>

          <text
            x="535"
            y="157"
            textAnchor="middle"
            fill="#0071e3"
            fontSize="11"
            fontWeight="600"
            fontFamily="-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif"
          >
            hypothesized causal path
          </text>
        </svg>
      </div>

      {currentNode && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "minmax(190px, 0.7fr) minmax(0, 1.8fr)",
            gap: 24,
            padding: "20px 22px",
            borderTop: "1px solid #ececef",
            background: "#fbfbfd",
          }}
        >
          <div>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 7,
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: ".06em",
                color:
                  currentNode.type === "treatment"
                    ? "#0071e3"
                    : "#6e6e73",
                textTransform: "uppercase",
                marginBottom: 8,
              }}
            >
              <span
                style={{
                  width: 7,
                  height: 7,
                  borderRadius: "50%",
                  background:
                    currentNode.type === "treatment"
                      ? "#0071e3"
                      : currentNode.type === "outcome"
                        ? "#1d1d1f"
                        : "#a1a1a6",
                }}
              />
              {currentNode.type}
            </div>

            <h4
              style={{
                margin: 0,
                fontSize: 19,
                lineHeight: 1.2,
                letterSpacing: "-.02em",
                color: "#1d1d1f",
              }}
            >
              {currentNode.label}
            </h4>

            <p
              style={{
                margin: "6px 0 0",
                fontSize: 12,
                color: "#86868b",
              }}
            >
              {currentNode.role}
            </p>
          </div>

          <div>
            <p
              style={{
                margin: 0,
                fontSize: 13,
                lineHeight: 1.65,
                color: "#4a4a4f",
                maxWidth: 720,
              }}
            >
              {currentNode.description}
            </p>

            <div
              style={{
                display: "flex",
                gap: 10,
                alignItems: "flex-start",
                marginTop: 14,
                padding: "11px 13px",
                background: "#ffffff",
                border: "1px solid #e6e6e9",
                borderRadius: 12,
              }}
            >
              <Info size={15} color="#0071e3" style={{ marginTop: 1 }} />
              <span
                style={{
                  fontSize: 12,
                  lineHeight: 1.55,
                  color: "#6e6e73",
                }}
              >
                {currentNode.type === "confounder" &&
                  "This variable is considered during adjustment to reduce backdoor confounding."}

                {currentNode.type === "treatment" &&
                  "This is the actionable condition tested by the causal estimate and the What-If intervention."}

                {currentNode.type === "outcome" &&
                  "This is the team-level outcome the model is trying to explain, not an individual health diagnosis."}

                {currentNode.type === "covariate" &&
                  "This provides additional context about workplace conditions and can help explain downstream changes."}
              </span>
            </div>
          </div>
        </div>
      )}

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 9,
          padding: "12px 18px",
          borderTop: "1px solid #ececef",
          color: "#86868b",
          fontSize: 11,
        }}
      >
        <ShieldCheck size={14} />
        Team-level causal analysis · no individual messages exposed
      </div>
    </div>
  );
}
