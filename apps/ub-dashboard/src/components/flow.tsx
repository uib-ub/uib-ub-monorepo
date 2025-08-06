"use client"
import React, { useCallback } from 'react';
import ReactFlow, {
  addEdge,
  ConnectionLineType,
  useNodesState,
  useEdgesState,
  Node,
  Edge,
  Connection,
} from 'reactflow';
import dagre from 'dagre';

import 'reactflow/dist/style.css';

const dagreGraph = new dagre.graphlib.Graph();
dagreGraph.setDefaultEdgeLabel(() => ({}));

const nodeWidth = 172;
const nodeHeight = 36;

const getLayoutedElements = (nodes: Node[], edges: Edge[], direction = 'TB') => {
  const isHorizontal = direction === 'LR';
  dagreGraph.setGraph({ rankdir: direction });

  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight });
  });

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  nodes.forEach((node: any) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    node.targetPosition = isHorizontal ? 'left' : 'top';
    node.sourcePosition = isHorizontal ? 'right' : 'bottom';

    // We are shifting the dagre node position (anchor=center center) to the top left
    // so it matches the React Flow node anchor point (top left).
    node.position = {
      x: nodeWithPosition.x - nodeWidth / 2,
      y: nodeWithPosition.y - nodeHeight / 2,
    };

    return node;
  });

  return { nodes, edges };
};


const Flow = ({ nodes: initialNodes, edges: initialEdges }: { nodes: Node[], edges: Edge[] }) => {
  const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
    initialNodes,
    initialEdges
  );
  const [nodes, , onNodesChange] = useNodesState(layoutedNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(layoutedEdges);

  const onConnect = useCallback(
    (connection: Connection) => {
      if (connection.source && connection.target) {
        setEdges((eds) =>
          addEdge({ 
            id: `${connection.source}-${connection.target}`,
            ...connection, 
            type: ConnectionLineType.SmoothStep, 
            animated: true 
          }, eds)
        );
      }
    },
    [setEdges]
  );

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      onConnect={onConnect}
      connectionLineType={ConnectionLineType.SmoothStep}
      fitView
    >
    </ReactFlow>
  );
};

export default Flow;