const express = require('express');
const cors = require('cors');
const axios = require('axios');
const app = express();

// Set env
require('dotenv').config(); // Load environment variables from .env

// Set whitelist
const whitelist = [
    process.env.FRONT_URL,
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
    const apiType = req.params.type; // Observations, stations, jobs, satellites
    const id = req.query.id; // Ground station Id or Satellite Id

    let apiUrl = ''; 
    let headers = {};

    try {

        if (apiType == 'satellites') {

            apiUrl = `${process.env.DB_URL}/api/satellites/${id}/?format=json`; 

            headers = { 
                'accept': "application/json",
                'Authorization': `${process.env.API_KEY}`,
                'Cookie': `sessionid=${process.env.API_KEY}` // Add Cookie header
            };
        } else {

            apiUrl = `${process.env.API_URL}/api/${apiType}`;

            if(apiType == 'observations') {
                apiUrl = `${apiUrl}/?format=json&ground_station=${id}`;
            } else {
                apiUrl = `${apiUrl}/?format=json&id=${id}`;
            }
        }

        // Fetch data
        const response = await axios.get(apiUrl, { headers });
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

const port = process.env.PORT; 

app.listen(port, () => {
    console.log(`Proxy server listening at port: ${port}`);
});
