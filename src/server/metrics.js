// server.js
const express = require('express');
const path = require('path');
const compression = require('compression');
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(compression());
app.use(express.json());

// In-memory metrics storage
let metricsData = '';

// Metrics reporting endpoint
app.post('/metrics-report', (req, res) => {
  let data = '';
  req.on('data', chunk => {
    data += chunk;
  });
  
  req.on('end', () => {
    metricsData = data;
    res.status(200).send('Metrics received');
  });
});

// Metrics endpoint for Prometheus
app.get('/metrics', (req, res) => {
  res.set('Content-Type', 'text/plain');
  res.send(metricsData);
});

// Serve static files
app.use(express.static(path.join(__dirname, 'build')));

// Handle React routing, return all requests to React app
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});
