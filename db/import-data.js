const fs = require('fs');
const readline = require('readline');
const path = require('path');
const { connect, disconnect } = require('./connection');

const COLLECTION_NAME = 'games';
const BATCH_SIZE = 1000; // Insert in batches for performance

/**
 * Imports console games data from JSON file into MongoDB
 * Uses streaming to handle large files efficiently
 * @param {string} filePath - Path to console_games.json
 * @returns {Promise<number>} Number of documents imported
 */
async function importGames(filePath) {
  const db = await connect();
  const collection = db.collection(COLLECTION_NAME);

  // Drop existing collection to avoid duplicates
  try {
    await collection.drop();
    console.log(' Dropped existing collection');
  } catch (error) {
    // Collection doesn't exist yet, that's fine
  }

  const fileStream = fs.createReadStream(filePath);
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });

  let batch = [];
  let totalCount = 0;
  let lineNumber = 0;
  let errorCount = 0;
  const errors = [];

  console.log(' Importing games data...');

  for await (const line of rl) {
    lineNumber++;

    // Skip empty lines
    if (!line.trim()) {
      continue;
    }

    try {
      // Each line is a complete JSON object
      const game = JSON.parse(line);
      batch.push(game);

      // Insert batch when it reaches BATCH_SIZE
      if (batch.length >= BATCH_SIZE) {
        await collection.insertMany(batch);
        totalCount += batch.length;
        process.stdout.write(`\rImported ${totalCount} games...`);
        batch = [];
      }
    } catch (error) {
      errorCount++;
      errors.push({ line: lineNumber, error: error.message });
      console.error(`\n Error parsing line ${lineNumber}:`, error.message);

      // Fail fast if too many errors
      if (errorCount > 100) {
        throw new Error(`Too many parse errors (${errorCount}). Import aborted.`);
      }
    }
  }

  // Insert remaining games in the last batch
  if (batch.length > 0) {
    await collection.insertMany(batch);
    totalCount += batch.length;
  }

  console.log(`\n Imported ${totalCount} games successfully`);

  // Report errors if any occurred
  if (errorCount > 0) {
    console.warn(` Import completed with ${errorCount} parse errors`);
  }

  // Create indexes for better query performance
  try {
    await collection.createIndex({ Platform: 1 });
    await collection.createIndex({ Platform: 1, Year: 1 });
    await collection.createIndex({ Global_Sales: -1 });
    console.log(' Created indexes on Platform, Year, and Global_Sales');
  } catch (error) {
    console.error(' Failed to create indexes:', error.message);
    // Continue - indexes are performance optimization, not critical for functionality
  }

  return totalCount;
}

/**
 * Main execution function
 */
async function main() {
  try {
    const filePath = path.join(__dirname, '..', 'console_games.json');

    if (!fs.existsSync(filePath)) {
      throw new Error(`File not found: ${filePath}`);
    }

    const count = await importGames(filePath);
    console.log(`\nImport completed: ${count} games in database`);
  } catch (error) {
    console.error(' Import failed:', error.message);
    process.exit(1);
  } finally {
    await disconnect();
  }
}

// Run if executed directly
if (require.main === module) {
  main();
}

module.exports = { importGames };
