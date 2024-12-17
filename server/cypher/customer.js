import util from 'util';

export const createOrMergeCustomer = data => {
  let { CustomerName, Facebook, Contact, Address, adminFullName } = data;
  let queryText;

  queryText = `
INSERT INTO customer_record
 (
 CustomerName,
 Facebook, 
 Contact, 
 Address,
 Admin_Fname
 ) 
 VALUES 
 (
 '${CustomerName}',
 '${Facebook}',
 '${Contact}',
 '${Address}',
 '${adminFullName}'
 
 )

  `;

  return queryText;
};

export const getCustomerList = () => {
  let queryText;

  queryText = `
  SELECT * FROM  customer_record 

  where is_deleted != 1
  ORDER BY Date_Modified DESC

  `;

  return queryText;
};

export const getChildInfoDetails = ID => {
  let queryText;

  queryText = `
  SELECT * FROM child_info where ID = '${ID}'

  `;

  return queryText;
};

export const updateChildInfoDetails = (ID, updatedData) => {
  let queryText;
  let queryVar = Object.keys(updatedData)
    .map(key => {
      return `
    ${key} = ?
    `;
    })
    .join(',');

  queryText = `
      UPDATE customer_record SET ?

      where ID = ?
     

  `;

  return queryText;
};

export const getBrgyList = () => {
  let queryText;

  queryText = `
SELECT DISTINCT(Address_or_Location) FROM child_info

  `;

  return queryText;
};

export const getAllChildrenPerBarangay = (barangay, status) => {
  let queryText;

  //   queryText = `
  //  MATCH (n:Child )
  // where n.Address_or_Location = '${barangay}'

  // ${
  //   status
  //     ? `
  // and  ( n.Weight_for_Age_Status =  '${status}'

  // OR n.Height_for_Age_Status = '${status}'

  // )
  // `
  //     : ``
  // }
  //  return collect(properties(n))

  //   `;

  queryText = `
  SELECT * FROM child_info
  where Address_or_Location = '${barangay}'

    ${
      status
        ? `
    AND  Weight_for_Age_Status =  '${status}'

    OR  Height_for_Age_Status = '${status}'

    
    `
        : ``
    }
      
  
  `;

  console.log(queryText);
  return queryText;
};

export const checkIfChildrenAlreadyExists = (
  Address_or_Location,
  Full_Name_of_Child
) => {
  const queryText = `
  SELECT COUNT(*)  as childCount  FROM child_info 
  WHERE Address_or_Location = '${Address_or_Location}'
  AND Full_Name_of_Child = '${Full_Name_of_Child}'
  
  `;

  return queryText;
};

export const createOrMergeChild = data => {
  const queryText = `

INSERT INTO child_info (
Date_of_Birth,
Date_Measured,
Child_Seq,
Address_or_Location,
Name_of_Mother_or_Caregiver,
Full_Name_of_Child,
Belongs_to_IP_Group,
Sex,
Weight,
Height,
Age_in_Months,
Weight_for_Age_Status,
Height_for_Age_Status,
Weight_for_Lt_or_Ht_Status
)
 VALUES (
 '${data['Date_of_Birth']}', 
 '${data['Date_Measured']}', 
 '${data['Child_Seq']}', 
 '${data['Address_or_Location']}', 
 '${data['Name_of_Mother_or_Caregiver']}', 
 '${data['Full_Name_of_Child']}',
 '${data['Belongs_to_IP_Group']}', 
 '${data['Sex']}', 
 '${data['Weight']}',
 '${data['Height']}',
 '${data['Age_in_Months']}',
 '${data['Weight_for_Age_Status']}',
 '${data['Height_for_Age_Status']}',
 '${data['Weight_for_Lt_or_Ht_Status']}'
 )


  `;

  return queryText;
};
