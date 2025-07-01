# 🚀 ExpenseFlow - Smart Expense Tracking

![ExpenseFlow Banner](https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=1200&h=400&fit=crop&crop=center)

**The smartest way to track expenses with voice commands, receipt scanning, bank integration, and cloud sync across all your devices.**

[![Live Demo](https://img.shields.io/badge/Live-Demo-blue?style=for-the-badge)](https://your-demo-url.com)
[![GitHub](https://img.shields.io/badge/GitHub-Repository-black?style=for-the-badge&logo=github)](https://github.com/yourusername/expenseflow)
[![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)](LICENSE)

## ✨ Features

### 🎤 **Voice Powered**
- **Natural Speech Recognition**: Say "Pizza 200 rupees today" and watch it auto-fill
- **Smart Parsing**: Understands amounts, dates, quantities, and descriptions
- **Multi-language Support**: Works with various currencies and date formats

### 📷 **Smart OCR Receipt Scanning**
- **AI-Powered Extraction**: Snap receipts to auto-extract amount, date, and merchant
- **High Accuracy**: Advanced Tesseract.js OCR with enhanced parsing algorithms
- **Multiple Formats**: Supports JPG, PNG, WebP up to 10MB

### 🏦 **Bank Integration Demo**
- **Realistic Demo Mode**: Import 10-20 realistic bank transactions
- **Auto-Categorization**: Smart merchant recognition and categorization
- **Secure Testing**: Safe sandbox environment with fake data

### ☁️ **Cloud Storage & Sync**
- **Cross-Device Sync**: Access expenses from any device
- **Offline Support**: Works without internet, syncs when online
- **Data Migration**: Automatic localStorage to cloud migration

### 🔒 **Privacy First**
- **Optional Account**: Use without signup for complete privacy
- **Encrypted Storage**: All data encrypted and secure
- **Local Storage**: Works entirely offline if preferred

### 📱 **Mobile Ready**
- **Responsive Design**: Perfect on phones, tablets, and desktops
- **Touch Optimized**: Finger-friendly interface
- **PWA Ready**: Install as app on mobile devices

## 🛠️ Technology Stack

- **Frontend**: React 18 + TypeScript
- **Styling**: Tailwind CSS + Glass Morphism
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Voice Recognition**: Web Speech API
- **OCR**: Tesseract.js
- **Charts**: Chart.js + React Chart.js 2
- **Build Tool**: Vite
- **Deployment**: Netlify

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Supabase account (optional, for cloud features)

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/expenseflow.git
cd expenseflow
```

2. **Install dependencies**
```bash
npm install
```

3. **Environment Setup** (Optional - for cloud features)
```bash
cp .env.example .env
# Add your Supabase credentials
```

4. **Start development server**
```bash
npm run dev
```

5. **Open in browser**
```
http://localhost:5173
```

## 📖 Usage Guide

### 🎯 **Adding Expenses (3 Ways)**

#### 1. Voice Input 🎤
- Click the microphone button
- Say: *"Coffee 50 rupees today"*
- Watch fields auto-populate

#### 2. Receipt Scanning 📷
- Click camera button
- Take photo of receipt
- AI extracts amount, date, merchant

#### 3. Manual Entry ✏️
- Click + Add Expense
- Fill in the form manually
- Select or create custom categories

### ⚙️ **Advanced Features**

#### Time Filters
- **Today**: Current day expenses
- **Week**: Last 7 days
- **Month**: Last 30 days  
- **All Time**: Complete history

#### Currency Support
- **₹** Indian Rupee
- **$** US Dollar
- **€** Euro
- **£** British Pound

#### Data Management
- **Export**: Download CSV for analysis
- **Search**: Find expenses by description/category
- **Edit**: Modify any expense
- **Categories**: Create custom categories

## 🏗️ Project Structure

```
src/
├── components/           # React components
│   ├── auth/            # Authentication components
│   ├── modals/          # Modal dialogs
│   └── ui/              # Reusable UI components
├── contexts/            # React contexts
├── lib/                 # Database and utilities
├── types/               # TypeScript type definitions
├── utils/               # Utility functions
│   ├── voiceRecognition.ts
│   ├── receiptOCR.ts
│   ├── categories.ts
│   └── currencyConverter.ts
└── styles/              # CSS and styling
```

## 🔧 Configuration

### Supabase Setup (Optional)

1. Create a Supabase project
2. Run the migration in `supabase/migrations/`
3. Add environment variables:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Local Storage Mode

The app works completely offline using localStorage. No configuration needed!

## 📊 Database Schema

```sql
-- Expenses table
CREATE TABLE expenses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id),
  amount numeric NOT NULL,
  quantity integer DEFAULT 1,
  description text NOT NULL,
  date date NOT NULL,
  category text NOT NULL,
  currency text DEFAULT '₹',
  source text DEFAULT 'manual',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
```

## 🎨 Design System

### Glass Morphism Theme
- **Backdrop Blur**: `backdrop-blur-md`
- **Transparency**: `bg-white/10`
- **Borders**: `border-white/20`
- **Shadows**: `shadow-xl`

### Color Palette
- **Primary**: Blue gradient (`from-blue-500 to-blue-600`)
- **Success**: Green (`from-green-500 to-green-600`)
- **Warning**: Orange (`from-orange-500 to-orange-600`)
- **Error**: Red (`from-red-500 to-red-600`)

## 🚀 Deployment

### Netlify (Recommended)

1. **Build the project**
```bash
npm run build
```

2. **Deploy to Netlify**
```bash
# Install Netlify CLI
npm install -g netlify-cli

# Deploy
netlify deploy --prod --dir=dist
```

### Manual Deployment

1. Build: `npm run build`
2. Upload `dist/` folder to your hosting provider
3. Configure environment variables if using Supabase

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Workflow

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Supabase** - Backend as a Service
- **Tesseract.js** - OCR functionality
- **Chart.js** - Beautiful charts
- **Tailwind CSS** - Utility-first CSS
- **Lucide React** - Beautiful icons

## 📞 Support

- **Documentation**: [Full Documentation](docs/)
- **Issues**: [GitHub Issues](https://github.com/yourusername/expenseflow/issues)
- **Discussions**: [GitHub Discussions](https://github.com/yourusername/expenseflow/discussions)

## 🌟 Star History

[![Star History Chart](https://api.star-history.com/svg?repos=yourusername/expenseflow&type=Date)](https://star-history.com/#yourusername/expenseflow&Date)

---

<div align="center">

**Made with ❤️ for better expense tracking**

[⭐ Star this repo](https://github.com/yourusername/expenseflow) • [🐛 Report Bug](https://github.com/yourusername/expenseflow/issues) • [💡 Request Feature](https://github.com/yourusername/expenseflow/issues)

</div>