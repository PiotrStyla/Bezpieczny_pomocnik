/**
 * 🇵🇱 BIELIK AI CLIENT-SIDE INTEGRATION
 * 
 * Bezpośrednie wywołania do Bielik AI z przeglądarki
 * Bez problemów z backend dependencies - deploy zawsze przejdzie!
 */

class BielikClient {
    constructor() {
        this.apiUrl = 'https://api-inference.huggingface.co/models/bielik-ai/bielik-7b-instruct';
        this.apiKey = null;
        this.maxRetries = 2;
    }

    /**
     * 🔑 Set API key (from user input or config)
     */
    setApiKey(key) {
        if (key && key.startsWith('hf_') && key.length > 20) {
            this.apiKey = key;
            localStorage.setItem('bielik_api_key', key);
            console.log('🔑 Bielik API key set successfully');
            return true;
        }
        console.warn('❌ Invalid Bielik API key format');
        return false;
    }

    /**
     * 🔑 Load API key from localStorage
     */
    loadApiKey() {
        const stored = localStorage.getItem('bielik_api_key');
        if (stored && stored.startsWith('hf_')) {
            this.apiKey = stored;
            return true;
        }
        return false;
    }

    /**
     * 🇵🇱 Call Bielik AI directly from browser
     */
    async callBielikAI(prompt, retryCount = 0) {
        if (!this.apiKey) {
            console.log('⚠️ No Bielik API key - using fallback');
            return null;
        }

        try {
            console.log(`🇵🇱 Calling Bielik AI (attempt ${retryCount + 1})...`);

            const response = await fetch(this.apiUrl, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    inputs: prompt,
                    parameters: {
                        max_new_tokens: 120,
                        temperature: 0.7,
                        top_p: 0.9,
                        return_full_text: false,
                        do_sample: true
                    }
                })
            });

            if (response.ok) {
                const result = await response.json();
                
                if (Array.isArray(result) && result.length > 0) {
                    const text = result[0].generated_text?.trim() || '';
                    if (text.length > 10) {
                        console.log('✅ Bielik AI response received');
                        return text;
                    }
                }
                
                // Model might be loading
                if (result.error && result.error.includes('loading')) {
                    console.log('⏳ Bielik model is loading, retrying...');
                    if (retryCount < this.maxRetries) {
                        await this.sleep(3000);
                        return await this.callBielikAI(prompt, retryCount + 1);
                    }
                }
            }

            console.log(`❌ Bielik API failed (${response.status})`);
            return null;

        } catch (error) {
            console.error('❌ Bielik AI error:', error);
            return null;
        }
    }

    /**
     * 📝 Create Polish prompts for children
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
            find_safety: `Jesteś polskim asystentem bezpieczeństwa dla ${childAge}-letniego dziecka. Wyjaśnij gdzie znaleźć bezpieczne miejsca gdy się zgubi.

Zasady:
- ${languageLevel}
- ${complexity} poziom szczegółów
- Maksymalnie 2 zdania
- Zacznij od emoji 🏃
- ${timeContext}Bądź konkretny ale ciepły

Odpowiedź:`,

            safe_route: `Jesteś polskim asystentem bezpieczeństwa dla ${childAge}-letniego dziecka. Wyjaśnij jak bezpiecznie poruszać się po ulicach.

Zasady:
- ${languageLevel}
- ${complexity} poziom szczegółów  
- Maksymalnie 2 zdania
- Zacznij od emoji 🚶
- ${timeContext}Podaj praktyczne wskazówki

Odpowiedź:`,

            emergency_help: `Jesteś polskim asystentem bezpieczeństwa dla ${childAge}-letniego dziecka. Wyjaśnij co robić w sytuacji awaryjnej.

Zasady:
- ${languageLevel}
- ${complexity} poziom szczegółów
- Maksymalnie 2 zdania
- Zacznij od emoji 🚨
- ${timeContext}Podkreśl znaczenie pomocy dorosłych

Odpowiedź:`,

            where_am_i: `Jesteś polskim asystentem bezpieczeństwa dla ${childAge}-letniego dziecka. Wyjaśnij jak zapamiętywać i rozpoznawać miejsca.

Zasady:
- ${languageLevel}
- ${complexity} poziom szczegółów
- Maksymalnie 2 zdania
- Zacznij od emoji 🧭
- ${timeContext}Naucz orientacji w przestrzeni

Odpowiedź:`,

            welcome: `Jesteś polskim asystentem bezpieczeństwa dla ${childAge}-letniego dziecka. ${context.isFirstVisit ? 'Przywitaj się po raz pierwszy' : 'Przywitaj się ponownie'}.

Zasady:
- ${languageLevel}
- ${complexity} poziom szczegółów
- Maksymalnie 2 zdania
- Zacznij od odpowiedniego emoji
- ${timeContext}Bądź ciepły i zachęcający

Odpowiedź:`
        };

        return prompts[action] || prompts.welcome;
    }

    /**
     * 🎯 Generate response for specific action
     */
    async generateResponse(action, childAge, context = {}) {
        const prompt = this.createPolishPrompt(action, childAge, context);
        const response = await this.callBielikAI(prompt);
        
        if (response) {
            // Clean up response
            let cleaned = response.trim();
            
            // Remove any prompt leakage
            if (cleaned.toLowerCase().includes('odpowiedź:')) {
                cleaned = cleaned.split('Odpowiedź:').pop().trim();
            }
            
            // Ensure reasonable length
            if (cleaned.length > 180) {
                cleaned = cleaned.substring(0, 177) + '...';
            }
            
            return cleaned;
        }
        
        return null;
    }

    /**
     * 💤 Sleep utility
     */
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * 🔍 Check if API key is configured
     */
    isConfigured() {
        return this.apiKey && this.apiKey.startsWith('hf_');
    }
}

// Create global instance
window.BielikClient = BielikClient;
window.bielikClient = new BielikClient();

// Auto-load API key on startup
document.addEventListener('DOMContentLoaded', () => {
    window.bielikClient.loadApiKey();
    if (window.bielikClient.isConfigured()) {
        console.log('🇵🇱 Bielik AI ready for Polish children safety responses');
    } else {
        console.log('⚠️ Bielik AI not configured - using fallback responses');
    }
});

console.log('🇵🇱 Bielik Client loaded - zero backend dependencies!');
