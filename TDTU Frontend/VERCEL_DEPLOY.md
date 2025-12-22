# Vercel uchun frontend deploy yo'riqnomasi

1. `TDTU Frontend/.env` faylini quyidagicha to'ldiring:

NEXT_PUBLIC_API_URL=https://YOUR_RENDER_BACKEND_URL
NEXT_PUBLIC_BOT_USERNAME=TSDI_bot
NEXT_PUBLIC_APP_NAME=TSDI
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=dm4byivx7
NEXT_PUBLIC_CLOUDINARY_API_KEY=192842456244912
CLOUDINARY_API_SECRET=... (agar kerak bo'lsa)

2. Vercel dashboardda yangi Project yarating yoki mavjudini tanlang.
   - Environment variables bo'limida yuqoridagilarni kiriting.
   - Build Command: `npm run build`
   - Output Directory: `.next`
   - Install Command: `npm install`
   - Start Command: `npm run start`

3. `NEXT_PUBLIC_API_URL` ni Render backend urliga moslang (masalan, https://your-backend.onrender.com)

4. Deploy tugagach, frontenddan backend API'ga so'rovlar to'g'ri ketayotganini tekshiring.

5. Agar kerak bo'lsa, Vercel'da custom domain sozlang va Render backend CORS'ga shu domenni qo'shing.

