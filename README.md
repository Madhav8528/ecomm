# Frontend (Next.js Storefront)

## Setup

```powershell
cd frontend
npm install
```

Create `frontend/.env.local`:

```env
NEXT_PUBLIC_BACKEND_API_URL=http://127.0.0.1:8000/api
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-google-web-client-id.apps.googleusercontent.com
AUTH_SECRET=use-the-same-value-as-backend
NEXT_PUBLIC_RECAPTCHA_SITE_KEY=your-recaptcha-site-key
```

Notes:
- `NEXT_PUBLIC_GOOGLE_CLIENT_ID` is required for Google button rendering.
- `AUTH_SECRET` must match `backend/.env` exactly.
- No Google client secret is needed in frontend for this flow.

## Run

```powershell
npm run dev
```

- Frontend: `http://localhost:3000`
- Login API proxy target: `NEXT_PUBLIC_BACKEND_API_URL`

## Notes

- Catalog and checkout are connected to Django backend APIs.
- If backend is unavailable, catalog uses local fallback data so frontend still runs.
- Account login/register uses frontend API session flow with cookie token.
