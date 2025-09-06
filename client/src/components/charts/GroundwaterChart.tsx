import { useEffect, useRef } from 'react';
import { Chart, ChartConfiguration, registerables } from 'chart.js';

Chart.register(...registerables);

interface GroundwaterData {
  extractionPercentage: number;
  category: string;
  location: string;
  rechargeRate?: number;
}

interface GroundwaterChartProps {
  data: GroundwaterData;
  type?: 'gauge' | 'bar' | 'comparison';
}

export function GroundwaterChart({ data, type = 'gauge' }: GroundwaterChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chartRef = useRef<Chart | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    // Destroy existing chart
    if (chartRef.current) {
      chartRef.current.destroy();
    }

    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;

    let config: ChartConfiguration;

    if (type === 'gauge') {
      // Gauge chart for extraction percentage
      const getColor = (percentage: number) => {
        if (percentage < 70) return '#22c55e'; // Green - Safe
        if (percentage < 90) return '#eab308'; // Yellow - Semi-Critical
        if (percentage < 100) return '#f97316'; // Orange - Critical
        return '#ef4444'; // Red - Over-Exploited
      };

      config = {
        type: 'doughnut',
        data: {
          datasets: [{
            data: [data.extractionPercentage, 100 - data.extractionPercentage],
            backgroundColor: [getColor(data.extractionPercentage), '#e5e7eb'],
            borderWidth: 0,
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          cutout: '70%',
          plugins: {
            legend: { display: false },
            tooltip: { enabled: false }
          },
        }
      };
    } else if (type === 'bar') {
      // Bar chart for comparison
      config = {
        type: 'bar',
        data: {
          labels: ['Extraction', 'Safe Limit'],
          datasets: [{
            data: [data.extractionPercentage, 100],
            backgroundColor: ['#3b82f6', '#e5e7eb'],
            borderRadius: 4,
            barThickness: 40,
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            y: { beginAtZero: true, max: 120 }
          },
          plugins: {
            legend: { display: false }
          }
        }
      };
    } else {
      // Comparison chart
      config = {
        type: 'bar',
        data: {
          labels: ['Current', 'Recharge'],
          datasets: [{
            data: [data.extractionPercentage, data.rechargeRate || 50],
            backgroundColor: ['#ef4444', '#22c55e'],
            borderRadius: 4,
            barThickness: 30,
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          indexAxis: 'y' as const,
          plugins: {
            legend: { display: false }
          }
        }
      };
    }

    chartRef.current = new Chart(ctx, config);

    return () => {
      if (chartRef.current) {
        chartRef.current.destroy();
      }
    };
  }, [data, type]);

  const getCategoryColor = (category: string) => {
    switch (category.toLowerCase()) {
      case 'safe': return 'text-green-600';
      case 'semi-critical': return 'text-yellow-600';
      case 'critical': return 'text-orange-600';
      case 'over-exploited': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="bg-card rounded-lg p-4 border" data-testid="groundwater-chart">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-sm">{data.location}</h3>
        <span className={`text-xs font-medium px-2 py-1 rounded ${getCategoryColor(data.category)}`}>
          {data.category}
        </span>
      </div>
      
      <div className="relative h-32 mb-3">
        <canvas ref={canvasRef} />
        {type === 'gauge' && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="text-xl font-bold">{data.extractionPercentage}%</div>
              <div className="text-xs text-muted-foreground">Extraction</div>
            </div>
          </div>
        )}
      </div>
      
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>Extraction: {data.extractionPercentage}%</span>
        {data.rechargeRate && <span>Recharge: {data.rechargeRate}%</span>}
      </div>
    </div>
  );
}