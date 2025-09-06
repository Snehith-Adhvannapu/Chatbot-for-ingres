import { useState, useRef, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MessageBubble } from "@/components/chat/message-bubble";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Send, Paperclip, Mic, Share, Trash } from "lucide-react";

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
}

export function ChatInterface({ onDataReceived, onShowVisualization }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

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

  const chatMutation = useMutation({
    mutationFn: async (data: { message: string; sessionId?: string; language?: string }) => {
      const response = await apiRequest("POST", "/api/chat", data);
      return response.json();
    },
    onSuccess: (data) => {
      const aiMessage: Message = {
        id: data.sessionId + "-ai",
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
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date().toISOString(),
    };

    setMessages(prev => [...prev, userMessage]);
    setIsTyping(true);

    chatMutation.mutate({
      message: input,
      sessionId: sessionId || undefined,
      language: "en",
    });

    setInput("");
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
      <div className="flex-1 p-6 overflow-y-auto scrollbar-thin" data-testid="messages-container">
        <div className="space-y-6">
          {messages.map((message) => (
            <MessageBubble
              key={message.id}
              message={message}
              onShowVisualization={() => onShowVisualization?.(true)}
            />
          ))}
          
          {isTyping && (
            <div className="flex items-start space-x-3" data-testid="typing-indicator">
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
      <div className="border-t border-border p-6">
        <div className="flex space-x-3">
          <div className="flex-1">
            <div className="relative">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask about groundwater data, assessments, or specific locations..."
                className="pr-12"
                disabled={chatMutation.isPending}
                data-testid="message-input"
              />
              <Button
                size="icon"
                variant="ghost"
                className="absolute right-3 top-1/2 transform -translate-y-1/2 h-6 w-6"
                data-testid="attach-button"
              >
                <Paperclip className="w-4 h-4" />
              </Button>
            </div>
          </div>
          <Button
            onClick={handleSendMessage}
            disabled={!input.trim() || chatMutation.isPending}
            className="px-6"
            data-testid="send-button"
          >
            <Send className="w-4 h-4 mr-2" />
            Send
          </Button>
        </div>
        
        <div className="flex items-center justify-between mt-3 text-sm text-muted-foreground">
          <div className="flex items-center space-x-4">
            <span className="flex items-center">
              <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 24 24">
                <path d="M13,9H11V7H13M13,17H11V11H13M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2Z"/>
              </svg>
              Powered by AI • CGWB Official Data
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearChat}
              className="h-auto p-0 text-muted-foreground hover:text-foreground"
              data-testid="clear-chat-button"
            >
              <Trash className="w-4 h-4 mr-1" />
              Clear Chat
            </Button>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 text-muted-foreground hover:text-foreground"
              data-testid="voice-input-button"
            >
              <Mic className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 text-muted-foreground hover:text-foreground"
              data-testid="export-chat-button"
            >
              <Share className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </main>
  );
}
