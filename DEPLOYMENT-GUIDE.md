# Math Teacher AI Assistant - Render Deployment Guide

This guide will help you deploy both n8n and the backend server to Render for a complete cloud-hosted solution.

## 🚀 Deployment Overview

You'll deploy two services to Render:
1. **n8n** - Your AI workflow engine
2. **Backend Server** - Node.js server that connects web interface to n8n

## 📋 Prerequisites

- Render account (free tier available)
- GitHub repository with your code
- OpenAI API key
- ElevenLabs API key

## 🔧 Step 1: Deploy n8n to Render

### 1.1 Create n8n Service
1. Go to [render.com](https://render.com) and sign in
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Set the following:
   - **Name**: `n8n-math-teacher`
   - **Root Directory**: `n8n-render`
   - **Environment**: `Docker`
   - **Dockerfile Path**: `./Dockerfile`

### 1.2 Configure Environment Variables
Add these environment variables in Render dashboard:
```
N8N_BASIC_AUTH_ACTIVE=true
N8N_BASIC_AUTH_USER=admin
N8N_BASIC_AUTH_PASSWORD=your-secure-password
N8N_ENCRYPTION_KEY=your-32-char-encryption-key
WEBHOOK_URL=https://n8n-math-teacher.onrender.com
N8N_METRICS=false
N8N_LOG_LEVEL=info
```

### 1.3 Deploy n8n
- Click "Create Web Service"
- Wait for deployment (5-10 minutes)
- Note your n8n URL: `https://n8n-math-teacher.onrender.com`

## 🔧 Step 2: Configure n8n Workflow

### 2.1 Access n8n
1. Go to your n8n URL
2. Login with username: `admin` and your password
3. Import the workflow from `n8n-render/math-teacher-workflow.json`

### 2.2 Update Workflow Settings
1. **Webhook Trigger**: 
   - URL: `https://n8n-math-teacher.onrender.com/webhook/webhook-trigger`
   - Method: POST
   - Accept: All file types

2. **Response Webhook**:
   - Update URL to your backend service URL
   - Method: POST

3. **API Credentials**:
   - Add OpenAI API credentials
   - Add ElevenLabs API credentials

### 2.3 Activate Workflow
- Click "Activate" to make the workflow live
- Test the webhook endpoint

## 🔧 Step 3: Deploy Backend Server

### 3.1 Create Backend Service
1. In Render dashboard, click "New +" → "Web Service"
2. Connect your GitHub repository
3. Set the following:
   - **Name**: `math-teacher-backend`
   - **Root Directory**: `backend`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`

### 3.2 Configure Environment Variables
```
NODE_ENV=production
PORT=10000
N8N_WEBHOOK_URL=https://n8n-math-teacher.onrender.com/webhook/webhook-trigger
```

### 3.3 Deploy Backend
- Click "Create Web Service"
- Wait for deployment
- Note your backend URL: `https://math-teacher-backend.onrender.com`

## 🔧 Step 4: Update Frontend Configuration

### 4.1 Update WebSocket Connection
In `frontend/math-teacher/src/App.jsx`, update the socket connection:
```javascript
const newSocket = io('https://math-teacher-backend.onrender.com', {
  transports: ['websocket']
});
```

### 4.2 Update API Endpoint
In `frontend/math-teacher/src/App.jsx`, update the API URL:
```javascript
const response = await axios.post('https://math-teacher-backend.onrender.com/api/message', formData, {
  headers: {
    'Content-Type': 'multipart/form-data',
  },
});
```

## 🔧 Step 5: Deploy Frontend (Optional)

### 5.1 Build Frontend
```bash
cd frontend/math-teacher
npm run build
```

### 5.2 Deploy to Render
1. Create a new Static Site in Render
2. Connect your GitHub repository
3. Set:
   - **Root Directory**: `frontend/math-teacher`
   - **Build Command**: `npm run build`
   - **Publish Directory**: `dist`

## 🧪 Testing Your Deployment

### Test n8n Webhook
```bash
curl -X POST https://n8n-math-teacher.onrender.com/webhook/webhook-trigger \
  -H "Content-Type: application/json" \
  -d '{"message":{"text":"Hello, can you help me with math?"}}'
```

### Test Backend Health
```bash
curl https://math-teacher-backend.onrender.com/health
```

### Test Complete Flow
1. Open your frontend URL
2. Send a text message
3. Check n8n execution logs
4. Verify response appears in web interface

## 🔒 Security Considerations

- Use HTTPS for all services
- Keep API keys secure in Render environment variables
- Enable basic authentication for n8n
- Consider upgrading to paid plans for better performance
- Set up proper CORS policies

## 🚨 Troubleshooting

### Common Issues

1. **n8n Not Starting**
   - Check environment variables
   - Verify Dockerfile syntax
   - Check Render logs

2. **Webhook Not Working**
   - Verify webhook URLs are correct
   - Check HTTPS certificates
   - Test webhook endpoints manually

3. **Backend Connection Issues**
   - Verify CORS settings
   - Check WebSocket configuration
   - Test API endpoints

4. **Frontend Not Loading**
   - Check build process
   - Verify static file serving
   - Check browser console for errors

### Debug Steps
1. Check Render service logs
2. Test individual components
3. Verify environment variables
4. Check network connectivity
5. Test with curl commands

## 📈 Scaling Considerations

- **Free Tier Limits**: 750 hours/month per service
- **Performance**: Consider upgrading to paid plans
- **Database**: Add PostgreSQL for persistent storage
- **CDN**: Use Render's CDN for static assets
- **Monitoring**: Set up health checks and alerts

## 🎯 Next Steps

1. **Monitor Performance**: Use Render's metrics dashboard
2. **Set Up Alerts**: Configure notifications for downtime
3. **Backup Workflows**: Export n8n workflows regularly
4. **Update Dependencies**: Keep packages up to date
5. **Add Features**: Extend functionality as needed

Your Math Teacher AI Assistant is now fully cloud-hosted and accessible from anywhere! 🎉


