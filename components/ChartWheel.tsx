
import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { ZODIAC_SIGNS, PLANETS } from '../constants';

interface ChartWheelProps {
  onExport?: (exportFn: () => void) => void;
  interactive?: boolean;
  className?: string;
}

const ChartWheel: React.FC<ChartWheelProps> = ({ onExport, interactive = true, className = "" }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [tooltip, setTooltip] = useState<{ x: number, y: number, content: string, visible: boolean }>({
    x: 0, y: 0, content: '', visible: false
  });

  const downloadImage = () => {
    if (!svgRef.current) return;
    
    // 克隆 SVG 以便在不干扰当前视图的情况下进行高分辨率导出
    const svgClone = svgRef.current.cloneNode(true) as SVGSVGElement;
    // 重置克隆版的变换，确保导出的是居中完整的星盘
    const g = svgClone.querySelector('g');
    if (g) g.setAttribute('transform', 'translate(300, 300) scale(1)');
    
    const svgData = new XMLSerializer().serializeToString(svgClone);
    const canvas = document.createElement('canvas');
    canvas.width = 2400; // 4x 高清
    canvas.height = 2400;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);

    img.onload = () => {
      ctx.fillStyle = '#020617'; // 填充背景色
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(url);
      const pngUrl = canvas.toDataURL('image/png');
      const downloadLink = document.createElement('a');
      downloadLink.href = pngUrl;
      downloadLink.download = '幸运星_高清专业星盘.png';
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
    };
    img.src = url;
  };

  useEffect(() => {
    if (onExport) {
      onExport(downloadImage);
    }
  }, [onExport]);

  useEffect(() => {
    if (!svgRef.current) return;
    
    const width = 600;
    const height = 600;
    const radius = Math.min(width, height) / 2 - 20;
    
    const svg = d3.select(svgRef.current)
      .attr('viewBox', `0 0 ${width} ${height}`)
      .html(''); 

    const defs = svg.append('defs');
    
    const radialGradient = defs.append('radialGradient').attr('id', 'starWheelGradient');
    radialGradient.append('stop').attr('offset', '0%').attr('stop-color', '#1e293b');
    radialGradient.append('stop').attr('offset', '100%').attr('stop-color', '#020617');

    const glowFilter = defs.append('filter').attr('id', 'glow').attr('x', '-20%').attr('y', '-20%').attr('width', '140%').attr('height', '140%');
    glowFilter.append('feGaussianBlur').attr('stdDeviation', '3').attr('result', 'blur');
    glowFilter.append('feComposite').attr('in', 'SourceGraphic').attr('in2', 'blur').attr('operator', 'over');

    const mainGroup = svg.append('g');

    if (interactive) {
      const zoom = d3.zoom<SVGSVGElement, unknown>()
        .scaleExtent([0.1, 10])
        .on('zoom', (event) => {
          mainGroup.attr('transform', event.transform);
        });
      
      svg.call(zoom);
      
      const initialScale = 1;
      const initialTransform = d3.zoomIdentity
        .translate(width / 2, height / 2)
        .scale(initialScale);
      
      svg.call(zoom.transform, initialTransform);
    } else {
      // 静态渲染（PDF模式）：强制死板居中，不使用 zoom identity，避免偏移
      mainGroup.attr('transform', `translate(${width / 2}, ${height / 2}) scale(1)`);
    }

    mainGroup.append('circle')
       .attr('r', radius)
       .attr('fill', 'url(#starWheelGradient)')
       .attr('stroke', '#334155')
       .attr('stroke-width', 2);

    const pie = d3.pie<any>().value(() => 1).sort(null);
    const arc = d3.arc<any>().innerRadius(radius - 60).outerRadius(radius);
    
    const arcs = mainGroup.selectAll('.arc')
      .data(pie(ZODIAC_SIGNS))
      .enter()
      .append('g')
      .attr('class', 'arc')
      .on('mouseover', function(event, d) {
        if (!interactive) return;
        d3.select(this).select('path').attr('fill', '#1e293b');
        setTooltip({
          x: event.clientX,
          y: event.clientY - 40,
          content: `${d.data.name} (${d.data.en}): ${d.data.date}`,
          visible: true
        });
      })
      .on('mousemove', (event) => {
        if (!interactive) return;
        setTooltip(prev => ({ ...prev, x: event.clientX, y: event.clientY - 40 }));
      })
      .on('mouseout', function() {
        if (!interactive) return;
        d3.select(this).select('path').attr('fill', (d, i) => (i as number) % 2 === 0 ? '#0f172a' : '#020617');
        setTooltip(prev => ({ ...prev, visible: false }));
      });

    arcs.append('path')
      .attr('d', arc)
      .attr('fill', (d, i) => i % 2 === 0 ? '#0f172a' : '#020617')
      .attr('stroke', '#1e293b')
      .attr('stroke-width', 1);

    arcs.append('text')
      .attr('transform', d => `translate(${arc.centroid(d)})`)
      .attr('text-anchor', 'middle')
      .attr('dominant-baseline', 'middle')
      .attr('fill', (d, i) => i % 3 === 0 ? '#fbbf24' : '#94a3b8')
      .attr('font-size', '18px')
      .text(d => d.data.icon);

    for(let i=1; i<=4; i++) {
      mainGroup.append('circle')
        .attr('r', radius - 60 - (i * 45))
        .attr('fill', 'none')
        .attr('stroke', '#1e293b')
        .attr('stroke-width', 1)
        .attr('stroke-dasharray', '2,4');
    }

    PLANETS.forEach((p, i) => {
      const angle = (i * (360 / PLANETS.length) - 90) * (Math.PI / 180);
      const dist = radius - 100 - (i * 15);
      const x = Math.cos(angle) * dist;
      const y = Math.sin(angle) * dist;
      
      const planetG = mainGroup.append('g')
        .attr('class', 'planet-node')
        .style('cursor', interactive ? 'pointer' : 'default')
        .on('mouseover', (event) => {
          if (!interactive) return;
          setTooltip({
            x: event.clientX,
            y: event.clientY - 40,
            content: `${p.name}: 当前能量稳定，适宜开启新事业`,
            visible: true
          });
        })
        .on('mousemove', (event) => {
           if (!interactive) return;
           setTooltip(prev => ({ ...prev, x: event.clientX, y: event.clientY - 40 }));
        })
        .on('mouseout', () => setTooltip(prev => ({ ...prev, visible: false })));

      planetG.append('circle')
        .attr('cx', x)
        .attr('cy', y)
        .attr('r', 15)
        .attr('fill', '#fbbf24')
        .attr('opacity', 0.15)
        .attr('filter', 'url(#glow)');

      planetG.append('text')
        .attr('x', x)
        .attr('y', y)
        .attr('fill', '#fbbf24')
        .attr('font-size', '20px')
        .attr('text-anchor', 'middle')
        .attr('dominant-baseline', 'middle')
        .attr('font-weight', 'bold')
        .text(p.icon);
    });

    mainGroup.append('circle').attr('r', 25).attr('fill', '#020617').attr('stroke', '#334155').attr('stroke-width', 1);
    mainGroup.append('text')
       .attr('text-anchor', 'middle').attr('dominant-baseline', 'middle').attr('fill', '#475569').attr('font-size', '8px').attr('font-weight', 'black')
       .text('EARTH');

  }, [interactive]);

  return (
    <div 
      ref={containerRef} 
      className={`relative w-full h-full flex justify-center items-center bg-slate-950 overflow-hidden touch-none ${className}`}
    >
      <svg 
        ref={svgRef} 
        className={`w-full h-full transition-all ${interactive ? 'cursor-move' : ''}`}
        preserveAspectRatio="xMidYMid meet"
      ></svg>

      {tooltip.visible && interactive && (
        <div 
          className="fixed z-[999] pointer-events-none bg-slate-900/90 backdrop-blur-md border border-amber-500/30 px-4 py-2 rounded-xl text-xs font-bold text-amber-100 shadow-2xl whitespace-nowrap"
          style={{ left: tooltip.x + 15, top: tooltip.y }}
        >
          {tooltip.content}
        </div>
      )}

      {interactive && (
        <div className="absolute bottom-10 left-10 text-[10px] text-slate-600 font-bold uppercase tracking-widest flex items-center gap-3 bg-slate-900/40 px-4 py-2 rounded-full backdrop-blur-sm">
           <i className="fas fa-mouse"></i> 滚轮缩放 / 拖拽探索宇宙
        </div>
      )}
    </div>
  );
};

export default ChartWheel;
