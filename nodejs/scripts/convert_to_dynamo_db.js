const fs = require('fs');
const moment = require('moment');

// Get the current date and time in ISO 8601 format
const now = moment().toISOString();
console.log('Current date and time:', now);

// Read the JSON file
const rawData = fs.readFileSync('./Brisbane_Restaurant_V1.json');
//console.log(rawData);

const restaurants = JSON.parse(rawData).Restaurants;

// Convert to DynamoDB format
const dynamoDbItems = restaurants.map(item => {
    return {
        PutRequest: {
            Item: {
                id: { N: item.id.toString() },
                Name: { S: item.Name },
                Cuisine: { S: item.Cuisine },
                Address: { S: item.Address },
                City: { S: item.City },
                PostalCode: { S: item.PostalCode },
                Latitude: { N: item.Latitude.toString() },
                Longitude: { N: item.Longitude.toString() },
                Website: { S: item.Website },
                OpeningHours: { S: item.OpeningHours },
                LastUpdated: { S: now }
            }
        }
    };
});

const output = {
    Restaurants: dynamoDbItems
};

// Write the output to a new JSON file
fs.writeFileSync('restaurants_dynamodb.json', JSON.stringify(output, null, 2));
console.log('Conversion completed. Output written to restaurants_dynamodb.json.');