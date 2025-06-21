# AI Productivity Assistant Chrome Extension

A powerful Chrome extension that integrates on-device AI to boost productivity and assist with digital workflows. Features smart text processing, activity tracking, screenshot indexing, and automated email reporting.

## 🚀 Features

### Core AI Capabilities
- **On-Device AI Processing**: Privacy-first AI that runs locally using WebLLM
- **Smart Text Correction**: Grammar, tone, and clarity improvements across any input field
- **Contextual Summarization**: Intelligent summarization of selected text or entire web content
- **Screenshot Capture & Indexing**: Visual history tracking with AI-powered organization

### Productivity Enhancement
- **Workflow Tracking**: Automatic monitoring of user activities and digital workflows
- **Smart Todo Generation**: AI-generated tasks based on page content and user behavior
- **Activity Analytics**: Comprehensive insights into productivity patterns
- **Cross-Platform Integration**: Works seamlessly with Gmail, Google Docs, Slack, Notion, and more

### Email Reporting System
- **AI-Composed Activity Reports**: Daily or weekly summaries of user activities
- **Customizable Content**: Full control over what information is included in reports
- **Privacy Controls**: User permission required for all external communications
- **Email Integration**: Secure sending via Gmail API with OAuth2 authentication

### User Interface
- **Floating Assistant Panel**: Accessible AI interface on any webpage
- **Popup Dashboard**: Quick access to features and statistics
- **Keyboard Shortcuts**: Customizable hotkeys for rapid AI assistance
- **Responsive Design**: Works on both desktop and mobile browsers

## 🛠️ Installation

### Prerequisites
- Chrome browser (version 88 or higher)
- Node.js (version 16 or higher)
- TypeScript compiler

### Development Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd ai-productivity-extension
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Build the extension**
   ```bash
   npm run build
   ```

4. **Load in Chrome**
   - Open Chrome and navigate to `chrome://extensions/`
   - Enable "Developer mode" in the top right
   - Click "Load unpacked" and select the `dist` folder

### Production Installation
1. Download the latest release from the Chrome Web Store (coming soon)
2. Click "Add to Chrome" and follow the installation prompts

## 🔧 Configuration

### Initial Setup
1. Click the extension icon in your Chrome toolbar
2. Grant necessary permissions when prompted
3. Load the AI model (first-time setup may take a few minutes)
4. Configure your preferences in the settings panel

### Email Reports Setup
1. Open the extension popup
2. Navigate to Email Reports section
3. Click "Enable" to activate weekly reports
4. Grant Gmail API permissions when prompted
5. Configure report content preferences

### Keyboard Shortcuts
- `Ctrl+Shift+A` (Cmd+Shift+A on Mac): Toggle AI assistant
- `Ctrl+Shift+S` (Cmd+Shift+S on Mac): Quick summarize selected text
- `Ctrl+Shift+G` (Cmd+Shift+G on Mac): Grammar check selected text

## 📖 Usage Guide

### Text Enhancement
1. Select any text on a webpage
2. Right-click and choose "AI: Correct Grammar & Style"
3. Or use the keyboard shortcut `Ctrl+Shift+G`
4. The corrected text will be displayed in a notification

### Page Summarization
1. Navigate to any webpage
2. Use `Ctrl+Shift+S` or right-click and select "AI: Summarize Selection"
3. View the summary in the AI assistant panel

### Screenshot Capture
1. Right-click on any page and select "AI: Capture & Index Screenshot"
2. Screenshots are automatically indexed and searchable
3. View captured screenshots in the dashboard

### Activity Tracking
- Activities are automatically tracked when enabled
- View daily statistics in the extension popup
- Access detailed analytics in the dashboard

### Email Reports
1. Enable email reports in the extension popup
2. Choose between daily or weekly frequency
3. Customize what content to include
4. Reports are automatically generated and sent to the configured email

## 🔒 Privacy & Security

### Data Protection
- All AI processing happens locally on your device
- No personal data is sent to external servers without explicit permission
- Screenshots and activity logs are stored locally in Chrome's secure storage
- Email reports require explicit user approval before sending

### Permissions Explained
- **Storage**: Save settings and activity data locally
- **Active Tab**: Access current page content for AI processing
- **Scripting**: Inject AI assistant interface into web pages
- **Desktop Capture**: Take screenshots for indexing
- **Identity**: OAuth authentication for Gmail API (optional)

### Data Retention
- Activity logs are automatically cleaned based on retention settings (default: 30 days)
- Users can manually clear all data at any time
- Screenshots can be individually deleted or bulk removed

## 🛠️ Development

### Project Structure
```
ai-productivity-extension/
├── src/
│   ├── background/          # Service worker and background scripts
│   ├── content/            # Content scripts injected into web pages
│   ├── popup/              # Extension popup interface
│   ├── dashboard/          # Full dashboard interface
│   ├── ai/                 # AI model integration and processing
│   ├── utils/              # Shared utility functions
│   └── types/              # TypeScript type definitions
├── assets/                 # Icons and static assets
├── dist/                   # Built extension files
└── docs/                   # Documentation
```

### Build Commands
- `npm run build`: Build the extension for production
- `npm run watch`: Watch for changes and rebuild automatically
- `npm run dev`: Development mode with hot reloading
- `npm run clean`: Clean build artifacts

### Contributing
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📋 Roadmap

### Phase 1: Foundation ✅
- [x] Chrome extension setup with Manifest V3
- [x] Basic UI components (popup, content script)
- [x] TypeScript configuration and build system
- [x] Core extension architecture

### Phase 2: AI Integration (In Progress)
- [ ] WebLLM integration for on-device AI
- [ ] Text processing and correction algorithms
- [ ] Summarization capabilities
- [ ] Model loading and optimization

### Phase 3: Smart Features
- [ ] Advanced screenshot indexing
- [ ] Workflow pattern recognition
- [ ] Smart todo generation
- [ ] Cross-platform integrations

### Phase 4: Dashboard & Analytics
- [ ] Comprehensive dashboard interface
- [ ] Activity analytics and insights
- [ ] Productivity metrics
- [ ] Data visualization

### Phase 5: Email System
- [ ] Gmail API integration
- [ ] Report generation engine
- [ ] User permission controls
- [ ] Email template customization

### Phase 6: Advanced Features
- [ ] Voice command support
- [ ] Meeting recap from audio
- [ ] Auto-backtracking to lost work
- [ ] Advanced privacy controls

## 🐛 Troubleshooting

### Common Issues

**Extension not loading**
- Ensure you're using Chrome 88 or higher
- Check that Developer mode is enabled
- Verify all files are present in the dist folder

**AI model not loading**
- Check your internet connection for initial download
- Ensure sufficient disk space (3GB+ recommended)
- Try reloading the extension

**Permissions denied**
- Review and grant all requested permissions
- Check Chrome's site settings for the extension
- Restart Chrome if permissions seem stuck

**Email reports not working**
- Verify Gmail API credentials are configured
- Check OAuth2 authentication status
- Ensure email permissions are granted

### Getting Help
- Check the [Issues](https://github.com/your-repo/issues) page for known problems
- Create a new issue with detailed error information
- Join our [Discord community](https://discord.gg/your-server) for support

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [WebLLM](https://github.com/mlc-ai/web-llm) for on-device AI capabilities
- [Chrome Extensions API](https://developer.chrome.com/docs/extensions/) documentation
- The open-source community for inspiration and contributions

## 📞 Contact

- **Email**: support@ai-productivity-extension.com
- **GitHub**: [your-username](https://github.com/your-username)
- **Discord**: [Join our community](https://discord.gg/your-server)

---

**Made with ❤️ for productivity enthusiasts**

