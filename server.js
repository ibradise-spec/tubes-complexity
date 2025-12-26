// server.js - ES Module version
import express from 'express';
import cors from 'cors';

const app = express();

app.use(cors());
app.use(express.json());

// Health endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: "healthy",
    service: "C++ API Server Simulator",
    timestamp: new Date().toISOString(),
    version: "1.0.0",
    platform: "Node.js ES Module",
    endpoints: [
      "/api/health",
      "/api/search?size={number}",
      "/api/complexity",
      "/api/batch?sizes={comma-separated-numbers}"
    ]
  });
});

// Search endpoint
app.get('/api/search', (req, res) => {
  const size = parseInt(req.query.size) || 1000;
  
  if (size > 100000) {
    return res.status(400).json({
      error: "Size too large",
      message: "Maximum size is 100,000 elements",
      max_size: 100000
    });
  }
  
  const baseTimePerElement = 0.0005;
  const executionTimeMs = (size * baseTimePerElement).toFixed(6);
  const targetIndex = Math.floor(Math.random() * size);
  const comparisons = targetIndex + 1;
  
  res.json({
    data_size: size,
    algorithm: "linear_search_iterative",
    execution_time_ms: parseFloat(executionTimeMs),
    execution_time_ns: Math.floor(parseFloat(executionTimeMs) * 1000000),
    comparisons: comparisons,
    target: `VID_${1000000 + targetIndex}`,
    target_index: targetIndex,
    found: true,
    complexity: "O(n)",
    best_case: "O(1)",
    worst_case: "O(n)",
    space_complexity: "O(1)",
    notes: "Iterative linear search simulation"
  });
});

// Complexity endpoint
app.get('/api/complexity', (req, res) => {
  res.json({
    algorithm: "Linear Search",
    description: "Sequentially checks each element until target is found",
    time_complexity: {
      best_case: "O(1) - element found at first position",
      average_case: "O(n) - element found at middle position",
      worst_case: "O(n) - element not found or at last position"
    },
    space_complexity: {
      iterative: "O(1) - constant extra space",
      recursive: "O(n) - stack space for recursion"
    }
  });
});

// Batch endpoint
app.get('/api/batch', (req, res) => {
  const sizes = (req.query.sizes || "100,500,1000,5000").split(',').map(Number);
  
  const results = sizes.map(size => {
    const baseTime = 0.0005;
    return {
      size: size,
      time_ms: (size * baseTime).toFixed(6),
      comparisons: Math.floor(size * 0.5),
      algorithm: "linear_search_iterative",
      complexity: "O(n)"
    };
  });
  
  res.json({
    algorithm: "Linear Search",
    sizes_tested: sizes,
    results: results,
    timestamp: new Date().toISOString()
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: "Linear Search API Server",
    description: "Backend API for complexity analysis",
    frontend: "http://localhost:5173",
    health_check: "http://localhost:8080/api/health"
  });
});

const PORT = 8080;
app.listen(PORT, () => {
  console.log(`
  ╔══════════════════════════════════════════════════╗
  ║     LINEAR SEARCH BACKEND SERVER                 ║
  ║     Port: ${PORT}                                ║
  ╚══════════════════════════════════════════════════╝
  
  📡 Server: http://localhost:${PORT}
  🔍 Health: http://localhost:${PORT}/api/health
  
  🌐 Frontend: http://localhost:5173
  `);
});