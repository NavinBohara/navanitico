import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChatBubbleLeftRightIcon, 
  XMarkIcon, 
  MicrophoneIcon, 
  SpeakerWaveIcon,
  PaperAirplaneIcon,
  LightBulbIcon,
  GlobeAltIcon
} from '@heroicons/react/24/outline';
import { freeAIService, SUPPORTED_LANGUAGES, ChatMessage } from '../lib/freeAI';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  language?: string;
  suggestions?: string[];
}

const ChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Hello! I\'m NavaNiti AI, your multilingual financial education assistant. I can help you with budgeting, saving, investing, and protecting yourself from scams in multiple languages. How can I help you today?',
      sender: 'bot',
      timestamp: new Date(),
      language: 'en'
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [autoSpeak, setAutoSpeak] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const [showLanguageSelector, setShowLanguageSelector] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const quickSuggestions = {
    en: [
      'How to create a budget?',
      'What are safe investment options?',
      'How to identify financial scams?',
      'Emergency fund planning'
    ],
    hi: [
      'बजट कैसे बनाएं?',
      'सुरक्षित निवेश विकल्प क्या हैं?',
      'वित्तीय घोटालों की पहचान कैसे करें?',
      'आपातकालीन फंड की योजना'
    ],
    es: [
      '¿Cómo crear un presupuesto?',
      '¿Cuáles son las opciones de inversión seguras?',
      '¿Cómo identificar estafas financieras?',
      'Planificación de fondo de emergencia'
    ],
    fr: [
      'Comment créer un budget?',
      'Quelles sont les options d\'investissement sûres?',
      'Comment identifier les escroqueries financières?',
      'Planification du fonds d\'urgence'
    ]
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (messageText?: string, shouldSpeak: boolean = false) => {
    const text = messageText || inputMessage.trim();
    if (!text) return;

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      text,
      sender: 'user',
      timestamp: new Date(),
      language: selectedLanguage
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);

    try {
      // Get response from Free AI
      const response = await freeAIService.sendMessage(text, selectedLanguage, 'financial education');
      
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: response,
        sender: 'bot',
        timestamp: new Date(),
        language: selectedLanguage,
        suggestions: quickSuggestions[selectedLanguage as keyof typeof quickSuggestions] || quickSuggestions.en
      };

      setMessages(prev => [...prev, botMessage]);
      
      // Auto-speak the response if autoSpeak is enabled OR if shouldSpeak is true
      const willSpeak = autoSpeak || shouldSpeak;
      console.log('Auto-speak enabled:', autoSpeak, 'Should speak:', shouldSpeak, 'Will speak:', willSpeak);
      
      if (willSpeak) {
        console.log('Speaking response:', response.substring(0, 50) + '...');
        setTimeout(() => {
          speakText(response);
        }, 1500); // Longer delay to ensure message is rendered
      }
    } catch (error) {
      console.error('Error getting AI response:', error);
      
      // Fallback response
      const fallbackMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: selectedLanguage === 'hi' 
          ? 'मुझे खेद है, मुझे अभी कनेक्ट करने में परेशानी हो रही है। कृपया बाद में पुनः प्रयास करें।'
          : 'I\'m sorry, I\'m having trouble connecting right now. Please try again later.',
        sender: 'bot',
        timestamp: new Date(),
        language: selectedLanguage,
        suggestions: quickSuggestions[selectedLanguage as keyof typeof quickSuggestions] || quickSuggestions.en
      };

      setMessages(prev => [...prev, fallbackMessage]);
      
      // Auto-speak fallback response if autoSpeak is enabled OR if shouldSpeak is true
      const willSpeak = autoSpeak || shouldSpeak;
      if (willSpeak) {
        console.log('Speaking fallback response');
        setTimeout(() => {
          speakText(fallbackMessage.text);
        }, 1500);
      }
    } finally {
      setIsTyping(false);
    }
  };

  const handleVoiceInput = () => {
    if ('webkitSpeechRecognition' in window) {
      const recognition = new (window as any).webkitSpeechRecognition();
      
      // Set language based on selection
      const languageMap: Record<string, string> = {
        'en': 'en-US',
        'hi': 'hi-IN',
        'es': 'es-ES',
        'fr': 'fr-FR',
        'de': 'de-DE',
        'it': 'it-IT',
        'pt': 'pt-PT',
        'ru': 'ru-RU',
        'ja': 'ja-JP',
        'ko': 'ko-KR',
        'zh': 'zh-CN',
        'ar': 'ar-SA'
      };
      
      recognition.lang = languageMap[selectedLanguage] || 'en-US';
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onstart = () => setIsListening(true);
      recognition.onend = () => setIsListening(false);
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        console.log('Voice input received:', transcript);
        setInputMessage(transcript);
        // Send message immediately with shouldSpeak = true
        console.log('Sending voice message with auto-speak');
        handleSendMessage(transcript, true);
      };

      recognition.start();
    } else {
      alert('Voice recognition not supported in this browser');
    }
  };

  const speakText = (text: string) => {
    console.log('speakText called with:', text.substring(0, 50) + '...');
    if ('speechSynthesis' in window) {
      // Stop any current speech
      speechSynthesis.cancel();

      // Clean text for speech: strip emojis and most pictographic symbols so
      // the voice doesn't say "smiling face", "rocket" etc.
      let cleaned = text;
      try {
        // Remove Unicode emoji / pictographs
        cleaned = cleaned.replace(/\p{Extended_Pictographic}/gu, '');
      } catch {
        // Fallback for older engines: basic emoji ranges
        cleaned = cleaned.replace(
          /[\u2190-\u21FF\u2300-\u27BF\u1F300-\u1F6FF\u1F900-\u1F9FF\u2600-\u26FF]/g,
          ''
        );
      }

      // Collapse multiple spaces after removal
      cleaned = cleaned.replace(/\s+/g, ' ').trim();
      
      const utterance = new SpeechSynthesisUtterance(cleaned || text);
      
      // Set language for speech synthesis
      const languageMap: Record<string, string> = {
        'en': 'en-US',
        'hi': 'hi-IN',
        'es': 'es-ES',
        'fr': 'fr-FR',
        'de': 'de-DE',
        'it': 'it-IT',
        'pt': 'pt-PT',
        'ru': 'ru-RU',
        'ja': 'ja-JP',
        'ko': 'ko-KR',
        'zh': 'zh-CN',
        'ar': 'ar-SA'
      };
      
      utterance.lang = languageMap[selectedLanguage] || 'en-US';

      // More natural speaking style – slightly slower and warmer
      utterance.rate = 0.95;   // closer to natural pace
      utterance.pitch = 1.05;  // a bit brighter, typical female voice feel
      utterance.volume = 0.95; // avoid harsh clipping at full volume
      
      // Try to pick a more natural-sounding female voice for the current language
      const voices = window.speechSynthesis.getVoices();
      if (voices && voices.length > 0) {
        const langBase = utterance.lang.split('-')[0];
        const matchingLangVoices = voices.filter(v => v.lang.toLowerCase().startsWith(langBase.toLowerCase()));

        // Common female voice name hints across browsers/platforms
        const preferredNamePatterns = [
          /Neural/i,
          /WaveNet/i,
          /female/i,
          /woman/i,
          /Samantha/i,
          /Tessa/i,
          /Serena/i,
          /Raveena/i,
          /Aditi/i,
          /Google.*female/i
        ];

        let selectedVoice: SpeechSynthesisVoice | undefined;

        for (const pattern of preferredNamePatterns) {
          selectedVoice = matchingLangVoices.find(v => pattern.test(v.name));
          if (selectedVoice) break;
        }

        // Fallback: first voice for this language, or let the browser pick
        if (!selectedVoice && matchingLangVoices.length > 0) {
          selectedVoice = matchingLangVoices[0];
        }

        if (selectedVoice) {
          console.log('Using voice:', selectedVoice.name, selectedVoice.lang);
          utterance.voice = selectedVoice;
        }
      }
      
      // Track speaking state
      utterance.onstart = () => {
        console.log('Speech started');
        setIsSpeaking(true);
      };
      utterance.onend = () => {
        console.log('Speech ended');
        setIsSpeaking(false);
        // Disable auto-speak after speaking is complete
        if (autoSpeak) {
          console.log('Disabling auto-speak after speech ended');
          setAutoSpeak(false);
        }
      };
      utterance.onerror = (event) => {
        console.log('Speech error:', event);
        setIsSpeaking(false);
        if (autoSpeak) {
          setAutoSpeak(false);
        }
      };
      
      speechSynthesis.speak(utterance);
    }
  };

  const stopSpeaking = () => {
    if ('speechSynthesis' in window) {
      speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  const getLanguageName = (code: string) => {
    const lang = SUPPORTED_LANGUAGES.find(l => l.code === code);
    return lang ? `${lang.nativeName} (${lang.name})` : code;
  };

  return (
    <>
      {/* Chat Toggle Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-r from-teal-500 to-coral-500 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center z-50"
      >
        {isOpen ? (
          <XMarkIcon className="w-6 h-6" />
        ) : (
          <ChatBubbleLeftRightIcon className="w-6 h-6" />
        )}
      </motion.button>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.3 }}
            className="fixed bottom-24 right-6 w-96 h-[600px] bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden z-40"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-teal-500 to-coral-500 text-white p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                    <LightBulbIcon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold">NavaNiti AI</h3>
                    <p className="text-sm opacity-90">Multilingual Financial Assistant</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="relative">
                    <button
                      onClick={() => setShowLanguageSelector(!showLanguageSelector)}
                      className="bg-white/20 border border-white/30 rounded px-2 py-1 text-sm flex items-center space-x-1 hover:bg-white/30 transition-colors"
                    >
                      <GlobeAltIcon className="w-4 h-4" />
                      <span>{SUPPORTED_LANGUAGES.find(l => l.code === selectedLanguage)?.nativeName || 'EN'}</span>
                    </button>
                    
                    {showLanguageSelector && (
                      <div className="absolute top-full right-0 mt-1 w-64 max-h-60 overflow-y-auto bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50">
                        {SUPPORTED_LANGUAGES.map((lang) => (
                          <button
                            key={lang.code}
                            onClick={() => {
                              setSelectedLanguage(lang.code);
                              setShowLanguageSelector(false);
                            }}
                            className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
                              selectedLanguage === lang.code ? 'bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300' : 'text-gray-700 dark:text-gray-300'
                            }`}
                          >
                            <div className="font-medium">{lang.nativeName}</div>
                            <div className="text-xs opacity-75">{lang.name}</div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 h-[420px]">
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                    message.sender === 'user'
                      ? 'bg-gradient-to-r from-teal-500 to-coral-500 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
                  }`}>
                    <p className="text-sm leading-relaxed whitespace-pre-line">{message.text}</p>
                    {message.sender === 'bot' && (
                      <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-200 dark:border-gray-600">
                        <span className="text-xs opacity-75">
                          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        <div className="flex items-center space-x-1">
                          {isSpeaking ? (
                            <button
                              onClick={stopSpeaking}
                              className="text-xs opacity-75 hover:opacity-100 transition-opacity text-red-500"
                              title="Stop speaking"
                            >
                              <XMarkIcon className="w-4 h-4" />
                            </button>
                          ) : (
                            <button
                              onClick={() => {
                                console.log('Manual speak button clicked');
                                speakText(message.text);
                              }}
                              className="text-xs opacity-75 hover:opacity-100 transition-opacity"
                              title="Speak message"
                            >
                              <SpeakerWaveIcon className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}

              {/* Suggestions */}
              {messages.length > 0 && messages[messages.length - 1].suggestions && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.2 }}
                  className="flex flex-wrap gap-2"
                >
                  {messages[messages.length - 1].suggestions!.map((suggestion, index) => (
                    <button
                      key={index}
                      onClick={() => handleSendMessage(suggestion)}
                      className="px-3 py-1 bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300 rounded-full text-xs hover:bg-teal-200 dark:hover:bg-teal-900/50 transition-colors"
                    >
                      {suggestion}
                    </button>
                  ))}
                </motion.div>
              )}

              {/* Typing Indicator */}
              {isTyping && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex justify-start"
                >
                  <div className="bg-gray-100 dark:bg-gray-700 rounded-2xl px-4 py-2">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </motion.div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-2">
                <button
                  onClick={handleVoiceInput}
                  disabled={isListening}
                  className={`p-2 rounded-full transition-colors ${
                    isListening
                      ? 'bg-red-500 text-white animate-pulse'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                  title="Click to speak your question"
                >
                  <MicrophoneIcon className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setAutoSpeak(!autoSpeak)}
                  className={`p-2 rounded-full transition-colors ${
                    autoSpeak
                      ? 'bg-teal-500 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                  title={autoSpeak ? 'Auto-speak enabled - AI will speak responses' : 'Click to enable auto-speak'}
                >
                  <SpeakerWaveIcon className="w-5 h-5" />
                </button>
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder={selectedLanguage === 'hi' ? 'बजट, निवेश, घोटालों के बारे में पूछें...' : 'Ask about budgeting, investing, scams...'}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-full bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
                <button
                  onClick={() => handleSendMessage()}
                  disabled={!inputMessage.trim()}
                  className="p-2 bg-gradient-to-r from-teal-500 to-coral-500 text-white rounded-full hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <PaperAirplaneIcon className="w-5 h-5" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ChatBot;