import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployments, ethers, getNamedAccounts } = hre;
  const { deploy, execute, get } = deployments;
  const { parseEther, parseUnits } = ethers.utils;

  const { deployer } = await getNamedAccounts();

  var wethAddress;
  const network = hre.network as any;
  if (network.config.forking || network.name == "mainnet") {
    const { weth } = await getNamedAccounts();
    wethAddress = weth;
  } else {
    const weth = await deploy("WETH9", {
      from: deployer,
      log: true,
    });
    wethAddress = weth.address;
  }

  const unitrollerAddress = (await get("Unitroller")).address;
  const majorIrmAddress = (await get("MajorIRM")).address;
  const cTokenAdminAddress = (await get("CTokenAdmin")).address;
  const exchangeRate = "0.01";
  const version = 2; // 0: Vanilla, 1: CollateralCap, 2: WrappedNative

  const pepeWETH = await deploy("pepeWETH", {
    from: deployer,
    contract: "CWrappedNativeDelegator",
    args: [
      wethAddress,
      unitrollerAddress,
      majorIrmAddress,
      parseUnits(exchangeRate, 18 + 18 - 8),
      "Pepe Wrapped Ether",
      "pepeWETH",
      8,
      cTokenAdminAddress,
      (await get("CWrappedNativeDelegate")).address,
      "0x",
    ],
    log: true,
  });

  // set Price Oracle
  if (network.config.forking || network.name == "mainnet") {
    const ETH = "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE";
    const USD = "0x0000000000000000000000000000000000000348";
    await execute("PriceOracleProxyIB", { from: deployer, log: true }, "_setAggregators", [wethAddress], [ETH], [USD]);
  } else {
    await execute(
      "PriceOracleProxyIB",
      { from: deployer, log: true },
      "setDirectPrice",
      wethAddress,
      parseUnits("1841.48", 18)
    );
  }

  // support market
  await execute("Comptroller", { from: deployer, log: true }, "_supportMarket", pepeWETH.address, version);

  // set collateral factor
  await execute(
    "Comptroller",
    { from: deployer, log: true },
    "_setCollateralFactor",
    pepeWETH.address,
    parseEther("0.85")
  );
};
export default func;
func.tags = ["ListWETH"];
func.dependencies = ["ListPEPE"];
