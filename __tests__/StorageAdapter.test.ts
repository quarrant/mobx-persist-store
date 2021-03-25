const { StorageAdapter } = require('../src/StorageAdapter');

const testStorage: Record<string, unknown> = {
  testRead: JSON.stringify({ test: 'testContent' }),
  mockStore: undefined,
};

function testWriteInJson(name: string, content: Record<string, unknown>): Promise<void> {
  return new Promise((resolve) => {
    Object.assign(testStorage, { [name]: content });
    resolve();
  });
}

function testReadFromJson(name: string) {
  return new Promise((resolve) => {
    if (testStorage[name]) {
      resolve(testStorage[name]);
    }
  });
}

const storage = new StorageAdapter({ write: testWriteInJson, read: testReadFromJson });

const mockStore: Record<string, unknown> = {
  4: 'test',
  5: 1,
  6: 1.15,
  7: { 0: 'a' },
  8: [1, 1],
  9: 1e15,
};

describe('mock store', () => {
  beforeAll(() => {
    storage.writeInStorage('mockStore', mockStore);
  });

  it(`writeInStore`, () => {
    expect(testStorage['mockStore']).toEqual(JSON.stringify(mockStore));
  });

  it(`readFromStore`, () => {
    storage.readFromStorage('mockStore').then((content: Record<string, unknown>) => {
      expect(content).toEqual(mockStore);
    });
  });
});
