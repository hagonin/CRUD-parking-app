/**
 * Unit tests for livre query functions
 * Tests insertMany, deleteOne, and deleteMany operations
 */

// Mock the connection module before requiring query functions
jest.mock('../db/connection', () => ({
  getCollection: jest.fn()
}));

const { getCollection } = require('../db/connection');
const {
  insertMultipleLivres,
  deleteLivreByTitre,
  deleteLivresByAuteur
} = require('../queries/livre-queries');

describe('Livre Query Functions', () => {
  let mockCollection;

  beforeEach(() => {
    jest.clearAllMocks();

    // Create mock collection with all methods
    mockCollection = {
      insertOne: jest.fn(),
      insertMany: jest.fn(),
      deleteOne: jest.fn(),
      deleteMany: jest.fn(),
      find: jest.fn(),
      countDocuments: jest.fn()
    };

    // Mock getCollection to return mock collection
    getCollection.mockReturnValue(mockCollection);
  });

  describe('insertMultipleLivres', () => {
    it('should successfully insert multiple valid books', async () => {
      const livres = [
        {
          titre: "Le Petit Prince",
          auteur: "Antoine de Saint-Exupéry",
          année: 1943,
          genre: "Fiction"
        },
        {
          titre: "1984",
          auteur: "George Orwell",
          année: 1949,
          genre: "Dystopian"
        }
      ];

      const mockResult = {
        acknowledged: true,
        insertedCount: 2,
        insertedIds: { '0': 'id1', '1': 'id2' }
      };

      mockCollection.insertMany.mockResolvedValue(mockResult);

      const result = await insertMultipleLivres(livres);

      expect(getCollection).toHaveBeenCalledWith('livre');
      expect(mockCollection.insertMany).toHaveBeenCalledWith(livres);
      expect(result.acknowledged).toBe(true);
      expect(result.insertedCount).toBe(2);
    });

    it('should handle empty array', async () => {
      const livres = [];

      const mockResult = {
        acknowledged: true,
        insertedCount: 0,
        insertedIds: {}
      };

      mockCollection.insertMany.mockResolvedValue(mockResult);

      const result = await insertMultipleLivres(livres);

      expect(mockCollection.insertMany).toHaveBeenCalledWith(livres);
      expect(result.insertedCount).toBe(0);
    });

    it('should handle single book in array', async () => {
      const livres = [{
        titre: "Single Book",
        auteur: "Single Author",
        année: 2000
      }];

      const mockResult = {
        acknowledged: true,
        insertedCount: 1,
        insertedIds: { '0': 'id1' }
      };

      mockCollection.insertMany.mockResolvedValue(mockResult);

      const result = await insertMultipleLivres(livres);

      expect(result.insertedCount).toBe(1);
    });

    it('should propagate validation errors (code 121)', async () => {
      const invalidLivres = [{
        titre: "Invalid Book",
        auteur: "Author",
        année: 1800  // Invalid: < 1901
      }];

      const mockError = new Error('Document validation failed');
      mockError.code = 121;
      mockError.errInfo = {
        details: {
          schemaRulesNotSatisfied: [{
            propertiesNotSatisfied: [{
              propertyName: 'année',
              details: [{
                operatorName: 'minimum',
                consideredValue: 1800,
                specifiedAs: { minimum: 1901 }
              }]
            }]
          }]
        }
      };

      mockCollection.insertMany.mockRejectedValue(mockError);

      await expect(insertMultipleLivres(invalidLivres)).rejects.toThrow('Document validation failed');
    });

    it('should propagate duplicate key errors (code 11000)', async () => {
      const duplicateLivres = [
        { titre: "Book", auteur: "Author", année: 2000 },
        { titre: "Book", auteur: "Other", année: 2001 }  // Duplicate titre
      ];

      const mockError = new Error('E11000 duplicate key error');
      mockError.code = 11000;
      mockError.keyPattern = { titre: 1 };

      mockCollection.insertMany.mockRejectedValue(mockError);

      await expect(insertMultipleLivres(duplicateLivres)).rejects.toThrow('E11000 duplicate key error');
    });

    it('should call insertMany with correct collection name', async () => {
      const livres = [{ titre: "Test", auteur: "Test", année: 2000 }];
      mockCollection.insertMany.mockResolvedValue({ acknowledged: true, insertedCount: 1 });

      await insertMultipleLivres(livres);

      expect(getCollection).toHaveBeenCalledWith('livre');
      expect(getCollection).toHaveBeenCalledTimes(1);
    });
  });

  describe('deleteLivreByTitre', () => {
    it('should successfully delete book by exact titre match', async () => {
      const titre = "1984";

      const mockResult = {
        acknowledged: true,
        deletedCount: 1
      };

      mockCollection.deleteOne.mockResolvedValue(mockResult);

      const result = await deleteLivreByTitre(titre);

      expect(getCollection).toHaveBeenCalledWith('livre');
      expect(mockCollection.deleteOne).toHaveBeenCalledWith({ titre: "1984" });
      expect(result.acknowledged).toBe(true);
      expect(result.deletedCount).toBe(1);
    });

    it('should return deletedCount 0 when book not found', async () => {
      const titre = "Nonexistent Book";

      const mockResult = {
        acknowledged: true,
        deletedCount: 0
      };

      mockCollection.deleteOne.mockResolvedValue(mockResult);

      const result = await deleteLivreByTitre(titre);

      expect(mockCollection.deleteOne).toHaveBeenCalledWith({ titre: "Nonexistent Book" });
      expect(result.deletedCount).toBe(0);
    });

    it('should handle titre with special characters', async () => {
      const titre = "Harry Potter à l'école des sorciers";

      const mockResult = {
        acknowledged: true,
        deletedCount: 1
      };

      mockCollection.deleteOne.mockResolvedValue(mockResult);

      const result = await deleteLivreByTitre(titre);

      expect(mockCollection.deleteOne).toHaveBeenCalledWith({ titre: "Harry Potter à l'école des sorciers" });
      expect(result.deletedCount).toBe(1);
    });

    it('should delete only first match (not all)', async () => {
      const titre = "Common Title";

      const mockResult = {
        acknowledged: true,
        deletedCount: 1  // Only one deleted, even if duplicates exist
      };

      mockCollection.deleteOne.mockResolvedValue(mockResult);

      const result = await deleteLivreByTitre(titre);

      expect(result.deletedCount).toBe(1);
      expect(mockCollection.deleteOne).toHaveBeenCalledTimes(1);
    });

    it('should be case-sensitive by default', async () => {
      const titre = "book title";  // lowercase

      const mockResult = {
        acknowledged: true,
        deletedCount: 0  // Won't match "Book Title"
      };

      mockCollection.deleteOne.mockResolvedValue(mockResult);

      await deleteLivreByTitre(titre);

      expect(mockCollection.deleteOne).toHaveBeenCalledWith({ titre: "book title" });
    });

    it('should propagate database errors', async () => {
      const titre = "Test";
      const mockError = new Error('Database connection lost');

      mockCollection.deleteOne.mockRejectedValue(mockError);

      await expect(deleteLivreByTitre(titre)).rejects.toThrow('Database connection lost');
    });

    it('should call deleteOne (not deleteMany)', async () => {
      const titre = "Test Book";
      mockCollection.deleteOne.mockResolvedValue({ acknowledged: true, deletedCount: 1 });

      await deleteLivreByTitre(titre);

      expect(mockCollection.deleteOne).toHaveBeenCalled();
      expect(mockCollection.deleteMany).not.toHaveBeenCalled();
    });
  });

  describe('deleteLivresByAuteur', () => {
    it('should delete all books by J.K. Rowling', async () => {
      const auteur = "J. K. Rowling";

      const mockResult = {
        acknowledged: true,
        deletedCount: 2
      };

      mockCollection.deleteMany.mockResolvedValue(mockResult);

      const result = await deleteLivresByAuteur(auteur);

      expect(getCollection).toHaveBeenCalledWith('livre');
      expect(mockCollection.deleteMany).toHaveBeenCalledWith({ auteur: "J. K. Rowling" });
      expect(result.acknowledged).toBe(true);
      expect(result.deletedCount).toBe(2);
    });

    it('should return deletedCount 0 when no books found', async () => {
      const auteur = "Unknown Author";

      const mockResult = {
        acknowledged: true,
        deletedCount: 0
      };

      mockCollection.deleteMany.mockResolvedValue(mockResult);

      const result = await deleteLivresByAuteur(auteur);

      expect(mockCollection.deleteMany).toHaveBeenCalledWith({ auteur: "Unknown Author" });
      expect(result.deletedCount).toBe(0);
    });

    it('should delete multiple books by same author', async () => {
      const auteur = "George Orwell";

      const mockResult = {
        acknowledged: true,
        deletedCount: 3  // Multiple books deleted
      };

      mockCollection.deleteMany.mockResolvedValue(mockResult);

      const result = await deleteLivresByAuteur(auteur);

      expect(result.deletedCount).toBe(3);
    });

    it('should handle auteur with accents and special chars', async () => {
      const auteur = "Antoine de Saint-Exupéry";

      const mockResult = {
        acknowledged: true,
        deletedCount: 1
      };

      mockCollection.deleteMany.mockResolvedValue(mockResult);

      const result = await deleteLivresByAuteur(auteur);

      expect(mockCollection.deleteMany).toHaveBeenCalledWith({ auteur: "Antoine de Saint-Exupéry" });
      expect(result.deletedCount).toBe(1);
    });

    it('should be case-sensitive for auteur matching', async () => {
      const auteur = "j. k. rowling";  // lowercase

      const mockResult = {
        acknowledged: true,
        deletedCount: 0  // Won't match "J. K. Rowling"
      };

      mockCollection.deleteMany.mockResolvedValue(mockResult);

      await deleteLivresByAuteur(auteur);

      expect(mockCollection.deleteMany).toHaveBeenCalledWith({ auteur: "j. k. rowling" });
    });

    it('should delete single book if author has only one', async () => {
      const auteur = "Single Book Author";

      const mockResult = {
        acknowledged: true,
        deletedCount: 1
      };

      mockCollection.deleteMany.mockResolvedValue(mockResult);

      const result = await deleteLivresByAuteur(auteur);

      expect(result.deletedCount).toBe(1);
    });

    it('should propagate database errors', async () => {
      const auteur = "Test Author";
      const mockError = new Error('Database error');

      mockCollection.deleteMany.mockRejectedValue(mockError);

      await expect(deleteLivresByAuteur(auteur)).rejects.toThrow('Database error');
    });

    it('should call deleteMany (not deleteOne)', async () => {
      const auteur = "Test Author";
      mockCollection.deleteMany.mockResolvedValue({ acknowledged: true, deletedCount: 2 });

      await deleteLivresByAuteur(auteur);

      expect(mockCollection.deleteMany).toHaveBeenCalled();
      expect(mockCollection.deleteOne).not.toHaveBeenCalled();
    });

    it('should use exact auteur value in query', async () => {
      const auteur = "J. K. Rowling";  // With spaces and periods
      mockCollection.deleteMany.mockResolvedValue({ acknowledged: true, deletedCount: 2 });

      await deleteLivresByAuteur(auteur);

      const callArgs = mockCollection.deleteMany.mock.calls[0][0];
      expect(callArgs).toEqual({ auteur: "J. K. Rowling" });
      expect(callArgs.auteur).toBe("J. K. Rowling");
    });
  });

  describe('Collection Name Consistency', () => {
    it('should use "livre" collection for all operations', async () => {
      mockCollection.insertMany.mockResolvedValue({ acknowledged: true, insertedCount: 1 });
      mockCollection.deleteOne.mockResolvedValue({ acknowledged: true, deletedCount: 1 });
      mockCollection.deleteMany.mockResolvedValue({ acknowledged: true, deletedCount: 2 });

      await insertMultipleLivres([{ titre: "Test", auteur: "Test", année: 2000 }]);
      await deleteLivreByTitre("Test");
      await deleteLivresByAuteur("Test");

      // All 3 calls should request 'livre' collection
      expect(getCollection).toHaveBeenCalledWith('livre');
      expect(getCollection).toHaveBeenCalledTimes(3);
    });
  });

  describe('Error Handling', () => {
    it('should throw error when getCollection fails', async () => {
      getCollection.mockImplementation(() => {
        throw new Error('Database not connected');
      });

      await expect(insertMultipleLivres([{ titre: "Test", auteur: "Test", année: 2000 }]))
        .rejects.toThrow('Database not connected');

      await expect(deleteLivreByTitre("Test"))
        .rejects.toThrow('Database not connected');

      await expect(deleteLivresByAuteur("Test"))
        .rejects.toThrow('Database not connected');
    });

    it('should not mask original error messages', async () => {
      const specificError = new Error('Specific MongoDB error message');
      mockCollection.insertMany.mockRejectedValue(specificError);

      await expect(insertMultipleLivres([{ titre: "Test", auteur: "Test", année: 2000 }]))
        .rejects.toThrow('Specific MongoDB error message');
    });
  });

  describe('Return Value Structure', () => {
    it('insertMultipleLivres should return insertMany result structure', async () => {
      const mockResult = {
        acknowledged: true,
        insertedCount: 2,
        insertedIds: { '0': 'id1', '1': 'id2' }
      };
      mockCollection.insertMany.mockResolvedValue(mockResult);

      const result = await insertMultipleLivres([
        { titre: "Book1", auteur: "Author1", année: 2000 },
        { titre: "Book2", auteur: "Author2", année: 2001 }
      ]);

      expect(result).toHaveProperty('acknowledged');
      expect(result).toHaveProperty('insertedCount');
      expect(result).toHaveProperty('insertedIds');
    });

    it('deleteLivreByTitre should return deleteOne result structure', async () => {
      const mockResult = {
        acknowledged: true,
        deletedCount: 1
      };
      mockCollection.deleteOne.mockResolvedValue(mockResult);

      const result = await deleteLivreByTitre("Test");

      expect(result).toHaveProperty('acknowledged');
      expect(result).toHaveProperty('deletedCount');
      expect(typeof result.deletedCount).toBe('number');
    });

    it('deleteLivresByAuteur should return deleteMany result structure', async () => {
      const mockResult = {
        acknowledged: true,
        deletedCount: 3
      };
      mockCollection.deleteMany.mockResolvedValue(mockResult);

      const result = await deleteLivresByAuteur("Test Author");

      expect(result).toHaveProperty('acknowledged');
      expect(result).toHaveProperty('deletedCount');
      expect(typeof result.deletedCount).toBe('number');
    });
  });
});
