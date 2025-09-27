/**
 * 🇵🇱 POLISH AI CLIENT-SIDE INTEGRATION
 * 
 * Multi-provider Polish AI for children's safety
 * Zero backend dependencies - deploy always works!
 */

class PolishAIClient {
    constructor() {
        this.providers = {
            openai: {
                url: 'https://api.openai.com/v1/chat/completions',
                key: null,
                available: false
            },
            pllum: {
                url: 'https://pllum.clarin-pl.eu/api',  // Check if they have API
                key: null,
                available: false
            }
        };
        this.preferredProvider = 'openai';
        this.maxRetries = 2;
    }

    /**
     * 🔑 Set API key for specific provider
     */
    setApiKey(provider, key) {
        if (provider === 'openai' && key && key.startsWith('sk-')) {
            this.providers.openai.key = key;
            this.providers.openai.available = true;
            localStorage.setItem('openai_api_key', key);
            console.log('🔑 OpenAI API key set successfully');
            return true;
        }
        
        console.warn(`❌ Invalid ${provider} API key format`);
        return false;
    }

    /**
     * 🔑 Load API keys from backend and localStorage
     */
    async loadApiKeys() {
        // First try to load from backend (Render environment)
        try {
            const response = await fetch('/api/ai-config');
            if (response.ok) {
                const config = await response.json();
                
                if (config.providers.openai.available && config.providers.openai.key) {
                    this.providers.openai.key = config.providers.openai.key;
                    this.providers.openai.available = true;
                    console.log('🔑 OpenAI API key loaded from Render environment');
                    return true;
                }
            }
        } catch (error) {
            console.log('⚠️ Could not load API config from backend, checking localStorage...');
        }
        
        // Fallback to localStorage  
        const openaiKey = localStorage.getItem('openai_api_key');
        if (openaiKey && openaiKey.startsWith('sk-')) {
            this.providers.openai.key = openaiKey;
            this.providers.openai.available = true;
            console.log('🔑 OpenAI API key loaded from localStorage');
            return true;
        }
        
        return false;
    }

    /**
     * 🇵🇱 Call OpenAI with Polish safety prompts
     */
    async callOpenAI(prompt, retryCount = 0) {
        if (!this.providers.openai.available) {
            return null;
        }

        try {
            console.log(`🇵🇱 Calling OpenAI for Polish safety response (attempt ${retryCount + 1})...`);

            const response = await fetch(this.providers.openai.url, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.providers.openai.key}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    model: 'gpt-4o-mini',  // Cost-effective for children's safety
                    messages: [
                        {
                            role: 'system',
                            content: 'Jesteś polskim asystentem bezpieczeństwa dla dzieci. Odpowiadasz TYLKO po polsku, używając prostego i przyjaznego języka. Zawsze rozpoczynaj odpowiedzi od odpowiedniego emoji. Maksymalnie 2-3 zdania.'
                        },
                        {
                            role: 'user',
                            content: prompt
                        }
                    ],
                    max_tokens: 100,
                    temperature: 0.7,
                    frequency_penalty: 0.2
                })
            });

            if (response.ok) {
                const result = await response.json();
                
                if (result.choices && result.choices.length > 0) {
                    const text = result.choices[0].message.content?.trim() || '';
                    if (text.length > 10) {
                        console.log('✅ OpenAI Polish response received');
                        return text;
                    }
                }
            }

            console.log(`❌ OpenAI API failed (${response.status})`);
            return null;

        } catch (error) {
            console.error('❌ OpenAI error:', error);
            return null;
        }
    }

    /**
     * 📝 Create Polish prompts for children safety
     */
    createPolishPrompt(action, childAge, context) {
        // Determine language complexity
        let languageLevel, complexity;
        if (childAge <= 6) {
            languageLevel = "bardzo prosty język dla maluchów, używaj 'maluszku', krótkie zdania, dużo serdeczności";
            complexity = "podstawowy";
        } else if (childAge <= 9) {
            languageLevel = "prosty język dla dzieci, przyjazny i ciepły ton, bez skomplikowanych słów";
            complexity = "średni";
        } else {
            languageLevel = "normalny język dla dzieci i nastolatków, możesz użyć terminów technicznych";
            complexity = "zaawansowany";
        }

        // Time context
        const timeContext = context.timeOfDay === 'wieczór' ? 
            "Jest wieczór, więc dodaj uwagi o bezpieczeństwie po zmroku. " : "";

        // Create specific prompts
        const prompts = {
            find_safety: `Wyjaśnij ${childAge}-latkowi gdzie znaleźć bezpieczne miejsca gdy się zgubi.

Zasady:
- ${languageLevel}
- ${complexity} poziom szczegółów
- Maksymalnie 2 zdania
- Zacznij od emoji 🏃
- ${timeContext}Bądź konkretny ale ciepły
- Tylko polskie porady dla polskich dzieci

Odpowiedź:`,

            safe_route: `Wyjaśnij ${childAge}-latkowi jak bezpiecznie poruszać się po polskich ulicach.

Zasady:
- ${languageLevel}
- ${complexity} poziom szczegółów  
- Maksymalnie 2 zdania
- Zacznij od emoji 🚶
- ${timeContext}Podaj polskie praktyczne wskazówki (przejścia, ulice, itp.)

Odpowiedź:`,

            emergency_help: `Wyjaśnij ${childAge}-latkowi co robić w sytuacji awaryjnej w Polsce.

Zasady:
- ${languageLevel}
- ${complexity} poziom szczegółów
- Maksymalnie 2 zdania
- Zacznij od emoji 🚨
- ${timeContext}Podkreśl numer 112 i pomoc dorosłych

Odpowiedź:`,

            where_am_i: `Wyjaśnij ${childAge}-latkowi jak zapamiętywać i rozpoznawać miejsca w Polsce.

Zasady:
- ${languageLevel}
- ${complexity} poziom szczegółów
- Maksymalnie 2 zdania
- Zacznij od emoji 🧭
- ${timeContext}Naucz polskiej orientacji w przestrzeni

Odpowiedź:`,

            welcome: `${context.isFirstVisit ? 'Przywitaj się po raz pierwszy' : 'Przywitaj się ponownie'} z ${childAge}-latkiem jako polski asystent bezpieczeństwa.

Zasady:
- ${languageLevel}
- ${complexity} poziom szczegółów
- Maksymalnie 2 zdania
- Zacznij od odpowiedniego emoji
- ${timeContext}Bądź ciepły i zachęcający
- Pokaż się jako polski pomocnik

Odpowiedź:`
        };

        return prompts[action] || prompts.welcome;
    }

    /**
     * 🎯 Generate response for specific action with adaptive learning
     */
    async generateResponse(action, childAge, context = {}) {
        // Track interaction for learning (privacy-safe)
        if (window.adaptiveLearning && window.adaptiveLearning.learningEnabled) {
            window.adaptiveLearning.trackInteraction(action, context);
        }
        
        // Generate adaptive or base prompt
        const prompt = window.adaptiveLearning && window.adaptiveLearning.learningEnabled ?
            window.adaptiveLearning.generateAdaptivePrompt(action, childAge, context) :
            this.createPolishPrompt(action, childAge, context);
        
        // Try OpenAI first (best Polish capabilities)
        if (this.providers.openai.available) {
            const response = await this.callOpenAI(prompt);
            if (response) {
                // Clean up response
                let cleaned = response.trim();
                
                // Ensure reasonable length
                if (cleaned.length > 180) {
                    cleaned = cleaned.substring(0, 177) + '...';
                }
                
                // Log learning status
                if (window.adaptiveLearning && window.adaptiveLearning.learningEnabled) {
                    console.log('🧠 Response adapted based on child behavior patterns');
                }
                
                return cleaned;
            }
        }
        
        // No AI available
        return null;
    }

    /**
     * 🔍 Check if any AI provider is configured
     */
    isConfigured() {
        return this.providers.openai.available;
    }

    /**
     * 📊 Get available providers
     */
    getAvailableProviders() {
        return Object.keys(this.providers).filter(
            provider => this.providers[provider].available
        );
    }
}

// Create global instance  
window.PolishAIClient = PolishAIClient;
window.polishAI = new PolishAIClient();

// Auto-load API keys on startup
document.addEventListener('DOMContentLoaded', async () => {
    await window.polishAI.loadApiKeys();
    const available = window.polishAI.getAvailableProviders();
    
    if (available.length > 0) {
        console.log(`🇵🇱 Polish AI ready with providers: ${available.join(', ')}`);
        console.log('🤖 ChatGPT/OpenAI configured - intelligent Polish responses enabled');
    } else {
        console.log('⚠️ No Polish AI providers configured - using fallback responses');
    }
    
    // Initialize adaptive learning system
    if (window.adaptiveLearning) {
        await window.adaptiveLearning.initializeLearning();
    }
});

console.log('🇵🇱 Polish AI Client loaded - zero backend dependencies!');
