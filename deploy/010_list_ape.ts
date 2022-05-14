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


  var apeCoinAddress;
  const network = hre.network as any;
  if (network.config.forking || network.name == 'mainnet') {
    const { apeCoin } = await getNamedAccounts();
    apeCoinAddress = apeCoin;
  } else {
    const mockToken = await deploy('APE', {
      from: deployer,
      contract: 'MockToken',
      args: ['ApeCoin', 'APE'],
      log: true
    });
    apeCoinAddress = mockToken.address;
  }

  const initialExchangeRate = parseUnits(exchangeRate, 18 + 18 - 8);

  const apeAPE = await deploy('apeAPE', {
    from: deployer,
    contract: 'CErc20Delegator',
    args: [
      apeCoinAddress,
      unitrollerAddress,
      irmAddress,
      initialExchangeRate,
      'Ape ApeCoin',
      'apeAPE',
      8,
      cTokenAdminAddress,
      cTokenImplementationAddress,
      '0x'
    ],
    log: true
  });

  // set price oracle
  if (network.config.forking || network.name == 'mainnet') {
    await execute(
      'PriceOracleProxyUSD',
      { from: deployer },
      '_setAggregators',
      [apeCoinAddress],
      [apeCoinAddress],
      ['0x0000000000000000000000000000000000000348'], // USD
    );
  } else {
    await execute(
      'PriceOracleProxyUSD',
      { from: deployer },
      'setDirectPrice',
      apeCoinAddress,
      parseUnits('16', 18)
    );
  }

  // support market
  await execute('Comptroller', { from: deployer }, '_supportMarket', apeAPE.address);
  await execute('Comptroller', { from: deployer }, '_setCollateralFactor', apeAPE.address, parseUnits('0.7'));
  await execute('Comptroller', { from: deployer }, '_setBorrowPaused', apeAPE.address, true);
};
export default func;
func.tags = ['ListAPE'];
