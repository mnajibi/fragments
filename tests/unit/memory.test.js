const {
  listFragments,
  writeFragment,
  readFragment,
  writeFragmentData,
  readFragmentData,
  deleteFragment,
} = require('../../src/model/data/memory/index');

describe('Testing fragment database calls using In-Memory memory-db.js', () => {
  test("writeFragment() writes fragment's metadata to memory and readFragment() gets correct result", async () => {
    const metadata = { ownerId: 'a', id: 'b', value: 123 };
    await writeFragment(metadata);
    const result = await readFragment(metadata.ownerId, metadata.id);
    expect(result).toBe(metadata);
  });

  test('writeFragment() throws when passing wrong arguments', async () => {
    expect(async () => await writeFragment()).rejects.toThrow();
    expect(async () => await writeFragment({ ownerId: 1, id: 1, value: 123 })).rejects.toThrow();
    expect(async () => await writeFragment({ ownerId: '1', value: 123 })).rejects.toThrow();
  });

  test("readFragment() returns nothing because arguments doesn't match with database", async () => {
    const result = await readFragment('none', 'none');
    expect(result).toBe(undefined);
  });

  test('readFragment() throws when passing wrong arguments', async () => {
    expect(async () => await readFragment()).rejects.toThrow();
    expect(async () => await readFragment(1)).rejects.toThrow();
    expect(async () => await readFragment(1, 2)).rejects.toThrow();
    expect(async () => await readFragment('a', 1)).rejects.toThrow();
    expect(async () => await readFragment(1, 'b')).rejects.toThrow();
  });

  test('listFragments() returns ids only', async () => {
    const metadata = [
      { ownerId: 'b', id: 'a', type: 'text' },
      { ownerId: 'b', id: 'b', type: 'text' },
    ];
    await Promise.all(metadata.map((metadata) => writeFragment(metadata)));
    const result = await listFragments('b');
    expect(Array.isArray(result)).toBe(true);
    expect(typeof result[0]).toBe('string');
  });

  test('listFragments() returns fragment objects', async () => {
    const ownerId = 'b';
    const result = await listFragments(ownerId, true);
    expect(Array.isArray(result)).toBe(true);
    expect(typeof result[0]).toBe('object');
    expect(result[0]['type']).toBeDefined();
    expect(result[0]['type']).toBe('text');
  });

  test('listFragments() returns an empty array', async () => {
    const result = await listFragments('none', true);
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBe(0);
  });
});

describe("Testing fragment's data controllers", () => {
  test('writeFragmentData() throws when passing wrong arguments', async () => {
    expect(async () => await writeFragmentData()).rejects.toThrow();
    expect(async () => await writeFragmentData(1)).rejects.toThrow();
    expect(async () => await writeFragmentData(1, 2, 'buffer')).rejects.toThrow();
    expect(async () => await writeFragmentData('a', 1)).rejects.toThrow();
  });

  test('writeFragmentData() and readFragmentData() works well together', async () => {
    const data = Buffer.from('string');
    await writeFragmentData('a', 'b', data);
    const result = await readFragmentData('a', 'b');
    expect(result).toBe(data);
  });

  test("readFragmentData() returns nothing because arguments doesn't match with database", async () => {
    const result = await readFragmentData('none', 'none');
    expect(result).toBe(undefined);
  });

  test('readFragmentData() throws when passing wrong arguments', async () => {
    expect(async () => await readFragmentData()).rejects.toThrow();
    expect(async () => await readFragmentData(1)).rejects.toThrow();
    expect(async () => await readFragmentData(1, 2)).rejects.toThrow();
    expect(async () => await readFragmentData('a', 1)).rejects.toThrow();
    expect(async () => await readFragmentData(1, 'b')).rejects.toThrow();
  });

  test('deleteFragment() deletes both metadata and data', async () => {
    const metadatas = [
      { ownerId: 'c', id: 'a', type: 'text' },
      { ownerId: 'c', id: 'b', type: 'text' },
    ];
    const data = Buffer.from('string');

    await Promise.all(metadatas.map((metadata) => writeFragment(metadata)));
    await Promise.all(
      metadatas.map((metadata) => writeFragmentData(metadata.ownerId, metadata.id, data))
    );
    // deleting metadata and data
    await Promise.all(metadatas.map((metadata) => deleteFragment(metadata.ownerId, metadata.id)));
    // checking if data still exists or not
    const readFragmentDatas = metadatas.map((metadata) =>
      readFragmentData(metadata.ownerId, metadata.id)
    );

    expect(await Promise.all(readFragmentDatas)).toEqual([undefined, undefined]);
    expect(await listFragments('c')).toEqual([]);
  });

  test('deleteFragment() throws when passing wrong arguments', async () => {
    expect(async () => deleteFragment('none', 'none')).rejects.toThrow();
  });
});
