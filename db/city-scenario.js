const { connect, disconnect } = require('./connection');
const {
	updateCityName,
	updateLyonCoordinates,
	addPopulationToLyon,
	addTagsToAllCities,
	removeTagFromAllCities,
	removeFirstTagFromBourges,
	removeAllTagsFromCity,
} = require('../queries/city-queries');

/**
 * Demonstrates city operations with detailed logging
 */
async function runCityScenario() {
	try {
		await connect();
		const db = require('./connection').getDb();
		const collection = db.collection('city');

		console.log('═══════════════════════════════════════════════════════');
		console.log('City Operations Demo');
		console.log('═══════════════════════════════════════════════════════\n');

		// ====================================================================
		// Question 1: Field Update Operations
		// ====================================================================

		console.log('QUESTION 1: Field Update Operations\n');

		// Operation 1: Update city name
		console.log('Updating Paris to Paname...');
		const updateNameResult = await updateCityName('Paris', 'Paname');
		console.log(
			` Matched: ${updateNameResult.matchedCount}, Modified: ${updateNameResult.modifiedCount}\n`
		);

		// Operation 2: Update Lyon coordinates
		console.log('Updating Lyon coordinates...');
		const updateCoordsResult = await updateLyonCoordinates(45.75, 4.85);
		console.log(
			`Matched: ${updateCoordsResult.matchedCount}, Modified: ${updateCoordsResult.modifiedCount}`
		);

		// Display Lyon after coordinate update
		const lyonAfterCoords = await collection.findOne({ city_name: 'Lyon' });
		if (lyonAfterCoords) {
			console.log(
				`   Lyon coordinates: [${lyonAfterCoords.coordinates.latitude}, ${lyonAfterCoords.coordinates.longitude}]\n`
			);
		}

		// Operation 3: Add population to Lyon
		console.log('Adding population field to Lyon...');
		const addPopResult = await addPopulationToLyon(513275);
		console.log(
			` Matched: ${addPopResult.matchedCount}, Modified: ${addPopResult.modifiedCount}`
		);

		// Display Lyon after adding population
		const lyonAfterPop = await collection.findOne({ city_name: 'Lyon' });
		if (lyonAfterPop) {
			console.log(`Lyon population: ${lyonAfterPop.population}\n`);
		}

		// ====================================================================
		// Question 2: Array Operations on Tags
		// ====================================================================

		console.log('═══════════════════════════════════════════════════════');
		console.log('QUESTION 2: Array Operations on Tags\n');

		// Operation 1: Add tags to all cities
		console.log('Adding tags [Touristique, Dynamique] to all cities...');
		const addTagsResult = await addTagsToAllCities([
			'Touristique',
			'Dynamique',
		]);
		console.log(
			`Matched: ${addTagsResult.matchedCount}, Modified: ${addTagsResult.modifiedCount}`
		);

		// Display sample city after adding tags
		const sampleCity1 = await collection.findOne({ city_name: 'Lyon' });
		if (sampleCity1) {
			console.log(`Lyon tags: ${JSON.stringify(sampleCity1.tags)}\n`);
		}

		// Operation 2: Remove specific tag from all cities
		console.log('Removing tag "Sportive" from all cities...');
		const removeTagResult = await removeTagFromAllCities('Sportive');
		console.log(
			` Matched: ${removeTagResult.matchedCount}, Modified: ${removeTagResult.modifiedCount}`
		);

		// Display affected city after removal
		const cluses = await collection.findOne({ city_name: 'Cluses' });
		if (cluses) {
			console.log(
				`  Cluses tags (after removal): ${JSON.stringify(cluses.tags)}\n`
			);
		}

		// Operation 3: Remove first tag from Bourges
		console.log('Removing first tag from Bourges...');
		const bourgesBefore = await collection.findOne({ city_name: 'Bourges' });
		console.log(
			` Bourges tags before: ${JSON.stringify(bourgesBefore?.tags)}`
		);

		const removeFirstResult = await removeFirstTagFromBourges();
		console.log(
			`Matched: ${removeFirstResult.matchedCount}, Modified: ${removeFirstResult.modifiedCount}`
		);

		const bourgesAfter = await collection.findOne({ city_name: 'Bourges' });
		console.log(
			`Bourges tags after: ${JSON.stringify(bourgesAfter?.tags)}\n`
		);

		// Operation 4: Remove all tags from a city
		console.log('Removing all tags from Évry...');
		const evryBefore = await collection.findOne({ city_name: 'Évry' });
		console.log(` Évry tags before: ${JSON.stringify(evryBefore?.tags)}`);

		const removeAllResult = await removeAllTagsFromCity('Évry');
		console.log(
			` Matched: ${removeAllResult.matchedCount}, Modified: ${removeAllResult.modifiedCount}`
		);

		const evryAfter = await collection.findOne({ city_name: 'Évry' });
		console.log(
			` Évry tags after: ${JSON.stringify(evryAfter?.tags || 'undefined')}\n`
		);

		// ====================================================================
		// Summary
		// ====================================================================

		console.log('═══════════════════════════════════════════════════════');
		console.log('All city operations completed successfully!');
		console.log('═══════════════════════════════════════════════════════');
	} catch (error) {
		console.error('\n✗ Scenario failed:', error.message);
		console.error(error);
		process.exit(1);
	} finally {
		await disconnect();
	}
}

// Run if executed directly
if (require.main === module) {
	runCityScenario();
}

module.exports = { runCityScenario };
