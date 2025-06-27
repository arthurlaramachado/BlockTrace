# BlockTrace - Digital Product Passport Manager

BlockTrace is a multi-page web application (MPA) for managing Digital Product Passports (DPPs), allowing users to view, create, edit, and transfer DPPs securely.

## 🔍 Key Features

- 🔐 **Owner Authentication** via cryptographic key
- 🧾 **DPP Management**: Create, update, edit, and transfer DPPs and have your DPPs listed for you when logged in
- 📖 **Public Viewer**: Search and view DPPs by ID
- 🧠 **Audit Log**: Visual timeline of all DPP changes
- 📱 **Responsive Design** with Material UI


## 🚀 Getting Started

```bash
# 1. Clone the repository
git clone https://github.com/arthurlaramachado/BlockTrace.git
cd BlockTrace/web-app

# 2. Install dependencies
npm install

# 3. Configure environment variables
cp .env.example .env

# 4. Run the development server
npm run dev
```

## 📦 Project Structure

```
src/
├── components/    # Reusable UI components
├── contexts/      # Auth and Snackbar contexts
├── pages/         # Main application pages
└── App.jsx        # App entry and routing
```

## 📄 License

MIT License — see LICENSE.md for more info.

---

**BlockTrace** — Bringing product transparency through Digital Product Passports 🌍