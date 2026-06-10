"use client";

import { useCallback, useEffect } from 'react';
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/lib/db";
import { useStore } from "@/store/useStore";

export function CanvasView() {
  const notes = useLiveQuery(() => db.notes.toArray());
  const links = useLiveQuery(() => db.links.toArray());
  const { setActiveNoteId, setViewMode } = useStore();

  const [nodes, setNodes, onNodesChange] = useNodesState<any>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<any>([]);

  useEffect(() => {
    if (notes && links) {
      const newNodes = notes.map((note, index) => ({
        id: note.id,
        position: { x: (index % 4) * 300, y: Math.floor(index / 4) * 200 },
        data: { label: note.title || "Untitled" },
        style: {
          background: 'rgba(24, 24, 27, 0.8)',
          color: '#fff',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '12px',
          padding: '16px 24px',
          width: 240,
          backdropFilter: 'blur(12px)',
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5)',
          fontWeight: '500',
        }
      }));
      
      const newEdges = links.map(link => ({
        id: link.id,
        source: link.source,
        target: link.target,
        animated: true,
        style: { stroke: '#818cf8', strokeWidth: 2 }
      }));

      setNodes((prevNodes) => {
        if (prevNodes.length === 0) return newNodes;
        const existingIds = new Set(prevNodes.map(n => n.id));
        const addedNodes = newNodes.filter(n => !existingIds.has(n.id));
        
        // Update labels for existing nodes while keeping their dragged positions
        const updatedPrev = prevNodes.map(n => {
           const match = newNodes.find(nn => nn.id === n.id);
           if (match) return { ...n, data: match.data };
           return n;
        });
        
        return [...updatedPrev, ...addedNodes];
      });
      
      setEdges(newEdges);
    }
  }, [notes, links, setNodes, setEdges]);

  const onNodeClick = useCallback((event: any, node: any) => {
    setActiveNoteId(node.id);
    setViewMode('editor');
  }, [setActiveNoteId, setViewMode]);

  return (
    <div className="flex-1 w-full h-full bg-zinc-950 relative">
      <div className="absolute top-4 left-6 z-10">
        <h2 className="text-xl font-bold text-white/90">Spatial Canvas</h2>
        <p className="text-sm text-zinc-500">Drag notes around. Click a note to edit.</p>
      </div>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={onNodeClick}
        colorMode="dark"
        fitView
      >
        <Controls className="bg-zinc-900 border-zinc-800 fill-zinc-400" />
        <MiniMap 
          nodeStrokeColor="rgba(255,255,255,0.1)" 
          nodeColor="rgba(24,24,27,1)" 
          maskColor="rgba(0,0,0,0.7)" 
          className="bg-black"
        />
        <Background gap={16} size={1} color="rgba(255,255,255,0.05)" />
      </ReactFlow>
    </div>
  );
}
