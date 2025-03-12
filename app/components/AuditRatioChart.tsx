'use client';

import { useEffect, useRef, useState } from 'react';
import { AuditData } from '@/app/lib/dataProcessing';

interface AuditRatioChartProps {
  data: AuditData;
}

interface TooltipData {
  show: boolean;
  x: number;
  y: number;
  content: string;
}

export default function AuditRatioChart({ data }: AuditRatioChartProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [chartData, setChartData] = useState(data);
  const [tooltip, setTooltip] = useState<TooltipData>({ show: false, x: 0, y: 0, content: '' });

  useEffect(() => {
    setChartData(data);
  }, [data]);

  useEffect(() => {
    if (!svgRef.current) return;
    const svg = svgRef.current;

    const drawChart = () => {
      const total = chartData.done + chartData.received;
      if (total === 0) {
        // Draw empty circle
        const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        circle.setAttribute('cx', '150');
        circle.setAttribute('cy', '150');
        circle.setAttribute('r', '100');
        circle.setAttribute('fill', '#e0e0e0');
        svg.innerHTML = '';
        svg.appendChild(circle);
        return;
      }

      // Use actual done and received values for the pie chart
      const donePercentage = (chartData.done / total) * 100;
      const receivedPercentage = (chartData.received / total) * 100;

      // Calculate pie chart segments
      const radius = 100;
      const centerX = 150;
      const centerY = 150;

      // Convert percentage to radians
      const doneRadians = (donePercentage / 100) * Math.PI * 2;
      
      // Calculate points for pie segments
      const doneX = centerX + radius * Math.cos(doneRadians);
      const doneY = centerY + radius * Math.sin(doneRadians);

      // Clear existing content
      while (svg.firstChild) {
        svg.removeChild(svg.firstChild);
      }

      // Create and append paths
      const doneSector = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      doneSector.setAttribute('d', `
        M ${centerX} ${centerY}
        L ${centerX + radius} ${centerY}
        A ${radius} ${radius} 0 ${donePercentage > 50 ? '1' : '0'} 1 ${doneX} ${doneY}
        Z
      `);
      doneSector.setAttribute('fill', '#8B5CF6');
      doneSector.setAttribute('class', 'cursor-pointer transition-opacity hover:opacity-90');

      const receivedSector = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      receivedSector.setAttribute('d', `
        M ${centerX} ${centerY}
        L ${doneX} ${doneY}
        A ${radius} ${radius} 0 ${receivedPercentage > 50 ? '1' : '0'} 1 ${centerX + radius} ${centerY}
        Z
      `);
      receivedSector.setAttribute('fill', '#60A5FA');
      receivedSector.setAttribute('class', 'cursor-pointer transition-opacity hover:opacity-90');

      // Add event listeners for tooltips
      doneSector.addEventListener('mousemove', (e) => {
        const rect = svg.getBoundingClientRect();
        setTooltip({
          show: true,
          x: e.clientX - rect.left,
          y: e.clientY - rect.top,
          content: `Done: ${formatMB(chartData.done)} (${donePercentage.toFixed(1)}%)`
        });
      });

      doneSector.addEventListener('mouseleave', () => {
        setTooltip({ show: false, x: 0, y: 0, content: '' });
      });

      receivedSector.addEventListener('mousemove', (e) => {
        const rect = svg.getBoundingClientRect();
        setTooltip({
          show: true,
          x: e.clientX - rect.left,
          y: e.clientY - rect.top,
          content: `Received: ${formatMB(chartData.received)} (${receivedPercentage.toFixed(1)}%)`
        });
      });

      receivedSector.addEventListener('mouseleave', () => {
        setTooltip({ show: false, x: 0, y: 0, content: '' });
      });

      svg.appendChild(doneSector);
      svg.appendChild(receivedSector);
    };

    drawChart();
  }, [chartData]);

  const formatMB = (bytes: number) => {
    const mb = bytes / 1000000;
    return `${mb.toFixed(2)} MB`;
  };

  if (!data || (data.done === 0 && data.received === 0)) {
    return (
      <div className="w-full">
        <h2 className="text-2xl font-bold mb-6 text-white">
          Audit Statistics
        </h2>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="bg-white/5 backdrop-blur-sm p-4 rounded-xl border border-white/10">
            <h3 className="font-semibold text-white/80">Audits Done</h3>
            <p className="text-2xl text-white">{formatMB(data?.done || 0)}</p>
            <p className="text-sm text-white/60">XP Earned: {data?.doneXP?.toFixed(2) || '0.00'}</p>
          </div>
          <div className="bg-white/5 backdrop-blur-sm p-4 rounded-xl border border-white/10">
            <h3 className="font-semibold text-white/80">Audits Received</h3>
            <p className="text-2xl text-white">{formatMB(data?.received || 0)}</p>
            <p className="text-sm text-white/60">XP Earned: {data?.receivedXP?.toFixed(2) || '0.00'}</p>
          </div>
        </div>
        <p className="text-white/80">No audit data available</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      <h2 className="text-2xl font-bold mb-6 text-white">
        Audit Statistics
      </h2>
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="bg-white/5 backdrop-blur-sm p-4 rounded-xl border border-white/10">
          <h3 className="font-semibold text-white/80">Audits Done</h3>
          <p className="text-2xl text-white">{formatMB(chartData.done)}</p>
        </div>
        <div className="bg-white/5 backdrop-blur-sm p-4 rounded-xl border border-white/10">
          <h3 className="font-semibold text-white/80">Audits Received</h3>
          <p className="text-2xl text-white">{formatMB(chartData.received)}</p>
        </div>
      </div>
      <div className="relative h-[300px]">
        <svg ref={svgRef} width="300" height="300" viewBox="0 0 300 300" className="mx-auto" />
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
        <div className="absolute top-4 right-4 bg-white/5 backdrop-blur-sm px-4 py-2 rounded-lg border border-white/10">
          <p className={`text-lg font-bold ${
            chartData.ratio >= 1 ? 'text-white' : 'text-white/80'
          }`}>
            Ratio: {chartData.ratio.toFixed(2)}
            {chartData.ratio >= 1 ? ' ✓' : ' ⚠️'}
          </p>
        </div>
      </div>
    </div>
  );
} 