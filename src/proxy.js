const express = require('express');
const cors = require('cors');
const axios = require('axios');
const app = express();

// Set env
require('dotenv').config(); // Load environment variables from .env

// Set whitelist
const whitelist = [
    `http://localhost:${process.env.FRONTEND_PORT}`,
];

const corsOptions = {
    origin: function (origin, callback) {
        if (whitelist.indexOf(origin) !== -1) { // Allow requests from the whitelist or no origin (for testing)
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    }
};

app.use(
    cors(corsOptions)
);

app.use(
    express.json() // To parse JSON request bodies
);

app.get('/api/:type', async (req, res) => {
    const apiType = req.params.type; // Observations, stations, jobs
    const stationId = req.query.stationId; // Ground station Id

    const url = `${process.env.API_URL}/api/${apiType}/?format=json`;
    
    try {
        apiUrl = '';

        if(apiType == 'observations') {
            apiUrl = `${url}&ground_station=${stationId}`;
        }
        else {
            apiUrl = `${url}&id=${stationId}`;
        }

        // Fetch data
        const response = await axios.get(apiUrl);
        const data = response.data;

        res.json(data);

    } catch (error) {
        msg = `Error fetching data: ${error}`;
        console.log(msg);

        res.status(500).json({ error: 'Failed to fetch data from the API'});   
    }
});

// Error handling middleware
app.use((err, req, res, next) => {
    if (err.message === 'Not allowed by CORS') {
        res.status(403).json({ error: 'CORS error: Access denied.' });
    } else {
        next(err); // Let other middleware handle other errors
    }
});

const port = process.env.BACKEND_PORT || 3000; 

app.listen(port, () => {
    console.log(`Proxy server listening at http://localhost:${port}`);
});
