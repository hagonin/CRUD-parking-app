const { connect, disconnect } = require('./connection');

const COLLECTION_NAME = 'livre';

/**
 * Test data to insert
 * Expected results:
 * 1. SUCCESS - Valid data
 * 2. SUCCESS - Valid data
 * 3. FAIL - année (1800) < minimum (1901)
 * 4. FAIL - Duplicate titre (unique constraint violation)
 */
const TEST_LIVRES = [
  {
    titre: "Harry Potter à l'école des sorciers",
    auteur: "J. K. Rowling",
    année: 2001,
    genre: "Fantasy"
  },
  {
    titre: "Harry Potter et la chambre des secrets",
    auteur: "J. K. Rowling",
    année: 2002,
    genre: "Fantasy"
  },
  {
    titre: "Livre vieux",
    auteur: "Auteur inconnu",
    année: 1800
    // No genre - optional field
  },
  {
    titre: "Harry Potter à l'école des sorciers",  // Duplicate!
    auteur: "Copycat",
    année: 2012,
    genre: "Fantasy"
  }
];

/**
 * Attempts to insert a livre document
 * Handles validation and unique constraint errors
 */
async function insertLivre(collection, livre, index) {
  console.log(`\n[${ index + 1}] Inserting: "${livre.titre}" by ${livre.auteur} (${livre.année})`);

  try {
    const result = await collection.insertOne(livre);
    console.log(`SUCCESS - Inserted with ID: ${result.insertedId}`);
    return { success: true, livre, result };
  } catch (error) {
    // Handle different error types
    if (error.code === 11000) {
      // Duplicate key error (unique constraint violation)
      console.log(`FAIL - Duplicate titre: "${livre.titre}"`);
      console.log(`Error: E11000 duplicate key error`);
    } else if (error.code === 121) {
      // Document validation error
      console.log(`FAIL - Validation error`);

      // Extract specific validation failure details
      if (error.errInfo && error.errInfo.details) {
        const details = error.errInfo.details;
        if (details.schemaRulesNotSatisfied) {
          details.schemaRulesNotSatisfied.forEach(rule => {
            if (rule.propertiesNotSatisfied) {
              rule.propertiesNotSatisfied.forEach(prop => {
                console.log(`   Field: ${prop.propertyName}`);
                prop.details.forEach(detail => {
                  if (detail.operatorName === 'minimum') {
                    console.log(`   Reason: ${prop.propertyName} (${detail.consideredValue}) < minimum (${detail.specifiedAs.minimum})`);
                  } else if (detail.operatorName === 'minLength') {
                    console.log(`   Reason: ${prop.propertyName} is empty (minimum length: ${detail.specifiedAs.minLength})`);
                  } else {
                    console.log(`   Reason: ${detail.reason}`);
                  }
                });
              });
            }
          });
        }
      }
    } else {
      // Other errors
      console.log(`FAIL - Unexpected error: ${error.message}`);
    }

    return { success: false, livre, error };
  }
}

/**
 * Main execution function
 */
async function main() {
  const db = await connect();
  const collection = db.collection(COLLECTION_NAME);

  console.log(' Testing livre insertions...');
  console.log('='.repeat(60));

  const results = [];
  for (let i = 0; i < TEST_LIVRES.length; i++) {
    const result = await insertLivre(collection, TEST_LIVRES[i], i);
    results.push(result);
  }

  // Summary
  console.log('\n' + '='.repeat(60));
  console.log(' SUMMARY:');
  console.log('='.repeat(60));

  const successful = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;

  console.log(`Total attempts: ${results.length}`);
  console.log(`Successful: ${successful}`);
  console.log(`Failed: ${failed}`);

  console.log('\n Expected behavior:');
  console.log('  - Insert 1: SUCCESS (valid data)');
  console.log('  - Insert 2: SUCCESS (valid data)');
  console.log('  - Insert 3: FAIL (année 1800 < 1901)');
  console.log('  - Insert 4: AIL (duplicate titre)');

  // Verify final state
  const count = await collection.countDocuments();
  console.log(`\n Total documents in collection: ${count}`);

  if (successful === 2 && failed === 2) {
    console.log('\n All validations working as expected!');
  } else {
    console.log('\n Unexpected results - check validation rules');
  }
}

/**
 * Wrapper with error handling and cleanup
 */
async function run() {
  try {
    await main();
  } catch (error) {
    console.error('\n Test failed:', error.message);
    process.exit(1);
  } finally {
    await disconnect();
  }
}

// Run if executed directly
if (require.main === module) {
  run();
}

module.exports = { insertLivre, TEST_LIVRES };
