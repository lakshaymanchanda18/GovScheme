import React, { useState, useRef, useEffect } from 'react';
import { Box, Button, Typography, Chip, LinearProgress, Alert, IconButton } from '@mui/material';
import { useI18n } from '../hooks/useI18n';
import { useNavigate } from 'react-router-dom';
import {
  Mic as MicIcon,
  MicOff as MicOffIcon,
  VolumeUp as VolumeUpIcon,
  VolumeOff as VolumeOffIcon,
  PlayArrow as PlayArrowIcon,
  Stop as StopIcon,
  Accessibility as AccessibilityIcon
} from '@mui/icons-material';

interface VoiceCommand {
  command: string;
  action: string;
  description: string;
}

export const VoiceInterface: React.FC = () => {
  const { t, currentLanguage } = useI18n();
  const navigate = useNavigate();
  
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [confidence, setConfidence] = useState(0);
  const [isVoiceEnabled, setIsVoiceEnabled] = useState(false);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const recognitionRef = useRef<any>(null);
  const speechSynthesisRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Voice commands mapping
  const voiceCommands: VoiceCommand[] = [
    { command: 'dashboard', action: 'navigate', description: t('voice.dashboard', 'Go to Dashboard') },
    { command: 'schemes', action: 'navigate', description: t('voice.schemes', 'View Schemes') },
    { command: 'eligibility', action: 'navigate', description: t('voice.eligibility', 'Check Eligibility') },
    { command: 'applications', action: 'navigate', description: t('voice.applications', 'My Applications') },
    { command: 'profile', action: 'navigate', description: t('voice.profile', 'My Profile') },
    { command: 'help', action: 'help', description: t('voice.help', 'Get Help') },
    { command: 'search', action: 'search', description: t('voice.search', 'Search Schemes') },
    { command: 'apply', action: 'apply', description: t('voice.apply', 'Start Application') },
    { command: 'stop', action: 'stop', description: t('voice.stop', 'Stop Listening') }
  ];

  useEffect(() => {
    // Initialize speech recognition
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = currentLanguage === 'hi' ? 'hi-IN' : 'en-US';

      recognitionRef.current.onresult = (event: any) => {
        let finalTranscript = '';
        let interimTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i];
          if (result.isFinal) {
            finalTranscript += result[0].transcript;
          } else {
            interimTranscript += result[0].transcript;
          }
        }

        setTranscript(finalTranscript || interimTranscript);
        setConfidence(event.results[event.results.length - 1][0].confidence || 0);
        
        if (finalTranscript) {
          processVoiceCommand(finalTranscript);
        }
      };

      recognitionRef.current.onerror = (event: any) => {
        setError(`Speech recognition error: ${event.error}`);
        setIsListening(false);
      };

      recognitionRef.current.onend = () => {
        if (isListening) {
          setIsListening(false);
        }
      };
    }
  }, [currentLanguage]);

  const toggleVoiceInput = () => {
    if (!isVoiceEnabled) {
      setIsVoiceEnabled(true);
      speak(t('voice.welcome', 'Voice interface enabled. Say "help" for available commands.'));
      return;
    }

    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  const startListening = () => {
    if (!recognitionRef.current) {
      setError('Speech recognition not supported in this browser');
      return;
    }

    setTranscript('');
    setConfidence(0);
    setError(null);
    
    try {
      recognitionRef.current.start();
      setIsListening(true);
      speak(t('voice.listening', 'Listening...'));
    } catch (err) {
      setError('Failed to start voice recognition');
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
      speak(t('voice.stopped', 'Voice input stopped'));
    }
  };

  const toggleAudioOutput = () => {
    setIsAudioEnabled(!isAudioEnabled);
    if (!isAudioEnabled) {
      speak(t('voice.audioOn', 'Audio feedback enabled'));
    } else {
      speak(t('voice.audioOff', 'Audio feedback disabled'));
    }
  };

  const speak = (text: string) => {
    if (!isAudioEnabled || !('speechSynthesis' in window)) {
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

  const processVoiceCommand = (command: string) => {
    const normalizedCommand = command.toLowerCase().trim();
    
    // Find matching command
    const matchedCommand = voiceCommands.find(vc => 
      normalizedCommand.includes(vc.command)
    );

    if (matchedCommand) {
      executeCommand(matchedCommand.action, normalizedCommand);
      speak(t('voice.commandExecuted', `Executing: ${matchedCommand.description}`));
    } else if (normalizedCommand.includes('help')) {
      showHelp();
    } else {
      speak(t('voice.commandNotFound', 'Command not recognized. Say "help" for available commands.'));
    }
  };

  const executeCommand = (action: string, command: string) => {
    switch (action) {
      case 'navigate':
        if (command.includes('dashboard')) navigate('/dashboard');
        else if (command.includes('schemes')) navigate('/schemes');
        else if (command.includes('eligibility')) navigate('/eligibility');
        else if (command.includes('applications')) navigate('/applications');
        else if (command.includes('profile')) navigate('/profile');
        break;
      case 'help':
        showHelp();
        break;
      case 'search':
        speak(t('voice.searchHelp', 'Please use the search box on the schemes page'));
        break;
      case 'apply':
        speak(t('voice.applyHelp', 'Please go to schemes page and click apply'));
        break;
      case 'stop':
        stopListening();
        break;
    }
  };

  const showHelp = () => {
    const helpText = t('voice.helpText', 'Available commands: ') + 
      voiceCommands.map(vc => vc.description).join(', ');
    speak(helpText);
  };

  const getAccessibilityStatus = () => {
    if (!isVoiceEnabled) {
      return { status: 'disabled', color: 'default', text: t('voice.disabled', 'Voice Interface Disabled') };
    }
    if (isListening) {
      return { status: 'active', color: 'success', text: t('voice.active', 'Voice Input Active') };
    }
    return { status: 'ready', color: 'info', text: t('voice.ready', 'Voice Input Ready') };
  };

  const status = getAccessibilityStatus();

  return (
    <Box sx={{ p: 2, border: '1px solid', borderColor: 'divider', borderRadius: '12px', backgroundColor: 'background.paper' }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Box display="flex" alignItems="center" gap={1}>
          <AccessibilityIcon color="primary" />
          <Typography variant="subtitle2" fontWeight="600">
            {t('voice.title', 'Voice Interface')}
          </Typography>
          <Chip
            label={status.text}
            size="small"
            color={status.color as any}
            variant="outlined"
          />
        </Box>
        
        <Box display="flex" gap={1}>
          <IconButton
            onClick={toggleAudioOutput}
            color={isAudioEnabled ? 'primary' : 'default'}
            title={isAudioEnabled ? t('voice.mute', 'Mute Audio') : t('voice.unmute', 'Unmute Audio')}
          >
            {isAudioEnabled ? <VolumeUpIcon /> : <VolumeOffIcon />}
          </IconButton>
          <IconButton
            onClick={toggleVoiceInput}
            color={isVoiceEnabled ? 'primary' : 'default'}
            title={isVoiceEnabled ? t('voice.stop', 'Stop Voice') : t('voice.start', 'Start Voice')}
          >
            {isVoiceEnabled ? <MicIcon /> : <MicOffIcon />}
          </IconButton>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {isListening && (
        <Box sx={{ mb: 2 }}>
          <LinearProgress 
            variant="determinate" 
            value={confidence * 100} 
            sx={{ mb: 1 }}
          />
          <Typography variant="caption" color="text.secondary">
            {t('voice.confidence', 'Confidence')}: {Math.round(confidence * 100)}%
          </Typography>
        </Box>
      )}

      {transcript && (
        <Box sx={{ mb: 2, p: 2, backgroundColor: 'background.default', borderRadius: '8px' }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            {t('voice.transcript', 'You said:')}
          </Typography>
          <Typography variant="body1" sx={{ fontWeight: 600 }}>
            "{transcript}"
          </Typography>
        </Box>
      )}

      <Box sx={{ mb: 2 }}>
        <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
          {t('voice.commands', 'Available Commands:')}
        </Typography>
        <Box display="flex" flexWrap="wrap" gap={1}>
          {voiceCommands.map((vc, index) => (
            <Chip
              key={index}
              label={vc.description}
              size="small"
              variant="outlined"
              color="primary"
            />
          ))}
        </Box>
      </Box>

      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Typography variant="caption" color="text.secondary">
          {t('voice.tip', 'Tip')}: {t('voice.tipText', 'Click the mic button and speak clearly')}
        </Typography>
        {isSpeaking && (
          <Box display="flex" alignItems="center" gap={1}>
            <PlayArrowIcon color="primary" />
            <Typography variant="caption" color="primary">
              {t('voice.speaking', 'Speaking...')}
            </Typography>
          </Box>
        )}
      </Box>
    </Box>
  );
};