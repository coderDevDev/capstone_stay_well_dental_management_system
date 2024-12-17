import exp from 'constants';
import util from 'util';
export const createFloaterNode = (userId, data) => {
  let { floater_position, childID, action_type } = data;

  const queryText = `
  
  
  
  MATCH (u:User { 
      ID: '${userId}'
  })

  MERGE (u)-[:has_floater]-> (floater:Floater { 
      floater_position: '${floater_position}'
  })


  MERGE (floater)-[:has_history]-> (child_floater:ChildFloater
    {
    childID: '${childID}',
    action_type: '${action_type}'
     

    }
    
    )


  ON CREATE  
  
  SET child_floater += ${util.inspect(data)}

  return *

  `;

  return queryText;
};

export const getFloaterData = ({ parentID, floaterPosition }) => {
  const queryText = `
  
  
    
  MATCH (u:User { 
      ID: '${parentID}'
  })

  MATCH (u)-[:has_floater]-> (floater:Floater { 
      floater_position: '${floaterPosition}'
  })


  MATCH (floater)-[:has_history]-> (c:ChildFloater)

  where c.status = false



  return  collect(properties(c)) as list

  `;

  return queryText;
};

export const fetchFloaterToProcessInMatchSales = ({
  parentID,
  floaterPosition
}) => {
  const queryText = `
  
  
    
  MATCH (u:User { 
      ID: '${parentID}'
  })

  MATCH (u)-[:has_floater]-> (floater:Floater { 
      floater_position: '${floaterPosition}'
  })


  MATCH (floater)-[:has_history]-> (c:ChildFloater {
        action_type: 'INSERT'
  })


where c.codeType = 'REGULAR' and 
( c.isAlreadyUsedInMatchSales IS NULL OR  c.isAlreadyUsedInMatchSales = false )


  return  collect(properties(c)) as list

  `;

  return queryText;
};

export const updateFloaterToProcessInMatchSales = ID => {
  const queryText = `
  
 
    MATCH (n:ChildFloater) where n.ID = '${ID}' 
    SET n.isAlreadyUsedInMatchSales = true
    return *
  `;

  return queryText;
};

export const updateFloaterData = ({
  parentID,
  floaterPosition,
  status = true
}) => {
  const queryText = `
  
  
    
  MATCH (u:User { 
      ID: '${parentID}'
  })

  MATCH (u)-[:has_floater]-> (floater:Floater { 
      floater_position: '${floaterPosition}'
  })


  MATCH (floater)-[:has_history]-> (c:ChildFloater)
  

  SET c.status =  ${status}



  return  *

  `;

  return queryText;
};

export const listFloaterData = ({ ID, floaterPosition }) => {
  const queryText = `
  
  
    
 MATCH (u:User {
      ID: '${ID}'
  })

  MATCH (u)-[:has_floater]-> (floater:Floater {
      floater_position: '${floaterPosition}'
  })





  MATCH (floater)-[:has_history]-> (c:ChildFloater)
  MATCH (target: User) where target.ID = c.childID

   with floater, c, {

    firstName: target.firstName,
    lastName: target.lastName,
    displayName: target.displayName

   } as childDetails



  ORDER BY c.date_created ASC


  return  collect({
    ID: c.ID,
  fromUser: childDetails,
  points: c.points,
  status: c.status,
  action_type: c.action_type,
 date_created: c.date_created

  })  as list


  `;

  return queryText;
};

export const fetchFloaterTuples = (
  userID,
  floater_position,
  action_type,
  isCounted
) => {
  const queryText = `

    MATCH (u {
       ID : '${userID}'
    })-[:has_floater]-> (floater:Floater { 
        floater_position: '${floater_position}'
     }) - [:has_history]-> (childFloater:ChildFloater {
        action_type: '${action_type}',
        isCounted:  ${isCounted}
     })

  where childFloater.points < 5000

  return collect(properties(childFloater)) as data

  `;

  return queryText;
};

export const alterFloaterData = (userID, floaterID, data, floaterPosition) => {
  const queryText = `
  
  
    
  MATCH (u:User { 
      ID: '${userID}'
  })

  MATCH (u)-[:has_floater]-> (floater:Floater { 
      floater_position: '${floaterPosition}'
  })


  MATCH (floater)-[:has_history]-> (child_floater:ChildFloater {
      childID: '${floaterID}'

  })
  

  SET child_floater += ${util.inspect(data)}



  return  *

  `;

  return queryText;
};
