import "dotenv/config";
import "hardhat-deploy";
import "@nomiclabs/hardhat-ethers";
import "@nomiclabs/hardhat-etherscan";
import "hardhat-contract-sizer";
import "./tasks";

const config: any = {
  defaultNetwork: "hardhat",
  solidity: {
    compilers: [
      {
        version: "0.4.18",
        settings: {
          optimizer: {
            enabled: true,
          },
        },
      },
      {
        version: "0.5.17",
        settings: {
          optimizer: {
            enabled: true,
          },
        },
      },
      {
        version: "0.8.10",
        settings: {
          optimizer: {
            enabled: true,
          },
        },
      },
    ],
  },
  namedAccounts: {
    deployer: 0,
    user1: 1,
    user2: 2,
    admin: {
      hardhat: 0,
      mainnet: "0x02cA76E87779412a77Ee77C3600D72F68b9ea68C",
    },
    poster: {
      hardhat: 0,
      mainnet: "0x45FEc2E27CCaacA77aa0aE4AF17c2F14A72F015f",
    },
    guardian: {
      hardhat: 0,
      mainnet: "0xdcc406dA85E263641C5692A9749E08998409fbF5",
    },
    feedRegistry: {
      default: "0x47Fb2585D2C56Fe188D0E6ec628a38b74fCeeeDf",
    },
    pepe: {
      default: "0x6982508145454Ce325dDbE47a25d4ec3d2311933",
    },
    weth: {
      default: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
    },
  },
  networks: {
    hardhat: {
      forking: {
        url: `https://mainnet.infura.io/v3/${process.env.INFURA_TOKEN}`,
      },
    },
    mainnet: {
      url: `https://mainnet.infura.io/v3/${process.env.INFURA_TOKEN}`,
      accounts: process.env.DEPLOY_PRIVATE_KEY == undefined ? [] : [`0x${process.env.DEPLOY_PRIVATE_KEY}`],
    },
  },
  verify: {
    etherscan: {
      apiKey: process.env.ETHERSCAN_API_KEY,
    },
  },
};

export default config;
