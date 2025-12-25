# 🚀 Welcome to My Development Studio

**Software Services | Interactive Learning | Content Innovation**

The JT Dev Studio is an on-going professional development studio. With high-performance software tools and resources tailored to help users create, learn, and innovate. 
From industry-leading walkthrough guides to professional-grade AI tools, the Studio is built to empower your digital presence and technical mastery.

---

## ✨ What We Offer

### 🧑‍💻 Engineering & Software Services
I help users bridge the gap between idea and execution. The Studio houses a variety of software services designed to streamline content creation and technical development.

### 📖 Setup Walkthrough Guides
We provide professional how-to guides developed for the modern engineer:
*   **Version Control**: Mastery of Git and professional GitHub collaborative workflows.
*   **Next.js Development**: High-performance patterns for the React ecosystem.
*   **SDLC & Database Design**: Architectural precision for scalable applications.

### 👤 Personalized Developer Experience
The Studio is built to be dynamic. By integrating **GitHub Authentication**, the platform tailors the experience (such as the About Me section) directly to the user's own GitHub profile and data, creating a personalized landing page for every developer.

---

## 🛠️ The Tech Stack
Built with precision using the industry's most advanced tools:
*   **Next.js 15+** | **TypeScript** | **Tailwind CSS**
*   **Supabase** (Secure Authentication & Database)
*   **Stripe** & **Coinbase Commerce** (Professional Payment Integration)

---

## 🎬 Roadmap: Coming Soon to the Studio

We are constantly expanding our suite of professional software:
*   **AI Resume & Document Suite**: Generate professional-grade resumes and cover letters using the latest AI models.
*   **Sound Wave Studio**: A specialized audio analysis and content creation environment.
*   **Financial Investment Analizer**: Analyze investment opportunities and provide personalized investment recommendations.
*   **AI Content Generator**: Advanced tools for rapid, high-quality content production.
*   **Full Developer Analytics**: Deep insights into your GitHub and WakaTime activity.

---

## 🤝 Let's Build Together

Whether you are looking for technical consulting, software services, or simply want to master the stack, the Dev Studio is open.

👉 **[Launch Dev Studio](https://jt-devstudio.tech)**
👉 **[Support the Vision](https://jt-devstudio.tech/support)**

---

## 📝 UGC Feature Setup

The User-Generated Content (UGC) platform allows authenticated users to create posts, upload media, and comment.

### Quick Start (Local Development)

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Set environment variables** in `.env.local`:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   SITE_URL=http://localhost:3000
   ```

3. **Apply database migrations**:
   - Open Supabase Dashboard → SQL Editor
   - Run the SQL from `supabase/migrations/001_ugc_schema.sql`

4. **Create storage bucket**:
   - Supabase Dashboard → Storage → New bucket
   - Name: `ugc-media`, Private: ✓

5. **Run the dev server**:
   ```bash
   npm run dev
   ```

### Key Routes
- `/posts` - Browse published posts
- `/posts/[id]` - View post details + comments
- `/editor/new` - Create new post
- `/editor/[id]` - Edit your post

### For Vercel Deployment
Add these environment variables in Vercel:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SITE_URL` (your production domain)

---

**Crafted by Jesus Torres (JT)**  
*Software Engineer | Creative Technologist*
