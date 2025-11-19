const express = require('express');
const router = express.Router();
const ReservationController = require('../controllers/reservation.controller');

// GET /reservations
router.get('/', ReservationController.findAll);

// POST /reservations
router.post('/', ReservationController.create);

// GET /reservations/:id
router.get('/:id', ReservationController.findById);

// PUT /reservations/:id
router.put('/:id', ReservationController.update);

// DELETE /reservations/:id
router.delete('/:id', ReservationController.delete);

module.exports = router;
