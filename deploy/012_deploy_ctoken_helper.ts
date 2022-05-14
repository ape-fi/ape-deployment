import {HardhatRuntimeEnvironment} from 'hardhat/types';
import {DeployFunction} from 'hardhat-deploy/types';

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const {deployments, getNamedAccounts} = hre;
  const {deploy, execute, get} = deployments;

  const {deployer} = await getNamedAccounts();

  const comptrollerAddress = (await get('Comptroller')).address;

  const cTokenHelper = await deploy('CTokenHelper', {
    from: deployer,
    args: [comptrollerAddress],
    log: true,
  });

  const apeAPEAddress = (await get('apeAPE')).address;
  const apeApeUSDAddress = (await get('apeApeUSD')).address;

  await execute('CTokenAdmin', { from: deployer }, '_setHelper', apeAPEAddress, cTokenHelper.address);
  await execute('CTokenAdmin', { from: deployer }, '_setHelper', apeApeUSDAddress, cTokenHelper.address);
};
export default func;
func.tags = ['CTokenHelper'];
