const http = require('http');
const fs = require('fs'); // Node.js file system module
const server = http.createServer();
const WebSocket = require('ws');
const mysql = require('mysql2');

const db = mysql.createConnection({
  host: '127.0.0.1',
  user: 'root',
  password: 'password',
  database: 'cricket',
});

const wss = new WebSocket.Server({ server });

// Serve the HTML file when a client accesses the root URL
server.on('request', (req, res) => {
  if (req.url === '/') {
    // Read the HTML file and serve it
    fs.readFile('insert_index.html', 'utf8', (err, data) => {
      if (err) {
        res.writeHead(500);
        res.end('Error loading insert_index.html');
      } else {
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(data);
      }
    });
  }
});

// Initialize the WebSocket server
wss.on('connection', (ws) => {
  ws.on('message', (message) => {
    // Handle incoming messages (e.g., insert data into the database)
    const data = JSON.parse(message);

    if (data.action === 'insertData') {
      // Insert data into the database
      const { MatchID, TeamID, RunsScored, WicketsTaken, OversBowled } = data;
      const insertQuery = `INSERT INTO live_score (MatchID, TeamID, RunsScored, WicketsTaken, OversBowled) VALUES (?, ?, ?, ?, ?)`;
      db.query(
        insertQuery,
        [MatchID, TeamID, RunsScored, WicketsTaken, OversBowled],
        (err, result) => {
          if (err) {
            console.error('Error inserting data:', err);
          } else {
            console.log('Data inserted successfully');
            // Notify clients about the update
            wss.clients.forEach((client) => {
              if (client !== ws && client.readyState === WebSocket.OPEN) {
                // Send a message to the client
                client.send('Data has been updated!');
              }
            });
          }
        }
      );
    }
  });
});

db.connect((err) => {
  if (err) {
    console.error('Database connection error:', err);
  } else {
    console.log('Connected to the database');
  }
});

server.listen(8080, () => {
  console.log('WebSocket server is running on port 8080');
});
