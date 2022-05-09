import {HardhatRuntimeEnvironment} from 'hardhat/types';
import {DeployFunction} from 'hardhat-deploy/types';

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployments, ethers, getNamedAccounts } = hre;
  const { execute, get, read } = deployments;
  const { parseUnits, formatEther } = ethers.utils;

  const network = hre.network as any;
  if (network.config.forking || network.name == 'mainnet') {
    return;
  }

  const { admin, deployer, user1, user2 } = await getNamedAccounts();

  const apAPEAddress = (await get('apAPE')).address;
  const apApeUSDAddress = (await get('apApeUSD')).address;
  const cTokenHelper = (await get('CTokenHelper')).address;

  // test env only
  const apeAmount1 = parseUnits('4000', 18);
  const borrowAmount = parseUnits('38400', 18);

  await execute('MockToken', { from: deployer }, 'transfer', user1, apeAmount1);
  await execute('MockToken', { from: user1 }, 'approve', cTokenHelper, apeAmount1);
  await execute('CTokenHelper', { from: user1 }, 'mintBorrow', apAPEAddress, apeAmount1, apApeUSDAddress, borrowAmount);

  console.log('user:', user1, 'has borrow', formatEther(borrowAmount), 'apeUSD');


  const apeAmount2 = parseUnits('100', 18);
  await execute('MockToken', { from: deployer }, 'transfer', user2, apeAmount2);
  await execute('MockToken', { from: user2 }, 'approve', apAPEAddress, apeAmount2);
  await execute('apAPE', { from: user2 }, 'mint', user2, apeAmount2);

  console.log('user:', user2, 'has deposit', formatEther(apeAmount2), 'APE');

  // test withdraw & burn
  await execute('ApeUSD', { from: admin }, 'withdraw', parseUnits('100000', 18));
}
export default func;
func.tags = ['SetupTestCase'];
