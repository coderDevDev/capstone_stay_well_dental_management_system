import util from 'util';

export const updatePassword = (email, password) => {
  const queryText = `
 
UPDATE employees 
SET password = '${password}'
where email = '${email}'
 
  `;
  console.log(queryText);
  return queryText;
};

export const findUserQuery = ID => {
  const queryText = `
  SELECT * FROM employees WHERE EmployeeID  = '${ID}'`;

  return queryText;
};

export const findCustomerDetails = ID => {
  const queryText = `
  SELECT * FROM customer_record WHERE CustomerID  = '${ID}'`;

  return queryText;
};

export const findUserByEmailQuery = email => {
  // const queryText = `
  // MATCH (n:User {
  //  email : '${email}'

  // })
  // RETURN COLLECT(properties(n)) as data

  // `;

  const queryText = `
  SELECT * FROM employees WHERE 
  email = '${email}'
  or username =  '${email}'
  

  `;

  return queryText;
};

export const findUserByUserNameQuery = userName => {
  const queryText = `
  MATCH (n:User {
   userName : '${userName}'
  
  }) RETURN COLLECT(properties(n)) as data
  `;

  return queryText;
};

export const getTreeStructureQuery = ({ userId, withOptional }) => {
  const queryText = `


  ${
    userId
      ? `MATCH path =  ( p:User { ID:'${userId}' })`
      : `MATCH path =  ( p:User { isRootNode:true })`
  }

 

    ${
      withOptional
        ? ' OPTIONAL MATCH(p) -[:has_invite*]->(User) '
        : '-[:has_invite*]->(User)'
    }
   
    WITH collect(path) AS paths
    CALL apoc.convert.toTree(paths, true , {
      nodes: {User: [
        'name',
        'firstName',
         'lastName', 
         'ID',
         'email' ,
         'INDEX_PLACEMENT',
         'displayID',
         'position',
         'userName'
        ]}
    })
    YIELD value
    RETURN value;
    
    
  `;

  return queryText;
};

export const getChildren = ({ ID, isSourceRootNode }) => {
  const queryText = `

     MATCH (parent:User { 
      
      ${isSourceRootNode ? 'isRootNode : true ' : `ID:'${ID}'`} 
    
    
    })-[e:has_invite]->(child:User) 
     RETURN  COLLECT(properties(child)) as children

    
  `;

  return queryText;
};

export const getAllChildren = ({ ID }) => {
  const queryText = `

     MATCH (parent:User { 
      
    ID:'${ID}' 
    
    
    })-[e:has_invite*]->(child:User) 
     RETURN  COLLECT(properties(child)) as children

    
  `;

  return queryText;
};

export const matchBonusDataInsertionNode = params => {
  const queryText = `

  CREATE (n:MatchSalesV)
  
  SET n += ${util.inspect(params)}

  `;

  return queryText;
};

export const matchBonusList = (
  userID_processed,
  isCounted,
  isGreaterThan5k
) => {
  const queryText = `

  MATCH (n:MatchSalesV {

   userID_processed: '${userID_processed}',
   isCounted: ${isCounted}

  })
  
  RETURN COLLECT(properties(n)) as data

  `;
  return queryText;
};
export const updateMatchBonusListQuery = (transactionID, params) => {
  const queryText = `

  MATCH (n:MatchSalesV 
     {
     transactionID: '${transactionID}'
    })
  
  SET n += ${util.inspect(params)}

  `;

  return queryText;
};

export const getRootUser = () => {
  const queryText = `

     MATCH (parent:User { 
      
      isRootNode : true 
    
    
    })
    
    
    RETURN  COLLECT(properties(parent)) as children

    
  `;

  return queryText;
};

export const getAllUSer = () => {
  let queryText;

  queryText = `
 MATCH (n:User ) 

 return collect(properties(n))

  `;

  return queryText;
};

export const checkIfUserIsConnectedToRootNode = userID => {
  const queryText = `

     MATCH (parent:User { 
       isRootNode: true
    
    })-[e:has_invite*]->(child:User {
      ID : '${userID}'
    }) 

 RETURN  COLLECT(properties(child)) as children

    
  `;

  return queryText;
};

export const checkIfChildrenAlreadyExists = (
  Address_or_Location,
  Full_Name_of_Child
) => {
  const queryText = `
  SELECT COUNT(*) FROM child_info 
  WHERE Address_or_Location = '${Address_or_Location}'
  AND Full_Name_of_Child = '${Full_Name_of_Child}'
  
  `;
};

export const createOrMergeUser = data => {
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
