import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface VisualizationPanelProps {
  data: any;
  onClose: () => void;
}

export function VisualizationPanel({ data, onClose }: VisualizationPanelProps) {
  const [charts, setCharts] = useState<{ statusChart?: any; trendChart?: any }>({});

  useEffect(() => {
    // Initialize charts when data changes
    if (data && typeof window !== 'undefined') {
      initializeCharts();
    }
  }, [data]);

  const initializeCharts = async () => {
    try {
      // Dynamically import Chart.js
      const { Chart, registerables } = await import('chart.js');
      Chart.register(...registerables);

      // Status Distribution Chart
      const statusCanvas = document.getElementById('statusChart') as HTMLCanvasElement;
      if (statusCanvas && data.statistics) {
        const ctx = statusCanvas.getContext('2d');
        if (ctx) {
          const statusChart = new Chart(ctx, {
            type: 'doughnut',
            data: {
              labels: ['Safe', 'Semi-Critical', 'Critical', 'Over-Exploited'],
              datasets: [{
                data: [
                  data.statistics.safe || 0,
                  data.statistics.semiCritical || 0,
                  data.statistics.critical || 0,
                  data.statistics.overExploited || 0
                ],
                backgroundColor: [
                  'hsl(142 76% 36%)',
                  'hsl(43 74% 66%)',
                  'hsl(27 87% 67%)',
                  'hsl(348 83% 47%)'
                ]
              }]
            },
            options: {
              responsive: true,
              plugins: {
                legend: {
                  position: 'bottom'
                }
              }
            }
          });
          setCharts(prev => ({ ...prev, statusChart }));
        }
      }

      // Trend Chart (mock data for now)
      const trendCanvas = document.getElementById('trendChart') as HTMLCanvasElement;
      if (trendCanvas) {
        const ctx = trendCanvas.getContext('2d');
        if (ctx) {
          const trendChart = new Chart(ctx, {
            type: 'line',
            data: {
              labels: ['2018', '2019', '2020', '2021', '2022'],
              datasets: [{
                label: 'Extraction',
                data: [17.2, 17.8, 18.1, 18.6, 18.9],
                borderColor: 'hsl(348 83% 47%)',
                tension: 0.1
              }, {
                label: 'Recharge',
                data: [22.1, 21.8, 22.5, 23.2, 24.3],
                borderColor: 'hsl(213 93% 38%)',
                tension: 0.1
              }]
            },
            options: {
              responsive: true,
              scales: {
                y: {
                  title: {
                    display: true,
                    text: 'BCM'
                  }
                }
              }
            }
          });
          setCharts(prev => ({ ...prev, trendChart }));
        }
      }
    } catch (error) {
      console.error('Error initializing charts:', error);
    }
  };

  useEffect(() => {
    return () => {
      // Cleanup charts on unmount
      Object.values(charts).forEach(chart => {
        if (chart && typeof chart.destroy === 'function') {
          chart.destroy();
        }
      });
    };
  }, [charts]);

  if (!data) return null;

  return (
    <aside className="w-[480px] bg-card border-l border-border overflow-y-auto scrollbar-thin" data-testid="visualization-panel">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold">Data Visualization</h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground"
            data-testid="close-visualization-button"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Chart Container */}
        {data.statistics && (
          <div className="mb-6">
            <h3 className="text-md font-medium mb-3">Assessment Categories</h3>
            <Card className="bg-background p-4 border border-border">
              <canvas id="statusChart" width="300" height="200" data-testid="status-chart"></canvas>
            </Card>
          </div>
        )}

        {/* Trend Chart */}
        <div className="mb-6">
          <h3 className="text-md font-medium mb-3">Extraction vs Recharge Trend</h3>
          <Card className="bg-background p-4 border border-border">
            <canvas id="trendChart" width="300" height="200" data-testid="trend-chart"></canvas>
          </Card>
        </div>

        {/* Key Metrics */}
        {data.statistics && (
          <div className="space-y-4">
            <h3 className="text-md font-medium">Key Metrics</h3>
            
            <div className="grid grid-cols-2 gap-3">
              <Card className="bg-background p-3 border border-border text-center">
                <div className="text-2xl font-bold text-primary" data-testid="total-blocks-metric">
                  {data.statistics.totalBlocks || 'N/A'}
                </div>
                <div className="text-xs text-muted-foreground">Total Blocks</div>
              </Card>
              <Card className="bg-background p-3 border border-border text-center">
                <div className="text-2xl font-bold text-secondary" data-testid="avg-extraction-metric">
                  {data.statistics.averageStageOfExtraction?.toFixed(1) || 'N/A'}%
                </div>
                <div className="text-xs text-muted-foreground">Avg. Extraction</div>
              </Card>
            </div>

            {/* Regional Distribution */}
            <Card className="bg-background p-4 border border-border">
              <h4 className="font-medium mb-3">Resource Distribution</h4>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Extractable Resource</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-16 h-2 bg-muted rounded-full overflow-hidden">
                      <div className="w-full h-full bg-primary"></div>
                    </div>
                    <span className="text-xs" data-testid="extractable-resource-display">
                      {data.statistics.totalExtractableResource?.toFixed(1) || 'N/A'} BCM
                    </span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Annual Extraction</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-16 h-2 bg-muted rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-red-500"
                        style={{ 
                          width: data.statistics.totalExtractableResource 
                            ? `${Math.min(100, (data.statistics.totalExtraction / data.statistics.totalExtractableResource) * 100)}%`
                            : '0%'
                        }}
                      ></div>
                    </div>
                    <span className="text-xs" data-testid="annual-extraction-display">
                      {data.statistics.totalExtraction?.toFixed(1) || 'N/A'} BCM
                    </span>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Assessment Details */}
        {data.assessments && data.assessments.length > 0 && (
          <Card className="bg-background p-4 border border-border mt-4">
            <h4 className="font-medium mb-3">Recent Assessments</h4>
            <div className="space-y-2">
              {data.assessments.slice(0, 5).map((assessment: any, index: number) => (
                <div key={index} className="text-sm">
                  <div className="flex justify-between">
                    <span className="font-medium" data-testid={`assessment-name-${index}`}>
                      {assessment.district}, {assessment.state}
                    </span>
                    <span className={`text-xs px-2 py-1 rounded ${
                      assessment.category === 'Safe' ? 'bg-green-100 text-green-800' :
                      assessment.category === 'Semi-Critical' ? 'bg-yellow-100 text-yellow-800' :
                      assessment.category === 'Critical' ? 'bg-orange-100 text-orange-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {assessment.category}
                    </span>
                  </div>
                  <div className="text-muted-foreground text-xs">
                    Extraction: {assessment.stageOfExtraction?.toFixed(1)}%
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>
    </aside>
  );
}
