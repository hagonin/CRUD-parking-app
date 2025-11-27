/**
 *
 * CRUD PARKING
 *
 */

var express = require("express");


var app = express();

//Middleware
app.use(express.json())

app.all('*', function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header('Access-Control-Allow-Methods', 'PUT, GET, POST, DELETE, OPTIONS');
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});


const parkings = require('./parkings.json')
const reservations = require('./reservations.json')

/**
 * 
 * This function's description is the first
 * paragraph.
 *
 * This starts the body.  This text comes after the signature. 
 *
 * @param {req} first - objet request - client web
 * @param {res} second - objet response - serveur web.
 * @returns {Record} - Retourne le status HTTP 200 et un data en JSON.
 */
app.get('/parkings', (req, res) => {
    res.status(200).json(parkings)
})

app.get('/reservations', (req, res) => {
    res.status(200).json(reservations)
})

app.get('/parkings/:id/reservations', (req, res) => {
    const id = parseInt(req.params.id)
    const preservations = reservations.filter(
        reservation => reservation.parkingId === id)
    res.status(200).json(preservations)
})

app.get('/parkings/:id/reservations/:idreservation', (req, res) => {
    const id = parseInt(req.params.id)
    const idreservation = parseInt(req.params.idreservation)
    const preservations = reservations.filter(
        reservation => {
            if ((reservation.parkingId === id) &&
                (reservation.id === idreservation))
                return true
            else
                return false
        })
    res.status(200).json(preservations)
})

app.get('/parkings/:id', (req, res) => {
    const id = parseInt(req.params.id)
    const parking = parkings.find(parking => parking.id === id)
    res.status(200).json(parking)
})

app.delete('/parkings/:id/reservations/:idreservation', (req, res) => {
    const id = parseInt(req.params.id)
    const idreservation = parseInt(req.params.idreservation)
    let reservation = reservations.find(
        reservation => {
            if ((reservation.parkingId === id) &&
                (reservation.id === idreservation))
                return true
            else
                return false
        })
    reservations.splice(reservations.indexOf(reservation), 1)
    res.status(200).json(reservations)
})

app.put('/parkings/:id/reservations/:idreservation', (req, res) => {
    const id = parseInt(req.params.id)
    const idreservation = parseInt(req.params.idreservation)
    let reservation = reservations.find(
        reservation => {
            if ((reservation.parkingId === id) &&
                (reservation.id === idreservation))
                return true
            else
                return false
        })
    if (reservation) {
        reservation.id = req.body.id
        reservation.clientName = req.body.clientName
        reservation.vehicle = req.body.vehicle
        reservation.licensePlate = req.body.licensePlate
        reservation.checkin = req.body.checkin
        reservation.checkout = req.body.checkout
        reservation.ok = req.body.ok
        reservations.forEach(data => {
            if (data.id === reservation.id && reservation.parkingId == data.parkingId) {
                data = reservation
            }
        }
        )
    }
    res.status(200).json(reservations)
})

app.post('/parkings/:id/reservations', (req, res) => {
    const id = parseInt(req.params.id)
    const parking = parkings.find(parking => parking.id === id)
    let reservation = {}
    reservation.parkingId = parking.id
    reservation.parking = parking.name
    reservation.city = parking.city
    reservation.id = req.body.id
    reservation.clientName = req.body.clientName
    reservation.vehicle = req.body.vehicle
    reservation.licensePlate = req.body.licensePlate
    reservation.checkin = req.body.checkin
    reservation.checkout = req.body.checkout
    reservation.ok = req.body.ok
    reservations.push(reservation)
    res.status(200).json(reservations)
})

app.post('/parkings', (req, res) => {
    parkings.push(req.body)
    res.status(200).json(parkings)
})



app.put('/parkings/:id', (req, res) => {
    const id = parseInt(req.params.id)
    let parking = parkings.find(parking => parking.id === id)
    parking.name = req.body.name
    parking.city = req.body.city
    parking.type = req.body.type
    res.status(200).json(parking)
})

app.delete('/parkings/:id', (req, res) => {
    const id = parseInt(req.params.id)
    let parking = parkings.find(parking => parking.id === id)
    parkings.splice(parkings.indexOf(parking), 1)
    res.status(200).json(parkings)
})



app.listen(8080, () => {
    console.log("Serveur à l'écoute !")
});