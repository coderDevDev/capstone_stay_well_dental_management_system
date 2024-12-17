import {
  getAllChildren,
  getBrgyList,
  getAllChildrenPerBarangay,
  getChildInfoDetails,
  updateChildInfoDetails
} from '../cypher/child.js';

import { findUserQuery } from '../cypher/user.js';

import ShortUniqueId from 'short-unique-id';
import excelToJson from 'convert-excel-to-json';
import config from '../config.js';

import {
  mergeUserQuery,
  checkIfChildrenAlreadyExists,
  createOrMergeChild,
  deleteChildRecordInfo
} from '../cypher/child.js';

import { transformIntegers } from '../helpers/transfromIntegers.js';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

let firebaseStorage = config.firebaseStorage;
const {
  cypherQuerySession,
  mySqlDriver,
  cypherQuerySessionDriver,
  defaultDBName
} = config;
export const getChildrenList = async (req, res, next) => {
  try {
    let loggedInUser = req.user;

    let [userList] = await mySqlDriver.execute(getAllChildren());

    let result = transformIntegers(
      userList.map(member => {
        let { password, ...otherProps } = member;
        return otherProps;
      })
    ).sort(function (a, b) {
      return new Date(b.lastName) - new Date(a.lastName);
    });

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    // res.json({
    //   success: true,
    //   data: []
    // });
    res.status(400).send(error.message);
  }
};

export const getBarangayList = async (req, res, next) => {
  try {
    //let barangays = [];

    let [barangays] = await mySqlDriver.execute(getBrgyList());

    res.json({
      success: true,
      data: barangays.map(res => res.Address_or_Location)
    });
  } catch (error) {
    res.status(400).send(error.message);
  }
};

export const getDashboardDatePerBarangay = async (req, res, next) => {
  try {
    let barangay = req.body.barangay;
    let report_type = req.body.report_type;

    let children = [];
    if (barangay) {
      children = await mySqlDriver.execute(
        getAllChildrenPerBarangay(barangay, report_type)
      );
    } else {
      children = await mySqlDriver.execute(getAllChildren(barangay));
    }

    let totalNumOfChildren = children.length;

    //WFA
    let OverweightChildren = children.filter(({ Weight_for_Age_Status }) => {
      return Weight_for_Age_Status === 'OW';
    });

    let UnderWeightChildren = children.filter(({ Weight_for_Age_Status }) => {
      return Weight_for_Age_Status === 'UW';
    });

    let SeverelyUnderweight = children.filter(({ Weight_for_Age_Status }) => {
      return Weight_for_Age_Status === 'SUW';
    });

    let NormalWeight = children.filter(({ Weight_for_Age_Status }) => {
      return Weight_for_Age_Status === 'N';
    });

    let Obese = children.filter(({ Weight_for_Age_Status }) => {
      return Weight_for_Age_Status === 'Ob';
    });

    // HFA

    let Stunted = children.filter(({ Height_for_Age_Status }) => {
      return Height_for_Age_Status === 'St';
    });
    let SeverelyStunted = children.filter(({ Height_for_Age_Status }) => {
      return Height_for_Age_Status === 'SSt';
    });

    let childrenAffectedByUnderNutrition = children.reduce((acc, current) => {
      if (['OW', 'UW', 'SUW', 'Ob'].includes(current.Weight_for_Age_Status)) {
        acc = [...acc, current];
      } else if (['St', 'SSt'].includes(current.Height_for_Age_Status)) {
        acc = [...acc, current];
      }
      return acc;
    }, []);

    const childrenAffectedByUnderNutritionList = [
      ...new Set(
        childrenAffectedByUnderNutrition.map(item => item.Full_Name_of_Child)
      )
    ]; // [ 'A', 'B']

    res.json({
      success: true,
      data: {
        totalNumOfChildren: totalNumOfChildren,
        childrenAffectedByUnderNutrition:
          childrenAffectedByUnderNutritionList.length,
        WFA: {
          OverweightChildren,
          UnderWeightChildren,
          SeverelyUnderweight,
          NormalWeight,
          Obese
        },
        HFA: {
          Stunted,
          SeverelyStunted
        }
      }
    });
  } catch (error) {
    res.status(400).send(error.message);
  }
};

export const getReportPerBarangay = async (req, res, next) => {
  try {
    let barangay = req.body.barangay;
    let report_type = req.body.report_type;

    let children = [];
    children = await mySqlDriver.execute(
      getAllChildrenPerBarangay(barangay, report_type)
    );

    let result = transformIntegers(children);

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    res.status(400).send(error.message);
  }
};

export const uploadFile = async (req, res, next) => {
  try {
    const file = req.file;

    let loggedInUser = req.user;
    let id = loggedInUser.EmployeeID;

    const storageRef = ref(
      firebaseStorage,
      `user/${id}/profile_pic/${file.originalname}`
    );
    const metadata = { contentType: file.mimetype };

    // Upload the file to Firebase Storage
    await uploadBytes(storageRef, file.buffer, metadata);

    // Get the file's download URL
    const downloadURL = await getDownloadURL(storageRef);

    const query = `UPDATE employees SET profilePic = ? 
    WHERE EmployeeID = ?`;

    console.log({ downloadURL, id });
    await mySqlDriver.execute(query, [downloadURL, id]);

    res.json({ success: true });
  } catch (error) {
    console.log(error);
    res.status(400).send(error.message);
  }
};

export const createChildren = async (req, res, next) => {
  try {
    let childInfoProps = req.body;
    let mappedKey = {
      'Child Seq': 'Child_Seq',
      'Address or Location': 'Address_or_Location',
      'Name of Mother/Caregiver': 'Name_of_Mother_or_Caregiver',
      'Full Name of Child': 'Full_Name_of_Child',
      'Belongs to IP Group': 'Belongs_to_IP_Group',
      Sex: 'Sex',
      'Date of Birth': 'Date_of_Birth',
      'Date Measured': 'Date_Measured',
      Weight: 'Weight',
      Height: 'Height',
      'Age in Months': 'Age_in_Months',
      'Weight for Age Status': 'Weight_for_Age_Status',
      'Height for Age Status': 'Height_for_Age_Status',
      'Weight for Lt/Ht Status': 'Weight_for_Lt_or_Ht_Status'
    };

    var countResult = await mySqlDriver.execute(
      checkIfChildrenAlreadyExists(
        childInfoProps.Address_or_Location,
        childInfoProps.Full_Name_of_Child
      )
    );

    let total = countResult[0].childCount;

    console.log({ childInfoProps });
    if (total === 0) {
      await mySqlDriver.execute(createOrMergeChild(childInfoProps));
    }

    res.json({ success: true });
  } catch (error) {
    console.log(error);
    res.status(400).send(error.message);
  }
};

export const getOverallStatistics = async (req, res, next) => {
  try {
    let barangay = req.body.barangay;
    let report_type = req.body.report_type;

    let children = [];
    if (barangay) {
      let { records } = await cypherQuerySession.executeQuery(
        getAllChildrenPerBarangay(barangay, report_type)
      );

      children = records[0]._fields[0];
    } else {
      let { records } = await cypherQuerySession.executeQuery(
        getAllChildren(barangay)
      );

      children = records[0]._fields[0];
    }

    let totalNumOfChildren = children.length;

    //WFA
    let OverweightChildren = children.filter(({ Weight_for_Age_Status }) => {
      return Weight_for_Age_Status === 'OW';
    });

    let UnderWeightChildren = children.filter(({ Weight_for_Age_Status }) => {
      return Weight_for_Age_Status === 'UW';
    });

    let SeverelyUnderweight = children.filter(({ Weight_for_Age_Status }) => {
      return Weight_for_Age_Status === 'SUW';
    });

    let NormalWeight = children.filter(({ Weight_for_Age_Status }) => {
      return Weight_for_Age_Status === 'N';
    });

    let Obese = children.filter(({ Weight_for_Age_Status }) => {
      return Weight_for_Age_Status === 'Ob';
    });

    // HFA

    let Stunted = children.filter(({ Height_for_Age_Status }) => {
      return Height_for_Age_Status === 'St';
    });
    let SeverelyStunted = children.filter(({ Height_for_Age_Status }) => {
      return Height_for_Age_Status === 'SSt';
    });

    let childrenAffectedByUnderNutrition = children.reduce((acc, current) => {
      if (['OW', 'UW', 'SUW', 'Ob'].includes(current.Weight_for_Age_Status)) {
        acc = [...acc, current];
      } else if (['St', 'SSt'].includes(current.Height_for_Age_Status)) {
        acc = [...acc, current];
      }
      return acc;
    }, []);

    const childrenAffectedByUnderNutritionList = [
      ...new Set(
        childrenAffectedByUnderNutrition.map(item => item.Full_Name_of_Child)
      )
    ]; // [ 'A', 'B']

    console.log({ OverweightChildren });
    res.json({
      success: true,
      data: {
        totalNumOfChildren: totalNumOfChildren,
        childrenAffectedByUnderNutrition:
          childrenAffectedByUnderNutritionList.length,
        WFA: {
          OverweightChildren: OverweightChildren.reduce((r, a) => {
            r[a.Address_or_Location] = r[a.Address_or_Location] || [];
            r[a.Address_or_Location].push(a);
            return r;
          }, {}),

          UnderWeightChildren: UnderWeightChildren.reduce((r, a) => {
            r[a.Address_or_Location] = r[a.Address_or_Location] || [];
            r[a.Address_or_Location].push(a);
            return r;
          }, {}),
          SeverelyUnderweight,
          NormalWeight,
          Obese
        },
        HFA: {
          Stunted,
          SeverelyStunted
        }
      }
    });
  } catch (error) {
    res.status(400).send(error.message);
  }
};

export const getUser = async (req, res, next) => {
  try {
    let ID = req.params.ID;

    console.log({ ID });

    var result = await mySqlDriver.execute(findUserQuery(ID));

    let user = result;

    res.json({ success: true, data: user[0] });
  } catch (error) {
    console.log(error);
    res.status(400).send(error.message);
  }
};

export const getChildInfo = async (req, res, next) => {
  try {
    let ID = req.params.ID;

    // console.log({ ID });

    let data = await mySqlDriver.execute(getChildInfoDetails(ID));

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
