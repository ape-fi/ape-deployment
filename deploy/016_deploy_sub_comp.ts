import {HardhatRuntimeEnvironment} from 'hardhat/types';
import {DeployFunction} from 'hardhat-deploy/types';

const tokenAddress = '0x3432B6A60D23Ca0dFCa7761B7ab56459D9C964D0';

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const {deployments, ethers, getNamedAccounts} = hre;
  const {deploy, execute, get, getArtifact, save} = deployments;
  const { parseEther, parseUnits } = ethers.utils;

  const {deployer, admin, bridge, guardian} = await getNamedAccounts();

  const apeUSDAddress = (await get('ApeUSD')).address;

  const erc20ABI = (await getArtifact('EIP20Interface')).abi;
  const underlying = await ethers.getContractAt(erc20ABI, tokenAddress);
  const symbol = await underlying.symbol();
  const tokenName = await underlying.name();

  const unitroller = await deploy(`${symbol}Unitroller`, {
    from: deployer,
    contract: 'Unitroller',
    log: true,
  });

  const comptrollerImpl = await deploy('Comptroller_Implementation', {
    from: deployer,
    contract: 'Comptroller',
    log: true
  });

  // update Comptroller ABI
  await save(`${symbol}Comptroller`, {
    abi: comptrollerImpl.abi,
    address: unitroller.address
  });

  const unitrollerAddress = unitroller.address;

  // setup comptroller
  await execute(`${symbol}Unitroller`, { from: deployer, log: true }, '_setPendingImplementation', comptrollerImpl.address);
  await execute('Comptroller_Implementation', { from: deployer, log: true }, '_become', unitrollerAddress);

  const closeFactor = parseEther('0.5');
  const liquidationIncentive = parseEther('1.1');

  const priceOracleAddress = (await deployments.get('PriceOracleProxyUSD')).address;

  await execute(`${symbol}Comptroller`, { from: deployer, log: true }, '_setCloseFactor', closeFactor);
  await execute(`${symbol}Comptroller`, { from: deployer, log: true }, '_setLiquidationIncentive', liquidationIncentive);
  await execute(`${symbol}Comptroller`, { from: deployer, log: true }, '_setPriceOracle', priceOracleAddress);
  await execute(`${symbol}Comptroller`, { from: deployer, log: true }, '_setPauseGuardian', guardian);


  // deploy apeUSD market
  const irmAddress = (await get('StableIRM')).address;
  const apeTokenAdminAddress = (await get('ApeTokenAdmin')).address;
  const apeTokenImplementationAddress = (await get('ApeErc20Delegate')).address;
  const exchangeRate = '0.01';

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

  // support market
  await execute(`${symbol}Comptroller`, { from: deployer, log: true }, '_supportMarket', apeApeUSD.address);
  await execute(`${symbol}Comptroller`, { from: deployer, log: true }, '_setMintPaused', apeApeUSD.address, true);
  await execute(`${symbol}Comptroller`, { from: deployer, log: true }, '_setOnlySupplier', apeApeUSD.address, bridge);

  // deploy collateral market
  const collateralCapImplementationAddress = (await get('ApeCollateralCapErc20Delegate')).address;

  const apeToken = await deploy(`ape${symbol}`, {
    from: deployer,
    contract: 'ApeErc20Delegator',
    args: [
      tokenAddress,
      unitrollerAddress,
      irmAddress,
      initialExchangeRate,
      `Ape ${tokenName}`,
      `ape${symbol}`,
      8,
      apeTokenAdminAddress,
      collateralCapImplementationAddress,
      '0x'
    ],
    log: true
  });

  await execute(`${symbol}Comptroller`, { from: deployer, log: true }, '_supportMarket', apeToken.address);
  await execute(`${symbol}Comptroller`, { from: deployer, log: true }, '_setBorrowPaused', apeToken.address, true);

};

export default func;
func.tags = ['SubComptroller'];
