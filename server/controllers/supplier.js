import {
  // findUserByIdQuery,
  // addUserQuery,
  // createRelationShipQuery,
  // getTreeStructureQuery,
  // getChildren,
  getSupplierList,
  createSupplier,
  updateSupplier,
  createSupplierPayment,
  getSupplierPaymentHistory
} from '../cypher/supplier.js';

import ShortUniqueId from 'short-unique-id';
import excelToJson from 'convert-excel-to-json';
import config from '../config.js';
let firebaseStorage = config.firebaseStorage;
import {
  getEmployeeList,
  createOrMergeEmployee,
  updateEmployee
} from '../cypher/employee.js';
const {
  cypherQuerySession,
  mySqlDriver,
  cypherQuerySessionDriver,
  defaultDBName
} = config;

import {
  authenticateUserMiddleware,
  auditTrailMiddleware
} from '../middleware/authMiddleware.js';

import { findUserByEmailQuery } from '../cypher/user.js';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

import {
  // findUserByIdQuery,
  // addUserQuery,
  // createRelationShipQuery,
  // getTreeStructureQuery,
  // getChildren,
  // findUserByEmailQuery,
  // findUserByUserNameQuery,
  findUserQuery,
  findCustomerDetails
} from '../cypher/user.js';

export const createSupplierController = async (req, res, next) => {
  try {
    let data = req.body;
    let EmployeeID = req.user.EmployeeID;

    var [result] = await mySqlDriver.execute(findUserQuery(EmployeeID));

    data.adminFullName = `${result[0].Admin_Fname} ${result[0].Admin_Lname}`;

    var [result] = await mySqlDriver.execute(createSupplier(data));

    res.json({ success: true });
  } catch (error) {
    console.log(error);
    res.status(400).send(error.message);
  }
};

export const listSupplierController = async (req, res, next) => {
  try {
    let ID = req.params.ID;

    var [result] = await mySqlDriver.execute(getSupplierList());

    res.json({ success: true, data: result });
  } catch (error) {
    console.log(error);
    res.status(400).send(error.message);
  }
};

export const listSupplierPaymentHistory = async (req, res, next) => {
  try {
    let { SupplierID, OrderID } = req.body;

    var [result] = await mySqlDriver.execute(
      getSupplierPaymentHistory(SupplierID, OrderID)
    );

    res.json({
      success: true,
      data: result.map(({ Proof_Payment, ...data }) => {
        return {
          ...data,
          Proof_Payment: `${Proof_Payment}`
        };
      })
    });
  } catch (error) {
    console.log(error);
    res.status(400).send(error.message);
  }
};

export const uploadFile = async (req, res, next) => {
  try {
    const file = req.file;
    let loggedInUser = req.user;

    let data = req.body;

    let adminEmail = req.user.email;
    var [result] = await mySqlDriver.execute(findUserByEmailQuery(adminEmail));

    data.Admin_Fname = `${result.Admin_Fname} ${result.Admin_Lname}`;

    const storageRef = ref(
      firebaseStorage,
      `suuplier/payments/${file.originalname}`
    );
    const metadata = { contentType: file.mimetype };

    // Upload the file to Firebase Storage
    await uploadBytes(storageRef, file.buffer, metadata);

    // Get the file's download URL
    const downloadURL = await getDownloadURL(storageRef);

    console.log({ downloadURL });
    data.Proof_Payment = downloadURL;
    await mySqlDriver.execute(createSupplierPayment(data));

    await auditTrailMiddleware({
      employeeId: loggedInUser.EmployeeID,
      action: 'Added a supplier payment details.'
    });

    res.json({ success: true });
  } catch (error) {
    console.log(error);
    res.status(400).send(error.message);
  }
};
