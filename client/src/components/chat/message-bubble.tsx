import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BarChart, Download, User, Bot } from "lucide-react";

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
}

export function MessageBubble({ message, onShowVisualization }: MessageBubbleProps) {
  const isUser = message.role === "user";

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
    <div className={`flex items-start space-x-3 ${isUser ? "justify-end" : ""}`} data-testid={`message-${message.id}`}>
      {!isUser && (
        <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
          <Bot className="w-5 h-5 text-primary-foreground" />
        </div>
      )}
      
      <div className={`message-bubble ${isUser ? 'bg-primary text-primary-foreground' : 'bg-card border border-border'} p-4 rounded-lg shadow-sm`}>
        {!isUser && message.data?.statistics && (
          <div className="font-medium text-primary mb-3" data-testid="response-title">
            {message.data.statistics ? `${Object.keys(message.data.statistics)[0]} Groundwater Assessment` : "INGRES AI Assistant"}
          </div>
        )}
        
        <div className="leading-relaxed whitespace-pre-wrap" data-testid="message-content">
          {message.content}
        </div>

        {/* Data Visualization for AI responses */}
        {!isUser && message.data && (
          <div className="mt-4 space-y-4">
            {/* Summary Cards */}
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

            {/* Detailed Statistics */}
            {message.data.statistics && (
              <Card className="bg-muted p-4">
                <h4 className="font-semibold mb-3">Key Statistics</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Annual Extractable Resource:</span>
                    <span className="font-medium" data-testid="extractable-resource">
                      {message.data.statistics.totalExtractableResource?.toFixed(2) || 'N/A'} BCM
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Annual Extraction:</span>
                    <span className="font-medium" data-testid="annual-extraction">
                      {message.data.statistics.totalExtraction?.toFixed(2) || 'N/A'} BCM
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Stage of Extraction:</span>
                    <span className="font-medium" data-testid="extraction-stage">
                      {message.data.statistics.averageStageOfExtraction?.toFixed(1) || 'N/A'}%
                    </span>
                  </div>
                </div>
              </Card>
            )}

            {/* Assessment Data */}
            {message.data.assessments && message.data.assessments.length > 0 && (
              <Card className="border border-border p-4">
                <h4 className="font-semibold mb-3">Assessment Details</h4>
                <div className="space-y-2">
                  {message.data.assessments.slice(0, 3).map((assessment: any, index: number) => (
                    <div key={index} className={`flex items-center justify-between p-2 rounded border ${getCategoryColor(assessment.category)}`}>
                      <div className="flex items-center">
                        <div className={`w-3 h-3 rounded-full mr-2 ${
                          assessment.category === 'Safe' ? 'bg-green-500' :
                          assessment.category === 'Semi-Critical' ? 'bg-yellow-500' :
                          assessment.category === 'Critical' ? 'bg-orange-500' :
                          'bg-red-500'
                        }`}></div>
                        <span className="text-sm font-medium" data-testid={`assessment-district-${index}`}>
                          {assessment.district}
                        </span>
                      </div>
                      <Badge variant="outline" className={`text-xs ${getCategoryColor(assessment.category)}`}>
                        {assessment.category}
                      </Badge>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* Action Buttons */}
            <div className="flex space-x-2">
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
                className="border-secondary text-secondary hover:bg-secondary hover:text-secondary-foreground"
                data-testid="download-report-button"
              >
                <Download className="w-4 h-4 mr-1" />
                Download Report
              </Button>
            </div>

            {/* Follow-up Questions */}
            {message.data.followUpQuestions && message.data.followUpQuestions.length > 0 && (
              <div className="mt-4">
                <div className="text-sm font-medium text-muted-foreground mb-2">You might also ask:</div>
                <div className="space-y-1">
                  {message.data.followUpQuestions.map((question: string, index: number) => (
                    <Button
                      key={index}
                      variant="ghost"
                      size="sm"
                      className="text-xs text-left justify-start h-auto p-2 w-full hover:bg-muted"
                      data-testid={`follow-up-${index}`}
                    >
                      {question}
                    </Button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {isUser && (
        <div className="w-10 h-10 bg-secondary rounded-full flex items-center justify-center flex-shrink-0">
          <User className="w-5 h-5 text-secondary-foreground" />
        </div>
      )}
    </div>
  );
}
