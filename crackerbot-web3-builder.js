// BLOCKCHAIN & WEB3 PROJECT BUILDER
window.buildWeb3Project = function(name, type, features) {
    console.log('[Web3 Builder] Building:', name, type, features);
    const files = {};
    
    // Parse user features for customization
    const feat = (features || '').toLowerCase();
    const network = feat.includes('polygon') ? 'polygon' : 
                   feat.includes('binance') ? 'bsc' : 
                   feat.includes('arbitrum') ? 'arbitrum' : 'ethereum';
    
    if (type.includes('Smart Contract')) {
        files['contracts/Token.sol'] = `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * ${name} - Smart Contract
 * Features: ${features || 'Basic smart contract'}
 */

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

contract ${name.replace(/\s+/g, '')} is ERC20, Ownable, Pausable {
    uint256 public maxSupply;
    ${feat.includes('burn') ? 'bool public burnEnabled = true;' : ''}
    ${feat.includes('tax') ? 'uint256 public taxRate = 2; // 2%' : ''}
    
    constructor(uint256 _initialSupply) ERC20("${name}", "${name.substring(0, 3).toUpperCase()}") {
        maxSupply = _initialSupply * 10 ** decimals();
        _mint(msg.sender, maxSupply);
    }
    
    ${feat.includes('mint') ? `
    function mint(address to, uint256 amount) public onlyOwner {
        require(totalSupply() + amount <= maxSupply, "Exceeds max supply");
        _mint(to, amount);
    }` : ''}
    
    ${feat.includes('burn') ? `
    function burn(uint256 amount) public {
        require(burnEnabled, "Burn disabled");
        _burn(msg.sender, amount);
    }` : ''}
    
    function pause() public onlyOwner {
        _pause();
    }
    
    function unpause() public onlyOwner {
        _unpause();
    }
    
    function _beforeTokenTransfer(address from, address to, uint256 amount)
        internal
        whenNotPaused
        override
    {
        super._beforeTokenTransfer(from, to, amount);
        ${feat.includes('tax') ? `
        if (from != address(0) && to != address(0) && taxRate > 0) {
            uint256 tax = (amount * taxRate) / 100;
            super._transfer(from, owner(), tax);
        }` : ''}
    }
}`;

        files['hardhat.config.js'] = `require("@nomiclabs/hardhat-waffle");
require("@nomiclabs/hardhat-ethers");
require("dotenv").config();

module.exports = {
  solidity: "0.8.19",
  networks: {
    ${network}: {
      url: process.env.${network.toUpperCase()}_RPC_URL,
      accounts: [process.env.PRIVATE_KEY]
    },
    localhost: {
      url: "http://127.0.0.1:8545"
    }
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts"
  }
};`;

        files['scripts/deploy.js'] = `const hre = require("hardhat");

async function main() {
  console.log("Deploying ${name}...");
  
  const Contract = await hre.ethers.getContractFactory("${name.replace(/\s+/g, '')}");
  const contract = await Contract.deploy(1000000); // 1M tokens
  
  await contract.deployed();
  
  console.log("✅ ${name} deployed to:", contract.address);
  console.log("Network:", hre.network.name);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});`;

        files['package.json'] = `{
  "name": "${name.toLowerCase().replace(/\s+/g, '-')}",
  "version": "1.0.0",
  "scripts": {
    "compile": "hardhat compile",
    "test": "hardhat test",
    "deploy": "hardhat run scripts/deploy.js",
    "node": "hardhat node"
  },
  "devDependencies": {
    "@nomiclabs/hardhat-ethers": "^2.2.3",
    "@nomiclabs/hardhat-waffle": "^2.0.6",
    "@openzeppelin/contracts": "^4.9.0",
    "chai": "^4.3.7",
    "ethereum-waffle": "^4.0.10",
    "ethers": "^5.7.2",
    "hardhat": "^2.14.0"
  }
}`;

    } else if (type.includes('NFT Collection')) {
        files['contracts/NFT.sol'] = `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract ${name.replace(/\s+/g, '')}NFT is ERC721, ERC721URIStorage, Ownable {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;
    
    uint256 public maxSupply = ${feat.includes('10k') ? '10000' : '1000'};
    uint256 public mintPrice = ${feat.includes('free') ? '0' : '0.01 ether'};
    bool public saleActive = false;
    string public baseTokenURI;
    
    constructor() ERC721("${name}", "${name.substring(0, 4).toUpperCase()}") {
        baseTokenURI = "ipfs://YOUR_CID/";
    }
    
    function mint(uint256 quantity) public payable {
        require(saleActive, "Sale not active");
        require(_tokenIds.current() + quantity <= maxSupply, "Exceeds supply");
        require(msg.value >= mintPrice * quantity, "Insufficient payment");
        
        for (uint256 i = 0; i < quantity; i++) {
            _tokenIds.increment();
            uint256 newTokenId = _tokenIds.current();
            _safeMint(msg.sender, newTokenId);
            _setTokenURI(newTokenId, string(abi.encodePacked(baseTokenURI, Strings.toString(newTokenId), ".json")));
        }
    }
    
    function toggleSale() public onlyOwner {
        saleActive = !saleActive;
    }
    
    function setBaseURI(string memory _baseTokenURI) public onlyOwner {
        baseTokenURI = _baseTokenURI;
    }
    
    function withdraw() public onlyOwner {
        payable(owner()).transfer(address(this).balance);
    }
}`;

        files['frontend/mint.html'] = `<!DOCTYPE html>
<html>
<head>
    <title>${name} - NFT Minting</title>
    <script src="https://cdn.ethers.io/lib/ethers-5.7.2.umd.min.js"></script>
</head>
<body>
    <div class="container">
        <h1>${name} NFT Collection</h1>
        <p>${features || 'Mint your unique NFT'}</p>
        
        <div class="mint-section">
            <input type="number" id="quantity" value="1" min="1" max="10">
            <button onclick="mint()">Mint NFT</button>
        </div>
        
        <div id="status"></div>
    </div>
    
    <script>
        let provider, signer, contract;
        const contractAddress = "YOUR_CONTRACT_ADDRESS";
        const abi = [/* Add ABI here */];
        
        async function connect() {
            if (typeof window.ethereum !== 'undefined') {
                provider = new ethers.providers.Web3Provider(window.ethereum);
                await provider.send("eth_requestAccounts", []);
                signer = provider.getSigner();
                contract = new ethers.Contract(contractAddress, abi, signer);
                document.getElementById('status').innerText = '✅ Wallet connected';
            }
        }
        
        async function mint() {
            const quantity = document.getElementById('quantity').value;
            try {
                const price = await contract.mintPrice();
                const tx = await contract.mint(quantity, {
                    value: price.mul(quantity)
                });
                document.getElementById('status').innerText = '⏳ Minting...';
                await tx.wait();
                document.getElementById('status').innerText = '✅ Minted successfully!';
            } catch (error) {
                document.getElementById('status').innerText = '❌ ' + error.message;
            }
        }
        
        connect();
    </script>
    
    <style>
        body {
            font-family: Arial;
            background: linear-gradient(135deg, #667eea, #764ba2);
            color: white;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
        }
        .container {
            text-align: center;
            padding: 2rem;
            background: rgba(0,0,0,0.3);
            border-radius: 20px;
        }
        button {
            background: white;
            color: #764ba2;
            border: none;
            padding: 10px 30px;
            font-size: 18px;
            border-radius: 10px;
            cursor: pointer;
        }
        input {
            padding: 10px;
            font-size: 18px;
            margin-right: 10px;
            border-radius: 10px;
            border: none;
        }
    </style>
</body>
</html>`;

    } else if (type.includes('DeFi Protocol')) {
        files['contracts/DeFi.sol'] = `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract ${name.replace(/\s+/g, '')}DeFi {
    mapping(address => uint256) public balances;
    mapping(address => mapping(address => uint256)) public allowances;
    
    uint256 public totalStaked;
    uint256 public rewardRate = 100; // 1% daily
    
    event Staked(address indexed user, uint256 amount);
    event Withdrawn(address indexed user, uint256 amount);
    
    function stake() public payable {
        require(msg.value > 0, "Amount must be > 0");
        balances[msg.sender] += msg.value;
        totalStaked += msg.value;
        emit Staked(msg.sender, msg.value);
    }
    
    function withdraw(uint256 amount) public {
        require(balances[msg.sender] >= amount, "Insufficient balance");
        balances[msg.sender] -= amount;
        totalStaked -= amount;
        payable(msg.sender).transfer(amount);
        emit Withdrawn(msg.sender, amount);
    }
    
    function calculateRewards(address user) public view returns (uint256) {
        return (balances[user] * rewardRate) / 10000;
    }
}`;

    } else if (type.includes('DAO')) {
        files['contracts/DAO.sol'] = `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract ${name.replace(/\s+/g, '')}DAO {
    struct Proposal {
        uint256 id;
        string description;
        uint256 forVotes;
        uint256 againstVotes;
        uint256 deadline;
        bool executed;
        mapping(address => bool) hasVoted;
    }
    
    mapping(uint256 => Proposal) public proposals;
    mapping(address => uint256) public votingPower;
    uint256 public proposalCount;
    
    event ProposalCreated(uint256 id, string description);
    event Voted(uint256 proposalId, address voter, bool support);
    
    function createProposal(string memory description) public {
        require(votingPower[msg.sender] > 0, "No voting power");
        proposalCount++;
        Proposal storage p = proposals[proposalCount];
        p.id = proposalCount;
        p.description = description;
        p.deadline = block.timestamp + 7 days;
        emit ProposalCreated(proposalCount, description);
    }
    
    function vote(uint256 proposalId, bool support) public {
        Proposal storage p = proposals[proposalId];
        require(block.timestamp < p.deadline, "Voting ended");
        require(!p.hasVoted[msg.sender], "Already voted");
        require(votingPower[msg.sender] > 0, "No voting power");
        
        p.hasVoted[msg.sender] = true;
        if (support) {
            p.forVotes += votingPower[msg.sender];
        } else {
            p.againstVotes += votingPower[msg.sender];
        }
        emit Voted(proposalId, msg.sender, support);
    }
}`;

    } else if (type.includes('Web3 dApp')) {
        files['index.html'] = `<!DOCTYPE html>
<html>
<head>
    <title>${name} - Web3 dApp</title>
    <script src="https://cdn.ethers.io/lib/ethers-5.7.2.umd.min.js"></script>
</head>
<body>
    <div class="app">
        <h1>${name}</h1>
        <p>${features || 'Decentralized Application'}</p>
        
        <button id="connectBtn" onclick="connectWallet()">Connect Wallet</button>
        <div id="account"></div>
        <div id="balance"></div>
        <div id="network"></div>
        
        <div class="actions">
            <!-- dApp functionality here -->
        </div>
    </div>
    
    <script src="app.js"></script>
    <style>
        body {
            font-family: Arial;
            background: linear-gradient(135deg, #9945ff, #14f195);
            color: white;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
        }
        .app {
            text-align: center;
            padding: 2rem;
            background: rgba(0,0,0,0.3);
            border-radius: 20px;
        }
        button {
            background: white;
            color: #9945ff;
            border: none;
            padding: 10px 30px;
            font-size: 16px;
            border-radius: 10px;
            cursor: pointer;
            margin: 10px;
        }
    </style>
</body>
</html>`;

        files['app.js'] = `// ${name} - Web3 dApp
let provider, signer, account;

async function connectWallet() {
    if (typeof window.ethereum !== 'undefined') {
        try {
            provider = new ethers.providers.Web3Provider(window.ethereum);
            await provider.send("eth_requestAccounts", []);
            signer = provider.getSigner();
            account = await signer.getAddress();
            
            document.getElementById('account').innerText = 'Account: ' + account;
            document.getElementById('connectBtn').innerText = 'Connected';
            
            const balance = await provider.getBalance(account);
            document.getElementById('balance').innerText = 'Balance: ' + ethers.utils.formatEther(balance) + ' ETH';
            
            const network = await provider.getNetwork();
            document.getElementById('network').innerText = 'Network: ' + network.name;
            
        } catch (error) {
            console.error('Connection failed:', error);
        }
    } else {
        alert('Please install MetaMask!');
    }
}

// Features: ${features}`;
    }
    
    // Always add README
    files['README.md'] = `# ${name}

## Type
${type}

## Features
${features || 'Blockchain/Web3 project'}

## Network
${network}

## Setup
1. npm install
2. Configure .env with your keys
3. npm run compile
4. npm run deploy

## Security
⚠️ Audit smart contracts before mainnet deployment`;
    
    return files;
};

console.log('[Web3 Builder] Loaded - Smart Contracts, NFTs, DeFi, DAO, Tokens, dApps, Wallets, DEX');
