/**
 * Unit tests for game query functions
 * Tests use mocked MongoDB collection to isolate query logic
 */

// Mock the connection module before requiring query functions
jest.mock('../db/connection', () => ({
  getCollection: jest.fn()
}));

const { getCollection } = require('../db/connection');
const {
  getAllThreeDSGames,
  getThreeDSGamesFrom2011,
  getThreeDSGamesSales2011,
  getTop3ThreeDSGames2011
} = require('../queries/game-queries');

describe('Game Query Functions', () => {
  let mockCollection;
  let mockFind;

  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();

    // Create mock find chain
    mockFind = {
      toArray: jest.fn(),
      sort: jest.fn(),
      limit: jest.fn(),
      project: jest.fn()
    };

    // Make chain methods return themselves for chaining
    mockFind.sort.mockReturnValue(mockFind);
    mockFind.limit.mockReturnValue(mockFind);
    mockFind.project.mockReturnValue(mockFind);

    // Create mock collection
    mockCollection = {
      find: jest.fn().mockReturnValue(mockFind)
    };

    // Mock getCollection to return mock collection
    getCollection.mockReturnValue(mockCollection);
  });

  describe('getAllThreeDSGames', () => {
    it('should query for all 3DS platform games', async () => {
      const mockGames = [
        { Name: 'Game 1', Platform: '3DS', Year: '2011', Global_Sales: 10.5 },
        { Name: 'Game 2', Platform: '3DS', Year: '2012', Global_Sales: 8.3 }
      ];
      mockFind.toArray.mockResolvedValue(mockGames);

      const result = await getAllThreeDSGames();

      expect(mockCollection.find).toHaveBeenCalledWith({ Platform: '3DS' });
      expect(result).toEqual(mockGames);
      expect(result).toHaveLength(2);
    });

    it('should return empty array when no 3DS games found', async () => {
      mockFind.toArray.mockResolvedValue([]);

      const result = await getAllThreeDSGames();

      expect(result).toEqual([]);
      expect(result).toHaveLength(0);
    });

    it('should call toArray to execute query', async () => {
      mockFind.toArray.mockResolvedValue([]);

      await getAllThreeDSGames();

      expect(mockFind.toArray).toHaveBeenCalledTimes(1);
    });
  });

  describe('getThreeDSGamesFrom2011', () => {
    it('should filter by Platform=3DS and Year=2011', async () => {
      const mockGames = [
        { Name: 'Mario Kart 7', Platform: '3DS', Year: '2011', Global_Sales: 13.6 },
        { Name: 'Super Mario 3D Land', Platform: '3DS', Year: '2011', Global_Sales: 11.43 }
      ];
      mockFind.toArray.mockResolvedValue(mockGames);

      const result = await getThreeDSGamesFrom2011();

      expect(mockCollection.find).toHaveBeenCalledWith({
        Platform: '3DS',
        Year: '2011'
      });
      expect(result).toEqual(mockGames);
    });

    it('should not return games from other years', async () => {
      mockFind.toArray.mockResolvedValue([]);

      const result = await getThreeDSGamesFrom2011();

      expect(mockCollection.find).toHaveBeenCalledWith({
        Platform: '3DS',
        Year: '2011'
      });
      expect(result).toHaveLength(0);
    });

    it('should treat Year as string in query', async () => {
      mockFind.toArray.mockResolvedValue([]);

      await getThreeDSGamesFrom2011();

      const callArgs = mockCollection.find.mock.calls[0][0];
      expect(typeof callArgs.Year).toBe('string');
      expect(callArgs.Year).toBe('2011');
    });
  });

  describe('getThreeDSGamesSales2011', () => {
    it('should return only Name and Global_Sales fields', async () => {
      const mockGames = [
        { Name: 'Mario Kart 7', Global_Sales: 13.6 },
        { Name: 'Super Mario 3D Land', Global_Sales: 11.43 }
      ];
      mockFind.toArray.mockResolvedValue(mockGames);

      const result = await getThreeDSGamesSales2011();

      // Verify filter criteria
      expect(mockCollection.find).toHaveBeenCalledWith(
        {
          Platform: '3DS',
          Year: '2011'
        },
        {
          projection: {
            _id: 0,
            Name: 1,
            Global_Sales: 1
          }
        }
      );
      expect(result).toEqual(mockGames);
    });

    it('should exclude _id field from results', async () => {
      mockFind.toArray.mockResolvedValue([
        { Name: 'Game 1', Global_Sales: 10.5 }
      ]);

      await getThreeDSGamesSales2011();

      const projection = mockCollection.find.mock.calls[0][1].projection;
      expect(projection._id).toBe(0);
    });

    it('should project only Name and Global_Sales', async () => {
      mockFind.toArray.mockResolvedValue([]);

      await getThreeDSGamesSales2011();

      const projection = mockCollection.find.mock.calls[0][1].projection;
      expect(projection.Name).toBe(1);
      expect(projection.Global_Sales).toBe(1);
      expect(Object.keys(projection)).toEqual(['_id', 'Name', 'Global_Sales']);
    });
  });

  describe('getTop3ThreeDSGames2011', () => {
    it('should return top 3 games sorted by Global_Sales descending', async () => {
      const mockGames = [
        { Name: 'Game 1', Global_Sales: 20.5 },
        { Name: 'Game 2', Global_Sales: 15.3 },
        { Name: 'Game 3', Global_Sales: 10.1 }
      ];
      mockFind.toArray.mockResolvedValue(mockGames);

      const result = await getTop3ThreeDSGames2011();

      expect(mockCollection.find).toHaveBeenCalledWith(
        {
          Platform: '3DS',
          Year: '2011'
        },
        {
          projection: {
            _id: 0,
            Name: 1,
            Global_Sales: 1
          }
        }
      );
      expect(mockFind.sort).toHaveBeenCalledWith({ Global_Sales: -1 });
      expect(mockFind.limit).toHaveBeenCalledWith(3);
      expect(result).toEqual(mockGames);
      expect(result).toHaveLength(3);
    });

    it('should sort by Global_Sales in descending order', async () => {
      mockFind.toArray.mockResolvedValue([]);

      await getTop3ThreeDSGames2011();

      expect(mockFind.sort).toHaveBeenCalledWith({ Global_Sales: -1 });
    });

    it('should limit results to exactly 3 games', async () => {
      mockFind.toArray.mockResolvedValue([]);

      await getTop3ThreeDSGames2011();

      expect(mockFind.limit).toHaveBeenCalledWith(3);
    });

    it('should handle case with fewer than 3 games', async () => {
      const mockGames = [
        { Name: 'Game 1', Global_Sales: 10.5 },
        { Name: 'Game 2', Global_Sales: 8.3 }
      ];
      mockFind.toArray.mockResolvedValue(mockGames);

      const result = await getTop3ThreeDSGames2011();

      expect(result).toHaveLength(2);
    });

    it('should apply sort before limit', async () => {
      mockFind.toArray.mockResolvedValue([]);

      await getTop3ThreeDSGames2011();

      // Verify the call order by checking mock calls
      const sortCall = mockFind.sort.mock.invocationCallOrder[0];
      const limitCall = mockFind.limit.mock.invocationCallOrder[0];
      expect(sortCall).toBeLessThan(limitCall);
    });

    it('should project only Name and Global_Sales fields', async () => {
      mockFind.toArray.mockResolvedValue([]);

      await getTop3ThreeDSGames2011();

      const projection = mockCollection.find.mock.calls[0][1].projection;
      expect(projection).toEqual({
        _id: 0,
        Name: 1,
        Global_Sales: 1
      });
    });
  });

  describe('Error Handling', () => {
    it('should propagate errors from database queries', async () => {
      const mockError = new Error('Database connection failed');
      mockFind.toArray.mockRejectedValue(mockError);

      await expect(getAllThreeDSGames()).rejects.toThrow('Database connection failed');
    });

    it('should throw error when getCollection fails', async () => {
      getCollection.mockImplementation(() => {
        throw new Error('Database not connected');
      });

      await expect(getAllThreeDSGames()).rejects.toThrow('Database not connected');
    });
  });
});
