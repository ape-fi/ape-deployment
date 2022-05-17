import {HardhatRuntimeEnvironment} from 'hardhat/types';
import {DeployFunction} from 'hardhat-deploy/types';

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployments, ethers, getNamedAccounts } = hre;
  const { deploy, execute, get } = deployments;
  const { parseUnits } = ethers.utils;

  const {deployer} = await getNamedAccounts();

  const unitrollerAddress = (await get('Unitroller')).address;
  const irmAddress = (await get('StableIRM')).address;
  const apeTokenAdminAddress = (await get('ApeTokenAdmin')).address;
  const apeTokenImplementationAddress = (await get('ApeErc20Delegate')).address;
  const exchangeRate = '0.01';


  const apeUSDAddress = (await get('ApeUSD')).address;

  const initialExchangeRate = parseUnits(exchangeRate, 18 + 18 - 8);

  const apeApeUSD = await deploy('apeApeUSD', {
    from: deployer,
    contract: 'ApeErc20Delegator',
    args: [
      apeUSDAddress,
      unitrollerAddress,
      irmAddress,
      initialExchangeRate,
      'Ape ApeUSD',
      'apeApeUSD',
      8,
      apeTokenAdminAddress,
      apeTokenImplementationAddress,
      '0x'
    ],
    log: true
  });

  // set apeApeUSD address in apeUSD
  await execute('ApeUSD', { from: deployer}, 'setApefi', apeApeUSD.address);

  // support market
  await execute('Comptroller', { from: deployer }, '_supportMarket', apeApeUSD.address);

  // supply apeUSD into Ape Finance
  await execute('ApeUSD', { from: deployer }, 'deposit');

  // pause supply
  await execute('Comptroller', { from: deployer }, '_setMintPaused', apeApeUSD.address, true);

  // set borrow fee
  await execute('ApeTokenAdmin', { from: deployer }, '_setBorrowFee', apeApeUSD.address, parseUnits('0.005', 18)); // 0.5%

  // set borrow cap
  const borrowCap = parseUnits('10000000', 18); // $10M
  await execute('Comptroller', { from: deployer }, '_setMarketBorrowCaps', [apeApeUSD.address], [borrowCap]);

  const network = hre.network as any;
  if (network.config.forking || network.name == 'mainnet') {
    await execute('Comptroller', { from: deployer }, '_setBorrowPaused', apeApeUSD.address, true);
  }
};
export default func;
func.tags = ['ListAPE'];
