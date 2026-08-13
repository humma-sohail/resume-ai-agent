const express = require('express');
const app = express();
const PORT = process.env.PORT || 5003;

app.use(express.json());

app.get('/', (req, res) => {
  res.send('Chat Service Running');
});

app.listen(PORT, () => {
  console.log(`Chat Service running on port ${PORT}`);
});