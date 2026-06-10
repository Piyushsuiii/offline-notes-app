"use client";

import dynamic from "next/dynamic";
import { useEffect, useState, useMemo, useRef } from "react";
import { useStore } from "@/store/useStore";
import { db } from "@/lib/db";
import { useLiveQuery } from "dexie-react-hooks";
import * as THREE from "three";
import { X } from "lucide-react";

// Disable SSR for ForceGraph3D since it uses canvas/window
const ForceGraph3D = dynamic(() => import("react-force-graph-3d"), { ssr: false });

export function GraphView() {
  const { graphView, setGraphView, setActiveNoteId, activeNoteId } = useStore();
  const notes = useLiveQuery(() => db.notes.toArray());
  const links = useLiveQuery(() => db.links.toArray());

  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });

  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      const { width, height } = entries[0].contentRect;
      setDimensions({ width, height });
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [graphView]);

  const graphData = useMemo(() => {
    if (!notes) return { nodes: [], links: [] };
    
    const nodes = notes.map(n => ({ id: n.id, name: n.title || "Untitled" }));
    let graphLinks = links || [];



    return { nodes, links: graphLinks };
  }, [notes, links]);

  if (graphView === 'hidden') return null;

  return (
    <div 
      ref={containerRef}
      className={`relative bg-zinc-950 transition-all duration-500 ease-in-out overflow-hidden shadow-[-10px_0_30px_rgba(0,0,0,0.5)] ${
        graphView === 'fullscreen' ? 'absolute inset-0 z-50' : 'w-1/2 border-l border-white/5'
      }`}
    >
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-indigo-900/20 via-zinc-950 to-zinc-950 pointer-events-none z-0" />
      
      {graphView === 'fullscreen' && (
        <button 
          onClick={() => setGraphView('split')}
          className="absolute top-4 right-4 z-10 p-2 bg-white/10 hover:bg-white/20 rounded-full text-white backdrop-blur-md transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      )}

      {dimensions.width > 0 && (
        <ForceGraph3D
          width={dimensions.width}
          height={dimensions.height}
          graphData={graphData}
          nodeLabel="name"
          nodeRelSize={6}
          linkColor={() => "rgba(99, 102, 241, 0.4)"}
          linkWidth={1.5}
          linkDirectionalParticles={3}
          linkDirectionalParticleWidth={2}
          linkDirectionalParticleSpeed={0.005}
          backgroundColor="rgba(0,0,0,0)" // Transparent to let the gradient show
          onNodeClick={(node: any) => {
            setActiveNoteId(node.id as string);
            if (graphView === 'fullscreen') setGraphView('split');
          }}
          nodeThreeObject={(node: any) => {
            const isActive = node.id === activeNoteId;
            const group = new THREE.Group();
            
            // Core sphere
            const material = new THREE.MeshLambertMaterial({ 
              color: isActive ? '#c7d2fe' : '#818cf8',
              transparent: true,
              opacity: isActive ? 1 : 0.9,
              emissive: isActive ? '#6366f1' : '#3730a3',
              emissiveIntensity: isActive ? 1 : 0.5
            });
            const sphere = new THREE.Mesh(new THREE.SphereGeometry(6), material);
            group.add(sphere);

            // Halo for active node
            if (isActive) {
              const haloMaterial = new THREE.MeshBasicMaterial({
                color: '#818cf8',
                transparent: true,
                opacity: 0.3,
                side: THREE.BackSide
              });
              const halo = new THREE.Mesh(new THREE.SphereGeometry(9), haloMaterial);
              group.add(halo);
            }
            
            return group;
          }}
        />
      )}
    </div>
  );
}
