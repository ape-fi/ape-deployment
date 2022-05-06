import {HardhatRuntimeEnvironment} from 'hardhat/types';
import {DeployFunction} from 'hardhat-deploy/types';

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployments, ethers, getNamedAccounts, getUnnamedAccounts } = hre;
  const { execute, get, read } = deployments;
  const { parseUnits, formatEther } = ethers.utils;

  const network = hre.network as any;
  if (network.config.forking || network.name == 'mainnet') {
    return;
  }

  const { deployer } = await getNamedAccounts();
  const user1 = (await getUnnamedAccounts())[0];
  const user2 = (await getUnnamedAccounts())[1];

  const apAPEAddress = (await get('apAPE')).address;

  // test env only
  const apeAmount1 = parseUnits('4000', 18);
  await execute('MockToken', { from: deployer }, 'transfer', user1, apeAmount1);
  await execute('MockToken', { from: user1 }, 'approve', apAPEAddress, apeAmount1);
  await execute('apAPE', { from: user1 }, 'mint', apeAmount1);

  const borrowAmount = parseUnits('38400', 18);
  await execute('apApeUSD', { from: user1 }, 'borrow', borrowAmount);

  console.log('user:', user1, 'has borrow', formatEther(borrowAmount), 'apeUSD');


  const apeAmount2 = parseUnits('100', 18);
  await execute('MockToken', { from: deployer }, 'transfer', user2, apeAmount2);
  await execute('MockToken', { from: user2 }, 'approve', apAPEAddress, apeAmount2);
  await execute('apAPE', { from: user2 }, 'mint', apeAmount2);

  console.log('user:', user2, 'has deposit', formatEther(apeAmount2), 'APE');
}
export default func;
func.tags = ['SetupTestCase'];
