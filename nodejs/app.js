// Import required modules
const express = require('express');
const moment = require('moment');
const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, ScanCommand, GetCommand, PutCommand, UpdateCommand, DeleteCommand } = require('@aws-sdk/lib-dynamodb');

// Set up AWS DynamoDB client and document client
const REGION = 'ap-southeast-2'; // Replace with your DynamoDB region
const dynamodbClient = new DynamoDBClient({ region: REGION });
const dynamoDbDocClient = DynamoDBDocumentClient.from(dynamodbClient);

// Initialize Express app
const app = express();
app.use(express.json()); // Middleware to parse JSON request bodies

// Define API routes
const API_ROUTE = '/api/v1/eatWhat'

// Get all restaurants
app.get(`${API_ROUTE}/getAll`, async (req, res) => {
    const time = moment().toISOString();
    try {
        const params = {
            TableName: 'Restaurants'
        };
        const data = await dynamoDbDocClient.send(new ScanCommand(params));
        res.setHeader('Content-Type', 'application/json');
        res.send(JSON.stringify(data.Items, null, 2));
        console.log(time + ": fetched getAll from database, returned "+data.Items.length+" results.");
    } catch (err) {
        console.error(time + ": Error fetching restaurants:", err);
        res.status(500).json({ error: 'Could not fetch restaurants' });
    }
});

// Get a specific restaurant by ID
app.get(`${API_ROUTE}/get/:id`, async (req, res) => {
    const time = moment().toISOString();
    try {
        const { id } = req.params;
        const params = {
            TableName: 'Restaurants',
            Key: { id }
        };
        const data = await dynamoDbDocClient.send(new GetCommand(params));
        if (!data.Item) {
            return res.status(404).json({ error: 'Restaurant not found' });
        }
        res.setHeader('Content-Type', 'application/json');
        res.send(JSON.stringify(data.Item, null, 2));
        console.log(time + ": fetched restaurant id "+id+" from database, returned "+data.Item.length+" results.");
    } catch (err) {
        console.error(time + ": Error fetching restaurant:", err);
        res.status(500).json({ error: 'Could not fetch restaurant' });
    }
});

// Add a new restaurant
app.post(`${API_ROUTE}/add`, async (req, res) => {
    const time = moment().toISOString();
    try {
        const { name, cuisine, address, city, postalCode, latitude, longitude, website, openingHours } = req.body;
        const params = {
            TableName: 'Restaurants',
            Item: { name, cuisine, address, city, postalCode, latitude, longitude, website, openingHours, "LastUpdated": time }
        };
        await dynamoDbDocClient.send(new PutCommand(params));
        res.json({ message: 'Restaurant added successfully', restaurant: params.Item });
        console.log(time + ": added restaurant id "+id+".", params.Item);
    } catch (err) {
        console.error(time + ": Error adding restaurant:", err);
        res.status(500).json({ error: 'Could not add restaurant' });
    }
});

// Update an existing restaurant
app.put(`${API_ROUTE}/update/:id`, async (req, res) => {
    const time = moment().toISOString();
    try {
        const { id } = req.params;
        const { name, cuisine, address, city, postalCode, latitude, longitude, website, openingHours } = req.body;
        const params = {
            TableName: 'Restaurants',
            Key: { id },
            UpdateExpression: 'SET #n = :n, cuisine = :c, address = :a, city = :ci, postalCode = :pc, latitude = :lat, longitude = :long, website = :web, openingHours = :oh, lastUpdated = :lu',
            ExpressionAttributeNames: { '#n': 'name' },
            ExpressionAttributeValues: {
                ':n': name,
                ':c': cuisine,
                ':a': address,
                ':ci': city,
                ':pc': postalCode,
                ':lat': latitude,
                ':long': longitude,
                ':web': website,
                ':oh': openingHours,
                ':lu': time
            },
            ReturnValues: 'ALL_NEW'
        };
        const data = await dynamoDbDocClient.send(new UpdateCommand(params));
        res.json({ message: 'Restaurant updated successfully', restaurant: data.Attributes });
        console.log(time + ": Update restaurant id "+id+".");
    } catch (err) {
        console.error(time + ": Error updating restaurant:", err);
        res.status(500).json({ error: 'Could not update restaurant' });
    }
});

// Remove a restaurant
app.delete(`${API_ROUTE}/delete/:id`, async (req, res) => {
    const time = moment().toISOString();
    try {
        const { id } = req.params;
        const params = {
            TableName: 'Restaurants', // Replace with your DynamoDB table name
            Key: { id }
        };
        await dynamoDbDocClient.send(new DeleteCommand(params));
        res.json({ message: 'Restaurant deleted successfully' });
        console.log(time + ": Deleted restaurant id "+id+".");
    } catch (err) {
        console.error(time + ": Error deleting restaurant:", err);
        res.status(500).json({ error: 'Could not delete restaurant' });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
