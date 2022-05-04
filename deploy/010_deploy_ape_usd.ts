import {HardhatRuntimeEnvironment} from 'hardhat/types';
import {DeployFunction} from 'hardhat-deploy/types';

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployments, ethers, getNamedAccounts } = hre;
  const { deploy, execute } = deployments;
  const { parseUnits } = ethers.utils;

  const { admin, deployer } = await getNamedAccounts();

  await deploy('apeUSD', {
    from: deployer,
    contract: 'FixedForex',
    log: true
  });

  await execute('apeUSD', { from: deployer }, 'mint', parseUnits('1000000', 18));
};
export default func;
func.tags = ['apeUSD'];
