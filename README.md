# Epoxy

**Visual Package & Module Manager for Packet SDK**

Epoxy is the visual powerhouse of Packet — configure everything through a beautiful desktop UI instead of editing config files.

> **Note**: This is designed to be a standalone repository. If you're setting up Epoxy for the first time, see [DEPLOYMENT.md](./DEPLOYMENT.md) for instructions on creating the GitHub repository and enabling automated builds.

## Features

- 🎨 **Visual Configuration** - Toggle features, edit env vars, manage packages through the UI
- 📦 **Package Manager** - Install and remove npm packages with real-time feedback
- 🧩 **Module System** - Add pre-built modules (auth, database, payments) with one click
- 🔧 **Config Editor** - Manage environment variables and Packet config visually
- 🔑 **License Integration** - Requires a free Epoxy license key from the dashboard

## Development

```bash
# Install dependencies
npm install

# Run in development mode
npm run electron:dev

# Build for production
npm run electron:build
```

## Building

### Local Build
```bash
npm run electron:build
```

This will build for your current platform and output to `release/`.

### Multi-Platform Build (GitHub Actions)

The project uses GitHub Actions to automatically build for Windows, macOS, and Linux.

**To create a new release:**

1. Update version in `package.json`
2. Commit and push changes
3. Create and push a version tag:
   ```bash
   git tag v1.0.0-beta.2
   git push origin v1.0.0-beta.2
   ```
4. GitHub Actions will automatically:
   - Build for Windows, macOS, and Linux
   - Create a GitHub Release
   - Upload all installers
   - (Optional) Update the website downloads

## Tech Stack

- **Electron** - Desktop application framework
- **React** - UI framework
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **Zustand** - State management
- **TypeScript** - Type safety

## Architecture

```
Epoxy/
├── electron/           # Main process (Node.js)
│   ├── main.ts        # App entry point
│   ├── preload.ts     # IPC bridge
│   └── services/      # Backend services
│       ├── project-scanner.ts
│       ├── package-manager.ts
│       ├── module-scaffolder.ts
│       ├── config-manager.ts
│       └── license-service.ts
├── src/               # Renderer process (React)
│   ├── components/    # UI components
│   ├── pages/         # Main pages
│   ├── stores/        # Zustand stores
│   └── types.d.ts     # TypeScript definitions
└── modules/           # Module definitions
```

## License

Epoxy requires a free license key. Get yours at [packit.dev/dashboard/epoxy](https://packit.dev/dashboard/epoxy).

## Links

- [Packet SDK](https://packit.dev)
- [Documentation](https://packit.dev/docs)
- [Dashboard](https://packit.dev/dashboard)
