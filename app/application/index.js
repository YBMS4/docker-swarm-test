const http = require("http");
const express = require("express");
const path = require("path");

const app = express();
const server = http.createServer(app);

app.use(express.static(path.join(__dirname, "public")));

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

server.listen(3000, "0.0.0.0", () => {
  console.log("Front-end Server is running on port 3000");
});