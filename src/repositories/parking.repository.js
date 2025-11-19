const { parkingsData, getNextParkingId } = require('../utils/data.utils');

const ParkingRepository = {
	// get all parking records
	getAllParkings: () => {
		return parkingsData;
	},

	// get a parking record by id
	getParkingById: (id) => {
		return parkingsData.find((parking) => parking.id === id);
	},

	//create a new parking record
	createParking: (parking) => {
		const newParking = {
			id: getNextParkingId(),
			name: parking.name || `New Parking ${getNextParkingId() - 1}`,
			type: parking.type || 'UNKNOWN',
			city: parking.city || 'N/A',
		};

		parkingsData.push(newParking);
		return newParking;
	},

	// update an existing parking record
	updateParking: (id, parking) => {
		const index = parkingsData.findIndex((p) => p.id === id);
		if (index === -1) {
			return null; // Parking not found
		}
		parkingsData[index] = {
			...parkingsData[index],
			...parking,
			id: id,
		};
		return parkingsData[index];
	},

	//delete a parking record
	deleteParking: (id) => {
		const initialLength = parkingsData.length;
		parkingsData = parkingsData.filter((p) => p.id !== id);
		return parkingsData.length < initialLength; // returns true if a parking was deleted
	},
};

module.exports = ParkingRepository;
