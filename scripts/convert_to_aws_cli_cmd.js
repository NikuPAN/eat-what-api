const fs = require('fs');

const jsonFilePath = 'restaurants_dynamodb.json'; // Path to your JSON file
const outputFilePath = 'aws_cli_commands.sh'; // Path to the output script file

// Read the JSON file
const rawData = fs.readFileSync(jsonFilePath);
const jsonData = JSON.parse(rawData);

// Initialize an array to hold the AWS CLI commands
let commands = [];

// Iterate over each item in the JSON data
jsonData.Restaurants.forEach((entry) => {
    const item = entry.PutRequest.Item;
    const cliCommand = `aws dynamodb execute-statement --statement "INSERT INTO Restaurants VALUE { 'id': ${item.id.N}, 'Name': '${item.Name.S}', 'Cuisine': '${item.Cuisine.S}', 'Address': '${item.Address.S}', 'City': '${item.City.S}', 'PostalCode': '${item.PostalCode.S}', 'Latitude': ${item.Latitude.N}, 'Longitude': ${item.Longitude.N}, 'Website': '${item.Website.S}', 'OpeningHours': '${item.OpeningHours.S}', 'LastUpdated': '${item.LastUpdated.S}' }"`;
    commands.push(cliCommand);
});

// Write the commands to the output script file
fs.writeFileSync(outputFilePath, commands.join('\n'), 'utf-8');
console.log(`AWS CLI commands written to ${outputFilePath}`);