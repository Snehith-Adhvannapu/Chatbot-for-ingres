import { useState } from "react";
import { ChatInterface } from "@/components/chat/chat-interface";
import { Sidebar } from "@/components/chat/sidebar";
import { VisualizationPanel } from "@/components/chat/visualization-panel";
import { Button } from "@/components/ui/button";
import { Settings, HelpCircle } from "lucide-react";
import { getTranslation, languages, Language } from "@/lib/translations";

export default function ChatPage() {
  const [showVisualization, setShowVisualization] = useState(false);
  const [currentData, setCurrentData] = useState(null);
  const [suggestedQuery, setSuggestedQuery] = useState("");
  const [language, setLanguage] = useState<Language>("en");

  const t = (key: string) => getTranslation(language, key);

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <header className="bg-primary text-primary-foreground shadow-lg">
        <div className="container mx-auto px-6 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-primary-foreground rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-primary" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2l-6.5 9c-1.5 2.1-1.5 5 0 7.1C6.7 19.7 9.2 21 12 21s5.3-1.3 6.5-2.9c1.5-2.1 1.5-5 0-7.1L12 2z"/>
                  <circle cx="9" cy="15" r="1.5" fill="rgba(255,255,255,0.3)"/>
                </svg>
              </div>
              <div>
                <h1 className="text-2xl font-bold" data-testid="header-title">{t('headerTitle')}</h1>
                <p className="text-primary-foreground/80 text-sm">{t('headerSubtitle')}</p>
              </div>
            </div>
            <div className="flex items-center space-x-6">
              <div className="hidden lg:flex items-center space-x-3 bg-primary-foreground/10 rounded-lg px-4 py-2">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12,1L3,5V11C3,16.55 6.84,21.74 12,23C17.16,21.74 21,16.55 21,11V5L12,1M10,17L6,13L7.41,11.59L10,14.17L16.59,7.58L18,9L10,17Z"/>
                </svg>
                <span className="text-sm font-medium">{t('cgwbPortal')}</span>
              </div>
              <div className="flex items-center space-x-2">
                <label htmlFor="language-select" className="text-sm font-medium text-primary-foreground/90">{t('language')}</label>
                <select 
                  id="language-select"
                  value={language}
                  onChange={(e) => setLanguage(e.target.value as Language)}
                  className="bg-white/90 border border-primary-foreground/30 rounded-lg px-3 py-2 text-sm text-primary font-medium cursor-pointer hover:bg-white transition-colors shadow-sm"
                  data-testid="language-selector"
                >
                  {languages.map((lang) => (
                    <option key={lang.code} value={lang.code}>
                      {lang.nativeName}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        <Sidebar 
          onSuggestedQuery={setSuggestedQuery}
          language={language}
          data-testid="sidebar" 
        />
        
        <ChatInterface 
          onDataReceived={setCurrentData}
          onShowVisualization={setShowVisualization}
          suggestedQuery={suggestedQuery}
          onQueryUsed={() => setSuggestedQuery("")}
          language={language}
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
