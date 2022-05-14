import {HardhatRuntimeEnvironment} from 'hardhat/types';
import {DeployFunction} from 'hardhat-deploy/types';

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const {deployments, getNamedAccounts} = hre;
  const {deploy, execute, get} = deployments;

  const {admin, deployer} = await getNamedAccounts();

  const srFactory = await deploy('StakingRewardsFactory', {
    from: deployer,
    log: true
  })

  await deploy('StakingRewardsHelper', {
    from: deployer,
    args: [srFactory.address],
    log: true
  })
};
export default func;
func.tags = ['StakingReward'];
