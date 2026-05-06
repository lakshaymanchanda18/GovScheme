import React, { useState, useEffect, useRef } from 'react';
import { 
  Box, Card, Typography, TextField, IconButton, 
  Chip, Avatar, List, ListItem, Tooltip, Fab, Fade, Slide,
  CircularProgress, LinearProgress, Button
} from '@mui/material';
import { useAuth } from '../hooks/useAuth';
import { useApi } from '../hooks/useApi';
import { useNavigate } from 'react-router-dom';
import SendIcon from '@mui/icons-material/Send';
import MicIcon from '@mui/icons-material/Mic';
import MicOffIcon from '@mui/icons-material/MicOff';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import PersonIcon from '@mui/icons-material/Person';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import VerifiedIcon from '@mui/icons-material/Verified';
import SearchOffIcon from '@mui/icons-material/SearchOff';

interface SchemeData {
  id: string;
  schemeName: string;
  category: string;
  department: string;
  eligibility: string;
  benefits: string;
  applicationProcess: string;
  requiredDocuments: string;
  sourceUrl: string;
  relevanceScore: number;
  whyRelevant: string;
}

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
  suggestions?: string[];
  schemes?: SchemeData[];
  noSchemesFound?: boolean;
  sources?: string[];
  sourceScores?: Array<{ id: string; confidence: number }>;
}

// ─── Scheme Card Component ───
function SchemeCard({ scheme, fullPage }: { scheme: SchemeData; fullPage?: boolean }) {
  const navigate = useNavigate();
  const bg = fullPage ? 'rgba(255,255,255,0.06)' : '#ffffff';
  const border = fullPage ? '1px solid rgba(255,255,255,0.12)' : '1px solid #e2e8f0';
  const textColor = fullPage ? '#e2e8f0' : '#1e293b';
  const subColor = fullPage ? 'rgba(255,255,255,0.5)' : '#64748b';

  return (
    <Card sx={{
      p: 2, mb: 1.5, background: bg, border,
      borderRadius: '16px', boxShadow: 'none',
      transition: 'all 0.2s ease',
      '&:hover': { 
        border: fullPage ? '1px solid rgba(99,102,241,0.4)' : '1px solid #a5b4fc',
        transform: 'translateY(-1px)',
        boxShadow: fullPage ? '0 4px 20px rgba(99,102,241,0.15)' : '0 4px 12px rgba(0,0,0,0.08)'
      }
    }}>
      {/* Header: Name + Score */}
      <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={1}>
        <Box flex={1} mr={1}>
          <Box display="flex" alignItems="center" gap={0.5} mb={0.5}>
            <VerifiedIcon sx={{ fontSize: 16, color: '#4f46e5' }} />
            <Typography variant="subtitle2" fontWeight={700} sx={{ color: textColor, lineHeight: 1.3 }}>
              {scheme.schemeName}
            </Typography>
          </Box>
          <Chip 
            label={scheme.category} 
            size="small" 
            sx={{ 
              height: 20, fontSize: '0.65rem', fontWeight: 600,
              background: fullPage ? 'rgba(99,102,241,0.2)' : '#eef2ff',
              color: fullPage ? '#a5b4fc' : '#4f46e5',
              border: 'none'
            }} 
          />
        </Box>
        <Box sx={{ textAlign: 'center', minWidth: 48 }}>
          <Typography variant="caption" fontWeight={700} sx={{ 
            color: scheme.relevanceScore >= 70 ? '#10b981' : scheme.relevanceScore >= 40 ? '#f59e0b' : subColor,
            fontSize: '0.8rem'
          }}>
            {scheme.relevanceScore}%
          </Typography>
          <LinearProgress 
            variant="determinate" 
            value={scheme.relevanceScore} 
            sx={{ 
              height: 4, borderRadius: 2, mt: 0.5,
              backgroundColor: fullPage ? 'rgba(255,255,255,0.1)' : '#f1f5f9',
              '& .MuiLinearProgress-bar': { 
                borderRadius: 2,
                background: scheme.relevanceScore >= 70 
                  ? 'linear-gradient(90deg, #10b981, #34d399)'
                  : scheme.relevanceScore >= 40
                  ? 'linear-gradient(90deg, #f59e0b, #fbbf24)'
                  : 'linear-gradient(90deg, #94a3b8, #cbd5e1)'
              }
            }} 
          />
        </Box>
      </Box>

      {/* Why Relevant */}
      {scheme.whyRelevant && (
        <Typography variant="caption" sx={{ 
          display: 'block', mb: 1, color: fullPage ? '#a5b4fc' : '#6366f1',
          fontStyle: 'italic', lineHeight: 1.4
        }}>
          ★ {scheme.whyRelevant}
        </Typography>
      )}

      {/* Benefits */}
      {scheme.benefits && (
        <Box mb={0.5}>
          <Typography variant="caption" fontWeight={600} sx={{ color: subColor }}>Benefits:</Typography>
          <Typography variant="body2" sx={{ color: textColor, fontSize: '0.8rem', lineHeight: 1.4 }}>
            {scheme.benefits}
          </Typography>
        </Box>
      )}

      {/* Eligibility */}
      {scheme.eligibility && (
        <Box mb={1}>
          <Typography variant="caption" fontWeight={600} sx={{ color: subColor }}>Eligibility:</Typography>
          <Typography variant="body2" sx={{ color: textColor, fontSize: '0.8rem', lineHeight: 1.4 }}>
            {scheme.eligibility}
          </Typography>
        </Box>
      )}

      {/* Actions */}
      <Box display="flex" gap={1} mt={0.5}>
        {scheme.sourceUrl && (
          <Button
            size="small"
            startIcon={<OpenInNewIcon sx={{ fontSize: 14 }} />}
            href={scheme.sourceUrl}
            target="_blank"
            rel="noreferrer"
            sx={{
              fontSize: '0.7rem', textTransform: 'none', px: 1.5, py: 0.3,
              borderRadius: '8px',
              color: fullPage ? '#a5b4fc' : '#4f46e5',
              border: fullPage ? '1px solid rgba(165,180,252,0.3)' : '1px solid #c7d2fe',
              '&:hover': { background: fullPage ? 'rgba(99,102,241,0.15)' : '#eef2ff' }
            }}
          >
            Official Source
          </Button>
        )}
        <Button
          size="small"
          onClick={() => navigate('/eligibility')}
          sx={{
            fontSize: '0.7rem', textTransform: 'none', px: 1.5, py: 0.3,
            borderRadius: '8px',
            background: fullPage ? 'rgba(99,102,241,0.2)' : '#eef2ff',
            color: fullPage ? '#c7d2fe' : '#4f46e5',
            '&:hover': { background: fullPage ? 'rgba(99,102,241,0.3)' : '#ddd6fe' }
          }}
        >
          Check Eligibility
        </Button>
      </Box>
    </Card>
  );
}

// ─── No Schemes Found Component ───
function NoSchemesFound({ fullPage }: { fullPage?: boolean }) {
  return (
    <Box sx={{
      p: 2, mt: 1, borderRadius: '16px', textAlign: 'center',
      background: fullPage ? 'rgba(255,255,255,0.04)' : '#fafafa',
      border: fullPage ? '1px solid rgba(255,255,255,0.08)' : '1px solid #f1f5f9'
    }}>
      <SearchOffIcon sx={{ fontSize: 32, color: fullPage ? 'rgba(255,255,255,0.3)' : '#94a3b8', mb: 1 }} />
      <Typography variant="body2" sx={{ color: fullPage ? 'rgba(255,255,255,0.5)' : '#64748b', fontSize: '0.85rem' }}>
        No matching schemes found. Try describing your situation — age, income, occupation, or state — for better results.
      </Typography>
    </Box>
  );
}

// ─── Floating Chatbot Widget ───
export const EnhancedChatbot: React.FC = () => {
  const [isMinimized, setIsMinimized] = useState(true);

  if (isMinimized) {
    return (
      <Box sx={{ position: 'fixed', bottom: 30, right: 30, zIndex: 1000 }}>
        <Tooltip title="Chat with AI Assistant" placement="left">
          <Fab 
            onClick={() => setIsMinimized(false)}
            sx={{
              background: 'linear-gradient(135deg, #0ea5e9 0%, #6366f1 100%)',
              color: 'white', width: 64, height: 64,
              boxShadow: '0 10px 30px rgba(99, 102, 241, 0.4)',
              transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
              '&:hover': { 
                transform: 'scale(1.1) rotate(15deg)',
                background: 'linear-gradient(135deg, #0284c7 0%, #4f46e5 100%)',
                boxShadow: '0 15px 40px rgba(99, 102, 241, 0.6)'
              },
              animation: 'pulse 2s infinite'
            }}
          >
            <AutoAwesomeIcon fontSize="large" />
          </Fab>
        </Tooltip>
      </Box>
    );
  }

  return (
    <Slide direction="up" in={!isMinimized} mountOnEnter unmountOnExit timeout={400}>
      <Box sx={{ position: 'fixed', bottom: 30, right: 30, zIndex: 1000 }}>
        <ChatPanel onMinimize={() => setIsMinimized(true)} />
      </Box>
    </Slide>
  );
};

// ─── Full-page Chatbot ───
export function ChatbotPage() {
  return (
    <Box sx={{ 
      minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', 
      justifyContent: 'center', p: { xs: 0, md: 4 },
      background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)',
      position: 'relative', overflow: 'hidden'
    }}>
      <Box sx={{ position: 'absolute', top: '10%', left: '20%', width: 400, height: 400, background: 'radial-gradient(circle, rgba(99,102,241,0.15) 0%, rgba(0,0,0,0) 70%)', borderRadius: '50%', filter: 'blur(40px)' }} />
      <Box sx={{ position: 'absolute', bottom: '10%', right: '20%', width: 500, height: 500, background: 'radial-gradient(circle, rgba(236,72,153,0.15) 0%, rgba(0,0,0,0) 70%)', borderRadius: '50%', filter: 'blur(40px)' }} />
      
      <Box sx={{ width: { xs: '100%', sm: 500, md: 650 }, height: { xs: '100vh', md: 800 }, zIndex: 1 }}>
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
  const navigate = useNavigate();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Hello! I am SaralYojna AI, your government schemes search engine. Ask me about any scheme — describe your situation and I will find real, verified schemes from our database.',
      isUser: false,
      timestamp: new Date(),
      suggestions: ['Find schemes for farmers', 'Education scholarships', 'Healthcare schemes', 'Housing schemes for low income']
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  useEffect(() => {
    if ('webkitSpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-IN';
      recognition.onstart = () => setIsListening(true);
      recognition.onend = () => setIsListening(false);
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInput(transcript);
      };
      recognition.onerror = () => setIsListening(false);
      recognitionRef.current = recognition;
    }
  }, []);

  const toggleListening = () => {
    if (!recognitionRef.current) return alert('Speech recognition not supported.');
    if (isListening) recognitionRef.current.stop();
    else recognitionRef.current.start();
  };

  const handleSend = async (text: string) => {
    if (!text.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text,
      isUser: true,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    try {
      const response = await api.post('/chatbot/query', { message: text });
      
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: response.reply,
        isUser: false,
        timestamp: new Date(),
        suggestions: response.suggestions,
        schemes: response.schemes || [],
        noSchemesFound: response.noSchemesFound || false,
        sources: response.sources,
        sourceScores: response.sourceScores
      };
      
      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: 'I am experiencing technical difficulties connecting to the search system. Please try again.',
        isUser: false,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <Card sx={{ 
      width: fullPage ? '100%' : 420,
      height: fullPage ? '100%' : 700,
      display: 'flex', flexDirection: 'column',
      background: fullPage 
        ? 'rgba(30, 41, 59, 0.6)' 
        : 'rgba(255, 255, 255, 0.95)',
      backdropFilter: 'blur(20px)',
      boxShadow: fullPage ? '0 25px 50px -12px rgba(0, 0, 0, 0.5)' : '0 20px 40px rgba(0,0,0,0.1)',
      borderRadius: fullPage ? { xs: 0, md: '24px' } : '24px',
      border: fullPage ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(255,255,255,0.8)',
      overflow: 'hidden'
    }}>
      {/* Header */}
      <Box sx={{ 
        p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        background: fullPage ? 'rgba(0,0,0,0.2)' : 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
        borderBottom: fullPage ? '1px solid rgba(255,255,255,0.05)' : 'none',
        color: 'white'
      }}>
        <Box display="flex" alignItems="center" gap={1.5}>
          <Avatar sx={{ background: fullPage ? 'rgba(99,102,241,0.2)' : 'rgba(255,255,255,0.2)', color: fullPage ? '#818cf8' : 'white' }}>
            <AutoAwesomeIcon />
          </Avatar>
          <Box>
            <Typography variant="subtitle1" fontWeight="bold" fontFamily="'Outfit', sans-serif">
              SaralYojna AI
            </Typography>
            <Typography variant="caption" sx={{ opacity: 0.8, display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Box sx={{ width: 8, height: 8, borderRadius: '50%', background: '#10b981', animation: 'pulse 2s infinite' }} />
              RAG-Powered • Pinecone + Gemini
            </Typography>
          </Box>
        </Box>
        {!fullPage && onMinimize && (
          <IconButton size="small" onClick={onMinimize} sx={{ color: 'white', '&:hover': { background: 'rgba(255,255,255,0.1)' } }}>
            <KeyboardArrowDownIcon />
          </IconButton>
        )}
      </Box>

      {/* Chat Area */}
      <Box sx={{ 
        flexGrow: 1, overflowY: 'auto', p: { xs: 2, md: 3 },
        display: 'flex', flexDirection: 'column', gap: 2,
        '&::-webkit-scrollbar': { width: '6px' },
        '&::-webkit-scrollbar-thumb': { background: fullPage ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)', borderRadius: '10px' }
      }}>
        <List sx={{ p: 0, display: 'flex', flexDirection: 'column', gap: 2 }}>
          {messages.map((msg) => (
            <Slide direction="up" in={true} key={msg.id}>
              <ListItem sx={{ 
                p: 0, display: 'flex', flexDirection: 'column', 
                alignItems: msg.isUser ? 'flex-end' : 'flex-start' 
              }}>
                <Box sx={{ display: 'flex', gap: 1, maxWidth: '90%', flexDirection: msg.isUser ? 'row-reverse' : 'row' }}>
                  <Avatar sx={{ 
                    width: 32, height: 32, 
                    bgcolor: msg.isUser ? (fullPage ? '#6366f1' : '#4f46e5') : (fullPage ? 'rgba(255,255,255,0.1)' : '#f1f5f9'),
                    color: msg.isUser ? 'white' : (fullPage ? '#e2e8f0' : '#475569')
                  }}>
                    {msg.isUser ? <PersonIcon fontSize="small" /> : <SmartToyIcon fontSize="small" />}
                  </Avatar>
                  <Box>
                    {/* Text bubble */}
                    <Box sx={{ 
                      p: 2, borderRadius: '20px',
                      borderTopLeftRadius: msg.isUser ? '20px' : '4px',
                      borderTopRightRadius: msg.isUser ? '4px' : '20px',
                      background: msg.isUser 
                        ? (fullPage ? 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)' : 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)')
                        : (fullPage ? 'rgba(255,255,255,0.05)' : '#f8fafc'),
                      color: msg.isUser ? 'white' : (fullPage ? '#e2e8f0' : '#1e293b'),
                      border: msg.isUser ? 'none' : (fullPage ? '1px solid rgba(255,255,255,0.1)' : '1px solid #e2e8f0'),
                      boxShadow: msg.isUser ? '0 8px 20px rgba(79, 70, 229, 0.2)' : 'none'
                    }}>
                      <Typography variant="body1" sx={{ lineHeight: 1.6, whiteSpace: 'pre-wrap', fontSize: '0.9rem' }}>
                        {msg.text}
                      </Typography>
                    </Box>

                    {/* Scheme Cards */}
                    {!msg.isUser && msg.schemes && msg.schemes.length > 0 && (
                      <Box sx={{ mt: 1.5 }}>
                        <Typography variant="caption" fontWeight={600} sx={{ 
                          display: 'block', mb: 1, px: 0.5,
                          color: fullPage ? 'rgba(255,255,255,0.5)' : '#64748b' 
                        }}>
                          📋 Retrieved Schemes ({msg.schemes.length}):
                        </Typography>
                        {msg.schemes.map((scheme, i) => (
                          <SchemeCard key={i} scheme={scheme} fullPage={fullPage} />
                        ))}
                      </Box>
                    )}

                    {/* No schemes found state */}
                    {!msg.isUser && msg.noSchemesFound && (
                      <NoSchemesFound fullPage={fullPage} />
                    )}
                  </Box>
                </Box>

                {/* Suggestions */}
                {msg.suggestions && msg.suggestions.length > 0 && (
                  <Box sx={{ display: 'flex', gap: 1, mt: 1.5, ml: 5, flexWrap: 'wrap' }}>
                    {msg.suggestions.map((s, i) => (
                      <Chip 
                        key={i} label={s} size="small" variant="outlined"
                        onClick={() => handleSend(s)}
                        sx={{ 
                          color: fullPage ? '#cbd5e1' : '#475569',
                          borderColor: fullPage ? 'rgba(255,255,255,0.2)' : '#cbd5e1',
                          '&:hover': { 
                            background: fullPage ? 'rgba(255,255,255,0.1)' : '#f1f5f9',
                            borderColor: fullPage ? '#cbd5e1' : '#94a3b8'
                          }
                        }}
                      />
                    ))}
                  </Box>
                )}
                <Typography variant="caption" sx={{ mt: 0.5, px: 1, color: fullPage ? 'rgba(255,255,255,0.3)' : 'text.disabled' }}>
                  {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </Typography>
              </ListItem>
            </Slide>
          ))}

          {/* Typing indicator */}
          {isTyping && (
            <Fade in={true}>
              <ListItem sx={{ p: 0, display: 'flex', justifyContent: 'flex-start' }}>
                <Box sx={{ display: 'flex', gap: 1, maxWidth: '80%' }}>
                  <Avatar sx={{ width: 32, height: 32, bgcolor: fullPage ? 'rgba(255,255,255,0.1)' : '#f1f5f9', color: fullPage ? '#e2e8f0' : '#475569' }}>
                    <SmartToyIcon fontSize="small" />
                  </Avatar>
                  <Box sx={{ 
                    p: 2, borderRadius: '20px', borderTopLeftRadius: '4px',
                    background: fullPage ? 'rgba(255,255,255,0.05)' : '#f8fafc',
                    display: 'flex', alignItems: 'center', gap: 1
                  }}>
                    <CircularProgress size={16} sx={{ color: fullPage ? '#818cf8' : '#4f46e5' }} />
                    <Typography variant="body2" color={fullPage ? '#cbd5e1' : "text.secondary"}>
                      Searching scheme database...
                    </Typography>
                  </Box>
                </Box>
              </ListItem>
            </Fade>
          )}
          <div ref={messagesEndRef} />
        </List>
      </Box>

      {/* Input Area */}
      <Box sx={{ 
        p: 2, 
        background: fullPage ? 'rgba(0,0,0,0.2)' : 'white',
        borderTop: fullPage ? '1px solid rgba(255,255,255,0.05)' : '1px solid #e2e8f0',
        zIndex: 2
      }}>
        <Box sx={{ 
          display: 'flex', gap: 1, alignItems: 'flex-end',
          background: fullPage ? 'rgba(255,255,255,0.05)' : '#f1f5f9',
          borderRadius: '24px', p: 1,
          border: fullPage ? '1px solid rgba(255,255,255,0.1)' : '1px solid transparent',
          '&:focus-within': { border: fullPage ? '1px solid rgba(99,102,241,0.5)' : '1px solid #cbd5e1' }
        }}>
          <IconButton 
            color={isListening ? 'error' : 'default'} 
            onClick={toggleListening}
            sx={{ color: isListening ? '#ef4444' : (fullPage ? '#94a3b8' : '#64748b') }}
          >
            {isListening ? <MicOffIcon /> : <MicIcon />}
          </IconButton>
          
          <TextField
            fullWidth
            multiline
            maxRows={4}
            variant="standard"
            placeholder={isListening ? "Listening..." : "Describe your situation — e.g. 'I am a farmer in UP'"}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend(input);
              }
            }}
            InputProps={{
              disableUnderline: true,
              sx: { py: 1, color: fullPage ? 'white' : 'inherit' }
            }}
          />
          
          <IconButton 
            onClick={() => handleSend(input)}
            disabled={!input.trim() || isTyping}
            sx={{ 
              background: input.trim() && !isTyping ? 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)' : (fullPage ? 'rgba(255,255,255,0.1)' : '#e2e8f0'),
              color: input.trim() && !isTyping ? 'white' : (fullPage ? 'rgba(255,255,255,0.3)' : '#94a3b8'),
              '&:hover': { background: input.trim() && !isTyping ? 'linear-gradient(135deg, #4338ca 0%, #6d28d9 100%)' : 'auto' }
            }}
          >
            <SendIcon fontSize="small" />
          </IconButton>
        </Box>
        <Typography variant="caption" sx={{ display: 'block', textAlign: 'center', mt: 1, color: fullPage ? 'rgba(255,255,255,0.3)' : 'text.disabled' }}>
          All schemes are retrieved from verified government databases. Never fabricated.
        </Typography>
      </Box>
    </Card>
  );
}