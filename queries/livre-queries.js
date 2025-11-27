const { getCollection } = require('../db/connection');

const COLLECTION_NAME = 'livre';

/**
 * Query 1: Insert multiple books
 */
async function insertMultipleLivres(livres) {
	const collection = getCollection(COLLECTION_NAME);

	const result = await collection.insertMany(livres);
	return result;
}

/**
 * Query 2: Delete a specific book by title
 */
async function deleteLivreByTitre(titre) {
	const collection = getCollection(COLLECTION_NAME);

	const result = await collection.deleteOne({ titre });
	return result;
}

/**
 * Query 3: Delete all books by J.K. Rowling
 */
async function deleteLivresByAuteur(auteur) {
	const collection = getCollection(COLLECTION_NAME);

	const result = await collection.deleteMany({ auteur });
	return result;
}

module.exports = {
	insertMultipleLivres,
	deleteLivreByTitre,
	deleteLivresByAuteur,
};
