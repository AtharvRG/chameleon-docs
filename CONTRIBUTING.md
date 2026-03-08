# 🦎 Contributing to Chameleon Docs

First of all, thank you for helping us reimagine documentation! Whether you are fixing a bug, improving the glassmorphism UI, or optimizing the Gemini AI logic, your contributions are vital to making Chameleon Docs thrive for **ECWOC'26**.

---

## 🛠️ Tech Stack & Requirements
To contribute effectively, ensure you are comfortable with:
* **Framework:** Next.js 14+ (App Router & Server Actions)
* **Styling:** Tailwind CSS, Framer Motion, and Lenis (for smooth scrolling)
* **AI:** Google Generative AI SDK (Gemini)
* **Database:** MongoDB (Mongoose)

---

## 🚀 Getting Started

### 1. Branching Strategy
We use specific prefixes to keep the history clean:
* `feature/` : New UI or AI functionality (e.g., `feature/cmdk-logic`)
* `bugfix/` : Fixing issues or styling glitches (e.g., `bugfix/auth-redirect`)
* `docs/` : Updates to documentation or README.
* `refactor/` : Improving code structure without changing features.

### 2. Local Setup
1. **Fork** the repository and clone it.
2. Run `npm install`.
3. Create a `.env.local` file (refer to the README for required keys like `GOOGLE_API_KEY`).
4. Run `npm run dev` to start the local server.

---

## 🎨 Contribution Guidelines

### Code Style
* **TypeScript:** No `any` types. Define interfaces in the `types/` folder.
* **UI Components:** Use the atomic design system. Small primitives go in `components/ui/`.
* **Linting:** Run `npm run lint` before committing to ensure there are no errors.

### Commit Messages
Please use clear, descriptive commit messages:
* `feat: add gemini-powered auto-tagging`
* `fix: resolve hydration error in glassmorphism cards`

---

## 📥 Submitting a Pull Request
1. Ensure your branch is up to date with `main`.
2. Fill out the **Pull Request Template** completely.
3. If you changed the UI, **screenshots or GIFs** are mandatory.
4. Link the PR to an existing issue (e.g., `Closes #12`).

Thank you for building with us! 🦎
