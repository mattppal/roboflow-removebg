const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const app = express();

const upload = multer({ dest: 'temp/' });

app.post('/api/upload-temp-image', upload.single('image'), (req, res) => {
    if (!req.file) {
        return res.status(400).send('No file uploaded.');
    }
    const imageUrl = `${req.protocol}://${req.get('host')}/temp/${req.file.filename}`;
    res.json({ imageUrl });
});

app.post('/api/delete-temp-image', (req, res) => {
    const { imageUrl } = req.body;
    const filename = path.basename(imageUrl);
    const filePath = path.join(__dirname, 'temp', filename);

    fs.unlink(filePath, (err) => {
        if (err) {
            console.error('Error deleting file:', err);
            return res.status(500).send('Failed to delete temporary image.');
        }
        res.send('Temporary image deleted successfully.');
    });
});

app.use('/temp', express.static('temp'));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
