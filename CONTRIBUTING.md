# Contributing to INGRES AI Assistant

Thank you for your interest in contributing to INGRES AI Assistant! This document provides guidelines for contributing to the project.

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn
- Git
- Google Gemini API key

### Setup Development Environment

1. **Fork and clone the repository**
   ```bash
   git clone https://github.com/yourusername/ingres-ai-assistant.git
   cd ingres-ai-assistant
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Add your API keys to .env
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

## 📋 How to Contribute

### 1. Code Contributions

#### Creating a Pull Request
1. Create a new branch from `main`
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. Make your changes following our coding standards
3. Test your changes thoroughly
4. Commit with clear, descriptive messages
5. Push to your fork and create a pull request

#### Code Style Guidelines
- **TypeScript**: Use TypeScript for all new code
- **Components**: Follow existing React component patterns
- **Styling**: Use Tailwind CSS classes and shadcn/ui components
- **Naming**: Use descriptive names for variables and functions
- **Comments**: Add comments for complex logic

### 2. Bug Reports

When reporting bugs, please include:
- Clear description of the issue
- Steps to reproduce
- Expected vs actual behavior
- Screenshots if applicable
- Environment details (OS, browser, Node version)

### 3. Feature Requests

For new features:
- Check if the feature already exists or is planned
- Provide clear use case and benefits
- Consider implementation complexity
- Be open to discussion and feedback

## 🏗️ Project Structure

```
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # UI components
│   │   ├── pages/          # Application pages
│   │   ├── hooks/          # Custom hooks
│   │   └── lib/            # Utilities
├── server/                 # Express backend
│   ├── services/           # Business logic
│   ├── routes.ts           # API endpoints
│   └── storage.ts          # Database operations
├── shared/                 # Shared types
└── docs/                   # Documentation
```

## 🧪 Testing Guidelines

### Before Submitting
- Test all functionality works as expected
- Check responsive design on different screen sizes
- Verify API endpoints work correctly
- Ensure proper error handling

### Testing Areas
- Chat interface functionality
- Data visualization components
- Translation features
- API endpoint responses
- Database operations

## 📝 Commit Message Format

Use clear, descriptive commit messages:

```
type(scope): description

Examples:
feat(chat): add context memory to conversations
fix(api): resolve translation API timeout issue
docs(readme): update installation instructions
style(ui): improve button styling consistency
```

### Types
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Formatting, missing semicolons, etc.
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

## 🔍 Code Review Process

All contributions go through code review:

1. **Automated checks** must pass (linting, type checking)
2. **Manual review** by maintainers
3. **Testing** in development environment
4. **Approval** and merge

### Review Criteria
- Code quality and consistency
- Proper error handling
- Performance considerations
- Security best practices
- Documentation updates

## 🌟 Areas for Contribution

### High Priority
- Adding more Indian languages
- Improving data visualization
- Enhanced mobile experience
- Performance optimizations
- Test coverage improvements

### Medium Priority
- Additional chart types
- Export functionality enhancements
- Accessibility improvements
- Documentation updates

### Good First Issues
- UI/UX improvements
- Bug fixes
- Documentation updates
- Translation improvements

## 💡 Development Tips

### Frontend Development
- Use shadcn/ui components when possible
- Follow existing component patterns
- Ensure responsive design
- Add proper TypeScript types

### Backend Development
- Add proper error handling
- Validate input data
- Follow RESTful API conventions
- Update API documentation

### Database Changes
- Update schema files
- Create migration scripts
- Test data operations
- Consider performance impact

## 🤝 Community Guidelines

### Be Respectful
- Use welcoming and inclusive language
- Respect different viewpoints and experiences
- Provide constructive feedback
- Help newcomers get started

### Be Collaborative
- Ask for help when needed
- Share knowledge and resources
- Review others' contributions
- Participate in discussions

## 📞 Getting Help

If you need help:
- Check existing issues and documentation
- Join our community discussions
- Ask questions in pull requests
- Contact maintainers directly

## 🙏 Recognition

Contributors are recognized in:
- README contributors section
- Release notes
- Project documentation
- Community highlights

## 📄 License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

Thank you for helping make INGRES AI Assistant better! 🚀