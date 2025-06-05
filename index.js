const express = require('express');

const PORT = 4300;

const app = express();

// test
app.post('/api/test', (req, res) => {

});

// tts
app.post('/api/tts', (req, res) => {

});

// cn2jp
app.post('/api/translate', (req, res) => {

});

// emotion labeling
app.post('/api/emotion', (req, res) => {

});

app.listen(PORT, () => {
  console.log(`PJSC Tools Backend listening on port ${PORT}`);
});
