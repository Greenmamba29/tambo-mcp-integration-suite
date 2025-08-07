import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Send, User, Bot, Sparkles, Code, Palette } from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  type?: 'component' | 'suggestion' | 'docs';
}

interface ChatInterfaceProps {
  onSend: (message: string) => void;
  isLoading?: boolean;
  placeholder?: string;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({ onSend, isLoading, placeholder = "Describe the component you want to create..." }) => {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'Hello! I\'m your Tambo Design Buddy powered by ABACUS.AI. I can help you create, modify, and optimize React components using the Tambo framework. What would you like to build today?',
      timestamp: new Date(),
      type: 'suggestion'
    }
  ]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: message.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    onSend(message.trim());
    setMessage('');

    // Simulate AI response
    setTimeout(() => {
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `I'll help you create "${message.trim()}". Let me query the Tambo documentation and generate a component using ABACUS.AI...`,
        timestamp: new Date(),
        type: 'component'
      };
      setMessages(prev => [...prev, aiResponse]);
    }, 500);
  };

  const quickPrompts = [
    { text: "Create a dashboard card", icon: Palette },
    { text: "Design a user profile component", icon: User },
    { text: "Build a data visualization widget", icon: Code },
    { text: "Make a navigation menu", icon: Sparkles }
  ];

  const getMessageIcon = (message: Message) => {
    if (message.role === 'user') return User;
    
    switch (message.type) {
      case 'component': return Code;
      case 'suggestion': return Sparkles;
      case 'docs': return Bot;
      default: return Bot;
    }
  };

  const getMessageBadge = (message: Message) => {
    if (message.role === 'user') return null;
    
    switch (message.type) {
      case 'component': return { text: 'Component', variant: 'default' as const };
      case 'suggestion': return { text: 'Suggestion', variant: 'secondary' as const };
      case 'docs': return { text: 'Documentation', variant: 'outline' as const };
      default: return { text: 'AI Assistant', variant: 'secondary' as const };
    }
  };

  return (
    <div className="flex flex-col h-[600px]">
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto space-y-4 p-4 bg-muted/20 rounded-lg">
        {messages.map((msg) => {
          const Icon = getMessageIcon(msg);
          const badge = getMessageBadge(msg);
          
          return (
            <div
              key={msg.id}
              className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
            >
              <div className={`flex-shrink-0 p-2 rounded-full ${
                msg.role === 'user' 
                  ? 'gradient-primary' 
                  : 'gradient-accent'
              }`}>
                <Icon className="h-4 w-4 text-white" />
              </div>
              
              <Card className={`max-w-[80%] ${
                msg.role === 'user' 
                  ? 'gradient-card border-primary/20' 
                  : 'bg-card'
              }`}>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-medium text-sm">
                      {msg.role === 'user' ? 'You' : 'Tambo AI'}
                    </span>
                    {badge && (
                      <Badge variant={badge.variant} className="text-xs">
                        {badge.text}
                      </Badge>
                    )}
                    <span className="text-xs text-muted-foreground ml-auto">
                      {msg.timestamp.toLocaleTimeString()}
                    </span>
                  </div>
                  <p className="text-sm leading-relaxed">{msg.content}</p>
                </CardContent>
              </Card>
            </div>
          );
        })}
        
        {isLoading && (
          <div className="flex gap-3">
            <div className="flex-shrink-0 p-2 rounded-full gradient-accent">
              <Bot className="h-4 w-4 text-white" />
            </div>
            <Card className="bg-card">
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                  <span className="text-sm text-muted-foreground">
                    ABACUS.AI is generating your component...
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Prompts */}
      {messages.length <= 1 && (
        <div className="p-4 space-y-3">
          <p className="text-sm text-muted-foreground">Try these quick prompts:</p>
          <div className="flex flex-wrap gap-2">
            {quickPrompts.map((prompt, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                onClick={() => {
                  setMessage(prompt.text);
                  const event = { preventDefault: () => {} } as React.FormEvent;
                  setTimeout(() => handleSubmit(event), 100);
                }}
                className="flex items-center gap-2"
              >
                <prompt.icon className="h-3 w-3" />
                {prompt.text}
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Input Form */}
      <form onSubmit={handleSubmit} className="flex gap-2 p-4 border-t">
        <Input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder={placeholder}
          disabled={isLoading}
          className="flex-1"
        />
        <Button
          type="submit"
          disabled={!message.trim() || isLoading}
          variant="hero"
          size="icon"
        >
          <Send className="h-4 w-4" />
        </Button>
      </form>
    </div>
  );
};