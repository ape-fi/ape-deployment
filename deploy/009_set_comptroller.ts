import {HardhatRuntimeEnvironment} from 'hardhat/types';
import {DeployFunction} from 'hardhat-deploy/types';
import {parseEther} from 'ethers/lib/utils';

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const {deployments, getNamedAccounts} = hre;
  const {execute, get} = deployments;

  const {deployer, guardian} = await getNamedAccounts();

  const unitrollerAddress = (await get('Unitroller')).address;
  const comptrollerImplAddress = (await get('Comptroller_Implementation')).address;
  await execute('Unitroller', { from: deployer, log: true }, '_setPendingImplementation', comptrollerImplAddress);
  await execute('Comptroller_Implementation', { from: deployer, log: true }, '_become', unitrollerAddress);

  const closeFactor = parseEther('0.5');
  const liquidationIncentive = parseEther('1.1');

  const priceOracleAddress = (await deployments.get('PriceOracleProxyIB')).address;

  await execute('Comptroller', { from: deployer, log: true }, '_setCloseFactor', closeFactor);
  await execute('Comptroller', { from: deployer, log: true }, '_setLiquidationIncentive', liquidationIncentive);
  await execute('Comptroller', { from: deployer, log: true }, '_setPriceOracle', priceOracleAddress);
  await execute('Comptroller', { from: deployer, log: true }, '_setGuardian', guardian);
};
export default func;
func.tags = ['SetupComptroller'];
func.dependencies = ['Comptroller', 'PriceOracleProxyIB'];
