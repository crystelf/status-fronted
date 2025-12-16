# Status-Frontend

A front-end application of a real-time system monitoring platform, built on Next.js 14.

## Technology Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Style**: Tailwind CSS
- **UI Components**: Radix UI
- **Animation**: Framer Motion
- **Icons**: Lucide React
- **Charts**: Recharts

## Functional features

- ✅ Responsive design (mobile, tablet, desktop)
- ✅ Light/dark theme switching
- ✅ Automatic detection of system topic preferences
- ✅ Modernize the UI component library
- ✅ Type-safe TypeScript

## Configuration

### Using config.json (Recommended)

Create a `config.json` file in the frontend directory based on `config.example.json`:

```bash
cp config.example.json config.json
nano config.json
```

```json
{
  "apiUrl": "http://localhost:7788"
}
```

The configuration file will be automatically read during build time. If the file doesn't exist, it will use the default value `http://localhost:7788`.

### Using Environment Variables

Alternatively, you can set the API URL using environment variables:

```bash
# .env.local (for development)
NEXT_PUBLIC_API_URL=http://localhost:7788

# .env.production (for production)
NEXT_PUBLIC_API_URL=https://your-api-server.com
```

**Priority:** Environment variables > config.json > default value

## Development

### Install dependencies

```bash
pnpm install
```

### Configure the backend URL

1. Copy the example config file:
   ```bash
   cp config.example.json config.json
   ```

2. Edit `config.json` and set the `apiUrl` to your backend server address:
   ```json
   {
     "apiUrl": "http://localhost:7788"
   }
   ```

### Start the development server

```bash
pnpm dev
```

Visit [http://localhost:7777](http://localhost:7777) to view the app.

### Build a production version

```bash
pnpm build
```

### Start the production server

```bash
pnpm start
```

### Code Check

```bash
pnpm lint
pnpm type-check
```

### Code formatting

```bash
pnpm format
```

## Responsive breakpoints

- **Mobile**: < 768px
- **Tablet**: 768px - 1023px
- **Desktop**: > 1024px

## Theme System

The app supports three theme modes:

1. **Light**: Bright color mode
2. **Dark**: Dark mode
3. **System**: Follow the system settings (default)

Theme preferences are automatically saved to localStorage.
