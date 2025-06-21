import { AIManager } from '../ai/ai-manager.js';
class BackgroundService {
    state;
    activityLogs = [];
    screenshots = [];
    todos = [];
    aiManager;
    constructor() {
        this.state = {
            isActive: true,
            lastActivity: Date.now(),
            totalInteractions: 0,
            settings: this.getDefaultSettings()
        };
        this.aiManager = AIManager.getInstance();
        this.initializeExtension();
        this.setupEventListeners();
    }
    getDefaultSettings() {
        return {
            aiEnabled: true,
            autoCorrection: false,
            screenshotCapture: true,
            activityTracking: true,
            emailReports: {
                enabled: false,
                frequency: 'weekly',
                includeScreenshots: true,
                includeActivityLog: true,
                includeTodos: true,
                includeWebsites: true,
                recipientEmail: 'qaidinjayce@gmail.com'
            },
            hotkeys: {
                toggleAssistant: 'Ctrl+Shift+A',
                quickSummarize: 'Ctrl+Shift+S',
                grammarCheck: 'Ctrl+Shift+G'
            },
            privacy: {
                dataRetentionDays: 30,
                shareAnalytics: false
            }
        };
    }
    async initializeExtension() {
        console.log('AI Productivity Extension: Initializing...');
        await this.loadStoredData();
        await this.initializeAI();
        this.setupContextMenus();
        console.log('AI Productivity Extension: Ready!');
    }
    async loadStoredData() {
        try {
            const result = await chrome.storage.local.get([
                'settings', 'activityLogs', 'screenshots', 'todos', 'state'
            ]);
            if (result.settings) {
                this.state.settings = { ...this.state.settings, ...result.settings };
            }
            this.activityLogs = result.activityLogs || [];
            this.screenshots = result.screenshots || [];
            this.todos = result.todos || [];
            if (result.state) {
                this.state = { ...this.state, ...result.state };
            }
        }
        catch (error) {
            console.error('Error loading stored data:', error);
        }
    }
    async saveData() {
        try {
            await chrome.storage.local.set({
                settings: this.state.settings,
                activityLogs: this.activityLogs,
                screenshots: this.screenshots,
                todos: this.todos,
                state: this.state
            });
        }
        catch (error) {
            console.error('Error saving data:', error);
        }
    }
    async initializeAI() {
        try {
            console.log('Initializing AI manager...');
            const success = await this.aiManager.initialize();
            const status = this.aiManager.getStatus();
            this.state.currentModel = {
                name: status.model,
                loaded: status.loaded,
                size: status.model === 'GPT-2' ? '500MB' : '< 1MB',
                capabilities: ['text-generation', 'summarization', 'grammar-correction']
            };
            console.log('AI initialization result:', success);
        }
        catch (error) {
            console.error('Error initializing AI:', error);
        }
    }
    setupContextMenus() {
        chrome.contextMenus.removeAll(() => {
            chrome.contextMenus.create({
                id: 'ai-correct-text',
                title: 'AI: Correct Grammar & Style',
                contexts: ['selection']
            });
            chrome.contextMenus.create({
                id: 'ai-summarize-text',
                title: 'AI: Summarize Selection',
                contexts: ['selection']
            });
            chrome.contextMenus.create({
                id: 'ai-capture-screenshot',
                title: 'AI: Capture & Index Screenshot',
                contexts: ['page']
            });
        });
    }
    setupEventListeners() {
        chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
            this.handleMessage(message, sender).then(sendResponse);
            return true;
        });
        chrome.contextMenus.onClicked.addListener((info, tab) => {
            this.handleContextMenuClick(info, tab);
        });
        chrome.commands.onCommand.addListener((command) => {
            this.handleCommand(command);
        });
        chrome.webNavigation.onCompleted.addListener((details) => {
            if (details.frameId === 0 && this.state.settings.activityTracking) {
                this.logActivity({
                    id: this.generateId(),
                    timestamp: Date.now(),
                    type: 'navigation',
                    url: details.url,
                    title: 'Page Navigation'
                });
            }
        });
    }
    async handleMessage(message, sender) {
        this.state.lastActivity = Date.now();
        this.state.totalInteractions++;
        switch (message.type) {
            case 'AI_PROCESS_TEXT':
                return await this.processText(message.payload.text, message.payload.action);
            case 'AI_SUMMARIZE':
                return await this.summarizeText(message.payload.text);
            case 'AI_CORRECT_GRAMMAR':
                return await this.correctGrammar(message.payload.text);
            case 'CAPTURE_SCREENSHOT':
                return await this.captureScreenshot(sender.tab);
            case 'LOG_ACTIVITY':
                return this.logActivity(message.payload);
            case 'SEND_EMAIL_REPORT':
                return await this.sendEmailReport();
            case 'UPDATE_SETTINGS':
                return await this.updateSettings(message.payload);
            case 'GET_STATE':
                return this.getState();
            default:
                return { success: false, error: 'Unknown message type' };
        }
    }
    async handleContextMenuClick(info, tab) {
        if (!tab)
            return;
        switch (info.menuItemId) {
            case 'ai-correct-text':
                if (info.selectionText) {
                    const result = await this.correctGrammar(info.selectionText);
                    await this.sendToContentScript(tab.id, {
                        type: 'AI_CORRECT_GRAMMAR',
                        payload: { original: info.selectionText, corrected: result.result },
                        timestamp: Date.now()
                    });
                }
                break;
            case 'ai-summarize-text':
                if (info.selectionText) {
                    const result = await this.summarizeText(info.selectionText);
                    await this.sendToContentScript(tab.id, {
                        type: 'AI_SUMMARIZE',
                        payload: { original: info.selectionText, summary: result.result },
                        timestamp: Date.now()
                    });
                }
                break;
            case 'ai-capture-screenshot':
                await this.captureScreenshot(tab);
                break;
        }
    }
    async handleCommand(command) {
        const [activeTab] = await chrome.tabs.query({ active: true, currentWindow: true });
        if (!activeTab)
            return;
        switch (command) {
            case 'toggle-assistant':
                await this.sendToContentScript(activeTab.id, {
                    type: 'AI_PROCESS_TEXT',
                    payload: { action: 'toggle' },
                    timestamp: Date.now()
                });
                break;
            case 'quick-summarize':
                await this.sendToContentScript(activeTab.id, {
                    type: 'AI_SUMMARIZE',
                    payload: { action: 'quick' },
                    timestamp: Date.now()
                });
                break;
            case 'grammar-check':
                await this.sendToContentScript(activeTab.id, {
                    type: 'AI_CORRECT_GRAMMAR',
                    payload: { action: 'quick' },
                    timestamp: Date.now()
                });
                break;
        }
    }
    async processText(text, action) {
        try {
            const response = await this.aiManager.enhanceText(text, action);
            return response;
        }
        catch (error) {
            console.error('Error processing text:', error);
            return {
                success: false,
                error: 'Failed to process text',
                processingTime: 0
            };
        }
    }
    async summarizeText(text) {
        try {
            const response = await this.aiManager.summarizeText(text);
            return response;
        }
        catch (error) {
            console.error('Error summarizing text:', error);
            return {
                success: false,
                error: 'Failed to summarize text',
                processingTime: 0
            };
        }
    }
    async correctGrammar(text) {
        try {
            const response = await this.aiManager.correctGrammar(text);
            return response;
        }
        catch (error) {
            console.error('Error correcting grammar:', error);
            return {
                success: false,
                error: 'Failed to correct grammar',
                processingTime: 0
            };
        }
    }
    async captureScreenshot(tab) {
        if (!tab || !this.state.settings.screenshotCapture) {
            return { success: false, error: 'Screenshot capture disabled or no tab' };
        }
        try {
            const dataUrl = await chrome.tabs.captureVisibleTab(tab.windowId, { format: 'png' });
            const screenshot = {
                id: this.generateId(),
                dataUrl,
                timestamp: Date.now(),
                url: tab.url || '',
                title: tab.title || 'Unknown Page',
                tags: []
            };
            this.screenshots.push(screenshot);
            await this.saveData();
            this.logActivity({
                id: this.generateId(),
                timestamp: Date.now(),
                type: 'screenshot',
                url: tab.url,
                title: tab.title,
                metadata: { screenshotId: screenshot.id }
            });
            return { success: true, result: screenshot.id };
        }
        catch (error) {
            console.error('Error capturing screenshot:', error);
            return { success: false, error: 'Failed to capture screenshot' };
        }
    }
    logActivity(activity) {
        if (!this.state.settings.activityTracking)
            return;
        this.activityLogs.push(activity);
        const retentionMs = this.state.settings.privacy.dataRetentionDays * 24 * 60 * 60 * 1000;
        const cutoff = Date.now() - retentionMs;
        this.activityLogs = this.activityLogs.filter(log => log.timestamp > cutoff);
        this.saveData();
        return { success: true };
    }
    async sendEmailReport() {
        try {
            const { EmailReporter } = await import('../utils/email-reporter.js');
            const state = this.getState();
            const report = await EmailReporter.generateReport(state);
            const success = await EmailReporter.sendReport(report, this.state.settings.emailReports.recipientEmail);
            if (success) {
                return { success: true, result: 'Email report generated and opened in default email client' };
            }
            else {
                return { success: false, error: 'Failed to generate email report' };
            }
        }
        catch (error) {
            console.error('Error sending email report:', error);
            return { success: false, error: 'Failed to send email report' };
        }
    }
    generateSimpleReport() {
        const today = new Date().toDateString();
        const todayActivities = this.activityLogs.filter(log => new Date(log.timestamp).toDateString() === today);
        return `Daily Activity Report for ${today}:
- Total interactions: ${this.state.totalInteractions}
- Activities logged: ${todayActivities.length}
- Screenshots captured: ${this.screenshots.length}
- AI model: ${this.state.currentModel?.name || 'Not loaded'}`;
    }
    async updateSettings(newSettings) {
        this.state.settings = { ...this.state.settings, ...newSettings };
        await this.saveData();
        return { success: true };
    }
    getState() {
        return {
            success: true,
            result: {
                ...this.state,
                activityCount: this.activityLogs.length,
                screenshotCount: this.screenshots.length,
                todoCount: this.todos.length
            }
        };
    }
    async sendToContentScript(tabId, message) {
        try {
            await chrome.tabs.sendMessage(tabId, message);
        }
        catch (error) {
            console.error('Error sending message to content script:', error);
        }
    }
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }
}
// Initialize the background service
new BackgroundService();
//# sourceMappingURL=service-worker.js.map