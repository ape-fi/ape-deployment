import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployments, ethers, getNamedAccounts } = hre;
  const { deploy, execute, get } = deployments;
  const { parseUnits } = ethers.utils;

  const { deployer } = await getNamedAccounts();

  const unitrollerAddress = (await get("Unitroller")).address;
  const irmAddress = (await get("MemeIRM")).address;
  const cTokenAdminAddress = (await get("CTokenAdmin")).address;
  const cTokenImplementationAddress = (await get("CCollateralCapErc20Delegate")).address;
  const exchangeRate = "0.01";
  const version = 1; // 0: Vanilla, 1: CollateralCap

  var pepeTokenAddress;
  const network = hre.network as any;
  if (network.config.forking || network.name == "mainnet") {
    const { pepe } = await getNamedAccounts();
    pepeTokenAddress = pepe;
  } else {
    const mockToken = await deploy("PEPE", {
      from: deployer,
      contract: "MockToken",
      args: ["Pepe", "PEPE"],
      log: true,
    });
    pepeTokenAddress = mockToken.address;
  }

  const initialExchangeRate = parseUnits(exchangeRate, 18 + 18 - 8);

  const pepePEPE = await deploy("pepePEPE", {
    from: deployer,
    contract: "CErc20Delegator",
    args: [
      pepeTokenAddress,
      unitrollerAddress,
      irmAddress,
      initialExchangeRate,
      "Pepe Pepe",
      "pepePEPE",
      8,
      cTokenAdminAddress,
      cTokenImplementationAddress,
      "0x",
    ],
    log: true,
  });

  // set price oracle
  if (network.config.forking || network.name == "mainnet") {
    // skip
  } else {
    await execute(
      "PriceOracleProxyIB",
      { from: deployer, log: true },
      "setDirectPrice",
      pepeTokenAddress,
      parseUnits("0.00000182", 18)
    );
  }

  // support market
  await execute("Comptroller", { from: deployer, log: true }, "_supportMarket", pepePEPE.address, version);

  // set collateral factor
  // await execute(
  //   "Comptroller",
  //   { from: deployer, log: true },
  //   "_setCollateralFactor",
  //   pepePEPE.address,
  //   parseUnits("0.5")
  // );
};
export default func;
func.tags = ["ListPEPE"];
func.dependencies = [
  "Unitroller",
  "Comptroller",
  "PriceOracleProxyIB",
  "CTokenImplementation",
  "InterestRateModel",
  "CTokenAdmin",
  "SetupComptroller",
];
