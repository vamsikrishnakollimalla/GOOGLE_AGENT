const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { SessionsClient } = require('@google-cloud/dialogflow-cx');

const app = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Dialogflow CX configuration
const projectId = 'your-project-id';
const location = 'your-location'; // e.g., 'us-central1'
const agentId = 'your-agent-id';
const languageCode = 'en';

// Initialize Dialogflow CX client
const client = new SessionsClient();

// Endpoint to handle chat messages
app.post('/api/chat', async (req, res) => {
  try {
    const { message, sessionId } = req.body;
    
    // Create session path
    const sessionPath = client.projectLocationAgentSessionPath(
      projectId,
      location,
      agentId,
      sessionId
    );

    // Create the request
    const request = {
      session: sessionPath,
      queryInput: {
        text: {
          text: message,
        },
        languageCode: languageCode,
      },
    };

    // Send request to Dialogflow CX
    const [response] = await client.detectIntent(request);
    
    // Extract response messages
    const responseMessages = response.queryResult.responseMessages.map(msg => {
      if (msg.text) {
        return msg.text.text[0];
      }
      return '';
    }).filter(text => text !== '');

    res.json({
      success: true,
      responses: responseMessages,
      intent: response.queryResult.intent?.displayName || 'Default',
      confidence: response.queryResult.intentDetectionConfidence || 0
    });

  } catch (error) {
    console.error('Error calling Dialogflow CX:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to process message'
    });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK' });
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});