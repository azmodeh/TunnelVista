'use client';

import React from 'react';
import { getSmoothStepPath, EdgeProps, useReactFlow } from 'reactflow';
import { Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { Badge } from '../ui/badge';
import { VpnTunnelProtocol } from '@/lib/types';


const CustomEdge: React.FC<EdgeProps> = ({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
  data,
}) => {
  const { setEdges } = useReactFlow();
  const [edgePath, labelX, labelY] = getSmoothStepPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  const onEdgeClick = (evt: React.MouseEvent) => {
    evt.stopPropagation();
    setEdges((edges) => edges.filter((edge) => edge.id !== id));
  };
  
  const protocol = data?.protocol as VpnTunnelProtocol | undefined;

  return (
    <>
      <path
        id={id}
        style={style}
        className="react-flow__edge-path"
        d={edgePath}
        markerEnd={markerEnd}
      />
      <foreignObject
        width={180}
        height={40}
        x={labelX - 90}
        y={labelY - 20}
        className="overflow-visible"
        requiredExtensions="http://www.w3.org/1999/xhtml"
      >
        <div className="flex justify-center items-center h-full w-full gap-2 group">
          <motion.div
            whileHover={{ scale: 1.2 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
            className="bg-background/50 backdrop-blur-sm rounded-full p-1 cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={onEdgeClick}
          >
            <Trash2 className="text-destructive h-5 w-5" />
          </motion.div>
          {protocol && (
            <Badge variant="secondary" className="opacity-0 group-hover:opacity-100 transition-opacity">{protocol}</Badge>
          )}
        </div>
      </foreignObject>
    </>
  );
};

export default CustomEdge;