# AI Guided Market Making Agent

This agent showcases an ai guided market maker on Manifest, Solana's CLOB DEX. The agent guides the user to setup basic two-sided quotes on Manifest markets.
[Reference](https://github.com/CKS-Systems/manifest)

## Key Features

- **Automated Quoting**: The agent automatically refreshes quotes on an interval.
- **Reducing Complexity**: Designed to abstract away parameters for setting up market making.
- **Random Model**: The market making introduces randomness to prevent front running or other negative botting behavoirs.


## Example
=== Market Maker Configuration ===

Enter the market ID: 2Uj8277fkaVBtTU6Wp2GPRbQC86SkSdgQ2mp1Q5N2LHc
Enter the base token symbol (e.g., SEND): SEND
Enter the quote token symbol (e.g., USDC): USDC

=== Quote Parameters (applies to both buy and sell sides) ===
Enter number of quotes to place on each side: 4
Enter minimum quote depth (% distance from mid price): 0.1
Enter maximum quote depth (% distance from mid price): 2

=== Token Allowances ===
Enter total SEND allowance: 2
Enter total USDC allowance: 3

Enter update interval in seconds: 20

=== Configuration Summary ===
{
  "marketId": "2Uj8277fkaVBtTU6Wp2GPRbQC86SkSdgQ2mp1Q5N2LHc",
  "baseToken": "SEND",
  "quoteToken": "USDC",
  "quoteParams": {
    "number": 4,
    "minDepth": 0.1,
    "maxDepth": 2
  },
  "allowance": {
    "base": 2,
    "quote": 3
  },
  "intervalSeconds": 20
}

Is this configuration correct? (yes/no): yes

Starting market maker mode for SEND/USDC...
