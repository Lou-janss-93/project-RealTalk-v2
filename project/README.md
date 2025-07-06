# 🎭 RealTalk - Authentic Conversations Platform

[![Next.js](https://img.shields.io/badge/Next.js-13-black?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org)
[![Supabase](https://img.shields.io/badge/Supabase-Database-green?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org)

## 🚀 **Quick Start**

### 1. Clone & Install
```bash
git clone <your-repo-url>
cd realtalk
npm install
```

### 2. Environment Setup
```bash
cp .env.example .env.local
# Add your Supabase credentials
```

### 3. Database Setup
1. Create Supabase project at [supabase.com](https://supabase.com)
2. Run migrations in SQL Editor:
   - `supabase/migrations/20250629101751_sweet_heart.sql`
   - `supabase/migrations/20250706161240_wild_sun.sql`

### 4. Run Development
```bash
npm run dev
```

## 🎯 **Core Features**

### 🎭 **Personality-Based Experience**
- **Roots 🌱**: Authentic, grounded conversations
- **Mask 🎭**: Curated, professional presentation
- **Spark 🔥**: Wild, unfiltered energy

### ⚡ **Reality Drift Meter™**
- Real-time authenticity monitoring
- Live feedback during conversations
- Gamified personal growth system

### 🗣️ **Voice-First Platform**
- Audio-only conversations
- Voice capture and analysis
- Professional audio controls

### 🌍 **Multi-Language Support**
- English and Dutch
- Seamless language switching
- Cultural adaptation

## 🛠 **Tech Stack**

- **Frontend**: Next.js 13, TypeScript, Tailwind CSS
- **Backend**: Supabase (PostgreSQL, Auth, Real-time)
- **UI**: Custom glassmorphism design system
- **Icons**: Lucide React
- **Deployment**: Netlify

## 📱 **Demo Accounts**

Try these personas:
- **Roots**: `roots@realtalk.com` / `demo123`
- **Mask**: `mask@realtalk.com` / `demo123`
- **Spark**: `spark@realtalk.com` / `demo123`

## 🚀 **Deployment**

### Quick Deploy to Netlify:
1. Push to GitHub
2. Connect to Netlify
3. Add environment variables
4. Deploy!

Build command: `npm run build`
Publish directory: `out`

## 🎨 **Design System**

### Glassmorphism Components:
- `glass-card`: Main content cards
- `glass-nav`: Navigation bar
- `glass-button`: Interactive buttons
- `floating-element`: Hover animations

### Color Gradients:
- **Blue**: Primary actions
- **Purple**: Secondary actions
- **Orange**: Accent elements

## 📁 **Project Structure**

```
├── app/                    # Next.js 13 app directory
│   ├── auth/              # Authentication pages
│   ├── feed/              # Social feed
│   ├── profile/           # User profiles
│   └── onboarding/        # User onboarding
├── components/            # Reusable components
├── lib/                   # Utilities and config
├── supabase/             # Database migrations
└── public/               # Static assets
```

## 🔒 **Security**

- Row Level Security (RLS)
- Authentication required
- HTTPS enforced
- XSS protection
- Content security headers

## 🌟 **Innovation**

RealTalk introduces the world's first **Reality Drift Meter** - technology that measures conversation authenticity in real-time, helping users become more genuine in their digital interactions.

## 📄 **License**

MIT License - see LICENSE file for details.

---

**Built with ❤️ for authentic human connection**

*RealTalk - Where conversations become real*