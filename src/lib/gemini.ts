import { GoogleGenerativeAI } from '@google/generative-ai';

const apiKey = import.meta.env.VITE_GEMINI_API_KEY as string;
console.log('Gemini API Key loaded:', apiKey ? 'Yes' : 'No');
console.log('API Key value:', apiKey ? apiKey.substring(0, 10) + '...' : 'undefined');
console.log('Full API Key:', apiKey);
console.log('All env vars:', import.meta.env);

if (!apiKey) {
  console.error('VITE_GEMINI_API_KEY is not defined in environment variables');
}

const genAI = new GoogleGenerativeAI(apiKey);

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  language?: string;
}

export interface LanguageOption {
  code: string;
  name: string;
  nativeName: string;
}

export const SUPPORTED_LANGUAGES: LanguageOption[] = [
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी' },
  { code: 'es', name: 'Spanish', nativeName: 'Español' },
  { code: 'fr', name: 'French', nativeName: 'Français' },
  { code: 'de', name: 'German', nativeName: 'Deutsch' },
  { code: 'it', name: 'Italian', nativeName: 'Italiano' },
  { code: 'pt', name: 'Portuguese', nativeName: 'Português' },
  { code: 'ru', name: 'Russian', nativeName: 'Русский' },
  { code: 'ja', name: 'Japanese', nativeName: '日本語' },
  { code: 'ko', name: 'Korean', nativeName: '한국어' },
  { code: 'zh', name: 'Chinese', nativeName: '中文' },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية' },
  { code: 'bn', name: 'Bengali', nativeName: 'বাংলা' },
  { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்' },
  { code: 'te', name: 'Telugu', nativeName: 'తెలుగు' },
  { code: 'gu', name: 'Gujarati', nativeName: 'ગુજરાતી' },
  { code: 'mr', name: 'Marathi', nativeName: 'मराठी' },
  { code: 'kn', name: 'Kannada', nativeName: 'ಕನ್ನಡ' },
  { code: 'ml', name: 'Malayalam', nativeName: 'മലയാളം' },
  { code: 'pa', name: 'Punjabi', nativeName: 'ਪੰਜਾਬੀ' }
];

export class GeminiChatService {
  private model: any;
  private chatHistory: ChatMessage[] = [];

  constructor() {
    this.model = genAI.getGenerativeModel({ model: 'gemini-pro' });
  }

  async sendMessage(
    message: string, 
    language: string = 'en',
    context: string = 'financial education'
  ): Promise<string> {
    try {
      console.log('Sending message to Gemini:', message);
      console.log('Language:', language);
      
      // Create a system prompt based on language and context
      const systemPrompt = this.createSystemPrompt(language, context);
      
      // Add user message to history
      this.chatHistory.push({
        role: 'user',
        content: message,
        timestamp: new Date(),
        language
      });

      // Prepare the full conversation for Gemini
      const fullPrompt = `${systemPrompt}\n\nConversation History:\n${this.chatHistory
        .slice(-10) // Keep last 10 messages for context
        .map(msg => `${msg.role}: ${msg.content}`)
        .join('\n')}\n\nUser: ${message}\n\nAssistant:`;

      console.log('Calling Gemini API...');
      const result = await this.model.generateContent(fullPrompt);
      const response = await result.response;
      const text = response.text();
      console.log('Gemini response received:', text.substring(0, 100) + '...');

      // Add assistant response to history
      this.chatHistory.push({
        role: 'assistant',
        content: text,
        timestamp: new Date(),
        language
      });

      return text;
    } catch (error) {
      console.error('Gemini API Error details:', error);
      console.error('Error message:', error instanceof Error ? error.message : 'Unknown error');
      console.error('Error stack:', error instanceof Error ? error.stack : 'No stack');
      console.error('API Key present:', !!apiKey);
      console.error('Model:', this.model);
      
      // The API key might not have access to Gemini models
      console.log('API key appears to be valid but may not have Gemini access');
      console.log('This could be due to:');
      console.log('1. API key not having Gemini permissions');
      console.log('2. Gemini API not enabled in Google Cloud Console');
      console.log('3. Regional restrictions');
      
      return this.getFallbackResponse(language);
    }
  }

  private createSystemPrompt(language: string, context: string): string {
    const languageInfo = SUPPORTED_LANGUAGES.find(lang => lang.code === language);
    const languageName = languageInfo?.nativeName || languageInfo?.name || 'English';

    return `You are NavaNiti AI, a helpful financial education assistant. 

IMPORTANT INSTRUCTIONS:
1. Respond ONLY in ${languageName} (${language}).
2. You help users learn about personal finance, budgeting, investing, and money management.
3. Keep responses concise, practical, and easy to understand.
4. Use examples relevant to Indian financial context when appropriate.
5. If asked about topics outside finance, politely redirect to financial topics.
6. Always be encouraging and supportive in your responses.

Context: ${context}

Remember: Always respond in ${languageName} language.`;
  }

  private getFallbackResponse(language: string): string {
    const fallbackResponses: Record<string, string> = {
      en: "I'm currently having trouble connecting to my AI service, but I can still help you with basic financial advice! Here are some key tips:\n\n💰 **Budgeting**: Track your income and expenses, aim to save 20% of your income\n💡 **Emergency Fund**: Save 3-6 months of expenses for emergencies\n📈 **Investing**: Start with low-risk options like mutual funds or ETFs\n🛡️ **Scam Protection**: Never share OTP, PIN, or personal details with anyone\n\nFeel free to ask me about any of these topics!",
      hi: "मुझे अभी AI सेवा से कनेक्ट करने में परेशानी हो रही है, लेकिन मैं आपकी बुनियादी वित्तीय सलाह में मदद कर सकता हूं! यहां कुछ महत्वपूर्ण सुझाव हैं:\n\n💰 **बजट बनाना**: अपनी आय और खर्चों को ट्रैक करें, अपनी आय का 20% बचाने का लक्ष्य रखें\n💡 **आपातकालीन फंड**: आपातकाल के लिए 3-6 महीने के खर्चों के बराबर बचत करें\n📈 **निवेश**: म्यूचुअल फंड या ETF जैसे कम जोखिम वाले विकल्पों से शुरुआत करें\n🛡️ **घोटाला सुरक्षा**: कभी भी OTP, PIN या व्यक्तिगत विवरण किसी के साथ साझा न करें\n\nइन विषयों के बारे में कुछ भी पूछने के लिए स्वतंत्र महसूस करें!",
      es: "Lo siento, estoy teniendo problemas para conectarme ahora. Por favor, inténtalo de nuevo más tarde.",
      fr: "Je suis désolé, j'ai des difficultés à me connecter en ce moment. Veuillez réessayer plus tard.",
      de: "Es tut mir leid, ich habe gerade Verbindungsprobleme. Bitte versuchen Sie es später erneut.",
      it: "Mi dispiace, sto avendo problemi di connessione in questo momento. Riprova più tardi.",
      pt: "Desculpe, estou tendo problemas para me conectar agora. Tente novamente mais tarde.",
      ru: "Извините, у меня сейчас проблемы с подключением. Пожалуйста, попробуйте позже.",
      ja: "申し訳ございませんが、現在接続に問題があります。後でもう一度お試しください。",
      ko: "죄송합니다. 지금 연결에 문제가 있습니다. 나중에 다시 시도해 주세요.",
      zh: "抱歉，我现在连接有问题。请稍后再试。",
      ar: "أعتذر، أواجه مشاكل في الاتصال الآن. يرجى المحاولة مرة أخرى لاحقاً.",
      bn: "দুঃখিত, এখন আমার সংযোগে সমস্যা হচ্ছে। দয়া করে পরে আবার চেষ্টা করুন।",
      ta: "மன்னிக்கவும், இப்போது எனக்கு இணைப்பில் சிக்கல் உள்ளது. பின்னர் மீண்டும் முயற்சிக்கவும்।",
      te: "క్షమించండి, ఇప్పుడు నాకు కనెక్షన్‌లో సమస్య ఉంది. దయచేసి తర్వాత మళ్లీ ప్రయత్నించండి।",
      gu: "માફ કરશો, મને હમણાં કનેક્શનમાં સમસ્યા આવી રહી છે। કૃપા કરીને પછીથી ફરીથી પ્રયાસ કરો।",
      mr: "माफ करा, मला आता कनेक्शनमध्ये समस्या येत आहे. कृपया नंतर पुन्हा प्रयत्न करा।",
      kn: "ಕ್ಷಮಿಸಿ, ನನಗೆ ಈಗ ಕನೆಕ್ಷನ್‌ನಲ್ಲಿ ಸಮಸ್ಯೆ ಇದೆ। ದಯವಿಟ್ಟು ನಂತರ ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ।",
      ml: "ക്ഷമിക്കണം, എനിക്ക് ഇപ്പോൾ കണക്ഷനിൽ പ്രശ്നമുണ്ട്. ദയവായി പിന്നീട് വീണ്ടും ശ്രമിക്കുക।",
      pa: "ਮਾਫ਼ ਕਰੋ, ਮੈਨੂੰ ਹੁਣ ਕਨੈਕਸ਼ਨ ਵਿੱਚ ਸਮੱਸਿਆ ਆ ਰਹੀ ਹੈ। ਕਿਰਪਾ ਕਰਕੇ ਬਾਅਦ ਵਿੱਚ ਦੁਬਾਰਾ ਕੋਸ਼ਿਸ਼ ਕਰੋ।"
    };

    return fallbackResponses[language] || fallbackResponses.en;
  }

  clearHistory(): void {
    this.chatHistory = [];
  }

  getHistory(): ChatMessage[] {
    return [...this.chatHistory];
  }
}

// Export a singleton instance
export const geminiChatService = new GeminiChatService();
