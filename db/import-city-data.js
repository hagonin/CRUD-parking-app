const fs = require('fs');
const path = require('path');
const { connect, disconnect } = require('./connection');

const COLLECTION_NAME = 'city';

/**
 * Imports city data from JSON file into MongoDB
 * Handles JSON array format with MongoDB extended JSON
 * @param {string} filePath - Path to city.json
 * @returns {Promise<number>} Number of documents imported
 */
async function importCities(filePath) {
  const db = await connect();
  const collection = db.collection(COLLECTION_NAME);

  // Drop existing collection to avoid duplicates
  try {
    await collection.drop();
    console.log('✓ Dropped existing collection');
  } catch (error) {
    // Collection doesn't exist yet, that's fine
  }

  console.log('Reading city data...');

  // Read and parse JSON file
  const fileContent = fs.readFileSync(filePath, 'utf8');
  const cities = JSON.parse(fileContent);

  if (!Array.isArray(cities)) {
    throw new Error('Invalid city data format: expected array');
  }

  console.log(`Importing ${cities.length} cities...`);

  // Clean up MongoDB extended JSON format (_id.$oid)
  const cleanedCities = cities.map(city => {
    const cleanCity = { ...city };

    // Remove the extended JSON _id format, let MongoDB generate new IDs
    delete cleanCity._id;

    return cleanCity;
  });

  // Insert all cities
  const result = await collection.insertMany(cleanedCities);
  const totalCount = result.insertedCount;

  console.log(`✓ Imported ${totalCount} cities successfully`);

  // Create indexes for better query performance
  try {
    await collection.createIndex({ city_name: 1 }, { unique: true });
    await collection.createIndex({ 'coordinates.latitude': 1, 'coordinates.longitude': 1 });
    await collection.createIndex({ tags: 1 });
    console.log('✓ Created indexes on city_name, coordinates, and tags');
  } catch (error) {
    console.error('Failed to create indexes:', error.message);
  }

  return totalCount;
}

/**
 * Main execution function
 */
async function main() {
  try {
    const filePath = path.join(__dirname, '..', 'city.json');

    if (!fs.existsSync(filePath)) {
      throw new Error(`File not found: ${filePath}`);
    }

    const count = await importCities(filePath);
    console.log(`\n✓ Import completed: ${count} cities in database`);
  } catch (error) {
    console.error('✗ Import failed:', error.message);
    process.exit(1);
  } finally {
    await disconnect();
  }
}

// Run if executed directly
if (require.main === module) {
  main();
}

module.exports = { importCities };
