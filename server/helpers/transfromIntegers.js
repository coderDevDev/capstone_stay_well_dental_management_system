import neo4j from 'neo4j-driver';

export const transformIntegers = function (result) {
  let updatedData = result.map(entryObjects => {
    let keyys = Object.keys(entryObjects);

    let mappeObjectKey = keyys.reduce((acc, key) => {
      let value = neo4j.isInt(entryObjects[key])
        ? neo4j.integer.inSafeRange(entryObjects[key])
          ? entryObjects[key].toNumber()
          : entryObjects[key].toString()
        : entryObjects[key];

      return { ...acc, [key]: value };
    }, {});

    return mappeObjectKey;
  });

  return updatedData;
};
