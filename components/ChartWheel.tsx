
import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { ZODIAC_SIGNS, PLANETS } from '../constants';

const ChartWheel: React.FC = () => {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current) return;
    
    const width = 300;
    const height = 300;
    const radius = Math.min(width, height) / 2;
    
    const svg = d3.select(svgRef.current)
      .attr('viewBox', `0 0 ${width} ${height}`)
      .html('') // Clear
      .append('g')
      .attr('transform', `translate(${width / 2}, ${height / 2})`);

    // Draw background rings
    svg.append('circle').attr('r', radius).attr('fill', 'none').attr('stroke', '#334155').attr('stroke-width', 1);
    svg.append('circle').attr('r', radius - 40).attr('fill', 'none').attr('stroke', '#334155').attr('stroke-width', 1);

    // Draw zodiac segments
    const pie = d3.pie<any>().value(() => 1).sort(null);
    const arc = d3.arc<any>().innerRadius(radius - 40).outerRadius(radius);
    
    const arcs = svg.selectAll('.arc')
      .data(pie(ZODIAC_SIGNS))
      .enter()
      .append('g')
      .attr('class', 'arc');

    arcs.append('path')
      .attr('d', arc)
      .attr('fill', (d, i) => i % 2 === 0 ? '#1e293b' : '#0f172a')
      .attr('stroke', '#334155');

    arcs.append('text')
      .attr('transform', d => `translate(${arc.centroid(d)})`)
      .attr('text-anchor', 'middle')
      .attr('fill', '#94a3b8')
      .attr('font-size', '10px')
      .text(d => d.data.icon);

    // Mock Planets placement
    PLANETS.forEach((p, i) => {
      const angle = (Math.random() * 2 * Math.PI);
      const dist = 50 + Math.random() * 60;
      const x = Math.cos(angle) * dist;
      const y = Math.sin(angle) * dist;
      
      svg.append('text')
        .attr('x', x)
        .attr('y', y)
        .attr('fill', '#fbbf24')
        .attr('font-size', '14px')
        .attr('text-anchor', 'middle')
        .text(p.icon);
    });

    // Inner lines (aspects mock)
    for(let i=0; i<5; i++) {
        const a1 = Math.random() * 2 * Math.PI;
        const a2 = Math.random() * 2 * Math.PI;
        const d = 110;
        svg.append('line')
           .attr('x1', Math.cos(a1) * d)
           .attr('y1', Math.sin(a1) * d)
           .attr('x2', Math.cos(a2) * d)
           .attr('y2', Math.sin(a2) * d)
           .attr('stroke', i%2===0 ? '#f87171' : '#60a5fa')
           .attr('stroke-opacity', 0.4)
           .attr('stroke-width', 1);
    }

  }, []);

  return (
    <div className="flex justify-center p-4 bg-slate-900 rounded-2xl border border-slate-800">
      <svg ref={svgRef} width="100%" height="auto" style={{ maxWidth: '300px' }}></svg>
    </div>
  );
};

export default ChartWheel;
