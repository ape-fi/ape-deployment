import {HardhatRuntimeEnvironment} from 'hardhat/types';
import {DeployFunction} from 'hardhat-deploy/types';

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployments, ethers, getNamedAccounts } = hre;
  const { deploy, execute } = deployments;
  const { parseUnits } = ethers.utils;

  const { admin, deployer } = await getNamedAccounts();

  await deploy('ApeUSD', {
    from: deployer,
    contract: 'FixedForex',
    log: true
  });

  await execute('ApeUSD', { from: deployer }, 'mint', parseUnits('1000000', 18));
  await execute('ApeUSD', { from: deployer }, 'setGov', admin);
};
export default func;
func.tags = ['ApeUSD'];
