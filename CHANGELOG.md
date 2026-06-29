# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.0.0] - 2026-06-29

### Added
- 🎉 Initial release of Gmail Cleanup tool
- ✨ Automated bulk email deletion via Google Apps Script
- 📊 Interactive spreadsheet interface with three sheets (Senders, Log, Settings)
- 🧪 Dry Run mode for safe testing before deletion
- 📝 Comprehensive logging system
- ⏸️ Pause/resume functionality
- 🔄 Automatic retry with trigger-based scheduling
- ⚙️ Configurable settings (batch size, daily limit)
- 📋 CSV import with guided setup
- ✅ Setup validation and testing
- 🎯 Status tracking for each sender
- 📊 Real-time progress monitoring
- 🔒 Safe deletion (trash, not permanent)
- 📈 Quota-aware processing (respects Gmail limits)
- 🎨 Professional sheet formatting
- 📖 Comprehensive documentation
  - Installation guide
  - Usage guide
  - Architecture documentation
  - Troubleshooting guide
  - FAQ section
- 🔄 Automatic sheet creation and setup
- 📦 Sample CSV file included
- 🤝 Contributing guidelines
- 📄 MIT License

### Features

#### Core Functionality
- Batch processing of email deletions
- Support for checking/unchecking individual senders
- Real-time status updates
- Detailed activity logging
- Error handling and recovery
- Daily quota tracking
- Runtime limit management

#### User Interface
- Custom "Gmail Cleanup" menu
- Intuitive setup workflow
- Clear status indicators
- Color-coded sheets
- Frozen headers for easy navigation
- Checkbox interface for sender selection

#### Automation
- Time-based triggers (every 5 minutes)
- Automatic resume on timeout
- Daily quota reset
- Progress persistence

#### Safety Features
- Dry Run mode (preview only)
- Confirmation dialogs
- Trash (not permanent delete)
- 30-day recovery window
- Comprehensive logging
- Test setup validation

### Configuration
- Batch Size: 50 emails (configurable)
- Daily Limit: 18,000 emails (configurable)
- Runtime Limit: 4 minutes per execution
- Trigger Interval: 5 minutes
- Sleep Between Batches: 2 seconds

### Performance
- Processing Rate: ~33 emails/minute
- Hourly Throughput: ~1,200 emails (automated)
- Daily Capacity: 18,000 emails (Gmail limit)

### Documentation
- README with quick start and comprehensive guides
- Installation guide with step-by-step instructions
- Usage guide with examples and best practices
- Architecture documentation with diagrams
- Troubleshooting guide with common solutions
- Contributing guidelines
- Sample CSV file

### Technical
- Google Apps Script (JavaScript)
- Gmail API integration
- Google Sheets for data storage
- Trigger-based automation
- Mermaid diagrams for visualization
- Modular code structure
- Comprehensive error handling

---

## [Unreleased]

### Planned Features
- [ ] Multi-label support
- [ ] Advanced search filters (date range, subject patterns)
- [ ] Email export before deletion
- [ ] Statistics dashboard
- [ ] Visual progress charts
- [ ] Deletion history
- [ ] Storage savings calculator
- [ ] Scheduled automatic cleanups
- [ ] Multiple account support
- [ ] Browser extension
- [ ] Mobile app support

### Known Issues
- None reported yet

---

## Version History

### Version Numbering

We use Semantic Versioning (MAJOR.MINOR.PATCH):
- **MAJOR**: Incompatible API changes
- **MINOR**: New features (backwards compatible)
- **PATCH**: Bug fixes (backwards compatible)

### Release Cadence

- **Major releases**: As needed for breaking changes
- **Minor releases**: Monthly with new features
- **Patch releases**: As needed for bug fixes

---

## How to Upgrade

### From Initial Install

No upgrade needed - this is the first release!

### Future Upgrades

1. **Check for updates**
   - Watch GitHub repository for new releases
   - Check CHANGELOG for new features

2. **Backup your data**
   - Export Senders sheet to CSV
   - Save Settings configuration

3. **Update script**
   - Open Apps Script editor
   - Copy new Code.gs contents
   - Paste and save
   - Re-authorize if needed

4. **Test after upgrade**
   - Run: Gmail Cleanup → Test Setup
   - Verify with Dry Run

---

## Migration Guide

### Version 1.0.0 (Initial Release)

**Fresh Installation:**
- Follow [Installation Guide](docs/INSTALLATION.md)
- Import your sender CSV
- Run setup and test

**No migration needed** - this is the first version!

---

## Release Notes

### v1.0.0 - "Magic Cleanup" 🎉

**Release Date:** 2026-06-29

This is the initial public release of Gmail Cleanup, a powerful tool that works like magic to clean up your Gmail inbox!

**Highlights:**
- ✨ Fully automated bulk email deletion
- 🧪 Safe Dry Run mode for testing
- 📊 Beautiful spreadsheet interface
- 🔄 Smart auto-resume on timeout
- 📝 Comprehensive documentation

**What You Can Do:**
- Delete thousands of emails automatically
- Clean up newsletters, promotions, notifications
- Preview before deleting (Dry Run)
- Monitor progress in real-time
- Pause and resume anytime
- Recover from trash within 30 days

**Getting Started:**
1. Create Google Sheet
2. Add Apps Script (Extensions → Apps Script)
3. Paste Code.gs
4. Run setup
5. Import senders CSV
6. Test with Dry Run
7. Start deletion!

**Time to Clean Inbox:** 15 minutes setup + automated deletion

**Documentation:**
- [README](README.md) - Overview and quick start
- [Installation Guide](docs/INSTALLATION.md) - Step-by-step setup
- [Usage Guide](docs/USAGE.md) - How to use all features
- [Architecture](docs/ARCHITECTURE.md) - Technical details
- [Troubleshooting](docs/TROUBLESHOOTING.md) - Common issues

**Performance:**
- ✅ Processes ~33 emails/minute
- ✅ Handles 18,000 emails/day
- ✅ Runs automatically in background
- ✅ Works while browser closed

**Safety:**
- ✅ Dry Run mode (no deletion)
- ✅ Confirmation dialogs
- ✅ Emails to trash (recoverable)
- ✅ Detailed logging
- ✅ Test setup validation

**Community:**
- Report bugs: GitHub Issues
- Ask questions: GitHub Discussions
- Contribute: See CONTRIBUTING.md

**License:** MIT

**Special Thanks:**
To everyone who needs to clean up thousands of unwanted emails!

---

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for how to:
- Report bugs
- Suggest features
- Submit pull requests
- Improve documentation

---

## Support

- **Documentation**: [docs/](docs/)
- **Issues**: [GitHub Issues](https://github.com/yourusername/gmail-cleanup/issues)
- **Discussions**: [GitHub Discussions](https://github.com/yourusername/gmail-cleanup/discussions)

---

<p align="center">
Made with ❤️ for email productivity
</p>
