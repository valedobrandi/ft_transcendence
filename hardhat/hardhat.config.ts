import type { HardhatUserConfig } from "hardhat/config";

import hardhatToolboxMochaEthersPlugin from "@nomicfoundation/hardhat-toolbox-mocha-ethers";
import { configVariable } from "hardhat/config";

const config: HardhatUserConfig = {
    plugins: [hardhatToolboxMochaEthersPlugin],
    solidity: {
        version: "0.8.28",
        settings: {
            optimizer: {
                enabled: true,
                runs: 200,
            },
        },
    },
    networks: {
        localhost: {
            type: "http",
            chainType: "l1",
            url: "http://127.0.0.1:8545",
            chainId: 43112,
        },
        hardhatOp: {
            type: "edr-simulated",
            chainType: "op",
        },
    },
};

export default config;
