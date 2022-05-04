import {HardhatRuntimeEnvironment} from 'hardhat/types';
import {DeployFunction} from 'hardhat-deploy/types';

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const {deployments, getNamedAccounts} = hre;
  const {deploy, get, execute} = deployments;

  const {deployer, admin, guardian} = await getNamedAccounts();

  if (hre.network.name == 'mainnet') {
    const { feedRegistry } = await getNamedAccounts();
    await deploy('PriceOracleProxyUSD', {
      from: deployer,
      args: [deployer, feedRegistry],
      log: true,
    });

    await execute('PriceOracleProxyUSD', {from: deployer}, '_setGuardian', guardian);
    await execute('PriceOracleProxyUSD', {from: deployer}, '_setAdmin', admin);
  } else {
    await deploy('PriceOracleProxyUSD', {
      from: deployer,
      contract: 'SimplePriceOracle',
      log: true
    });
  }
};
func.tags = ['PriceOracleProxyUSD'];
export default func;
