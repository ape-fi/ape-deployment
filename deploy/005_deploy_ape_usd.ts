import {HardhatRuntimeEnvironment} from 'hardhat/types';
import {DeployFunction} from 'hardhat-deploy/types';

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployments, ethers, getNamedAccounts } = hre;
  const { deploy, execute } = deployments;
  const { parseUnits } = ethers.utils;

  const { deployer } = await getNamedAccounts();

  await deploy('ApeUSD', {
    from: deployer,
    log: true
  });

  await execute('ApeUSD', { from: deployer }, 'mint', parseUnits('10000000', 18));
};
export default func;
func.tags = ['ApeUSD'];
