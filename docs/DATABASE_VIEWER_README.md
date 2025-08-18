# Database Viewer

A modern, secure web interface for browsing and querying Cloudflare D1 databases with a beautiful UI.

![Database Viewer Preview](./docs/assets/database-viewer-preview.png)

## ✨ Features

- **📊 Table Browser** - View all tables in your D1 database
- **🔍 Advanced Search** - Search across all text columns in real-time
- **📑 Pagination** - Efficiently browse large datasets
- **🔄 Sorting** - Sort by any column in ascending/descending order
- **🎨 Modern UI** - Clean, responsive design with dark mode support
- **📱 Mobile Friendly** - Works seamlessly on all devices
- **⚡ Fast** - Built on Cloudflare Workers for edge performance

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and pnpm
- Cloudflare account with D1 database
- Git

### Installation

1. **Clone and install**
   ```bash
   git clone https://github.com/your-username/ai-elements-chatbot.git
   cd ai-elements-chatbot
   pnpm install
   ```

2. **Set up backend**
   ```bash
   cd alleato-backend
   npm install
   
   # Configure your D1 database in wrangler.toml
   # Run migrations
   wrangler d1 execute alleato --local --file=./migrations/0001_init.sql
   ```

3. **Start development**
   ```bash
   # Terminal 1: Backend
   cd alleato-backend && npm run dev
   
   # Terminal 2: Frontend
   pnpm run dev
   ```

4. **Open browser**
   Navigate to http://localhost:3000/data/database

## 📖 Documentation

- [API Documentation](./docs/api/database-viewer.md) - REST API reference
- [Developer Guide](./docs/guides/database-viewer-developer-guide.md) - Comprehensive development guide
- [Backend API](./alleato-backend/API.md) - Backend service documentation

## 🏗️ Architecture

```
Frontend (Next.js)          Backend (Workers)         Database (D1)
┌─────────────────┐        ┌─────────────────┐      ┌─────────────┐
│   React Pages   │◄──────►│   REST API      │◄────►│   SQLite    │
│   TypeScript    │        │   Hono Router   │      │   Tables    │
│   Tailwind CSS  │        │   Validation    │      │   Indexes   │
└─────────────────┘        └─────────────────┘      └─────────────┘
```

## 🎯 Use Cases

- **Development** - Browse database during development
- **Debugging** - Inspect data and troubleshoot issues  
- **Admin Panel** - Provide read-only database access
- **Data Export** - View and export data (coming soon)

## ⚠️ Security Notice

**IMPORTANT**: This viewer currently lacks authentication. Before production use:

1. Implement authentication/authorization
2. Add rate limiting
3. Enhance input validation
4. Enable audit logging

See [Security Audit](./docs/SECURITY_AUDIT_DATABASE_VIEWER.md) for details.

## 🛠️ Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS
- **Backend**: Cloudflare Workers, Hono, D1 Database
- **UI**: shadcn/ui, Radix UI primitives
- **Deployment**: Vercel (frontend), Cloudflare (backend)

## 📸 Screenshots

### Table List View
Browse all tables with metadata like column count and indexes.

### Data View
View table data with:
- Column type indicators
- Formatted values (dates, booleans, JSON)
- Responsive pagination
- Real-time search
- Click-to-sort columns

## 🚧 Roadmap

- [ ] Authentication & Authorization
- [ ] Export functionality (CSV, JSON)
- [ ] Advanced filtering
- [ ] Query builder interface
- [ ] Schema visualization
- [ ] Performance analytics
- [ ] Audit logging

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](./docs/guides/database-viewer-developer-guide.md#contributing).

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

This project is part of the AI Elements Chatbot repository. See [LICENSE](./LICENSE) for details.

## 🙏 Acknowledgments

- Built with [shadcn/ui](https://ui.shadcn.com/)
- Powered by [Cloudflare Workers](https://workers.cloudflare.com/)
- UI components from [Radix UI](https://www.radix-ui.com/)

---

**Need help?** Check the [documentation](./docs/) or [open an issue](https://github.com/your-username/ai-elements-chatbot/issues).