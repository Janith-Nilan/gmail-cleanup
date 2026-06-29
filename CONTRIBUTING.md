# Contributing to Gmail Cleanup

Thank you for your interest in contributing! This document provides guidelines for contributing to the project.

---

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [How to Contribute](#how-to-contribute)
- [Development Setup](#development-setup)
- [Coding Standards](#coding-standards)
- [Pull Request Process](#pull-request-process)
- [Reporting Bugs](#reporting-bugs)
- [Suggesting Features](#suggesting-features)

---

## Code of Conduct

### Our Pledge

We are committed to providing a welcoming and inspiring community for all.

### Expected Behavior

- ✅ Be respectful and inclusive
- ✅ Welcome newcomers warmly
- ✅ Provide constructive feedback
- ✅ Focus on what is best for the community

### Unacceptable Behavior

- ❌ Harassment or discrimination
- ❌ Trolling or insulting comments
- ❌ Personal or political attacks
- ❌ Publishing others' private information

---

## How to Contribute

### Ways to Contribute

1. **Report bugs** - Found an issue? Let us know!
2. **Suggest features** - Have an idea? Share it!
3. **Improve documentation** - Clarify or expand docs
4. **Fix bugs** - Submit a fix for known issues
5. **Add features** - Implement new functionality
6. **Test** - Help test new releases

### First Time Contributors

Look for issues labeled:
- `good first issue` - Easy for beginners
- `help wanted` - We need help with these
- `documentation` - Doc improvements needed

---

## Development Setup

### Prerequisites

- Google Account
- Text editor or IDE
- Git installed
- Basic JavaScript knowledge

### Local Setup

1. **Fork the repository**
   ```bash
   # Click "Fork" on GitHub
   ```

2. **Clone your fork**
   ```bash
   git clone https://github.com/YOUR_USERNAME/gmail-cleanup.git
   cd gmail-cleanup
   ```

3. **Create a branch**
   ```bash
   git checkout -b feature-name
   ```

4. **Make changes**
   - Edit `Code.gs`
   - Update documentation
   - Add tests if applicable

5. **Test your changes**
   - Create test Google Sheet
   - Copy modified script
   - Test thoroughly

---

## Coding Standards

### JavaScript Style

```javascript
// Use const/let, not var
const CONFIG = {
  BATCH_SIZE: 50
};

// Descriptive function names
function getCheckedSenders() {
  // ...
}

// JSDoc comments for functions
/**
 * Process emails for deletion
 * @param {Array} senders - List of sender objects
 * @returns {number} Number of emails processed
 */
function processEmails(senders) {
  // ...
}

// Error handling
try {
  // risky operation
} catch (error) {
  logMessage('ERROR', 'FUNCTION', error.toString(), 0);
}
```

### Code Organization

- Keep functions focused and single-purpose
- Use clear, descriptive names
- Add comments for complex logic
- Follow existing patterns
- Maintain consistent indentation (2 spaces)

### Documentation

- Update README.md for user-facing changes
- Update relevant docs in `docs/`
- Add JSDoc comments to new functions
- Include examples for new features

---

## Pull Request Process

### Before Submitting

- [ ] Test your changes thoroughly
- [ ] Update documentation
- [ ] Follow coding standards
- [ ] Write clear commit messages
- [ ] Ensure no sensitive data included

### Commit Messages

Use clear, descriptive commit messages:

```
Good:
- "Add pause/resume functionality"
- "Fix authorization error handling"
- "Update installation documentation"

Bad:
- "Update code"
- "Fix stuff"
- "Changes"
```

### PR Submission

1. **Push to your fork**
   ```bash
   git push origin feature-name
   ```

2. **Create Pull Request**
   - Go to original repository
   - Click "New Pull Request"
   - Select your branch
   - Fill out PR template

3. **PR Title Format**
   ```
   [Type] Brief description
   
   Types: Feature, Fix, Docs, Refactor, Test
   Example: [Feature] Add multi-label support
   ```

4. **PR Description**
   ```markdown
   ## What
   Describe the changes
   
   ## Why
   Explain the motivation
   
   ## How
   Explain the approach
   
   ## Testing
   How you tested this
   
   ## Screenshots
   If applicable
   ```

### Review Process

1. Maintainers will review your PR
2. Address any feedback
3. PR will be merged when approved
4. Squash commits if needed

---

## Reporting Bugs

### Before Reporting

- Check existing issues
- Try latest version
- Test in clean environment
- Gather debug information

### Bug Report Template

```markdown
**Describe the bug**
Clear description of the issue

**To Reproduce**
Steps to reproduce:
1. Go to '...'
2. Click on '...'
3. See error

**Expected behavior**
What should happen

**Actual behavior**
What actually happens

**Screenshots**
If applicable

**Environment**
- Browser: [e.g., Chrome 120]
- OS: [e.g., macOS 14]
- Script version: [e.g., 1.0.0]

**Logs**
Relevant error messages from:
- Apps Script execution log
- Browser console
- Sheet Log tab

**Additional context**
Any other information
```

---

## Suggesting Features

### Feature Request Template

```markdown
**Feature description**
Clear description of the feature

**Problem it solves**
What problem does this address?

**Proposed solution**
How should it work?

**Alternatives considered**
Other approaches you've thought about

**Additional context**
Mockups, examples, etc.
```

### Feature Evaluation

We consider:
- ✅ Value to users
- ✅ Complexity to implement
- ✅ Maintenance burden
- ✅ Alignment with project goals
- ✅ Performance impact

---

## Testing Guidelines

### Manual Testing

Test checklist for changes:

- [ ] Installation works from scratch
- [ ] Existing features still work
- [ ] New feature works as expected
- [ ] Error handling works
- [ ] UI is intuitive
- [ ] Documentation is accurate

### Test Scenarios

For email deletion features:

1. **Dry Run Test**
   - No actual deletion
   - Counts are accurate
   - Log entries correct

2. **Small Batch Test**
   - 5-10 senders
   - Monitor completion
   - Verify in Gmail

3. **Large Batch Test**
   - 100+ senders
   - Runs overnight
   - No errors

4. **Edge Cases**
   - Empty sender list
   - Invalid email format
   - No emails found
   - API errors

---

## Documentation Standards

### Documentation Structure

```
docs/
├── INSTALLATION.md    # Installation guide
├── USAGE.md          # Usage instructions
├── TROUBLESHOOTING.md # Common issues
├── ARCHITECTURE.md   # Technical docs
└── images/           # Screenshots
```

### Writing Style

- ✅ Clear and concise
- ✅ Step-by-step instructions
- ✅ Include examples
- ✅ Use screenshots
- ✅ Test all instructions
- ✅ Keep up to date

### Markdown Guidelines

```markdown
# H1 - Main title
## H2 - Major sections
### H3 - Subsections

**Bold** for emphasis
`code` for inline code
```code blocks``` for multi-line

- Unordered lists
1. Ordered lists

[Links](url)
![Images](path)
```

---

## Questions?

- Open an issue with `question` label
- Check existing documentation
- Ask in discussions

---

## Recognition

Contributors will be:
- Listed in CONTRIBUTORS.md
- Credited in release notes
- Thanked publicly

---

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

Thank you for contributing to Gmail Cleanup! 🙏
