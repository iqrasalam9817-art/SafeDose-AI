import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { useApp } from '../../stores/AppContext';
import { Medication, Interaction } from '../../types';
import {
  Network,
  Info,
  Maximize2,
  RotateCcw,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  X
} from 'lucide-react';

interface NodeDatum extends d3.SimulationNodeDatum {
  id: string;
  name: string;
  dosage: string;
  drugClass: string;
  hasCritical: boolean;
  hasCaution: boolean;
}

interface LinkDatum extends d3.SimulationLinkDatum<NodeDatum> {
  severity: string;
  explanation: string;
}

export const MedMapView: React.FC = () => {
  const { medications, interactions, setActiveDrugDetail } = useApp();
  const svgRef = useRef<SVGSVGElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const [selectedNode, setSelectedNode] = useState<Medication | null>(null);
  const [selectedLink, setSelectedLink] = useState<Interaction | null>(null);

  useEffect(() => {
    if (!svgRef.current || !containerRef.current || medications.length === 0) return;

    const width = containerRef.current.clientWidth || 800;
    const height = 540;

    // Clear previous SVG contents
    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    svg.attr('viewBox', `0 0 ${width} ${height}`).attr('width', '100%').attr('height', height);

    // Filter interactions involving our active medications
    const medNames = new Set(medications.map(m => m.drugName.toLowerCase()));

    // Prepare Nodes
    const nodes: NodeDatum[] = medications.map(med => {
      const medNameLower = med.drugName.toLowerCase();
      const hasCritical = interactions.some(
        i =>
          (i.severity === 'critical' || i.severity === 'deadly') &&
          !i.dismissed &&
          (i.drugAName.toLowerCase().includes(medNameLower) || i.drugBName.toLowerCase().includes(medNameLower))
      );
      const hasCaution = interactions.some(
        i =>
          i.severity === 'caution' &&
          !i.dismissed &&
          (i.drugAName.toLowerCase().includes(medNameLower) || i.drugBName.toLowerCase().includes(medNameLower))
      );

      return {
        id: med.id,
        name: med.drugName,
        dosage: `${med.dosage}${med.dosageUnit}`,
        drugClass: med.drugClass,
        hasCritical,
        hasCaution,
        x: width / 2 + (Math.random() - 0.5) * 200,
        y: height / 2 + (Math.random() - 0.5) * 200
      };
    });

    // Prepare Links
    const links: LinkDatum[] = [];
    interactions.forEach(inter => {
      if (inter.dismissed) return;
      const sourceNode = nodes.find(n => inter.drugAName.toLowerCase().includes(n.name.toLowerCase()));
      const targetNode = nodes.find(n => inter.drugBName.toLowerCase().includes(n.name.toLowerCase()));

      if (sourceNode && targetNode && sourceNode.id !== targetNode.id) {
        links.push({
          source: sourceNode,
          target: targetNode,
          severity: inter.severity,
          explanation: inter.aiExplanation
        });
      }
    });

    // Root Group with Zoom & Pan
    const g = svg.append('g');

    const zoom = d3
      .zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.5, 2.5])
      .on('zoom', event => {
        g.attr('transform', event.transform);
      });

    svg.call(zoom);

    // Defs for glowing filters
    const defs = svg.append('defs');
    const filter = defs.append('filter').attr('id', 'glow');
    filter.append('feGaussianBlur').attr('stdDeviation', '4').attr('result', 'coloredBlur');
    const feMerge = filter.append('feMerge');
    feMerge.append('feMergeNode').attr('in', 'coloredBlur');
    feMerge.append('feMergeNode').attr('in', 'SourceGraphic');

    // Force Simulation
    const simulation = d3
      .forceSimulation<NodeDatum>(nodes)
      .force(
        'link',
        d3
          .forceLink<NodeDatum, LinkDatum>(links)
          .id(d => d.id)
          .distance(160)
      )
      .force('charge', d3.forceManyBody().strength(-450))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide().radius(48));

    // Draw Links
    const link = g
      .append('g')
      .attr('class', 'links')
      .selectAll('line')
      .data(links)
      .enter()
      .append('line')
      .attr('stroke', d => {
        if (d.severity === 'critical' || d.severity === 'deadly') return '#EF4444';
        if (d.severity === 'caution') return '#F59E0B';
        return '#10B981';
      })
      .attr('stroke-width', d => (d.severity === 'critical' || d.severity === 'deadly' ? 3.5 : 2))
      .attr('stroke-dasharray', d => (d.severity === 'critical' || d.severity === 'deadly' ? '6,4' : 'none'))
      .attr('stroke-opacity', 0.8)
      .style('cursor', 'pointer')
      .on('click', (event, d) => {
        event.stopPropagation();
        const sourceName = (d.source as NodeDatum).name;
        const targetName = (d.target as NodeDatum).name;
        const found = interactions.find(
          i =>
            (i.drugAName.includes(sourceName) && i.drugBName.includes(targetName)) ||
            (i.drugAName.includes(targetName) && i.drugBName.includes(sourceName))
        );
        if (found) setSelectedLink(found);
      });

    // Draw Node Groups
    const node = g
      .append('g')
      .attr('class', 'nodes')
      .selectAll('g')
      .data(nodes)
      .enter()
      .append('g')
      .style('cursor', 'pointer')
      .call(
        d3
          .drag<SVGGElement, NodeDatum>()
          .on('start', (event, d) => {
            if (!event.active) simulation.alphaTarget(0.3).restart();
            d.fx = d.x;
            d.fy = d.y;
          })
          .on('drag', (event, d) => {
            d.fx = event.x;
            d.fy = event.y;
          })
          .on('end', (event, d) => {
            if (!event.active) simulation.alphaTarget(0);
            d.fx = null;
            d.fy = null;
          })
      );

    // Node Outer Glow Ring
    node
      .append('circle')
      .attr('r', 32)
      .attr('fill', d => {
        if (d.hasCritical) return 'rgba(239, 68, 68, 0.15)';
        if (d.hasCaution) return 'rgba(245, 158, 11, 0.15)';
        return 'rgba(16, 185, 129, 0.15)';
      })
      .attr('stroke', d => {
        if (d.hasCritical) return '#EF4444';
        if (d.hasCaution) return '#F59E0B';
        return '#10B981';
      })
      .attr('stroke-width', 2);

    // Node Inner Body
    node
      .append('circle')
      .attr('r', 24)
      .attr('fill', '#FFFFFF')
      .attr('stroke', '#0F172A')
      .attr('stroke-width', 2);

    // Pill Icon inside node
    node
      .append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', '0.35em')
      .attr('font-size', '16px')
      .text('💊');

    // Drug Name Label
    node
      .append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', '44px')
      .attr('font-size', '11px')
      .attr('font-weight', '900')
      .attr('fill', '#0F172A')
      .text(d => d.name);

    // Dosage Sub-label
    node
      .append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', '57px')
      .attr('font-size', '10px')
      .attr('font-family', 'monospace')
      .attr('font-weight', '700')
      .attr('fill', '#64748B')
      .text(d => d.dosage);

    // Node Click Handlers
    node.on('click', (event, d) => {
      event.stopPropagation();
      const med = medications.find(m => m.id === d.id);
      if (med) setSelectedNode(med);
    });

    // Update Simulation on Ticks
    simulation.on('tick', () => {
      link
        .attr('x1', d => (d.source as NodeDatum).x || 0)
        .attr('y1', d => (d.source as NodeDatum).y || 0)
        .attr('x2', d => (d.target as NodeDatum).x || 0)
        .attr('y2', d => (d.target as NodeDatum).y || 0);

      node.attr('transform', d => `translate(${d.x || 0},${d.y || 0})`);
    });

    return () => {
      simulation.stop();
    };
  }, [medications, interactions]);

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            <Network className="w-6 h-6 text-slate-900" />
            <span>Interactive Medication Network Map</span>
          </h2>
          <p className="text-xs font-medium text-slate-500 mt-1">
            Visual topology of your active medications and their pharmacological connections. Drag nodes or click connections to inspect.
          </p>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-2.5 text-xs bg-white p-2 rounded-full border border-slate-200 shadow-2xs">
          <span className="flex items-center gap-1.5 text-red-600 font-black uppercase text-[11px] tracking-tight">
            <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-pulse" /> Critical
          </span>
          <span className="text-slate-300">•</span>
          <span className="flex items-center gap-1.5 text-amber-600 font-black uppercase text-[11px] tracking-tight">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> Caution
          </span>
          <span className="text-slate-300">•</span>
          <span className="flex items-center gap-1.5 text-emerald-700 font-black uppercase text-[11px] tracking-tight">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" /> Safe Pair
          </span>
        </div>
      </div>

      {/* Main Canvas Container */}
      <div
        ref={containerRef}
        className="relative overflow-hidden rounded-3xl bg-slate-100/70 border border-slate-200 shadow-sm p-2 min-h-[540px] flex items-center justify-center"
      >
        <svg ref={svgRef} className="w-full h-full min-h-[540px]" />

        {/* Controls Overlay */}
        <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md px-3.5 py-2 rounded-full border border-slate-200 text-xs font-bold text-slate-600 flex items-center gap-2 shadow-2xs">
          <span>💡 Scroll to Zoom • Drag to Move • Click node/link to inspect</span>
        </div>

        {/* Floating Selected Node Drawer */}
        {selectedNode && (
          <div className="absolute bottom-4 left-4 right-4 sm:right-auto sm:w-80 bg-white border border-slate-200 rounded-3xl p-5 shadow-xl z-20 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-widest text-slate-500">
                Selected Medication
              </span>
              <button
                onClick={() => setSelectedNode(null)}
                className="text-slate-400 hover:text-slate-900 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-900 tracking-tight">{selectedNode.drugName}</h3>
              <p className="text-xs text-slate-500 font-medium">{selectedNode.drugClass}</p>
            </div>
            <div className="text-xs text-slate-700 font-medium">
              <span>⏰ Frequency: <strong>{selectedNode.frequency}</strong></span>
              <span className="block mt-1">🍽️ {selectedNode.withFood ? 'Take with food' : 'With or without food'}</span>
            </div>
            <button
              onClick={() => setActiveDrugDetail(selectedNode)}
              className="w-full py-2.5 rounded-full bg-slate-900 hover:bg-black text-white text-xs font-black uppercase tracking-tight transition-all cursor-pointer shadow-xs"
            >
              Open Full Drug Monograph →
            </button>
          </div>
        )}

        {/* Floating Selected Link Drawer */}
        {selectedLink && (
          <div className="absolute bottom-4 right-4 left-4 sm:left-auto sm:w-96 bg-white border border-red-200 rounded-3xl p-5 shadow-xl z-20 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-red-600 uppercase tracking-tight flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5" /> Interaction Details
              </span>
              <button
                onClick={() => setSelectedLink(null)}
                className="text-slate-400 hover:text-slate-900 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="text-sm font-black text-slate-900">
              💊 {selectedLink.drugAName} ⟷ 💊 {selectedLink.drugBName}
            </div>
            <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 border border-slate-200 p-3 rounded-2xl font-medium">
              {selectedLink.aiExplanation}
            </p>
            <div className="text-[11px] text-emerald-800 font-bold">
              <strong>Action:</strong> {selectedLink.actionRequired}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
