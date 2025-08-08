const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan('combined'));
app.use(express.json());

// Store troubleshooting document content
let troubleshootingContent = '';

// Load troubleshooting document on startup
const loadTroubleshootingDoc = () => {
  try {
    const docPath = path.join(__dirname, 'troubleshooting-guide.md');
    troubleshootingContent = fs.readFileSync(docPath, 'utf8');
    console.log('Troubleshooting document loaded successfully');
  } catch (error) {
    console.error('Error loading troubleshooting document:', error.message);
    troubleshootingContent = 'Error: Troubleshooting document not found';
  }
};

// API Routes

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'Azure App Configuration Troubleshooting API'
  });
});

// GET endpoint to retrieve troubleshooting document
app.get('/api/troubleshooting', (req, res) => {
  try {
    const format = req.query.format || 'markdown';
    
    if (format === 'json') {
      // Return structured JSON response
      res.json({
        title: 'Azure App Configuration - Feature Flag Creator Troubleshooting Guide',
        content: troubleshootingContent,
        timestamp: new Date().toISOString(),
        version: '1.0'
      });
    } else {
      // Return raw markdown
      res.setHeader('Content-Type', 'text/markdown');
      res.send({ data: { troubleshootingContent } });
    }
  } catch (error) {
    console.error('Error serving troubleshooting document:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to retrieve troubleshooting document'
    });
  }
});

// POST endpoint to serve troubleshooting document (as requested)
app.post('/api/troubleshooting', (req, res) => {
  try {
    const { format, section, requestId } = req.body;
    
    let responseContent = troubleshootingContent;
    
    // If specific section is requested, filter content
    if (section) {
      const sections = {
        'overview': 'Overview',
        'implementation': 'Implementation Steps',
        'queries': 'Query the AACHttpRequest Table',
        'analysis': 'Analyzing the Data',
        'best-practices': 'Best Practices for Tracking',
        'troubleshooting': 'Troubleshooting Common Issues',
        'alternatives': 'Alternative Solutions'
      };
      
      if (sections[section]) {
        const sectionRegex = new RegExp(`## ${sections[section]}[\\s\\S]*?(?=## |$)`, 'i');
        const match = troubleshootingContent.match(sectionRegex);
        responseContent = match ? match[0] : `Section "${section}" not found`;
      }
    }
    
    const response = {
      requestId: requestId || generateRequestId(),
      timestamp: new Date().toISOString(),
      title: 'Azure App Configuration - Feature Flag Creator Troubleshooting Guide',
      section: section || 'complete',
      format: format || 'markdown',
      content: responseContent,
      metadata: {
        contentLength: responseContent.length,
        lastUpdated: '2025-08-08',
        version: '1.0'
      }
    };
    
    if (format === 'html') {
      // Basic markdown to HTML conversion for display
      response.content = markdownToHtml(responseContent);
      response.format = 'html';
    }
    
    res.json({ data: { response } });
    
  } catch (error) {
    console.error('Error processing troubleshooting request:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to process troubleshooting request',
      requestId: req.body.requestId || generateRequestId()
    });
  }
});

// Endpoint to get available sections
app.get('/api/troubleshooting/sections', (req, res) => {
  const sections = [
    { id: 'overview', title: 'Overview', description: 'General problem statement and overview' },
    { id: 'implementation', title: 'Implementation Steps', description: 'Step-by-step implementation guide' },
    { id: 'queries', title: 'KQL Queries', description: 'Sample queries for Log Analytics' },
    { id: 'analysis', title: 'Data Analysis', description: 'How to analyze the monitoring data' },
    { id: 'best-practices', title: 'Best Practices', description: 'Recommended practices for tracking' },
    { id: 'troubleshooting', title: 'Troubleshooting', description: 'Common issues and solutions' },
    { id: 'alternatives', title: 'Alternative Solutions', description: 'Other approaches to the problem' }
  ];
  
  res.json({
    sections,
    timestamp: new Date().toISOString()
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: err.message
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Not found',
    message: 'The requested endpoint does not exist'
  });
});

// Utility functions
function generateRequestId() {
  return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

function markdownToHtml(markdown) {
  // Basic markdown to HTML conversion
  return markdown
    .replace(/^# (.*)/gm, '<h1>$1</h1>')
    .replace(/^## (.*)/gm, '<h2>$1</h2>')
    .replace(/^### (.*)/gm, '<h3>$1</h3>')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/`(.*?)`/g, '<code>$1</code>')
    .replace(/\n/g, '<br>')
    .replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>');
}

// Initialize server
const startServer = () => {
  loadTroubleshootingDoc();
  
  app.listen(PORT, () => {
    console.log(`
🚀 Azure App Configuration Troubleshooting API Server Started
📍 Port: ${PORT}
🕐 Time: ${new Date().toISOString()}
📋 Available endpoints:
   GET  /health
   GET  /api/troubleshooting
   POST /api/troubleshooting
   GET  /api/troubleshooting/sections
    `);
  });
};

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  process.exit(0);
});

// Start the server
if (require.main === module) {
  startServer();
}

module.exports = app;
