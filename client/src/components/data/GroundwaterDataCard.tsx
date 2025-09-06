import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Droplets, TrendingUp, TrendingDown, AlertTriangle } from "lucide-react";

interface GroundwaterDataCardProps {
  region: string;
  state: string;
  extractionPercentage: number;
  rechargeRate?: number;
  category: string;
  explanation?: string;
}

export function GroundwaterDataCard({ 
  region, 
  state, 
  extractionPercentage, 
  rechargeRate, 
  category,
  explanation 
}: GroundwaterDataCardProps) {
  
  const getStatusConfig = (category: string) => {
    switch (category.toLowerCase()) {
      case 'safe':
        return {
          color: 'bg-green-100 text-green-800 border-green-200',
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200',
          icon: Droplets,
          iconColor: 'text-green-600'
        };
      case 'semi-critical':
        return {
          color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
          bgColor: 'bg-yellow-50',
          borderColor: 'border-yellow-200',
          icon: TrendingUp,
          iconColor: 'text-yellow-600'
        };
      case 'critical':
        return {
          color: 'bg-orange-100 text-orange-800 border-orange-200',
          bgColor: 'bg-orange-50',
          borderColor: 'border-orange-200',
          icon: TrendingDown,
          iconColor: 'text-orange-600'
        };
      case 'over-exploited':
        return {
          color: 'bg-red-100 text-red-800 border-red-200',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
          icon: AlertTriangle,
          iconColor: 'text-red-600'
        };
      default:
        return {
          color: 'bg-gray-100 text-gray-800 border-gray-200',
          bgColor: 'bg-gray-50',
          borderColor: 'border-gray-200',
          icon: Droplets,
          iconColor: 'text-gray-600'
        };
    }
  };

  const config = getStatusConfig(category);
  const IconComponent = config.icon;
  
  const getExplanation = () => {
    if (explanation) return explanation;
    
    switch (category.toLowerCase()) {
      case 'safe':
        return "This region is using water sustainably with good natural recharge.";
      case 'semi-critical':
        return "Water usage is approaching unsustainable levels - monitoring needed.";
      case 'critical':
        return "Water extraction is very high - conservation measures recommended.";
      case 'over-exploited':
        return "This region is using more water than it naturally recharges each year.";
      default:
        return "Assessment information is available.";
    }
  };

  return (
    <Card className={`${config.bgColor} ${config.borderColor} border-2 p-4 hover:shadow-md transition-shadow`} data-testid="groundwater-data-card">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="font-semibold text-lg text-gray-900" data-testid="region-name">
            {region}
          </h3>
          <p className="text-sm text-gray-600" data-testid="state-name">{state}</p>
        </div>
        <div className="flex items-center space-x-2">
          <IconComponent className={`w-5 h-5 ${config.iconColor}`} />
          <Badge className={`${config.color} text-xs font-medium`} data-testid="status-badge">
            {category}
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-3">
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-900" data-testid="extraction-percentage">
            {extractionPercentage.toFixed(1)}%
          </div>
          <div className="text-xs text-gray-600">Extraction</div>
        </div>
        {rechargeRate && (
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900" data-testid="recharge-rate">
              {rechargeRate.toFixed(1)}%
            </div>
            <div className="text-xs text-gray-600">Recharge</div>
          </div>
        )}
      </div>

      <div className="text-sm text-gray-700 leading-relaxed" data-testid="explanation">
        <strong>{region}</strong> is <strong>{category}</strong> ({extractionPercentage.toFixed(1)}% extraction). {getExplanation()}
      </div>
    </Card>
  );
}