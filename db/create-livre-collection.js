const { connect, disconnect } = require('./connection');

const COLLECTION_NAME = 'livre';

/**
 * Creates the 'livre' collection with MongoDB schema validation
 *
 * Validation rules:
 * - titre: string, unique (enforced by index)
 * - auteur: string, non-empty (minLength: 1)
 * - année: integer > 1900 (minimum: 1901)
 * - genre: optional string
 */
async function createLivreCollection() {
  const db = await connect();

  // Drop collection if exists (for clean setup)
  try {
    await db.collection(COLLECTION_NAME).drop();
    console.log('✓ Dropped existing collection');
  } catch (error) {
    // Collection doesn't exist yet, that's fine
  }

  // Create collection with schema validation
  await db.createCollection(COLLECTION_NAME, {
    validator: {
      $jsonSchema: {
        bsonType: 'object',
        required: ['titre', 'auteur', 'année'],
        properties: {
          titre: {
            bsonType: 'string',
            description: 'titre must be a string and is required'
          },
          auteur: {
            bsonType: 'string',
            minLength: 1,
            description: 'auteur must be a non-empty string and is required'
          },
          année: {
            bsonType: 'int',
            minimum: 1901,
            description: 'année must be an integer > 1900 and is required'
          },
          genre: {
            bsonType: ['string', 'null'],
            description: 'genre is an optional string'
          }
        }
      }
    },
    validationAction: 'error',  // Reject invalid documents
    validationLevel: 'strict'    // Apply to all inserts and updates
  });

  console.log('✓ Created collection with schema validation');

  // Create unique index on titre
  const collection = db.collection(COLLECTION_NAME);
  await collection.createIndex({ titre: 1 }, { unique: true });
  console.log('Created unique index on titre field');

  // Verify collection and validation rules
  const collectionInfo = await db.listCollections({ name: COLLECTION_NAME }).toArray();
  console.log('\n Collection Info:');
  console.log(JSON.stringify(collectionInfo[0].options.validator, null, 2));

  return collection;
}

/**
 * Main execution function
 */
async function main() {
  try {
    console.log(' Setting up livre collection...\n');
    await createLivreCollection();
    console.log('\n Collection setup completed successfully!');
  } catch (error) {
    console.error('✗ Setup failed:', error.message);
    process.exit(1);
  } finally {
    await disconnect();
  }
}

// Run if executed directly
if (require.main === module) {
  main();
}

module.exports = { createLivreCollection };
