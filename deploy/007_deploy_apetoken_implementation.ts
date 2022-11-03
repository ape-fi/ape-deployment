import {HardhatRuntimeEnvironment} from 'hardhat/types';
import {DeployFunction} from 'hardhat-deploy/types';

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const {deployments, getNamedAccounts} = hre;
  const {deploy} = deployments;

  const {deployer} = await getNamedAccounts();

  await deploy('ApeCollateralCapErc20Delegate', {
    from: deployer,
    log: true
  });

  await deploy('ApeErc20NoInterestDelegate', {
    from: deployer,
    log: true
  });

  await deploy('ApeErc20Delegate', {
    from: deployer,
    log: true
  });
};
export default func;
func.tags = ['ApeTokenImplementation'];
