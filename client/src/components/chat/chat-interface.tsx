import { useState, useRef, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MessageBubble } from "@/components/chat/message-bubble";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Send, Paperclip, Mic, MicOff, Share, Trash, Volume2 } from "lucide-react";

// Speech Recognition types
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  data?: any;
}

interface ChatInterfaceProps {
  onDataReceived?: (data: any) => void;
  onShowVisualization?: (show: boolean) => void;
  suggestedQuery?: string;
  onQueryUsed?: () => void;
  language?: string;
}

export function ChatInterface({ onDataReceived, onShowVisualization, suggestedQuery, onQueryUsed, language = "en" }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const synthesisRef = useRef<SpeechSynthesisUtterance | null>(null);
  const { toast } = useToast();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  // Initialize speech recognition
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      
      // Set language based on current language
      recognitionRef.current.lang = language === "hi" ? "hi-IN" : "en-IN";

      recognitionRef.current.onstart = () => {
        setIsListening(true);
      };

      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInput(transcript);
        setIsListening(false);
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
        toast({
          title: "Voice Input Error",
          description: "Could not recognize speech. Please try again.",
          variant: "destructive",
        });
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [language, toast]);

  useEffect(() => {
    // Add welcome message
    const welcomeMessage: Message = {
      id: "welcome",
      role: "assistant",
      content: "Welcome! I'm your AI assistant for India Ground Water Resource Estimation System (INGRES). I can help you query groundwater data, access historical assessments, and provide insights about groundwater resources across India.",
      timestamp: new Date().toISOString(),
    };
    setMessages([welcomeMessage]);
  }, []);

  useEffect(() => {
    if (suggestedQuery) {
      setInput(suggestedQuery);
      onQueryUsed?.();
    }
  }, [suggestedQuery, onQueryUsed]);

  const chatMutation = useMutation({
    mutationFn: async (data: { message: string; sessionId?: string; language?: string }) => {
      const response = await apiRequest("POST", "/api/chat", data);
      return response.json();
    },
    onSuccess: (data) => {
      const aiMessage: Message = {
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}-ai`,
        role: "assistant",
        content: data.response,
        timestamp: new Date().toISOString(),
        data: data.data,
      };

      setMessages(prev => [...prev, aiMessage]);
      setSessionId(data.sessionId);
      setIsTyping(false);

      if (data.data) {
        onDataReceived?.(data.data);
      }

      toast({
        title: "Response received",
        description: "AI has provided groundwater information",
      });
    },
    onError: (error) => {
      setIsTyping(false);
      toast({
        title: "Error",
        description: "Failed to get response. Please try again.",
        variant: "destructive",
      });
      console.error("Chat error:", error);
    },
  });

  const handleSendMessage = () => {
    if (!input.trim() || chatMutation.isPending) return;

    const userMessage: Message = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}-user`,
      role: "user",
      content: input,
      timestamp: new Date().toISOString(),
    };

    setMessages(prev => [...prev, userMessage]);
    setIsTyping(true);

    // Add to recent searches
    const currentSearches = JSON.parse(localStorage.getItem('ingres_recent_searches') || '[]');
    const updatedSearches = [input, ...currentSearches.filter((q: string) => q !== input)].slice(0, 5);
    localStorage.setItem('ingres_recent_searches', JSON.stringify(updatedSearches));

    chatMutation.mutate({
      message: input,
      sessionId: sessionId || undefined,
      language: language,
    });

    setInput("");
  };

  const handleVoiceInput = () => {
    if (!recognitionRef.current) {
      toast({
        title: "Voice Not Supported",
        description: "Speech recognition is not supported in this browser.",
        variant: "destructive",
      });
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      recognitionRef.current.start();
    }
  };

  const handleTextToSpeech = (text: string) => {
    if ('speechSynthesis' in window) {
      // Stop any ongoing speech
      window.speechSynthesis.cancel();
      
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = language === "hi" ? "hi-IN" : "en-IN";
      utterance.rate = 0.8;
      utterance.pitch = 1;

      utterance.onstart = () => {
        setIsSpeaking(true);
      };

      utterance.onend = () => {
        setIsSpeaking(false);
      };

      utterance.onerror = () => {
        setIsSpeaking(false);
        toast({
          title: "Speech Error",
          description: "Could not read the text aloud.",
          variant: "destructive",
        });
      };

      synthesisRef.current = utterance;
      window.speechSynthesis.speak(utterance);
    } else {
      toast({
        title: "Speech Not Supported",
        description: "Text-to-speech is not supported in this browser.",
        variant: "destructive",
      });
    }
  };

  const stopSpeech = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleClearChat = () => {
    setMessages([]);
    setSessionId(null);
    // Add welcome message back
    const welcomeMessage: Message = {
      id: "welcome-new",
      role: "assistant",
      content: "Chat cleared! How can I help you with groundwater data today?",
      timestamp: new Date().toISOString(),
    };
    setMessages([welcomeMessage]);
  };

  const handleSuggestedQuery = (query: string) => {
    setInput(query);
  };

  return (
    <main className="flex-1 flex flex-col" data-testid="chat-interface">
      {/* Messages Area */}
      <div className="flex-1 px-8 py-6 overflow-y-auto scrollbar-thin" data-testid="messages-container">
        <div className="max-w-4xl mx-auto space-y-8">
          {messages.map((message) => (
            <MessageBubble
              key={message.id}
              message={message}
              onShowVisualization={() => onShowVisualization?.(true)}
              onReadAloud={handleTextToSpeech}
              onSendMessage={(msg) => {
                if (chatMutation.isPending) return;
                setInput(msg);
                const userMessage: Message = {
                  id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}-user`,
                  role: "user",
                  content: msg,
                  timestamp: new Date().toISOString(),
                };
                setMessages(prev => [...prev, userMessage]);
                setIsTyping(true);
                
                // Add to recent searches
                const currentSearches = JSON.parse(localStorage.getItem('ingres_recent_searches') || '[]');
                const updatedSearches = [msg, ...currentSearches.filter((q: string) => q !== msg)].slice(0, 5);
                localStorage.setItem('ingres_recent_searches', JSON.stringify(updatedSearches));
                
                chatMutation.mutate({
                  message: msg,
                  sessionId: sessionId || undefined,
                  language: language,
                });
                setInput(''); // Clear input after sending
              }}
            />
          ))}
          
          {isTyping && (
            <div className="flex items-start space-x-4" data-testid="typing-indicator">
              <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-primary-foreground" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20,2H4A2,2 0 0,0 2,4V22L6,18H20A2,2 0 0,0 22,16V4A2,2 0 0,0 20,2Z"/>
                </svg>
              </div>
              <div className="bg-card p-4 rounded-lg shadow-sm border border-border">
                <div className="flex items-center space-x-1">
                  <span className="text-muted-foreground text-sm mr-2">AI is typing</span>
                  <div className="typing-indicator"></div>
                  <div className="typing-indicator"></div>
                  <div className="typing-indicator"></div>
                </div>
              </div>
            </div>
          )}
        </div>
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="border-t border-border p-8 bg-muted/30">
        <div className="max-w-4xl mx-auto">
          <div className="flex space-x-4">
            <div className="flex-1">
              <div className="relative">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask about groundwater data, assessments, or specific locations..."
                  className="pr-14 py-3 text-base border-2 border-border/50 focus:border-primary bg-background"
                  disabled={chatMutation.isPending}
                  data-testid="message-input"
                />
                <Button
                  size="icon"
                  variant="ghost"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 h-8 w-8 text-muted-foreground hover:text-foreground"
                  data-testid="attach-button"
                >
                  <Paperclip className="w-4 h-4" />
                </Button>
              </div>
            </div>
            <Button
              onClick={handleSendMessage}
              disabled={!input.trim() || chatMutation.isPending}
              className="px-8 py-3 text-base font-medium"
              data-testid="send-button"
            >
              <Send className="w-4 h-4 mr-2" />
              Send
            </Button>
          </div>
          
          <div className="flex items-center justify-between mt-4 text-sm text-muted-foreground">
            <div className="flex items-center space-x-6">
              <span className="flex items-center">
                <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M13,9H11V7H13M13,17H11V11H13M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2Z"/>
                </svg>
                Powered by Gemini AI • CGWB Official Data
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearChat}
                className="h-auto px-2 py-1 text-muted-foreground hover:text-foreground"
                data-testid="clear-chat-button"
              >
                <Trash className="w-4 h-4 mr-2" />
                Clear Chat
              </Button>
            </div>
            <div className="flex items-center space-x-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleVoiceInput}
                disabled={chatMutation.isPending}
                className={`h-auto px-2 py-1 ${isListening ? 'text-red-500 bg-red-50' : 'text-muted-foreground hover:text-foreground'}`}
                data-testid="voice-input-button"
              >
                {isListening ? <MicOff className="w-4 h-4 mr-1" /> : <Mic className="w-4 h-4 mr-1" />}
                {isListening ? "Stop" : "Voice"}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-auto px-2 py-1 text-muted-foreground hover:text-foreground"
                data-testid="export-chat-button"
              >
                <Share className="w-4 h-4 mr-1" />
                Export
              </Button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
