import {HardhatRuntimeEnvironment} from 'hardhat/types';
import {DeployFunction} from 'hardhat-deploy/types';

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployments, ethers, getNamedAccounts } = hre;
  const { deploy, execute, get } = deployments;
  const { parseUnits } = ethers.utils;

  const {deployer} = await getNamedAccounts();

  const unitrollerAddress = (await get('Unitroller')).address;
  const irmAddress = (await get('StableIRM')).address;
  const cTokenAdminAddress = (await get('CTokenAdmin')).address;
  const cTokenImplementationAddress = (await get('CCollateralCapErc20Delegate')).address;
  const exchangeRate = '0.01';


  const apeUSDAddress = (await get('apeUSD')).address;

  const initialExchangeRate = parseUnits(exchangeRate, 18 + 18 - 8);

  const apApeUSD = await deploy('apApeUSD', {
    from: deployer,
    contract: 'CErc20Delegator',
    args: [
      apeUSDAddress,
      unitrollerAddress,
      irmAddress,
      initialExchangeRate,
      'Ape apeUSD',
      'apApeUSD',
      8,
      cTokenAdminAddress,
      cTokenImplementationAddress,
      '0x'
    ],
    log: true
  });

  // set price oracle
  if (hre.network.name == 'mainnet') {
    // TODO: modify PriceOracle contract
    // await execute(
    //   'PriceOracleProxyUSD',
    //   { from: deployer },
    //   '_setAggregators',
    //   [apeCoinAddress],
    //   [apeCoinAddress],
    //   ['0x0000000000000000000000000000000000000348'], // USD
    // );
  } else {
    await execute(
      'PriceOracleProxyUSD',
      { from: deployer },
      'setDirectPrice',
      apeUSDAddress,
      parseUnits('1', 18)
    );
  }

  // set apApeUSD address in apeUSD
  await execute('apeUSD', { from: deployer}, 'setIB', apApeUSD.address);

  // support market
  await execute('Comptroller', { from: deployer }, '_supportMarket', apApeUSD.address, 1);

  // supply apeUSD into Ape Finance
  await execute('apeUSD', { from: deployer }, 'deposit');

  // pause supply
  await execute('Comptroller', { from: deployer }, '_setMintPaused', apApeUSD.address, true);
};
export default func;
func.tags = ['ListAPE'];
