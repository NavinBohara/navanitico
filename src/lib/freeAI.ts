// Free AI service using Hugging Face Inference API (no API key required for basic usage)
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

export class FreeAIService {
  private chatHistory: ChatMessage[] = [];

  async sendMessage(
    message: string, 
    language: string = 'en',
    context: string = 'financial education'
  ): Promise<string> {
    try {
      console.log('Sending message via OpenRouter AI:', message);
      console.log('Language:', language);
      
      // Add user message to history
      this.chatHistory.push({
        role: 'user',
        content: message,
        timestamp: new Date(),
        language
      });

      // Try OpenRouter API first
      const response = await this.callOpenRouterAPI(message, language);
      
      console.log('OpenRouter AI response received:', response.substring(0, 100) + '...');

      // Add assistant response to history
      this.chatHistory.push({
        role: 'assistant',
        content: response,
        timestamp: new Date(),
        language
      });

      return response;
    } catch (error) {
      console.error('OpenRouter AI Error details:', error);
      console.error('Error message:', error instanceof Error ? error.message : 'Unknown error');
      
      // Return intelligent fallback response
      return this.getIntelligentResponse(message, language);
    }
  }

  private async callOpenRouterAPI(message: string, language: string): Promise<string> {
    try {
      const apiKey = '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';
      
      console.log('🔑 Using OpenRouter API with key:', apiKey.substring(0, 20) + '...');
      
      // Create conversation history for context
      const messages = [
        {
          role: 'system',
          content: `You are NavaNiti AI, a friendly and professional financial advisor. You help people with:
- Budgeting and money management
- Investment strategies and options
- Scam awareness and protection
- Saving and emergency planning
- Loans and debt management
- Tax planning and optimization
- Insurance and retirement planning
- Real estate and business finance
- Cryptocurrency and modern investments

Be conversational, empathetic, and provide practical, actionable advice. Use emojis to make responses engaging. Support both English and Hindi languages. Always prioritize user safety and financial security.`
        },
        ...this.chatHistory.slice(-6), // Include last 6 messages for context
        {
          role: 'user',
          content: message
        }
      ];

      console.log('📤 Sending request to OpenRouter...');
      console.log('📝 Messages:', messages.length, 'messages');

      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'http://localhost:5173',
          'X-Title': 'NavaNiti Financial Advisor'
        },
        body: JSON.stringify({
          model: 'openai/gpt-3.5-turbo', // More reliable model
          messages: messages,
          temperature: 0.7,
          max_tokens: 1000,
          stream: false
        })
      });

      console.log('📥 OpenRouter response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ OpenRouter API error:', response.status, errorText);
        throw new Error(`OpenRouter API error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      console.log('✅ OpenRouter API response received:', data);
      
      const aiResponse = data.choices?.[0]?.message?.content;
      
      if (!aiResponse) {
        console.error('❌ No content in OpenRouter response:', data);
        throw new Error('No response content from OpenRouter API');
      }

      console.log('🎉 OpenRouter AI response:', aiResponse.substring(0, 100) + '...');
      return aiResponse;
    } catch (error) {
      console.error('❌ OpenRouter API error:', error);
      console.log('🔄 Falling back to intelligent response system...');
      return this.getIntelligentResponse(message, language);
    }
  }

  private getIntelligentResponse(message: string, language: string): string {
    const lowerMessage = message.toLowerCase();
    
    // Check for greetings and casual conversation first
    if (this.isGreeting(message)) {
      return this.getGreetingResponse(language);
    }
    
    if (this.isQuestion(message)) {
      return this.getQuestionResponse(message, language);
    }
    
    if (this.isComplaint(message)) {
      return this.getComplaintResponse(language);
    }
    
    if (this.isRequest(message)) {
      return this.getRequestResponse(message, language);
    }
    
    // Comprehensive financial topic detection
    const detectedTopic = this.detectFinancialTopic(message);
    if (detectedTopic) {
      return this.getComprehensiveFinancialResponse(detectedTopic, language, message);
    }
    
    // Check for general financial topics
    if (this.isFinancialTopic(message)) {
      return this.getGeneralFinancialResponse(language, message);
    }
    
    // Default humanized response
    return this.getHumanizedDefaultResponse(language, message);
  }

  private detectFinancialTopic(message: string): string | null {
    const lowerMessage = message.toLowerCase();
    
    // Comprehensive financial topic detection
    const topics = {
      'budgeting': ['budget', 'बजट', 'expense', 'खर्च', 'income', 'आय', 'money management', 'पैसा', 'spending', 'खर्चा', 'expenses', 'cost', 'price', 'expensive', 'cheap', 'monthly', 'daily', 'weekly'],
      'investing': ['invest', 'निवेश', 'investment', 'mutual fund', 'स्टॉक', 'stock', 'sip', 'fd', 'rd', 'shares', 'शेयर', 'equity', 'portfolio', 'returns', 'profit', 'loss', 'nifty', 'sensex', 'ipo', 'dividend'],
      'scam_awareness': ['scam', 'घोटाला', 'fraud', 'धोखा', 'fake', 'नकली', 'cheat', 'बेवकूफ', 'trick', 'चाल', 'fraudulent', 'suspicious', 'doubtful', 'phishing', 'identity theft', 'ponzi', 'pyramid', 'get rich quick'],
      'saving': ['save', 'बचत', 'saving', 'money', 'पैसा', 'wealth', 'संपत्ति', 'rich', 'अमीर', 'financial freedom', 'accumulate', 'build', 'grow', 'piggy bank', 'emergency fund'],
      'emergency_planning': ['emergency', 'आपातकाल', 'urgent', 'जरूरी', 'crisis', 'संकट', 'unexpected', 'अप्रत्याशित', 'sudden', 'immediate', 'rainy day', 'backup'],
      'loans': ['loan', 'कर्ज', 'debt', 'उधार', 'credit', 'क्रेडिट', 'emi', 'interest', 'ब्याज', 'borrow', 'lending', 'repayment', 'personal loan', 'home loan', 'car loan'],
      'tax_planning': ['tax', 'टैक्स', 'income tax', 'आयकर', 'gst', 'tds', 'deduction', 'कटौती', 'taxation', 'filing', 'returns', 'itr', 'form 16', 'tds certificate'],
      'insurance': ['insurance', 'बीमा', 'life insurance', 'जीवन बीमा', 'health insurance', 'स्वास्थ्य बीमा', 'coverage', 'premium', 'claim', 'term insurance', 'medical insurance'],
      'retirement': ['retirement', 'सेवानिवृत्ति', 'pension', 'पेंशन', 'old age', 'बुढ़ापा', 'nps', 'epf', 'senior', 'elderly', 'superannuation', 'provident fund'],
      'credit_score': ['credit score', 'cibil', 'credit report', 'credit history', 'credit rating', 'fico', 'credit bureau', 'credit card', 'credit limit'],
      'real_estate': ['property', 'real estate', 'house', 'home', 'apartment', 'land', 'property investment', 'rent', 'lease', 'mortgage', 'home loan'],
      'cryptocurrency': ['crypto', 'bitcoin', 'ethereum', 'blockchain', 'digital currency', 'cryptocurrency', 'trading', 'mining', 'wallet', 'exchange'],
      'business_finance': ['business', 'startup', 'entrepreneur', 'company', 'corporate', 'business loan', 'working capital', 'cash flow', 'revenue', 'profit margin'],
      'education_finance': ['education loan', 'student loan', 'tuition', 'college', 'university', 'scholarship', 'education fund', 'child education'],
      'healthcare_finance': ['medical expenses', 'healthcare', 'hospital', 'medical insurance', 'health fund', 'medical emergency', 'treatment cost'],
      'travel_finance': ['travel', 'vacation', 'trip', 'tourism', 'travel insurance', 'travel fund', 'holiday', 'travel budget'],
      'wedding_finance': ['wedding', 'marriage', 'wedding expenses', 'marriage loan', 'wedding budget', 'ceremony', 'reception'],
      'car_finance': ['car', 'vehicle', 'automobile', 'car loan', 'auto loan', 'vehicle insurance', 'car maintenance', 'fuel cost'],
      'gold_investment': ['gold', 'सोना', 'gold investment', 'gold etf', 'gold mutual fund', 'gold bonds', 'jewellery', 'ornaments'],
      'commodities': ['commodities', 'silver', 'crude oil', 'agricultural', 'metals', 'energy', 'raw materials', 'futures'],
      'forex': ['forex', 'currency', 'exchange rate', 'dollar', 'rupee', 'foreign exchange', 'currency trading', 'forex trading'],
      'derivatives': ['derivatives', 'options', 'futures', 'swaps', 'hedging', 'derivative trading', 'options trading'],
      'banking': ['bank', 'banking', 'account', 'savings account', 'current account', 'banking services', 'atm', 'net banking'],
      'fintech': ['fintech', 'digital banking', 'mobile banking', 'upi', 'paytm', 'phonepe', 'google pay', 'digital payment'],
      'financial_planning': ['financial planning', 'wealth management', 'financial advisor', 'financial goals', 'financial security', 'financial independence'],
      'debt_management': ['debt management', 'debt consolidation', 'debt free', 'debt reduction', 'debt trap', 'debt counseling'],
      'estate_planning': ['estate planning', 'will', 'inheritance', 'succession planning', 'estate tax', 'legacy planning'],
      'charity_finance': ['charity', 'donation', 'ngo', 'social cause', 'philanthropy', 'charitable giving', 'tax deduction'],
      'pension_planning': ['pension', 'pension fund', 'retirement benefits', 'pension scheme', 'pension plan', 'annuity'],
      'child_finance': ['child', 'children', 'kids', 'child education', 'child insurance', 'child fund', 'sukanya samriddhi'],
      'senior_citizen': ['senior citizen', 'elderly', 'old age', 'senior benefits', 'pension', 'senior citizen savings'],
      'women_finance': ['women', 'female', 'women finance', 'women investment', 'women empowerment', 'financial independence'],
      'rural_finance': ['rural', 'village', 'agriculture', 'farmer', 'rural banking', 'microfinance', 'self help group'],
      'government_schemes': ['government scheme', 'pradhan mantri', 'scheme', 'subsidy', 'government benefit', 'welfare scheme']
    };
    
    // Check each topic
    for (const [topic, keywords] of Object.entries(topics)) {
      if (keywords.some(keyword => lowerMessage.includes(keyword))) {
        return topic;
      }
    }
    
    return null;
  }

  private isGreeting(message: string): boolean {
    const greetings = ['hello', 'hi', 'hey', 'good morning', 'good afternoon', 'good evening', 'namaste', 'नमस्ते', 'howdy', 'whats up', 'sup'];
    return greetings.some(greeting => message.toLowerCase().includes(greeting));
  }

  private isQuestion(message: string): boolean {
    return message.includes('?') || 
           message.toLowerCase().includes('how') || 
           message.toLowerCase().includes('what') || 
           message.toLowerCase().includes('why') || 
           message.toLowerCase().includes('when') || 
           message.toLowerCase().includes('where') ||
           message.toLowerCase().includes('कैसे') ||
           message.toLowerCase().includes('क्या') ||
           message.toLowerCase().includes('क्यों') ||
           message.toLowerCase().includes('कब') ||
           message.toLowerCase().includes('कहाँ');
  }

  private isComplaint(message: string): boolean {
    const complaintWords = ['problem', 'issue', 'trouble', 'difficulty', 'stuck', 'confused', 'worried', 'stressed', 'समस्या', 'परेशानी', 'चिंता', 'तनाव'];
    return complaintWords.some(word => message.toLowerCase().includes(word));
  }

  private isRequest(message: string): boolean {
    const requestWords = ['help', 'please', 'can you', 'could you', 'would you', 'मदद', 'कृपया', 'क्या आप', 'सहायता'];
    return requestWords.some(word => message.toLowerCase().includes(word));
  }

  private isFinancialTopic(message: string): boolean {
    const financialWords = ['money', 'finance', 'financial', 'economy', 'bank', 'account', 'payment', 'cash', 'rupee', 'dollar', 'पैसा', 'वित्त', 'बैंक', 'खाता', 'भुगतान', 'नकद'];
    return financialWords.some(word => message.toLowerCase().includes(word));
  }

  private getBudgetAdvice(language: string): string {
    const advice: Record<string, string> = {
      en: "💰 **Budgeting Tips:**\n\n1. **50/30/20 Rule**: 50% needs, 30% wants, 20% savings\n2. **Track Expenses**: Use apps like Mint or Excel\n3. **Set Goals**: Short-term (vacation) and long-term (retirement)\n4. **Review Monthly**: Adjust your budget based on spending\n5. **Emergency First**: Build emergency fund before investing\n\nStart with tracking your current expenses for one month!",
      
      hi: "💰 **बजट बनाने के टिप्स:**\n\n1. **50/30/20 नियम**: 50% जरूरतें, 30% इच्छाएं, 20% बचत\n2. **खर्चों को ट्रैक करें**: Mint या Excel जैसे ऐप्स का उपयोग करें\n3. **लक्ष्य निर्धारित करें**: अल्पकालिक (छुट्टी) और दीर्घकालिक (सेवानिवृत्ति)\n4. **मासिक समीक्षा**: खर्च के आधार पर बजट समायोजित करें\n5. **आपातकाल पहले**: निवेश से पहले आपातकालीन फंड बनाएं\n\nएक महीने तक अपने वर्तमान खर्चों को ट्रैक करके शुरुआत करें!"
    };
    
    return advice[language] || advice.en;
  }

  private getInvestmentAdvice(language: string): string {
    const advice: Record<string, string> = {
      en: "📈 **Investment Guidance:**\n\n1. **Start Small**: Begin with ₹500-1000 monthly\n2. **Diversify**: Mix of stocks, mutual funds, and bonds\n3. **Long-term Focus**: Think 5-10 years minimum\n4. **Low-cost Options**: Index funds and ETFs\n5. **Risk Assessment**: Only invest what you can afford to lose\n\nConsider SIP in mutual funds for beginners!",
      
      hi: "📈 **निवेश मार्गदर्शन:**\n\n1. **छोटी शुरुआत**: मासिक ₹500-1000 से शुरू करें\n2. **विविधीकरण**: स्टॉक, म्यूचुअल फंड और बॉन्ड का मिश्रण\n3. **दीर्घकालिक फोकस**: कम से कम 5-10 साल सोचें\n4. **कम लागत विकल्प**: इंडेक्स फंड और ETF\n5. **जोखिम मूल्यांकन**: केवल वही निवेश करें जो आप खो सकते हैं\n\nशुरुआती लोगों के लिए म्यूचुअल फंड में SIP पर विचार करें!"
    };
    
    return advice[language] || advice.en;
  }

  private getScamAdvice(language: string): string {
    const advice: Record<string, string> = {
      en: "🛡️ **Scam Protection:**\n\n1. **Never Share**: OTP, PIN, passwords with anyone\n2. **Verify Sources**: Check official websites and numbers\n3. **Too Good to be True**: High returns = high risk\n4. **Bank Calls**: Banks never ask for OTP over phone\n5. **Report**: Contact cybercrime.gov.in if scammed\n\nRemember: Legitimate services never ask for sensitive info!",
      
      hi: "🛡️ **घोटाला सुरक्षा:**\n\n1. **कभी साझा न करें**: OTP, PIN, पासवर्ड किसी के साथ\n2. **स्रोत सत्यापित करें**: आधिकारिक वेबसाइट और नंबर जांचें\n3. **बहुत अच्छा सच नहीं**: उच्च रिटर्न = उच्च जोखिम\n4. **बैंक कॉल**: बैंक कभी फोन पर OTP नहीं मांगते\n5. **रिपोर्ट करें**: धोखाधड़ी होने पर cybercrime.gov.in से संपर्क करें\n\nयाद रखें: वैध सेवाएं कभी संवेदनशील जानकारी नहीं मांगतीं!"
    };
    
    return advice[language] || advice.en;
  }

  private getSavingAdvice(language: string): string {
    const advice: Record<string, string> = {
      en: "💡 **Smart Saving Tips:**\n\n1. **Pay Yourself First**: Save before spending\n2. **Automate**: Set up auto-transfers to savings\n3. **High-yield Accounts**: Use FD, RD for better returns\n4. **Cut Unnecessary**: Cancel unused subscriptions\n5. **Track Progress**: Monitor your savings growth\n\nStart with 10% of your income and increase gradually!",
      
      hi: "💡 **स्मार्ट बचत टिप्स:**\n\n1. **पहले अपने लिए भुगतान**: खर्च से पहले बचत करें\n2. **स्वचालित**: बचत के लिए ऑटो-ट्रांसफर सेट करें\n3. **उच्च उपज खाते**: बेहतर रिटर्न के लिए FD, RD का उपयोग करें\n4. **अनावश्यक कटौती**: अनुपयोगी सब्सक्रिप्शन रद्द करें\n5. **प्रगति ट्रैक**: अपनी बचत वृद्धि की निगरानी करें\n\nअपनी आय का 10% से शुरू करें और धीरे-धीरे बढ़ाएं!"
    };
    
    return advice[language] || advice.en;
  }

  private getEmergencyFundAdvice(language: string): string {
    const advice: Record<string, string> = {
      en: "🚨 **Emergency Fund Essentials:**\n\n1. **3-6 Months**: Save 3-6 months of expenses\n2. **Liquid Access**: Keep in savings account or FD\n3. **Separate Account**: Don't mix with regular savings\n4. **Start Small**: Begin with ₹10,000-50,000\n5. **Build Gradually**: Add monthly until target reached\n\nThis fund protects you from financial emergencies!",
      
      hi: "🚨 **आपातकालीन फंड आवश्यकताएं:**\n\n1. **3-6 महीने**: 3-6 महीने के खर्चों की बचत करें\n2. **तरल पहुंच**: बचत खाते या FD में रखें\n3. **अलग खाता**: नियमित बचत के साथ मिलाएं नहीं\n4. **छोटी शुरुआत**: ₹10,000-50,000 से शुरू करें\n5. **धीरे-धीरे बनाएं**: लक्ष्य तक पहुंचने तक मासिक जोड़ें\n\nयह फंड आपको वित्तीय आपात स्थितियों से बचाता है!"
    };
    
    return advice[language] || advice.en;
  }

  private getAdvancedBudgetAdvice(language: string, message: string): string {
    const advice: Record<string, string> = {
      en: "💰 **Advanced Budgeting Strategy:**\n\n📊 **Step 1: Calculate Your Numbers**\n• Monthly Income: ₹_______\n• Fixed Expenses (rent, EMI): ₹_______\n• Variable Expenses (food, transport): ₹_______\n• Savings Target: ₹_______\n\n🎯 **Step 2: 50/30/20 Rule**\n• 50% Needs (rent, food, utilities)\n• 30% Wants (entertainment, shopping)\n• 20% Savings & Investments\n\n📱 **Step 3: Use Technology**\n• Apps: Moneycontrol, ET Money, Zerodha Coin\n• Excel: Create your own tracker\n• Bank Apps: Set up auto-transfers\n\n💡 **Pro Tips:**\n• Review budget weekly\n• Use envelope method for cash\n• Set up separate accounts for goals\n• Track every expense for 30 days first",
      
      hi: "💰 **उन्नत बजट रणनीति:**\n\n📊 **चरण 1: अपनी संख्याओं की गणना करें**\n• मासिक आय: ₹_______\n• निश्चित खर्च (किराया, EMI): ₹_______\n• परिवर्तनीय खर्च (भोजन, परिवहन): ₹_______\n• बचत लक्ष्य: ₹_______\n\n🎯 **चरण 2: 50/30/20 नियम**\n• 50% जरूरतें (किराया, भोजन, बिजली)\n• 30% इच्छाएं (मनोरंजन, खरीदारी)\n• 20% बचत और निवेश\n\n📱 **चरण 3: तकनीक का उपयोग करें**\n• ऐप्स: Moneycontrol, ET Money, Zerodha Coin\n• Excel: अपना ट्रैकर बनाएं\n• बैंक ऐप्स: ऑटो-ट्रांसफर सेट करें\n\n💡 **प्रो टिप्स:**\n• साप्ताहिक बजट समीक्षा\n• नकद के लिए लिफाफा विधि\n• लक्ष्यों के लिए अलग खाते\n• पहले 30 दिन हर खर्च ट्रैक करें"
    };
    
    return advice[language] || advice.en;
  }

  private getAdvancedInvestmentAdvice(language: string, message: string): string {
    const advice: Record<string, string> = {
      en: "📈 **Smart Investment Strategy:**\n\n🎯 **Beginner Portfolio (₹5,000-10,000/month):**\n• 40% Large Cap Mutual Funds\n• 30% Mid Cap Funds\n• 20% Small Cap Funds\n• 10% Debt Funds\n\n💰 **Investment Options:**\n• **SIP**: Start with ₹500/month\n• **ELSS**: Tax saving + growth\n• **NPS**: Retirement planning\n• **PPF**: Safe long-term\n• **Gold**: 5-10% of portfolio\n\n📊 **Risk Assessment:**\n• Conservative: 70% Debt, 30% Equity\n• Moderate: 50% Debt, 50% Equity\n• Aggressive: 30% Debt, 70% Equity\n\n💡 **Pro Tips:**\n• Start early, invest regularly\n• Don't time the market\n• Diversify across sectors\n• Review quarterly, not daily",
      
      hi: "📈 **स्मार्ट निवेश रणनीति:**\n\n🎯 **शुरुआती पोर्टफोलियो (₹5,000-10,000/माह):**\n• 40% लार्ज कैप म्यूचुअल फंड\n• 30% मिड कैप फंड\n• 20% स्मॉल कैप फंड\n• 10% डेट फंड\n\n💰 **निवेश विकल्प:**\n• **SIP**: ₹500/माह से शुरू करें\n• **ELSS**: टैक्स सेविंग + ग्रोथ\n• **NPS**: रिटायरमेंट प्लानिंग\n• **PPF**: सुरक्षित दीर्घकालिक\n• **सोना**: पोर्टफोलियो का 5-10%\n\n📊 **जोखिम मूल्यांकन:**\n• रूढ़िवादी: 70% डेट, 30% इक्विटी\n• मध्यम: 50% डेट, 50% इक्विटी\n• आक्रामक: 30% डेट, 70% इक्विटी\n\n💡 **प्रो टिप्स:**\n• जल्दी शुरू करें, नियमित निवेश\n• बाजार का समय न करें\n• सेक्टर में विविधीकरण\n• त्रैमासिक समीक्षा, दैनिक नहीं"
    };
    
    return advice[language] || advice.en;
  }

  private getAdvancedScamAdvice(language: string, message: string): string {
    const advice: Record<string, string> = {
      en: "🛡️ **Advanced Scam Protection:**\n\n🚨 **Red Flags to Watch:**\n• Guaranteed high returns (15%+ monthly)\n• Pressure to invest immediately\n• Requests for OTP, PIN, passwords\n• Unregistered investment schemes\n• Fake bank calls asking for details\n\n🔍 **How to Verify:**\n• Check SEBI registration\n• Verify company on MCA website\n• Never share OTP with anyone\n• Banks never call for OTP\n• Use official apps only\n\n📱 **Protection Steps:**\n• Enable 2FA on all accounts\n• Use strong, unique passwords\n• Check SMS sender ID carefully\n• Verify URLs before clicking\n• Report suspicious activities\n\n🚨 **Emergency Actions:**\n• Block card immediately if compromised\n• Change all passwords\n• Report to cybercrime.gov.in\n• Contact bank fraud helpline",
      
      hi: "🛡️ **उन्नत घोटाला सुरक्षा:**\n\n🚨 **देखने योग्य लाल झंडे:**\n• गारंटीकृत उच्च रिटर्न (15%+ मासिक)\n• तुरंत निवेश का दबाव\n• OTP, PIN, पासवर्ड की मांग\n• अंकीय निवेश योजनाएं\n• विवरण मांगने वाली नकली बैंक कॉल\n\n🔍 **कैसे सत्यापित करें:**\n• SEBI पंजीकरण जांचें\n• MCA वेबसाइट पर कंपनी सत्यापित करें\n• कभी OTP किसी के साथ साझा न करें\n• बैंक कभी OTP के लिए कॉल नहीं करते\n• केवल आधिकारिक ऐप्स का उपयोग करें\n\n📱 **सुरक्षा कदम:**\n• सभी खातों पर 2FA सक्षम करें\n• मजबूत, अद्वितीय पासवर्ड का उपयोग करें\n• SMS प्रेषक ID सावधानी से जांचें\n• क्लिक करने से पहले URL सत्यापित करें\n• संदिग्ध गतिविधियों की रिपोर्ट करें\n\n🚨 **आपातकालीन कार्य:**\n• समझौता होने पर तुरंत कार्ड ब्लॉक करें\n• सभी पासवर्ड बदलें\n• cybercrime.gov.in पर रिपोर्ट करें\n• बैंक धोखाधड़ी हेल्पलाइन से संपर्क करें"
    };
    
    return advice[language] || advice.en;
  }

  private getAdvancedSavingAdvice(language: string, message: string): string {
    const advice: Record<string, string> = {
      en: "💡 **Advanced Saving Strategies:**\n\n🎯 **Saving Goals Framework:**\n• Emergency Fund: 6 months expenses\n• Short-term (1-2 years): Vacation, gadgets\n• Medium-term (3-5 years): Car, house down payment\n• Long-term (5+ years): Retirement, child education\n\n💰 **High-Yield Saving Options:**\n• **FD**: 6-7% p.a. (safe)\n• **RD**: 6-7% p.a. (regular saving)\n• **PPF**: 7.1% p.a. (tax-free)\n• **NSC**: 6.8% p.a. (5-year lock)\n• **Sukanya Samriddhi**: 8% p.a. (girl child)\n\n📊 **Saving Calculation:**\n• Monthly Income: ₹50,000\n• 20% Savings: ₹10,000\n• Emergency Fund Target: ₹3,00,000\n• Time to reach: 30 months\n\n💡 **Pro Tips:**\n• Automate transfers on payday\n• Use separate accounts for goals\n• Increase savings with salary hikes\n• Track progress monthly",
      
      hi: "💡 **उन्नत बचत रणनीतियां:**\n\n🎯 **बचत लक्ष्य ढांचा:**\n• आपातकालीन फंड: 6 महीने के खर्च\n• अल्पकालिक (1-2 साल): छुट्टी, गैजेट्स\n• मध्यम अवधि (3-5 साल): कार, घर का डाउन पेमेंट\n• दीर्घकालिक (5+ साल): सेवानिवृत्ति, बच्चे की शिक्षा\n\n💰 **उच्च उपज बचत विकल्प:**\n• **FD**: 6-7% प्रति वर्ष (सुरक्षित)\n• **RD**: 6-7% प्रति वर्ष (नियमित बचत)\n• **PPF**: 7.1% प्रति वर्ष (कर मुक्त)\n• **NSC**: 6.8% प्रति वर्ष (5 साल लॉक)\n• **सुकन्या समृद्धि**: 8% प्रति वर्ष (बेटी के लिए)\n\n📊 **बचत गणना:**\n• मासिक आय: ₹50,000\n• 20% बचत: ₹10,000\n• आपातकालीन फंड लक्ष्य: ₹3,00,000\n• पहुंचने का समय: 30 महीने\n\n💡 **प्रो टिप्स:**\n• वेतन दिवस पर ऑटो-ट्रांसफर\n• लक्ष्यों के लिए अलग खाते\n• वेतन वृद्धि के साथ बचत बढ़ाएं\n• मासिक प्रगति ट्रैक करें"
    };
    
    return advice[language] || advice.en;
  }

  private getAdvancedEmergencyAdvice(language: string, message: string): string {
    const advice: Record<string, string> = {
      en: "🚨 **Emergency Fund Master Plan:**\n\n💰 **How Much to Save:**\n• Minimum: 3 months expenses\n• Recommended: 6 months expenses\n• Maximum: 12 months expenses\n\n📊 **Calculation Example:**\n• Monthly Expenses: ₹30,000\n• Emergency Fund Target: ₹1,80,000\n• Monthly Saving: ₹15,000\n• Time to Build: 12 months\n\n🏦 **Where to Keep:**\n• **Savings Account**: 3-4% p.a. (immediate access)\n• **FD**: 6-7% p.a. (1-3 months notice)\n• **Liquid Funds**: 5-6% p.a. (next day access)\n• **High-yield Savings**: 4-5% p.a. (instant access)\n\n💡 **Building Strategy:**\n• Start with ₹5,000-10,000\n• Increase by 10% every 3 months\n• Use windfalls (bonus, tax refund)\n• Never invest emergency fund\n• Keep separate from other savings",
      
      hi: "🚨 **आपातकालीन फंड मास्टर प्लान:**\n\n💰 **कितना बचाना है:**\n• न्यूनतम: 3 महीने के खर्च\n• अनुशंसित: 6 महीने के खर्च\n• अधिकतम: 12 महीने के खर्च\n\n📊 **गणना उदाहरण:**\n• मासिक खर्च: ₹30,000\n• आपातकालीन फंड लक्ष्य: ₹1,80,000\n• मासिक बचत: ₹15,000\n• बनाने का समय: 12 महीने\n\n🏦 **कहां रखें:**\n• **बचत खाता**: 3-4% प्रति वर्ष (तत्काल पहुंच)\n• **FD**: 6-7% प्रति वर्ष (1-3 महीने नोटिस)\n• **लिक्विड फंड**: 5-6% प्रति वर्ष (अगले दिन पहुंच)\n• **उच्च उपज बचत**: 4-5% प्रति वर्ष (तत्काल पहुंच)\n\n💡 **निर्माण रणनीति:**\n• ₹5,000-10,000 से शुरू करें\n• हर 3 महीने में 10% बढ़ाएं\n• अप्रत्याशित आय का उपयोग करें\n• आपातकालीन फंड कभी निवेश न करें\n• अन्य बचत से अलग रखें"
    };
    
    return advice[language] || advice.en;
  }

  private getLoanAdvice(language: string, message: string): string {
    const advice: Record<string, string> = {
      en: "🏦 **Smart Loan Management:**\n\n📊 **Loan Types & Interest Rates:**\n• Personal Loan: 10-24% p.a.\n• Home Loan: 8-12% p.a.\n• Car Loan: 8-15% p.a.\n• Education Loan: 8-14% p.a.\n• Credit Card: 24-48% p.a.\n\n💡 **Loan Optimization Tips:**\n• Compare rates from multiple banks\n• Negotiate for lower interest rates\n• Consider prepayment to save interest\n• Maintain good credit score (750+)\n• Avoid multiple loan applications\n\n🚨 **Debt Management:**\n• Pay high-interest loans first\n• Use debt consolidation if needed\n• Never take loan for investment\n• Keep EMI under 40% of income\n• Build emergency fund before taking loans",
      
      hi: "🏦 **स्मार्ट लोन प्रबंधन:**\n\n📊 **लोन प्रकार और ब्याज दरें:**\n• व्यक्तिगत ऋण: 10-24% प्रति वर्ष\n• गृह ऋण: 8-12% प्रति वर्ष\n• कार ऋण: 8-15% प्रति वर्ष\n• शिक्षा ऋण: 8-14% प्रति वर्ष\n• क्रेडिट कार्ड: 24-48% प्रति वर्ष\n\n💡 **लोन अनुकूलन टिप्स:**\n• कई बैंकों से दरें तुलना करें\n• कम ब्याज दर के लिए बातचीत करें\n• ब्याज बचाने के लिए प्रीपेमेंट पर विचार करें\n• अच्छा क्रेडिट स्कोर बनाए रखें (750+)\n• कई लोन आवेदन से बचें\n\n🚨 **ऋण प्रबंधन:**\n• पहले उच्च ब्याज वाले ऋण चुकाएं\n• आवश्यकता हो तो ऋण समेकन का उपयोग करें\n• निवेश के लिए कभी ऋण न लें\n• EMI आय के 40% से कम रखें\n• ऋण लेने से पहले आपातकालीन फंड बनाएं"
    };
    
    return advice[language] || advice.en;
  }

  private getTaxAdvice(language: string, message: string): string {
    const advice: Record<string, string> = {
      en: "📋 **Tax Saving & Planning:**\n\n💰 **Section 80C Deductions (₹1.5L):**\n• EPF: Up to ₹1.5L (employer + employee)\n• PPF: Up to ₹1.5L (15-year lock)\n• ELSS: Up to ₹1.5L (3-year lock)\n• NSC: Up to ₹1.5L (5-year lock)\n• Life Insurance Premium: Up to ₹1.5L\n\n🏠 **Other Deductions:**\n• HRA: House rent allowance\n• LTA: Leave travel allowance\n• Medical Insurance: ₹25,000 (₹50,000 for parents)\n• Home Loan Interest: ₹2L (self-occupied)\n• Education Loan Interest: No limit\n\n💡 **Tax Planning Tips:**\n• Start investing early in financial year\n• Use all available deductions\n• Keep proper documentation\n• File returns before due date\n• Consider tax-saving investments",
      
      hi: "📋 **कर बचत और योजना:**\n\n💰 **धारा 80C कटौती (₹1.5L):**\n• EPF: ₹1.5L तक (नियोक्ता + कर्मचारी)\n• PPF: ₹1.5L तक (15 साल लॉक)\n• ELSS: ₹1.5L तक (3 साल लॉक)\n• NSC: ₹1.5L तक (5 साल लॉक)\n• जीवन बीमा प्रीमियम: ₹1.5L तक\n\n🏠 **अन्य कटौती:**\n• HRA: मकान किराया भत्ता\n• LTA: अवकाश यात्रा भत्ता\n• चिकित्सा बीमा: ₹25,000 (माता-पिता के लिए ₹50,000)\n• गृह ऋण ब्याज: ₹2L (स्व-आवासी)\n• शिक्षा ऋण ब्याज: कोई सीमा नहीं\n\n💡 **कर योजना टिप्स:**\n• वित्तीय वर्ष की शुरुआत में निवेश शुरू करें\n• सभी उपलब्ध कटौती का उपयोग करें\n• उचित दस्तावेज रखें\n• नियत तारीख से पहले रिटर्न दाखिल करें\n• कर बचत निवेश पर विचार करें"
    };
    
    return advice[language] || advice.en;
  }

  private getInsuranceAdvice(language: string, message: string): string {
    const advice: Record<string, string> = {
      en: "🛡️ **Comprehensive Insurance Planning:**\n\n👨‍👩‍👧‍👦 **Life Insurance:**\n• Term Insurance: 10-15x annual income\n• Premium: ₹500-2000/month for ₹1Cr cover\n• Age 25-35: Best time to buy\n• Compare online: PolicyBazaar, Coverfox\n\n🏥 **Health Insurance:**\n• Individual: ₹5-10L coverage\n• Family Floater: ₹10-20L coverage\n• Senior Citizens: ₹10-15L coverage\n• Premium: ₹5000-15000/year\n\n🚗 **Other Insurance:**\n• Motor Insurance: Mandatory for vehicles\n• Home Insurance: Protect your property\n• Travel Insurance: For trips abroad\n• Critical Illness: ₹5-10L coverage\n\n💡 **Insurance Tips:**\n• Buy early for lower premiums\n• Compare multiple providers\n• Read policy terms carefully\n• Review coverage annually\n• Don't over-insure or under-insure",
      
      hi: "🛡️ **व्यापक बीमा योजना:**\n\n👨‍👩‍👧‍👦 **जीवन बीमा:**\n• टर्म बीमा: वार्षिक आय का 10-15 गुना\n• प्रीमियम: ₹1Cr कवर के लिए ₹500-2000/माह\n• आयु 25-35: खरीदने का सबसे अच्छा समय\n• ऑनलाइन तुलना: PolicyBazaar, Coverfox\n\n🏥 **स्वास्थ्य बीमा:**\n• व्यक्तिगत: ₹5-10L कवरेज\n• परिवार फ्लोटर: ₹10-20L कवरेज\n• वरिष्ठ नागरिक: ₹10-15L कवरेज\n• प्रीमियम: ₹5000-15000/वर्ष\n\n🚗 **अन्य बीमा:**\n• मोटर बीमा: वाहनों के लिए अनिवार्य\n• गृह बीमा: अपनी संपत्ति की सुरक्षा\n• यात्रा बीमा: विदेश यात्रा के लिए\n• गंभीर बीमारी: ₹5-10L कवरेज\n\n💡 **बीमा टिप्स:**\n• कम प्रीमियम के लिए जल्दी खरीदें\n• कई प्रदाताओं की तुलना करें\n• पॉलिसी शर्तों को ध्यान से पढ़ें\n• वार्षिक कवरेज समीक्षा करें\n• अधिक या कम बीमा न करें"
    };
    
    return advice[language] || advice.en;
  }

  private getRetirementAdvice(language: string, message: string): string {
    const advice: Record<string, string> = {
      en: "👴 **Retirement Planning Strategy:**\n\n💰 **Retirement Corpus Calculation:**\n• Current Age: 30, Retirement Age: 60\n• Monthly Expenses: ₹50,000\n• Inflation: 6% p.a.\n• Required Corpus: ₹5-8 Crores\n• Monthly SIP Needed: ₹15,000-25,000\n\n📊 **Retirement Investment Options:**\n• **NPS**: 10% of salary (tax benefit)\n• **EPF**: 12% of basic salary\n• **PPF**: ₹1.5L annually\n• **Mutual Funds**: Equity for growth\n• **Annuity Plans**: Guaranteed income\n\n🎯 **Retirement Planning Steps:**\n• Start early (age 25-30)\n• Invest 15-20% of income\n• Increase SIP by 10% annually\n• Diversify across asset classes\n• Review and rebalance yearly\n\n💡 **Pro Tips:**\n• Use retirement calculators\n• Consider inflation in planning\n• Don't withdraw from retirement funds\n• Plan for healthcare costs\n• Consider part-time work post-retirement",
      
      hi: "👴 **सेवानिवृत्ति योजना रणनीति:**\n\n💰 **सेवानिवृत्ति कोष गणना:**\n• वर्तमान आयु: 30, सेवानिवृत्ति आयु: 60\n• मासिक खर्च: ₹50,000\n• मुद्रास्फीति: 6% प्रति वर्ष\n• आवश्यक कोष: ₹5-8 करोड़\n• आवश्यक मासिक SIP: ₹15,000-25,000\n\n📊 **सेवानिवृत्ति निवेश विकल्प:**\n• **NPS**: वेतन का 10% (कर लाभ)\n• **EPF**: मूल वेतन का 12%\n• **PPF**: ₹1.5L वार्षिक\n• **म्यूचुअल फंड**: वृद्धि के लिए इक्विटी\n• **वार्षिकी योजना**: गारंटीकृत आय\n\n🎯 **सेवानिवृत्ति योजना कदम:**\n• जल्दी शुरू करें (आयु 25-30)\n• आय का 15-20% निवेश करें\n• वार्षिक SIP 10% बढ़ाएं\n• परिसंपत्ति वर्गों में विविधीकरण\n• वार्षिक समीक्षा और पुनः संतुलन\n\n💡 **प्रो टिप्स:**\n• सेवानिवृत्ति कैलकुलेटर का उपयोग करें\n• योजना में मुद्रास्फीति पर विचार करें\n• सेवानिवृत्ति फंड से निकासी न करें\n• स्वास्थ्य देखभाल लागत की योजना बनाएं\n• सेवानिवृत्ति के बाद अंशकालिक कार्य पर विचार करें"
    };
    
    return advice[language] || advice.en;
  }

  private getGreetingResponse(language: string): string {
    const greetings = [
      "Hey there! 👋 Great to see you! I'm your friendly financial advisor. What's on your mind today?",
      "Hello! 😊 I'm here to help you with all your financial questions. What would you like to know?",
      "Hi! 🌟 Welcome! I'm excited to help you with your financial journey. What can I assist you with?",
      "Hey! 💫 Nice to meet you! I'm your personal finance buddy. What financial topic interests you today?"
    ];
    
    const hindiGreetings = [
      "नमस्ते! 👋 आपसे मिलकर खुशी हुई! मैं आपका वित्तीय सलाहकार हूं। आज क्या सोच रहे हैं?",
      "हैलो! 😊 मैं यहां आपकी सभी वित्तीय समस्याओं में मदद के लिए हूं। आप क्या जानना चाहते हैं?",
      "नमस्कार! 🌟 स्वागत है! मैं आपकी वित्तीय यात्रा में मदद करने के लिए उत्साहित हूं। मैं आपकी कैसे सहायता कर सकता हूं?",
      "अरे! 💫 आपसे मिलकर अच्छा लगा! मैं आपका व्यक्तिगत वित्त साथी हूं। आज कौन सा वित्तीय विषय आपको रुचिकर लगता है?"
    ];
    
    const responses = language === 'hi' ? hindiGreetings : greetings;
    return responses[Math.floor(Math.random() * responses.length)];
  }

  private getQuestionResponse(message: string, language: string): string {
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('how are you') || lowerMessage.includes('कैसे हैं आप')) {
      return language === 'hi' 
        ? "मैं बहुत अच्छा हूं, धन्यवाद! 😊 आपकी वित्तीय सफलता में मदद करने के लिए तैयार हूं। आप कैसे हैं?"
        : "I'm doing great, thank you! 😊 Ready to help you with your financial success. How are you doing?";
    }
    
    if (lowerMessage.includes('what can you do') || lowerMessage.includes('क्या कर सकते हैं')) {
      return language === 'hi'
        ? "मैं आपकी वित्तीय यात्रा में पूरी तरह से मदद कर सकता हूं! 💰 बजट बनाने से लेकर निवेश तक, बचत से लेकर कर बचत तक - मैं आपके सभी वित्तीय सवालों के जवाब दे सकता हूं। क्या आप किसी विशेष विषय के बारे में जानना चाहते हैं?"
        : "I can help you with your entire financial journey! 💰 From budgeting to investing, saving to tax planning - I can answer all your financial questions. Is there a particular topic you'd like to know about?";
    }
    
    return language === 'hi'
      ? "यह एक बहुत अच्छा सवाल है! 🤔 मैं आपको विस्तृत जवाब दे सकता हूं। क्या आप किसी विशिष्ट वित्तीय विषय के बारे में बात करना चाहते हैं?"
      : "That's a great question! 🤔 I can give you a detailed answer. Would you like to discuss any specific financial topic?";
  }

  private getComplaintResponse(language: string): string {
    const responses = [
      "I understand you're facing some challenges. 😔 Don't worry, I'm here to help! Let's work through this together. What specific financial issue are you dealing with?",
      "I can see you're going through a tough time. 💪 Remember, every financial problem has a solution. Tell me what's bothering you, and I'll help you find the way forward.",
      "It's completely normal to feel overwhelmed with finances. 🤗 I'm here to support you. What's the main concern you'd like to address?",
      "I hear you, and I want to help! 🌟 Financial stress can be really tough. Let's break down your concerns and find practical solutions together."
    ];
    
    const hindiResponses = [
      "मैं समझता हूं कि आप कुछ चुनौतियों का सामना कर रहे हैं। 😔 चिंता न करें, मैं यहां मदद के लिए हूं! आइए इसे मिलकर हल करें। आप किस विशिष्ट वित्तीय समस्या से जूझ रहे हैं?",
      "मैं देख सकता हूं कि आप कठिन समय से गुजर रहे हैं। 💪 याद रखें, हर वित्तीय समस्या का समाधान होता है। बताएं कि क्या परेशान कर रहा है, और मैं आपको आगे का रास्ता दिखाऊंगा।",
      "वित्त के साथ अभिभूत महसूस करना बिल्कुल सामान्य है। 🤗 मैं आपका समर्थन करने के लिए यहां हूं। आप किस मुख्य चिंता को संबोधित करना चाहते हैं?",
      "मैं आपकी बात सुन रहा हूं, और मैं मदद करना चाहता हूं! 🌟 वित्तीय तनाव वास्तव में कठिन हो सकता है। आइए आपकी चिंताओं को तोड़ें और मिलकर व्यावहारिक समाधान खोजें।"
    ];
    
    const responseList = language === 'hi' ? hindiResponses : responses;
    return responseList[Math.floor(Math.random() * responseList.length)];
  }

  private getRequestResponse(message: string, language: string): string {
    const responses = [
      "Of course! I'm here to help you! 😊 What specific financial guidance do you need? I'm ready to assist you with budgeting, investing, saving, or any other financial topic.",
      "Absolutely! I'd be happy to help! 🌟 Whether it's creating a budget, planning investments, or managing debt - I'm here to guide you through it all.",
      "I'm here for you! 💪 Tell me what you need help with, and I'll provide you with clear, actionable advice to improve your financial situation.",
      "Sure thing! 🤗 I love helping people with their finances. What would you like to work on together? I'm excited to help you succeed!"
    ];
    
    const hindiResponses = [
      "बिल्कुल! मैं यहां आपकी मदद के लिए हूं! 😊 आपको किस विशिष्ट वित्तीय मार्गदर्शन की आवश्यकता है? मैं बजटिंग, निवेश, बचत, या किसी अन्य वित्तीय विषय में आपकी सहायता के लिए तैयार हूं।",
      "निश्चित रूप से! मैं खुशी से मदद करूंगा! 🌟 चाहे वह बजट बनाना हो, निवेश की योजना बनाना हो, या ऋण का प्रबंधन करना हो - मैं आपको सब कुछ के माध्यम से मार्गदर्शन करने के लिए यहां हूं।",
      "मैं आपके लिए यहां हूं! 💪 बताएं कि आपको किस चीज में मदद चाहिए, और मैं आपकी वित्तीय स्थिति में सुधार के लिए स्पष्ट, क्रियाशील सलाह प्रदान करूंगा।",
      "ज़रूर! 🤗 मुझे लोगों की वित्त में मदद करना पसंद है। आप मिलकर क्या काम करना चाहते हैं? मैं आपकी सफलता में मदद करने के लिए उत्साहित हूं!"
    ];
    
    const responseList = language === 'hi' ? hindiResponses : responses;
    return responseList[Math.floor(Math.random() * responseList.length)];
  }

  private getGeneralFinancialResponse(language: string, message: string): string {
    const responses = [
      "I can see you're interested in financial topics! 💰 That's fantastic! I'm here to help you navigate the world of personal finance. What specific aspect would you like to explore?",
      "Great! I love talking about money and finance! 💡 Whether you're just starting out or looking to optimize your existing strategy, I'm here to help. What's your main financial goal?",
      "Excellent! Financial literacy is so important! 🌟 I'm excited to help you build a strong financial foundation. What financial topic interests you most?",
      "Wonderful! I'm passionate about helping people achieve financial success! 🚀 Let's discuss your financial journey. What would you like to focus on today?"
    ];
    
    const hindiResponses = [
      "मैं देख सकता हूं कि आप वित्तीय विषयों में रुचि रखते हैं! 💰 यह शानदार है! मैं आपको व्यक्तिगत वित्त की दुनिया में नेविगेट करने में मदद करने के लिए यहां हूं। आप किस विशिष्ट पहलू का अन्वेषण करना चाहते हैं?",
      "बहुत बढ़िया! मुझे पैसे और वित्त के बारे में बात करना पसंद है! 💡 चाहे आप अभी शुरुआत कर रहे हों या अपनी मौजूदा रणनीति को अनुकूलित करना चाहते हों, मैं मदद के लिए यहां हूं। आपका मुख्य वित्तीय लक्ष्य क्या है?",
      "उत्कृष्ट! वित्तीय साक्षरता इतनी महत्वपूर्ण है! 🌟 मैं आपको एक मजबूत वित्तीय नींव बनाने में मदद करने के लिए उत्साहित हूं। आपको कौन सा वित्तीय विषय सबसे अधिक रुचिकर लगता है?",
      "अद्भुत! मैं लोगों को वित्तीय सफलता प्राप्त करने में मदद करने के लिए भावुक हूं! 🚀 आइए आपकी वित्तीय यात्रा पर चर्चा करें। आज आप किस पर ध्यान केंद्रित करना चाहते हैं?"
    ];
    
    const responseList = language === 'hi' ? hindiResponses : responses;
    return responseList[Math.floor(Math.random() * responseList.length)];
  }

  private getHumanizedDefaultResponse(language: string, message: string): string {
    const responses = [
      "That's an interesting point! 🤔 While I specialize in financial topics, I'd be happy to help you with any money-related questions you might have. What financial aspect would you like to explore?",
      "I appreciate you sharing that with me! 😊 As your financial advisor, I'm here to help you with budgeting, investing, saving, and all things money-related. What financial topic interests you?",
      "Thanks for that insight! 💡 I'm focused on helping you achieve financial success. Is there a specific financial goal or challenge you'd like to discuss?",
      "That's a great perspective! 🌟 I'm here to support your financial journey. What financial area would you like to improve or learn more about?"
    ];
    
    const hindiResponses = [
      "यह एक दिलचस्प बिंदु है! 🤔 जबकि मैं वित्तीय विषयों में विशेषज्ञता रखता हूं, मैं आपकी किसी भी पैसे से संबंधित सवालों में मदद करने में खुशी होगी। आप किस वित्तीय पहलू का अन्वेषण करना चाहते हैं?",
      "मैं आपके साथ इसे साझा करने की सराहना करता हूं! 😊 आपके वित्तीय सलाहकार के रूप में, मैं बजटिंग, निवेश, बचत और सभी पैसे से संबंधित चीजों में आपकी मदद करने के लिए यहां हूं। आपको कौन सा वित्तीय विषय रुचिकर लगता है?",
      "उस अंतर्दृष्टि के लिए धन्यवाद! 💡 मैं आपकी वित्तीय सफलता प्राप्त करने में मदद करने पर केंद्रित हूं। क्या कोई विशिष्ट वित्तीय लक्ष्य या चुनौती है जिस पर आप चर्चा करना चाहते हैं?",
      "यह एक बहुत अच्छा दृष्टिकोण है! 🌟 मैं आपकी वित्तीय यात्रा का समर्थन करने के लिए यहां हूं। आप किस वित्तीय क्षेत्र में सुधार करना या अधिक जानना चाहते हैं?"
    ];
    
    const responseList = language === 'hi' ? hindiResponses : responses;
    return responseList[Math.floor(Math.random() * responseList.length)];
  }

  private getDefaultAdvice(language: string): string {
    const advice: Record<string, string> = {
      en: "Hello! I'm NavaNiti AI, your advanced financial education assistant. I can help you with:\n\n💰 **Budgeting** - Advanced budgeting strategies\n📈 **Investing** - Smart investment planning\n🛡️ **Scam Protection** - Comprehensive fraud prevention\n💡 **Saving Tips** - High-yield saving strategies\n🚨 **Emergency Planning** - Emergency fund building\n🏦 **Loans** - Smart loan management\n📋 **Tax Planning** - Tax saving strategies\n🛡️ **Insurance** - Comprehensive coverage planning\n👴 **Retirement** - Long-term retirement planning\n\nWhat specific financial topic would you like to explore?",
      
      hi: "नमस्ते! मैं NavaNiti AI हूं, आपका उन्नत वित्तीय शिक्षा सहायक। मैं आपकी मदद कर सकता हूं:\n\n💰 **बजट बनाना** - उन्नत बजट रणनीतियां\n📈 **निवेश** - स्मार्ट निवेश योजना\n🛡️ **घोटाला सुरक्षा** - व्यापक धोखाधड़ी रोकथाम\n💡 **बचत टिप्स** - उच्च उपज बचत रणनीतियां\n🚨 **आपातकालीन योजना** - आपातकालीन फंड निर्माण\n🏦 **ऋण** - स्मार्ट ऋण प्रबंधन\n📋 **कर योजना** - कर बचत रणनीतियां\n🛡️ **बीमा** - व्यापक कवरेज योजना\n👴 **सेवानिवृत्ति** - दीर्घकालिक सेवानिवृत्ति योजना\n\nआप किस विशिष्ट वित्तीय विषय का अन्वेषण करना चाहते हैं?"
    };
    
    return advice[language] || advice.en;
  }

  private getHumanizedBudgetAdvice(language: string, message: string): string {
    const responses = [
      "I love talking about budgeting! 💰 It's the foundation of financial success. Let me help you create a budget that actually works for your lifestyle. What's your current monthly income?",
      "Budgeting is my favorite topic! 📊 I've helped thousands of people take control of their finances. Tell me about your current spending habits, and I'll show you how to optimize them.",
      "Great choice! Budgeting is the key to financial freedom! 🗝️ I'm excited to help you build a budget that fits your goals. What financial challenges are you facing right now?",
      "Perfect! Let's make budgeting fun and effective! 🎯 I'll guide you through creating a budget that actually works. What's your biggest financial goal this year?"
    ];
    
    const hindiResponses = [
      "मुझे बजटिंग के बारे में बात करना पसंद है! 💰 यह वित्तीय सफलता की नींव है। मैं आपको एक ऐसा बजट बनाने में मदद करूंगा जो वास्तव में आपकी जीवनशैली के लिए काम करे। आपकी वर्तमान मासिक आय क्या है?",
      "बजटिंग मेरा पसंदीदा विषय है! 📊 मैंने हजारों लोगों को अपने वित्त पर नियंत्रण लेने में मदद की है। अपनी वर्तमान खर्च की आदतों के बारे में बताएं, और मैं आपको दिखाऊंगा कि उन्हें कैसे अनुकूलित करें।",
      "बहुत अच्छा विकल्प! बजटिंग वित्तीय स्वतंत्रता की कुंजी है! 🗝️ मैं आपकी मदद करने के लिए उत्साहित हूं कि आप अपने लक्ष्यों के अनुकूल बजट बनाएं। आपको अभी कौन सी वित्तीय चुनौतियों का सामना करना पड़ रहा है?",
      "बिल्कुल सही! आइए बजटिंग को मजेदार और प्रभावी बनाएं! 🎯 मैं आपको एक ऐसा बजट बनाने के माध्यम से मार्गदर्शन करूंगा जो वास्तव में काम करे। इस साल आपका सबसे बड़ा वित्तीय लक्ष्य क्या है?"
    ];
    
    const responseList = language === 'hi' ? hindiResponses : responses;
    return responseList[Math.floor(Math.random() * responseList.length)];
  }

  private getHumanizedInvestmentAdvice(language: string, message: string): string {
    const responses = [
      "Investing is such an exciting journey! 📈 I'm thrilled to help you build wealth for the future. What's your investment experience level, and what are you hoping to achieve?",
      "I absolutely love discussing investments! 💎 It's one of the most powerful ways to grow your money. Tell me about your financial goals, and I'll help you create the perfect investment strategy.",
      "Investing is my passion! 🚀 I've helped many people start their investment journey. What's your risk tolerance, and how much are you looking to invest monthly?",
      "Fantastic! Investing is the path to financial freedom! 💰 I'm here to guide you through every step. What's your timeline for achieving your financial goals?"
    ];
    
    const hindiResponses = [
      "निवेश एक बहुत रोमांचक यात्रा है! 📈 मैं आपकी भविष्य के लिए धन बनाने में मदद करने के लिए रोमांचित हूं। आपका निवेश अनुभव स्तर क्या है, और आप क्या हासिल करने की उम्मीद कर रहे हैं?",
      "मुझे निवेश पर चर्चा करना बिल्कुल पसंद है! 💎 यह आपके पैसे को बढ़ाने के सबसे शक्तिशाली तरीकों में से एक है। अपने वित्तीय लक्ष्यों के बारे में बताएं, और मैं आपके लिए सही निवेश रणनीति बनाने में मदद करूंगा।",
      "निवेश मेरा जुनून है! 🚀 मैंने कई लोगों को अपनी निवेश यात्रा शुरू करने में मदद की है। आपकी जोखिम सहनशीलता क्या है, और आप मासिक कितना निवेश करना चाहते हैं?",
      "शानदार! निवेश वित्तीय स्वतंत्रता का रास्ता है! 💰 मैं आपको हर कदम पर मार्गदर्शन करने के लिए यहां हूं। अपने वित्तीय लक्ष्यों को हासिल करने के लिए आपका समयसीमा क्या है?"
    ];
    
    const responseList = language === 'hi' ? hindiResponses : responses;
    return responseList[Math.floor(Math.random() * responseList.length)];
  }

  private getHumanizedScamAdvice(language: string, message: string): string {
    const responses = [
      "I'm so glad you're thinking about scam protection! 🛡️ It's crucial in today's digital world. Let me share some essential tips to keep your money safe. What specific concerns do you have?",
      "Scam awareness is incredibly important! 🔒 I'm here to help you stay safe from financial fraud. Have you encountered any suspicious offers or calls recently?",
      "Great question! Protecting yourself from scams is vital! 🚨 I'll teach you the red flags to watch for and how to verify legitimate opportunities. What's your biggest concern about financial scams?",
      "I'm passionate about keeping people safe from financial fraud! 💪 Let me share some powerful strategies to protect your hard-earned money. What financial scams are you most worried about?"
    ];
    
    const hindiResponses = [
      "मुझे खुशी है कि आप घोटाला सुरक्षा के बारे में सोच रहे हैं! 🛡️ आज की डिजिटल दुनिया में यह महत्वपूर्ण है। मैं आपके पैसे को सुरक्षित रखने के लिए कुछ आवश्यक टिप्स साझा करूंगा। आपकी क्या विशिष्ट चिंताएं हैं?",
      "घोटाला जागरूकता अविश्वसनीय रूप से महत्वपूर्ण है! 🔒 मैं आपको वित्तीय धोखाधड़ी से सुरक्षित रखने में मदद करने के लिए यहां हूं। क्या आपने हाल ही में कोई संदिग्ध प्रस्ताव या कॉल का सामना किया है?",
      "बहुत अच्छा सवाल! घोटालों से खुद को बचाना महत्वपूर्ण है! 🚨 मैं आपको देखने योग्य लाल झंडे और वैध अवसरों को कैसे सत्यापित करना है, यह सिखाऊंगा। वित्तीय घोटालों के बारे में आपकी सबसे बड़ी चिंता क्या है?",
      "मैं लोगों को वित्तीय धोखाधड़ी से सुरक्षित रखने के लिए भावुक हूं! 💪 मैं आपके कमाए गए पैसे की सुरक्षा के लिए कुछ शक्तिशाली रणनीतियां साझा करूंगा। आप किन वित्तीय घोटालों के बारे में सबसे अधिक चिंतित हैं?"
    ];
    
    const responseList = language === 'hi' ? hindiResponses : responses;
    return responseList[Math.floor(Math.random() * responseList.length)];
  }

  private getHumanizedSavingAdvice(language: string, message: string): string {
    const responses = [
      "I love helping people build their savings! 💰 It's one of the most rewarding financial habits. Let me show you some powerful strategies to grow your money. What's your current saving goal?",
      "Saving money is such an important skill! 🏦 I'm excited to help you develop better saving habits. Tell me about your financial situation, and I'll create a personalized saving plan for you.",
      "Great choice! Saving is the foundation of financial security! 🛡️ I've helped many people build substantial savings. What's your biggest challenge when it comes to saving money?",
      "I'm passionate about helping people save more effectively! 💎 Let me share some proven strategies that have helped thousands of people. What's your target amount for savings?"
    ];
    
    const hindiResponses = [
      "मुझे लोगों को अपनी बचत बनाने में मदद करना पसंद है! 💰 यह सबसे फायदेमंद वित्तीय आदतों में से एक है। मैं आपको अपने पैसे को बढ़ाने के लिए कुछ शक्तिशाली रणनीतियां दिखाऊंगा। आपका वर्तमान बचत लक्ष्य क्या है?",
      "पैसे बचाना इतना महत्वपूर्ण कौशल है! 🏦 मैं आपको बेहतर बचत आदतें विकसित करने में मदद करने के लिए उत्साहित हूं। अपनी वित्तीय स्थिति के बारे में बताएं, और मैं आपके लिए एक व्यक्तिगत बचत योजना बनाऊंगा।",
      "बहुत अच्छा विकल्प! बचत वित्तीय सुरक्षा की नींव है! 🛡️ मैंने कई लोगों को पर्याप्त बचत बनाने में मदद की है। पैसे बचाने के मामले में आपकी सबसे बड़ी चुनौती क्या है?",
      "मैं लोगों को अधिक प्रभावी ढंग से बचत करने में मदद करने के लिए भावुक हूं! 💎 मैं कुछ सिद्ध रणनीतियां साझा करूंगा जिन्होंने हजारों लोगों की मदद की है। बचत के लिए आपकी लक्ष्य राशि क्या है?"
    ];
    
    const responseList = language === 'hi' ? hindiResponses : responses;
    return responseList[Math.floor(Math.random() * responseList.length)];
  }

  private getHumanizedEmergencyAdvice(language: string, message: string): string {
    const responses = [
      "Emergency planning is so crucial! 🚨 I'm glad you're thinking about this. Let me help you build a solid emergency fund that will protect you during tough times. What's your current emergency fund situation?",
      "I love discussing emergency preparedness! 🛡️ It's one of the most important aspects of financial planning. Tell me about your current financial situation, and I'll help you create an emergency plan.",
      "Emergency funds are lifesavers! 💪 I'm here to help you build one that works for your lifestyle. What's your biggest concern about unexpected expenses?",
      "Great thinking! Emergency planning gives you peace of mind! 😌 Let me share some strategies to build your emergency fund quickly and effectively. What's your target emergency fund amount?"
    ];
    
    const hindiResponses = [
      "आपातकालीन योजना इतनी महत्वपूर्ण है! 🚨 मुझे खुशी है कि आप इसके बारे में सोच रहे हैं। मैं आपको एक ठोस आपातकालीन फंड बनाने में मदद करूंगा जो कठिन समय के दौरान आपकी रक्षा करेगा। आपकी वर्तमान आपातकालीन फंड स्थिति क्या है?",
      "मुझे आपातकालीन तैयारी पर चर्चा करना पसंद है! 🛡️ यह वित्तीय योजना के सबसे महत्वपूर्ण पहलुओं में से एक है। अपनी वर्तमान वित्तीय स्थिति के बारे में बताएं, और मैं आपके लिए एक आपातकालीन योजना बनाने में मदद करूंगा।",
      "आपातकालीन फंड जीवन रक्षक हैं! 💪 मैं आपकी जीवनशैली के लिए काम करने वाला एक बनाने में मदद करने के लिए यहां हूं। अप्रत्याशित खर्चों के बारे में आपकी सबसे बड़ी चिंता क्या है?",
      "बहुत अच्छा सोचा! आपातकालीन योजना आपको मन की शांति देती है! 😌 मैं आपके आपातकालीन फंड को तेजी से और प्रभावी ढंग से बनाने के लिए कुछ रणनीतियां साझा करूंगा। आपकी लक्ष्य आपातकालीन फंड राशि क्या है?"
    ];
    
    const responseList = language === 'hi' ? hindiResponses : responses;
    return responseList[Math.floor(Math.random() * responseList.length)];
  }

  private getHumanizedLoanAdvice(language: string, message: string): string {
    const responses = [
      "Loan management is such an important topic! 🏦 I'm here to help you navigate the world of loans wisely. What type of loan are you considering, and what's your current financial situation?",
      "I love helping people make smart loan decisions! 💡 Loans can be powerful tools when used correctly. Tell me about your loan needs, and I'll help you find the best options.",
      "Great question! Loan management is crucial for financial health! 📊 I'm excited to help you understand your options. What's your main goal with this loan?",
      "I'm passionate about helping people with loan strategies! 🚀 Let me guide you through the process of choosing the right loan for your needs. What's your timeline for getting a loan?"
    ];
    
    const hindiResponses = [
      "ऋण प्रबंधन इतना महत्वपूर्ण विषय है! 🏦 मैं आपको ऋण की दुनिया में बुद्धिमानी से नेविगेट करने में मदद करने के लिए यहां हूं। आप किस प्रकार के ऋण पर विचार कर रहे हैं, और आपकी वर्तमान वित्तीय स्थिति क्या है?",
      "मुझे लोगों को स्मार्ट ऋण निर्णय लेने में मदद करना पसंद है! 💡 ऋण सही तरीके से उपयोग किए जाने पर शक्तिशाली उपकरण हो सकते हैं। अपनी ऋण आवश्यकताओं के बारे में बताएं, और मैं आपको सबसे अच्छे विकल्प खोजने में मदद करूंगा।",
      "बहुत अच्छा सवाल! ऋण प्रबंधन वित्तीय स्वास्थ्य के लिए महत्वपूर्ण है! 📊 मैं आपको अपने विकल्पों को समझने में मदद करने के लिए उत्साहित हूं। इस ऋण के साथ आपका मुख्य लक्ष्य क्या है?",
      "मैं लोगों की ऋण रणनीतियों में मदद करने के लिए भावुक हूं! 🚀 मैं आपको अपनी आवश्यकताओं के लिए सही ऋण चुनने की प्रक्रिया के माध्यम से मार्गदर्शन करूंगा। ऋण प्राप्त करने के लिए आपका समयसीमा क्या है?"
    ];
    
    const responseList = language === 'hi' ? hindiResponses : responses;
    return responseList[Math.floor(Math.random() * responseList.length)];
  }

  private getHumanizedTaxAdvice(language: string, message: string): string {
    const responses = [
      "Tax planning is such a smart approach! 📋 I'm here to help you save money legally and effectively. What's your current tax situation, and what are your main income sources?",
      "I love helping people with tax strategies! 💰 Tax planning can save you thousands of rupees. Tell me about your financial goals, and I'll show you how to optimize your tax savings.",
      "Great thinking! Tax planning is essential for financial success! 🎯 I'm excited to help you understand your options. What's your biggest concern about taxes?",
      "I'm passionate about tax optimization! 🚀 Let me share some powerful strategies to reduce your tax burden legally. What's your annual income range?"
    ];
    
    const hindiResponses = [
      "कर योजना इतना स्मार्ट दृष्टिकोण है! 📋 मैं आपको कानूनी और प्रभावी ढंग से पैसे बचाने में मदद करने के लिए यहां हूं। आपकी वर्तमान कर स्थिति क्या है, और आपके मुख्य आय स्रोत क्या हैं?",
      "मुझे लोगों की कर रणनीतियों में मदद करना पसंद है! 💰 कर योजना आपको हजारों रुपये बचा सकती है। अपने वित्तीय लक्ष्यों के बारे में बताएं, और मैं आपको दिखाऊंगा कि अपनी कर बचत को कैसे अनुकूलित करें।",
      "बहुत अच्छा सोचा! कर योजना वित्तीय सफलता के लिए आवश्यक है! 🎯 मैं आपको अपने विकल्पों को समझने में मदद करने के लिए उत्साहित हूं। करों के बारे में आपकी सबसे बड़ी चिंता क्या है?",
      "मैं कर अनुकूलन के लिए भावुक हूं! 🚀 मैं आपके कर बोझ को कानूनी रूप से कम करने के लिए कुछ शक्तिशाली रणनीतियां साझा करूंगा। आपकी वार्षिक आय सीमा क्या है?"
    ];
    
    const responseList = language === 'hi' ? hindiResponses : responses;
    return responseList[Math.floor(Math.random() * responseList.length)];
  }

  private getHumanizedInsuranceAdvice(language: string, message: string): string {
    const responses = [
      "Insurance planning is so important! 🛡️ I'm here to help you protect what matters most. What's your current insurance coverage, and what are your main protection needs?",
      "I love discussing insurance strategies! 💎 Proper coverage gives you peace of mind. Tell me about your family situation, and I'll help you create the perfect insurance plan.",
      "Great question! Insurance is your financial safety net! 🚨 I'm excited to help you understand your options. What's your biggest concern about insurance coverage?",
      "I'm passionate about helping people with insurance! 🏥 Let me guide you through choosing the right coverage for your needs. What's your current insurance situation?"
    ];
    
    const hindiResponses = [
      "बीमा योजना इतनी महत्वपूर्ण है! 🛡️ मैं आपको सबसे महत्वपूर्ण चीजों की रक्षा करने में मदद करने के लिए यहां हूं। आपका वर्तमान बीमा कवरेज क्या है, और आपकी मुख्य सुरक्षा आवश्यकताएं क्या हैं?",
      "मुझे बीमा रणनीतियों पर चर्चा करना पसंद है! 💎 उचित कवरेज आपको मन की शांति देती है। अपनी पारिवारिक स्थिति के बारे में बताएं, और मैं आपके लिए सही बीमा योजना बनाने में मदद करूंगा।",
      "बहुत अच्छा सवाल! बीमा आपका वित्तीय सुरक्षा जाल है! 🚨 मैं आपको अपने विकल्पों को समझने में मदद करने के लिए उत्साहित हूं। बीमा कवरेज के बारे में आपकी सबसे बड़ी चिंता क्या है?",
      "मैं लोगों की बीमा में मदद करने के लिए भावुक हूं! 🏥 मैं आपको अपनी आवश्यकताओं के लिए सही कवरेज चुनने के माध्यम से मार्गदर्शन करूंगा। आपकी वर्तमान बीमा स्थिति क्या है?"
    ];
    
    const responseList = language === 'hi' ? hindiResponses : responses;
    return responseList[Math.floor(Math.random() * responseList.length)];
  }

  private getHumanizedRetirementAdvice(language: string, message: string): string {
    const responses = [
      "Retirement planning is such a wise investment in your future! 👴 I'm here to help you build a comfortable retirement. What's your current age, and when do you plan to retire?",
      "I love helping people plan for retirement! 🏖️ It's never too early to start thinking about your golden years. Tell me about your retirement goals, and I'll help you create a solid plan.",
      "Great thinking! Retirement planning is crucial for long-term security! 💎 I'm excited to help you understand your options. What's your biggest concern about retirement?",
      "I'm passionate about retirement planning! 🚀 Let me share some powerful strategies to build your retirement corpus. What's your target retirement age?"
    ];
    
    const hindiResponses = [
      "सेवानिवृत्ति योजना आपके भविष्य में इतना बुद्धिमान निवेश है! 👴 मैं आपको एक आरामदायक सेवानिवृत्ति बनाने में मदद करने के लिए यहां हूं। आपकी वर्तमान आयु क्या है, और आप कब सेवानिवृत्त होने की योजना बना रहे हैं?",
      "मुझे लोगों को सेवानिवृत्ति की योजना बनाने में मदद करना पसंद है! 🏖️ अपने स्वर्णिम वर्षों के बारे में सोचना शुरू करने में कभी देर नहीं होती। अपने सेवानिवृत्ति लक्ष्यों के बारे में बताएं, और मैं आपके लिए एक ठोस योजना बनाने में मदद करूंगा।",
      "बहुत अच्छा सोचा! सेवानिवृत्ति योजना दीर्घकालिक सुरक्षा के लिए महत्वपूर्ण है! 💎 मैं आपको अपने विकल्पों को समझने में मदद करने के लिए उत्साहित हूं। सेवानिवृत्ति के बारे में आपकी सबसे बड़ी चिंता क्या है?",
      "मैं सेवानिवृत्ति योजना के लिए भावुक हूं! 🚀 मैं आपके सेवानिवृत्ति कोष बनाने के लिए कुछ शक्तिशाली रणनीतियां साझा करूंगा। आपकी लक्ष्य सेवानिवृत्ति आयु क्या है?"
    ];
    
    const responseList = language === 'hi' ? hindiResponses : responses;
    return responseList[Math.floor(Math.random() * responseList.length)];
  }

  private getComprehensiveFinancialResponse(topic: string, language: string, message: string): string {
    const knowledgeBase = this.getFinancialKnowledgeBase();
    const topicInfo = knowledgeBase[topic];
    
    if (!topicInfo) {
      // If topic not found in knowledge base, provide a comprehensive response based on topic
      return this.getTopicBasedResponse(topic, language, message);
    }
    
    const responses = topicInfo.responses[language] || topicInfo.responses.en;
    const randomResponse = responses[Math.floor(Math.random() * responses.length)];
    
    return randomResponse;
  }

  private getTopicBasedResponse(topic: string, language: string, message: string): string {
    const responses = {
      'budgeting': {
        en: [
          "I love talking about budgeting! 💰 It's the foundation of financial success. Let me help you create a budget that actually works for your lifestyle. Here's a comprehensive guide:\n\n📊 **Step-by-Step Budgeting:**\n• **Calculate Income**: All sources of monthly income\n• **List Expenses**: Fixed (rent, EMI) + Variable (food, entertainment)\n• **Set Goals**: Emergency fund, vacation, retirement\n• **Track Spending**: Use apps or spreadsheets\n• **Review Monthly**: Adjust based on actual spending\n\n🎯 **50/30/20 Rule:**\n• 50% Needs (rent, food, utilities)\n• 30% Wants (entertainment, shopping)\n• 20% Savings & Investments\n\n💡 **Pro Tips:**\n• Start with tracking expenses for 30 days\n• Use separate accounts for different goals\n• Automate savings transfers\n• Review and adjust monthly\n\nWhat's your current monthly income, and what are your main expenses?",
          "Budgeting is my favorite topic! 📊 I've helped thousands of people take control of their finances. Here's how to create an effective budget:\n\n💰 **Budget Categories:**\n• **Housing**: 25-30% of income\n• **Food**: 10-15% of income\n• **Transportation**: 10-15% of income\n• **Utilities**: 5-10% of income\n• **Savings**: 20% of income\n• **Entertainment**: 5-10% of income\n\n📱 **Budgeting Tools:**\n• **Apps**: Moneycontrol, ET Money, Zerodha Coin\n• **Excel**: Create your own tracker\n• **Bank Apps**: Set up auto-transfers\n• **Envelope Method**: Cash for different categories\n\n🎯 **Common Budgeting Mistakes:**\n• Not tracking small expenses\n• Forgetting irregular expenses\n• Being too restrictive\n• Not having an emergency fund\n\nWhat financial challenges are you facing with budgeting?"
        ],
        hi: [
          "मुझे बजटिंग के बारे में बात करना पसंद है! 💰 यह वित्तीय सफलता की नींव है। मैं आपको एक ऐसा बजट बनाने में मदद करूंगा जो वास्तव में आपकी जीवनशैली के लिए काम करे। यहां एक व्यापक गाइड है:\n\n📊 **चरण-दर-चरण बजटिंग:**\n• **आय की गणना**: सभी मासिक आय स्रोत\n• **खर्चों की सूची**: निश्चित (किराया, EMI) + परिवर्तनीय (भोजन, मनोरंजन)\n• **लक्ष्य निर्धारित करें**: आपातकालीन फंड, छुट्टी, सेवानिवृत्ति\n• **खर्च ट्रैक करें**: ऐप्स या स्प्रेडशीट का उपयोग करें\n• **मासिक समीक्षा**: वास्तविक खर्च के आधार पर समायोजन\n\n🎯 **50/30/20 नियम:**\n• 50% जरूरतें (किराया, भोजन, बिजली)\n• 30% इच्छाएं (मनोरंजन, खरीदारी)\n• 20% बचत और निवेश\n\n💡 **प्रो टिप्स:**\n• 30 दिनों के लिए खर्च ट्रैक करके शुरू करें\n• विभिन्न लक्ष्यों के लिए अलग खाते का उपयोग करें\n• बचत ट्रांसफर को स्वचालित करें\n• मासिक समीक्षा और समायोजन करें\n\nआपकी वर्तमान मासिक आय क्या है, और आपके मुख्य खर्च क्या हैं?"
        ]
      },
      'investing': {
        en: [
          "Investing is such an exciting journey! 📈 I'm thrilled to help you build wealth for the future. Here's a comprehensive investment guide:\n\n💰 **Investment Options in India:**\n• **Mutual Funds**: SIP starting ₹500/month\n• **Stocks**: Direct equity investment\n• **PPF**: 7.1% p.a. (15-year lock-in)\n• **EPF**: 8.1% p.a. (employer contribution)\n• **NPS**: 8-10% p.a. (pension scheme)\n• **Gold**: ETFs or physical gold\n• **Real Estate**: Property investment\n\n📊 **Risk Assessment:**\n• **Conservative**: 70% Debt, 30% Equity\n• **Moderate**: 50% Debt, 50% Equity\n• **Aggressive**: 30% Debt, 70% Equity\n\n🎯 **Beginner Portfolio (₹5,000-10,000/month):**\n• 40% Large Cap Mutual Funds\n• 30% Mid Cap Funds\n• 20% Small Cap Funds\n• 10% Debt Funds\n\n💡 **Investment Tips:**\n• Start early, invest regularly\n• Don't time the market\n• Diversify across sectors\n• Review quarterly, not daily\n• Use SIP for disciplined investing\n\nWhat's your investment experience level, and how much can you invest monthly?",
          "I absolutely love discussing investments! 💎 It's one of the most powerful ways to grow your money. Here's what you need to know:\n\n🚀 **Getting Started:**\n• **KYC**: Complete KYC with any AMC\n• **Demat Account**: Open with Zerodha, Upstox, or Angel One\n• **SIP**: Start with ₹500/month in index funds\n• **Research**: Use Moneycontrol, ET Money for analysis\n\n📈 **Popular Investment Strategies:**\n• **Value Investing**: Buy undervalued stocks\n• **Growth Investing**: Focus on growing companies\n• **Dividend Investing**: Regular income from dividends\n• **Index Investing**: Low-cost broad market exposure\n\n🛡️ **Risk Management:**\n• Never invest more than you can afford to lose\n• Diversify across asset classes\n• Have an emergency fund first\n• Don't invest based on tips\n• Do your own research\n\nWhat type of investment interests you most?"
        ],
        hi: [
          "निवेश एक बहुत रोमांचक यात्रा है! 📈 मैं आपकी भविष्य के लिए धन बनाने में मदद करने के लिए रोमांचित हूं। यहां एक व्यापक निवेश गाइड है:\n\n💰 **भारत में निवेश विकल्प:**\n• **म्यूचुअल फंड**: ₹500/माह से SIP शुरू करें\n• **स्टॉक**: प्रत्यक्ष इक्विटी निवेश\n• **PPF**: 7.1% प्रति वर्ष (15 साल लॉक-इन)\n• **EPF**: 8.1% प्रति वर्ष (नियोक्ता योगदान)\n• **NPS**: 8-10% प्रति वर्ष (पेंशन योजना)\n• **सोना**: ETF या भौतिक सोना\n• **रियल एस्टेट**: संपत्ति निवेश\n\n📊 **जोखिम मूल्यांकन:**\n• **रूढ़िवादी**: 70% डेट, 30% इक्विटी\n• **मध्यम**: 50% डेट, 50% इक्विटी\n• **आक्रामक**: 30% डेट, 70% इक्विटी\n\n🎯 **शुरुआती पोर्टफोलियो (₹5,000-10,000/माह):**\n• 40% लार्ज कैप म्यूचुअल फंड\n• 30% मिड कैप फंड\n• 20% स्मॉल कैप फंड\n• 10% डेट फंड\n\n💡 **निवेश टिप्स:**\n• जल्दी शुरू करें, नियमित निवेश करें\n• बाजार का समय न करें\n• सेक्टर में विविधीकरण करें\n• त्रैमासिक समीक्षा, दैनिक नहीं\n• अनुशासित निवेश के लिए SIP का उपयोग करें\n\nआपका निवेश अनुभव स्तर क्या है, और आप मासिक कितना निवेश कर सकते हैं?"
        ]
      }
    };

    const topicResponses = responses[topic as keyof typeof responses];
    if (topicResponses) {
      const languageResponses = topicResponses[language as keyof typeof topicResponses] || topicResponses.en;
      return languageResponses[Math.floor(Math.random() * languageResponses.length)];
    }

    // Default comprehensive response
    return language === 'hi' 
      ? `मैं आपकी ${topic} के बारे में मदद करने के लिए यहां हूं! 💰 यह एक महत्वपूर्ण वित्तीय विषय है। कृपया अपनी विशिष्ट आवश्यकताओं के बारे में बताएं, और मैं आपको विस्तृत मार्गदर्शन प्रदान करूंगा।`
      : `I'm here to help you with ${topic}! 💰 This is an important financial topic. Please tell me about your specific needs, and I'll provide you with detailed guidance.`;
  }

  private getFinancialKnowledgeBase(): Record<string, any> {
    return {
      'scam_awareness': {
        responses: {
          en: [
            "I'm so glad you're asking about scam awareness! 🛡️ This is crucial in today's digital world. Let me share comprehensive protection strategies:\n\n🚨 **Common Scam Types:**\n• **Phishing**: Fake emails/SMS asking for personal details\n• **Investment Scams**: Guaranteed high returns (15%+ monthly)\n• **Romance Scams**: Fake relationships to extract money\n• **Tech Support Scams**: Fake calls claiming computer issues\n• **Lottery Scams**: Fake prize notifications\n• **Job Scams**: Fake job offers requiring upfront payment\n\n🔍 **Red Flags to Watch:**\n• Pressure to act immediately\n• Requests for OTP, PIN, passwords\n• Guaranteed high returns\n• Unregistered investment schemes\n• Unsolicited calls/emails\n\n💡 **Protection Steps:**\n• Never share OTP with anyone\n• Verify URLs before clicking\n• Check company registration on MCA\n• Use official apps only\n• Enable 2FA on all accounts\n\n🚨 **Emergency Actions:**\n• Block compromised cards immediately\n• Change all passwords\n• Report to cybercrime.gov.in\n• Contact bank fraud helpline\n\nWhat specific scam concerns do you have?",
            "Scam awareness is incredibly important! 🔒 I'm here to help you stay safe from financial fraud. Here's a comprehensive guide:\n\n📱 **Digital Scam Protection:**\n• **SMS Scams**: Never click suspicious links\n• **Call Scams**: Banks never call for OTP\n• **Email Scams**: Check sender authenticity\n• **App Scams**: Download only from official stores\n\n💰 **Investment Scam Red Flags:**\n• Guaranteed returns above 12% annually\n• Pressure to invest immediately\n• Unregistered companies\n• No proper documentation\n• Promises of quick wealth\n\n🛡️ **Verification Methods:**\n• Check SEBI registration for investments\n• Verify company on MCA website\n• Cross-check with official sources\n• Never invest without proper research\n\n📞 **Reporting Scams:**\n• Cyber Crime Portal: cybercrime.gov.in\n• Bank fraud helplines\n• SEBI complaint system\n• Local police cyber cell\n\nHave you encountered any suspicious offers recently?",
            "I'm passionate about keeping people safe from financial fraud! 💪 Let me share some powerful strategies:\n\n🎯 **Advanced Scam Detection:**\n• **Social Engineering**: Scammers manipulate emotions\n• **Authority Impersonation**: Fake government/bank officials\n• **Urgency Tactics**: Creating false time pressure\n• **Greed Exploitation**: Promising unrealistic returns\n\n🔐 **Security Best Practices:**\n• Use strong, unique passwords\n• Enable biometric authentication\n• Regular security updates\n• Monitor account statements\n• Set up transaction alerts\n\n📚 **Education Resources:**\n• RBI's awareness campaigns\n• SEBI investor education\n• Bank security guidelines\n• Government cyber awareness programs\n\n🚨 **Recovery Steps if Scammed:**\n• Document everything immediately\n• Contact bank within 24 hours\n• File police complaint\n• Report to cybercrime portal\n• Seek legal advice if needed\n\nWhat's your biggest concern about financial scams?"
          ],
          hi: [
            "मुझे खुशी है कि आप घोटाला जागरूकता के बारे में पूछ रहे हैं! 🛡️ आज की डिजिटल दुनिया में यह महत्वपूर्ण है। मैं व्यापक सुरक्षा रणनीतियां साझा करूंगा:\n\n🚨 **आम घोटाला प्रकार:**\n• **फिशिंग**: व्यक्तिगत विवरण मांगने वाले नकली ईमेल/एसएमएस\n• **निवेश घोटाले**: गारंटीकृत उच्च रिटर्न (15%+ मासिक)\n• **रोमांस घोटाले**: पैसे निकालने के लिए नकली रिश्ते\n• **टेक सपोर्ट घोटाले**: कंप्यूटर समस्याओं का दावा करने वाली नकली कॉल\n• **लॉटरी घोटाले**: नकली पुरस्कार सूचनाएं\n• **नौकरी घोटाले**: अग्रिम भुगतान की आवश्यकता वाले नकली नौकरी प्रस्ताव\n\n🔍 **देखने योग्य लाल झंडे:**\n• तुरंत कार्य करने का दबाव\n• OTP, PIN, पासवर्ड की मांग\n• गारंटीकृत उच्च रिटर्न\n• अंकीय निवेश योजनाएं\n• अवांछित कॉल/ईमेल\n\n💡 **सुरक्षा कदम:**\n• कभी OTP किसी के साथ साझा न करें\n• क्लिक करने से पहले URL सत्यापित करें\n• MCA पर कंपनी पंजीकरण जांचें\n• केवल आधिकारिक ऐप्स का उपयोग करें\n• सभी खातों पर 2FA सक्षम करें\n\n🚨 **आपातकालीन कार्य:**\n• समझौता होने पर तुरंत कार्ड ब्लॉक करें\n• सभी पासवर्ड बदलें\n• cybercrime.gov.in पर रिपोर्ट करें\n• बैंक धोखाधड़ी हेल्पलाइन से संपर्क करें\n\nआपकी क्या विशिष्ट घोटाला चिंताएं हैं?"
          ]
        }
      },
      'cryptocurrency': {
        responses: {
          en: [
            "Cryptocurrency is a fascinating but complex topic! 🪙 Let me help you understand it properly:\n\n💰 **What is Cryptocurrency?**\n• Digital currency using blockchain technology\n• Decentralized (no central authority)\n• Examples: Bitcoin, Ethereum, Dogecoin\n• Stored in digital wallets\n\n📈 **Investment Considerations:**\n• **High Risk**: Extremely volatile prices\n• **No Guarantees**: Can lose all your money\n• **Regulation**: Limited government protection\n• **Research Required**: Understand before investing\n\n⚠️ **Risks to Consider:**\n• Price volatility (can drop 50%+ quickly)\n• No insurance protection\n• Technical complexity\n• Regulatory uncertainty\n• Scam potential\n\n💡 **Safe Approach:**\n• Invest only what you can afford to lose\n• Start with small amounts\n• Use reputable exchanges\n• Secure your wallet properly\n• Stay updated with regulations\n\n🚨 **Common Crypto Scams:**\n• Fake exchanges\n• Ponzi schemes\n• Fake celebrity endorsements\n• Phishing attacks\n• Pump and dump schemes\n\nWhat specific aspect of cryptocurrency interests you?",
            "I love discussing cryptocurrency! 🚀 It's one of the most exciting financial innovations. Here's what you need to know:\n\n🔍 **How to Get Started Safely:**\n• **Choose Reputable Exchanges**: CoinDCX, WazirX, ZebPay\n• **Start Small**: Invest only 1-2% of your portfolio\n• **Secure Storage**: Use hardware wallets for large amounts\n• **Stay Informed**: Follow official news sources\n\n📊 **Investment Strategies:**\n• **DCA (Dollar Cost Averaging)**: Regular small investments\n• **HODL**: Long-term holding strategy\n• **Diversification**: Don't put all money in one crypto\n• **Research**: Understand each project before investing\n\n🛡️ **Security Best Practices:**\n• Enable 2FA on all accounts\n• Use strong passwords\n• Never share private keys\n• Be wary of 'get rich quick' schemes\n• Verify all transactions\n\n📚 **Learning Resources:**\n• Official project websites\n• Reputable financial news\n• Educational platforms\n• Community discussions\n\nWhat's your experience level with cryptocurrency?"
          ],
          hi: [
            "क्रिप्टोकरेंसी एक आकर्षक लेकिन जटिल विषय है! 🪙 मैं आपको इसे ठीक से समझने में मदद करूंगा:\n\n💰 **क्रिप्टोकरेंसी क्या है?**\n• ब्लॉकचेन तकनीक का उपयोग करने वाली डिजिटल मुद्रा\n• विकेंद्रीकृत (कोई केंद्रीय प्राधिकरण नहीं)\n• उदाहरण: बिटकॉइन, एथेरियम, डॉगकॉइन\n• डिजिटल वॉलेट में संग्रहीत\n\n📈 **निवेश विचार:**\n• **उच्च जोखिम**: अत्यधिक अस्थिर कीमतें\n• **कोई गारंटी नहीं**: सारा पैसा खो सकते हैं\n• **विनियमन**: सीमित सरकारी सुरक्षा\n• **अनुसंधान आवश्यक**: निवेश से पहले समझें\n\n⚠️ **विचार करने योग्य जोखिम:**\n• मूल्य अस्थिरता (50%+ तेजी से गिर सकता है)\n• कोई बीमा सुरक्षा नहीं\n• तकनीकी जटिलता\n• नियामक अनिश्चितता\n• घोटाला संभावना\n\n💡 **सुरक्षित दृष्टिकोण:**\n• केवल उतना निवेश करें जो खो सकते हैं\n• छोटी राशि से शुरुआत करें\n• प्रतिष्ठित एक्सचेंज का उपयोग करें\n• अपना वॉलेट सुरक्षित रखें\n• नियमों के साथ अपडेट रहें\n\n🚨 **आम क्रिप्टो घोटाले:**\n• नकली एक्सचेंज\n• पोंजी योजनाएं\n• नकली सेलिब्रिटी समर्थन\n• फिशिंग हमले\n• पंप और डंप योजनाएं\n\nक्रिप्टोकरेंसी का कौन सा विशिष्ट पहलू आपको रुचिकर लगता है?"
          ]
        }
      },
      'real_estate': {
        responses: {
          en: [
            "Real estate is a fantastic investment option! 🏠 Let me guide you through the essentials:\n\n💰 **Investment Benefits:**\n• **Appreciation**: Property values generally increase\n• **Rental Income**: Regular monthly cash flow\n• **Tax Benefits**: Home loan interest deductions\n• **Tangible Asset**: Physical property you own\n• **Hedge Against Inflation**: Real estate keeps pace with inflation\n\n📊 **Types of Real Estate Investment:**\n• **Residential**: Apartments, houses, villas\n• **Commercial**: Offices, shops, warehouses\n• **Land**: Raw land for future development\n• **REITs**: Real Estate Investment Trusts\n\n💡 **Investment Strategies:**\n• **Buy and Hold**: Long-term appreciation\n• **Rental Properties**: Monthly income generation\n• **Fix and Flip**: Buy, renovate, sell for profit\n• **Land Banking**: Buy land in developing areas\n\n🏦 **Financing Options:**\n• **Home Loans**: 8-12% interest rates\n• **Down Payment**: 10-20% of property value\n• **EMI Planning**: Keep EMI under 40% of income\n• **Pre-approval**: Get loan approval before property hunting\n\n⚠️ **Risks to Consider:**\n• **Market Fluctuations**: Property prices can fall\n• **Liquidity**: Hard to sell quickly\n• **Maintenance**: Ongoing repair costs\n• **Location Risk**: Area development matters\n\nWhat type of real estate investment interests you?",
            "I'm excited to help you with real estate investment! 🏡 Here's a comprehensive guide:\n\n🎯 **Location Analysis:**\n• **Infrastructure**: Roads, metro, airports nearby\n• **Employment**: Job opportunities in the area\n• **Education**: Schools and colleges nearby\n• **Healthcare**: Hospitals and clinics\n• **Future Development**: Upcoming projects\n\n📈 **Market Research:**\n• **Price Trends**: Historical price movements\n• **Demand Supply**: Current market conditions\n• **Rental Yields**: Expected rental income\n• **Capital Appreciation**: Expected price growth\n• **Developer Reputation**: Track record of builders\n\n💼 **Legal Considerations:**\n• **Title Verification**: Clear property ownership\n• **Approvals**: All necessary permissions\n• **Encumbrances**: No legal disputes\n• **Registration**: Proper documentation\n• **Tax Implications**: Stamp duty, registration fees\n\n🏠 **Property Types:**\n• **Ready to Move**: Immediate possession\n• **Under Construction**: Lower prices, higher risk\n• **Resale**: Negotiable prices, immediate possession\n• **Pre-launch**: Lowest prices, highest risk\n\nWhat's your budget range for real estate investment?"
          ],
          hi: [
            "रियल एस्टेट एक शानदार निवेश विकल्प है! 🏠 मैं आपको मूलभूत बातों के माध्यम से मार्गदर्शन करूंगा:\n\n💰 **निवेश लाभ:**\n• **प्रशंसा**: संपत्ति मूल्य आमतौर पर बढ़ते हैं\n• **किराया आय**: नियमित मासिक नकदी प्रवाह\n• **कर लाभ**: गृह ऋण ब्याज कटौती\n• **मूर्त संपत्ति**: भौतिक संपत्ति जो आपके पास है\n• **मुद्रास्फीति के खिलाफ हेज**: रियल एस्टेट मुद्रास्फीति के साथ तालमेल रखता है\n\n📊 **रियल एस्टेट निवेश प्रकार:**\n• **आवासीय**: अपार्टमेंट, घर, विला\n• **व्यावसायिक**: कार्यालय, दुकानें, गोदाम\n• **भूमि**: भविष्य के विकास के लिए कच्ची भूमि\n• **REITs**: रियल एस्टेट निवेश ट्रस्ट\n\n💡 **निवेश रणनीतियां:**\n• **खरीदें और रखें**: दीर्घकालिक प्रशंसा\n• **किराया संपत्ति**: मासिक आय उत्पादन\n• **ठीक करें और फ्लिप**: खरीदें, नवीनीकरण करें, लाभ के लिए बेचें\n• **भूमि बैंकिंग**: विकासशील क्षेत्रों में भूमि खरीदें\n\n🏦 **वित्तपोषण विकल्प:**\n• **गृह ऋण**: 8-12% ब्याज दरें\n• **डाउन पेमेंट**: संपत्ति मूल्य का 10-20%\n• **EMI योजना**: EMI को आय के 40% से कम रखें\n• **पूर्व-अनुमोदन**: संपत्ति खोजने से पहले ऋण अनुमोदन प्राप्त करें\n\n⚠️ **विचार करने योग्य जोखिम:**\n• **बाजार उतार-चढ़ाव**: संपत्ति कीमतें गिर सकती हैं\n• **तरलता**: जल्दी बेचना मुश्किल\n• **रखरखाव**: चल रही मरम्मत लागत\n• **स्थान जोखिम**: क्षेत्र विकास मायने रखता है\n\nआपको किस प्रकार का रियल एस्टेट निवेश रुचिकर लगता है?"
          ]
        }
      }
    };
  }

  clearHistory(): void {
    this.chatHistory = [];
  }

  getHistory(): ChatMessage[] {
    return [...this.chatHistory];
  }
}

// Export a singleton instance
export const freeAIService = new FreeAIService();
