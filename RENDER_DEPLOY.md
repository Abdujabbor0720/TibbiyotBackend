# Render.com uchun backend deploy yo'riqnomasi

1. `.env` faylini tayyorlang (yoki Render Environment variables bo'limida quyidagilarni to'ldiring):

- NODE_ENV=production
- PORT=3001
- API_PREFIX=api/v1
- DATABASE_URL=postgres://USER:PASSWORD@HOST:PORT/DBNAME
- REDIS_URL=redis://:PASSWORD@HOST:PORT
- TELEGRAM_BOT_TOKEN=xxxx
- ADMIN_TELEGRAM_IDS=123456789,987654321
- WEBAPP_URL=https://YOUR_FRONTEND_URL
- JWT_SECRET=xxxx
- DATA_ENCRYPTION_KEY=xxxx
- CLOUDINARY_CLOUD_NAME=xxxx
- CLOUDINARY_API_KEY=xxxx
- CLOUDINARY_API_SECRET=xxxx
- CORS_ORIGINS=https://YOUR_FRONTEND_URL,https://web.telegram.org

2. Render.com'da yangi Web Service yarating:
   - Build Command: `npm run build`
   - Start Command: `npm run start:prod`
   - Environment: Node 20+
   - Environment variables: yuqoridagilarni to'ldiring

3. PostgreSQL va Redis uchun Renderda alohida service yarating yoki ularga to'g'ri URL bering.

4. Cloudinary va boshqa tashqi servislar uchun ham env'larni to'g'ri kiriting.

5. Frontend (Vercel) uchun `NEXT_PUBLIC_API_URL` ni mana shu Render backend urliga sozlang.

6. Docker Compose Render uchun majburiy emas, lekin lokal test uchun ishlatishingiz mumkin.

7. Deploydan so'ng `/api/v1/health` endpoint orqali backend ishlayotganini tekshiring.

