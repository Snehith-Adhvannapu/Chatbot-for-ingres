import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BarChart, Download, User, Bot, Volume2, VolumeX, Info, ChevronDown, ChevronUp, TrendingUp, Languages } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { GroundwaterChart } from "@/components/charts/GroundwaterChart";
import { GroundwaterDataCard } from "@/components/data/GroundwaterDataCard";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  data?: {
    assessments?: any[];
    statistics?: any;
    followUpQuestions?: string[];
  };
}

interface MessageBubbleProps {
  message: Message;
  onShowVisualization?: () => void;
  onReadAloud?: (text: string) => void;
  onSendMessage?: (message: string) => void;
  isReading?: boolean;
}

const downloadReport = (data: any, filename: string = 'groundwater_report') => {
  const csvContent = generateCSV(data);
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

const generateCSV = (data: any): string => {
  if (!data) return '';
  
  let csv = '';
  
  // Add statistics if available
  if (data.statistics) {
    csv += 'State Statistics\n';
    csv += 'Metric,Value\n';
    csv += `Total Blocks,${data.statistics.totalBlocks || 'N/A'}\n`;
    csv += `Safe Units,${data.statistics.safe || 'N/A'}\n`;
    csv += `Semi-Critical Units,${data.statistics.semiCritical || 'N/A'}\n`;
    csv += `Critical Units,${data.statistics.critical || 'N/A'}\n`;
    csv += `Over-Exploited Units,${data.statistics.overExploited || 'N/A'}\n`;
    csv += `Total Extractable Resource (BCM),${data.statistics.totalExtractableResource || 'N/A'}\n`;
    csv += `Total Extraction (BCM),${data.statistics.totalExtraction || 'N/A'}\n`;
    csv += `Average Stage of Extraction (%),${data.statistics.averageStageOfExtraction || 'N/A'}\n\n`;
  }
  
  // Add assessment details if available
  if (data.assessments && data.assessments.length > 0) {
    csv += 'Assessment Details\n';
    csv += 'State,District,Block,Year,Annual Recharge (BCM),Extractable Resource (BCM),Annual Extraction (BCM),Stage of Extraction (%),Category\n';
    data.assessments.forEach((assessment: any) => {
      csv += `${assessment.state},${assessment.district},${assessment.block},${assessment.year},${assessment.annualRecharge},${assessment.extractableResource},${assessment.annualExtraction},${assessment.stageOfExtraction},${assessment.category}\n`;
    });
  }
  
  return csv;
};

export function MessageBubble({ message, onShowVisualization, onReadAloud, onSendMessage, isReading }: MessageBubbleProps) {
  const isUser = message.role === "user";
  const [showDataCards, setShowDataCards] = useState(false);
  const [translatedText, setTranslatedText] = useState<string | null>(null);
  const [isTranslating, setIsTranslating] = useState(false);

  const getCategoryColor = (category: string) => {
    switch (category.toLowerCase()) {
      case "safe":
        return "bg-green-100 text-green-800 border-green-200";
      case "semi-critical":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "critical":
        return "bg-orange-100 text-orange-800 border-orange-200";
      case "over-exploited":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-muted text-muted-foreground border-border";
    }
  };

  return (
    <div className={`flex items-start space-x-4 ${isUser ? "justify-end" : ""}`} data-testid={`message-${message.id}`}>
      {!isUser && (
        <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center flex-shrink-0 mt-1">
          <Bot className="w-6 h-6 text-primary-foreground" />
        </div>
      )}
      
      <div className={`message-bubble ${isUser ? 'bg-primary text-primary-foreground' : 'bg-card border border-border'} p-6 rounded-lg shadow-sm`}>
        {!isUser && message.data?.statistics && (
          <div className="font-medium text-primary mb-3" data-testid="response-title">
            {message.data.statistics ? `${Object.keys(message.data.statistics)[0]} Groundwater Assessment` : "INGRES AI Assistant"}
          </div>
        )}
        
        <div className="leading-relaxed prose prose-sm max-w-none dark:prose-invert" data-testid="message-content">
          {isUser ? (
            <div className="whitespace-pre-wrap">{message.content}</div>
          ) : (
            <ReactMarkdown 
              remarkPlugins={[remarkGfm]}
              components={{
                p: ({ children }) => <p className="mb-3 last:mb-0">{children}</p>,
                ul: ({ children }) => <ul className="mb-3 ml-4 list-disc">{children}</ul>,
                ol: ({ children }) => <ol className="mb-3 ml-4 list-decimal">{children}</ol>,
                li: ({ children }) => <li className="mb-1">{children}</li>,
                strong: ({ children }) => <strong className="font-semibold text-primary">{children}</strong>,
                em: ({ children }) => <em className="italic text-muted-foreground">{children}</em>,
                h3: ({ children }) => <h3 className="text-lg font-semibold mb-2 text-primary">{children}</h3>,
                h4: ({ children }) => <h4 className="text-md font-medium mb-2">{children}</h4>,
                blockquote: ({ children }) => <blockquote className="border-l-4 border-primary pl-4 my-3 italic">{children}</blockquote>
              }}
            >
              {translatedText || message.content}
            </ReactMarkdown>
          )}
        </div>

        {/* Data Visualization for AI responses */}
        {!isUser && message.data && (
          <div className="mt-4 space-y-4">
            {/* Contextual Disclaimer */}
            {message.data.assessments && message.data.assessments.length > 0 && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-start space-x-2">
                <Info className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-blue-800">
                  <strong>Data Source:</strong> Data shown below is from {message.data.assessments[0]?.state || 'available'} districts as per the latest CGWB report.
                </div>
              </div>
            )}

            {/* Data Cards Toggle Button */}
            {message.data.assessments && message.data.assessments.length > 0 && (
              <div className="space-y-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowDataCards(!showDataCards)}
                  className="w-full justify-between"
                  data-testid="toggle-data-cards"
                >
                  <span className="font-medium">View Detailed Assessment Data ({message.data.assessments.length} regions)</span>
                  {showDataCards ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </Button>
                
                {/* Data Cards Section - Collapsible */}
                {showDataCards && (
                  <div className="space-y-3 animate-in slide-in-from-top-2">
                    <h4 className="font-semibold text-gray-900">Groundwater Assessment Results</h4>
                    <div className="grid grid-cols-1 gap-4">
                      {message.data.assessments.slice(0, 6).map((assessment: any, index: number) => (
                        <GroundwaterDataCard
                          key={index}
                          region={assessment.district || assessment.block || 'Unknown Region'}
                          state={assessment.state || 'Unknown State'}
                          extractionPercentage={assessment.stageOfExtraction || 0}
                          rechargeRate={assessment.annualRecharge && assessment.extractableResource ? 
                            (assessment.annualRecharge / assessment.extractableResource) * 100 : undefined}
                          category={assessment.category || 'Unassessed'}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Summary Statistics */}
            {message.data.statistics && (
              <div className="grid grid-cols-2 gap-3">
                <Card className="bg-green-50 border-green-200 p-3">
                  <div className="text-green-800 font-semibold text-sm">Safe Units</div>
                  <div className="text-xl font-bold text-green-900" data-testid="safe-units">
                    {message.data.statistics.safe || 0}
                  </div>
                  <div className="text-xs text-green-600">
                    {message.data.statistics.totalBlocks 
                      ? `${((message.data.statistics.safe / message.data.statistics.totalBlocks) * 100).toFixed(1)}% of total blocks`
                      : 'of total blocks'
                    }
                  </div>
                </Card>
                <Card className="bg-red-50 border-red-200 p-3">
                  <div className="text-red-800 font-semibold text-sm">Over-Exploited</div>
                  <div className="text-xl font-bold text-red-900" data-testid="over-exploited-units">
                    {message.data.statistics.overExploited || 0}
                  </div>
                  <div className="text-xs text-red-600">
                    {message.data.statistics.totalBlocks 
                      ? `${((message.data.statistics.overExploited / message.data.statistics.totalBlocks) * 100).toFixed(1)}% of total blocks`
                      : 'of total blocks'
                    }
                  </div>
                </Card>
              </div>
            )}



            {/* Action Buttons */}
            <div className="flex flex-wrap gap-2">
              <Button
                size="sm"
                onClick={onShowVisualization}
                className="bg-primary text-primary-foreground hover:bg-primary/90"
                data-testid="view-charts-button"
              >
                <BarChart className="w-4 h-4 mr-1" />
                View Charts
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => downloadReport(message.data, `ingres_groundwater_report_${Date.now()}`)}
                className="border-secondary text-secondary hover:bg-secondary hover:text-secondary-foreground"
                data-testid="download-report-button"
              >
                <Download className="w-4 h-4 mr-1" />
                Download Report
              </Button>
              {message.data?.assessments && message.data.assessments.length > 0 && onSendMessage && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    const state = message.data?.assessments?.[0]?.state || 'this region';
                    onSendMessage(`Show historical trends for ${state} over the past 5 years`);
                  }}
                  className="border-blue-300 text-blue-600 hover:bg-blue-50"
                  data-testid="historical-trends-button"
                >
                  <TrendingUp className="w-4 h-4 mr-1" />
                  See Historical Trends
                </Button>
              )}
              {/* Translation Button */}
              <Button
                size="sm"
                variant="outline"
                onClick={async () => {
                  if (translatedText) {
                    setTranslatedText(null);
                    return;
                  }
                  
                  setIsTranslating(true);
                  try {
                    const response = await fetch('/api/translate', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ text: message.content, language: 'hi' })
                    });
                    const data = await response.json();
                    setTranslatedText(data.translatedText);
                  } catch (error) {
                    console.error('Translation error:', error);
                  } finally {
                    setIsTranslating(false);
                  }
                }}
                className="border-purple-300 text-purple-600 hover:bg-purple-50"
                data-testid="translate-button"
                disabled={isTranslating}
              >
                <Languages className="w-4 h-4 mr-1" />
                {isTranslating ? 'Translating...' : translatedText ? 'Show Original' : 'Translate'}
              </Button>
              {onReadAloud && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onReadAloud(translatedText || message.content)}
                  className="border-green-300 text-green-600 hover:bg-green-50"
                  data-testid="read-aloud-button"
                >
                  {isReading ? <VolumeX className="w-4 h-4 mr-1" /> : <Volume2 className="w-4 h-4 mr-1" />}
                  {isReading ? 'Stop Reading' : 'Read Aloud'}
                </Button>
              )}
            </div>

          </div>
        )}
      </div>

      {isUser && (
        <div className="w-12 h-12 bg-secondary rounded-full flex items-center justify-center flex-shrink-0 mt-1">
          <User className="w-6 h-6 text-secondary-foreground" />
        </div>
      )}
    </div>
  );
}
