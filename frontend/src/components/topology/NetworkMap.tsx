import React, { useMemo } from 'react';
import ReactFlow, { 
  Background, 
  Controls, 
  ConnectionLineType,
  type Edge, 
  type Node
} from 'reactflow';
import 'reactflow/dist/style.css';
import type { Device } from '../../types';
import { Server, Monitor, ShieldCheck } from 'lucide-react';

interface NetworkMapProps {
  devices: Device[];
}

export const NetworkMap: React.FC<NetworkMapProps> = ({ devices }) => {
  const { nodes, edges } = useMemo(() => {
    const initialNodes: Node[] = [];
    const initialEdges: Edge[] = [];

    // Find gateway or pick first as center
    const gateway = devices.find(d => d.is_gateway) || devices[0];
    
    if (!gateway) return { nodes: [], edges: [] };

    // Center Node (Gateway)
    initialNodes.push({
      id: gateway.id,
      data: { label: (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
          <ShieldCheck size={32} color="#fff" />
          <div style={{ fontWeight: 'bold', fontSize: '14px' }}>GATEWAY</div>
          <div style={{ fontSize: '10px', opacity: 0.9 }}>{gateway.ip}</div>
        </div>
      ) },
      position: { x: 400, y: 300 },
      style: { 
        background: 'linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%)', 
        color: '#fff', 
        borderRadius: '50%', 
        width: 120, 
        height: 120,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        border: 'none',
        boxShadow: '0 0 30px rgba(124, 58, 237, 0.4)',
        zIndex: 10
      },
    });

    // Orbiting Nodes (Devices)
    const others = devices.filter(d => d.id !== gateway.id);
    const radius = 280;

    others.forEach((device, index) => {
      const angle = (index / others.length) * 2 * Math.PI;
      const x = 400 + radius * Math.cos(angle);
      const y = 300 + radius * Math.sin(angle);

      const isServer = device.ports?.some(p => [80, 443, 8080, 3000].includes(p.port));

      initialNodes.push({
        id: device.id,
        data: { label: (
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ 
              backgroundColor: 'var(--primary-alpha)', 
              padding: '8px', 
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              {isServer ? <Server size={20} color="var(--primary)" /> : <Monitor size={20} color="var(--primary)" />}
            </div>
            <div style={{ textAlign: 'left', overflow: 'hidden' }}>
              <div style={{ fontWeight: 'bold', fontSize: '12px', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
                {device.hostname || 'Unknown Host'}
              </div>
              <div style={{ fontSize: '10px', color: 'var(--text-dim)' }}>{device.ip}</div>
            </div>
          </div>
        ) },
        position: { x, y },
        style: { 
          background: 'var(--bg-surface)', 
          color: 'var(--text-main)', 
          borderRadius: '12px',
          padding: '12px',
          border: device.is_new ? '2px solid #ef4444' : '1px solid var(--border-color)',
          width: 180,
          boxShadow: device.is_new 
            ? '0 0 15px rgba(239, 68, 68, 0.4)' 
            : '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        },
      });

      initialEdges.push({
        id: `e-${gateway.id}-${device.id}`,
        source: gateway.id,
        target: device.id,
        type: ConnectionLineType.Bezier,
        animated: true,
        style: { 
          stroke: device.is_new ? '#ef4444' : 'var(--primary)', 
          strokeWidth: device.is_new ? 3 : 2, 
          opacity: device.is_new ? 0.8 : 0.3 
        },
      });
    });

    return { nodes: initialNodes, edges: initialEdges };
  }, [devices]);

  return (
    <div style={{ width: '100%', height: '500px', background: 'var(--bg-main)', borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--border)' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        fitView
        nodesDraggable={true}
        nodesConnectable={false}
      >
        <Background color="var(--border)" gap={20} />
        <Controls />
      </ReactFlow>
    </div>
  );
};
