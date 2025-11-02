# Papyrus Lite - Module 1: Streams & Blocks CRUD

A web app for building AI chat streams made of blocks (cards).

## Features (Module 1)

- ✅ Create, rename, and delete Streams
- ✅ Add Markdown and Prompt blocks to streams
- ✅ Reorder blocks with up/down arrows
- ✅ Toggle blocks in/out of AI context
- ✅ Delete individual blocks
- ✅ Persistent SQLite storage via Prisma
- ✅ Comprehensive debugging with console logs

## Tech Stack

- **Frontend**: Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: SQLite with Prisma ORM
- **Deployment**: Supports local development and production VM

## Environment Configuration

### Port Configuration

The application port is configurable via environment variables:

**Local Development (default):**
- Port: `3420`
- URL: `http://localhost:3420`

**Production (VM):**
- Port: `4201` (or as configured in your nginx)
- URL: `https://dev.jimboslice.xyz`

### Environment Files

1. **`.env.example`** - Template for local development
2. **`.env.production.example`** - Template for production server
3. **`.env`** - Your actual environment file (gitignored)

### Setting Up Environment

**Local Development:**
```bash
# Copy the example file
cp .env.example .env

# Edit .env and set your port (default is 3420)
PORT=3420
```

**Production:**
```bash
# Copy the production example
cp .env.production.example .env

# Edit .env with production values
PORT=4201
NODE_ENV=production
DATABASE_URL="file:./prisma/prod.db"
```

### Nginx Configuration (Production)

Map your chosen port to a domain in nginx:

```nginx
# /etc/nginx/sites-available/papyrus-lite
server {
    listen 80;
    server_name dev.jimboslice.xyz;

    location / {
        proxy_pass http://localhost:4201;  # Match your PORT in .env
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## Installation & Setup

### First Time Setup

1. **Clone and navigate to project:**
   ```bash
   cd /path/to/CODING/p3
   ```

2. **Set up environment:**
   ```bash
   cp .env.example .env
   # Edit .env if you want to change the port (default: 3420)
   ```

3. **Run post-pull script:**
   ```bash
   ./postpull.sh
   ```
   This will:
   - Install dependencies
   - Generate Prisma client
   - Run database migrations
   - Clear Next.js cache
   - Seed the database with sample data

### After Pulling Changes

Simply run the post-pull script:
```bash
./postpull.sh
```

### Manual Setup (Alternative)

```bash
# Install dependencies
cd app && npm install && cd ..

# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate dev  # Development
# OR
npx prisma migrate deploy  # Production

# Seed database
npx tsx prisma/seed.ts

# Start development server
cd app && npm run dev
```

## Development

### Start Development Server

```bash
cd app
npm run dev
```

The app will start on the port specified in your `.env` file (default: 3420).

Open [http://localhost:3420](http://localhost:3420) in your browser.

### Database Management

**View database:**
```bash
npx prisma studio
```

**Create a migration:**
```bash
npx prisma migrate dev --name your_migration_name
```

**Reset database:**
```bash
npx prisma migrate reset
```

**Seed database:**
```bash
cd app && npm run seed
```

## Production Deployment

### On Your VM

1. **Pull latest code:**
   ```bash
   cd /path/to/p3
   git pull
   ```

2. **Set up production environment:**
   ```bash
   cp .env.production.example .env
   # Edit .env with production values
   ```

3. **Run post-pull script:**
   ```bash
   ./postpull.sh
   ```

4. **Build and start:**
   ```bash
   cd app
   npm run build
   npm start
   ```

5. **Use PM2 for process management (recommended):**
   ```bash
   pm2 start npm --name "papyrus-lite" -- start
   pm2 save
   pm2 startup
   ```

### Port Mapping Reference

Based on your environment info:

| Port | URL | Purpose |
|------|-----|---------|
| 3420 | localhost:3420 | Papyrus Lite (local dev) |
| 4201 | dev.jimboslice.xyz | Papyrus Lite (production) |
| 3001 | api-dev.jimboslice.xyz | Other API services |
| 4200 | app.jimboslice.xyz | Other apps |
| 3000 | app.jimboslice.xyz/files | File services |

## Project Structure

```
p3/
├── app/                          # Next.js application
│   ├── app/                      # App router
│   │   ├── api/                  # API routes
│   │   │   ├── streams/          # Stream CRUD endpoints
│   │   │   └── blocks/           # Block CRUD endpoints
│   │   ├── page.tsx              # Main page
│   │   ├── layout.tsx            # Root layout
│   │   └── globals.css           # Global styles
│   ├── components/               # React components
│   │   ├── StreamsSidebar.tsx    # Streams list sidebar
│   │   └── StreamView.tsx        # Stream blocks view
│   ├── lib/                      # Utilities
│   │   └── prisma.ts             # Prisma client singleton
│   ├── generated/                # Generated Prisma client (gitignored)
│   └── package.json              # Dependencies
├── prisma/                       # Database
│   ├── schema.prisma             # Database schema
│   ├── migrations/               # Migration history
│   ├── seed.ts                   # Seed script
│   ├── dev.db                    # Local database (gitignored)
│   └── prod.db                   # Production database (gitignored)
├── .env.example                  # Local environment template
├── .env.production.example       # Production environment template
├── .gitignore                    # Git ignore rules
├── postpull.sh                   # Post-pull setup script
└── README.md                     # This file
```

## API Endpoints

### Streams

- `GET /api/streams` - List all streams
- `POST /api/streams` - Create a stream
  ```json
  { "name": "Stream Name" }
  ```
- `GET /api/streams/:id` - Get stream with blocks
- `PATCH /api/streams/:id` - Rename stream
  ```json
  { "name": "New Name" }
  ```
- `DELETE /api/streams/:id` - Delete stream

### Blocks

- `POST /api/blocks` - Create a block
  ```json
  {
    "streamId": "stream_id",
    "type": "markdown" | "prompt",
    "content": "Block content",
    "order": 0,
    "inContext": true
  }
  ```
- `PATCH /api/blocks/:id` - Update block
  ```json
  {
    "content": "Updated content",
    "inContext": false,
    "order": 1
  }
  ```
- `DELETE /api/blocks/:id` - Delete block
- `POST /api/blocks/reorder` - Batch reorder blocks
  ```json
  {
    "updates": [
      { "id": "block_id_1", "order": 0 },
      { "id": "block_id_2", "order": 1 }
    ]
  }
  ```

## Debugging

All API routes and components include comprehensive console logging:

**Browser Console:**
- `[StreamsSidebar]` - Sidebar operations
- `[StreamView]` - Stream and block operations

**Server Console:**
- `[API]` - All API route operations with request/response details

Check the browser console and server terminal for detailed debugging information.

## Testing Guide

See `TESTING.md` for comprehensive testing instructions.

## Future Modules

- Module 2: Markdown editor with live preview
- Module 3: File search and Dropbox integration
- Module 4: AI prompt execution and streaming
- Module 5: Advanced features (diff blocks, EPUB, etc.)

## License

Private project
