const {
	reservationsData,
	getNextReservationId,
} = require('../utils/data.utils');

const ReservationRepository = {
	// READ: Get all reservation records
	findAllReservations: () => {
		return reservationsData;
	},

	// READ: Get a single reservation record by ID
	findResaById: (id) => {
		return reservationsData.find((r) => r.id === id);
	},

	// CREATE: Add a new reservation record
	createReservation: (resa) => {
		// Basic required field check, handled by the controller in a real app
		if (!resa.clientName || !resa.parkingId) {
			throw new Error('Client name and Parking ID are required.');
		}

		const newReservation = {
			id: getNextReservationId(),
			...resa,
			checkin: resa.checkin || new Date().toISOString(),
			checkout: resa.checkout || new Date(Date.now() + 86400000).toISOString(),
			ok: 1,
		};
		reservationsData.push(newReservation);
		return newReservation;
	},

	// UPDATE: Update an existing reservation record
	updateReservation: (id, resa) => {
		const index = reservationsData.findIndex((r) => r.id === id);
		if (index === -1) return null;

		reservationsData[index] = {
			...reservationsData[index],
			...resa,
			id: id,
		};
		return reservationsData[index];
	},

	// DELETE: Remove a reservation record
	deleteReservation: (id) => {
		const index = reservationsData.findIndex((r) => r.id === id);
		if (index === -1) return false;

		reservationsData.splice(index, 1);
		return true;
	},
};

module.exports = ReservationRepository;
