import {
  getAllChildren,
  getBrgyList,
  getAllChildrenPerBarangay,
  getChildInfoDetails,
  updateChildInfoDetails
} from '../cypher/child.js';

import {
  // findUserByIdQuery,
  // addUserQuery,
  // createRelationShipQuery,
  // getTreeStructureQuery,
  // getChildren,
  findUserByEmailQuery,
  findUserByUserNameQuery,
  findUserQuery
} from '../cypher/user.js';

import ShortUniqueId from 'short-unique-id';
import excelToJson from 'convert-excel-to-json';
import config from '../config.js';

import { getCustomerList, createOrMergeCustomer } from '../cypher/customer.js';

import { logging } from 'neo4j-driver';
import { packageRepo } from '../repository/package.js';
import { transformIntegers } from '../helpers/transfromIntegers.js';

import { v4 as uuidv4 } from 'uuid';
import { child } from 'firebase/database';

const {
  cypherQuerySession,
  mySqlDriver,
  cypherQuerySessionDriver,
  defaultDBName
} = config;

export const createCustomerController = async (req, res, next) => {
  try {
    let data = req.body;

    let adminEmail = req.user.email;

    var [result] = await mySqlDriver.execute(findUserByEmailQuery(adminEmail));

    data.adminFullName = `${result.Fname} ${result.Lname}`;
    await mySqlDriver.execute(createOrMergeCustomer(data));

    res.json({ success: true });
  } catch (error) {
    console.log(error);
    res.status(400).send(error.message);
  }
};

export const listCustomer = async (req, res, next) => {
  try {
    let ID = req.params.ID;

    var [result] = await mySqlDriver.execute(getCustomerList(ID));

    res.json({ success: true, data: result });
  } catch (error) {
    console.log(error);
    res.status(400).send(error.message);
  }
};

export const getChildInfo = async (req, res, next) => {
  try {
    let ID = req.params.ID;

    // console.log({ ID });

    let [data] = await mySqlDriver.execute(getChildInfoDetails(ID));

    res.json({ success: true, data: data[0] });
  } catch (error) {
    console.log(error);
    res.status(400).send(error.message);
  }
};

export const updateChildInfo = async (req, res, next) => {
  try {
    let ID = req.params.ID;

    let childUpdatedData = req.body;

    // console.log({ ID, childUpdatedData });

    let data = await mySqlDriver.execute(
      updateChildInfoDetails(ID, childUpdatedData),
      [childUpdatedData, ID]
    );

    res.json({ success: true });
  } catch (error) {
    console.log(error);
    res.status(400).send(error.message);
  }
};

export const deleteChildRecord = async (req, res, next) => {
  try {
    let ID = req.body.activeChildID;

    console.log({ ID });

    // console.log({ ID, childUpdatedData });

    let data = await mySqlDriver.execute(deleteChildRecordInfo(ID));

    res.json({ success: true });
  } catch (error) {
    console.log(error);
    res.status(400).send(error.message);
  }
};
