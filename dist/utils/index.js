// Utility functions for AI Productivity Extension
export class StorageManager {
    static async get(keys) {
        return new Promise((resolve) => {
            chrome.storage.local.get(keys, resolve);
        });
    }
    static async set(data) {
        return new Promise((resolve) => {
            chrome.storage.local.set(data, resolve);
        });
    }
    static async remove(keys) {
        return new Promise((resolve) => {
            chrome.storage.local.remove(keys, resolve);
        });
    }
    static async clear() {
        return new Promise((resolve) => {
            chrome.storage.local.clear(resolve);
        });
    }
}
export class MessageManager {
    static async sendToBackground(message) {
        return new Promise((resolve) => {
            chrome.runtime.sendMessage(message, resolve);
        });
    }
    static async sendToTab(tabId, message) {
        return new Promise((resolve) => {
            chrome.tabs.sendMessage(tabId, message, resolve);
        });
    }
    static async sendToAllTabs(message) {
        const tabs = await chrome.tabs.query({});
        const promises = tabs.map(tab => {
            if (tab.id) {
                return this.sendToTab(tab.id, message).catch(() => {
                    // Ignore errors for tabs that don't have content scripts
                    return null;
                });
            }
            return Promise.resolve(null);
        });
        await Promise.all(promises);
    }
}
export class TabManager {
    static async getCurrentTab() {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        return tab || null;
    }
    static async getAllTabs() {
        return chrome.tabs.query({});
    }
    static async createTab(url) {
        return chrome.tabs.create({ url });
    }
    static async executeScript(tabId, func, args) {
        const result = await chrome.scripting.executeScript({
            target: { tabId },
            func,
            args: args || []
        });
        return result[0]?.result;
    }
}
export class NotificationManager {
    static async create(id, options) {
        return new Promise((resolve) => {
            chrome.notifications.create(id, options, (notificationId) => {
                resolve(notificationId || id);
            });
        });
    }
    static async clear(id) {
        return new Promise((resolve) => {
            chrome.notifications.clear(id, (wasCleared) => {
                resolve(wasCleared);
            });
        });
    }
    static async showSuccess(title, message) {
        await this.create('success-' + Date.now(), {
            type: 'basic',
            iconUrl: chrome.runtime.getURL('assets/icons/icon48.png'),
            title,
            message
        });
    }
    static async showError(title, message) {
        await this.create('error-' + Date.now(), {
            type: 'basic',
            iconUrl: chrome.runtime.getURL('assets/icons/icon48.png'),
            title,
            message
        });
    }
}
export class DateUtils {
    static formatTimestamp(timestamp) {
        const date = new Date(timestamp);
        const now = new Date();
        const diff = now.getTime() - date.getTime();
        // Less than a minute
        if (diff < 60000) {
            return 'Just now';
        }
        // Less than an hour
        if (diff < 3600000) {
            const minutes = Math.floor(diff / 60000);
            return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
        }
        // Less than a day
        if (diff < 86400000) {
            const hours = Math.floor(diff / 3600000);
            return `${hours} hour${hours > 1 ? 's' : ''} ago`;
        }
        // Less than a week
        if (diff < 604800000) {
            const days = Math.floor(diff / 86400000);
            return `${days} day${days > 1 ? 's' : ''} ago`;
        }
        // Format as date
        return date.toLocaleDateString();
    }
    static getDateRange(days) {
        const end = Date.now();
        const start = end - (days * 24 * 60 * 60 * 1000);
        return { start, end };
    }
    static isToday(timestamp) {
        const date = new Date(timestamp);
        const today = new Date();
        return date.toDateString() === today.toDateString();
    }
    static isThisWeek(timestamp) {
        const date = new Date(timestamp);
        const today = new Date();
        const weekStart = new Date(today.setDate(today.getDate() - today.getDay()));
        return date >= weekStart;
    }
}
export class TextUtils {
    static truncate(text, maxLength) {
        if (text.length <= maxLength)
            return text;
        return text.substring(0, maxLength - 3) + '...';
    }
    static extractDomain(url) {
        try {
            return new URL(url).hostname;
        }
        catch {
            return url;
        }
    }
    static sanitizeHtml(html) {
        const div = document.createElement('div');
        div.textContent = html;
        return div.innerHTML;
    }
    static generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }
    static hashString(str) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32-bit integer
        }
        return hash;
    }
}
export class ValidationUtils {
    static isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }
    static isValidUrl(url) {
        try {
            new URL(url);
            return true;
        }
        catch {
            return false;
        }
    }
    static isValidJson(str) {
        try {
            JSON.parse(str);
            return true;
        }
        catch {
            return false;
        }
    }
}
export class PerformanceUtils {
    static async measureTime(fn) {
        const start = performance.now();
        const result = await fn();
        const time = performance.now() - start;
        return { result, time };
    }
    static debounce(func, wait) {
        let timeout;
        return (...args) => {
            clearTimeout(timeout);
            timeout = setTimeout(() => func(...args), wait);
        };
    }
    static throttle(func, limit) {
        let inThrottle;
        return (...args) => {
            if (!inThrottle) {
                func(...args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }
}
export class SecurityUtils {
    static sanitizeInput(input) {
        return input
            .replace(/[<>]/g, '') // Remove potential HTML tags
            .replace(/javascript:/gi, '') // Remove javascript: protocol
            .replace(/on\w+=/gi, '') // Remove event handlers
            .trim();
    }
    static isSecureContext() {
        return window.isSecureContext || location.protocol === 'chrome-extension:';
    }
    static generateSecureId() {
        if (crypto && crypto.randomUUID) {
            return crypto.randomUUID();
        }
        // Fallback for older browsers
        return 'xxxx-xxxx-4xxx-yxxx'.replace(/[xy]/g, (c) => {
            const r = Math.random() * 16 | 0;
            const v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }
}
export class ErrorHandler {
    static log(error, context) {
        console.error(`[AI Extension Error]${context ? ` ${context}:` : ''}`, error);
        // In a production environment, you might want to send errors to a logging service
        // this.sendToLoggingService(error, context);
    }
    static async handleAsync(promise, context) {
        try {
            const result = await promise;
            return [result, null];
        }
        catch (error) {
            this.log(error, context);
            return [null, error];
        }
    }
    static createUserFriendlyMessage(error) {
        // Convert technical errors to user-friendly messages
        const message = error.message.toLowerCase();
        if (message.includes('network')) {
            return 'Network connection issue. Please check your internet connection.';
        }
        if (message.includes('permission')) {
            return 'Permission denied. Please check extension permissions.';
        }
        if (message.includes('storage')) {
            return 'Storage issue. Please try clearing extension data.';
        }
        return 'An unexpected error occurred. Please try again.';
    }
}
// Export all utilities as a single object for convenience
export const Utils = {
    Storage: StorageManager,
    Message: MessageManager,
    Tab: TabManager,
    Notification: NotificationManager,
    Date: DateUtils,
    Text: TextUtils,
    Validation: ValidationUtils,
    Performance: PerformanceUtils,
    Security: SecurityUtils,
    Error: ErrorHandler
};
//# sourceMappingURL=index.js.map