import { packageRepo } from '../repository/package.js';
import { codeTypeRepo } from '../repository/codeType.js';

export const featureList = async (req, res, next) => {
  try {
    let packageList = await packageRepo.listPackage();
    let codeTypeList = await codeTypeRepo.listCodeType();

    let list = {
      packageList: packageList,
      codeTypeList: codeTypeList
    };
    res.json({ success: true, data: list });
  } catch (error) {
    res.status(400).send(error.message);
  }
};
