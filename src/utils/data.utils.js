const parkingsData = require('../../parkings.json');
const reservationsData = require('../../reservations.json');



// helper to calculate the next id
let nextParkingId = Math.max(...parkingsData.map(parking => parking.id),0) + 1
let nextReservationId = Math.max(...reservationsData.map(reservation => reservation.id),0) + 1


const getNextParkingId = () => {
    return nextParkingId++
}

const getNextReservationId = () => {
    return nextReservationId++
}

module.exports = {
    parkingsData,
    reservationsData,
    getNextParkingId,
    getNextReservationId
}