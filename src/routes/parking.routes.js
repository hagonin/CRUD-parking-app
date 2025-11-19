const express = require('express');
const router = express.Router();
const ParkingController = require('../controllers/parking.controller');
const ReservationController = require('../controllers/reservation.controller');

// --- Base Parking Routes ---
// GET /parkings
router.get('/', ParkingController.getAll);
// POST /parkings
router.post('/', ParkingController.create);
// GET /parkings/:id
router.get('/:id', ParkingController.getById);
// PUT /parkings/:id
router.put('/:id', ParkingController.update);
// DELETE /parkings/:id
router.delete('/:id', ParkingController.delete);

// --- Nested Reservation Routes (Scoped to Parking ID) ---
// GET /parkings/:id/reservations
router.get('/:id/reservations', ReservationController.findAllByParkingId);
// POST /parkings/:id/reservations
router.post('/:id/reservations', ReservationController.createForParking);
// GET /parkings/:id/reservations/:idreservation
router.get('/:id/reservations/:idreservation', ReservationController.findByIds);
// PUT /parkings/:id/reservations/:idreservation
router.put(
	'/:id/reservations/:idreservation',
	ReservationController.updateByIds
);
// DELETE /parkings/:id/reservations/:idreservation
router.delete(
	'/:id/reservations/:idreservation',
	ReservationController.deleteByIds
);

module.exports = router;
