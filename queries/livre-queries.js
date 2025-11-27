const { getDb } = require('../db/connection');

const COLLECTION_NAME = 'livre';

/**
 * Query 1: Insert multiple books
 */
async function insertMultipleLivres(livres) {
	const db = getDb();
	const collection = db.collection(COLLECTION_NAME);

	const result = await collection.insertMany(livres);
	return result;
}

/**
 * Query 2: Delete a specific book by title
 */
async function deleteLivreByTitre(titre) {
	const db = getDb();
	const collection = db.collection(COLLECTION_NAME);

	const result = await collection.deleteOne({ titre });
	return result;
}

/**
 * Query 3: Delete all books by J.K. Rowling
 */
async function deleteLivresByAuteur(auteur) {
	const db = getDb();
	const collection = db.collection(COLLECTION_NAME);

	const result = await collection.deleteMany({ auteur });
	return result;
}

module.exports = {
	insertMultipleLivres,
	deleteLivreByTitre,
	deleteLivresByAuteur,
};
