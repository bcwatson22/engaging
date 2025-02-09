type Dimensions = {
  width: number;
  height?: number;
};

const mugshotSize = 384;
const mugshotDimensions: Dimensions = {
  width: mugshotSize,
  height: mugshotSize,
};

const techIconSize = 136;
const techIconDimensions: Dimensions = {
  width: techIconSize,
  height: techIconSize,
};

const companyLogoSize = 80;
const companyLogoDimensions: Dimensions = {
  width: companyLogoSize,
  height: companyLogoSize,
};

const personalLogoDimensions: Dimensions = {
  width: 448,
  height: 156,
};

export {
  mugshotDimensions,
  techIconDimensions,
  companyLogoDimensions,
  personalLogoDimensions,
};
