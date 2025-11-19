
const ParkingRepository = require('../repositories/parking.repository');

const ParkingController = {
	// GET /parkings
	getAll: (req, res) => {
		const parkings = ParkingRepository.getAllParkings();
		res.status(200).json(parkings);
	},

	// GET /parkings/:id
	getById: (req, res) => {
		const id = parseInt(req.params.id);
		const parking = ParkingRepository.getParkingById(id);

		if (!parking) {
			return res
				.status(404)
				.json({ message: `Parking with ID ${id} not found.` });
		}
		res.status(200).json(parking);
	},

	// POST /parkings
	create: (req, res) => {
		const newParking = ParkingRepository.createParking(req.body);
		// Original implementation returned the whole array, though the new resource is standard.
		// We adhere to the original behavior for faithfulness.
		res.status(200).json(ParkingRepository.getAllParkings());
	},

	// PUT /parkings/:id
	update: (req, res) => {
		const id = parseInt(req.params.id);
		const updatedParking = ParkingRepository.updateParking(id, req.body);

		if (!updatedParking) {
			return res
				.status(404)
				.json({ message: `Parking with ID ${id} not found.` });
		}
		res.status(200).json(updatedParking);
	},

	// DELETE /parkings/:id
	delete: (req, res) => {
		const id = parseInt(req.params.id);
		const deleted = ParkingRepository.deleteParking(id);

		if (!deleted) {
			return res
				.status(404)
				.json({ message: `Parking with ID ${id} not found.` });
		}
		// Original implementation returned the whole array on success
		res.status(200).json(ParkingRepository.getAllParkings());
	},
};

module.exports = ParkingController;
