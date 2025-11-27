/**
 * Unit tests for livre collection operations
 * Tests MongoDB schema validation and unique constraints
 */

// Mock the connection module before requiring functions
jest.mock('../db/connection', () => ({
  connect: jest.fn(),
  disconnect: jest.fn(),
  getDb: jest.fn()
}));

const { connect, getDb } = require('../db/connection');
const { insertLivre, TEST_LIVRES } = require('../db/test-livre-inserts');

describe('Livre Collection Operations', () => {
  let mockCollection;
  let mockDb;

  beforeEach(() => {
    jest.clearAllMocks();

    // Create mock collection
    mockCollection = {
      insertOne: jest.fn(),
      countDocuments: jest.fn(),
      find: jest.fn(),
      drop: jest.fn(),
      createIndex: jest.fn()
    };

    // Mock database
    mockDb = {
      collection: jest.fn().mockReturnValue(mockCollection),
      createCollection: jest.fn(),
      listCollections: jest.fn().mockReturnValue({
        toArray: jest.fn().mockResolvedValue([])
      })
    };

    // Mock getDb to return mock database
    getDb.mockReturnValue(mockDb);
    connect.mockResolvedValue(mockDb);
  });

  describe('Valid Livre Insertion', () => {
    it('should successfully insert valid livre with all fields', async () => {
      const validLivre = {
        titre: "Harry Potter à l'école des sorciers",
        auteur: "J. K. Rowling",
        année: 2001,
        genre: "Fantasy"
      };

      const mockResult = { insertedId: 'mock-id-123', acknowledged: true };
      mockCollection.insertOne.mockResolvedValue(mockResult);

      const result = await insertLivre(mockCollection, validLivre, 0);

      expect(result.success).toBe(true);
      expect(mockCollection.insertOne).toHaveBeenCalledWith(validLivre);
      expect(mockCollection.insertOne).toHaveBeenCalledTimes(1);
    });

    it('should successfully insert valid livre without optional genre', async () => {
      const validLivre = {
        titre: "Le Petit Prince",
        auteur: "Antoine de Saint-Exupéry",
        année: 1943
        // No genre field
      };

      const mockResult = { insertedId: 'mock-id-456', acknowledged: true };
      mockCollection.insertOne.mockResolvedValue(mockResult);

      const result = await insertLivre(mockCollection, validLivre, 0);

      expect(result.success).toBe(true);
      expect(mockCollection.insertOne).toHaveBeenCalledWith(validLivre);
    });

    it('should accept année exactly at minimum boundary (1901)', async () => {
      const validLivre = {
        titre: "Old Book",
        auteur: "Ancient Author",
        année: 1901
      };

      const mockResult = { insertedId: 'mock-id-789', acknowledged: true };
      mockCollection.insertOne.mockResolvedValue(mockResult);

      const result = await insertLivre(mockCollection, validLivre, 0);

      expect(result.success).toBe(true);
    });
  });

  describe('Validation Error Handling', () => {
    it('should reject livre with année below minimum (1800 < 1901)', async () => {
      const invalidLivre = {
        titre: "Livre vieux",
        auteur: "Auteur inconnu",
        année: 1800
      };

      const mockError = new Error('Document failed validation');
      mockError.code = 121; // MongoDB validation error code
      mockError.errInfo = {
        details: {
          schemaRulesNotSatisfied: [{
            propertiesNotSatisfied: [{
              propertyName: 'année',
              details: [{
                operatorName: 'minimum',
                consideredValue: 1800,
                specifiedAs: { minimum: 1901 },
                reason: 'comparison failed'
              }]
            }]
          }]
        }
      };

      mockCollection.insertOne.mockRejectedValue(mockError);

      const result = await insertLivre(mockCollection, invalidLivre, 0);

      expect(result.success).toBe(false);
      expect(result.error.code).toBe(121);
    });

    it('should reject livre with missing required field (titre)', async () => {
      const invalidLivre = {
        // Missing titre
        auteur: "Author",
        année: 2000
      };

      const mockError = new Error('Document failed validation');
      mockError.code = 121;
      mockError.errInfo = {
        details: {
          schemaRulesNotSatisfied: [{
            missingProperties: ['titre']
          }]
        }
      };

      mockCollection.insertOne.mockRejectedValue(mockError);

      const result = await insertLivre(mockCollection, invalidLivre, 0);

      expect(result.success).toBe(false);
      expect(result.error.code).toBe(121);
    });

    it('should reject livre with empty auteur (minLength: 1)', async () => {
      const invalidLivre = {
        titre: "Book Title",
        auteur: "",  // Empty string
        année: 2000
      };

      const mockError = new Error('Document failed validation');
      mockError.code = 121;
      mockError.errInfo = {
        details: {
          schemaRulesNotSatisfied: [{
            propertiesNotSatisfied: [{
              propertyName: 'auteur',
              details: [{
                operatorName: 'minLength',
                specifiedAs: { minLength: 1 },
                reason: 'specified string length was not satisfied'
              }]
            }]
          }]
        }
      };

      mockCollection.insertOne.mockRejectedValue(mockError);

      const result = await insertLivre(mockCollection, invalidLivre, 0);

      expect(result.success).toBe(false);
      expect(result.error.code).toBe(121);
    });

    it('should reject livre with wrong type for année (string instead of int)', async () => {
      const invalidLivre = {
        titre: "Book Title",
        auteur: "Author Name",
        année: "2000"  // String instead of integer
      };

      const mockError = new Error('Document failed validation');
      mockError.code = 121;
      mockError.errInfo = {
        details: {
          schemaRulesNotSatisfied: [{
            propertiesNotSatisfied: [{
              propertyName: 'année',
              details: [{
                operatorName: 'bsonType',
                consideredType: 'string',
                expectedTypes: ['int']
              }]
            }]
          }]
        }
      };

      mockCollection.insertOne.mockRejectedValue(mockError);

      const result = await insertLivre(mockCollection, invalidLivre, 0);

      expect(result.success).toBe(false);
    });
  });

  describe('Unique Constraint Handling', () => {
    it('should reject duplicate titre (unique index violation)', async () => {
      const duplicateLivre = {
        titre: "Harry Potter à l'école des sorciers",  // Duplicate
        auteur: "Copycat",
        année: 2012,
        genre: "Fantasy"
      };

      const mockError = new Error('E11000 duplicate key error');
      mockError.code = 11000; // MongoDB duplicate key error code
      mockError.keyPattern = { titre: 1 };
      mockError.keyValue = { titre: "Harry Potter à l'école des sorciers" };

      mockCollection.insertOne.mockRejectedValue(mockError);

      const result = await insertLivre(mockCollection, duplicateLivre, 0);

      expect(result.success).toBe(false);
      expect(result.error.code).toBe(11000);
    });

    it('should allow same auteur with different titre', async () => {
      const livre1 = {
        titre: "Book One",
        auteur: "Same Author",
        année: 2000
      };

      const livre2 = {
        titre: "Book Two",
        auteur: "Same Author",  // Same author, different title
        année: 2001
      };

      mockCollection.insertOne.mockResolvedValue({ insertedId: 'id1', acknowledged: true });

      const result1 = await insertLivre(mockCollection, livre1, 0);

      mockCollection.insertOne.mockResolvedValue({ insertedId: 'id2', acknowledged: true });

      const result2 = await insertLivre(mockCollection, livre2, 1);

      expect(result1.success).toBe(true);
      expect(result2.success).toBe(true);
    });
  });

  describe('TEST_LIVRES Data Structure', () => {
    it('should have exactly 4 test cases', () => {
      expect(TEST_LIVRES).toHaveLength(4);
    });

    it('should have 2 valid and 2 invalid test cases', () => {
      // Test case 1: valid
      expect(TEST_LIVRES[0].année).toBeGreaterThan(1900);
      expect(TEST_LIVRES[0].auteur).not.toBe('');

      // Test case 2: valid
      expect(TEST_LIVRES[1].année).toBeGreaterThan(1900);
      expect(TEST_LIVRES[1].auteur).not.toBe('');

      // Test case 3: invalid (année < 1901)
      expect(TEST_LIVRES[2].année).toBeLessThan(1901);

      // Test case 4: invalid (duplicate titre)
      expect(TEST_LIVRES[3].titre).toBe(TEST_LIVRES[0].titre);
    });

    it('should have proper structure for each test case', () => {
      TEST_LIVRES.forEach((livre, index) => {
        expect(livre).toHaveProperty('titre');
        expect(livre).toHaveProperty('auteur');
        expect(livre).toHaveProperty('année');
        // genre is optional
      });
    });
  });

  describe('Error Code Recognition', () => {
    it('should recognize code 121 as validation error', async () => {
      const invalidLivre = { titre: "Test", auteur: "Test", année: 1800 };
      const mockError = new Error('Validation failed');
      mockError.code = 121;
      mockError.errInfo = { details: { schemaRulesNotSatisfied: [] } };

      mockCollection.insertOne.mockRejectedValue(mockError);

      const result = await insertLivre(mockCollection, invalidLivre, 0);

      expect(result.success).toBe(false);
      expect(result.error.code).toBe(121);
    });

    it('should recognize code 11000 as duplicate key error', async () => {
      const duplicateLivre = { titre: "Duplicate", auteur: "Test", année: 2000 };
      const mockError = new Error('Duplicate key');
      mockError.code = 11000;

      mockCollection.insertOne.mockRejectedValue(mockError);

      const result = await insertLivre(mockCollection, duplicateLivre, 0);

      expect(result.success).toBe(false);
      expect(result.error.code).toBe(11000);
    });

    it('should handle unexpected errors', async () => {
      const livre = { titre: "Test", auteur: "Test", année: 2000 };
      const mockError = new Error('Network error');
      mockError.code = 999; // Unexpected error code

      mockCollection.insertOne.mockRejectedValue(mockError);

      const result = await insertLivre(mockCollection, livre, 0);

      expect(result.success).toBe(false);
      expect(result.error.message).toBe('Network error');
    });
  });
});
