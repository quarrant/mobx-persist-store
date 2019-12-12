const StorageAdapter = require('../src/StorageAdapter').default;

const testStorage = {
  testRead: JSON.stringify({ test: 'testContent' }),
};

function testWriteInJson(name, content) {
  return new Promise((resolve) => {
    Object.assign(testStorage, { [name]: content });
    resolve();
  });
}

function testReadFromJson(name) {
  return new Promise((resolve) => {
    if (testStorage[name]) {
      resolve(testStorage[name]);
    }
  });
}

describe('StorageAdapter', () => {
  const storage = new StorageAdapter({ write: testWriteInJson, read: testReadFromJson });

  it('writeInStorage', () => {
    return storage.writeInStorage('testWrite', { test: 'testContent' }).then(() => {
      expect(testStorage['testWrite']).toEqual(JSON.stringify({ test: 'testContent' }));
    });
  });

  it('readFromStorage', () => {
    return storage.readFromStorage('testRead').then((content) => {
      expect(content).toEqual({ test: 'testContent' });
    });
  });
});
