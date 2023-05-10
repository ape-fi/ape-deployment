import {HardhatRuntimeEnvironment} from 'hardhat/types';
import {DeployFunction} from 'hardhat-deploy/types';

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const {deployments, getNamedAccounts} = hre;
  const {deploy, execute} = deployments;

  const {deployer, poster, admin} = await getNamedAccounts();

  const network = hre.network as any;
  if (network.config.forking || network.name == 'mainnet') {
    await deploy('PriceOracleV1', {
      from: deployer,
      args: [poster],
      log: true,
    });

    await execute('PriceOracleV1', {from: deployer, log: true}, '_setPendingAnchorAdmin', admin);
  }
};
export default func;
func.tags = ['PriceOracleV1'];
