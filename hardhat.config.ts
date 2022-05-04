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
        version: '0.8.11'
      }
    ]
  },
  namedAccounts: {
    deployer: 0,
    admin: {
      hardhat: 0,
      mainnet: '0x8b16BD85BF8b968890bCc3c52702eE3F90636Ed9',
    },
    guardian: {
      hardhat: 0,
      mainnet: '0x8b16BD85BF8b968890bCc3c52702eE3F90636Ed9',
    },
    feedRegistry: {
      mainnet: '0x47Fb2585D2C56Fe188D0E6ec628a38b74fCeeeDf'
    },
    apeCoin: {
      mainnet: '0x4d224452801ACEd8B2F0aebE155379bb5D594381'
    }
  },
  networks: {
    hardhat: {
      // forking: {
      //   url: `https://mainnet.infura.io/v3/${process.env.INFURA_TOKEN}`
      // }
    },
    mainnet: {
      url: `https://mainnet.infura.io/v3/${process.env.INFURA_TOKEN}`,
      accounts: process.env.DEPLOY_PRIVATE_KEY == undefined ? [] : [`0x${process.env.DEPLOY_PRIVATE_KEY}`]
    }
  },
  verify: {
    etherscan: {
      apiKey: process.env.ETHERSCAN_API_KEY
    }
  }
};

export default config;
