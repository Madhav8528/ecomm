# Frontend (Next.js Storefront)

## Setup

```powershell
cd frontend
npm install
```

Create `.env.local`:

```env
NEXT_PUBLIC_BACKEND_API_URL=http://127.0.0.1:8000/api
```

## Run

```powershell
npm run dev
```

- Frontend: `http://localhost:3000`

## Notes

- Catalog and checkout are connected to Django backend APIs.
- If backend is unavailable, catalog uses local fallback data so frontend still runs.
- Account login/register currently uses frontend API session flow.

