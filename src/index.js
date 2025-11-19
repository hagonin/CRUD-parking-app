
const express = require('express');
const cors = require('cors');
const { PORT } = require('../config/config');
const parkingRoutes = require('./routes/parking.routes');
const reservationRoutes = require('./routes/reservation.routes');

const app = express();

// --- 1. CONFIGURATION & MIDDLEWARE ---

// Custom CORS middleware from the original file
// This ensures the API can be accessed by clients from any domain (*)
app.all('*', function (req, res, next) {
	res.header('Access-Control-Allow-Origin', '*');
	res.header('Access-Control-Allow-Methods', 'PUT, GET, POST, DELETE, OPTIONS');
	res.header(
		'Access-Control-Allow-Headers',
		'Origin, X-Requested-With, Content-Type, Accept'
	);
	next();
});

// Middleware to parse incoming JSON request bodies
app.use(express.json());

// --- 2. ATTACH RESOURCE ROUTES ---
// The routers defined in src/routes are attached here to their base paths.
app.use('/parkings', parkingRoutes);


app.use('/reservations', reservationRoutes);

// 404 handler for unknown routes
app.use((req, res, next) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error handler for other errors
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

// --- 3. SERVER STARTUP ---
app.listen(PORT, () => {
	console.log(`Serveur à l'écoute sur le port ${PORT} !`);
	console.log(`Parkings API base URL: http://localhost:${PORT}/parkings`);
	console.log(
		`Reservations API base URL: http://localhost:${PORT}/reservations`
	);
});
