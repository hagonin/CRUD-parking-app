const { getCollection } = require('../db/connection');

const COLLECTION_NAME = 'city';

// ============================================================================
// Question 1: Field Update Operations
// ============================================================================

/**
 * Updates a city's name
 * @param {string} oldName - Current city name
 * @param {string} newName - New city name
 * @returns {Promise<Object>} Update result with matchedCount and modifiedCount
 */
async function updateCityName(oldName, newName) {
	const collection = getCollection(COLLECTION_NAME);

	const result = await collection.updateOne(
		{ city_name: oldName },
		{ $set: { city_name: newName } }
	);

	return result;
}

/**
 * Updates Lyon's coordinates
 * @param {number} latitude - New latitude
 * @param {number} longitude - New longitude
 * @returns {Promise<Object>} Update result with matchedCount and modifiedCount
 */
async function updateLyonCoordinates(latitude, longitude) {
	const collection = getCollection(COLLECTION_NAME);

	const result = await collection.updateOne(
		{ city_name: 'Lyon' },
		{
			$set: {
				'coordinates.latitude': latitude,
				'coordinates.longitude': longitude,
			},
		}
	);

	return result;
}

/**
 * Adds population field to Lyon
 * @param {number} population - Population value
 * @returns {Promise<Object>} Update result with matchedCount and modifiedCount
 */
async function addPopulationToLyon(population) {
	const collection = getCollection(COLLECTION_NAME);

	const result = await collection.updateOne(
		{ city_name: 'Lyon' },
		{ $set: { population } }
	);

	return result;
}

// ============================================================================
// Question 2: Array Operations on Tags
// ============================================================================

/**
 * Adds multiple tags to all cities
 * @param {string[]} tags - Array of tags to add
 * @returns {Promise<Object>} Update result with matchedCount and modifiedCount
 */
async function addTagsToAllCities(tags) {
	const collection = getCollection(COLLECTION_NAME);

	const result = await collection.updateMany(
		{},
		{ $push: { tags: { $each: tags } } }
	);

	return result;
}

/**
 * Removes a specific tag from all cities
 * @param {string} tag - Tag to remove
 * @returns {Promise<Object>} Update result with matchedCount and modifiedCount
 */
async function removeTagFromAllCities(tag) {
	const collection = getCollection(COLLECTION_NAME);

	const result = await collection.updateMany({}, { $pull: { tags: tag } });

	return result;
}

/**
 * Removes the first tag from Bourges
 * @returns {Promise<Object>} Update result with matchedCount and modifiedCount
 */
async function removeFirstTagFromBourges() {
	const collection = getCollection(COLLECTION_NAME);

	const result = await collection.updateOne(
		{ city_name: 'Bourges' },
		{ $pop: { tags: -1 } } // -1 removes first element, 1 removes last
	);

	return result;
}

/**
 * Removes all tags from a specific city
 * @param {string} cityName - Name of the city
 * @returns {Promise<Object>} Update result with matchedCount and modifiedCount
 */
async function removeAllTagsFromCity(cityName) {
	const collection = getCollection(COLLECTION_NAME);

	const result = await collection.updateOne(
		{ city_name: cityName },
		{ $unset: { tags: '' } }
	);

	return result;
}

module.exports = {
	// Question 1: Field updates
	updateCityName,
	updateLyonCoordinates,
	addPopulationToLyon,

	// Question 2: Array operations
	addTagsToAllCities,
	removeTagFromAllCities,
	removeFirstTagFromBourges,
	removeAllTagsFromCity,
};
