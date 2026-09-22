# Leaky Bucket 3D Visualizer & C Code Explainer

An interactive 3D laboratory visualizer and line-by-line C code explainer for the Computer Networks Leaky Bucket algorithm.

---

## 🚀 Deploying to Vercel

This project is configured and ready for instant zero-config deployment to [Vercel](https://vercel.com).

### Option 1: Deploy via Vercel Web Dashboard (Recommended)

1. Push this repository to **GitHub**, **GitLab**, or **Bitbucket**.
2. Log in to [Vercel](https://vercel.com) and click **"Add New..."** → **"Project"**.
3. Import your repository.
4. Vercel will automatically detect the **Vite** framework from `vercel.json`:
   - **Framework Preset**: `Vite`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`
5. Click **Deploy**. Your site will be live on a `*.vercel.app` URL with automatic HTTPS and global edge CDN.

### Option 2: Deploy using Vercel CLI

Run the following commands in your terminal:

```bash
# 1. Install or run Vercel CLI
npx vercel

# 2. Deploy to production
npx vercel --prod
```

---

## 🛠️ Local Development

```bash
# Install dependencies
npm install

# Start local development server
npm run dev

# Build for production
npm run build

# Preview production build locally
npm run preview
```

---

## ⚙️ Project Configuration

- `vercel.json` ensures SPA rewrites to `/index.html` so all paths resolve cleanly without 404 errors.
- Built with React 19, Vite, Tailwind CSS, and Three.js.
