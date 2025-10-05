# Contributing to Operator Network

Thank you for your interest in contributing to the Operator Network! This document provides guidelines and information for contributors.

## 🎯 Getting Started

### Prerequisites
- Node.js 18+
- Git
- Basic knowledge of React, TypeScript, and Solana

### Development Setup
```bash
# Fork and clone the repository
git clone https://github.com/vibeforge1111/operator_app.git
cd operator_app

# Install dependencies
npm install

# Start development server
npm run dev
```

## 🏗️ Project Structure

```
src/
├── components/          # React components
├── types/              # TypeScript type definitions
├── data/               # Mock data and constants
├── hooks/              # Custom React hooks
├── contexts/           # React context providers
└── docs/               # Documentation and specs
```

## 🎨 Code Style

### TypeScript
- Use strict TypeScript with proper type definitions
- Prefer interfaces over types for object shapes
- Use meaningful variable and function names

### React
- Use functional components with hooks
- Prefer composition over inheritance
- Keep components focused and single-purpose

### CSS
- Use Tailwind CSS classes
- Follow the terminal aesthetic theme
- Use CSS variables for consistent colors

## 📝 Commit Guidelines

### Commit Message Format
```
type(scope): description

[optional body]

[optional footer]
```

### Types
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes
- `refactor`: Code refactoring
- `test`: Adding tests
- `chore`: Build process or auxiliary tool changes

### Examples
```
feat(machines): add machine connection system
fix(dashboard): resolve heartbeat timing issue
docs(readme): update installation instructions
```

## 🚀 Pull Request Process

1. **Create a branch** from `main` for your feature
2. **Make your changes** following the code style guidelines
3. **Test your changes** thoroughly
4. **Update documentation** if needed
5. **Submit a pull request** with a clear description

### Pull Request Template
```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Tests pass locally
- [ ] Manual testing completed
- [ ] No console errors

## Screenshots (if applicable)
```

## 🧪 Testing

### Running Tests
```bash
npm run test          # Run all tests
npm run test:watch    # Run tests in watch mode
npm run typecheck     # Run TypeScript checks
npm run lint          # Run ESLint
```

### Testing Guidelines
- Write tests for new features
- Update tests when modifying existing features
- Ensure all tests pass before submitting PR

## 🎯 Areas for Contribution

### High Priority
- **Solana Integration** - Real wallet connection and transactions
- **Smart Contracts** - Operator registry and machine contracts
- **Backend Integration** - Replace mock data with real APIs

### Medium Priority
- **UI/UX Improvements** - Enhanced terminal aesthetic
- **Performance** - Optimization and caching
- **Mobile Responsiveness** - Touch-friendly interface

### Documentation
- **Tutorials** - Step-by-step guides
- **API Documentation** - Endpoint specifications
- **Architecture Docs** - System design documentation

## 🐛 Bug Reports

### Before Submitting
1. Check existing issues to avoid duplicates
2. Test with the latest version
3. Provide clear reproduction steps

### Bug Report Template
```markdown
## Bug Description
Clear description of the bug

## Steps to Reproduce
1. Go to '...'
2. Click on '...'
3. See error

## Expected Behavior
What should happen

## Actual Behavior
What actually happens

## Environment
- OS: [e.g., Windows 11]
- Browser: [e.g., Chrome 118]
- Node.js: [e.g., 18.17.0]
```

## 💡 Feature Requests

### Feature Request Template
```markdown
## Feature Description
Clear description of the proposed feature

## Problem Statement
What problem does this solve?

## Proposed Solution
How should this feature work?

## Alternatives Considered
What other approaches were considered?

## Additional Context
Any other relevant information
```

## 🎨 Design Guidelines

### Terminal Aesthetic
- Monospace fonts (JetBrains Mono, Fira Code)
- Dark background with green/purple accents
- Subtle glowing effects
- Minimal, functional design

### Color Palette
```css
--color-primary: #14f195    /* Neon green */
--color-secondary: #9945ff  /* Purple */
--color-bg: #0f0f0f        /* Dark background */
--color-surface: #1a1a1a   /* Card background */
--color-text: #ffffff      /* Primary text */
--color-text-muted: #888888 /* Secondary text */
```

## 🤝 Community

### Communication Channels
- **GitHub Issues** - Bug reports and feature requests
- **GitHub Discussions** - General questions and ideas
- **Discord** - Real-time chat (coming soon)

### Code of Conduct
- Be respectful and inclusive
- Focus on constructive feedback
- Help newcomers get started
- Celebrate diverse perspectives

## 📚 Resources

### Learning Materials
- [React Documentation](https://react.dev)
- [TypeScript Handbook](https://typescriptlang.org/docs)
- [Solana Development](https://docs.solana.com)
- [Tailwind CSS](https://tailwindcss.com/docs)

### Tools
- [Vite](https://vitejs.dev) - Build tool
- [Vitest](https://vitest.dev) - Testing framework
- [ESLint](https://eslint.org) - Linting
- [Prettier](https://prettier.io) - Code formatting

## 🏆 Recognition

Contributors will be recognized in:
- README.md contributors section
- Release notes for significant contributions
- Special operator badges (future feature)

---

Thank you for contributing to the Operator Network! Together, we're building the future of decentralized production.

*"Every operator makes the network stronger."*