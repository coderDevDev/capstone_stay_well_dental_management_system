import { createPackage, getPackage } from '../cypher/package.js';

import config from '../config.js';
const { cypherQuerySession } = config;
import { v4 as uuidv4 } from 'uuid';
import neo4j from 'neo4j-driver';
const transformIntegers = function (result) {
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

export const packageRepo = {
  listPackage: async () => {
    let { records } = await cypherQuerySession.executeQuery(getPackage());
    const [packageList] = records[0]._fields;

    return transformIntegers(packageList);
  }
};
