const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const port = 4000;

app.use('/assets', express.static(path.join(__dirname, 'assets')));


app.use('/html', express.static(path.join(__dirname, 'html')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(port, '0.0.0.0', () => {
    console.log(`TubeYou listening at http://localhost:${port}`);
});