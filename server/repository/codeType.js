import {
  listCodeType,
  listCodes,
  listPendingCode,
  updatePendingCodes,
  getCode,
  updateCodeByName,
  getCodeListForDailyProfit,
  getCodeByUserId
} from '../cypher/code.js';

import config from '../config.js';
const { cypherQuerySession } = config;

import neo4j from 'neo4j-driver';
import { v4 as uuidv4 } from 'uuid';
import ShortUniqueId from 'short-unique-id';
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

export const codeTypeRepo = {
  listCodeType: async () => {
    let { records } = await cypherQuerySession.executeQuery(listCodeType());
    const [packageList] = records[0]._fields;

    return packageList;
  },
  listCode: async () => {
    let { records } = await cypherQuerySession.executeQuery(
      listCodes({
        isApproved: true
      })
    );

    const [list] = records[0]._fields;

    let data = transformIntegers(list);

    return data;
  },
  listPendingCode: async () => {
    let { records } = await cypherQuerySession.executeQuery(
      listPendingCode({
        isApproved: false
      })
    );

    const [list] = records[0]._fields;

    let data = transformIntegers(
      list.map(data => {
        let codeList = transformIntegers(data.codeList);

        return {
          ...data,
          codeList
        };
      })
    );

    return data;
  },
  updatePendingCodes: async ({ bundleId, isApproved = true }) => {
    let { records } = await cypherQuerySession.executeQuery(
      updatePendingCodes({ bundleId, isApproved })
    );
  },
  validateCode: async ({ code, userId, userPackageType }) => {
    // check if exist
    // check if status  = 'AVAILABLE'
    // check if userID property exists on code

    let { records } = await cypherQuerySession.executeQuery(getCode(code));

    let isValid = false;

    if (records.length > 0) {
      let list = records[0]._fields;

      let [data] = transformIntegers(list);

      let { status, isApproved, packageType } = data;

      let checkIfAvailability = status === 'AVAILABLE' && !!isApproved;

      let checkUserPackage = userPackageType === packageType;

      isValid = checkIfAvailability && checkUserPackage;
    }

    return isValid;
  },
  updateCodeByName: async ({ code, updateData }) => {
    await cypherQuerySession.executeQuery(updateCodeByName(code, updateData));
  },
  getCodeListForDailyProfit: async () => {
    let { records } = await cypherQuerySession.executeQuery(
      getCodeListForDailyProfit()
    );
    const [list] = records[0]._fields;

    let data = transformIntegers(list);

    return data;
  },
  generateCode: ({
    bundleId,
    codeType = 'FREE_SLOT' || 'REGULAR',
    packageType,
    userID = ''
  }) => {
    // codeTypeV -[:has_bundle]-> bundleV  [has_code -> codeV
    if (codeType === 'FREE_SLOT') {
      // send email to admin to confirm
    }

    const { randomUUID } = new ShortUniqueId({ length: 6 });

    return {
      name: randomUUID(),
      bundleId: bundleId,
      dateTimeAdded: Date.now(),
      dateTimeUpdated: Date.now(),
      status: 'AVAILABLE', // 'AVAILABLE' || 'USED',
      type: codeType, //'FREE_SLOT' || 'REGULAR', // from UI
      userID: userID || '', // from UI
      directSponsorId: '', // from UI
      packageType, // from UI
      isActiveForDailyBonus: codeType === 'REGULAR',
      isApproved: codeType === 'REGULAR'
    };
  },
  getCode: async code => {
    let { records } = await cypherQuerySession.executeQuery(getCode(code));
    let list = records[0]._fields;

    let [data] = transformIntegers(list);

    return data;
  },
  getCodeByUserId: async userId => {
    let { records } = await cypherQuerySession.executeQuery(
      getCodeByUserId(userId)
    );
    let list = records[0]._fields;

    let [data] = transformIntegers(list);

    return data;
  }
};
