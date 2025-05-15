// GOLD Token ABI (simplified for demo)
export const GOLD_TOKEN_ABI = [
  // Read-only functions
  "function balanceOf(address owner) view returns (uint256)",
  "function decimals() view returns (uint8)",
  "function symbol() view returns (string)",

  // Authenticated functions
  "function transfer(address to, uint amount) returns (bool)",
  "function approve(address spender, uint256 amount) returns (bool)",

  // Events
  "event Transfer(address indexed from, address indexed to, uint amount)",
  "event Approval(address indexed owner, address indexed spender, uint256 value)",
]

// Staking Contract ABI (simplified for demo)
export const STAKING_CONTRACT_ABI = [
  // Read-only functions
  "function stakedBalanceOf(address account) view returns (uint256)",
  "function rewardRate() view returns (uint256)",
  "function totalStaked() view returns (uint256)",

  // Authenticated functions
  "function stake(uint256 amount) returns (bool)",
  "function withdraw(uint256 amount) returns (bool)",
  "function getReward() returns (bool)",

  // Events
  "event Staked(address indexed user, uint256 amount)",
  "event Withdrawn(address indexed user, uint256 amount)",
  "event RewardPaid(address indexed user, uint256 reward)",
]
