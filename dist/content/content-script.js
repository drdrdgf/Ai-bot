class ContentScriptManager {
    isInitialized = false;
    assistantPanel = null;
    selectedText = '';
    isAssistantVisible = false;
    constructor() {
        this.initialize();
    }
    initialize() {
        if (this.isInitialized)
            return;
        console.log('AI Productivity Extension: Content script initializing...');
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setup());
        }
        else {
            this.setup();
        }
    }
    setup() {
        this.setupEventListeners();
        this.createAssistantPanel();
        this.setupTextSelection();
        this.setupInputFieldEnhancements();
        this.isInitialized = true;
        console.log('AI Productivity Extension: Content script ready!');
    }
    setupEventListeners() {
        // Listen for messages from background script
        chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
            this.handleMessage(message).then(sendResponse);
            return true; // Keep message channel open
        });
        // Listen for keyboard shortcuts
        document.addEventListener('keydown', (event) => {
            this.handleKeyboardShortcut(event);
        });
        // Track text input for activity logging
        document.addEventListener('input', (event) => {
            this.handleTextInput(event);
        });
        // Track page interactions
        document.addEventListener('click', (event) => {
            this.handleClick(event);
        });
    }
    async handleMessage(message) {
        switch (message.type) {
            case 'AI_CORRECT_GRAMMAR':
                return this.handleGrammarCorrection(message.payload);
            case 'AI_SUMMARIZE':
                return this.handleSummarization(message.payload);
            case 'AI_PROCESS_TEXT':
                return this.handleTextProcessing(message.payload);
            default:
                return { success: false, error: 'Unknown message type' };
        }
    }
    handleKeyboardShortcut(event) {
        const isCtrlOrCmd = event.ctrlKey || event.metaKey;
        if (isCtrlOrCmd && event.shiftKey) {
            switch (event.key.toLowerCase()) {
                case 'a':
                    event.preventDefault();
                    this.toggleAssistant();
                    break;
                case 's':
                    event.preventDefault();
                    this.quickSummarize();
                    break;
                case 'g':
                    event.preventDefault();
                    this.quickGrammarCheck();
                    break;
            }
        }
    }
    handleTextInput(event) {
        const target = event.target;
        if (this.isEditableElement(target)) {
            // Log text input activity
            this.sendToBackground({
                type: 'LOG_ACTIVITY',
                payload: {
                    id: this.generateId(),
                    timestamp: Date.now(),
                    type: 'text_input',
                    url: window.location.href,
                    title: document.title,
                    metadata: {
                        elementType: target.tagName.toLowerCase(),
                        elementId: target.id || undefined,
                        elementClass: target.className || undefined
                    }
                },
                timestamp: Date.now()
            });
        }
    }
    handleClick(event) {
        const target = event.target;
        // Hide assistant panel if clicking outside
        if (this.assistantPanel && this.isAssistantVisible &&
            !this.assistantPanel.contains(target)) {
            this.hideAssistant();
        }
    }
    createAssistantPanel() {
        // Create floating assistant panel
        this.assistantPanel = document.createElement('div');
        this.assistantPanel.id = 'ai-productivity-assistant';
        this.assistantPanel.className = 'ai-assistant-panel';
        this.assistantPanel.innerHTML = `
      <div class="ai-assistant-header">
        <span class="ai-assistant-title">AI Assistant</span>
        <button class="ai-assistant-close" id="ai-close-btn">×</button>
      </div>
      <div class="ai-assistant-content">
        <div class="ai-assistant-actions">
          <button class="ai-action-btn" id="ai-correct-btn">Correct Grammar</button>
          <button class="ai-action-btn" id="ai-summarize-btn">Summarize</button>
          <button class="ai-action-btn" id="ai-screenshot-btn">Screenshot</button>
          <button class="ai-action-btn" id="ai-todo-btn">Generate Todo</button>
        </div>
        <div class="ai-assistant-input">
          <textarea id="ai-input-text" placeholder="Enter text or select text on page..."></textarea>
          <button class="ai-process-btn" id="ai-process-btn">Process</button>
        </div>
        <div class="ai-assistant-output" id="ai-output"></div>
      </div>
    `;
        // Add styles
        this.assistantPanel.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      width: 350px;
      max-height: 500px;
      background: white;
      border: 1px solid #ddd;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      z-index: 10000;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      font-size: 14px;
      display: none;
      overflow: hidden;
    `;
        document.body.appendChild(this.assistantPanel);
        this.setupAssistantEventListeners();
    }
    setupAssistantEventListeners() {
        if (!this.assistantPanel)
            return;
        // Close button
        const closeBtn = this.assistantPanel.querySelector('#ai-close-btn');
        closeBtn?.addEventListener('click', () => this.hideAssistant());
        // Action buttons
        const correctBtn = this.assistantPanel.querySelector('#ai-correct-btn');
        correctBtn?.addEventListener('click', () => this.correctSelectedText());
        const summarizeBtn = this.assistantPanel.querySelector('#ai-summarize-btn');
        summarizeBtn?.addEventListener('click', () => this.summarizeSelectedText());
        const screenshotBtn = this.assistantPanel.querySelector('#ai-screenshot-btn');
        screenshotBtn?.addEventListener('click', () => this.captureScreenshot());
        const todoBtn = this.assistantPanel.querySelector('#ai-todo-btn');
        todoBtn?.addEventListener('click', () => this.generateTodo());
        // Process button
        const processBtn = this.assistantPanel.querySelector('#ai-process-btn');
        processBtn?.addEventListener('click', () => this.processInputText());
    }
    setupTextSelection() {
        document.addEventListener('mouseup', () => {
            const selection = window.getSelection();
            if (selection && selection.toString().trim()) {
                this.selectedText = selection.toString().trim();
                this.updateAssistantWithSelection();
            }
        });
    }
    setupInputFieldEnhancements() {
        // Add AI enhancement buttons to input fields
        const inputFields = document.querySelectorAll('input[type="text"], input[type="email"], textarea');
        inputFields.forEach(field => {
            this.enhanceInputField(field);
        });
        // Watch for dynamically added input fields
        const observer = new MutationObserver(mutations => {
            mutations.forEach(mutation => {
                mutation.addedNodes.forEach(node => {
                    if (node.nodeType === Node.ELEMENT_NODE) {
                        const element = node;
                        const inputs = element.querySelectorAll('input[type="text"], input[type="email"], textarea');
                        inputs.forEach(input => this.enhanceInputField(input));
                    }
                });
            });
        });
        observer.observe(document.body, { childList: true, subtree: true });
    }
    enhanceInputField(field) {
        if (field.dataset.aiEnhanced)
            return;
        field.dataset.aiEnhanced = 'true';
        // Add AI enhancement button
        const enhanceBtn = document.createElement('button');
        enhanceBtn.innerHTML = '✨';
        enhanceBtn.className = 'ai-enhance-btn';
        enhanceBtn.title = 'AI Enhance Text';
        enhanceBtn.style.cssText = `
      position: absolute;
      right: 5px;
      top: 50%;
      transform: translateY(-50%);
      background: #4285f4;
      color: white;
      border: none;
      border-radius: 3px;
      width: 24px;
      height: 24px;
      cursor: pointer;
      font-size: 12px;
      z-index: 1000;
    `;
        // Position the field relatively if not already
        const fieldStyle = window.getComputedStyle(field);
        if (fieldStyle.position === 'static') {
            field.style.position = 'relative';
        }
        field.parentElement?.style.setProperty('position', 'relative');
        field.parentElement?.appendChild(enhanceBtn);
        enhanceBtn.addEventListener('click', (e) => {
            e.preventDefault();
            this.enhanceFieldText(field);
        });
    }
    async enhanceFieldText(field) {
        const text = field.value;
        if (!text.trim())
            return;
        try {
            const response = await this.sendToBackground({
                type: 'AI_CORRECT_GRAMMAR',
                payload: { text },
                timestamp: Date.now()
            });
            if (response.success) {
                field.value = response.result;
                this.showNotification('Text enhanced!', 'success');
            }
        }
        catch (error) {
            console.error('Error enhancing text:', error);
            this.showNotification('Error enhancing text', 'error');
        }
    }
    toggleAssistant() {
        if (!this.assistantPanel)
            return;
        if (this.isAssistantVisible) {
            this.hideAssistant();
        }
        else {
            this.showAssistant();
        }
    }
    showAssistant() {
        if (!this.assistantPanel)
            return;
        this.assistantPanel.style.display = 'block';
        this.isAssistantVisible = true;
        this.updateAssistantWithSelection();
    }
    hideAssistant() {
        if (!this.assistantPanel)
            return;
        this.assistantPanel.style.display = 'none';
        this.isAssistantVisible = false;
    }
    updateAssistantWithSelection() {
        if (!this.assistantPanel || !this.isAssistantVisible)
            return;
        const inputText = this.assistantPanel.querySelector('#ai-input-text');
        if (inputText && this.selectedText) {
            inputText.value = this.selectedText;
        }
    }
    async quickSummarize() {
        const text = this.getSelectedTextOrPrompt();
        if (!text)
            return;
        try {
            const response = await this.sendToBackground({
                type: 'AI_SUMMARIZE',
                payload: { text },
                timestamp: Date.now()
            });
            if (response.success) {
                this.showNotification(`Summary: ${response.result}`, 'info');
            }
        }
        catch (error) {
            console.error('Error summarizing:', error);
        }
    }
    async quickGrammarCheck() {
        const text = this.getSelectedTextOrPrompt();
        if (!text)
            return;
        try {
            const response = await this.sendToBackground({
                type: 'AI_CORRECT_GRAMMAR',
                payload: { text },
                timestamp: Date.now()
            });
            if (response.success) {
                this.showNotification(`Corrected: ${response.result}`, 'info');
            }
        }
        catch (error) {
            console.error('Error correcting grammar:', error);
        }
    }
    async correctSelectedText() {
        const text = this.selectedText || this.getInputText();
        if (!text)
            return;
        await this.quickGrammarCheck();
    }
    async summarizeSelectedText() {
        const text = this.selectedText || this.getInputText();
        if (!text)
            return;
        await this.quickSummarize();
    }
    async captureScreenshot() {
        try {
            const response = await this.sendToBackground({
                type: 'CAPTURE_SCREENSHOT',
                payload: {},
                timestamp: Date.now()
            });
            if (response.success) {
                this.showNotification('Screenshot captured!', 'success');
            }
        }
        catch (error) {
            console.error('Error capturing screenshot:', error);
        }
    }
    async generateTodo() {
        const content = document.body.innerText.substring(0, 1000);
        try {
            const response = await this.sendToBackground({
                type: 'GENERATE_TODO',
                payload: {
                    content,
                    context: {
                        url: window.location.href,
                        title: document.title
                    }
                },
                timestamp: Date.now()
            });
            if (response.success) {
                this.showNotification('Todo generated!', 'success');
            }
        }
        catch (error) {
            console.error('Error generating todo:', error);
        }
    }
    async processInputText() {
        const text = this.getInputText();
        if (!text)
            return;
        try {
            const response = await this.sendToBackground({
                type: 'AI_PROCESS_TEXT',
                payload: { text, action: 'general' },
                timestamp: Date.now()
            });
            if (response.success) {
                this.displayOutput(response.result);
            }
        }
        catch (error) {
            console.error('Error processing text:', error);
        }
    }
    async handleGrammarCorrection(payload) {
        if (payload.action === 'quick') {
            await this.quickGrammarCheck();
        }
        else {
            this.displayOutput(`Corrected: ${payload.corrected}`);
        }
        return { success: true };
    }
    async handleSummarization(payload) {
        if (payload.action === 'quick') {
            await this.quickSummarize();
        }
        else {
            this.displayOutput(`Summary: ${payload.summary}`);
        }
        return { success: true };
    }
    async handleTextProcessing(payload) {
        if (payload.action === 'toggle') {
            this.toggleAssistant();
        }
        return { success: true };
    }
    displayOutput(text) {
        if (!this.assistantPanel)
            return;
        const output = this.assistantPanel.querySelector('#ai-output');
        if (output) {
            output.textContent = text;
        }
    }
    getInputText() {
        if (!this.assistantPanel)
            return '';
        const inputText = this.assistantPanel.querySelector('#ai-input-text');
        return inputText?.value || '';
    }
    getSelectedTextOrPrompt() {
        return this.selectedText || prompt('Enter text to process:') || '';
    }
    showNotification(message, type) {
        const notification = document.createElement('div');
        notification.className = `ai-notification ai-notification-${type}`;
        notification.textContent = message;
        notification.style.cssText = `
      position: fixed;
      top: 20px;
      left: 50%;
      transform: translateX(-50%);
      background: ${type === 'success' ? '#4caf50' : type === 'error' ? '#f44336' : '#2196f3'};
      color: white;
      padding: 12px 24px;
      border-radius: 4px;
      z-index: 10001;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      font-size: 14px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.2);
    `;
        document.body.appendChild(notification);
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }
    async sendToBackground(message) {
        return new Promise((resolve) => {
            chrome.runtime.sendMessage(message, resolve);
        });
    }
    isEditableElement(element) {
        return element.tagName === 'INPUT' ||
            element.tagName === 'TEXTAREA' ||
            element.contentEditable === 'true';
    }
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }
}
// Initialize content script
new ContentScriptManager();
export {};
//# sourceMappingURL=content-script.js.map