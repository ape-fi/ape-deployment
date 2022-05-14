import {HardhatRuntimeEnvironment} from 'hardhat/types';
import {DeployFunction} from 'hardhat-deploy/types';

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const {deployments, getNamedAccounts} = hre;
  const {deploy, execute, get} = deployments;

  const {admin, deployer} = await getNamedAccounts();

  var { apefi } = await getNamedAccounts();
  const network = hre.network as any;
  if (!network.config.forking && network.name != 'mainnet') {
    const mockToken = await deploy('APEFI', {
      from: deployer,
      contract: 'MockToken',
      args: ['Ape Finance', 'APEFI'],
      log: true
    });
    apefi = mockToken.address;
  }

  const apeUSDAddress = (await get('ApeUSD')).address;

  await deploy('StakingRewards', {
    from: deployer,
    args: [admin, admin, apefi, apeUSDAddress],
    log: true,
  });
};
export default func;
func.tags = ['StakingReward'];
