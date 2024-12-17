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

export const createemployeeController = async (req, res, next) => {
  try {
    let data = req.body;

    let adminEmail = req.user.email;



    var [result] = await mySqlDriver.execute(findUserByEmailQuery(adminEmail));

    data.adminFullName = `${result[0].Admin_Fname} ${result[0].Admin_Lname}`;
    await mySqlDriver.execute(createOrMergeEmployee(data));

    res.json({ success: true });
  } catch (error) {
    console.log(error);
    res.status(400).send(error.message);
  }
};

export const editEmployeeController = async (req, res, next) => {
  try {
    let data = req.body;

    // EmployeeID to update
    const employeeID = data.EmployeeID;

    // Generate the SET clause dynamically
    const fields = Object.keys(data)
      .map(key => `${key} = ?`)
      .join(', ');
    const values = Object.values(data);

    // Add the employeeID to the end of the values array
    values.push(employeeID);

    // let adminEmail = req.user.email;

    // var [result] = await mySqlDriver.execute(findUserByEmailQuery(adminEmail));

    // data.adminFullName = `${result.Fname} ${result.Lname}`;

    const query = `UPDATE employees SET ${fields} WHERE EmployeeID = ?`;

    await mySqlDriver.execute(query, values);

    res.json({ success: true });
  } catch (error) {
    console.log(error);
    res.status(400).send(error.message);
  }
};

export const listEmployeeController = async (req, res, next) => {
  try {
    let ID = req.params.ID;

    var [result] = await mySqlDriver.execute(getEmployeeList());

    res.json({ success: true, data: result });
  } catch (error) {
    console.log(error);
    res.status(400).send(error.message);
  }
};
