'use client';

import { useMemo, useEffect } from 'react';
import { useDevices } from '@/components/devices/use-devices';
import { useTunnels } from '@/components/tunnels/use-tunnels';
import { useNodesState, useEdgesState, type Node, type Edge } from 'reactflow';

export function useTopology() {
  const { data: deviceData, isLoading: isLoadingDevices, isError: isErrorDevices } = useDevices();
  const { data: tunnelData, isLoading: isLoadingTunnels, isError: isErrorTunnels } = useTunnels();
  
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  const devices = deviceData?.devices || [];
  const tunnels = tunnelData?.tunnels || [];

  useEffect(() => {
    if (devices.length) {
      const initialNodes: Node[] = devices.map((device, index) => ({
        id: device.id,
        type: 'customNode',
        position: { x: device.x ?? index * 300, y: device.y ?? 200 },
        data: { ...device, label: device.name },
      }));
      setNodes(initialNodes);
    }
  }, [devices, setNodes]);

  useEffect(() => {
    if (tunnels.length) {
       const initialEdges: Edge[] = tunnels.map((tunnel) => ({
        id: tunnel.id,
        source: tunnel.sourceDeviceId,
        target: tunnel.destinationDeviceId,
        animated: tunnel.status === 'active',
        style: {
          stroke: tunnel.status === 'active' ? 'hsl(var(--accent))' : '#555',
          strokeWidth: 2,
        },
        type: 'custom',
        data: {
            protocol: tunnel.protocol
        }
      }));
      setEdges(initialEdges);
    }
  }, [tunnels, setEdges]);
  

  return {
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    devices,
    tunnels,
    isLoading: isLoadingDevices || isLoadingTunnels,
    isError: isErrorDevices || isErrorTunnels
  };
}
