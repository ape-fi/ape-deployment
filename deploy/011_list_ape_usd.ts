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
  // FIXME: CCollateralCapErc20Delegate
  const cTokenImplementationAddress = (await get('CErc20Delegate')).address;
  const exchangeRate = '0.01';


  const apeUSDAddress = (await get('ApeUSD')).address;

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

  // set apApeUSD address in apeUSD
  await execute('ApeUSD', { from: deployer}, 'setIB', apApeUSD.address);

  // support market
  // FIXME: market version 1
  await execute('Comptroller', { from: deployer }, '_supportMarket', apApeUSD.address, 0);

  // supply apeUSD into Ape Finance
  await execute('ApeUSD', { from: deployer }, 'deposit');

  // pause supply
  await execute('Comptroller', { from: deployer }, '_setMintPaused', apApeUSD.address, true);

  // set borrow fee
  await execute('CTokenAdmin', { from: deployer }, '_setBorrowFee', apApeUSD.address, parseUnits('0.005', 18)); // 0.5%
};
export default func;
func.tags = ['ListAPE'];
