# CashGram Dashboard

Expense tracker dashboard untuk Telegram Bot dengan Next.js, PostgreSQL, dan Gemini AI.

## 🚀 Features

- **Dashboard Interaktif**: Visualisasi pengeluaran dengan charts dan statistics
- **Telegram Bot Integration**: Input pengeluaran melalui chat bot
- **AI Analysis**: Insight dan rekomendasi dari Gemini AI
- **Real-time Updates**: Data ter-update secara real-time
- **Responsive Design**: Mobile-friendly interface

## 🛠️ Tech Stack

- **Frontend**: Next.js 14, React 18, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL (Supabase)
- **Charts**: Recharts
- **AI**: Google Gemini API
- **Deployment**: Vercel

## 📱 Demo

Dashboard tersedia di: [akan diupdate setelah deploy]

## 🔧 Installation

```bash
# Clone repository
git clone <your-repo-url>
cd cashgram

# Install dependencies
npm install

# Setup environment variables
cp .env.example .env.local

# Run development server
npm run dev
```

## 🌐 Environment Variables

```env
# Database
DATABASE_URL=postgresql://user:password@host:port/database

# Telegram Bot
TELEGRAM_BOT_TOKEN=your_bot_token

# Gemini AI
GEMINI_API_KEY=your_gemini_api_key
```

## 📊 Features

### Dashboard
- ✅ Statistics cards (total, transaksi, rata-rata, kategori)
- ✅ Area chart untuk tren harian
- ✅ Pie chart untuk distribusi kategori
- ✅ Bar chart perbandingan kategori
- ✅ List pengeluaran terbaru
- ✅ AI analysis dengan insights dan rekomendasi

### API Endpoints
- `GET /api/expenses` - Get all expenses data
- `POST /api/expenses` - Add new expense
- `POST /api/ai/analyze` - Get AI analysis

## 🚀 Deployment

### Vercel
1. Push code ke GitHub
2. Connect repository ke Vercel
3. Set environment variables
4. Deploy!

### Manual Deploy
```bash
npm run build
npm start
```

## 📱 Telegram Bot Usage

Kirim pesan dalam format:
- "Makan siang Rp 50.000"
- "Belanja bulanan 300rb kategori belanja"
- "Transport 25000"

## 🤖 AI Analysis

Dashboard dapat memberikan:
- Summary pengeluaran bulanan
- Insights kategori terbesar
- Rekomendasi penghematan
- Saran budget optimal

## 📈 Charts & Visualizations

- **Area Chart**: Tren pengeluaran harian
- **Pie Chart**: Distribusi per kategori
- **Bar Chart**: Perbandingan antar kategori
- **Statistics Cards**: Metrics penting

## 🎨 UI Components

- Layout responsif untuk mobile & desktop
- Tailwind CSS untuk styling
- Interactive charts dengan Recharts
- Modern UI dengan gradients & shadows

## 📝 Roadmap

- [ ] Integrasi Supabase database
- [ ] Real Telegram Bot webhook
- [ ] Gemini AI integration
- [ ] User authentication
- [ ] Export data functionality
- [ ] Budget alerts
- [ ] Category management

## 📄 License

MIT License

## 👨‍💻 Developer

Dibuat dengan ❤️ menggunakan Next.js dan Vercel