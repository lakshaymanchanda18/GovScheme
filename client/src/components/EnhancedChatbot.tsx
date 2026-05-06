import React, { useState, useEffect, useRef } from 'react';
import { 
  Box, Card, CardContent, Typography, TextField, IconButton, 
  Chip, Avatar, List, ListItem, Paper, Tooltip, Fab, Fade, Slide
} from '@mui/material';
import { useAuth } from '../hooks/useAuth';
import { useApi } from '../hooks/useApi';
import { useI18n } from '../hooks/useI18n';
import { useNavigate } from 'react-router-dom';
import SendIcon from '@mui/icons-material/Send';
import MicIcon from '@mui/icons-material/Mic';
import MicOffIcon from '@mui/icons-material/MicOff';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
  suggestions?: string[];
  sources?: string[];
  sourceScores?: Array<{ id: string; confidence: number }>;
}

// ─── Floating Chatbot Widget (used as overlay on any page) ───
export const EnhancedChatbot: React.FC = () => {
  const [isMinimized, setIsMinimized] = useState(true);

  if (isMinimized) {
    return (
      <Box sx={{ position: 'fixed', bottom: 30, right: 30, zIndex: 1000 }}>
        <Tooltip title="Chat with AI Assistant" placement="left">
          <Fab 
            onClick={() => setIsMinimized(false)}
            sx={{
              background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
              color: 'white', width: 64, height: 64,
              boxShadow: '0 10px 25px rgba(168, 85, 247, 0.5)',
              transition: 'all 0.3s ease',
              '&:hover': { 
                transform: 'scale(1.1) rotate(5deg)',
                background: 'linear-gradient(135deg, #4f46e5 0%, #9333ea 100%)'
              }
            }}
          >
            <AutoAwesomeIcon fontSize="large" />
          </Fab>
        </Tooltip>
      </Box>
    );
  }

  return (
    <Slide direction="up" in={!isMinimized} mountOnEnter unmountOnExit>
      <Box sx={{ position: 'fixed', bottom: 30, right: 30, zIndex: 1000 }}>
        <ChatPanel onMinimize={() => setIsMinimized(true)} />
      </Box>
    </Slide>
  );
};

// ─── Full-page Chatbot (used on /chatbot route) ───
export function ChatbotPage() {
  const { t } = useI18n();

  return (
    <Box sx={{ 
      minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', 
      justifyContent: 'center', p: 2,
      background: 'linear-gradient(135deg, #fdfbfb 0%, #ebedee 100%)'
    }}>
      <Box sx={{ width: { xs: '100%', sm: 500, md: 600 }, height: { xs: '85vh', md: 700 } }}>
        <ChatPanel fullPage />
      </Box>
    </Box>
  );
}

// ─── Shared Chat Panel ───
interface ChatPanelProps {
  onMinimize?: () => void;
  fullPage?: boolean;
}

function ChatPanel({ onMinimize, fullPage }: ChatPanelProps) {
  const { user } = useAuth();
  const { api } = useApi();
  const { t } = useI18n();
  const navigate = useNavigate();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Hello! I\'m your GovScheme AI Assistant powered by Gemini. Ask me about government schemes, eligibility, or application processes!',
      isUser: false,
      timestamp: new Date(),
      suggestions: ['Find schemes for students', 'Healthcare schemes', 'Check my eligibility', 'How to apply?']
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // Speech recognition setup
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'en-IN';
      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInputValue(transcript);
      };
      recognitionRef.current.onend = () => setIsListening(false);
    }
  }, []);

  const handleSendMessage = async (text?: string) => {
    const messageText = (text || inputValue).trim();
    if (!messageText || isTyping) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: messageText,
      isUser: true,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    try {
      // Call the real backend API which uses Gemini + TF-IDF
      const response = await api.post('/chatbot/query', {
        message: messageText,
        userId: user?.id,
        conversationHistory: messages.slice(-6).map(m => ({
          text: m.text,
          isUser: m.isUser,
          timestamp: m.timestamp
        }))
      });

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: response.reply || 'I couldn\'t process that. Please try again.',
        isUser: false,
        timestamp: new Date(),
        suggestions: response.suggestions || [],
        sources: response.sources || [],
        sourceScores: response.sourceScores || []
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (err) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: 'Sorry, I encountered an error connecting to the server. Please try again.',
        isUser: false,
        timestamp: new Date(),
        suggestions: ['Try again', 'View schemes']
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleVoiceInput = () => {
    if (!isListening && recognitionRef.current) {
      setIsListening(true);
      recognitionRef.current.start();
    } else if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
  };

  const formatTime = (date: Date) => date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const panelHeight = fullPage ? '100%' : { xs: 'calc(100vh - 100px)', sm: 600 };
  const panelWidth = fullPage ? '100%' : { xs: 'calc(100vw - 40px)', sm: 420 };

  return (
    <Card sx={{
      width: panelWidth, height: panelHeight,
      display: 'flex', flexDirection: 'column',
      borderRadius: '24px', overflow: 'hidden',
      background: 'rgba(255, 255, 255, 0.9)',
      backdropFilter: 'blur(20px)',
      border: '1px solid rgba(255, 255, 255, 0.4)',
      boxShadow: '0 20px 50px rgba(0,0,0,0.15)',
      fontFamily: "'Inter', sans-serif"
    }}>
      {/* ─── Header ─── */}
      <Box sx={{
        background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
        color: 'white', p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
      }}>
        <Box display="flex" alignItems="center" gap={1.5}>
          <Avatar sx={{ background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(10px)', color: 'white' }}>
            <SmartToyIcon />
          </Avatar>
          <Box>
            <Typography variant="subtitle1" fontWeight="700" fontFamily="'Outfit', sans-serif">
              GovScheme AI
            </Typography>
            <Typography variant="caption" sx={{ opacity: 0.8, display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Box component="span" sx={{ width: 8, height: 8, borderRadius: '50%', background: '#4ade80', display: 'inline-block' }} />
              Powered by Gemini
            </Typography>
          </Box>
        </Box>
        {onMinimize && (
          <IconButton size="small" onClick={onMinimize} sx={{ color: 'white', '&:hover': { background: 'rgba(255,255,255,0.1)' } }}>
            <KeyboardArrowDownIcon />
          </IconButton>
        )}
      </Box>

      {/* ─── Messages ─── */}
      <CardContent sx={{ flex: 1, overflowY: 'auto', p: 2, backgroundColor: 'rgba(249, 250, 251, 0.5)' }}>
        <List sx={{ p: 0 }}>
          {messages.map((message) => (
            <Fade in={true} timeout={500} key={message.id}>
              <ListItem sx={{
                flexDirection: message.isUser ? 'row-reverse' : 'row',
                alignItems: 'flex-end', px: 0, mb: 2, gap: 1
              }}>
                {!message.isUser && (
                  <Avatar sx={{ width: 32, height: 32, background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)' }}>
                    <SmartToyIcon sx={{ fontSize: 18 }}/>
                  </Avatar>
                )}
                
                <Box sx={{ maxWidth: '78%', display: 'flex', flexDirection: 'column', alignItems: message.isUser ? 'flex-end' : 'flex-start' }}>
                  <Paper elevation={0} sx={{
                    p: 1.5, px: 2,
                    borderRadius: message.isUser ? '20px 20px 4px 20px' : '20px 20px 20px 4px',
                    background: message.isUser 
                      ? 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)' 
                      : 'white',
                    color: message.isUser ? 'white' : '#1f2937',
                    boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
                    border: message.isUser ? 'none' : '1px solid rgba(0,0,0,0.05)'
                  }}>
                    <Typography variant="body2" sx={{ lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
                      {message.text}
                    </Typography>
                  </Paper>

                  {/* Suggestion chips */}
                  {!message.isUser && message.suggestions && message.suggestions.length > 0 && (
                    <Box display="flex" flexWrap="wrap" gap={0.5} mt={1}>
                      {message.suggestions.map((s, i) => (
                        <Chip 
                          key={i} label={s} size="small" clickable 
                          onClick={() => handleSendMessage(s)}
                          sx={{ 
                            background: 'rgba(99, 102, 241, 0.1)', color: '#4f46e5', fontWeight: 600, fontSize: '0.72rem',
                            border: '1px solid rgba(99, 102, 241, 0.2)',
                            '&:hover': { background: '#4f46e5', color: 'white' } 
                          }} 
                        />
                      ))}
                    </Box>
                  )}

                  {/* Source references */}
                  {!message.isUser && message.sources && message.sources.length > 0 && (
                    <Box mt={1}>
                      <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: 'block' }}>
                        📚 Sources ({message.sources.length} schemes matched)
                      </Typography>
                      <Box display="flex" gap={0.5} flexWrap="wrap">
                        {message.sources.slice(0, 3).map((sourceId, i) => {
                          const score = message.sourceScores?.find(s => s.id === sourceId);
                          return (
                            <Chip 
                              key={i} 
                              label={`Scheme ${i + 1}${score ? ` (${score.confidence}%)` : ''}`}
                              size="small" variant="outlined" clickable
                              onClick={() => navigate(`/schemes/${sourceId}`)}
                              sx={{ fontSize: '0.7rem' }}
                            />
                          );
                        })}
                      </Box>
                    </Box>
                  )}

                  <Typography variant="caption" sx={{ color: '#9ca3af', mt: 0.5, fontSize: '0.65rem' }}>
                    {formatTime(message.timestamp)}
                  </Typography>
                </Box>
              </ListItem>
            </Fade>
          ))}

          {/* Typing indicator */}
          {isTyping && (
            <Fade in={true}>
              <ListItem sx={{ flexDirection: 'row', alignItems: 'flex-end', px: 0, mb: 2, gap: 1 }}>
                <Avatar sx={{ width: 32, height: 32, background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)' }}>
                  <SmartToyIcon sx={{ fontSize: 18 }}/>
                </Avatar>
                <Paper elevation={0} sx={{ 
                  p: 1.5, px: 2, borderRadius: '20px 20px 20px 4px', background: 'white',
                  display: 'flex', alignItems: 'center', gap: 1
                }}>
                  <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                    Thinking
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 0.5 }}>
                    {[0, 1, 2].map(i => (
                      <Box key={i} sx={{ 
                        width: 6, height: 6, borderRadius: '50%', background: '#a78bfa',
                        animation: 'pulse 1.4s infinite ease-in-out',
                        animationDelay: `${i * 0.2}s`
                      }} />
                    ))}
                  </Box>
                </Paper>
              </ListItem>
            </Fade>
          )}
          <div ref={messagesEndRef} />
        </List>
      </CardContent>

      {/* ─── Input ─── */}
      <Box sx={{ 
        p: 2, background: 'white', borderTop: '1px solid rgba(0,0,0,0.05)',
        display: 'flex', gap: 1, alignItems: 'flex-end'
      }}>
        <IconButton 
          onClick={handleVoiceInput} 
          sx={{ 
            color: isListening ? '#ef4444' : '#6b7280',
            animation: isListening ? 'pulse 1.5s infinite' : 'none',
            background: isListening ? 'rgba(239, 68, 68, 0.1)' : 'transparent'
          }}
        >
          {isListening ? <MicIcon /> : <MicOffIcon />}
        </IconButton>
        
        <TextField
          fullWidth multiline maxRows={3}
          placeholder="Ask about schemes, eligibility..."
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={(e) => { 
            if (e.key === 'Enter' && !e.shiftKey) { 
              e.preventDefault(); 
              handleSendMessage(); 
            } 
          }}
          variant="outlined" size="small"
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: '20px', backgroundColor: '#f9fafb',
              '& fieldset': { borderColor: 'transparent' },
              '&:hover fieldset': { borderColor: '#e5e7eb' },
              '&.Mui-focused fieldset': { borderColor: '#6366f1', borderWidth: '2px' }
            }
          }}
        />
        
        <IconButton 
          onClick={() => handleSendMessage()} 
          disabled={!inputValue.trim() || isTyping}
          sx={{ 
            background: inputValue.trim() ? 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)' : '#e5e7eb',
            color: 'white',
            '&:hover': { background: inputValue.trim() ? 'linear-gradient(135deg, #4f46e5 0%, #9333ea 100%)' : '#e5e7eb' },
            '&.Mui-disabled': { color: 'white', background: '#e5e7eb' }
          }}
        >
          <SendIcon fontSize="small"/>
        </IconButton>
      </Box>

      {/* Disclaimer */}
      <Typography variant="caption" color="text.secondary" sx={{ textAlign: 'center', pb: 1, px: 2, fontSize: '0.65rem' }}>
        AI may make mistakes. Please verify important information with official sources.
      </Typography>
    </Card>
  );
}