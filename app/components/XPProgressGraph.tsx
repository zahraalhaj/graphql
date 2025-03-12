'use client';

import { useEffect, useRef, useState } from 'react';
import { LevelDataPoint } from '@/app/lib/dataProcessing';

interface XPProgressGraphProps {
  data: LevelDataPoint[];
  userLevel: number;
}

interface TooltipData {
  show: boolean;
  x: number;
  y: number;
  content: string;
}

export default function XPProgressGraph({ data, userLevel }: XPProgressGraphProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [tooltip, setTooltip] = useState<TooltipData>({ show: false, x: 0, y: 0, content: '' });

  useEffect(() => {
    if (!svgRef.current || data.length === 0) return;

    // Clear existing content
    while (svgRef.current.firstChild) {
      svgRef.current.removeChild(svgRef.current.firstChild);
    }

    // Set dimensions - increased size
    const width = 1000;  // Increased from 800
    const height = 500;  // Increased from 350
    const padding = 80;  // Increased from 60 to maintain proportions

    // Calculate scales
    const maxLevel = Math.max(...data.map(d => d.level));
    const maxCount = Math.max(...data.map(d => d.userCount));
    
    const xScale = (width - 2 * padding) / (maxLevel + 1);
    const yScale = (height - 2 * padding) / maxCount;

    // Create bars
    data.forEach((point) => {
      const bar = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      const x = padding + (point.level * xScale);
      const barHeight = point.userCount * yScale;
      const y = height - padding - barHeight;
      
      bar.setAttribute('x', `${x}`);
      bar.setAttribute('y', `${y}`);
      bar.setAttribute('width', '20');
      bar.setAttribute('height', `${barHeight}`);
      bar.setAttribute('fill', point.level === userLevel 
        ? '#8B5CF6' // Vibrant purple for user's level
        : '#60A5FA' // Lighter blue for other levels
      );
      
      // Add event listeners for tooltip
      bar.addEventListener('mousemove', (e) => {
        const rect = svgRef.current!.getBoundingClientRect();
        setTooltip({
          show: true,
          x: e.clientX - rect.left,
          y: e.clientY - rect.top,
          content: `Level ${point.level}: ${point.userCount} users`
        });
      });

      bar.addEventListener('mouseleave', () => {
        setTooltip({ show: false, x: 0, y: 0, content: '' });
      });
      
      svgRef.current!.appendChild(bar);
    });

    // Add axes
    const xAxis = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    xAxis.setAttribute('x1', `${padding}`);
    xAxis.setAttribute('y1', `${height - padding}`);
    xAxis.setAttribute('x2', `${width - padding}`);
    xAxis.setAttribute('y2', `${height - padding}`);
    xAxis.setAttribute('stroke', 'black');

    const yAxis = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    yAxis.setAttribute('x1', `${padding}`);
    yAxis.setAttribute('y1', `${padding}`);
    yAxis.setAttribute('x2', `${padding}`);
    yAxis.setAttribute('y2', `${height - padding}`);
    yAxis.setAttribute('stroke', 'black');

    svgRef.current.appendChild(xAxis);
    svgRef.current.appendChild(yAxis);

  }, [data, userLevel]);

  return (
    <div className="w-full">
      <h2 className="text-2xl font-bold mb-6 text-white">
        Level Distribution
      </h2>
      <div className="relative w-full flex justify-center">
        <svg 
          ref={svgRef} 
          width="1000" 
          height="500" 
          className="w-full h-auto" 
          preserveAspectRatio="xMidYMid meet" 
          viewBox="0 0 1000 500"
        />
        {tooltip.show && (
          <div
            className="absolute bg-black/80 text-white px-3 py-1.5 rounded-lg text-sm pointer-events-none transform -translate-x-1/2 -translate-y-full"
            style={{
              left: tooltip.x,
              top: tooltip.y - 10,
              zIndex: 10
            }}
          >
            {tooltip.content}
          </div>
        )}
      </div>
      <div className="flex justify-center space-x-4 mt-4">
        <div className="flex items-center">
          <div className="w-4 h-4 bg-[#8B5CF6] mr-2 rounded"></div>
          <span className="text-white/80">Your Level</span>
        </div>
        <div className="flex items-center">
          <div className="w-4 h-4 bg-[#60A5FA] mr-2 rounded"></div>
          <span className="text-white/80">Other Levels</span>
        </div>
      </div>
      <p className="text-sm text-white/60 mt-2">Distribution of users by level</p>
    </div>
  );
} 