const express = require('express');
const mysql = require('mysql2');
const app = express();
const port = 3000;

// Create a MySQL database connection
const db = mysql.createConnection({
  host: '127.0.0.1',
  user: 'root',
  password: 'password',
  database: 'cricket',
});

// Connect to the database
db.connect((err) => {
  if (err) {
    console.error('Error connecting to the database:', err);
    return;
  }
  console.log('Connected to the database');
});

// Serve the index.html file
app.get('/', (req, res) => {
  res.sendFile('C:\\Users\\Ashmi\\IBP\\update_index.html'); // Provide the full path to your index.html file
});

// Define an API endpoint to fetch the most recent live score
app.get('/api/live_score/latest', (req, res) => {
  // Query the database to fetch the most recent live score
  db.query('SELECT * FROM live_score ORDER BY LiveScoreID DESC LIMIT 1', (err, results) => {
    if (err) {
      console.error('Error fetching latest live score:', err);
      res.status(500).json({ error: 'Internal Server Error' });
      return;
    }
    res.json(results[0]); // Send the first (and only) result as JSON
  });
});

// Start the Express server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
