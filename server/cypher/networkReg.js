import util from 'util';
export const addNetworkNode = data => {
  let newData = data;

  let { parentID, childID } = data;
  newData = {
    ...newData,
    list_ParentsOfParents: JSON.stringify(newData.list_ParentsOfParents)
  };

  const queryText = `
 
     MERGE (network:Network {
       parentID: '${parentID}',
       childID: '${childID}'
      })
      
     ON CREATE 
     SET network += ${util.inspect(newData)}
 
     RETURN  properties(network) as data

 

  `;

  return queryText;
};

export const getNetworkNode = ({ parentID }) => {
  const queryText = `
    
    MATCH (n:Network) 
    
    WHERE
    
    ANY(item IN n.list_ParentsOfParentsIDs WHERE item =~ '${parentID}')
   
    with n
   
    MATCH (u: User) where u.ID = n.childID

    match (c:Code {
      userID: u.ID
    })<-[:has_code]-(bundle:CodeBundle)<-[:has_bundle]-(codeType: CodeType)


    with n, {
    firstName: u.firstName,
    lastName: u.lastName,
    userName: u.userName,
    displayName: u.displayID,
       code: c.name,
      code_type: codeType.name
    } as childDetails
    
    order by n.date_created ASC
   
    return collect({
     ID: n.ID,
     type: n.type,
     isViewed: n.isViewed,
     position: n.position,
     points: n.points,
     date_created: n.date_created,
     childDetails: childDetails,
     list_ParentsOfParents: n.list_ParentsOfParents,
     childID: n.childID,
     parentID: n.parentID

    } )
    
    
    `;

  return queryText;
};

export const getNetworkNodeByID = ({ ID }) => {
  const queryText = `
    
    MATCH (n:Network) 

    where n.ID = '${ID}'

    return properties(n) as data
    
    
    `;

  return queryText;
};

export const updateNetworkNodeByID = ({ ID, data }) => {
  const queryText = `

     MATCH (n:Network { ID: '${ID}' })

         SET n += ${util.inspect(data)}


     RETURN properties(n) as network

 

  `;

  return queryText;
};
