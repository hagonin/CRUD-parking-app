const ReservationRepository = require('../repositories/reservation.repository');

const ReservationController = {
	// GET /reservations - Get all reservations
	findAll: (req, res) => {
		try {
			const reservations = ReservationRepository.findAllReservations();
			res.status(200).json(reservations);
		} catch (error) {
			res.status(500).json({ error: error.message });
		}
	},

	// GET /reservations/:id - Get a reservation by ID
	findById: (req, res) => {
		try {
			const id = parseInt(req.params.id);
			const reservation = ReservationRepository.findResaById(id);

			if (!reservation) {
				return res.status(404).json({ error: 'Reservation not found' });
			}

			res.status(200).json(reservation);
		} catch (error) {
			res.status(500).json({ error: error.message });
		}
	},

	// POST /reservations - Create a new reservation
	create: (req, res) => {
		try {
			const newReservation = ReservationRepository.createReservation(req.body);
			res.status(201).json(newReservation);
		} catch (error) {
			res.status(400).json({ error: error.message });
		}
	},

	// PUT /reservations/:id - Update a reservation
	update: (req, res) => {
		try {
			const id = parseInt(req.params.id);
			const updatedReservation = ReservationRepository.updateReservation(
				id,
				req.body
			);

			if (!updatedReservation) {
				return res.status(404).json({ error: 'Reservation not found' });
			}

			res.status(200).json(updatedReservation);
		} catch (error) {
			res.status(500).json({ error: error.message });
		}
	},

	// DELETE /reservations/:id - Delete a reservation
	delete: (req, res) => {
		try {
			const id = parseInt(req.params.id);
			const deleted = ReservationRepository.deleteReservation(id);

			if (!deleted) {
				return res.status(404).json({ error: 'Reservation not found' });
			}

			res.status(204).send();
		} catch (error) {
			res.status(500).json({ error: error.message });
		}
	},

	// --- Nested Resource Methods for /parkings/:id/reservations ---

	// GET /parkings/:id/reservations - Get all reservations for a specific parking
	findAllByParkingId: (req, res) => {
		try {
			const parkingId = parseInt(req.params.id);
			const reservations = ReservationRepository.findAllReservations().filter(
				(r) => r.parkingId === parkingId
			);
			res.status(200).json(reservations);
		} catch (error) {
			res.status(500).json({ error: error.message });
		}
	},

	// GET /parkings/:id/reservations/:idreservation - Get a specific reservation by parking and reservation IDs
	findByIds: (req, res) => {
		try {
			const parkingId = parseInt(req.params.id);
			const reservationId = parseInt(req.params.idreservation);
			const reservation = ReservationRepository.findAllReservations().find(
				(r) => r.parkingId === parkingId && r.id === reservationId
			);

			if (!reservation) {
				return res.status(404).json({ error: 'Reservation not found' });
			}

			res.status(200).json(reservation);
		} catch (error) {
			res.status(500).json({ error: error.message });
		}
	},

	// POST /parkings/:id/reservations - Create a reservation for a specific parking
	createForParking: (req, res) => {
		try {
			const parkingId = parseInt(req.params.id);
			const reservationData = {
				...req.body,
				parkingId: parkingId,
			};
			const newReservation =
				ReservationRepository.createReservation(reservationData);
			res.status(201).json(newReservation);
		} catch (error) {
			res.status(400).json({ error: error.message });
		}
	},

	// PUT /parkings/:id/reservations/:idreservation - Update a reservation by parking and reservation IDs
	updateByIds: (req, res) => {
		try {
			const parkingId = parseInt(req.params.id);
			const reservationId = parseInt(req.params.idreservation);

			// Verify the reservation exists and belongs to this parking
			const existing = ReservationRepository.findAllReservations().find(
				(r) => r.parkingId === parkingId && r.id === reservationId
			);

			if (!existing) {
				return res.status(404).json({ error: 'Reservation not found' });
			}

			const updatedReservation = ReservationRepository.updateReservation(
				reservationId,
				req.body
			);
			res.status(200).json(updatedReservation);
		} catch (error) {
			res.status(500).json({ error: error.message });
		}
	},

	// DELETE /parkings/:id/reservations/:idreservation - Delete a reservation by parking and reservation IDs
	deleteByIds: (req, res) => {
		try {
			const parkingId = parseInt(req.params.id);
			const reservationId = parseInt(req.params.idreservation);

			// Verify the reservation exists and belongs to this parking
			const existing = ReservationRepository.findAllReservations().find(
				(r) => r.parkingId === parkingId && r.id === reservationId
			);

			if (!existing) {
				return res.status(404).json({ error: 'Reservation not found' });
			}

			const deleted = ReservationRepository.deleteReservation(reservationId);
			res.status(204).send();
		} catch (error) {
			res.status(500).json({ error: error.message });
		}
	},
};

module.exports = ReservationController;
