export class AIManager {
    static instance;
    isInitialized = false;
    isLoading = false;
    engine = null;
    constructor() { }
    static getInstance() {
        if (!AIManager.instance) {
            AIManager.instance = new AIManager();
        }
        return AIManager.instance;
    }
    async initialize() {
        if (this.isInitialized)
            return true;
        if (this.isLoading)
            return false;
        this.isLoading = true;
        try {
            // Use a lightweight approach with transformers.js for basic text processing
            const { pipeline } = await import('@xenova/transformers');
            // Initialize a lightweight text generation model
            console.log('Loading AI model...');
            this.engine = await pipeline('text-generation', 'Xenova/gpt2');
            this.isInitialized = true;
            this.isLoading = false;
            console.log('AI model loaded successfully');
            return true;
        }
        catch (error) {
            console.error('Failed to initialize AI:', error);
            this.isLoading = false;
            // Fallback to rule-based processing
            this.initializeFallback();
            return true;
        }
    }
    initializeFallback() {
        console.log('Using fallback rule-based AI processing');
        this.engine = 'fallback';
        this.isInitialized = true;
    }
    async correctGrammar(text) {
        const startTime = performance.now();
        if (!this.isInitialized) {
            await this.initialize();
        }
        try {
            if (this.engine === 'fallback') {
                const corrected = this.fallbackGrammarCorrection(text);
                return {
                    success: true,
                    result: corrected,
                    processingTime: performance.now() - startTime
                };
            }
            // Use AI model for grammar correction
            const prompt = `Correct the grammar and improve the clarity of this text while keeping the same meaning:\n\n"${text}"\n\nCorrected text:`;
            const result = await this.engine(prompt, {
                max_new_tokens: Math.min(text.length * 2, 100),
                temperature: 0.3,
                do_sample: true
            });
            const corrected = this.extractCorrectedText(result[0].generated_text, prompt);
            return {
                success: true,
                result: corrected,
                processingTime: performance.now() - startTime
            };
        }
        catch (error) {
            console.error('Grammar correction failed:', error);
            return {
                success: false,
                error: 'Failed to correct grammar',
                processingTime: performance.now() - startTime
            };
        }
    }
    async summarizeText(text) {
        const startTime = performance.now();
        if (!this.isInitialized) {
            await this.initialize();
        }
        try {
            if (this.engine === 'fallback') {
                const summary = this.fallbackSummarization(text);
                return {
                    success: true,
                    result: summary,
                    processingTime: performance.now() - startTime
                };
            }
            // Use AI model for summarization
            const prompt = `Summarize this text in 2-3 sentences:\n\n"${text.substring(0, 500)}"\n\nSummary:`;
            const result = await this.engine(prompt, {
                max_new_tokens: 100,
                temperature: 0.5,
                do_sample: true
            });
            const summary = this.extractSummary(result[0].generated_text, prompt);
            return {
                success: true,
                result: summary,
                processingTime: performance.now() - startTime
            };
        }
        catch (error) {
            console.error('Summarization failed:', error);
            return {
                success: false,
                error: 'Failed to summarize text',
                processingTime: performance.now() - startTime
            };
        }
    }
    async enhanceText(text, action) {
        const startTime = performance.now();
        switch (action) {
            case 'grammar':
                return this.correctGrammar(text);
            case 'summarize':
                return this.summarizeText(text);
            case 'improve':
                return this.improveText(text);
            default:
                return this.correctGrammar(text);
        }
    }
    async improveText(text) {
        const startTime = performance.now();
        if (this.engine === 'fallback') {
            const improved = this.fallbackTextImprovement(text);
            return {
                success: true,
                result: improved,
                processingTime: performance.now() - startTime
            };
        }
        try {
            const prompt = `Improve this text to make it more professional and clear:\n\n"${text}"\n\nImproved text:`;
            const result = await this.engine(prompt, {
                max_new_tokens: Math.min(text.length * 1.5, 150),
                temperature: 0.4,
                do_sample: true
            });
            const improved = this.extractImprovedText(result[0].generated_text, prompt);
            return {
                success: true,
                result: improved,
                processingTime: performance.now() - startTime
            };
        }
        catch (error) {
            console.error('Text improvement failed:', error);
            return {
                success: false,
                error: 'Failed to improve text',
                processingTime: performance.now() - startTime
            };
        }
    }
    // Fallback methods using rule-based processing
    fallbackGrammarCorrection(text) {
        let corrected = text;
        // Basic grammar corrections
        corrected = corrected.replace(/\bi\b/g, 'I'); // Capitalize 'i'
        corrected = corrected.replace(/\s+/g, ' '); // Remove extra spaces
        corrected = corrected.replace(/([.!?])\s*([a-z])/g, '$1 $2'.replace('$2', '$2'.toUpperCase())); // Capitalize after punctuation
        corrected = corrected.replace(/([a-z])([.!?])/g, '$1$2'); // Ensure punctuation follows text
        corrected = corrected.trim();
        // Capitalize first letter
        if (corrected.length > 0) {
            corrected = corrected.charAt(0).toUpperCase() + corrected.slice(1);
        }
        return corrected;
    }
    fallbackSummarization(text) {
        // Extract first few sentences as summary
        const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 10);
        const summary = sentences.slice(0, 2).join('. ').trim();
        return summary + (summary.endsWith('.') ? '' : '.');
    }
    fallbackTextImprovement(text) {
        let improved = this.fallbackGrammarCorrection(text);
        // Basic improvements
        improved = improved.replace(/\bvery\s+/gi, ''); // Remove filler words
        improved = improved.replace(/\bkinda\b/gi, 'somewhat');
        improved = improved.replace(/\bgonna\b/gi, 'going to');
        improved = improved.replace(/\bwanna\b/gi, 'want to');
        return improved;
    }
    extractCorrectedText(generated, prompt) {
        const afterPrompt = generated.substring(prompt.length).trim();
        const lines = afterPrompt.split('\n').filter(line => line.trim());
        return lines[0] || generated.substring(prompt.length, prompt.length + 200).trim();
    }
    extractSummary(generated, prompt) {
        const afterPrompt = generated.substring(prompt.length).trim();
        const lines = afterPrompt.split('\n').filter(line => line.trim());
        return lines[0] || afterPrompt.substring(0, 200).trim();
    }
    extractImprovedText(generated, prompt) {
        const afterPrompt = generated.substring(prompt.length).trim();
        const lines = afterPrompt.split('\n').filter(line => line.trim());
        return lines[0] || afterPrompt.substring(0, 300).trim();
    }
    getStatus() {
        return {
            loaded: this.isInitialized,
            loading: this.isLoading,
            model: this.engine === 'fallback' ? 'Rule-based' : 'GPT-2'
        };
    }
}
//# sourceMappingURL=ai-manager.js.map