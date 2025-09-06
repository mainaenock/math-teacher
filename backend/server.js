const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const multer = require('multer');
const axios = require('axios');
const FormData = require('form-data');
const path = require('path');
const fs = require('fs');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(express.json());
app.use(express.static('public'));

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads/';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

// Store active connections
const activeConnections = new Map();

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
  
  activeConnections.set(socket.id, {
    socket: socket,
    connectedAt: new Date()
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
    activeConnections.delete(socket.id);
  });
});

// API endpoint to receive messages from web interface
app.post('/api/message', upload.fields([
  { name: 'text', maxCount: 1 },
  { name: 'audio', maxCount: 1 },
  { name: 'image', maxCount: 1 }
]), async (req, res) => {
  try {
    const { text } = req.body;
    const audioFile = req.files?.audio?.[0];
    const imageFile = req.files?.image?.[0];

    console.log('Received message:', { text, audioFile: !!audioFile, imageFile: !!imageFile });

    // Prepare data for n8n webhook
    const webhookData = {
      message: {
        chat: { id: 'web-interface' },
        text: text || '',
        voice: audioFile ? { file_id: audioFile.filename } : null,
        photo: imageFile ? [{ file_id: imageFile.filename }] : null
      }
    };

    // Send to n8n webhook (Render-hosted)
    const n8nWebhookUrl = 'https://your-n8n-app.onrender.com/webhook/webhook-trigger'; // Replace with your actual Render n8n webhook URL
    
    try {
      const formData = new FormData();
      formData.append('data', JSON.stringify(webhookData));
      
      if (audioFile) {
        formData.append('audio', fs.createReadStream(audioFile.path), {
          filename: audioFile.originalname,
          contentType: audioFile.mimetype
        });
      }
      
      if (imageFile) {
        formData.append('image', fs.createReadStream(imageFile.path), {
          filename: imageFile.originalname,
          contentType: imageFile.mimetype
        });
      }

      const n8nResponse = await axios.post(n8nWebhookUrl, formData, {
        headers: {
          ...formData.getHeaders(),
        },
        timeout: 30000
      });

      console.log('n8n response:', n8nResponse.data);

      // Process the response from n8n
      if (n8nResponse.data) {
        // Send response back to all connected clients
        io.emit('ai_response', {
          text: n8nResponse.data.text || n8nResponse.data.output,
          audio: n8nResponse.data.audio || null,
          timestamp: new Date()
        });
      }

    } catch (n8nError) {
      console.error('Error calling n8n webhook:', n8nError.message);
      
      // Send error response to clients
      io.emit('ai_response', {
        text: 'Sorry, I encountered an error processing your request. Please try again.',
        error: true,
        timestamp: new Date()
      });
    }

    res.json({ success: true, message: 'Message processed' });

  } catch (error) {
    console.error('Error processing message:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Endpoint to receive responses from n8n (webhook callback)
app.post('/webhook/n8n-response', (req, res) => {
  try {
    console.log('Received response from n8n:', req.body);
    
    // Forward the response to all connected clients
    io.emit('ai_response', {
      text: req.body.text || req.body.output,
      audio: req.body.audio || null,
      timestamp: new Date()
    });

    res.json({ success: true });
  } catch (error) {
    console.error('Error processing n8n response:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    connections: activeConnections.size,
    timestamp: new Date().toISOString()
  });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Backend server running on port ${PORT}`);
  console.log(`WebSocket server ready for connections`);
  console.log(`Health check available at http://localhost:${PORT}/health`);
});

// Cleanup function
process.on('SIGINT', () => {
  console.log('Shutting down server...');
  
  // Clean up uploaded files
  const uploadDir = 'uploads/';
  if (fs.existsSync(uploadDir)) {
    fs.readdirSync(uploadDir).forEach(file => {
      fs.unlinkSync(path.join(uploadDir, file));
    });
  }
  
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});