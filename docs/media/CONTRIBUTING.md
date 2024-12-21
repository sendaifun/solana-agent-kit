# Contributing to Solana Agent Kit

First off, thank you for considering contributing to Solana Agent Kit! 🎉 Your contributions are **greatly appreciated**.

## Table of Contents

- [Contributing to Solana Agent Kit](#contributing-to-solana-agent-kit)
  - [Table of Contents](#table-of-contents)
  - [Code of Conduct](#code-of-conduct)
  - [How Can I Contribute?](#how-can-i-contribute)
    - [Reporting Bugs](#reporting-bugs)
    - [Suggesting Enhancements](#suggesting-enhancements)
    - [Your First Code Contribution](#your-first-code-contribution)
    - [Pull Requests](#pull-requests)
  - [Style Guides](#style-guides)
    - [Code Style](#code-style)
    - [Commit Messages](#commit-messages)
    - [Naming Conventions](#naming-conventions)
  - [Development Setup](#development-setup)
    - [Prerequisites](#prerequisites)
    - [Installation](#installation)
    - [Building the Project](#building-the-project)
    - [Running Tests](#running-tests)
    - [Generating Documentation](#generating-documentation)
  - [Security](#security)
  - [License](#license)

## Code of Conduct

This project adheres to the [Contributor Covenant Code of Conduct](https://www.contributor-covenant.org/version/2/0/code_of_conduct/). By participating, you are expected to uphold this code. Please report unacceptable behavior to [aryan@sendai.fun](mailto:aryan@sendai.fun).

## How Can I Contribute?

### Reporting Bugs

**Great**! Opening an issue is the best way to help us improve. Here's how you can report a bug:

1. **Search** the [existing issues](https://github.com/sendaifun/solana-agent-kit/issues) to make sure it hasn't been reported.
2. **Open a new issue** and fill out the template with as much information as possible.
3. **Provide reproduction steps** if applicable.

### Suggesting Enhancements

We welcome your ideas for improving Solana Agent Kit! To suggest an enhancement:

1. **Search** the [existing issues](https://github.com/sendaifun/solana-agent-kit/issues) to see if it's already been suggested.
2. **Open a new issue** and describe your idea in detail.

### Your First Code Contribution

Unsure where to start? You can help out by:

- Fixing simple bugs.
- Improving documentation.
- Adding tests.

Check out the [Good First Issues](https://github.com/sendaifun/solana-agent-kit/issues?q=is%3Aissue+is%3Aopen+label%3A%22good+first+issue%22) to get started!

### Pull Requests

1. **Fork** the repository.
2. **Create** a new branch for your feature or bugfix.
   ```bash
   git checkout -b feature/your-feature-name
   ```
3. **Commit** your changes with clear and descriptive messages.
4. **Push** to your fork.
   ```bash
   git push origin feature/your-feature-name
   ```
5. **Open a Pull Request** against the `main` branch of this repository.

## Style Guides

### Code Style

- **Language**: TypeScript
- **Formatting**: Follow the existing codebase formatting. Consider using [Prettier](https://prettier.io/) for consistent code formatting.
- **Code Quality**: Adhere to the code quality rules defined in `.eslintrc`. Ensure all checks pass before submitting a PR.

### Commit Messages

Use [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/) for your commit messages. Examples:

- `feat: add ability to deploy new SPL token`
- `fix: handle edge case when deploying collection`
- `docs: update README with new usage examples`

### Naming Conventions

- **Variables and Functions**: `camelCase`
- **Classes and Types**: `PascalCase`
- **Constants**: `UPPER_SNAKE_CASE`

## Development Setup

### Prerequisites

- **Node.js**: v23.x or higher
- **npm**: v10.x or higher
- **Git**: Installed and configured

### Installation

1. **Clone** the repository:
   ```bash
   git clone https://github.com/yourusername/solana-agent-kit.git
   ```
2. **Navigate** to the project directory:
   ```bash
   cd solana-agent-kit
   ```
3. **Install** dependencies:
   ```bash
   pnpm install
   ```

### Building the Project

To compile the TypeScript code:

```bash
pnpm run build
```

### Running Tests

To execute the test suite:

```bash
pnpm run test
```

### Generating Documentation

To generate the project documentation using TypeDoc:

```bash
npm run docs
```

The documentation will be available in the `docs/` directory.

## Security

This toolkit handles sensitive information such as private keys and API keys. **Ensure you never commit `.env` files or any sensitive data**. Review the `.gitignore` to confirm that sensitive files are excluded.

For security vulnerabilities, please follow the [responsible disclosure](mailto:aryan@sendai.fun) process.

## License

This project is licensed under the [ISC License](LICENSE).

---
