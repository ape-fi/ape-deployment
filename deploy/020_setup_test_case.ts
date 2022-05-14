import {HardhatRuntimeEnvironment} from 'hardhat/types';
import {DeployFunction} from 'hardhat-deploy/types';

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployments, ethers, getNamedAccounts } = hre;
  const { execute, get, deploy } = deployments;
  const { parseUnits, formatEther } = ethers.utils;

  const network = hre.network as any;
  if (network.config.forking || network.name == 'mainnet') {
    return;
  }

  const { admin, deployer, user1, user2 } = await getNamedAccounts();

  const apeUSDAddress = (await get('ApeUSD')).address;
  const apeAPEAddress = (await get('apeAPE')).address;
  const apeApeUSDAddress = (await get('apeApeUSD')).address;
  const cTokenHelper = (await get('CTokenHelper')).address;

  // test env only
  const apeAmount1 = parseUnits('4000', 18);
  const borrowAmount = parseUnits('38400', 18);

  await execute('APE', { from: deployer }, 'transfer', user1, apeAmount1);
  await execute('APE', { from: user1 }, 'approve', cTokenHelper, apeAmount1);
  await execute('CTokenHelper', { from: user1 }, 'mintBorrow', apeAPEAddress, apeAmount1, apeApeUSDAddress, borrowAmount);

  console.log('user:', user1, 'has borrow', formatEther(borrowAmount), 'apeUSD');


  const apeAmount2 = parseUnits('100', 18);
  await execute('APE', { from: deployer }, 'transfer', user2, apeAmount2);
  await execute('APE', { from: user2 }, 'approve', apeAPEAddress, apeAmount2);
  await execute('apeAPE', { from: user2 }, 'mint', user2, apeAmount2);

  console.log('user:', user2, 'has deposit', formatEther(apeAmount2), 'APE');

  const stakingRewardHelper = (await get('StakingRewardsHelper')).address;
  const stakingReward = await deploy('StakingRewards', {
    from: deployer,
    contract: 'MockStakingRewards',
    args: [apeUSDAddress, stakingRewardHelper],
    log: true
  });

  const apefi = await deploy('APEFI', {
    from: deployer,
    contract: 'MockToken',
    args: ['Ape Finance', 'APEFI'],
    log: true
  });
  const rewardAmount = parseUnits('300000', 18);
  await execute('APEFI', { from: deployer }, 'transfer', stakingReward.address, rewardAmount);
  const sevenDays = 60 * 60 * 24 * 7;
  await execute('StakingRewards', { from: deployer}, 'addRewardsToken', apefi.address, sevenDays);
  await execute('StakingRewards', { from: deployer }, 'notifyRewardAmount', apefi.address, rewardAmount);

  // user 1 stake apeUSD and farm APEFI
  const stakeAmount = parseUnits('30000', 18);
  await execute('ApeUSD', { from: user1 }, 'approve', stakingReward.address, stakeAmount);
  await execute('StakingRewards', { from: user1 }, 'stake', stakeAmount);

  // test withdraw & burn
  await execute('ApeUSD', { from: admin }, 'withdraw', parseUnits('100000', 18));
}
export default func;
func.tags = ['SetupTestCase'];
