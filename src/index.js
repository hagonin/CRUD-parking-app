
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
// Example: All routes in parking.routes start with /parkings
app.use('/parkings', parkingRoutes);
// Example: All routes in reservation.routes start with /reservations
app.use('/reservations', reservationRoutes);

// --- 3. SERVER STARTUP ---
app.listen(PORT, () => {
	console.log(`Serveur à l'écoute sur le port ${PORT} !`);
	console.log(`Parkings API base URL: http://localhost:${PORT}/parkings`);
	console.log(
		`Reservations API base URL: http://localhost:${PORT}/reservations`
	);
});
