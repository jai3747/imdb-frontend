// src/server/metrics.js
const express = require('express');
const router = express.Router();

// Store metrics in memory (simple implementation)
let metricsData = '';

// Endpoint to receive metrics from client
router.post('/', (req, res) => {
  let data = '';
  req.on('data', chunk => {
    data += chunk;
  });
  
  req.on('end', () => {
    metricsData = data;
    res.status(200).send('Metrics received');
  });
});

// Endpoint to expose metrics to Prometheus
router.get('/', (req, res) => {
  res.set('Content-Type', 'text/plain');
  res.send(metricsData);
});

module.exports = router;

// Add this to your express server setup:
/*
const metricsRouter = require('./metrics');
app.use('/metrics', metricsRouter);
*/
