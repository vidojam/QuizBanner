# QuizBanner

Learn smarter with customizable scrolling question banners featuring enhanced spaced repetition and visual learning reinforcement.

## 🎯 Features

### Free Tier
- Create and manage up to 10 question-answer pairs
- Customizable banner display (duration, height, font size)
- Multiple display modes (screensaver, overlay, banner)
- Random color schemes for better retention
- Category and tag organization
- Study session tracking
- No account required - use as guest

### Premium Tier (99¢/month)
- Up to 50 question-answer pairs
- CSV file import
- Paste text import
- All free tier features

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/vidojam/QuizBanner.git
cd QuizBanner
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory:
```env
# Database Configuration
DATABASE_URL=""

# Session & JWT
SESSION_SECRET="your-session-secret"
JWT_SECRET="your-jwt-secret-at-least-32-chars"

# Email Configuration (for password reset)
EMAIL_HOST="smtp.gmail.com"
EMAIL_PORT="587"
EMAIL_USER="your-email@gmail.com"
EMAIL_PASSWORD="your-app-password"
EMAIL_FROM="QuizBanner <noreply@quizbanner.com>"

# Application URL
APP_URL="http://localhost:5000"

# Stripe API Keys (Test Mode)
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_PUBLISHABLE_KEY="pk_test_..."
```

4. Start the development server:
```bash
npm run dev
```

5. Open your browser to `http://localhost:5000`

## 🛠️ Tech Stack

### Frontend
- **React** with TypeScript
- **Vite** for fast builds
- **Wouter** for routing
- **TanStack Query** for data fetching
- **Tailwind CSS** for styling
- **shadcn/ui** component library

### Backend
- **Express.js** server
- **SQLite** database (local development)
- **Drizzle ORM** for database operations
- **JWT** authentication
- **Stripe** for payments

## 📱 Usage

### Creating Questions
1. Navigate to the app (`/app`)
2. Click "Add Question"
3. Enter your question and answer
4. Optionally add category and tags
5. Set custom duration if needed

### Display Modes

**Screensaver Mode**
- Full-screen question display
- Auto-rotates through questions
- Pause/skip controls
- Randomized banner positions

**Overlay Mode**
- Banner appears over your current work
- Adjustable transparency
- Non-intrusive learning

**Banner Mode**
- Fixed position banner
- Choose top, bottom, left, or right
- Customizable colors and size

### Import Options (Premium)

**CSV Import**
- Format: `question,answer,category,tags`
- Upload .csv file
- Bulk create questions

**Paste Import**
- Paste Q&A pairs
- Auto-format detection
- Quick entry method

## 🔐 Authentication

- **Guest Mode**: Use app without account, data stored locally
- **Registered Account**: Cross-device access, cloud storage
- **Premium Upgrade**: Available for both guests and registered users

## 💳 Payment

- Secure checkout via Stripe
- No account required for purchase
- Guest purchases can be linked to account later
- Test mode available for development

## 📄 Legal

- [Terms of Service](/terms)
- [Privacy Policy](/privacy)
- [Contact Us](/contact)

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📧 Contact

For questions or support, please visit our [Contact Page](/contact) or email vidojam@gmail.com

## 📝 License

MIT License - see LICENSE file for details

---

**Made with ❤️ by vidojam**
