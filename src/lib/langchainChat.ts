import { ChatOpenAI } from '@langchain/openai';
import { ChatPromptTemplate } from '@langchain/core/prompts';
import { StringOutputParser } from '@langchain/core/output_parsers';

// Using a free model from Hugging Face via Replicate
const model = new ChatOpenAI({
  modelName: 'gpt-3.5-turbo',
  openAIApiKey: 'dummy-key', // We'll use a different approach
  configuration: {
    baseURL: 'https://api.replicate.com/v1',
  },
});

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

export class LangChainChatService {
  private chatHistory: ChatMessage[] = [];

  async sendMessage(
    message: string, 
    language: string = 'en',
    context: string = 'financial education'
  ): Promise<string> {
    try {
      console.log('Sending message via LangChain:', message);
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

      // Create the prompt template
      const prompt = ChatPromptTemplate.fromMessages([
        ['system', systemPrompt],
        ['human', '{input}']
      ]);

      // Create the chain
      const chain = prompt.pipe(model).pipe(new StringOutputParser());

      console.log('Calling LangChain...');
      const response = await chain.invoke({ input: message });
      console.log('LangChain response received:', response.substring(0, 100) + '...');

      // Add assistant response to history
      this.chatHistory.push({
        role: 'assistant',
        content: response,
        timestamp: new Date(),
        language
      });

      return response;
    } catch (error) {
      console.error('LangChain Error details:', error);
      console.error('Error message:', error instanceof Error ? error.message : 'Unknown error');
      
      // Return fallback response
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
    const helpfulResponses: Record<string, string> = {
      en: "I'm currently having trouble connecting to my AI service, but I can still help you with basic financial advice! Here are some key tips:\n\n💰 **Budgeting**: Track your income and expenses, aim to save 20% of your income\n💡 **Emergency Fund**: Save 3-6 months of expenses for emergencies\n📈 **Investing**: Start with low-risk options like mutual funds or ETFs\n🛡️ **Scam Protection**: Never share OTP, PIN, or personal details with anyone\n\nFeel free to ask me about any of these topics!",
      
      hi: "मुझे अभी AI सेवा से कनेक्ट करने में परेशानी हो रही है, लेकिन मैं आपकी बुनियादी वित्तीय सलाह में मदद कर सकता हूं! यहां कुछ महत्वपूर्ण सुझाव हैं:\n\n💰 **बजट बनाना**: अपनी आय और खर्चों को ट्रैक करें, अपनी आय का 20% बचाने का लक्ष्य रखें\n💡 **आपातकालीन फंड**: आपातकाल के लिए 3-6 महीने के खर्चों के बराबर बचत करें\n📈 **निवेश**: म्यूचुअल फंड या ETF जैसे कम जोखिम वाले विकल्पों से शुरुआत करें\n🛡️ **घोटाला सुरक्षा**: कभी भी OTP, PIN या व्यक्तिगत विवरण किसी के साथ साझा न करें\n\nइन विषयों के बारे में कुछ भी पूछने के लिए स्वतंत्र महसूस करें!",
      
      es: "Actualmente tengo problemas para conectarme a mi servicio de IA, ¡pero aún puedo ayudarte con consejos financieros básicos! Aquí tienes algunos consejos clave:\n\n💰 **Presupuesto**: Rastrea tus ingresos y gastos, intenta ahorrar el 20% de tus ingresos\n💡 **Fondo de Emergencia**: Ahorra 3-6 meses de gastos para emergencias\n📈 **Inversión**: Comienza con opciones de bajo riesgo como fondos mutuos o ETF\n🛡️ **Protección contra Estafas**: Nunca compartas OTP, PIN o detalles personales con nadie\n\n¡Siéntete libre de preguntarme sobre cualquiera de estos temas!",
      
      fr: "J'ai actuellement des difficultés à me connecter à mon service d'IA, mais je peux toujours vous aider avec des conseils financiers de base ! Voici quelques conseils clés :\n\n💰 **Budget** : Suivez vos revenus et dépenses, visez à épargner 20% de vos revenus\n💡 **Fonds d'Urgence** : Épargnez 3-6 mois de dépenses pour les urgences\n📈 **Investissement** : Commencez par des options à faible risque comme les fonds communs ou ETF\n🛡️ **Protection contre les Arnaques** : Ne partagez jamais OTP, PIN ou détails personnels avec qui que ce soit\n\nN'hésitez pas à me poser des questions sur ces sujets !"
    };

    return helpfulResponses[language] || helpfulResponses.en;
  }

  clearHistory(): void {
    this.chatHistory = [];
  }

  getHistory(): ChatMessage[] {
    return [...this.chatHistory];
  }
}

// Export a singleton instance
export const langChainChatService = new LangChainChatService();
