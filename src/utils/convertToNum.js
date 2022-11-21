const { ethers } = require("ethers");

const convertToNumber = (hex, decimals = 18) => {
  if (!hex) return 0;
  return ethers.utils.formatUnits(hex, decimals);
};

module.exports = convertToNumber;
