'use client';

import React from 'react';
import ReactFlow, {
  MiniMap,
  Controls,
  Background,
  type Node,
  type Edge,
  Handle,
  Position,
  type OnConnect,
  type OnEdgesChange,
  type OnNodesChange,
  type Viewport,
  type FitViewOptions,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { Card } from '../ui/card';
import { cn } from '@/lib/utils';
import { Device } from '@/lib/types';
import { motion } from 'framer-motion';
import CustomEdge from './CustomEdge';
import { Server } from 'lucide-react';
import StarBorder from '../ui/StarBorder';
import { CountryFlag } from '../ui/CountryFlag';

interface NetworkGraphProps {
  nodes: Node[];
  edges: Edge[];
  onNodesChange: OnNodesChange;
  onEdgesChange: OnEdgesChange;
  onConnect?: OnConnect;
  fitView?: boolean;
  fitViewOptions?: FitViewOptions;
}

const minimapStyle = {
  height: 120,
};

const CustomNode = ({ data }: { data: Device & { label: string } }) => {
  const isOnline = data.status === 'online';

  return (
    <motion.div
      className="flex flex-col items-center"
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <Handle type="target" position={Position.Top} isConnectable={true} className="!bg-teal-500 !w-3 !h-3" />
      <StarBorder
        color={isOnline ? 'hsl(var(--accent))' : 'hsl(var(--muted))'}
        className="rounded-lg w-32 bg-background"
      >
        <div
          className={cn(
            'flex flex-col items-center justify-center gap-2 p-3 w-full h-full'
          )}
        >
          <div className="relative">
            <Server className={cn("h-8 w-8", isOnline ? "text-accent" : "text-muted-foreground")} />
            {isOnline && (
              <>
                <div className="absolute top-0 right-0 h-2.5 w-2.5 rounded-full bg-accent animate-ping opacity-75"></div>
                <div className="absolute top-0 right-0 h-2.5 w-2.5 rounded-full bg-accent"></div>
              </>
            )}
          </div>
          <span className="text-xs font-bold text-center truncate w-full">{data.label}</span>
          {data.country_code && (
              <div className='flex items-center gap-1.5'>
                  <CountryFlag code={data.country_code} size="sm" />
                  <span className='text-xs text-muted-foreground'>{data.location?.split(',')[0]}</span>
              </div>
          )}
        </div>
      </StarBorder>
      <Handle type="source" position={Position.Bottom} isConnectable={true} className="!bg-primary !w-3 !h-3" />
    </motion.div>
  );
};


const nodeTypes = {
  customNode: CustomNode,
};

const edgeTypes = {
    custom: CustomEdge,
}

export function NetworkGraph({ nodes, edges, onNodesChange, onEdgesChange, onConnect, fitView, fitViewOptions }: NetworkGraphProps) {
  return (
    <Card 
      className="h-full w-full glass-card"
    >
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        deleteKeyCode={['Backspace', 'Delete']}
        zoomOnScroll={true}
        proOptions={{ hideAttribution: true }}
        fitView={fitView}
        fitViewOptions={fitViewOptions}
      >
        <Controls />
        <MiniMap style={minimapStyle} zoomable pannable />
        <Background gap={16} size={1} color="hsl(var(--border) / 0.2)" />
      </ReactFlow>
    </Card>
  );
}
