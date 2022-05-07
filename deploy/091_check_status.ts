import {HardhatRuntimeEnvironment} from 'hardhat/types';
import {DeployFunction} from 'hardhat-deploy/types';

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const {deployments, ethers, getNamedAccounts} = hre;
  const {get, read} = deployments;
  const { formatEther } = ethers.utils;

  const priceOracle = await deployments.get('PriceOracleProxyUSD');
  const apAPE = await deployments.get('apAPE');
  const apApeUSD = await deployments.get('apApeUSD');

  // check price oracle
  if (priceOracle.address != (await read('Comptroller', 'oracle'))) {
    throw new Error("wrong price oracle");
  }
  const apePrice = await read('PriceOracleProxyUSD', 'getUnderlyingPrice', apAPE.address);
  const apeUSDPrice = await read('PriceOracleProxyUSD', 'getUnderlyingPrice', apApeUSD.address);
  console.log('APE price:', formatEther(apePrice), 'apeUSD price:', formatEther(apeUSDPrice));

  // check pause status
  const apeBorrowPaused = await read('Comptroller', 'borrowGuardianPaused', apAPE.address);
  const apeUSDMintPaused = await read('Comptroller', 'mintGuardianPaused', apApeUSD.address);
  if (!apeBorrowPaused) {
    throw new Error("ape borrow not paused");
  }
  if (!apeUSDMintPaused) {
    throw new Error("apeUSD mint not paused");
  }

  // check borrow rate

  // check CF
  const [isListed, apeCollateralFactor] = await read('Comptroller', 'markets', apAPE.address);
  console.log('liq threshold:', formatEther(apeCollateralFactor));
}
export default func;
