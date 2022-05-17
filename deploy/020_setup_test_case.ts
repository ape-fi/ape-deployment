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
  const apeTokenHelper = (await get('ApeTokenHelper')).address;

  // test env only
  const apeAmount1 = parseUnits('4000', 18);
  const borrowAmount = parseUnits('38591', 18);

  await execute('APE', { from: deployer }, 'transfer', user1, apeAmount1);
  await execute('APE', { from: user1 }, 'approve', apeTokenHelper, apeAmount1);
  await execute('ApeTokenHelper', { from: user1 }, 'mintBorrow', apeAPEAddress, apeAmount1, apeApeUSDAddress, borrowAmount);

  console.log('user:', user1, 'has borrow', formatEther(borrowAmount), 'apeUSD');


  const borrowAmount2 = parseUnits('4319', 18);
  const apeAmount2 = parseUnits('3321.19', 18);
  await execute('ApeUSD', { from: user1 }, 'transfer', user2, parseUnits('230.10', 18));
  await execute('APE', { from: deployer }, 'transfer', user2, apeAmount2);
  await execute('APE', { from: user2 }, 'approve', apeTokenHelper, apeAmount2);
  await execute('ApeTokenHelper', { from: user2 }, 'mintBorrow', apeAPEAddress, apeAmount2, apeApeUSDAddress, borrowAmount2);
  // await execute('ApeUSD', { from: user2 }, 'approve', apeTokenHelper, parseUnits('4500', 18));
  // await execute('ApeTokenHelper', { from: user2 }, 'repayRedeem', apeApeUSDAddress, ethers.constants.MaxUint256, apeApeUSDAddress, 0, 0);


  console.log('user:', user2, 'has deposit', formatEther(apeAmount2), 'APE');

  const mockLP = await deploy('MockCurveLP', {
    from: deployer,
    args: ['Curve.fi Factory Plain Pool: ApeUSD-FRAX', 'ApeUSDFRAX-f'],
    log: true
  });

  const stakingRewardHelper = (await get('StakingRewardsHelper')).address;

  const stakingReward = await deploy('StakingRewards', {
    from: deployer,
    contract: 'MockStakingRewards',
    args: [mockLP.address, stakingRewardHelper],
    log: true
  });

  const apefi = await deploy('APEFI', {
    from: deployer,
    contract: 'MockToken',
    args: ['Ape Finance', 'APEFI'],
    log: true
  });

  const fxs = await deploy('FXS', {
    from: deployer,
    contract: 'MockToken',
    args: ['Frax Share', 'FXS'],
    log: true
  });

  const apefiRewardAmount = parseUnits('63461538', 18);
  await execute('APEFI', { from: deployer }, 'transfer', stakingReward.address, apefiRewardAmount);
  const fxsRewardAmount = parseUnits('45788', 18);
  await execute('FXS', { from: deployer }, 'transfer', stakingReward.address, fxsRewardAmount);
  const twoWeeks = 60 * 60 * 24 * 14;
  await execute('StakingRewards', { from: deployer}, 'addRewardsToken', apefi.address, twoWeeks);
  await execute('StakingRewards', { from: deployer}, 'addRewardsToken', fxs.address, twoWeeks);
  await execute('StakingRewards', { from: deployer }, 'notifyRewardAmount', apefi.address, apefiRewardAmount);
  await execute('StakingRewards', { from: deployer }, 'notifyRewardAmount', fxs.address, fxsRewardAmount);

  // user 1 stake CurveLP and farm APEFI, FXS
  const stakeAmount = parseUnits('261321.4918101', 18);
  await execute('MockCurveLP', { from: deployer }, 'transfer', user1, stakeAmount);
  await execute('MockCurveLP', { from: user1 }, 'approve', stakingReward.address, stakeAmount);
  await execute('StakingRewards', { from: user1 }, 'stake', stakeAmount);

  // user 2 hasn't stake
  await execute('MockCurveLP', { from: deployer }, 'transfer', user2, parseUnits('14791.391091'));
}
export default func;
func.tags = ['SetupTestCase'];
