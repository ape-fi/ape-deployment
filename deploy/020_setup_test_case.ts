import {HardhatRuntimeEnvironment} from 'hardhat/types';
import {DeployFunction} from 'hardhat-deploy/types';

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployments, ethers, getNamedAccounts } = hre;
  const { execute, deploy, get, getArtifact, read, save } = deployments;
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
  const stakingRewardsArtifact = await getArtifact('StakingRewards');


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

  const apefi = await deploy('APEFI', {
    from: deployer,
    contract: 'MockToken',
    args: ['Ape Finance', 'APEFI'],
    log: true
  });

  const mockCurveLP = await deploy('MockCurveLP', {
    from: deployer,
    args: ['Curve.fi Factory Plain Pool: ApeUSD-FRAX', 'ApeUSDFRAX-f'],
    log: true
  });

  const mockUniLP = await deploy('MockUniLP', {
    from: deployer,
    args: ['Uniswap V2', 'UNI-V2', apeUSDAddress, apefi.address],
    log: true
  });

  const stakingRewardHelper = (await get('StakingRewardsHelper')).address;

  await execute('StakingRewardsFactory', {
    from: deployer,
    log: true
  }, 'createStakingRewards', [mockCurveLP.address, mockUniLP.address], stakingRewardHelper);

  const curveLPStakingAddress = await read('StakingRewardsFactory', 'getStakingRewards', mockCurveLP.address);
  console.log('CurveLPStaking:', curveLPStakingAddress);

  await save('CurveLPStaking', {
    abi: stakingRewardsArtifact.abi,
    address: curveLPStakingAddress
  })

  const uniLPStakingAddress = await read('StakingRewardsFactory', 'getStakingRewards', mockUniLP.address);
  console.log('UniLPStaking:', uniLPStakingAddress);

  await save('UniLPStaking', {
    abi: stakingRewardsArtifact.abi,
    address: uniLPStakingAddress
  })

  const fxs = await deploy('FXS', {
    from: deployer,
    contract: 'MockToken',
    args: ['Frax Share', 'FXS'],
    log: true
  });

  // user 1 stake CurveLP and farm APEFI, FXS
  const stakeAmount = parseUnits('261321.4918101', 18);
  await execute('MockCurveLP', { from: deployer }, 'transfer', user1, stakeAmount);
  await execute('MockCurveLP', { from: user1 }, 'approve', curveLPStakingAddress, stakeAmount);
  await execute('CurveLPStaking', { from: user1 }, 'stake', stakeAmount);
  await execute('MockUniLP', { from: deployer }, 'transfer', user1, parseUnits('1615.34911', 18))
  await execute('MockUniLP', { from: user1 }, 'approve', uniLPStakingAddress, parseUnits('1015.2', 18))
  await execute('UniLPStaking', { from: user1 }, 'stake', parseUnits('1015.2', 18))

  // user 2 hasn't stake
  await execute('MockCurveLP', { from: deployer }, 'transfer', user2, parseUnits('14791.391091'));
  await execute('MockUniLP', { from: deployer }, 'transfer', user2, parseUnits('773.1390919', 18))

  const apefiRewardAmount = parseUnits('47000000', 18);
  await execute('APEFI', { from: deployer }, 'transfer', curveLPStakingAddress, apefiRewardAmount);
  const fxsRewardAmount = parseUnits('45788', 18);
  await execute('FXS', { from: deployer }, 'transfer', curveLPStakingAddress, fxsRewardAmount);
  const oneWeek = 60 * 60 * 24 * 7;
  await execute('CurveLPStaking', { from: deployer }, 'addRewardsToken', apefi.address, oneWeek);
  await execute('CurveLPStaking', { from: deployer }, 'addRewardsToken', fxs.address, oneWeek);
  await execute('CurveLPStaking', { from: deployer }, 'notifyRewardAmount', apefi.address, apefiRewardAmount);
  await execute('CurveLPStaking', { from: deployer }, 'notifyRewardAmount', fxs.address, fxsRewardAmount);

  const apefiRewardAmount2 = parseUnits('5500000', 18);
  await execute('APEFI', { from: deployer }, 'transfer', uniLPStakingAddress, apefiRewardAmount2);
  await execute('UniLPStaking', { from: deployer }, 'addRewardsToken', apefi.address, oneWeek);
  await execute('UniLPStaking', { from: deployer }, 'notifyRewardAmount', apefi.address, apefiRewardAmount2);



  await deploy('Multicall2', {
    from: deployer,
    log: true
  })
}
export default func;
func.tags = ['SetupTestCase'];
