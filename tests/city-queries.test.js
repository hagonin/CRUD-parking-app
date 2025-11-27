const {
	updateCityName,
	updateLyonCoordinates,
	addPopulationToLyon,
	addTagsToAllCities,
	removeTagFromAllCities,
	removeFirstTagFromBourges,
	removeAllTagsFromCity,
} = require('../queries/city-queries');

// Mock the connection module
jest.mock('../db/connection', () => ({
	getCollection: jest.fn(),
}));

const { getCollection } = require('../db/connection');

describe('City Queries', () => {
	let mockCollection;

	beforeEach(() => {
		// Reset all mocks before each test
		jest.clearAllMocks();

		// Create mock collection
		mockCollection = {
			updateOne: jest.fn(),
			updateMany: jest.fn(),
		};

		// Mock getCollection to return our mock collection
		getCollection.mockReturnValue(mockCollection);
	});

	// ========================================================================
	// Question 1: Field Update Operations
	// ========================================================================

	describe('updateCityName', () => {
		it('should successfully update a city name', async () => {
			mockCollection.updateOne.mockResolvedValue({
				matchedCount: 1,
				modifiedCount: 1,
				acknowledged: true,
			});

			const result = await updateCityName('Paris', 'Paname');

			expect(getCollection).toHaveBeenCalledWith('city');
			expect(mockCollection.updateOne).toHaveBeenCalledWith(
				{ city_name: 'Paris' },
				{ $set: { city_name: 'Paname' } }
			);
			expect(result.matchedCount).toBe(1);
			expect(result.modifiedCount).toBe(1);
		});

		it('should return zero modified when city not found', async () => {
			mockCollection.updateOne.mockResolvedValue({
				matchedCount: 0,
				modifiedCount: 0,
				acknowledged: true,
			});

			const result = await updateCityName('NonExistentCity', 'NewName');

			expect(result.matchedCount).toBe(0);
			expect(result.modifiedCount).toBe(0);
		});

		it('should return zero modified when updating to same name', async () => {
			mockCollection.updateOne.mockResolvedValue({
				matchedCount: 1,
				modifiedCount: 0,
				acknowledged: true,
			});

			const result = await updateCityName('Lyon', 'Lyon');

			expect(result.matchedCount).toBe(1);
			expect(result.modifiedCount).toBe(0);
		});

		it('should propagate database errors', async () => {
			const dbError = new Error('Database connection failed');
			mockCollection.updateOne.mockRejectedValue(dbError);

			await expect(updateCityName('Paris', 'Paname')).rejects.toThrow(
				'Database connection failed'
			);
		});
	});

	describe('updateLyonCoordinates', () => {
		it('should successfully update Lyon coordinates', async () => {
			mockCollection.updateOne.mockResolvedValue({
				matchedCount: 1,
				modifiedCount: 1,
				acknowledged: true,
			});

			const result = await updateLyonCoordinates(45.75, 4.85);

			expect(getCollection).toHaveBeenCalledWith('city');
			expect(mockCollection.updateOne).toHaveBeenCalledWith(
				{ city_name: 'Lyon' },
				{
					$set: {
						'coordinates.latitude': 45.75,
						'coordinates.longitude': 4.85,
					},
				}
			);
			expect(result.matchedCount).toBe(1);
			expect(result.modifiedCount).toBe(1);
		});

		it('should handle negative coordinates', async () => {
			mockCollection.updateOne.mockResolvedValue({
				matchedCount: 1,
				modifiedCount: 1,
				acknowledged: true,
			});

			const result = await updateLyonCoordinates(-45.75, -4.85);

			expect(mockCollection.updateOne).toHaveBeenCalledWith(
				{ city_name: 'Lyon' },
				{
					$set: {
						'coordinates.latitude': -45.75,
						'coordinates.longitude': -4.85,
					},
				}
			);
			expect(result.modifiedCount).toBe(1);
		});

		it('should handle zero coordinates', async () => {
			mockCollection.updateOne.mockResolvedValue({
				matchedCount: 1,
				modifiedCount: 1,
				acknowledged: true,
			});

			const result = await updateLyonCoordinates(0, 0);

			expect(mockCollection.updateOne).toHaveBeenCalledWith(
				{ city_name: 'Lyon' },
				{
					$set: {
						'coordinates.latitude': 0,
						'coordinates.longitude': 0,
					},
				}
			);
			expect(result.modifiedCount).toBe(1);
		});

		it('should return zero modified when Lyon not found', async () => {
			mockCollection.updateOne.mockResolvedValue({
				matchedCount: 0,
				modifiedCount: 0,
				acknowledged: true,
			});

			const result = await updateLyonCoordinates(45.75, 4.85);

			expect(result.matchedCount).toBe(0);
			expect(result.modifiedCount).toBe(0);
		});
	});

	describe('addPopulationToLyon', () => {
		it('should successfully add population field to Lyon', async () => {
			mockCollection.updateOne.mockResolvedValue({
				matchedCount: 1,
				modifiedCount: 1,
				acknowledged: true,
			});

			const result = await addPopulationToLyon(513275);

			expect(getCollection).toHaveBeenCalledWith('city');
			expect(mockCollection.updateOne).toHaveBeenCalledWith(
				{ city_name: 'Lyon' },
				{ $set: { population: 513275 } }
			);
			expect(result.matchedCount).toBe(1);
			expect(result.modifiedCount).toBe(1);
		});

		it('should handle zero population', async () => {
			mockCollection.updateOne.mockResolvedValue({
				matchedCount: 1,
				modifiedCount: 1,
				acknowledged: true,
			});

			const result = await addPopulationToLyon(0);

			expect(mockCollection.updateOne).toHaveBeenCalledWith(
				{ city_name: 'Lyon' },
				{ $set: { population: 0 } }
			);
			expect(result.modifiedCount).toBe(1);
		});

		it('should update existing population field', async () => {
			mockCollection.updateOne.mockResolvedValue({
				matchedCount: 1,
				modifiedCount: 1,
				acknowledged: true,
			});

			const result = await addPopulationToLyon(520000);

			expect(result.modifiedCount).toBe(1);
		});

		it('should return zero modified when Lyon not found', async () => {
			mockCollection.updateOne.mockResolvedValue({
				matchedCount: 0,
				modifiedCount: 0,
				acknowledged: true,
			});

			const result = await addPopulationToLyon(513275);

			expect(result.matchedCount).toBe(0);
			expect(result.modifiedCount).toBe(0);
		});
	});

	// ========================================================================
	// Question 2: Array Operations on Tags
	// ========================================================================

	describe('addTagsToAllCities', () => {
		it('should successfully add multiple tags to all cities', async () => {
			mockCollection.updateMany.mockResolvedValue({
				matchedCount: 10,
				modifiedCount: 10,
				acknowledged: true,
			});

			const tags = ['Touristique', 'Dynamique'];
			const result = await addTagsToAllCities(tags);

			expect(getCollection).toHaveBeenCalledWith('city');
			expect(mockCollection.updateMany).toHaveBeenCalledWith(
				{},
				{ $push: { tags: { $each: tags } } }
			);
			expect(result.matchedCount).toBe(10);
			expect(result.modifiedCount).toBe(10);
		});

		it('should handle single tag', async () => {
			mockCollection.updateMany.mockResolvedValue({
				matchedCount: 10,
				modifiedCount: 10,
				acknowledged: true,
			});

			const result = await addTagsToAllCities(['Moderne']);

			expect(mockCollection.updateMany).toHaveBeenCalledWith(
				{},
				{ $push: { tags: { $each: ['Moderne'] } } }
			);
			expect(result.modifiedCount).toBe(10);
		});

		it('should handle empty array', async () => {
			mockCollection.updateMany.mockResolvedValue({
				matchedCount: 10,
				modifiedCount: 0,
				acknowledged: true,
			});

			const result = await addTagsToAllCities([]);

			expect(mockCollection.updateMany).toHaveBeenCalledWith(
				{},
				{ $push: { tags: { $each: [] } } }
			);
			expect(result.modifiedCount).toBe(0);
		});

		it('should handle no cities in database', async () => {
			mockCollection.updateMany.mockResolvedValue({
				matchedCount: 0,
				modifiedCount: 0,
				acknowledged: true,
			});

			const result = await addTagsToAllCities(['Touristique']);

			expect(result.matchedCount).toBe(0);
			expect(result.modifiedCount).toBe(0);
		});
	});

	describe('removeTagFromAllCities', () => {
		it('should successfully remove tag from all cities', async () => {
			mockCollection.updateMany.mockResolvedValue({
				matchedCount: 10,
				modifiedCount: 5,
				acknowledged: true,
			});

			const result = await removeTagFromAllCities('Sportive');

			expect(getCollection).toHaveBeenCalledWith('city');
			expect(mockCollection.updateMany).toHaveBeenCalledWith(
				{},
				{ $pull: { tags: 'Sportive' } }
			);
			expect(result.matchedCount).toBe(10);
			expect(result.modifiedCount).toBe(5);
		});

		it('should return zero modified when tag does not exist', async () => {
			mockCollection.updateMany.mockResolvedValue({
				matchedCount: 10,
				modifiedCount: 0,
				acknowledged: true,
			});

			const result = await removeTagFromAllCities('NonExistentTag');

			expect(result.matchedCount).toBe(10);
			expect(result.modifiedCount).toBe(0);
		});

		it('should handle special characters in tag', async () => {
			mockCollection.updateMany.mockResolvedValue({
				matchedCount: 10,
				modifiedCount: 2,
				acknowledged: true,
			});

			const result = await removeTagFromAllCities('Éco-responsable');

			expect(mockCollection.updateMany).toHaveBeenCalledWith(
				{},
				{ $pull: { tags: 'Éco-responsable' } }
			);
			expect(result.modifiedCount).toBe(2);
		});

		it('should handle no cities in database', async () => {
			mockCollection.updateMany.mockResolvedValue({
				matchedCount: 0,
				modifiedCount: 0,
				acknowledged: true,
			});

			const result = await removeTagFromAllCities('Sportive');

			expect(result.matchedCount).toBe(0);
			expect(result.modifiedCount).toBe(0);
		});
	});

	describe('removeFirstTagFromBourges', () => {
		it('should successfully remove first tag from Bourges', async () => {
			mockCollection.updateOne.mockResolvedValue({
				matchedCount: 1,
				modifiedCount: 1,
				acknowledged: true,
			});

			const result = await removeFirstTagFromBourges();

			expect(getCollection).toHaveBeenCalledWith('city');
			expect(mockCollection.updateOne).toHaveBeenCalledWith(
				{ city_name: 'Bourges' },
				{ $pop: { tags: -1 } }
			);
			expect(result.matchedCount).toBe(1);
			expect(result.modifiedCount).toBe(1);
		});

		it('should return zero modified when Bourges not found', async () => {
			mockCollection.updateOne.mockResolvedValue({
				matchedCount: 0,
				modifiedCount: 0,
				acknowledged: true,
			});

			const result = await removeFirstTagFromBourges();

			expect(result.matchedCount).toBe(0);
			expect(result.modifiedCount).toBe(0);
		});

		it('should return zero modified when tags array is empty', async () => {
			mockCollection.updateOne.mockResolvedValue({
				matchedCount: 1,
				modifiedCount: 0,
				acknowledged: true,
			});

			const result = await removeFirstTagFromBourges();

			expect(result.matchedCount).toBe(1);
			expect(result.modifiedCount).toBe(0);
		});

		it('should use $pop with -1 to remove first element', async () => {
			mockCollection.updateOne.mockResolvedValue({
				matchedCount: 1,
				modifiedCount: 1,
				acknowledged: true,
			});

			await removeFirstTagFromBourges();

			// Verify -1 is used (removes first), not 1 (which removes last)
			expect(mockCollection.updateOne).toHaveBeenCalledWith(
				expect.anything(),
				{ $pop: { tags: -1 } }
			);
		});
	});

	describe('removeAllTagsFromCity', () => {
		it('should successfully remove all tags from a city', async () => {
			mockCollection.updateOne.mockResolvedValue({
				matchedCount: 1,
				modifiedCount: 1,
				acknowledged: true,
			});

			const result = await removeAllTagsFromCity('Bourges');

			expect(getCollection).toHaveBeenCalledWith('city');
			expect(mockCollection.updateOne).toHaveBeenCalledWith(
				{ city_name: 'Bourges' },
				{ $unset: { tags: '' } }
			);
			expect(result.matchedCount).toBe(1);
			expect(result.modifiedCount).toBe(1);
		});

		it('should handle city not found', async () => {
			mockCollection.updateOne.mockResolvedValue({
				matchedCount: 0,
				modifiedCount: 0,
				acknowledged: true,
			});

			const result = await removeAllTagsFromCity('NonExistentCity');

			expect(result.matchedCount).toBe(0);
			expect(result.modifiedCount).toBe(0);
		});

		it('should return zero modified when tags field does not exist', async () => {
			mockCollection.updateOne.mockResolvedValue({
				matchedCount: 1,
				modifiedCount: 0,
				acknowledged: true,
			});

			const result = await removeAllTagsFromCity('Lyon');

			expect(result.matchedCount).toBe(1);
			expect(result.modifiedCount).toBe(0);
		});

		it('should handle city names with special characters', async () => {
			mockCollection.updateOne.mockResolvedValue({
				matchedCount: 1,
				modifiedCount: 1,
				acknowledged: true,
			});

			const result = await removeAllTagsFromCity('Aix-en-Provence');

			expect(mockCollection.updateOne).toHaveBeenCalledWith(
				{ city_name: 'Aix-en-Provence' },
				{ $unset: { tags: '' } }
			);
			expect(result.modifiedCount).toBe(1);
		});

		it('should propagate database errors', async () => {
			const dbError = new Error('Network timeout');
			mockCollection.updateOne.mockRejectedValue(dbError);

			await expect(removeAllTagsFromCity('Bourges')).rejects.toThrow(
				'Network timeout'
			);
		});
	});

	// ========================================================================
	// Integration Tests
	// ========================================================================

	describe('Collection name consistency', () => {
		it('all functions should use the same collection name', async () => {
			mockCollection.updateOne.mockResolvedValue({
				matchedCount: 1,
				modifiedCount: 1,
			});
			mockCollection.updateMany.mockResolvedValue({
				matchedCount: 1,
				modifiedCount: 1,
			});

			await updateCityName('Paris', 'Paname');
			await updateLyonCoordinates(45.75, 4.85);
			await addPopulationToLyon(513275);
			await addTagsToAllCities(['Test']);
			await removeTagFromAllCities('Test');
			await removeFirstTagFromBourges();
			await removeAllTagsFromCity('Bourges');

			// All functions should use 'city' collection
			expect(getCollection).toHaveBeenCalledTimes(7);
			getCollection.mock.calls.forEach((call) => {
				expect(call[0]).toBe('city');
			});
		});
	});
});
