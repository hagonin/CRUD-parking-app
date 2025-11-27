const { getCollection } = require('../db/connection');

const COLLECTION_NAME = 'games';

/**
 * Query 1: Display all 3DS games
 * @returns {Promise<Array>} Array of 3DS games
 */
async function getAllThreeDSGames() {
  const collection = getCollection(COLLECTION_NAME);

  const games = await collection
    .find({ Platform: '3DS' })
    .toArray();

  return games;
}

/**
 * Query 2: Display 3DS games released in 2011
 * @returns {Promise<Array>} Array of 3DS games from 2011
 */
async function getThreeDSGamesFrom2011() {
  const collection = getCollection(COLLECTION_NAME);

  const games = await collection
    .find({
      Platform: '3DS',
      Year: '2011'
    })
    .toArray();

  return games;
}

/**
 * Query 3: Display name and global_sales of 3DS games from 2011
 * @returns {Promise<Array>} Array of {Name, Global_Sales} objects
 */
async function getThreeDSGamesSales2011() {
  const collection = getCollection(COLLECTION_NAME);

  const games = await collection
    .find(
      {
        Platform: '3DS',
        Year: '2011'
      },
      {
        projection: {
          _id: 0,
          Name: 1,
          Global_Sales: 1
        }
      }
    )
    .toArray();

  return games;
}

/**
 * Query 4: Display top 3 best-selling 3DS games from 2011
 * @returns {Promise<Array>} Array of top 3 games with Name and Global_Sales
 */
async function getTop3ThreeDSGames2011() {
  const collection = getCollection(COLLECTION_NAME);

  const games = await collection
    .find(
      {
        Platform: '3DS',
        Year: '2011'
      },
      {
        projection: {
          _id: 0,
          Name: 1,
          Global_Sales: 1
        }
      }
    )
    .sort({ Global_Sales: -1 })
    .limit(3)
    .toArray();

  return games;
}

/**
 * Helper function to display query results
 * @param {string} title - Query description
 * @param {Array} results - Query results
 */
function displayResults(title, results) {
  console.log(`\n${'='.repeat(60)}`);
  console.log(title);
  console.log('='.repeat(60));

  if (results.length === 0) {
    console.log('No results found.');
    return;
  }

  console.log(`Found ${results.length} result(s):\n`);
  results.forEach((game, index) => {
    console.log(`${index + 1}.`, JSON.stringify(game, null, 2));
  });
}

module.exports = {
  getAllThreeDSGames,
  getThreeDSGamesFrom2011,
  getThreeDSGamesSales2011,
  getTop3ThreeDSGames2011,
  displayResults
};
