/**
 * Suites de tests E2E
 */
describe('API Backend Tests', () => {

	describe('GET /parkings', () => {
		it('returns all parkings as array', () => {
			cy.request('GET', 'http://localhost:8080/parkings').then((response) => {
				expect(response.status).to.eq(200);
				expect(response.body).to.be.an('array');
			});
		});
	});

	describe('GET /parkings/:id', () => {
		it('returns single parking by id', () => {
			cy.request('GET', 'http://localhost:8080/parkings/1').then((response) => {
				expect(response.status).to.eq(200);
				expect(response.body).to.be.an('object');
				expect(response.body).to.have.property('id', 1);
				expect(response.body).to.have.property('name');
				expect(response.body).to.have.property('type');
				expect(response.body).to.have.property('city');
			});
		});
	});

	describe('POST /parkings', () => {
		it('creates new parking and returns updated array', () => {
			cy.request('POST', 'http://localhost:8080/parkings', {
				id: 99,
				name: 'Parking 99',
				type: 'AIRPORT 99',
				city: 'ROISSY EN FRANCE',
			}).then((response) => {
				expect(response.status).to.eq(200);
				expect(response.body).to.be.an('array');
				expect(JSON.stringify(response.body).indexOf('Parking 99')).to.gt(0);

				// Cleanup: Remove test parking
				cy.request('DELETE', 'http://localhost:8080/parkings/99');
			});
		});
	});

	describe('PUT /parkings/:id', () => {
		it('updates parking fields and returns updated object', () => {
			// Setup: Create test parking
			cy.request('POST', 'http://localhost:8080/parkings', {
				id: 100,
				name: 'Test Parking 100',
				type: 'STREET',
				city: 'PARIS'
			}).then(() => {

				// Test: Update parking
				cy.request('PUT', 'http://localhost:8080/parkings/100', {
					id: 100,
					name: 'Updated Parking 100',
					type: 'INDOOR',
					city: 'LYON'
				}).then((response) => {
					expect(response.status).to.eq(200);
					expect(response.body).to.be.an('object');
					expect(response.body.id).to.eq(100);
					expect(response.body.name).to.eq('Updated Parking 100');
					expect(response.body.type).to.eq('INDOOR');
					expect(response.body.city).to.eq('LYON');

					// Verify: Check persistence
					cy.request('GET', 'http://localhost:8080/parkings/100')
						.then((verifyResponse) => {
							expect(verifyResponse.body.name).to.eq('Updated Parking 100');

							// Cleanup: Remove test data
							cy.request('DELETE', 'http://localhost:8080/parkings/100');
						});
				});
			});
		});
	});

	describe('DELETE /parkings/:id', () => {
		it('removes parking and returns remaining array', () => {
			// Setup: Create test parking
			cy.request('POST', 'http://localhost:8080/parkings', {
				id: 101,
				name: 'Test Parking 101',
				type: 'AIRPORT',
				city: 'TOULOUSE'
			}).then(() => {

				// Test: Delete parking
				cy.request('DELETE', 'http://localhost:8080/parkings/101')
					.then((response) => {
						expect(response.status).to.eq(200);
						expect(response.body).to.be.an('array');

						// Verify not in response
						const deleted = response.body.find(p => p.id === 101);
						expect(deleted).to.be.undefined;

						// Verify: Confirm deletion persisted
						cy.request('GET', 'http://localhost:8080/parkings')
							.then((verifyResponse) => {
								const parking = verifyResponse.body.find(p => p.id === 101);
								expect(parking).to.be.undefined;
							});
					});
			});
		});
	});

});
