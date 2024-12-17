import { v4 as uuidv4 } from 'uuid';
import ShortUniqueId from 'short-unique-id';
import {
  createNewCode,
  createCodeType,
  createCodeBundle,
  getCodeByUserId
} from '../cypher/code.js';
import { createPackage } from '../cypher/package.js';

import config from '../config.js';
const { cypherQuerySession } = config;
import { addUserQuery, mergeUserQuery } from '../cypher/user.js';

import { codeTypeRepo } from '../repository/codeType.js';

import { incomeSalesRepo } from '../repository/incomeSales.js';
const amuletPackage = [
  {
    name: 'package_10',
    displayName: 'Silver Package',
    points: 1000,
    dailyBonusAmount: 60,
    directReferalBonus: 500
  },
  {
    name: 'package_50',
    displayName: 'Gold Package',
    points: 5000,
    dailyBonusAmount: 300,
    directReferalBonus: 2500
  },
  {
    name: 'package_100',
    displayName: 'Diamond Package',
    points: 10000,
    dailyBonusAmount: 600,
    directReferalBonus: 5000
  }
];

const codeType = [
  {
    name: 'FREE_SLOT',
    displayName: 'Free Slot',
    isActiveForDailyBonus: false,
    hasDirectSponsorReferalBonus: false
  },
  {
    name: 'REGULAR',
    displayName: 'Regular',
    isActiveForDailyBonus: true,
    hasDirectSponsorReferalBonus: true
  }
];

const userDisplayIdGenerator = () => {
  const { randomUUID } = new ShortUniqueId({ length: 5 });
  let currentYear = new Date().getFullYear();

  let displayId = `AM_OPC-${currentYear}-${randomUUID()}`;
  // check if exists in db

  return displayId;
};

const createAdminUser = async () => {
  const { randomUUID } = new ShortUniqueId({ length: 5 });

  let rootUser = {
    formId: 'Admin001',
    email: `admin@gmail.com`,
    password: 'root2024admin',
    userName: 'admin',
    lastName: 'Admin',
    firstName: 'Admin',
    middleName: '',
    address_barangay: '',
    address_city: '',
    address_province: '',
    address_region: '',
    address: '',
    birthday: '',
    age: '',
    civilStatus: 'Single',
    mobileNumber: '',
    telephoneNumber: '',
    beneficiaryRelationship: '',
    date_sign: '',
    sponsorName: '',
    sponsorIdNumber: '',
    placementName: '',
    placementIdNumber: '',
    signatureOfSponsor: '',
    signatureOfApplicant: '',
    check: '',
    amount: '',
    cash: '',
    paymentMethod: 'cash',
    signature: '',
    chequeNumber: '',
    amountInWords: '',
    amountInNumber: '',
    parentID: '',
    amulet_package: ''
  };

  let otherProps = {
    ID: uuidv4(),
    date_created: Date.now(),
    displayID: userDisplayIdGenerator(),
    role: 'ADMIN',
    isRootNode: false,
    ID_ALIAS: '',
    INDEX_PLACEMENT: '',
    DEPTH_LEVEL: ''
  };

  let formattedData = {
    ...rootUser,
    ...otherProps,
    sponsorIdNumber: ''
  };

  var { records } = await cypherQuerySession.executeQuery(
    mergeUserQuery({
      ...formattedData
    })
  );
};
const createRootNodeForAll = async () => {
  let rootUser = {
    formId: 'Admin001',
    email: 'admin@amuletinternationalopc.com',
    password: 'root2024admin',
    userName: 'adminRootAccount',
    lastName: 'Digamon',
    firstName: 'Lowelyn',
    middleName: 'D',
    address_barangay: 'Bobontugan',
    address_city: 'Jasaan',
    address_province: 'Misamis Oriental',
    address_region: 'Region X(Northern Mindanao)',
    address: 'Bobontugan, Jasaan, Misamis Oriental 9003',
    birthday: '',
    age: '',
    civilStatus: 'Single',
    mobileNumber: '+63 927 425 0861',
    telephoneNumber: '',
    beneficiaryRelationship: '',
    date_sign: new Date().toISOString().slice(0, 10),
    sponsorName: '',
    sponsorIdNumber: '',
    placementName: '',
    placementIdNumber: '',
    signatureOfSponsor: '',
    signatureOfApplicant: '',
    check: '',
    amount: '',
    cash: '',
    paymentMethod: 'cash',
    signature: '',
    chequeNumber: '',
    amountInWords: '',
    amountInNumber: '',
    parentID: false,
    amulet_package: 'package_100'
  };

  let otherProps = {
    ID: uuidv4(),
    name: `${rootUser.firstName} ${rootUser.lastName}`,
    date_created: Date.now(),
    displayID: userDisplayIdGenerator(),
    role: '',
    isRootNode: true,
    ID_ALIAS: 'LVL_1_INDEX_1',
    INDEX_PLACEMENT: 1,
    DEPTH_LEVEL: 1
  };

  let formattedData = {
    ...rootUser,
    ...otherProps
  };

  var { records } = await cypherQuerySession.executeQuery(
    mergeUserQuery({
      ...formattedData
    })
  );
  const [user] = records[0]._fields;

  // assign root to code default 10k points package

  // generate code for very ROOT User
  let bundleId = uuidv4();
  await cypherQuerySession.executeQuery(
    createCodeBundle({
      bundleId: bundleId,
      name: 'REGULAR',
      isApproved: true,
      displayName: `REGULAR_BUNDLE`
    })
  );
  let newCode = codeTypeRepo.generateCode({
    bundleId,
    codeType: 'REGULAR',
    packageType: 'package_100',
    userID: user.ID
  });

  let updatedData = {
    ...newCode,
    status: 'USED'
  };

  var { records } = await cypherQuerySession.executeQuery(
    getCodeByUserId(user.ID)
  );
  let count = records && records.length;

  if (count === 0) {
    await cypherQuerySession.executeQuery(
      createNewCode({
        name: 'REGULAR',
        bundleId,
        codeData: updatedData
      })
    );
  }
};

const createDummyUser = async (totalUser, amulet_package, codeType) => {
  let list = Array.from(Array(totalUser), (_, x) => x);
  await Promise.all(
    list.map(async (value, index) => {
      const { randomUUID } = new ShortUniqueId({ length: 5 });

      let acc = index;
      let fName;
      if (codeType === 'REGULAR') {
        acc = acc * 3;
      }

      fName = `U${acc + 1}`;

      let lName = amuletPackage.find(
        n => n.name === amulet_package
      ).displayName;

      let rootUser = {
        formId: 'Admin001',
        email: `${fName}${lName}@gmail.com`,
        password: 'root2024admin',
        userName: lName,
        lastName: '',
        firstName: lName,
        middleName: '',
        address_barangay: 'Bobontugan',
        address_city: 'Jasaan',
        address_province: 'Misamis Oriental',
        address_region: 'Region X(Northern Mindanao)',
        address: 'Bobontugan, Jasaan, Misamis Oriental 9003',
        birthday: '',
        age: '',
        civilStatus: 'Single',
        mobileNumber: '+63 927 425 0861',
        telephoneNumber: '',
        beneficiaryRelationship: '',
        date_sign: new Date().toISOString().slice(0, 10),
        sponsorName: '',
        sponsorIdNumber: '',
        placementName: '',
        placementIdNumber: '',
        signatureOfSponsor: '',
        signatureOfApplicant: '',
        check: '',
        amount: '',
        cash: '',
        paymentMethod: 'cash',
        signature: '',
        chequeNumber: '',
        amountInWords: '',
        amountInNumber: '',
        parentID: false,
        amulet_package: amulet_package
      };

      let otherProps = {
        ID: uuidv4(),
        name: `${fName}${lName}`,
        date_created: Date.now(),
        displayID: userDisplayIdGenerator(),
        role: '',
        isRootNode: false,
        ID_ALIAS: '',
        INDEX_PLACEMENT: '',
        DEPTH_LEVEL: ''
      };

      let formattedData = {
        ...rootUser,
        ...otherProps,
        sponsorIdNumber: '06a9b38a-33bd-4c6b-a505-1f222c5bd08c'
      };

      var { records } = await cypherQuerySession.executeQuery(
        mergeUserQuery({
          ...formattedData
        })
      );
      const [user] = records[0]._fields;

      // assign root to code default 10k points package

      // generate code for very ROOT User
      let bundleId = uuidv4();
      await cypherQuerySession.executeQuery(
        createCodeBundle({
          bundleId: bundleId,
          name: codeType,
          isApproved: true,
          displayName: `REGULAR_BUNDLE`
        })
      );
      let newCode = codeTypeRepo.generateCode({
        bundleId,
        codeType: codeType,
        packageType: amulet_package,
        userID: user.ID
      });

      let updatedData = {
        ...newCode,
        status: 'USED'
      };

      var { records } = await cypherQuerySession.executeQuery(
        getCodeByUserId(user.ID)
      );
      let count = records && records.length;

      await cypherQuerySession.executeQuery(
        createNewCode({
          name: codeType,
          bundleId,
          codeData: updatedData
        })
      );
    })
  );
};

const reverseTransaction = async userId => {
  let { records } = await cypherQuerySession.executeQuery(`
        MATCH (n:Network {
          childID: '${userId}'
         }) 
        
        return properties(n)
  
  `);

  if (records.length > 0) {
    const result = records[0]._fields[0];
    let list_ParentsOfParentsV = JSON.parse(result.list_ParentsOfParents);

    for (let parent of list_ParentsOfParentsV) {
      let userIDToProcess = parent.ID;

      let query = `
     MATCH (child:User {ID: '${userId}'})
     OPTIONAL MATCH(child) <-[has_invite_e:has_invite]-(parent:User
      
      {
        ID: '${userIDToProcess}'
      }
      
      )

     with child,has_invite_e

    OPTIONAL MATCH(childFloater:ChildFloater{childID: '${userId}'}) 
    with child,has_invite_e,childFloater
     OPTIONAL  MATCH (incomeSales:IncomeSales {
        userID: '${userId}'
    }) WHERE incomeSales <> 'DAILY_BONUS'
    with child,has_invite_e,childFloater,incomeSales

    OPTIONAL MATCH (a:IncomeSales{
      userID:  '${userId}',
      type:'DIRECT_SPONSORSHIP_SALES_MATCH'
    }
     ) 

    with child,has_invite_e,childFloater,incomeSales,a
    OPTIONAL MATCH (b:MatchSalesV{
      userID_processed:
     '${userId}'
    })
    with child,has_invite_e,childFloater,incomeSales,a,b

    delete a,b, incomeSales
    detach delete childFloater

   



       return *
    `;
      await cypherQuerySession.executeQuery(query);
      console.log(query);
    }

    await cypherQuerySession.executeQuery(`
       MATCH (n:Network {
          childID: '${userId}'
      }) 

      delete n
        
    
  `);
  }
};
export const initDB = async () => {
  //await reverseTransaction('cb6870bf-20d5-4f03-b130-92bd00af6e35');

  await Promise.all(
    amuletPackage.map(async p => {
      let codeType = p.name;

      await cypherQuerySession.executeQuery(
        createPackage({
          name: codeType,
          data: {
            ID: uuidv4(),
            ...p
          }
        })
      );
    })
  );

  await Promise.all(
    codeType.map(async ct => {
      let codeType = ct.name;

      await cypherQuerySession.executeQuery(
        createCodeType({
          codeType: codeType,
          data: {
            ID: uuidv4(),
            name: codeType,
            ...ct
          }
        })
      );
    })
  );

  console.log('set root as non-admin ');

  await cypherQuerySession.executeQuery(
    `
        MATCH (n:User)
        where n.email = 'admin@amuletinternationalopc.com'

        set n.role = ''
  `
  );
  console.log('created admin user');

  await createAdminUser();
  await createRootNodeForAll();

  let labelsToDelete = [
    'User',
    'IncomeSales',
    'Network',
    'Floater',
    'ChildFloater',
    'MatchSalesV'
    // 'Code'
  ];
  let deleteDB = true;
  if (deleteDB) {
    for (let label of labelsToDelete) {
      await cypherQuerySession.executeQuery(
        `
          MATCH (n:${label})
  ${
    label === 'User'
      ? `where n.email <> 'admin@amuletinternationalopc.com'`
      : ''
  }

          detach delete n
    `
      );
    }

    await cypherQuerySession.executeQuery(
      `
            MATCH p=(n:User)-[r:has_invite]->() delete r

             `
    );

    await cypherQuerySession.executeQuery(
      `
            MATCH (n:User) set n.parentID = false

             `
    );
    await createDummyUser(1, 'package_10', 'FREE_SLOT');
    await createDummyUser(30, 'package_50', 'REGULAR');
  }
};
