import {HardhatRuntimeEnvironment} from 'hardhat/types';
import {DeployFunction} from 'hardhat-deploy/types';

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const {deployments, ethers, getNamedAccounts} = hre;
  const {deploy, get, execute} = deployments;

  const {deployer, guardian} = await getNamedAccounts();

  const network = hre.network as any;
  if (network.config.forking || network.name == 'mainnet') {
    const { feedRegistry } = await getNamedAccounts();
    const priceOracleV1Address = (await get('PriceOracleV1')).address

    await deploy('PriceOracleProxyIB', {
      from: deployer,
      args: [deployer, priceOracleV1Address, feedRegistry],
      log: true,
    });

    await execute('PriceOracleProxyIB', { from: deployer, log: true }, '_setGuardian', guardian);
  } else {

    await deploy('PriceOracleProxyIB', {
      from: deployer,
      contract: 'SimplePriceOracle',
      log: true
    });
  }
};
export default func;
func.tags = ['PriceOracleProxyIB'];
func.dependencies = ['PriceOracleV1'];
