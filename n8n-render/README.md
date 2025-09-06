# n8n Deployment on Render

This directory contains the configuration files needed to deploy n8n to Render for the Math Teacher AI Assistant.

## Files

- `Dockerfile` - Docker configuration for n8n
- `render.yaml` - Render deployment configuration
- `README.md` - This file

## Deployment Steps

### 1. Create a Render Account
- Go to [render.com](https://render.com)
- Sign up for a free account

### 2. Deploy n8n
- Create a new Web Service on Render
- Connect your GitHub repository
- Set the root directory to `n8n-render`
- Use the provided `render.yaml` configuration

### 3. Environment Variables
The following environment variables will be set automatically:
- `N8N_BASIC_AUTH_ACTIVE=true`
- `N8N_BASIC_AUTH_USER=admin`
- `N8N_BASIC_AUTH_PASSWORD` (auto-generated)
- `N8N_ENCRYPTION_KEY` (auto-generated)
- `WEBHOOK_URL` (your Render app URL)

### 4. Access n8n
- Once deployed, access n8n at: `https://your-app-name.onrender.com`
- Login with username: `admin` and the generated password

### 5. Import Your Workflow
- Export your existing workflow from local n8n
- Import it into the Render-hosted n8n
- Update webhook URLs to use the Render domain

### 6. Update Backend Configuration
Update `backend/server.js` with your Render n8n webhook URL:
```javascript
const n8nWebhookUrl = 'https://your-app-name.onrender.com/webhook/your-webhook-id';
```

## Webhook Configuration

Your n8n workflow should have:
1. **Webhook Trigger** - Receives messages from the web interface
2. **File Processing** - Handles audio and image files
3. **AI Processing** - Your existing AI agent logic
4. **Response Webhook** - Sends responses back to the web interface

## Security Notes

- Basic authentication is enabled
- Use HTTPS for all webhook URLs
- Keep your API keys secure in Render's environment variables
- Consider upgrading to a paid plan for better performance

## Troubleshooting

- Check Render logs for deployment issues
- Verify webhook URLs are using HTTPS
- Ensure all environment variables are set correctly
- Test webhook endpoints manually before integrating


