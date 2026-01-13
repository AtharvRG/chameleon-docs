# Contributing to Chameleon Docs 🦎

Thank you for your interest in contributing to **Chameleon Docs**!
This project aims to reimagine documentation with performance, intelligence, and beautiful design at its core. Contributions of all kinds are welcome and appreciated.

## 🌟 Ways to Contribute

You can contribute by:

* Fixing bugs or improving performance
* Adding new features or enhancements
* Improving UI/UX or accessibility
* Enhancing AI-assisted workflows
* Writing or improving documentation
* Refactoring code for clarity or maintainability

If you’re unsure where to start, check open issues or propose an idea via a new issue.

## 🛠️ Development Setup
Prerequisites

* Node.js 18+
* MongoDB (local or Atlas)
* Basic familiarity with Next.js App Router and TypeScript

1. ***Fork and Clone the Repository**
```bash
git clone https://github.com/AtharvRG/chameleon-docs.git
cd chameleon-docs
```
2. ***Install Dependencies***
```bash
npm install
```

3. ***Environment Variables***
Create a .env.local file in the project root:

## Database
```bash
MONGODB_URI=your_mongodb_connection_string
```

## Authentication
```bash
AUTH_SECRET=your_nextauth_secret
```

## AI
```bash
GOOGLE_API_KEY=your_gemini_api_key
```

## App
```bash
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

4. ***Run the Development Server***
```bash
npm run dev
```

Open http://localhost:3000
 in your browser.

## 🧱 Project Architecture Overview
chameleon-docs/
├── actions/        # Server actions (mutations, AI calls)
├── app/            # Next.js App Router pages and layouts
├── components/     # Reusable UI components
│   ├── ui/         # Atomic UI primitives
│   └── ...         # Feature-level components
├── hooks/          # Custom React hooks
├── lib/            # Utilities, configs, helpers
├── models/         # Mongoose schemas and models
├── public/         # Static assets
└── types/          # Shared TypeScript types


Please follow the existing structure when adding new code.

## 🎨 Code Style & Guidelines

* TypeScript-first: Avoid ```any``` unless absolutely necessary
* Follow existing Tailwind CSS patterns and design tokens
* Prefer Server Components and Server Actions where appropriate
* Keep components small, composable, and accessible
* Use existing UI primitives instead of creating duplicates
* Ensure animations are smooth and intentional (no excess motion)

## 🧪 Testing & Quality

While the project evolves:

* Manually test UI and interactions before submitting a PR
* Verify no console errors or hydration warnings
* Ensure authentication and AI features fail gracefully
* Avoid breaking existing routes or layouts

(Automated tests may be added in future iterations.)

## 🔀 Contribution Workflow

1. Create a new branch:
```bash
git checkout -b feature/your-feature-name
```

2. Make your changes.

Commit with a clear message:
```bash
git commit -m "Add: short description of change"
```

3. Push to your fork:
```bash
git push origin feature/your-feature-name
```

4. Open a Pull Request against the main branch.

## 📦 Pull Request Guidelines

When opening a PR, please:

* Clearly describe what you changed and why
* Include screenshots or screen recordings for UI changes
* Mention any architectural or design trade-offs
* Keep PRs focused and reasonably sized
* Ensure no secrets or sensitive data are committed
* A PR template (if present) should be filled out.

## 🔐 Security & AI Usage

* Never commit API keys or secrets
* Do not log sensitive user data
* AI-generated content should be reviewed and editable by users
* Follow ethical usage of generative AI features

## 💬 Getting Help

If you’re stuck or want feedback before implementing:

* Open an issue describing your idea or question
* Start a GitHub discussion (if enabled)
* Early communication is encouraged.

## 🙌 Code of Conduct

By contributing, you agree to uphold a respectful, inclusive, and constructive environment. Harassment, discrimination, or toxic behavior will not be tolerated.

**❤️ Thank You**

Chameleon Docs is built to make knowledge beautiful, fast, and alive.
Every contribution—big or small—helps move that vision forward.

Happy building 🦎✨