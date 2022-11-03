import {HardhatRuntimeEnvironment} from 'hardhat/types';
import {DeployFunction} from 'hardhat-deploy/types';

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const {deployments, getNamedAccounts} = hre;
  const {deploy, execute, get} = deployments;

  const {admin, deployer} = await getNamedAccounts();

  const threeHours = 60 * 60 * 3;

  await deploy('ApeFiTimelock', {
    from: deployer,
    args: [threeHours, [admin], [admin]],
    log: true
  })
};
export default func;
func.tags = ['Timelock'];
