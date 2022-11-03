import 'dotenv/config';
import 'hardhat-deploy';
import '@nomiclabs/hardhat-ethers';
import '@nomiclabs/hardhat-etherscan';
import 'hardhat-contract-sizer';
import './tasks';

const config: any = {
  defaultNetwork: 'hardhat',
  solidity: {
    compilers: [
      {
        version: '0.5.17',
        settings: {
          optimizer: {
            enabled: true
          }
        }
      },
      {
        version: '0.8.10',
        settings: {
          optimizer: {
            enabled: true
          }
        }
      }
    ]
  },
  namedAccounts: {
    deployer: 0,
    user1: 1,
    user2: 2,
    admin: {
      hardhat: 0,
      mainnet: '0x02cA76E87779412a77Ee77C3600D72F68b9ea68C',
    },
    guardian: {
      hardhat: 0,
      mainnet: '0xdcc406dA85E263641C5692A9749E08998409fbF5',
    },
    feedRegistry: {
      default: '0x47Fb2585D2C56Fe188D0E6ec628a38b74fCeeeDf'
    },
    stdReference: {
      default: '0xDA7a001b254CD22e46d3eAB04d937489c93174C3'
    },
    apeCoin: {
      default: '0x4d224452801ACEd8B2F0aebE155379bb5D594381'
    },
    apefi: {
      default: '0x9fFEC4aCb9A6528C7fb83ccCa2B9e73e80d1a2d1'
    },
    bridge: {
      default: '0x833FE7f92B1f21e17B9Cc4e52a55AF0eda4760E8'
    }
  },
  networks: {
    hardhat: {
      // forking: {
      //   url: `https://rpc.ankr.com/eth`
      // }
    },
    mainnet: {
      url: `https://rpc.ankr.com/eth`,
      accounts: process.env.DEPLOY_PRIVATE_KEY == undefined ? [] : [`0x${process.env.DEPLOY_PRIVATE_KEY}`]
    },
  },
  verify: {
    etherscan: {
      apiKey: process.env.ETHERSCAN_API_KEY
    }
  }
};

export default config;
