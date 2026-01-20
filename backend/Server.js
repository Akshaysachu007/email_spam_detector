const express = require('express');
const cors = require('cors');
const multer = require('multer');
const axios = require('axios');
const path = require('path');


const app = express();
app.use(cors());

const upload = multer({ dest: 'uploads/' });



// Endpoint to handle file upload and forward to analysis service
app.post('/upload', upload.single('file'), async (req, res) => {

    if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
    }
    try {
        const filepath = path.resolve(req.file.path);

        const response = await axios.post('http://localhost:8000/analyze', { filepath: filepath },
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            },
        );

        res.json(response.data);

    } catch (error) {
        console.error('Error processing file:', error.message);
        console.error('Error details:', error.response?.data || error);
        res.status(500).json({ error: 'Error processing file', details: error.message });

    }

});


//app listening on port 5000

app.listen(5000, () => {
    console.log('Server is running on port 5000');
});

