import {HardhatRuntimeEnvironment} from 'hardhat/types';
import {DeployFunction} from 'hardhat-deploy/types';

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const {deployments, ethers, getNamedAccounts} = hre;
  const {deploy, get, execute} = deployments;
  const { parseUnits, } = ethers.utils;

  const {deployer, admin, guardian} = await getNamedAccounts();

  const apeUSDAddress = (await get('ApeUSD')).address;

  const network = hre.network as any;
  if (network.config.forking || network.name == 'mainnet') {
    const { feedRegistry, stdReference } = await getNamedAccounts();
    await deploy('PriceOracleProxyUSD', {
      from: deployer,
      args: [deployer, feedRegistry, stdReference, apeUSDAddress],
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

    await execute('PriceOracleProxyUSD', { from: deployer }, 'setDirectPrice', apeUSDAddress, parseUnits('1', 18));
  }
};
func.tags = ['PriceOracleProxyUSD'];
export default func;
