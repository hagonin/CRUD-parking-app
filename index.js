const { connect, disconnect } = require('./db/connection');
const {
  getAllThreeDSGames,
  getThreeDSGamesFrom2011,
  getThreeDSGamesSales2011,
  getTop3ThreeDSGames2011,
  displayResults
} = require('./queries/game-queries');

/**
 * Main execution function - runs all queries
 */
async function main() {
  try {
    // Connect to MongoDB
    await connect();

    // Query 1: All 3DS games
    console.log('\n Running Query 1: All 3DS Games');
    const all3DSGames = await getAllThreeDSGames();
    displayResults('Query 1: All 3DS Games', all3DSGames);

    // Query 2: 3DS games from 2011
    console.log('\n Running Query 2: 3DS Games from 2011');
    const games2011 = await getThreeDSGamesFrom2011();
    displayResults('Query 2: 3DS Games Released in 2011', games2011);

    // Query 3: Name and Global_Sales of 3DS games from 2011
    console.log('\n Running Query 3: Name & Sales (3DS, 2011)');
    const gamesSales = await getThreeDSGamesSales2011();
    displayResults('Query 3: Name and Global Sales (3DS, 2011)', gamesSales);

    // Query 4: Top 3 best-selling 3DS games from 2011
    console.log('\n Running Query 4: Top 3 Best-Selling (3DS, 2011)');
    const top3Games = await getTop3ThreeDSGames2011();
    displayResults('Query 4: Top 3 Best-Selling 3DS Games (2011)', top3Games);

    console.log('\n All queries completed successfully!\n');
  } catch (error) {
    console.error('\n✗ Error running queries:', error.message);
    process.exit(1);
  } finally {
    await disconnect();
  }
}

// Graceful shutdown handlers
process.on('SIGINT', async () => {
  console.log('\n Received SIGINT, closing connections...');
  await disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n Received SIGTERM, closing connections...');
  await disconnect();
  process.exit(0);
});

// Run if executed directly
if (require.main === module) {
  main();
}

module.exports = { main };
