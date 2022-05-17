import {HardhatRuntimeEnvironment} from 'hardhat/types';
import {DeployFunction} from 'hardhat-deploy/types';

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const {deployments, getNamedAccounts} = hre;
  const {deploy, execute} = deployments;

  const {deployer, admin} = await getNamedAccounts();

  const network = hre.network as any;
  if (network.config.forking || network.name == 'mainnet') {
    await execute('Unitroller', { from: deployer }, '_setPendingAdmin', admin);
    await execute('ApeTokenAdmin', { from: deployer }, 'setAdmin', admin);
    await execute('ApeTokenHelper', { from: deployer }, 'transferOwnership', admin);
    await execute('ApeUSD', { from: deployer }, 'setGov', admin);
    await execute('PriceOracleProxyUSD', {from: deployer}, '_setAdmin', admin);
    await execute('StakingRewardsFactory', { from: deployer }, 'transferOwnership', admin);
    await execute('StakingRewardsHelper', { from: deployer }, 'transferOwnership', admin);
  }
};
export default func;
func.tags = ['TransferOwnership'];
