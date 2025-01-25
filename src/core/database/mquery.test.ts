import { multiTransaction } from "./mquery";
import { mysqli } from "./mysqli"

jest.mock('mysql2/promise', () => {
    const mockQuery = jest.fn();
    const mockExecute = jest.fn();
    const mockBeginTransaction = jest.fn();
    const mockCommit = jest.fn();
    const mockRollback = jest.fn();
    const mockRelease = jest.fn();

    const mockConnection = {
        query: mockQuery,
        execute: mockExecute,
        beginTransaction: mockBeginTransaction,
        commit: mockCommit,
        rollback: mockRollback,
        release: mockRelease,
    };

    const mockGetConnection = jest.fn().mockResolvedValue(mockConnection);

    const mockEnd = jest.fn();
    const mockPool = {
        query: mockQuery,
        execute: mockExecute,
        getConnection: mockGetConnection,
        end: mockEnd,
    };

    return {
        createPool: jest.fn(() => mockPool),
        Pool: jest.fn(() => mockPool),
    };
});


let mockQuery: jest.Mock;
let mockEnd: jest.Mock;

beforeEach(() => {
    const poolMock = mysqli as jest.Mocked<any>;
    mockQuery = poolMock.query;
    mockEnd = poolMock.end;
});

afterEach(() => {
    jest.clearAllMocks();
});

test("Usando multitrasaction", async () => {

    const mockRows1 = [{ id: 1, name: 'Test User' }];
    const mockRows2 = [{ id: 2, name: 'Another User' }];

    mockQuery.mockResolvedValueOnce([mockRows1])
    .mockResolvedValueOnce([mockRows2])

    const multi = await multiTransaction();
    const res1 = await multi.query("SELECT * FROM user WHERE id = 1");
    const res2 = await multi.query("SELECT * FROM user WHERE id = 2");
    await multi.finish();

    jest.spyOn(multi, 'execute').mockResolvedValueOnce({
        error: false,
        error_message: '',
        error_code: 0,
        rows: []
    });

    expect(res1).toEqual({
        error: false,
        error_message: '',
        error_code: 0,
        rows: mockRows1,
    });

    expect(res2).toEqual({
        error: false,
        error_message: '',
        error_code: 0,
        rows: mockRows2,
    });

});