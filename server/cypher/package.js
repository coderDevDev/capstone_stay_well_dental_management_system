import util from 'util';

export const createPackage = ({ name, data }) => {
  let { ID, ...otherProps } = data;
  let updateData = {
    ...otherProps
  };
  const queryText = `
  
 
  MERGE (p: Package {
   name: '${name}'
  })
  
  
  on create  SET p += ${util.inspect(data)}

  on match  SET p += ${util.inspect(updateData)}



  return *

  `;

  return queryText;
};

export const getPackage = () => {
  const queryText = `
  
 
  MATCH (p: Package)
  with p
  order by p.points ASC
  return  collect(properties(p)) as data

  `;

  return queryText;
};
