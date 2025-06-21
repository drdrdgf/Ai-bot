class PopupManager {
    elements = {};
    constructor() {
        this.initializeElements();
        this.setupEventListeners();
        this.loadInitialData();
    }
    initializeElements() {
        // Get all important DOM elements
        this.elements = {
            statusIndicator: document.getElementById('status-indicator'),
            toggleAssistant: document.getElementById('toggle-assistant'),
            captureScreenshot: document.getElementById('capture-screenshot'),
            summarizePage: document.getElementById('summarize-page'),
            generateTodo: document.getElementById('generate-todo'),
            modelStatus: document.getElementById('model-status'),
            loadingIndicator: document.getElementById('loading-indicator'),
            loadModel: document.getElementById('load-model'),
            interactionsCount: document.getElementById('interactions-count'),
            screenshotsCount: document.getElementById('screenshots-count'),
            todosCount: document.getElementById('todos-count'),
            correctionsCount: document.getElementById('corrections-count'),
            activityList: document.getElementById('activity-list'),
            reportStatus: document.getElementById('report-status'),
            toggleReports: document.getElementById('toggle-reports'),
            sendReport: document.getElementById('send-report'),
            openDashboard: document.getElementById('open-dashboard'),
            openSettings: document.getElementById('open-settings'),
            openHelp: document.getElementById('open-help')
        };
    }
    setupEventListeners() {
        // Quick Actions
        this.elements.toggleAssistant.addEventListener('click', () => {
            this.toggleAssistant();
        });
        this.elements.captureScreenshot.addEventListener('click', () => {
            this.captureScreenshot();
        });
        this.elements.summarizePage.addEventListener('click', () => {
            this.summarizePage();
        });
        this.elements.generateTodo.addEventListener('click', () => {
            this.generateTodo();
        });
        // AI Model
        this.elements.loadModel.addEventListener('click', () => {
            this.loadAIModel();
        });
        // Email Reports
        this.elements.toggleReports.addEventListener('click', () => {
            this.toggleEmailReports();
        });
        this.elements.sendReport.addEventListener('click', () => {
            this.sendEmailReport();
        });
        // Footer Actions
        this.elements.openDashboard.addEventListener('click', () => {
            this.openDashboard();
        });
        this.elements.openSettings.addEventListener('click', () => {
            this.openSettings();
        });
        this.elements.openHelp.addEventListener('click', () => {
            this.openHelp();
        });
    }
    async loadInitialData() {
        try {
            // Get current state from background script
            const response = await this.sendMessage({
                type: 'GET_STATE',
                timestamp: Date.now()
            });
            if (response.success) {
                this.updateUI(response.result);
            }
        }
        catch (error) {
            console.error('Error loading initial data:', error);
            this.showError('Failed to load extension data');
        }
    }
    updateUI(state) {
        // Update status indicator
        this.updateStatusIndicator(state.isActive);
        // Update statistics
        this.elements.interactionsCount.textContent = state.totalInteractions.toString();
        this.elements.screenshotsCount.textContent = state.screenshotCount.toString();
        this.elements.todosCount.textContent = state.todoCount.toString();
        this.elements.correctionsCount.textContent = '0'; // Will be implemented
        // Update AI model status
        this.updateModelStatus(state.currentModel);
        // Update email reports status
        this.updateEmailReportsStatus(state.settings.emailReports);
        // Update recent activity
        this.updateRecentActivity(state.activityCount);
    }
    updateStatusIndicator(isActive) {
        const statusDot = this.elements.statusIndicator.querySelector('.status-dot');
        const statusText = this.elements.statusIndicator.querySelector('.status-text');
        if (isActive) {
            statusDot.style.background = '#4caf50';
            statusText.textContent = 'Ready';
        }
        else {
            statusDot.style.background = '#f44336';
            statusText.textContent = 'Inactive';
        }
    }
    updateModelStatus(model) {
        const modelName = this.elements.modelStatus.querySelector('.model-name');
        const modelSize = this.elements.modelStatus.querySelector('.model-size');
        const loadBtn = this.elements.loadModel;
        if (model) {
            modelName.textContent = model.name;
            modelSize.textContent = model.size;
            if (model.loaded) {
                loadBtn.textContent = 'Loaded';
                loadBtn.disabled = true;
                loadBtn.style.background = '#4caf50';
            }
            else {
                loadBtn.textContent = 'Load Model';
                loadBtn.disabled = false;
                loadBtn.style.background = '#667eea';
            }
        }
    }
    updateEmailReportsStatus(emailSettings) {
        const reportText = this.elements.reportStatus.querySelector('.report-text');
        const toggleBtn = this.elements.toggleReports;
        if (emailSettings.enabled) {
            reportText.textContent = `${emailSettings.frequency} reports enabled`;
            toggleBtn.textContent = 'Disable';
            toggleBtn.classList.add('disabled');
        }
        else {
            reportText.textContent = `${emailSettings.frequency} reports disabled`;
            toggleBtn.textContent = 'Enable';
            toggleBtn.classList.remove('disabled');
        }
    }
    updateRecentActivity(activityCount) {
        // This is a placeholder - in a real implementation, you'd show actual recent activities
        if (activityCount === 0) {
            this.elements.activityList.innerHTML = `
        <div class="activity-item">
          <span class="activity-icon">💡</span>
          <div class="activity-content">
            <span class="activity-text">No recent activity</span>
            <span class="activity-time">Start using the AI assistant!</span>
          </div>
        </div>
      `;
        }
    }
    async toggleAssistant() {
        try {
            const [activeTab] = await chrome.tabs.query({ active: true, currentWindow: true });
            if (!activeTab.id)
                return;
            await chrome.tabs.sendMessage(activeTab.id, {
                type: 'AI_PROCESS_TEXT',
                payload: { action: 'toggle' },
                timestamp: Date.now()
            });
            this.showSuccess('Assistant toggled');
            window.close();
        }
        catch (error) {
            console.error('Error toggling assistant:', error);
            this.showError('Failed to toggle assistant');
        }
    }
    async captureScreenshot() {
        try {
            const response = await this.sendMessage({
                type: 'CAPTURE_SCREENSHOT',
                payload: {},
                timestamp: Date.now()
            });
            if (response.success) {
                this.showSuccess('Screenshot captured!');
                // Update screenshot count
                const currentCount = parseInt(this.elements.screenshotsCount.textContent || '0');
                this.elements.screenshotsCount.textContent = (currentCount + 1).toString();
            }
            else {
                this.showError(response.error || 'Failed to capture screenshot');
            }
        }
        catch (error) {
            console.error('Error capturing screenshot:', error);
            this.showError('Failed to capture screenshot');
        }
    }
    async summarizePage() {
        try {
            const [activeTab] = await chrome.tabs.query({ active: true, currentWindow: true });
            if (!activeTab.id)
                return;
            // Get page content
            const result = await chrome.scripting.executeScript({
                target: { tabId: activeTab.id },
                func: () => document.body.innerText.substring(0, 2000)
            });
            const pageContent = result[0]?.result || '';
            const response = await this.sendMessage({
                type: 'AI_SUMMARIZE',
                payload: { text: pageContent },
                timestamp: Date.now()
            });
            if (response.success) {
                this.showSuccess('Page summarized!');
                // You could show the summary in a notification or modal
            }
            else {
                this.showError(response.error || 'Failed to summarize page');
            }
        }
        catch (error) {
            console.error('Error summarizing page:', error);
            this.showError('Failed to summarize page');
        }
    }
    async generateTodo() {
        try {
            const [activeTab] = await chrome.tabs.query({ active: true, currentWindow: true });
            if (!activeTab.id)
                return;
            const response = await this.sendMessage({
                type: 'GENERATE_TODO',
                payload: {
                    content: 'Page content placeholder',
                    context: {
                        url: activeTab.url,
                        title: activeTab.title
                    }
                },
                timestamp: Date.now()
            });
            if (response.success) {
                this.showSuccess('Todo generated!');
                // Update todo count
                const currentCount = parseInt(this.elements.todosCount.textContent || '0');
                this.elements.todosCount.textContent = (currentCount + 1).toString();
            }
            else {
                this.showError(response.error || 'Failed to generate todo');
            }
        }
        catch (error) {
            console.error('Error generating todo:', error);
            this.showError('Failed to generate todo');
        }
    }
    async loadAIModel() {
        const loadBtn = this.elements.loadModel;
        const loadingIndicator = this.elements.loadingIndicator;
        try {
            loadBtn.disabled = true;
            loadBtn.textContent = 'Loading...';
            loadingIndicator.classList.add('active');
            // Simulate model loading (will be implemented in phase 2)
            await new Promise(resolve => setTimeout(resolve, 2000));
            loadBtn.textContent = 'Loaded';
            loadBtn.style.background = '#4caf50';
            loadingIndicator.classList.remove('active');
            this.showSuccess('AI model loaded successfully!');
        }
        catch (error) {
            console.error('Error loading AI model:', error);
            loadBtn.disabled = false;
            loadBtn.textContent = 'Load Model';
            loadBtn.style.background = '#667eea';
            loadingIndicator.classList.remove('active');
            this.showError('Failed to load AI model');
        }
    }
    async toggleEmailReports() {
        try {
            const toggleBtn = this.elements.toggleReports;
            const isCurrentlyEnabled = toggleBtn.classList.contains('disabled');
            const response = await this.sendMessage({
                type: 'UPDATE_SETTINGS',
                payload: {
                    emailReports: {
                        enabled: !isCurrentlyEnabled
                    }
                },
                timestamp: Date.now()
            });
            if (response.success) {
                // Update UI
                const reportText = this.elements.reportStatus.querySelector('.report-text');
                if (!isCurrentlyEnabled) {
                    reportText.textContent = 'Weekly reports enabled';
                    toggleBtn.textContent = 'Disable';
                    toggleBtn.classList.add('disabled');
                    this.showSuccess('Email reports enabled');
                }
                else {
                    reportText.textContent = 'Weekly reports disabled';
                    toggleBtn.textContent = 'Enable';
                    toggleBtn.classList.remove('disabled');
                    this.showSuccess('Email reports disabled');
                }
            }
            else {
                this.showError(response.error || 'Failed to update settings');
            }
        }
        catch (error) {
            console.error('Error toggling email reports:', error);
            this.showError('Failed to toggle email reports');
        }
    }
    async sendEmailReport() {
        try {
            const sendBtn = this.elements.sendReport;
            const originalText = sendBtn.textContent;
            sendBtn.disabled = true;
            sendBtn.textContent = 'Sending...';
            const response = await this.sendMessage({
                type: 'SEND_EMAIL_REPORT',
                payload: {},
                timestamp: Date.now()
            });
            if (response.success) {
                this.showSuccess('Email report sent!');
            }
            else {
                this.showError(response.error || 'Failed to send email report');
            }
            sendBtn.disabled = false;
            sendBtn.textContent = originalText;
        }
        catch (error) {
            console.error('Error sending email report:', error);
            this.showError('Failed to send email report');
        }
    }
    async openDashboard() {
        try {
            const dashboardUrl = chrome.runtime.getURL('src/dashboard/dashboard.html');
            await chrome.tabs.create({ url: dashboardUrl });
            window.close();
        }
        catch (error) {
            console.error('Error opening dashboard:', error);
            this.showError('Failed to open dashboard');
        }
    }
    async openSettings() {
        try {
            // For now, we'll open the Chrome extension settings page
            await chrome.tabs.create({ url: 'chrome://extensions/' });
            window.close();
        }
        catch (error) {
            console.error('Error opening settings:', error);
            this.showError('Failed to open settings');
        }
    }
    async openHelp() {
        try {
            // Open help documentation (placeholder URL)
            await chrome.tabs.create({ url: 'https://github.com/your-repo/ai-productivity-extension#readme' });
            window.close();
        }
        catch (error) {
            console.error('Error opening help:', error);
            this.showError('Failed to open help');
        }
    }
    async sendMessage(message) {
        return new Promise((resolve) => {
            chrome.runtime.sendMessage(message, resolve);
        });
    }
    showSuccess(message) {
        this.showNotification(message, 'success');
    }
    showError(message) {
        this.showNotification(message, 'error');
    }
    showNotification(message, type) {
        // Create a simple notification system for the popup
        const notification = document.createElement('div');
        notification.className = `popup-notification popup-notification-${type}`;
        notification.textContent = message;
        notification.style.cssText = `
      position: fixed;
      top: 10px;
      left: 10px;
      right: 10px;
      background: ${type === 'success' ? '#4caf50' : '#f44336'};
      color: white;
      padding: 8px 12px;
      border-radius: 4px;
      font-size: 12px;
      z-index: 1000;
      animation: slideIn 0.3s ease;
    `;
        document.body.appendChild(notification);
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }
}
// Initialize popup when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new PopupManager();
});
// Add CSS animation for notifications
const style = document.createElement('style');
style.textContent = `
  @keyframes slideIn {
    from {
      transform: translateY(-100%);
      opacity: 0;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  }
`;
document.head.appendChild(style);
export {};
//# sourceMappingURL=popup-script.js.map