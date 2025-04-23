const express = require('express');
const { v4: uuidv4 } = require('uuid');
const cors = require('cors');

const app = express();
const PORT = 3000;

// Middleware
app.use(express.json());
app.use(cors());

// In-memory storage for emails and messages
const emailStore = {};

// Generate a temporary email
app.post('/generate-email', (req, res) => {
    const emailId = uuidv4();
    const email = `${emailId}@tempmail.com`;
    emailStore[email] = { createdAt: Date.now(), messages: [] };
    console.log(`Created temporary email: ${email}`);
    res.json({ email });
});

// Retrieve messages for a temporary email
app.get('/emails/:email', (req, res) => {
    const email = req.params.email;
    if (!emailStore[email]) {
        return res.status(404).json({ error: 'Email not found or expired' });
    }
    res.json({ messages: emailStore[email].messages });
});

// Simulate receiving an email (for testing)
app.post('/receive-email', (req, res) => {
    const { to, subject, body } = req.body;
    if (!emailStore[to]) {
        return res.status(404).json({ error: 'Email not found or expired' });
    }
    emailStore[to].messages.push({ subject, body, receivedAt: Date.now() });
    console.log(`Email received for ${to}`);
    res.json({ success: true });
});

// Periodically clean up expired emails
setInterval(() => {
    const TEN_MINUTES = 10 * 60 * 1000;
    const now = Date.now();
    for (const email in emailStore) {
        if (now - emailStore[email].createdAt > TEN_MINUTES) {
            delete emailStore[email];
            console.log(`Expired email deleted: ${email}`);
        }
    }
}, 60 * 1000); // Runs every minute

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
