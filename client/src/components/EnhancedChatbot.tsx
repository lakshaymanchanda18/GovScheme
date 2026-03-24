import React, { useState, useEffect, useRef } from 'react';
import { Box, Card, CardContent, Typography, TextField, Button, IconButton, Chip, Avatar, List, ListItem, ListItemAvatar, ListItemText, Divider, Grid, Paper, Tooltip, Fab } from '@mui/material';
import { useI18n } from '../hooks/useI18n';
import { Send as SendIcon, Mic as MicIcon, MicOff as MicOffIcon, VolumeUp as VolumeUpIcon, EmojiEmotions as EmojiIcon, Help as HelpIcon, Close as CloseIcon } from '@mui/icons-material';
import { SUPPORTED_LANGUAGES } from '../locales/languages';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
  type: 'text' | 'options' | 'image' | 'link';
  options?: string[];
  imageUrl?: string;
  link?: string;
}

interface QuickAction {
  id: string;
  text: string;
  icon: React.ReactNode;
  action: string;
}

export const EnhancedChatbot: React.FC = () => {
  const { t, currentLanguage } = useI18n();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [showQuickActions, setShowQuickActions] = useState(true);
  const [isMinimized, setIsMinimized] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const speechSynthesisRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Quick actions for easy navigation
  const quickActions: QuickAction[] = [
    {
      id: 'schemes',
      text: t('chatbot.quickActions.schemes', 'View Schemes'),
      icon: <HelpIcon />,
      action: 'schemes'
    },
    {
      id: 'eligibility',
      text: t('chatbot.quickActions.eligibility', 'Check Eligibility'),
      icon: <EmojiIcon />,
      action: 'eligibility'
    },
    {
      id: 'applications',
      text: t('chatbot.quickActions.applications', 'My Applications'),
      icon: <SendIcon />,
      action: 'applications'
    },
    {
      id: 'help',
      text: t('chatbot.quickActions.help', 'Get Help'),
      icon: <HelpIcon />,
      action: 'help'
    }
  ];

  // Initial greeting message
  useEffect(() => {
    const initialMessage: Message = {
      id: '1',
      text: t('chatbot.greeting', 'Hello! I\'m your GovScheme assistant. How can I help you today?'),
      isUser: false,
      timestamp: new Date(),
      type: 'options',
      options: [
        t('chatbot.options.schemes', 'Find Schemes'),
        t('chatbot.options.eligibility', 'Check Eligibility'),
        t('chatbot.options.applications', 'Track Applications'),
        t('chatbot.options.help', 'Get Help')
      ]
    };
    setMessages([initialMessage]);
  }, [currentLanguage]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Initialize speech recognition
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = currentLanguage === 'hi' ? 'hi-IN' : 'en-US';

      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInputValue(transcript);
        handleSendMessage(transcript);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }
  }, [currentLanguage]);

  const handleSendMessage = (text?: string) => {
    const messageText = text || inputValue;
    if (!messageText.trim()) return;

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      text: messageText,
      isUser: true,
      timestamp: new Date(),
      type: 'text'
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setShowQuickActions(false);

    // Process and respond
    setTimeout(() => {
      const response = generateResponse(messageText.toLowerCase());
      addBotMessage(response);
    }, 1000);
  };

  const addBotMessage = (response: Message) => {
    setMessages(prev => [...prev, response]);
  };

  const generateResponse = (userInput: string): Message => {
    // Simple rule-based responses
    if (userInput.includes('scheme') || userInput.includes('yojana') || userInput.includes('yojna')) {
      return {
        id: Date.now().toString(),
        text: t('chatbot.responses.schemes', 'I can help you find government schemes!'),
        isUser: false,
        timestamp: new Date(),
        type: 'options',
        options: [
          t('chatbot.options.byCategory', 'Browse by Category'),
          t('chatbot.options.byIncome', 'Find by Income Level'),
          t('chatbot.options.byState', 'Find by State'),
          t('chatbot.options.search', 'Search Schemes')
        ]
      };
    } else if (userInput.includes('eligibility') || userInput.includes('eligible') || userInput.includes('yogyata')) {
      return {
        id: Date.now().toString(),
        text: t('chatbot.responses.eligibility', 'Let me help you check your eligibility for schemes!'),
        isUser: false,
        timestamp: new Date(),
        type: 'options',
        options: [
          t('chatbot.options.personal', 'Personal Details'),
          t('chatbot.options.financial', 'Financial Details'),
          t('chatbot.options.family', 'Family Details'),
          t('chatbot.options.start', 'Start Eligibility Check')
        ]
      };
    } else if (userInput.includes('application') || userInput.includes('apply') || userInput.includes('form')) {
      return {
        id: Date.now().toString(),
        text: t('chatbot.responses.applications', 'Here are your application options:'),
        isUser: false,
        timestamp: new Date(),
        type: 'options',
        options: [
          t('chatbot.options.status', 'Check Status'),
          t('chatbot.options.new', 'Start New Application'),
          t('chatbot.options.help', 'Get Application Help'),
          t('chatbot.options.documents', 'Document Requirements')
        ]
      };
    } else if (userInput.includes('help') || userInput.includes('support') || userInput.includes('madad')) {
      return {
        id: Date.now().toString(),
        text: t('chatbot.responses.help', 'I\'m here to help! What do you need assistance with?'),
        isUser: false,
        timestamp: new Date(),
        type: 'options',
        options: [
          t('chatbot.options.technical', 'Technical Issues'),
          t('chatbot.options.account', 'Account Help'),
          t('chatbot.options.schemes', 'Scheme Information'),
          t('chatbot.options.contact', 'Contact Support')
        ]
      };
    } else if (userInput.includes('thank') || userInput.includes('dhanyavad')) {
      return {
        id: Date.now().toString(),
        text: t('chatbot.responses.thanks', 'You\'re welcome! Is there anything else I can help you with?'),
        isUser: false,
        timestamp: new Date(),
        type: 'options',
        options: [
          t('chatbot.options.schemes', 'Find Schemes'),
          t('chatbot.options.eligibility', 'Check Eligibility'),
          t('chatbot.options.applications', 'Track Applications'),
          t('chatbot.options.nothing', 'Nothing else')
        ]
      };
    } else {
      return {
        id: Date.now().toString(),
        text: t('chatbot.responses.default', 'I understand you want help with schemes. Let me show you the main options:'),
        isUser: false,
        timestamp: new Date(),
        type: 'options',
        options: [
          t('chatbot.options.schemes', 'Find Schemes'),
          t('chatbot.options.eligibility', 'Check Eligibility'),
          t('chatbot.options.applications', 'Track Applications'),
          t('chatbot.options.help', 'Get Help')
        ]
      };
    }
  };

  const handleQuickAction = (action: string) => {
    switch (action) {
      case 'schemes':
        handleSendMessage(t('chatbot.quickMessages.schemes', 'Show me government schemes'));
        break;
      case 'eligibility':
        handleSendMessage(t('chatbot.quickMessages.eligibility', 'Help me check eligibility'));
        break;
      case 'applications':
        handleSendMessage(t('chatbot.quickMessages.applications', 'Show my applications'));
        break;
      case 'help':
        handleSendMessage(t('chatbot.quickMessages.help', 'I need help'));
        break;
    }
  };

  const handleVoiceInput = () => {
    if (!isListening) {
      if (recognitionRef.current) {
        setIsListening(true);
        recognitionRef.current.start();
      } else {
        alert('Speech recognition not supported in this browser');
      }
    } else {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    }
  };

  const speakMessage = (text: string) => {
    if (!('speechSynthesis' in window)) {
      return;
    }

    if (speechSynthesisRef.current) {
      window.speechSynthesis.cancel();
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = currentLanguage === 'hi' ? 'hi-IN' : 'en-US';
    utterance.rate = 0.9;
    utterance.pitch = 1;
    
    speechSynthesisRef.current = utterance;
    setIsSpeaking(true);
    
    utterance.onend = () => {
      setIsSpeaking(false);
      speechSynthesisRef.current = null;
    };

    window.speechSynthesis.speak(utterance);
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const renderMessageContent = (message: Message) => {
    switch (message.type) {
      case 'options':
        return (
          <Box>
            <Typography variant="body1" sx={{ mb: 2 }}>
              {message.text}
            </Typography>
            <Grid container spacing={1}>
              {message.options?.map((option, index) => (
                <Grid item xs={12} sm={6} key={index}>
                  <Chip
                    label={option}
                    clickable
                    onClick={() => handleSendMessage(option)}
                    variant="outlined"
                    color="primary"
                    sx={{ mb: 1, mr: 1 }}
                  />
                </Grid>
              ))}
            </Grid>
          </Box>
        );
      case 'image':
        return (
          <Box>
            <Typography variant="body1" sx={{ mb: 2 }}>
              {message.text}
            </Typography>
            {message.imageUrl && (
              <Box
                component="img"
                src={message.imageUrl}
                alt="Chatbot response"
                sx={{ maxWidth: '100%', borderRadius: '8px', mb: 2 }}
              />
            )}
          </Box>
        );
      case 'link':
        return (
          <Box>
            <Typography variant="body1" sx={{ mb: 2 }}>
              {message.text}
            </Typography>
            {message.link && (
              <Button
                variant="outlined"
                href={message.link}
                target="_blank"
                rel="noopener noreferrer"
              >
                {t('chatbot.visitLink', 'Visit Link')}
              </Button>
            )}
          </Box>
        );
      default:
        return (
          <Typography variant="body1">
            {message.text}
          </Typography>
        );
    }
  };

  if (isMinimized) {
    return (
      <Box
        sx={{
          position: 'fixed',
          bottom: 20,
          right: 20,
          zIndex: 1000
        }}
      >
        <Fab
          color="primary"
          onClick={() => setIsMinimized(false)}
          sx={{
            boxShadow: 3,
            '&:hover': {
              transform: 'scale(1.05)',
              transition: 'transform 0.2s ease'
            }
          }}
        >
          <HelpIcon />
        </Fab>
      </Box>
    );
  }

  return (
    <Card
      sx={{
        position: 'fixed',
        bottom: 20,
        right: 20,
        width: 400,
        maxHeight: 600,
        display: 'flex',
        flexDirection: 'column',
        boxShadow: 4,
        zIndex: 1000,
        backgroundColor: 'background.paper'
      }}
    >
      {/* Header */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          p: 2,
          borderBottom: '1px solid',
          borderColor: 'divider',
          backgroundColor: 'primary.main',
          color: 'white'
        }}
      >
        <Box display="flex" alignItems="center" gap={2}>
          <Avatar sx={{ bgcolor: 'white', color: 'primary.main' }}>
            <HelpIcon />
          </Avatar>
          <Box>
            <Typography variant="h6" fontWeight="600">
              {t('chatbot.title', 'GovScheme Assistant')}
            </Typography>
            <Typography variant="caption" sx={{ opacity: 0.8 }}>
              {t('chatbot.subtitle', 'AI-Powered Help')}
            </Typography>
          </Box>
        </Box>
        <Box display="flex" gap={1}>
          <Tooltip title={t('chatbot.minimize', 'Minimize')}>
            <IconButton size="small" onClick={() => setIsMinimized(true)} sx={{ color: 'white' }}>
              <CloseIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* Messages Area */}
      <CardContent sx={{ flex: 1, overflow: 'auto', p: 2, pb: 1 }}>
        <List sx={{ p: 0 }}>
          {messages.map((message, index) => (
            <React.Fragment key={message.id}>
              <ListItem
                alignItems="flex-start"
                sx={{
                  flexDirection: message.isUser ? 'row-reverse' : 'row',
                  justifyContent: message.isUser ? 'flex-end' : 'flex-start',
                  mb: 1
                }}
              >
                <ListItemAvatar>
                  <Avatar sx={{ 
                    bgcolor: message.isUser ? 'primary.main' : 'secondary.main',
                    color: 'white'
                  }}>
                    {message.isUser ? '👤' : '🤖'}
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={
                    <Box display="flex" alignItems="center" gap={1}>
                      <Typography variant="caption" color="text.secondary">
                        {formatTime(message.timestamp)}
                      </Typography>
                      <IconButton
                        size="small"
                        onClick={() => speakMessage(message.text)}
                        disabled={isSpeaking}
                      >
                        <VolumeUpIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  }
                  secondary={
                    <Paper
                      elevation={0}
                      sx={{
                        p: 1.5,
                        borderRadius: '16px',
                        backgroundColor: message.isUser ? 'primary.light' : 'grey.100',
                        color: message.isUser ? 'primary.contrastText' : 'text.primary',
                        mt: 0.5
                      }}
                    >
                      {renderMessageContent(message)}
                    </Paper>
                  }
                />
              </ListItem>
              {index < messages.length - 1 && <Divider variant="inset" component="li" />}
            </React.Fragment>
          ))}
          <div ref={messagesEndRef} />
        </List>

        {/* Quick Actions */}
        {showQuickActions && (
          <Box sx={{ mt: 2, mb: 2 }}>
            <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
              {t('chatbot.quickActionsTitle', 'Quick Actions')}
            </Typography>
            <Grid container spacing={1}>
              {quickActions.map((action) => (
                <Grid item xs={6} key={action.id}>
                  <Chip
                    label={action.text}
                    icon={action.icon as React.ReactElement}
                    clickable
                    onClick={() => handleQuickAction(action.action)}
                    variant="outlined"
                    color="primary"
                    sx={{ mb: 1, width: '100%' }}
                  />
                </Grid>
              ))}
            </Grid>
          </Box>
        )}
      </CardContent>

      {/* Input Area */}
      <Box sx={{ p: 2, borderTop: '1px solid', borderColor: 'divider' }}>
        <Box display="flex" gap={1} alignItems="center">
          <IconButton
            onClick={handleVoiceInput}
            color={isListening ? 'primary' : 'default'}
            disabled={isSpeaking}
          >
            {isListening ? <MicOffIcon /> : <MicIcon />}
          </IconButton>
          <TextField
            fullWidth
            variant="outlined"
            placeholder={t('chatbot.inputPlaceholder', 'Type your message...')}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            size="small"
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: '20px',
                backgroundColor: 'background.default'
              }
            }}
          />
          <IconButton
            onClick={() => handleSendMessage()}
            color="primary"
            disabled={!inputValue.trim()}
          >
            <SendIcon />
          </IconButton>
        </Box>
        <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
          {t('chatbot.tip', 'Tip')}: {t('chatbot.tipText', 'Use voice input for easier communication')}
        </Typography>
      </Box>
    </Card>
  );
};