const { connect, disconnect } = require('./connection');
const {
	insertMultipleLivres,
	deleteLivreByTitre,
	deleteLivresByAuteur,
} = require('../queries/livre-queries');

async function runScenario() {
	await connect();

	// 1. Insert multiple books
	const livres = [
		{
			titre: 'Le Petit Prince',
			auteur: 'Antoine de Saint-Exupéry',
			année: 1943,
			genre: 'Fiction',
		},
		{ titre: '1984', auteur: 'George Orwell', année: 1949, genre: 'Dystopian' },
		{
			titre: "Harry Potter à l'école des sorciers",
			auteur: 'J. K. Rowling',
			année: 2001,
			genre: 'Fantasy',
		},
		{
			titre: 'Harry Potter et la chambre des secrets',
			auteur: 'J. K. Rowling',
			année: 2002,
			genre: 'Fantasy',
		},
	];

	console.log('Inserting multiple books...');
	const insertResult = await insertMultipleLivres(livres);
	console.log(`Inserted ${insertResult.insertedCount} books`);

	// 2. Delete specific book by title
	console.log('\nDeleting "1984"...');
	const deleteOneResult = await deleteLivreByTitre('1984');
	console.log(`Deleted ${deleteOneResult.deletedCount} book(s)`);

	// 3. Delete all J.K. Rowling books
	console.log('\nDeleting all J.K. Rowling books...');
	const deleteManyResult = await deleteLivresByAuteur('J. K. Rowling');
	console.log(`Deleted ${deleteManyResult.deletedCount} book(s)`);

	await disconnect();
}

runScenario();
