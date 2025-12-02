const express = require('express');
const path = require('path');
const app = express();
const port = process.env.PORT || 3000;

// 1. Serve the static files (CSS, JS, Images) from the current folder
app.use(express.static(__dirname));

// 2. Send index.html for the root URL
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// 3. Start the server
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});