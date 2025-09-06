import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { MapPin, TrendingUp, AlertTriangle, History, Trash2 } from "lucide-react";

interface SidebarProps {
  onSuggestedQuery?: (query: string) => void;
}

export function Sidebar({ onSuggestedQuery }: SidebarProps) {
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  const { data: suggestions } = useQuery({
    queryKey: ["/api/search/suggestions"],
  });

  useEffect(() => {
    // Load recent searches from localStorage
    const saved = localStorage.getItem('ingres_recent_searches');
    if (saved) {
      setRecentSearches(JSON.parse(saved));
    }
  }, []);

  const addRecentSearch = (query: string) => {
    const updated = [query, ...recentSearches.filter(q => q !== query)].slice(0, 5);
    setRecentSearches(updated);
    localStorage.setItem('ingres_recent_searches', JSON.stringify(updated));
  };

  const clearRecentSearches = () => {
    setRecentSearches([]);
    localStorage.removeItem('ingres_recent_searches');
  };

  const handleSuggestedQuery = (query: string) => {
    addRecentSearch(query);
    onSuggestedQuery?.(query);
  };

  const suggestedQueries = [
    {
      icon: MapPin,
      text: "What is the groundwater status in Maharashtra?",
    },
    {
      icon: TrendingUp,
      text: "Show recharge data for Gujarat 2022",
    },
    {
      icon: AlertTriangle,
      text: "List over-exploited blocks in Punjab",
    },
    {
      icon: History,
      text: "Historical data for Rajasthan",
    },
  ];

  const categories = [
    { name: "Safe", color: "bg-green-500", bgColor: "bg-green-100", textColor: "text-green-800" },
    { name: "Semi-Critical", color: "bg-yellow-500", bgColor: "bg-yellow-100", textColor: "text-yellow-800" },
    { name: "Critical", color: "bg-orange-500", bgColor: "bg-orange-100", textColor: "text-orange-800" },
    { name: "Over-Exploited", color: "bg-red-500", bgColor: "bg-red-100", textColor: "text-red-800" },
  ];

  return (
    <aside className="w-80 bg-card border-r border-border flex flex-col" data-testid="sidebar">
      <div className="p-6 border-b border-border">
        <h2 className="text-lg font-semibold mb-4">Quick Queries</h2>
        <div className="space-y-2">
          {suggestedQueries.map((query, index) => (
            <Button
              key={index}
              variant="ghost"
              className="w-full justify-start p-3 h-auto text-left bg-muted hover:bg-accent hover:text-accent-foreground"
              onClick={() => handleSuggestedQuery(query.text)}
              data-testid={`suggested-query-${index}`}
            >
              <query.icon className="w-4 h-4 mr-2 text-muted-foreground flex-shrink-0" />
              <span className="text-sm break-words leading-tight flex-1">{query.text}</span>
            </Button>
          ))}
        </div>
      </div>

      <div className="p-6 border-b border-border">
        <h3 className="text-md font-semibold mb-3">Categories</h3>
        <div className="grid grid-cols-2 gap-2">
          {categories.map((category) => (
            <Card key={category.name} className={`text-center p-3 ${category.bgColor} border-transparent`}>
              <div className={`w-6 h-6 ${category.color} rounded-full mx-auto mb-1`}></div>
              <span className={`text-xs font-medium ${category.textColor}`}>{category.name}</span>
            </Card>
          ))}
        </div>
      </div>

      <div className="flex-1 p-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-md font-semibold">Recent Searches</h3>
          {recentSearches.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearRecentSearches}
              className="h-auto p-1 text-muted-foreground hover:text-destructive"
              data-testid="clear-recent-searches"
            >
              <Trash2 className="w-3 h-3" />
            </Button>
          )}
        </div>
        <div className="space-y-2">
          {recentSearches.length > 0 ? (
            recentSearches.map((search, index) => (
              <Button
                key={index}
                variant="ghost"
                className="w-full justify-start p-2 h-auto text-left hover:bg-muted"
                onClick={() => handleSuggestedQuery(search)}
                data-testid={`recent-search-${index}`}
              >
                <History className="w-3 h-3 mr-2 text-muted-foreground" />
                <span className="text-sm text-muted-foreground truncate">{search}</span>
              </Button>
            ))
          ) : (
            <p className="text-sm text-muted-foreground italic">No recent searches</p>
          )}
        </div>
      </div>
    </aside>
  );
}
