# Deployment Guide - Secular Forum Hub

## Azure App Service Deployment

The Secular Forum Hub is a Next.js application using Prisma with SQLite (for this demo phase) or Azure SQL (production).

### Prerequisites
- Azure CLI installed
- GitHub Account connected to Azure

### Environment Variables
Configure these in Azure App Service "Configuration" -> "Application Settings":

```env
DATABASE_URL="file:./dev.db"  # Or your Azure SQL connection string
NEXT_PUBLIC_APP_URL="https://your-app-name.azurewebsites.net"
AZURE_OPENAI_ENDPOINT="https://..."
AZURE_OPENAI_KEY="..."
AZURE_OPENAI_DEPLOYMENT_NAME="..."
```

### Steps

1. **Create App Service Plan**
   ```bash
   az appservice plan create --name secular-plan --resource-group arbitrary-group --sku B1 --is-linux
   ```

2. **Create Web App**
   ```bash
   az webapp create --resource-group arbitrary-group --plan secular-plan --name secular-forum-hub --runtime "NODE:18-lts"
   ```

3. **Configure Startup Command**
   Set the startup command to:
   ```bash
   npm run start
   ```

4. **Deploy Code**
   Detailed in `.github/workflows/deploy.yml`. Pushing to `main` triggers deployment.

### SQLite Note
For the demo, we are using SQLite. Azure App Service files are ephemeral unless stored in `/home`. 
**Recommendation**: For the live demo, use the included Docker container or ensure `dev.db` is part of the build artifact (it is currently Git-ignored, so you must seed it during build or remove from .gitignore for the demo repo).

*Workaround utilized*: The build script `npm run build` generates the Prisma Client. Ensure `prisma db push` is run if using a fresh DB.

## Troubleshooting
See [TROUBLESHOOTING.md](./TROUBLESHOOTING.md).
