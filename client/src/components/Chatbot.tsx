import React, { useState, useEffect, useRef } from 'react';
import { Box, Button, Card, CardContent, IconButton, TextField, Typography, List, ListItem, ListItemText, Chip, Fab, Dialog, DialogTitle, DialogContent, DialogActions, Alert } from '@mui/material';
import { useAuth } from '../hooks/useAuth';
import { useApi } from '../hooks/useApi';
import { useI18n } from '../hooks/useI18n';
import { useNavigate } from 'react-router-dom';
import { Send as SendIcon, Chat as ChatIcon, Close as CloseIcon, Help as HelpIcon, Lightbulb as LightbulbIcon } from '@mui/icons-material';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
  suggestions?: string[];
}

interface ChatbotProps {
  open: boolean;
  onClose: () => void;
}

export default function Chatbot({ open, onClose }: ChatbotProps) {
  const { user } = useAuth();
  const { api } = useApi();
  const { t, i18n } = useI18n();
  const navigate = useNavigate();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: t('chatbot.greeting'),
      isUser: false,
      timestamp: new Date(),
      suggestions: [
        t('chatbot.suggestions.eligibility'),
        t('chatbot.suggestions.schemes'),
        t('chatbot.suggestions.documents'),
        t('chatbot.suggestions.status')
      ]
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isTyping) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputValue.trim(),
      isUser: true,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);
    setError(null);

    try {
      const response = await api.post('/chatbot/query', {
        message: userMessage.text,
        userId: user?.id,
        conversationHistory: messages.map(m => ({
          text: m.text,
          isUser: m.isUser,
          timestamp: m.timestamp
        }))
      });

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: response.reply,
        isUser: false,
        timestamp: new Date(),
        suggestions: response.suggestions || []
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (err) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: t('chatbot.error'),
        isUser: false,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
      setError(err instanceof Error ? err.message : 'Failed to get response');
    } finally {
      setIsTyping(false);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInputValue(suggestion);
    setTimeout(handleSendMessage, 100);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleNavigate = (path: string) => {
    navigate(path);
    onClose();
  };

  const getActionButtons = (message: Message) => {
    const actions: Array<{ label: string; onClick: () => void }> = [];

    if (message.text.toLowerCase().includes('eligibility') || message.text.toLowerCase().includes('eligible')) {
      actions.push({
        label: t('chatbot.checkEligibility'),
        onClick: () => handleNavigate('/eligibility')
      });
    }

    if (message.text.toLowerCase().includes('scheme') || message.text.toLowerCase().includes('yojana')) {
      actions.push({
        label: t('chatbot.viewSchemes'),
        onClick: () => handleNavigate('/schemes')
      });
    }

    if (message.text.toLowerCase().includes('application') || message.text.toLowerCase().includes('apply')) {
      actions.push({
        label: t('chatbot.trackApplication'),
        onClick: () => handleNavigate('/applications')
      });
    }

    if (message.text.toLowerCase().includes('document') || message.text.toLowerCase().includes('required')) {
      actions.push({
        label: t('chatbot.documentHelp'),
        onClick: () => handleNavigate('/applications')
      });
    }

    return actions;
  };

  return (
    <>
      {/* Floating Chat Button */}
      <Fab
        color="primary"
        aria-label="chat"
        sx={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          zIndex: 1000,
          display: open ? 'none' : 'flex',
          boxShadow: 3,
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: 6
          }
        }}
        onClick={() => navigate('/chatbot')}
      >
        <ChatIcon />
      </Fab>

      {/* Chat Dialog */}
      <Dialog
        open={open}
        onClose={onClose}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            height: '60vh',
            display: 'flex',
            flexDirection: 'column'
          }
        }}
      >
        <DialogTitle>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Box display="flex" alignItems="center" gap={2}>
              <LightbulbIcon color="primary" />
              <Typography variant="h6" fontWeight="bold">
                {t('chatbot.title')}
              </Typography>
            </Box>
            <IconButton onClick={onClose}>
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>

        <DialogContent sx={{ flex: 1, overflow: 'hidden', p: 0 }}>
          <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            {/* Messages Area */}
            <Box sx={{ flex: 1, overflow: 'auto', p: 2, backgroundColor: '#f5f5f5' }}>
              <List>
                {messages.map((message) => (
                  <ListItem
                    key={message.id}
                    alignItems="flex-start"
                    sx={{
                      flexDirection: message.isUser ? 'row-reverse' : 'row',
                      mb: 1
                    }}
                  >
                    <ListItemText
                      primary={
                        <Card
                          sx={{
                            display: 'inline-block',
                            p: 1.5,
                            borderRadius: 2,
                            backgroundColor: message.isUser ? 'primary.main' : 'white',
                            color: message.isUser ? 'white' : 'text.primary',
                            maxWidth: '80%'
                          }}
                        >
                          <Typography variant="body2">
                            {message.text}
                          </Typography>
                          <Typography variant="caption" sx={{ opacity: 0.7, display: 'block', mt: 0.5 }}>
                            {message.timestamp.toLocaleTimeString()}
                          </Typography>
                        </Card>
                      }
                    />
                  </ListItem>
                ))}
                
                {isTyping && (
                  <ListItem>
                    <ListItemText
                      primary={
                        <Card
                          sx={{
                            display: 'inline-block',
                            p: 1.5,
                            borderRadius: 2,
                            backgroundColor: 'white',
                            color: 'text.primary'
                          }}
                        >
                          <Typography variant="body2" color="text.secondary">
                            {t('chatbot.typing')}
                          </Typography>
                        </Card>
                      }
                    />
                  </ListItem>
                )}
                
                <div ref={messagesEndRef} />
              </List>
            </Box>

            {/* Suggestions */}
            {messages[messages.length - 1]?.suggestions && messages[messages.length - 1].suggestions.length > 0 && (
              <Box sx={{ px: 2, pb: 1 }}>
                <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
                  {t('chatbot.suggestions.title')}
                </Typography>
                <Box display="flex" flexWrap="wrap" gap={1}>
                  {messages[messages.length - 1].suggestions.map((suggestion, index) => (
                    <Chip
                      key={index}
                      label={suggestion}
                      variant="outlined"
                      clickable
                      size="small"
                      onClick={() => handleSuggestionClick(suggestion)}
                      sx={{ mb: 1 }}
                    />
                  ))}
                </Box>
              </Box>
            )}

            {/* Action Buttons */}
            {getActionButtons(messages[messages.length - 1]).length > 0 && (
              <Box sx={{ px: 2, pb: 2 }}>
                <Box display="flex" flexWrap="wrap" gap={1}>
                  {getActionButtons(messages[messages.length - 1]).map((action, index) => (
                    <Button
                      key={index}
                      size="small"
                      variant="contained"
                      onClick={action.onClick}
                      sx={{ textTransform: 'none' }}
                    >
                      {action.label}
                    </Button>
                  ))}
                </Box>
              </Box>
            )}

            {/* Input Area */}
            <Box sx={{ p: 2, borderTop: '1px solid #e0e0e0', backgroundColor: 'white' }}>
              {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {error}
                </Alert>
              )}
              <Box display="flex" gap={1}>
                <TextField
                  fullWidth
                  variant="outlined"
                  placeholder={t('chatbot.placeholder')}
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  disabled={isTyping}
                  multiline
                  maxRows={3}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 20
                    }
                  }}
                />
                <IconButton
                  color="primary"
                  onClick={handleSendMessage}
                  disabled={!inputValue.trim() || isTyping}
                  sx={{
                    backgroundColor: 'primary.main',
                    color: 'white',
                    '&:hover': {
                      backgroundColor: 'primary.dark'
                    },
                    '&.Mui-disabled': {
                      backgroundColor: 'grey.300',
                      color: 'grey.500'
                    }
                  }}
                >
                  <SendIcon />
                </IconButton>
              </Box>
              <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                {t('chatbot.disclaimer')}
              </Typography>
            </Box>
          </Box>
        </DialogContent>
      </Dialog>
    </>
  );
}

// Standalone Chatbot Page Component
export function ChatbotPage() {
  const [open, setOpen] = React.useState(true);
  const { t } = useI18n();

  const handleClose = () => {
    setOpen(false);
    // Navigate back to previous page
    window.history.back();
  };

  return (
    <Box sx={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f5f5f5' }}>
      <Chatbot open={open} onClose={handleClose} />
      <Box textAlign="center">
        <HelpIcon sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
        <Typography variant="h4" gutterBottom>
          {t('chatbot.title')}
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          {t('chatbot.subtitle')}
        </Typography>
      </Box>
    </Box>
  );
}