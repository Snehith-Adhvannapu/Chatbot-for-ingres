import { useState } from "react";
import { ChatInterface } from "@/components/chat/chat-interface";
import { Sidebar } from "@/components/chat/sidebar";
import { VisualizationPanel } from "@/components/chat/visualization-panel";
import { Button } from "@/components/ui/button";
import { Settings, HelpCircle } from "lucide-react";

export default function ChatPage() {
  const [showVisualization, setShowVisualization] = useState(false);
  const [currentData, setCurrentData] = useState(null);
  const [suggestedQuery, setSuggestedQuery] = useState("");
  const [language, setLanguage] = useState("en");

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <header className="bg-primary text-primary-foreground shadow-lg">
        <div className="container mx-auto px-6 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-primary-foreground rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-primary" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                </svg>
              </div>
              <div>
                <h1 className="text-2xl font-bold" data-testid="header-title">INGRES AI Assistant</h1>
                <p className="text-primary-foreground/80 text-sm">India Ground Water Resource Estimation System</p>
              </div>
            </div>
            <div className="flex items-center space-x-6">
              <div className="hidden lg:flex items-center space-x-3 bg-primary-foreground/10 rounded-lg px-4 py-2">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12,1L3,5V11C3,16.55 6.84,21.74 12,23C17.16,21.74 21,16.55 21,11V5L12,1M10,17L6,13L7.41,11.59L10,14.17L16.59,7.58L18,9L10,17Z"/>
                </svg>
                <span className="text-sm font-medium">CGWB Official Portal</span>
              </div>
              <div className="flex items-center space-x-2">
                <label htmlFor="language-select" className="text-sm font-medium text-primary-foreground/90">Language:</label>
                <select 
                  id="language-select"
                  className="bg-white/90 border border-primary-foreground/30 rounded-lg px-3 py-2 text-sm text-primary font-medium cursor-pointer hover:bg-white transition-colors shadow-sm"
                  data-testid="language-selector"
                >
                  <option value="en">English</option>
                  <option value="hi">हिंदी</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        <Sidebar 
          onSuggestedQuery={setSuggestedQuery}
          data-testid="sidebar" 
        />
        
        <ChatInterface 
          onDataReceived={setCurrentData}
          onShowVisualization={setShowVisualization}
          suggestedQuery={suggestedQuery}
          onQueryUsed={() => setSuggestedQuery("")}
          data-testid="chat-interface"
        />
        
        {showVisualization && (
          <VisualizationPanel 
            data={currentData}
            onClose={() => setShowVisualization(false)}
            data-testid="visualization-panel"
          />
        )}
      </div>

    </div>
  );
}
