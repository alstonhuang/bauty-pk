# Beauty PK 🎨

A premium photo voting platform where users can upload photos and compete in head-to-head battles. Built with Next.js, Supabase, and modern web technologies.

## ✨ Features

- 🔐 **Google OAuth Authentication** - Secure login with Google
- 📸 **Photo Upload** - Upload and manage your photos
- ⚔️ **PK Battles** - Vote in head-to-head photo competitions
- ⚡ **Energy System** - Energy-based voting with auto-regeneration
- 🏆 **Leaderboard** - Track top-performing photos with ELO ratings
- 🖼️ **My Gallery** - Manage your uploaded photos and track performance
- 🎨 **Premium Design** - Glassmorphism UI with smooth animations

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Supabase account
- Google Cloud Console account (for OAuth)

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd synthetic-kilonova
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Create `.env.local` in the root directory:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Set up Supabase**
   
   Run the SQL scripts in Supabase Dashboard → SQL Editor:
   - `db_setup.sql` - Database tables and RLS policies
   - `energy_setup.sql` - Energy system functions

5. **Configure Google OAuth**
   
   - Enable Google provider in Supabase Dashboard
   - Set up OAuth 2.0 in Google Cloud Console
   - Add redirect URI: `https://<your-project>.supabase.co/auth/v1/callback`

6. **Run development server**
   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000)

## 📦 Deployment

### Deploy to Vercel (Recommended)

1. **Install Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **Login to Vercel**
   ```bash
   vercel login
   ```

3. **Deploy**
   ```bash
   vercel --prod
   ```

4. **Set environment variables in Vercel Dashboard**
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`

For detailed deployment instructions, see [DEPLOYMENT.md](./DEPLOYMENT.md)

## 🛠️ Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth (Google OAuth)
- **Storage**: Supabase Storage
- **Styling**: Tailwind CSS v4
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Deployment**: Vercel

## 📁 Project Structure

```
synthetic-kilonova/
├── app/
│   ├── api/              # API routes
│   ├── components/       # Reusable components
│   ├── leaderboard/      # Leaderboard page
│   ├── login/            # Login page
│   ├── my-photos/        # User gallery
│   ├── pk/               # PK voting page
│   ├── upload/           # Photo upload page
│   └── layout.tsx        # Root layout
├── lib/
│   └── supabaseClient.ts # Supabase client
├── public/               # Static assets
├── db_setup.sql          # Database schema
├── energy_setup.sql      # Energy system
└── DEPLOYMENT.md         # Deployment guide
```

## 🎮 How to Play

1. **Sign in** with your Google account
2. **Upload** your best photos
3. **Vote** in PK battles (costs 1 energy per vote)
4. **Track** your photos' performance on the leaderboard
5. **Manage** your gallery in My Photos

## ⚡ Energy System

- Start with 10 energy
- Each vote costs 1 energy
- Energy regenerates at 1 point per minute
- Maximum 10 energy

## 🏆 Scoring System

Photos use an **ELO rating system**:
- Win against higher-rated photos = more points
- Win against lower-rated photos = fewer points
- All photos start at 1000 points

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

MIT License - feel free to use this project for your own purposes.

## 💖 Support

If you enjoy this project, consider supporting:
- ☕ [Buy Me a Coffee](https://www.buymeacoffee.com/yourhandle)
- 💙 [PayPal](https://www.paypal.com/paypalme/yourhandle)

## 🐛 Known Issues

- None currently! Report issues on GitHub.

## 📞 Contact

For questions or support, please open an issue on GitHub.

---

Made with ❤️ by the community
