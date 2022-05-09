import {HardhatRuntimeEnvironment} from 'hardhat/types';
import {DeployFunction} from 'hardhat-deploy/types';

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const {deployments, getNamedAccounts} = hre;
  const {deploy, execute, get} = deployments;

  const {deployer} = await getNamedAccounts();

  const cTokenHelper = await deploy('CTokenHelper', {
    from: deployer,
    log: true,
  });

  const apAPEAddress = (await get('apAPE')).address;
  const apApeUSDAddress = (await get('apApeUSD')).address;

  await execute('CTokenAdmin', { from: deployer }, '_setHelper', apAPEAddress, cTokenHelper.address);
  await execute('CTokenAdmin', { from: deployer }, '_setHelper', apApeUSDAddress, cTokenHelper.address);
};
export default func;
func.tags = ['CTokenHelper'];
