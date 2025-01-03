export type Adrena = {
  version: "1.1.5";
  name: "adrena";
  instructions: [
    {
      name: "initOneCore";
      accounts: [
        {
          name: "admin";
          isMut: false;
          isSigner: true;
          docs: ["#1"];
        },
        {
          name: "payer";
          isMut: true;
          isSigner: true;
          docs: ["#2"];
        },
        {
          name: "transferAuthority";
          isMut: true;
          isSigner: false;
          docs: ["#3"];
        },
        {
          name: "cortex";
          isMut: true;
          isSigner: false;
          docs: ["#4"];
        },
        {
          name: "protocolFeeRecipient";
          isMut: false;
          isSigner: false;
          docs: ["#5"];
        },
        {
          name: "feeRedistributionMint";
          isMut: false;
          isSigner: false;
          docs: ["#6"];
        },
        {
          name: "lmTokenMint";
          isMut: true;
          isSigner: false;
          docs: ["#7"];
        },
        {
          name: "systemProgram";
          isMut: false;
          isSigner: false;
          docs: ["#8"];
        },
        {
          name: "tokenProgram";
          isMut: false;
          isSigner: false;
          docs: ["#9"];
        },
        {
          name: "rent";
          isMut: false;
          isSigner: false;
          docs: ["#10"];
        },
      ];
      args: [
        {
          name: "params";
          type: {
            defined: "InitOneParams";
          };
        },
      ];
    },
    {
      name: "initTwoLmTokenMetadata";
      accounts: [
        {
          name: "admin";
          isMut: false;
          isSigner: true;
          docs: ["#1"];
        },
        {
          name: "payer";
          isMut: true;
          isSigner: true;
          docs: ["#2"];
        },
        {
          name: "transferAuthority";
          isMut: false;
          isSigner: false;
          docs: ["#3"];
        },
        {
          name: "cortex";
          isMut: true;
          isSigner: false;
          docs: ["#5"];
        },
        {
          name: "lmTokenMint";
          isMut: true;
          isSigner: false;
          docs: ["#6"];
        },
        {
          name: "lmTokenMintMetadata";
          isMut: true;
          isSigner: false;
          docs: ["#7"];
        },
        {
          name: "systemProgram";
          isMut: false;
          isSigner: false;
          docs: ["#8"];
        },
        {
          name: "tokenProgram";
          isMut: false;
          isSigner: false;
          docs: ["#9"];
        },
        {
          name: "mplTokenMetadataProgram";
          isMut: false;
          isSigner: false;
          docs: ["#10"];
        },
        {
          name: "rent";
          isMut: false;
          isSigner: false;
          docs: ["#11"];
        },
      ];
      args: [];
    },
    {
      name: "initThreeGovernance";
      accounts: [
        {
          name: "admin";
          isMut: false;
          isSigner: true;
          docs: ["#1"];
        },
        {
          name: "payer";
          isMut: true;
          isSigner: true;
          docs: ["#2"];
        },
        {
          name: "transferAuthority";
          isMut: false;
          isSigner: false;
          docs: ["#3"];
        },
        {
          name: "cortex";
          isMut: true;
          isSigner: false;
          docs: ["#4"];
        },
        {
          name: "governanceTokenMint";
          isMut: true;
          isSigner: false;
          docs: ["#5"];
        },
        {
          name: "governanceRealm";
          isMut: false;
          isSigner: false;
          docs: [
            "#6",
            "A realm represent one project within the governance program",
          ];
        },
        {
          name: "governanceProgram";
          isMut: false;
          isSigner: false;
          docs: ["#7"];
        },
        {
          name: "systemProgram";
          isMut: false;
          isSigner: false;
          docs: ["#8"];
        },
        {
          name: "tokenProgram";
          isMut: false;
          isSigner: false;
          docs: ["#9"];
        },
        {
          name: "rent";
          isMut: false;
          isSigner: false;
          docs: ["#10"];
        },
      ];
      args: [];
    },
    {
      name: "initFourVesting";
      accounts: [
        {
          name: "admin";
          isMut: false;
          isSigner: true;
          docs: ["#1"];
        },
        {
          name: "payer";
          isMut: true;
          isSigner: true;
          docs: ["#2"];
        },
        {
          name: "transferAuthority";
          isMut: false;
          isSigner: false;
          docs: ["#3"];
        },
        {
          name: "cortex";
          isMut: true;
          isSigner: false;
          docs: ["#4"];
        },
        {
          name: "vestRegistry";
          isMut: true;
          isSigner: false;
          docs: ["#5"];
        },
        {
          name: "systemProgram";
          isMut: false;
          isSigner: false;
          docs: ["#6"];
        },
        {
          name: "tokenProgram";
          isMut: false;
          isSigner: false;
          docs: ["#7"];
        },
        {
          name: "rent";
          isMut: false;
          isSigner: false;
          docs: ["#8"];
        },
      ];
      args: [];
    },
    {
      name: "addVest";
      accounts: [
        {
          name: "admin";
          isMut: false;
          isSigner: true;
          docs: ["#1"];
        },
        {
          name: "owner";
          isMut: false;
          isSigner: false;
          docs: ["#2"];
        },
        {
          name: "payer";
          isMut: true;
          isSigner: true;
          docs: ["#3"];
        },
        {
          name: "transferAuthority";
          isMut: false;
          isSigner: false;
          docs: ["#4"];
        },
        {
          name: "cortex";
          isMut: true;
          isSigner: false;
          docs: ["#5"];
        },
        {
          name: "vestRegistry";
          isMut: true;
          isSigner: false;
          docs: ["#6"];
        },
        {
          name: "vest";
          isMut: true;
          isSigner: false;
          docs: ["#7"];
        },
        {
          name: "lmTokenMint";
          isMut: true;
          isSigner: false;
          docs: ["#8"];
        },
        {
          name: "governanceTokenMint";
          isMut: true;
          isSigner: false;
          docs: ["#9"];
        },
        {
          name: "governanceRealm";
          isMut: false;
          isSigner: false;
          docs: [
            "#10",
            "A realm represent one project within the governance program",
          ];
        },
        {
          name: "governanceRealmConfig";
          isMut: false;
          isSigner: false;
          docs: ["#11"];
        },
        {
          name: "governanceGoverningTokenHolding";
          isMut: true;
          isSigner: false;
          docs: [
            "#12",
            "Token account owned by governance program holding user's locked tokens",
          ];
        },
        {
          name: "governanceGoverningTokenOwnerRecord";
          isMut: true;
          isSigner: false;
          docs: ["#13", "Account owned by governance storing user information"];
        },
        {
          name: "governanceProgram";
          isMut: false;
          isSigner: false;
          docs: ["#14"];
        },
        {
          name: "systemProgram";
          isMut: false;
          isSigner: false;
          docs: ["#15"];
        },
        {
          name: "tokenProgram";
          isMut: false;
          isSigner: false;
          docs: ["#16"];
        },
        {
          name: "rent";
          isMut: false;
          isSigner: false;
          docs: ["#17"];
        },
      ];
      args: [
        {
          name: "params";
          type: {
            defined: "AddVestParams";
          };
        },
      ];
      returns: "u8";
    },
    {
      name: "claimVest";
      accounts: [
        {
          name: "caller";
          isMut: false;
          isSigner: true;
          docs: ["#1"];
        },
        {
          name: "owner";
          isMut: false;
          isSigner: false;
          docs: ["#2"];
        },
        {
          name: "payer";
          isMut: true;
          isSigner: false;
          docs: ["#3"];
        },
        {
          name: "receivingAccount";
          isMut: true;
          isSigner: false;
          docs: ["#4"];
        },
        {
          name: "transferAuthority";
          isMut: false;
          isSigner: false;
          docs: ["#5"];
        },
        {
          name: "cortex";
          isMut: true;
          isSigner: false;
          docs: ["#6"];
        },
        {
          name: "vestRegistry";
          isMut: true;
          isSigner: false;
          docs: ["#7"];
        },
        {
          name: "vest";
          isMut: true;
          isSigner: false;
          docs: ["#8"];
        },
        {
          name: "lmTokenMint";
          isMut: true;
          isSigner: false;
          docs: ["#9"];
        },
        {
          name: "governanceTokenMint";
          isMut: true;
          isSigner: false;
          docs: ["#10"];
        },
        {
          name: "governanceRealm";
          isMut: false;
          isSigner: false;
          docs: [
            "#11",
            "A realm represent one project within the governance program",
          ];
        },
        {
          name: "governanceRealmConfig";
          isMut: false;
          isSigner: false;
          docs: ["#12"];
        },
        {
          name: "governanceGoverningTokenHolding";
          isMut: true;
          isSigner: false;
          docs: [
            "#13",
            "Token account owned by governance program holding user's locked tokens",
          ];
        },
        {
          name: "governanceGoverningTokenOwnerRecord";
          isMut: true;
          isSigner: false;
          docs: ["#14", "Account owned by governance storing user information"];
        },
        {
          name: "governanceProgram";
          isMut: false;
          isSigner: false;
          docs: ["#15"];
        },
        {
          name: "adrenaProgram";
          isMut: false;
          isSigner: false;
          docs: ["#16"];
        },
        {
          name: "systemProgram";
          isMut: false;
          isSigner: false;
          docs: ["#17"];
        },
        {
          name: "tokenProgram";
          isMut: false;
          isSigner: false;
          docs: ["#18"];
        },
        {
          name: "rent";
          isMut: false;
          isSigner: false;
          docs: ["#19"];
        },
      ];
      args: [];
      returns: "u64";
    },
    {
      name: "addPoolPartOne";
      accounts: [
        {
          name: "admin";
          isMut: false;
          isSigner: true;
          docs: ["#1"];
        },
        {
          name: "payer";
          isMut: true;
          isSigner: true;
          docs: ["#2"];
        },
        {
          name: "transferAuthority";
          isMut: false;
          isSigner: false;
          docs: ["#3"];
        },
        {
          name: "cortex";
          isMut: true;
          isSigner: false;
          docs: ["#4"];
        },
        {
          name: "pool";
          isMut: true;
          isSigner: false;
          docs: ["#5"];
        },
        {
          name: "lpTokenMint";
          isMut: true;
          isSigner: false;
          docs: ["#6"];
        },
        {
          name: "lpTokenMintMetadata";
          isMut: true;
          isSigner: false;
          docs: ["#7"];
        },
        {
          name: "systemProgram";
          isMut: false;
          isSigner: false;
          docs: ["#8"];
        },
        {
          name: "tokenProgram";
          isMut: false;
          isSigner: false;
          docs: ["#9"];
        },
        {
          name: "mplTokenMetadataProgram";
          isMut: false;
          isSigner: false;
          docs: ["#10"];
        },
        {
          name: "adrenaProgram";
          isMut: false;
          isSigner: false;
          docs: ["#11"];
        },
        {
          name: "rent";
          isMut: false;
          isSigner: false;
          docs: ["#12"];
        },
      ];
      args: [
        {
          name: "params";
          type: {
            defined: "AddPoolPartOneParams";
          };
        },
      ];
      returns: "u8";
    },
    {
      name: "addPoolPartTwo";
      accounts: [
        {
          name: "admin";
          isMut: false;
          isSigner: true;
          docs: ["#1"];
        },
        {
          name: "payer";
          isMut: true;
          isSigner: true;
          docs: ["#2"];
        },
        {
          name: "transferAuthority";
          isMut: false;
          isSigner: false;
          docs: ["#3"];
        },
        {
          name: "cortex";
          isMut: true;
          isSigner: false;
          docs: ["#4"];
        },
        {
          name: "pool";
          isMut: true;
          isSigner: false;
          docs: ["#5"];
        },
        {
          name: "lpTokenMint";
          isMut: false;
          isSigner: false;
          docs: ["#6"];
        },
        {
          name: "genesisLock";
          isMut: true;
          isSigner: false;
          docs: ["#7"];
        },
        {
          name: "systemProgram";
          isMut: false;
          isSigner: false;
          docs: ["#8"];
        },
        {
          name: "tokenProgram";
          isMut: false;
          isSigner: false;
          docs: ["#9"];
        },
        {
          name: "rent";
          isMut: false;
          isSigner: false;
          docs: ["#10"];
        },
      ];
      args: [
        {
          name: "params";
          type: {
            defined: "AddPoolPartTwoParams";
          };
        },
      ];
      returns: "u8";
    },
    {
      name: "removePool";
      accounts: [
        {
          name: "admin";
          isMut: false;
          isSigner: true;
          docs: ["#1"];
        },
        {
          name: "payer";
          isMut: true;
          isSigner: true;
          docs: ["#2"];
        },
        {
          name: "transferAuthority";
          isMut: true;
          isSigner: false;
          docs: ["#3"];
        },
        {
          name: "cortex";
          isMut: true;
          isSigner: false;
          docs: ["#4"];
        },
        {
          name: "pool";
          isMut: true;
          isSigner: false;
          docs: ["#5"];
        },
        {
          name: "systemProgram";
          isMut: false;
          isSigner: false;
          docs: ["#6"];
        },
      ];
      args: [];
      returns: "u8";
    },
    {
      name: "addCustody";
      accounts: [
        {
          name: "admin";
          isMut: false;
          isSigner: true;
          docs: ["#1"];
        },
        {
          name: "payer";
          isMut: true;
          isSigner: true;
          docs: ["#2"];
        },
        {
          name: "transferAuthority";
          isMut: false;
          isSigner: false;
          docs: ["#3"];
        },
        {
          name: "cortex";
          isMut: true;
          isSigner: false;
          docs: ["#4"];
        },
        {
          name: "pool";
          isMut: true;
          isSigner: false;
          docs: ["#5"];
        },
        {
          name: "custody";
          isMut: true;
          isSigner: false;
          docs: ["#6"];
        },
        {
          name: "custodyTokenAccount";
          isMut: true;
          isSigner: false;
          docs: ["#7"];
        },
        {
          name: "custodyOracle";
          isMut: false;
          isSigner: false;
          docs: ["#8"];
        },
        {
          name: "custodyTradeOracle";
          isMut: false;
          isSigner: false;
          docs: ["#9"];
        },
        {
          name: "custodyTokenMint";
          isMut: false;
          isSigner: false;
          docs: ["#10"];
        },
        {
          name: "systemProgram";
          isMut: false;
          isSigner: false;
          docs: ["#11"];
        },
        {
          name: "tokenProgram";
          isMut: false;
          isSigner: false;
          docs: ["#12"];
        },
        {
          name: "rent";
          isMut: false;
          isSigner: false;
          docs: ["#13"];
        },
      ];
      args: [
        {
          name: "params";
          type: {
            defined: "AddCustodyParams";
          };
        },
      ];
      returns: "u8";
    },
    {
      name: "removeCustody";
      accounts: [
        {
          name: "admin";
          isMut: false;
          isSigner: true;
          docs: ["#1"];
        },
        {
          name: "payer";
          isMut: true;
          isSigner: true;
          docs: ["#2"];
        },
        {
          name: "transferAuthority";
          isMut: true;
          isSigner: false;
          docs: ["#3"];
        },
        {
          name: "cortex";
          isMut: false;
          isSigner: false;
          docs: ["#4"];
        },
        {
          name: "pool";
          isMut: true;
          isSigner: false;
          docs: ["#5"];
        },
        {
          name: "custody";
          isMut: true;
          isSigner: false;
          docs: ["#6"];
        },
        {
          name: "custodyTokenAccount";
          isMut: true;
          isSigner: false;
          docs: ["#7"];
        },
        {
          name: "systemProgram";
          isMut: false;
          isSigner: false;
          docs: ["#8"];
        },
        {
          name: "tokenProgram";
          isMut: false;
          isSigner: false;
          docs: ["#9"];
        },
      ];
      args: [
        {
          name: "params";
          type: {
            defined: "RemoveCustodyParams";
          };
        },
      ];
      returns: "u8";
    },
    {
      name: "setCustodyConfig";
      accounts: [
        {
          name: "admin";
          isMut: false;
          isSigner: true;
          docs: ["#1"];
        },
        {
          name: "pool";
          isMut: true;
          isSigner: false;
          docs: ["#2"];
        },
        {
          name: "cortex";
          isMut: true;
          isSigner: false;
          docs: ["#3"];
        },
        {
          name: "custody";
          isMut: true;
          isSigner: false;
          docs: ["#4"];
        },
      ];
      args: [
        {
          name: "params";
          type: {
            defined: "SetCustodyConfigParams";
          };
        },
      ];
      returns: "u8";
    },
    {
      name: "setCustodyAllowSwap";
      accounts: [
        {
          name: "admin";
          isMut: false;
          isSigner: true;
          docs: ["#1"];
        },
        {
          name: "cortex";
          isMut: true;
          isSigner: false;
          docs: ["#2"];
        },
        {
          name: "pool";
          isMut: true;
          isSigner: false;
          docs: ["#3"];
        },
        {
          name: "custody";
          isMut: true;
          isSigner: false;
          docs: ["#4"];
        },
      ];
      args: [
        {
          name: "params";
          type: {
            defined: "SetCustodyAllowSwapParams";
          };
        },
      ];
    },
    {
      name: "setCustodyAllowTrade";
      accounts: [
        {
          name: "admin";
          isMut: false;
          isSigner: true;
          docs: ["#1"];
        },
        {
          name: "cortex";
          isMut: true;
          isSigner: false;
          docs: ["#2"];
        },
        {
          name: "pool";
          isMut: true;
          isSigner: false;
          docs: ["#3"];
        },
        {
          name: "custody";
          isMut: true;
          isSigner: false;
          docs: ["#4"];
        },
      ];
      args: [
        {
          name: "params";
          type: {
            defined: "SetCustodyAllowTradeParams";
          };
        },
      ];
    },
    {
      name: "setPoolAllowSwap";
      accounts: [
        {
          name: "admin";
          isMut: false;
          isSigner: true;
          docs: ["#1"];
        },
        {
          name: "cortex";
          isMut: true;
          isSigner: false;
          docs: ["#2"];
        },
        {
          name: "pool";
          isMut: true;
          isSigner: false;
          docs: ["#3"];
        },
      ];
      args: [
        {
          name: "params";
          type: {
            defined: "SetPoolAllowSwapParams";
          };
        },
      ];
    },
    {
      name: "setPoolAllowTrade";
      accounts: [
        {
          name: "admin";
          isMut: false;
          isSigner: true;
          docs: ["#1"];
        },
        {
          name: "cortex";
          isMut: true;
          isSigner: false;
          docs: ["#2"];
        },
        {
          name: "pool";
          isMut: true;
          isSigner: false;
          docs: ["#3"];
        },
      ];
      args: [
        {
          name: "params";
          type: {
            defined: "SetPoolAllowTradeParams";
          };
        },
      ];
    },
    {
      name: "setPoolAumSoftCapUsd";
      accounts: [
        {
          name: "admin";
          isMut: false;
          isSigner: true;
          docs: ["#1"];
        },
        {
          name: "cortex";
          isMut: true;
          isSigner: false;
          docs: ["#2"];
        },
        {
          name: "pool";
          isMut: true;
          isSigner: false;
          docs: ["#3"];
        },
      ];
      args: [
        {
          name: "params";
          type: {
            defined: "SetPoolAumSoftCapUsdParams";
          };
        },
      ];
    },
    {
      name: "swap";
      accounts: [
        {
          name: "caller";
          isMut: false;
          isSigner: true;
          docs: ["#1"];
        },
        {
          name: "owner";
          isMut: false;
          isSigner: true;
          docs: ["#2"];
        },
        {
          name: "fundingAccount";
          isMut: true;
          isSigner: false;
          docs: ["#3"];
        },
        {
          name: "receivingAccount";
          isMut: true;
          isSigner: false;
          docs: ["#4"];
        },
        {
          name: "transferAuthority";
          isMut: false;
          isSigner: false;
          docs: ["#5"];
        },
        {
          name: "cortex";
          isMut: true;
          isSigner: false;
          docs: ["#6"];
        },
        {
          name: "lmStaking";
          isMut: true;
          isSigner: false;
          docs: ["#7"];
        },
        {
          name: "lpStaking";
          isMut: true;
          isSigner: false;
          docs: ["#8"];
        },
        {
          name: "pool";
          isMut: true;
          isSigner: false;
          docs: ["#9"];
        },
        {
          name: "stakingRewardTokenCustody";
          isMut: true;
          isSigner: false;
          docs: ["#10"];
        },
        {
          name: "stakingRewardTokenCustodyOracle";
          isMut: false;
          isSigner: false;
          docs: ["#11"];
        },
        {
          name: "stakingRewardTokenCustodyTokenAccount";
          isMut: true;
          isSigner: false;
          docs: ["#12"];
        },
        {
          name: "receivingCustody";
          isMut: true;
          isSigner: false;
          docs: ["#13"];
        },
        {
          name: "receivingCustodyOracle";
          isMut: false;
          isSigner: false;
          docs: ["#14"];
        },
        {
          name: "receivingCustodyTokenAccount";
          isMut: true;
          isSigner: false;
          docs: ["#15"];
        },
        {
          name: "dispensingCustody";
          isMut: true;
          isSigner: false;
          docs: ["#16"];
        },
        {
          name: "dispensingCustodyOracle";
          isMut: false;
          isSigner: false;
          docs: ["#17"];
        },
        {
          name: "dispensingCustodyTokenAccount";
          isMut: true;
          isSigner: false;
          docs: ["#18"];
        },
        {
          name: "lmStakingRewardTokenVault";
          isMut: true;
          isSigner: false;
          docs: ["#19"];
        },
        {
          name: "lpStakingRewardTokenVault";
          isMut: true;
          isSigner: false;
          docs: ["#20"];
        },
        {
          name: "lpTokenMint";
          isMut: true;
          isSigner: false;
          docs: ["#21"];
        },
        {
          name: "protocolFeeRecipient";
          isMut: true;
          isSigner: false;
          docs: ["#22"];
        },
        {
          name: "userProfile";
          isMut: true;
          isSigner: false;
          isOptional: true;
          docs: ["#23"];
        },
        {
          name: "tokenProgram";
          isMut: false;
          isSigner: false;
          docs: ["#24"];
        },
        {
          name: "adrenaProgram";
          isMut: false;
          isSigner: false;
          docs: ["#25"];
        },
      ];
      args: [
        {
          name: "params";
          type: {
            defined: "SwapParams";
          };
        },
      ];
    },
    {
      name: "addLiquidity";
      accounts: [
        {
          name: "owner";
          isMut: true;
          isSigner: true;
          docs: ["#1"];
        },
        {
          name: "fundingAccount";
          isMut: true;
          isSigner: false;
          docs: ["#2"];
        },
        {
          name: "lpTokenAccount";
          isMut: true;
          isSigner: false;
          docs: [
            "#3 Front end will target the owner account, but not limited to",
          ];
        },
        {
          name: "transferAuthority";
          isMut: false;
          isSigner: false;
          docs: ["#4"];
        },
        {
          name: "lmStaking";
          isMut: true;
          isSigner: false;
          docs: ["#5"];
        },
        {
          name: "lpStaking";
          isMut: true;
          isSigner: false;
          docs: ["#6"];
        },
        {
          name: "cortex";
          isMut: true;
          isSigner: false;
          docs: ["#7"];
        },
        {
          name: "pool";
          isMut: true;
          isSigner: false;
          docs: ["#8"];
        },
        {
          name: "stakingRewardTokenCustody";
          isMut: true;
          isSigner: false;
          docs: ["#9"];
        },
        {
          name: "stakingRewardTokenCustodyOracle";
          isMut: false;
          isSigner: false;
          docs: ["#10"];
        },
        {
          name: "stakingRewardTokenCustodyTokenAccount";
          isMut: true;
          isSigner: false;
          docs: ["#11"];
        },
        {
          name: "custody";
          isMut: true;
          isSigner: false;
          docs: ["#12"];
        },
        {
          name: "custodyOracle";
          isMut: false;
          isSigner: false;
          docs: ["#13"];
        },
        {
          name: "custodyTokenAccount";
          isMut: true;
          isSigner: false;
          docs: ["#14"];
        },
        {
          name: "lmStakingRewardTokenVault";
          isMut: true;
          isSigner: false;
          docs: ["#15"];
        },
        {
          name: "lpStakingRewardTokenVault";
          isMut: true;
          isSigner: false;
          docs: ["#16"];
        },
        {
          name: "lmTokenMint";
          isMut: true;
          isSigner: false;
          docs: ["#17"];
        },
        {
          name: "lpTokenMint";
          isMut: true;
          isSigner: false;
          docs: ["#18"];
        },
        {
          name: "protocolFeeRecipient";
          isMut: true;
          isSigner: false;
          docs: ["#19"];
        },
        {
          name: "tokenProgram";
          isMut: false;
          isSigner: false;
          docs: ["#20"];
        },
        {
          name: "adrenaProgram";
          isMut: false;
          isSigner: false;
          docs: ["#21"];
        },
      ];
      args: [
        {
          name: "params";
          type: {
            defined: "AddLiquidityParams";
          };
        },
      ];
    },
    {
      name: "addGenesisLiquidity";
      accounts: [
        {
          name: "owner";
          isMut: true;
          isSigner: true;
          docs: ["#1"];
        },
        {
          name: "fundingAccount";
          isMut: true;
          isSigner: false;
          docs: ["#2"];
        },
        {
          name: "transferAuthority";
          isMut: false;
          isSigner: false;
          docs: ["#3"];
        },
        {
          name: "lpUserStaking";
          isMut: true;
          isSigner: false;
          docs: ["#4"];
        },
        {
          name: "lpStaking";
          isMut: true;
          isSigner: false;
          docs: ["#5"];
        },
        {
          name: "cortex";
          isMut: true;
          isSigner: false;
          docs: ["#6"];
        },
        {
          name: "pool";
          isMut: true;
          isSigner: false;
          docs: ["#7"];
        },
        {
          name: "lpStakingStakedTokenVault";
          isMut: true;
          isSigner: false;
          docs: ["#8"];
        },
        {
          name: "custody";
          isMut: true;
          isSigner: false;
          docs: ["#9"];
        },
        {
          name: "custodyOracle";
          isMut: false;
          isSigner: false;
          docs: ["#10"];
        },
        {
          name: "custodyTokenAccount";
          isMut: true;
          isSigner: false;
          docs: ["#11"];
        },
        {
          name: "lmTokenMint";
          isMut: true;
          isSigner: false;
          docs: ["#12"];
        },
        {
          name: "lpTokenMint";
          isMut: true;
          isSigner: false;
          docs: ["#13"];
        },
        {
          name: "governanceTokenMint";
          isMut: true;
          isSigner: false;
          docs: ["#14"];
        },
        {
          name: "governanceRealm";
          isMut: false;
          isSigner: false;
          docs: [
            "#15",
            "A realm represent one project within the governance program",
          ];
        },
        {
          name: "governanceRealmConfig";
          isMut: false;
          isSigner: false;
          docs: ["#16"];
        },
        {
          name: "governanceGoverningTokenHolding";
          isMut: true;
          isSigner: false;
          docs: [
            "#17",
            "Token account owned by governance program holding user's locked tokens",
          ];
        },
        {
          name: "governanceGoverningTokenOwnerRecord";
          isMut: true;
          isSigner: false;
          docs: ["#18", "Account owned by governance storing user information"];
        },
        {
          name: "governanceProgram";
          isMut: false;
          isSigner: false;
          docs: ["#19"];
        },
        {
          name: "systemProgram";
          isMut: false;
          isSigner: false;
          docs: ["#20"];
        },
        {
          name: "tokenProgram";
          isMut: false;
          isSigner: false;
          docs: ["#21"];
        },
        {
          name: "adrenaProgram";
          isMut: false;
          isSigner: false;
          docs: ["#22"];
        },
        {
          name: "genesisLock";
          isMut: true;
          isSigner: false;
          docs: ["#23"];
        },
      ];
      args: [
        {
          name: "params";
          type: {
            defined: "AddGenesisLiquidityParams";
          };
        },
      ];
    },
    {
      name: "genesisOtcOut";
      accounts: [
        {
          name: "admin";
          isMut: false;
          isSigner: true;
          docs: ["#1"];
        },
        {
          name: "payer";
          isMut: true;
          isSigner: true;
          docs: ["#2"];
        },
        {
          name: "daoReceivingAccount";
          isMut: true;
          isSigner: false;
          docs: ["#3"];
        },
        {
          name: "transferAuthority";
          isMut: false;
          isSigner: false;
          docs: ["#4"];
        },
        {
          name: "cortex";
          isMut: false;
          isSigner: false;
          docs: ["#5"];
        },
        {
          name: "pool";
          isMut: false;
          isSigner: false;
          docs: ["#6"];
        },
        {
          name: "custodyUsdc";
          isMut: true;
          isSigner: false;
          docs: ["#7"];
        },
        {
          name: "custodyUsdcTokenAccount";
          isMut: true;
          isSigner: false;
          docs: ["#8"];
        },
        {
          name: "genesisLock";
          isMut: true;
          isSigner: false;
          docs: ["#9"];
        },
        {
          name: "tokenProgram";
          isMut: false;
          isSigner: false;
          docs: ["#10"];
        },
      ];
      args: [];
    },
    {
      name: "genesisOtcIn";
      accounts: [
        {
          name: "admin";
          isMut: false;
          isSigner: true;
          docs: ["#1"];
        },
        {
          name: "payer";
          isMut: true;
          isSigner: true;
          docs: ["#2"];
        },
        {
          name: "fundingAccountOne";
          isMut: true;
          isSigner: false;
          docs: ["#3"];
        },
        {
          name: "fundingAccountTwo";
          isMut: true;
          isSigner: false;
          docs: ["#4"];
        },
        {
          name: "fundingAccountThree";
          isMut: true;
          isSigner: false;
          docs: ["#5"];
        },
        {
          name: "cortex";
          isMut: false;
          isSigner: false;
          docs: ["#6"];
        },
        {
          name: "pool";
          isMut: false;
          isSigner: false;
          docs: ["#7"];
        },
        {
          name: "custodyOne";
          isMut: true;
          isSigner: false;
          docs: ["#8"];
        },
        {
          name: "custodyOneTokenAccount";
          isMut: true;
          isSigner: false;
          docs: ["#9"];
        },
        {
          name: "custodyTwo";
          isMut: true;
          isSigner: false;
          docs: ["#10"];
        },
        {
          name: "custodyTwoTokenAccount";
          isMut: true;
          isSigner: false;
          docs: ["#11"];
        },
        {
          name: "custodyThree";
          isMut: true;
          isSigner: false;
          docs: ["#12"];
        },
        {
          name: "custodyThreeTokenAccount";
          isMut: true;
          isSigner: false;
          docs: ["#13"];
        },
        {
          name: "genesisLock";
          isMut: true;
          isSigner: false;
          docs: ["#14"];
        },
        {
          name: "systemProgram";
          isMut: false;
          isSigner: false;
          docs: ["#15"];
        },
        {
          name: "tokenProgram";
          isMut: false;
          isSigner: false;
          docs: ["#16"];
        },
      ];
      args: [
        {
          name: "params";
          type: {
            defined: "GenesisOtcInParams";
          };
        },
      ];
    },
    {
      name: "removeLiquidity";
      accounts: [
        {
          name: "owner";
          isMut: true;
          isSigner: true;
          docs: ["#1"];
        },
        {
          name: "receivingAccount";
          isMut: true;
          isSigner: false;
          docs: [
            "#2 Front end will target the owner account, but not limited to",
          ];
        },
        {
          name: "lpTokenAccount";
          isMut: true;
          isSigner: false;
          docs: ["#3"];
        },
        {
          name: "transferAuthority";
          isMut: false;
          isSigner: false;
          docs: ["#4"];
        },
        {
          name: "lmStaking";
          isMut: true;
          isSigner: false;
          docs: ["#5"];
        },
        {
          name: "lpStaking";
          isMut: true;
          isSigner: false;
          docs: ["#6"];
        },
        {
          name: "cortex";
          isMut: true;
          isSigner: false;
          docs: ["#7"];
        },
        {
          name: "pool";
          isMut: true;
          isSigner: false;
          docs: ["#8"];
        },
        {
          name: "stakingRewardTokenCustody";
          isMut: true;
          isSigner: false;
          docs: ["#9"];
        },
        {
          name: "stakingRewardTokenCustodyOracle";
          isMut: false;
          isSigner: false;
          docs: ["#10"];
        },
        {
          name: "stakingRewardTokenCustodyTokenAccount";
          isMut: true;
          isSigner: false;
          docs: ["#11"];
        },
        {
          name: "custody";
          isMut: true;
          isSigner: false;
          docs: ["#12"];
        },
        {
          name: "custodyOracle";
          isMut: false;
          isSigner: false;
          docs: ["#13"];
        },
        {
          name: "custodyTokenAccount";
          isMut: true;
          isSigner: false;
          docs: ["#14"];
        },
        {
          name: "lmStakingRewardTokenVault";
          isMut: true;
          isSigner: false;
          docs: ["#15"];
        },
        {
          name: "lpStakingRewardTokenVault";
          isMut: true;
          isSigner: false;
          docs: ["#16"];
        },
        {
          name: "lpTokenMint";
          isMut: true;
          isSigner: false;
          docs: ["#17"];
        },
        {
          name: "protocolFeeRecipient";
          isMut: true;
          isSigner: false;
          docs: ["#18"];
        },
        {
          name: "tokenProgram";
          isMut: false;
          isSigner: false;
          docs: ["#19"];
        },
        {
          name: "adrenaProgram";
          isMut: false;
          isSigner: false;
          docs: ["#20"];
        },
      ];
      args: [
        {
          name: "params";
          type: {
            defined: "RemoveLiquidityParams";
          };
        },
      ];
    },
    {
      name: "openPositionLong";
      accounts: [
        {
          name: "owner";
          isMut: false;
          isSigner: true;
          docs: ["#1"];
        },
        {
          name: "payer";
          isMut: true;
          isSigner: true;
          docs: ["#2"];
        },
        {
          name: "fundingAccount";
          isMut: true;
          isSigner: false;
          docs: ["#3"];
        },
        {
          name: "transferAuthority";
          isMut: false;
          isSigner: false;
          docs: ["#4"];
        },
        {
          name: "cortex";
          isMut: true;
          isSigner: false;
          docs: ["#5"];
        },
        {
          name: "pool";
          isMut: true;
          isSigner: false;
          docs: ["#6"];
        },
        {
          name: "position";
          isMut: true;
          isSigner: false;
          docs: ["#7"];
        },
        {
          name: "custody";
          isMut: true;
          isSigner: false;
          docs: ["#8"];
        },
        {
          name: "custodyOracle";
          isMut: false;
          isSigner: false;
          docs: ["#9"];
        },
        {
          name: "custodyTradeOracle";
          isMut: false;
          isSigner: false;
          docs: ["#10"];
        },
        {
          name: "custodyTokenAccount";
          isMut: true;
          isSigner: false;
          docs: ["#11"];
        },
        {
          name: "userProfile";
          isMut: true;
          isSigner: false;
          isOptional: true;
          docs: ["#12"];
        },
        {
          name: "systemProgram";
          isMut: false;
          isSigner: false;
          docs: ["#13"];
        },
        {
          name: "tokenProgram";
          isMut: false;
          isSigner: false;
          docs: ["#14"];
        },
        {
          name: "adrenaProgram";
          isMut: false;
          isSigner: false;
          docs: ["#15"];
        },
      ];
      args: [
        {
          name: "params";
          type: {
            defined: "OpenPositionLongParams";
          };
        },
      ];
    },
    {
      name: "openPositionShort";
      accounts: [
        {
          name: "owner";
          isMut: false;
          isSigner: true;
          docs: ["#1"];
        },
        {
          name: "payer";
          isMut: true;
          isSigner: true;
          docs: ["#2"];
        },
        {
          name: "fundingAccount";
          isMut: true;
          isSigner: false;
          docs: ["#3"];
        },
        {
          name: "transferAuthority";
          isMut: false;
          isSigner: false;
          docs: ["#4"];
        },
        {
          name: "cortex";
          isMut: true;
          isSigner: false;
          docs: ["#5"];
        },
        {
          name: "pool";
          isMut: true;
          isSigner: false;
          docs: ["#6"];
        },
        {
          name: "position";
          isMut: true;
          isSigner: false;
          docs: ["#7"];
        },
        {
          name: "custody";
          isMut: true;
          isSigner: false;
          docs: ["#8"];
        },
        {
          name: "custodyTradeOracle";
          isMut: false;
          isSigner: false;
          docs: ["#9"];
        },
        {
          name: "collateralCustody";
          isMut: true;
          isSigner: false;
          docs: ["#10"];
        },
        {
          name: "collateralCustodyOracle";
          isMut: false;
          isSigner: false;
          docs: ["#11"];
        },
        {
          name: "collateralCustodyTokenAccount";
          isMut: true;
          isSigner: false;
          docs: ["#12"];
        },
        {
          name: "userProfile";
          isMut: true;
          isSigner: false;
          isOptional: true;
          docs: ["#13"];
        },
        {
          name: "systemProgram";
          isMut: false;
          isSigner: false;
          docs: ["#14"];
        },
        {
          name: "tokenProgram";
          isMut: false;
          isSigner: false;
          docs: ["#15"];
        },
        {
          name: "adrenaProgram";
          isMut: false;
          isSigner: false;
          docs: ["#16"];
        },
      ];
      args: [
        {
          name: "params";
          type: {
            defined: "OpenPositionShortParams";
          };
        },
      ];
    },
    {
      name: "openOrIncreasePositionWithSwapLong";
      accounts: [
        {
          name: "owner";
          isMut: false;
          isSigner: true;
          docs: ["#1"];
        },
        {
          name: "payer";
          isMut: true;
          isSigner: true;
          docs: ["#2"];
        },
        {
          name: "fundingAccount";
          isMut: true;
          isSigner: false;
          docs: ["#3"];
        },
        {
          name: "collateralAccount";
          isMut: true;
          isSigner: false;
          docs: ["#4"];
        },
        {
          name: "receivingCustody";
          isMut: true;
          isSigner: false;
          docs: ["#5"];
        },
        {
          name: "receivingCustodyOracle";
          isMut: false;
          isSigner: false;
          docs: ["#6"];
        },
        {
          name: "receivingCustodyTokenAccount";
          isMut: true;
          isSigner: false;
          docs: ["#7"];
        },
        {
          name: "principalCustody";
          isMut: true;
          isSigner: false;
          docs: ["#8"];
        },
        {
          name: "principalCustodyOracle";
          isMut: false;
          isSigner: false;
          docs: ["#9"];
        },
        {
          name: "principalCustodyTradeOracle";
          isMut: false;
          isSigner: false;
          docs: ["#10"];
        },
        {
          name: "principalCustodyTokenAccount";
          isMut: true;
          isSigner: false;
          docs: ["#11"];
        },
        {
          name: "transferAuthority";
          isMut: false;
          isSigner: false;
          docs: ["#12"];
        },
        {
          name: "cortex";
          isMut: true;
          isSigner: false;
          docs: ["#13"];
        },
        {
          name: "lmStaking";
          isMut: true;
          isSigner: false;
          docs: ["#14"];
        },
        {
          name: "lpStaking";
          isMut: true;
          isSigner: false;
          docs: ["#15"];
        },
        {
          name: "pool";
          isMut: true;
          isSigner: false;
          docs: ["#16"];
        },
        {
          name: "position";
          isMut: true;
          isSigner: false;
          docs: ["#17"];
        },
        {
          name: "stakingRewardTokenCustody";
          isMut: true;
          isSigner: false;
          docs: ["#18"];
        },
        {
          name: "stakingRewardTokenCustodyOracle";
          isMut: false;
          isSigner: false;
          docs: ["#19"];
        },
        {
          name: "stakingRewardTokenCustodyTokenAccount";
          isMut: true;
          isSigner: false;
          docs: ["#20"];
        },
        {
          name: "lmStakingRewardTokenVault";
          isMut: true;
          isSigner: false;
          docs: ["#21"];
        },
        {
          name: "lpStakingRewardTokenVault";
          isMut: true;
          isSigner: false;
          docs: ["#22"];
        },
        {
          name: "lpTokenMint";
          isMut: true;
          isSigner: false;
          docs: ["#23"];
        },
        {
          name: "protocolFeeRecipient";
          isMut: true;
          isSigner: false;
          docs: ["#24"];
        },
        {
          name: "userProfile";
          isMut: true;
          isSigner: false;
          isOptional: true;
          docs: ["#25"];
        },
        {
          name: "systemProgram";
          isMut: false;
          isSigner: false;
          docs: ["#26"];
        },
        {
          name: "tokenProgram";
          isMut: false;
          isSigner: false;
          docs: ["#27"];
        },
        {
          name: "adrenaProgram";
          isMut: false;
          isSigner: false;
          docs: ["#28"];
        },
      ];
      args: [
        {
          name: "params";
          type: {
            defined: "OpenPositionWithSwapParams";
          };
        },
      ];
    },
    {
      name: "openOrIncreasePositionWithSwapShort";
      accounts: [
        {
          name: "owner";
          isMut: false;
          isSigner: true;
          docs: ["#1"];
        },
        {
          name: "payer";
          isMut: true;
          isSigner: true;
          docs: ["#2"];
        },
        {
          name: "fundingAccount";
          isMut: true;
          isSigner: false;
          docs: ["#3"];
        },
        {
          name: "collateralAccount";
          isMut: true;
          isSigner: false;
          docs: ["#4"];
        },
        {
          name: "receivingCustody";
          isMut: true;
          isSigner: false;
          docs: ["#5"];
        },
        {
          name: "receivingCustodyOracle";
          isMut: false;
          isSigner: false;
          docs: ["#6"];
        },
        {
          name: "receivingCustodyTokenAccount";
          isMut: true;
          isSigner: false;
          docs: ["#7"];
        },
        {
          name: "collateralCustody";
          isMut: true;
          isSigner: false;
          docs: ["#8"];
        },
        {
          name: "collateralCustodyOracle";
          isMut: false;
          isSigner: false;
          docs: ["#9"];
        },
        {
          name: "collateralCustodyTokenAccount";
          isMut: true;
          isSigner: false;
          docs: ["#10"];
        },
        {
          name: "principalCustody";
          isMut: true;
          isSigner: false;
          docs: ["#11"];
        },
        {
          name: "principalCustodyTradeOracle";
          isMut: false;
          isSigner: false;
          docs: ["#12"];
        },
        {
          name: "principalCustodyTokenAccount";
          isMut: true;
          isSigner: false;
          docs: ["#13"];
        },
        {
          name: "transferAuthority";
          isMut: false;
          isSigner: false;
          docs: ["#14"];
        },
        {
          name: "cortex";
          isMut: true;
          isSigner: false;
          docs: ["#15"];
        },
        {
          name: "lmStaking";
          isMut: true;
          isSigner: false;
          docs: ["#16"];
        },
        {
          name: "lpStaking";
          isMut: true;
          isSigner: false;
          docs: ["#17"];
        },
        {
          name: "pool";
          isMut: true;
          isSigner: false;
          docs: ["#18"];
        },
        {
          name: "position";
          isMut: true;
          isSigner: false;
          docs: ["#19"];
        },
        {
          name: "stakingRewardTokenCustody";
          isMut: true;
          isSigner: false;
          docs: ["#20"];
        },
        {
          name: "stakingRewardTokenCustodyOracle";
          isMut: false;
          isSigner: false;
          docs: ["#21"];
        },
        {
          name: "stakingRewardTokenCustodyTokenAccount";
          isMut: true;
          isSigner: false;
          docs: ["#22"];
        },
        {
          name: "lmStakingRewardTokenVault";
          isMut: true;
          isSigner: false;
          docs: ["#23"];
        },
        {
          name: "lpStakingRewardTokenVault";
          isMut: true;
          isSigner: false;
          docs: ["#24"];
        },
        {
          name: "lpTokenMint";
          isMut: true;
          isSigner: false;
          docs: ["#25"];
        },
        {
          name: "protocolFeeRecipient";
          isMut: true;
          isSigner: false;
          docs: ["#26"];
        },
        {
          name: "userProfile";
          isMut: true;
          isSigner: false;
          isOptional: true;
          docs: ["#27"];
        },
        {
          name: "systemProgram";
          isMut: false;
          isSigner: false;
          docs: ["#28"];
        },
        {
          name: "tokenProgram";
          isMut: false;
          isSigner: false;
          docs: ["#29"];
        },
        {
          name: "adrenaProgram";
          isMut: false;
          isSigner: false;
          docs: ["#30"];
        },
      ];
      args: [
        {
          name: "params";
          type: {
            defined: "OpenPositionWithSwapParams";
          };
        },
      ];
    },
    {
      name: "addCollateralLong";
      accounts: [
        {
          name: "owner";
          isMut: true;
          isSigner: true;
          docs: ["#1"];
        },
        {
          name: "fundingAccount";
          isMut: true;
          isSigner: false;
          docs: ["#2"];
        },
        {
          name: "transferAuthority";
          isMut: false;
          isSigner: false;
          docs: ["#3"];
        },
        {
          name: "cortex";
          isMut: true;
          isSigner: false;
          docs: ["#4"];
        },
        {
          name: "pool";
          isMut: true;
          isSigner: false;
          docs: ["#5"];
        },
        {
          name: "position";
          isMut: true;
          isSigner: false;
          docs: ["#6"];
        },
        {
          name: "custody";
          isMut: true;
          isSigner: false;
          docs: ["#7"];
        },
        {
          name: "custodyOracle";
          isMut: false;
          isSigner: false;
          docs: ["#8"];
        },
        {
          name: "custodyTradeOracle";
          isMut: false;
          isSigner: false;
          docs: ["#9"];
        },
        {
          name: "custodyTokenAccount";
          isMut: true;
          isSigner: false;
          docs: ["#10"];
        },
        {
          name: "tokenProgram";
          isMut: false;
          isSigner: false;
          docs: ["#11"];
        },
        {
          name: "adrenaProgram";
          isMut: false;
          isSigner: false;
          docs: ["#12"];
        },
      ];
      args: [
        {
          name: "params";
          type: {
            defined: "AddCollateralLongParams";
          };
        },
      ];
    },
    {
      name: "addCollateralShort";
      accounts: [
        {
          name: "owner";
          isMut: true;
          isSigner: true;
          docs: ["#1"];
        },
        {
          name: "fundingAccount";
          isMut: true;
          isSigner: false;
          docs: ["#2"];
        },
        {
          name: "transferAuthority";
          isMut: false;
          isSigner: false;
          docs: ["#3"];
        },
        {
          name: "cortex";
          isMut: true;
          isSigner: false;
          docs: ["#4"];
        },
        {
          name: "pool";
          isMut: true;
          isSigner: false;
          docs: ["#5"];
        },
        {
          name: "position";
          isMut: true;
          isSigner: false;
          docs: ["#6"];
        },
        {
          name: "custody";
          isMut: true;
          isSigner: false;
          docs: ["#7"];
        },
        {
          name: "custodyTradeOracle";
          isMut: false;
          isSigner: false;
          docs: ["#8"];
        },
        {
          name: "collateralCustody";
          isMut: true;
          isSigner: false;
          docs: ["#9"];
        },
        {
          name: "collateralCustodyOracle";
          isMut: false;
          isSigner: false;
          docs: ["#10"];
        },
        {
          name: "collateralCustodyTokenAccount";
          isMut: true;
          isSigner: false;
          docs: ["#11"];
        },
        {
          name: "tokenProgram";
          isMut: false;
          isSigner: false;
          docs: ["#12"];
        },
        {
          name: "adrenaProgram";
          isMut: false;
          isSigner: false;
          docs: ["#13"];
        },
      ];
      args: [
        {
          name: "params";
          type: {
            defined: "AddCollateralShortParams";
          };
        },
      ];
    },
    {
      name: "removeCollateralLong";
      accounts: [
        {
          name: "owner";
          isMut: true;
          isSigner: true;
          docs: ["#1"];
        },
        {
          name: "receivingAccount";
          isMut: true;
          isSigner: false;
          docs: ["#2"];
        },
        {
          name: "transferAuthority";
          isMut: false;
          isSigner: false;
          docs: ["#3"];
        },
        {
          name: "cortex";
          isMut: true;
          isSigner: false;
          docs: ["#4"];
        },
        {
          name: "pool";
          isMut: true;
          isSigner: false;
          docs: ["#5"];
        },
        {
          name: "position";
          isMut: true;
          isSigner: false;
          docs: ["#6"];
        },
        {
          name: "custody";
          isMut: true;
          isSigner: false;
          docs: ["#7"];
        },
        {
          name: "custodyOracle";
          isMut: false;
          isSigner: false;
          docs: ["#8"];
        },
        {
          name: "custodyTradeOracle";
          isMut: false;
          isSigner: false;
          docs: ["#9"];
        },
        {
          name: "custodyTokenAccount";
          isMut: true;
          isSigner: false;
          docs: ["#10"];
        },
        {
          name: "adrenaProgram";
          isMut: false;
          isSigner: false;
          docs: ["#11"];
        },
        {
          name: "tokenProgram";
          isMut: false;
          isSigner: false;
          docs: ["#12"];
        },
      ];
      args: [
        {
          name: "params";
          type: {
            defined: "RemoveCollateralLongParams";
          };
        },
      ];
    },
    {
      name: "removeCollateralShort";
      accounts: [
        {
          name: "owner";
          isMut: true;
          isSigner: true;
          docs: ["#1"];
        },
        {
          name: "receivingAccount";
          isMut: true;
          isSigner: false;
          docs: ["#2"];
        },
        {
          name: "transferAuthority";
          isMut: false;
          isSigner: false;
          docs: ["#3"];
        },
        {
          name: "cortex";
          isMut: true;
          isSigner: false;
          docs: ["#4"];
        },
        {
          name: "pool";
          isMut: true;
          isSigner: false;
          docs: ["#5"];
        },
        {
          name: "position";
          isMut: true;
          isSigner: false;
          docs: ["#6"];
        },
        {
          name: "custody";
          isMut: true;
          isSigner: false;
          docs: ["#7"];
        },
        {
          name: "custodyTradeOracle";
          isMut: false;
          isSigner: false;
          docs: ["#8"];
        },
        {
          name: "collateralCustody";
          isMut: true;
          isSigner: false;
          docs: ["#9"];
        },
        {
          name: "collateralCustodyOracle";
          isMut: false;
          isSigner: false;
          docs: ["#10"];
        },
        {
          name: "collateralCustodyTokenAccount";
          isMut: true;
          isSigner: false;
          docs: ["#11"];
        },
        {
          name: "adrenaProgram";
          isMut: false;
          isSigner: false;
          docs: ["#12"];
        },
        {
          name: "tokenProgram";
          isMut: false;
          isSigner: false;
          docs: ["#13"];
        },
      ];
      args: [
        {
          name: "params";
          type: {
            defined: "RemoveCollateralShortParams";
          };
        },
      ];
    },
    {
      name: "closePositionLong";
      accounts: [
        {
          name: "caller";
          isMut: true;
          isSigner: true;
          docs: ["#1"];
        },
        {
          name: "owner";
          isMut: true;
          isSigner: false;
          docs: ["#2"];
        },
        {
          name: "receivingAccount";
          isMut: true;
          isSigner: false;
          docs: ["#3"];
        },
        {
          name: "transferAuthority";
          isMut: false;
          isSigner: false;
          docs: ["#4"];
        },
        {
          name: "lmStaking";
          isMut: true;
          isSigner: false;
          docs: ["#5"];
        },
        {
          name: "lpStaking";
          isMut: true;
          isSigner: false;
          docs: ["#6"];
        },
        {
          name: "cortex";
          isMut: true;
          isSigner: false;
          docs: ["#7"];
        },
        {
          name: "pool";
          isMut: true;
          isSigner: false;
          docs: ["#8"];
        },
        {
          name: "position";
          isMut: true;
          isSigner: false;
          docs: ["#9"];
        },
        {
          name: "stakingRewardTokenCustody";
          isMut: true;
          isSigner: false;
          docs: ["#10"];
        },
        {
          name: "stakingRewardTokenCustodyOracle";
          isMut: false;
          isSigner: false;
          docs: ["#11"];
        },
        {
          name: "stakingRewardTokenCustodyTokenAccount";
          isMut: true;
          isSigner: false;
          docs: ["#12"];
        },
        {
          name: "custody";
          isMut: true;
          isSigner: false;
          docs: ["#13"];
        },
        {
          name: "custodyOracle";
          isMut: false;
          isSigner: false;
          docs: ["#14"];
        },
        {
          name: "custodyTradeOracle";
          isMut: false;
          isSigner: false;
          docs: ["#15"];
        },
        {
          name: "custodyTokenAccount";
          isMut: true;
          isSigner: false;
          docs: ["#16"];
        },
        {
          name: "lmStakingRewardTokenVault";
          isMut: true;
          isSigner: false;
          docs: ["#17"];
        },
        {
          name: "lpStakingRewardTokenVault";
          isMut: true;
          isSigner: false;
          docs: ["#18"];
        },
        {
          name: "lpTokenMint";
          isMut: true;
          isSigner: false;
          docs: ["#19"];
        },
        {
          name: "protocolFeeRecipient";
          isMut: true;
          isSigner: false;
          docs: ["#20"];
        },
        {
          name: "userProfile";
          isMut: true;
          isSigner: false;
          isOptional: true;
          docs: ["#21"];
        },
        {
          name: "tokenProgram";
          isMut: false;
          isSigner: false;
          docs: ["#22"];
        },
        {
          name: "adrenaProgram";
          isMut: false;
          isSigner: false;
          docs: ["#23"];
        },
      ];
      args: [
        {
          name: "params";
          type: {
            defined: "ClosePositionLongParams";
          };
        },
      ];
    },
    {
      name: "closePositionShort";
      accounts: [
        {
          name: "caller";
          isMut: true;
          isSigner: true;
          docs: ["#1"];
        },
        {
          name: "owner";
          isMut: true;
          isSigner: false;
          docs: ["#2"];
        },
        {
          name: "receivingAccount";
          isMut: true;
          isSigner: false;
          docs: ["#3"];
        },
        {
          name: "transferAuthority";
          isMut: false;
          isSigner: false;
          docs: ["#4"];
        },
        {
          name: "lmStaking";
          isMut: true;
          isSigner: false;
          docs: ["#5"];
        },
        {
          name: "lpStaking";
          isMut: true;
          isSigner: false;
          docs: ["#6"];
        },
        {
          name: "cortex";
          isMut: true;
          isSigner: false;
          docs: ["#7"];
        },
        {
          name: "pool";
          isMut: true;
          isSigner: false;
          docs: ["#8"];
        },
        {
          name: "position";
          isMut: true;
          isSigner: false;
          docs: ["#9"];
        },
        {
          name: "stakingRewardTokenCustody";
          isMut: true;
          isSigner: false;
          docs: ["#10"];
        },
        {
          name: "stakingRewardTokenCustodyOracle";
          isMut: false;
          isSigner: false;
          docs: ["#11"];
        },
        {
          name: "stakingRewardTokenCustodyTokenAccount";
          isMut: true;
          isSigner: false;
          docs: ["#12"];
        },
        {
          name: "custody";
          isMut: true;
          isSigner: false;
          docs: ["#13"];
        },
        {
          name: "custodyTradeOracle";
          isMut: false;
          isSigner: false;
          docs: ["#14"];
        },
        {
          name: "collateralCustody";
          isMut: true;
          isSigner: false;
          docs: ["#15"];
        },
        {
          name: "collateralCustodyOracle";
          isMut: false;
          isSigner: false;
          docs: ["#16"];
        },
        {
          name: "collateralCustodyTokenAccount";
          isMut: true;
          isSigner: false;
          docs: ["#17"];
        },
        {
          name: "lmStakingRewardTokenVault";
          isMut: true;
          isSigner: false;
          docs: ["#18"];
        },
        {
          name: "lpStakingRewardTokenVault";
          isMut: true;
          isSigner: false;
          docs: ["#19"];
        },
        {
          name: "lpTokenMint";
          isMut: true;
          isSigner: false;
          docs: ["#20"];
        },
        {
          name: "protocolFeeRecipient";
          isMut: true;
          isSigner: false;
          docs: ["#21"];
        },
        {
          name: "userProfile";
          isMut: true;
          isSigner: false;
          isOptional: true;
          docs: ["#22"];
        },
        {
          name: "tokenProgram";
          isMut: false;
          isSigner: false;
          docs: ["#23"];
        },
        {
          name: "adrenaProgram";
          isMut: false;
          isSigner: false;
          docs: ["#24"];
        },
      ];
      args: [
        {
          name: "params";
          type: {
            defined: "ClosePositionShortParams";
          };
        },
      ];
    },
    {
      name: "liquidateLong";
      accounts: [
        {
          name: "signer";
          isMut: true;
          isSigner: true;
          docs: ["#1"];
        },
        {
          name: "receivingAccount";
          isMut: true;
          isSigner: false;
          docs: ["#2"];
        },
        {
          name: "transferAuthority";
          isMut: false;
          isSigner: false;
          docs: ["#3"];
        },
        {
          name: "lmStaking";
          isMut: true;
          isSigner: false;
          docs: ["#4"];
        },
        {
          name: "lpStaking";
          isMut: true;
          isSigner: false;
          docs: ["#5"];
        },
        {
          name: "cortex";
          isMut: true;
          isSigner: false;
          docs: ["#6"];
        },
        {
          name: "pool";
          isMut: true;
          isSigner: false;
          docs: ["#7"];
        },
        {
          name: "position";
          isMut: true;
          isSigner: false;
          docs: ["#8"];
        },
        {
          name: "stakingRewardTokenCustody";
          isMut: true;
          isSigner: false;
          docs: ["#9"];
        },
        {
          name: "stakingRewardTokenCustodyOracle";
          isMut: false;
          isSigner: false;
          docs: ["#10"];
        },
        {
          name: "stakingRewardTokenCustodyTokenAccount";
          isMut: true;
          isSigner: false;
          docs: ["#11"];
        },
        {
          name: "custody";
          isMut: true;
          isSigner: false;
          docs: ["#12"];
        },
        {
          name: "custodyOracle";
          isMut: false;
          isSigner: false;
          docs: ["#13"];
        },
        {
          name: "custodyTradeOracle";
          isMut: false;
          isSigner: false;
          docs: ["#14"];
        },
        {
          name: "custodyTokenAccount";
          isMut: true;
          isSigner: false;
          docs: ["#15"];
        },
        {
          name: "lmStakingRewardTokenVault";
          isMut: true;
          isSigner: false;
          docs: ["#16"];
        },
        {
          name: "lpStakingRewardTokenVault";
          isMut: true;
          isSigner: false;
          docs: ["#17"];
        },
        {
          name: "lpTokenMint";
          isMut: true;
          isSigner: false;
          docs: ["#18"];
        },
        {
          name: "protocolFeeRecipient";
          isMut: true;
          isSigner: false;
          docs: ["#19"];
        },
        {
          name: "userProfile";
          isMut: true;
          isSigner: false;
          isOptional: true;
          docs: ["#20"];
        },
        {
          name: "tokenProgram";
          isMut: false;
          isSigner: false;
          docs: ["#21"];
        },
        {
          name: "adrenaProgram";
          isMut: false;
          isSigner: false;
          docs: ["#22"];
        },
      ];
      args: [
        {
          name: "params";
          type: {
            defined: "LiquidateLongParams";
          };
        },
      ];
    },
    {
      name: "liquidateShort";
      accounts: [
        {
          name: "signer";
          isMut: true;
          isSigner: true;
          docs: ["#1"];
        },
        {
          name: "receivingAccount";
          isMut: true;
          isSigner: false;
          docs: ["#2"];
        },
        {
          name: "transferAuthority";
          isMut: false;
          isSigner: false;
          docs: ["#3"];
        },
        {
          name: "lmStaking";
          isMut: true;
          isSigner: false;
          docs: ["#4"];
        },
        {
          name: "lpStaking";
          isMut: true;
          isSigner: false;
          docs: ["#5"];
        },
        {
          name: "cortex";
          isMut: true;
          isSigner: false;
          docs: ["#6"];
        },
        {
          name: "pool";
          isMut: true;
          isSigner: false;
          docs: ["#7"];
        },
        {
          name: "position";
          isMut: true;
          isSigner: false;
          docs: ["#8"];
        },
        {
          name: "stakingRewardTokenCustody";
          isMut: true;
          isSigner: false;
          docs: ["#9"];
        },
        {
          name: "stakingRewardTokenCustodyOracle";
          isMut: false;
          isSigner: false;
          docs: ["#10"];
        },
        {
          name: "stakingRewardTokenCustodyTokenAccount";
          isMut: true;
          isSigner: false;
          docs: ["#11"];
        },
        {
          name: "custody";
          isMut: true;
          isSigner: false;
          docs: ["#12"];
        },
        {
          name: "custodyTradeOracle";
          isMut: false;
          isSigner: false;
          docs: ["#13"];
        },
        {
          name: "collateralCustody";
          isMut: true;
          isSigner: false;
          docs: ["#14"];
        },
        {
          name: "collateralCustodyOracle";
          isMut: false;
          isSigner: false;
          docs: ["#15"];
        },
        {
          name: "collateralCustodyTokenAccount";
          isMut: true;
          isSigner: false;
          docs: ["#16"];
        },
        {
          name: "lmStakingRewardTokenVault";
          isMut: true;
          isSigner: false;
          docs: ["#17"];
        },
        {
          name: "lpStakingRewardTokenVault";
          isMut: true;
          isSigner: false;
          docs: ["#18"];
        },
        {
          name: "lpTokenMint";
          isMut: true;
          isSigner: false;
          docs: ["#19"];
        },
        {
          name: "protocolFeeRecipient";
          isMut: true;
          isSigner: false;
          docs: ["#20"];
        },
        {
          name: "userProfile";
          isMut: true;
          isSigner: false;
          isOptional: true;
          docs: ["#21"];
        },
        {
          name: "tokenProgram";
          isMut: false;
          isSigner: false;
          docs: ["#22"];
        },
        {
          name: "adrenaProgram";
          isMut: false;
          isSigner: false;
          docs: ["#23"];
        },
      ];
      args: [
        {
          name: "params";
          type: {
            defined: "LiquidateShortParams";
          };
        },
      ];
    },
    {
      name: "updatePoolAum";
      accounts: [
        {
          name: "payer";
          isMut: true;
          isSigner: true;
          docs: ["#1"];
        },
        {
          name: "cortex";
          isMut: false;
          isSigner: false;
          docs: ["#2"];
        },
        {
          name: "pool";
          isMut: true;
          isSigner: false;
          docs: ["#3"];
        },
      ];
      args: [];
      returns: "u128";
    },
    {
      name: "getAddLiquidityAmountAndFee";
      accounts: [
        {
          name: "cortex";
          isMut: false;
          isSigner: false;
          docs: ["#1"];
        },
        {
          name: "pool";
          isMut: false;
          isSigner: false;
          docs: ["#2"];
        },
        {
          name: "custody";
          isMut: false;
          isSigner: false;
          docs: ["#3"];
        },
        {
          name: "custodyOracle";
          isMut: false;
          isSigner: false;
          docs: ["#4"];
        },
        {
          name: "lpTokenMint";
          isMut: false;
          isSigner: false;
          docs: ["#5"];
        },
      ];
      args: [
        {
          name: "params";
          type: {
            defined: "GetAddLiquidityAmountAndFeeParams";
          };
        },
      ];
      returns: {
        defined: "AmountAndFee";
      };
    },
    {
      name: "getRemoveLiquidityAmountAndFee";
      accounts: [
        {
          name: "cortex";
          isMut: false;
          isSigner: false;
          docs: ["#1"];
        },
        {
          name: "pool";
          isMut: false;
          isSigner: false;
          docs: ["#2"];
        },
        {
          name: "custody";
          isMut: false;
          isSigner: false;
          docs: ["#3"];
        },
        {
          name: "custodyOracle";
          isMut: false;
          isSigner: false;
          docs: ["#4"];
        },
        {
          name: "lpTokenMint";
          isMut: false;
          isSigner: false;
          docs: ["#5"];
        },
      ];
      args: [
        {
          name: "params";
          type: {
            defined: "GetRemoveLiquidityAmountAndFeeParams";
          };
        },
      ];
      returns: {
        defined: "AmountAndFee";
      };
    },
    {
      name: "getEntryPriceAndFee";
      accounts: [
        {
          name: "cortex";
          isMut: false;
          isSigner: false;
          docs: ["#1"];
        },
        {
          name: "pool";
          isMut: false;
          isSigner: false;
          docs: ["#2"];
        },
        {
          name: "custody";
          isMut: false;
          isSigner: false;
          docs: ["#3"];
        },
        {
          name: "custodyTradeOracle";
          isMut: false;
          isSigner: false;
          docs: ["#4"];
        },
        {
          name: "collateralCustody";
          isMut: false;
          isSigner: false;
          docs: ["#5"];
        },
        {
          name: "collateralCustodyOracle";
          isMut: false;
          isSigner: false;
          docs: ["#6"];
        },
      ];
      args: [
        {
          name: "params";
          type: {
            defined: "GetEntryPriceAndFeeParams";
          };
        },
      ];
      returns: {
        defined: "NewPositionPricesAndFee";
      };
    },
    {
      name: "disableTokensFreezeCapabilities";
      accounts: [
        {
          name: "admin";
          isMut: false;
          isSigner: true;
          docs: ["#1"];
        },
        {
          name: "transferAuthority";
          isMut: false;
          isSigner: false;
          docs: ["#2"];
        },
        {
          name: "cortex";
          isMut: false;
          isSigner: false;
          docs: ["#3"];
        },
        {
          name: "lmTokenMint";
          isMut: true;
          isSigner: false;
          docs: ["#4"];
        },
        {
          name: "pool";
          isMut: false;
          isSigner: false;
          docs: ["#5"];
        },
        {
          name: "lpTokenMint";
          isMut: true;
          isSigner: false;
          docs: ["#6"];
        },
        {
          name: "tokenProgram";
          isMut: false;
          isSigner: false;
          docs: ["#7"];
        },
      ];
      args: [];
    },
    {
      name: "genesisStakePatch";
      accounts: [
        {
          name: "caller";
          isMut: false;
          isSigner: true;
          docs: ["#1"];
        },
        {
          name: "payer";
          isMut: true;
          isSigner: true;
          docs: ["#2"];
        },
        {
          name: "owner";
          isMut: false;
          isSigner: false;
          docs: ["#3"];
        },
        {
          name: "rewardTokenAccount";
          isMut: true;
          isSigner: false;
          docs: ["#4"];
        },
        {
          name: "lmTokenAccount";
          isMut: true;
          isSigner: false;
          docs: ["#5"];
        },
        {
          name: "stakingRewardTokenVault";
          isMut: true;
          isSigner: false;
          docs: ["#6"];
        },
        {
          name: "stakingLmRewardTokenVault";
          isMut: true;
          isSigner: false;
          docs: ["#7"];
        },
        {
          name: "transferAuthority";
          isMut: false;
          isSigner: false;
          docs: ["#8"];
        },
        {
          name: "userStaking";
          isMut: true;
          isSigner: false;
          docs: ["#9"];
        },
        {
          name: "staking";
          isMut: true;
          isSigner: false;
          docs: ["#10"];
        },
        {
          name: "cortex";
          isMut: true;
          isSigner: false;
          docs: ["#11"];
        },
        {
          name: "pool";
          isMut: false;
          isSigner: false;
          docs: ["#12"];
        },
        {
          name: "genesisLock";
          isMut: false;
          isSigner: false;
          docs: ["#13"];
        },
        {
          name: "lmTokenMint";
          isMut: true;
          isSigner: false;
          docs: ["#14"];
        },
        {
          name: "feeRedistributionMint";
          isMut: false;
          isSigner: false;
          docs: ["#15"];
        },
        {
          name: "adrenaProgram";
          isMut: false;
          isSigner: false;
          docs: ["#16"];
        },
        {
          name: "systemProgram";
          isMut: false;
          isSigner: false;
          docs: ["#17"];
        },
        {
          name: "tokenProgram";
          isMut: false;
          isSigner: false;
          docs: ["#18"];
        },
      ];
      args: [];
    },
    {
      name: "getOpenPositionWithSwapAmountAndFees";
      accounts: [
        {
          name: "cortex";
          isMut: false;
          isSigner: false;
          docs: ["#1"];
        },
        {
          name: "pool";
          isMut: false;
          isSigner: false;
          docs: ["#2"];
        },
        {
          name: "receivingCustody";
          isMut: false;
          isSigner: false;
          docs: ["#3"];
        },
        {
          name: "receivingCustodyOracle";
          isMut: false;
          isSigner: false;
          docs: ["#4"];
        },
        {
          name: "collateralCustody";
          isMut: false;
          isSigner: false;
          docs: ["#5"];
        },
        {
          name: "collateralCustodyOracle";
          isMut: false;
          isSigner: false;
          docs: ["#6"];
        },
        {
          name: "principalCustody";
          isMut: false;
          isSigner: false;
          docs: ["#7"];
        },
        {
          name: "principalCustodyTradeOracle";
          isMut: false;
          isSigner: false;
          docs: ["#8"];
        },
        {
          name: "adrenaProgram";
          isMut: false;
          isSigner: false;
          docs: ["#9"];
        },
      ];
      args: [
        {
          name: "params";
          type: {
            defined: "GetOpenPositionWithSwapAmountAndFeesParams";
          };
        },
      ];
      returns: {
        defined: "OpenPositionWithSwapAmountAndFees";
      };
    },
    {
      name: "getExitPriceAndFee";
      accounts: [
        {
          name: "cortex";
          isMut: false;
          isSigner: false;
          docs: ["#1"];
        },
        {
          name: "pool";
          isMut: false;
          isSigner: false;
          docs: ["#2"];
        },
        {
          name: "position";
          isMut: false;
          isSigner: false;
          docs: ["#3"];
        },
        {
          name: "custody";
          isMut: false;
          isSigner: false;
          docs: ["#4"];
        },
        {
          name: "custodyTradeOracle";
          isMut: false;
          isSigner: false;
          docs: ["#5"];
        },
        {
          name: "collateralCustody";
          isMut: false;
          isSigner: false;
          docs: ["#6"];
        },
        {
          name: "collateralCustodyOracle";
          isMut: false;
          isSigner: false;
          docs: ["#7"];
        },
      ];
      args: [];
      returns: {
        defined: "ExitPriceAndFee";
      };
    },
    {
      name: "getPnl";
      accounts: [
        {
          name: "cortex";
          isMut: false;
          isSigner: false;
          docs: ["#1"];
        },
        {
          name: "pool";
          isMut: false;
          isSigner: false;
          docs: ["#2"];
        },
        {
          name: "position";
          isMut: false;
          isSigner: false;
          docs: ["#3"];
        },
        {
          name: "custody";
          isMut: false;
          isSigner: false;
          docs: ["#4"];
        },
        {
          name: "custodyTradeOracle";
          isMut: false;
          isSigner: false;
          docs: ["#5"];
        },
        {
          name: "collateralCustody";
          isMut: false;
          isSigner: false;
          docs: ["#6"];
        },
        {
          name: "collateralCustodyOracle";
          isMut: false;
          isSigner: false;
          docs: ["#7"];
        },
      ];
      args: [];
      returns: {
        defined: "ProfitAndLoss";
      };
    },
    {
      name: "getLiquidationPrice";
      accounts: [
        {
          name: "cortex";
          isMut: false;
          isSigner: false;
          docs: ["#1"];
        },
        {
          name: "pool";
          isMut: false;
          isSigner: false;
          docs: ["#2"];
        },
        {
          name: "position";
          isMut: false;
          isSigner: false;
          docs: ["#3"];
        },
        {
          name: "custody";
          isMut: false;
          isSigner: false;
          docs: ["#4"];
        },
        {
          name: "collateralCustody";
          isMut: false;
          isSigner: false;
          docs: ["#5"];
        },
        {
          name: "collateralCustodyOracle";
          isMut: false;
          isSigner: false;
          docs: ["#6"];
        },
      ];
      args: [
        {
          name: "params";
          type: {
            defined: "GetLiquidationPriceParams";
          };
        },
      ];
      returns: "u64";
    },
    {
      name: "getLiquidationState";
      accounts: [
        {
          name: "cortex";
          isMut: false;
          isSigner: false;
          docs: ["#1"];
        },
        {
          name: "pool";
          isMut: false;
          isSigner: false;
          docs: ["#2"];
        },
        {
          name: "position";
          isMut: false;
          isSigner: false;
          docs: ["#3"];
        },
        {
          name: "custody";
          isMut: false;
          isSigner: false;
          docs: ["#4"];
        },
        {
          name: "custodyTradeOracle";
          isMut: false;
          isSigner: false;
          docs: ["#5"];
        },
        {
          name: "collateralCustody";
          isMut: false;
          isSigner: false;
          docs: ["#6"];
        },
        {
          name: "collateralCustodyOracle";
          isMut: false;
          isSigner: false;
          docs: ["#7"];
        },
      ];
      args: [];
      returns: "u8";
    },
    {
      name: "getOraclePrice";
      accounts: [
        {
          name: "cortex";
          isMut: false;
          isSigner: false;
          docs: ["#1"];
        },
        {
          name: "pool";
          isMut: false;
          isSigner: false;
          docs: ["#2"];
        },
        {
          name: "custody";
          isMut: false;
          isSigner: false;
          docs: ["#3"];
        },
        {
          name: "custodyOracle";
          isMut: false;
          isSigner: false;
          docs: ["#4"];
        },
      ];
      args: [];
      returns: "u64";
    },
    {
      name: "getSwapAmountAndFees";
      accounts: [
        {
          name: "cortex";
          isMut: false;
          isSigner: false;
          docs: ["#1"];
        },
        {
          name: "pool";
          isMut: false;
          isSigner: false;
          docs: ["#2"];
        },
        {
          name: "receivingCustody";
          isMut: false;
          isSigner: false;
          docs: ["#3"];
        },
        {
          name: "receivingCustodyOracle";
          isMut: false;
          isSigner: false;
          docs: ["#4"];
        },
        {
          name: "dispensingCustody";
          isMut: false;
          isSigner: false;
          docs: ["#5"];
        },
        {
          name: "dispensingCustodyOracle";
          isMut: false;
          isSigner: false;
          docs: ["#6"];
        },
      ];
      args: [
        {
          name: "params";
          type: {
            defined: "GetSwapAmountAndFeesParams";
          };
        },
      ];
      returns: {
        defined: "SwapAmountAndFees";
      };
    },
    {
      name: "getAssetsUnderManagement";
      accounts: [
        {
          name: "cortex";
          isMut: false;
          isSigner: false;
          docs: ["#1"];
        },
        {
          name: "pool";
          isMut: false;
          isSigner: false;
          docs: ["#2"];
        },
      ];
      args: [];
      returns: "u128";
    },
    {
      name: "initUserStaking";
      accounts: [
        {
          name: "owner";
          isMut: true;
          isSigner: true;
          docs: ["#1"];
        },
        {
          name: "rewardTokenAccount";
          isMut: true;
          isSigner: false;
          docs: ["#2"];
        },
        {
          name: "lmTokenAccount";
          isMut: true;
          isSigner: false;
          docs: ["#3"];
        },
        {
          name: "stakingRewardTokenVault";
          isMut: true;
          isSigner: false;
          docs: ["#4"];
        },
        {
          name: "stakingLmRewardTokenVault";
          isMut: true;
          isSigner: false;
          docs: ["#5"];
        },
        {
          name: "userStaking";
          isMut: true;
          isSigner: false;
          docs: ["#6"];
        },
        {
          name: "transferAuthority";
          isMut: false;
          isSigner: false;
          docs: ["#7"];
        },
        {
          name: "staking";
          isMut: false;
          isSigner: false;
          docs: ["#8"];
        },
        {
          name: "cortex";
          isMut: true;
          isSigner: false;
          docs: ["#9"];
        },
        {
          name: "pool";
          isMut: true;
          isSigner: false;
          docs: ["#10"];
        },
        {
          name: "genesisLock";
          isMut: true;
          isSigner: false;
          docs: ["#11"];
        },
        {
          name: "lmTokenMint";
          isMut: false;
          isSigner: false;
          docs: ["#12"];
        },
        {
          name: "feeRedistributionMint";
          isMut: false;
          isSigner: false;
          docs: ["#13"];
        },
        {
          name: "adrenaProgram";
          isMut: false;
          isSigner: false;
          docs: ["#14"];
        },
        {
          name: "systemProgram";
          isMut: false;
          isSigner: false;
          docs: ["#15"];
        },
        {
          name: "tokenProgram";
          isMut: false;
          isSigner: false;
          docs: ["#16"];
        },
      ];
      args: [];
    },
    {
      name: "initUserProfile";
      accounts: [
        {
          name: "user";
          isMut: false;
          isSigner: true;
          docs: ["#1"];
        },
        {
          name: "payer";
          isMut: true;
          isSigner: true;
          docs: ["#2"];
        },
        {
          name: "userProfile";
          isMut: true;
          isSigner: false;
          docs: ["#3"];
        },
        {
          name: "cortex";
          isMut: true;
          isSigner: false;
          docs: ["#4"];
        },
        {
          name: "systemProgram";
          isMut: false;
          isSigner: false;
          docs: ["#5"];
        },
      ];
      args: [
        {
          name: "params";
          type: {
            defined: "InitUserProfileParams";
          };
        },
      ];
    },
    {
      name: "editUserProfile";
      accounts: [
        {
          name: "user";
          isMut: false;
          isSigner: true;
          docs: ["#1"];
        },
        {
          name: "payer";
          isMut: true;
          isSigner: true;
          docs: ["#2"];
        },
        {
          name: "userProfile";
          isMut: true;
          isSigner: false;
          docs: ["#3"];
        },
        {
          name: "systemProgram";
          isMut: false;
          isSigner: false;
          docs: ["#4"];
        },
      ];
      args: [
        {
          name: "params";
          type: {
            defined: "EditUserProfileParams";
          };
        },
      ];
    },
    {
      name: "deleteUserProfile";
      accounts: [
        {
          name: "admin";
          isMut: false;
          isSigner: true;
          docs: ["#1"];
        },
        {
          name: "user";
          isMut: false;
          isSigner: false;
          docs: ["#2"];
        },
        {
          name: "payer";
          isMut: true;
          isSigner: true;
          docs: ["#3"];
        },
        {
          name: "userProfile";
          isMut: true;
          isSigner: false;
          docs: ["#4"];
        },
        {
          name: "cortex";
          isMut: true;
          isSigner: false;
          docs: ["#5"];
        },
        {
          name: "systemProgram";
          isMut: false;
          isSigner: false;
          docs: ["#6"];
        },
      ];
      args: [];
    },
    {
      name: "initStakingOne";
      accounts: [
        {
          name: "admin";
          isMut: false;
          isSigner: true;
          docs: ["#1"];
        },
        {
          name: "payer";
          isMut: true;
          isSigner: true;
          docs: ["#2"];
        },
        {
          name: "transferAuthority";
          isMut: false;
          isSigner: false;
          docs: ["#3"];
        },
        {
          name: "staking";
          isMut: true;
          isSigner: false;
          docs: ["#4"];
        },
        {
          name: "lmTokenMint";
          isMut: true;
          isSigner: false;
          docs: ["#5"];
        },
        {
          name: "cortex";
          isMut: true;
          isSigner: false;
          docs: ["#6"];
        },
        {
          name: "stakingStakedTokenVault";
          isMut: true;
          isSigner: false;
          docs: ["#7"];
        },
        {
          name: "feeRedistributionMint";
          isMut: false;
          isSigner: false;
          docs: ["#8"];
        },
        {
          name: "stakingStakedTokenMint";
          isMut: false;
          isSigner: false;
          docs: ["#9"];
        },
        {
          name: "adrenaProgram";
          isMut: false;
          isSigner: false;
          docs: ["#10"];
        },
        {
          name: "systemProgram";
          isMut: false;
          isSigner: false;
          docs: ["#11"];
        },
        {
          name: "tokenProgram";
          isMut: false;
          isSigner: false;
          docs: ["#12"];
        },
        {
          name: "rent";
          isMut: false;
          isSigner: false;
          docs: ["#13"];
        },
      ];
      args: [
        {
          name: "params";
          type: {
            defined: "InitStakingOneParams";
          };
        },
      ];
      returns: "u8";
    },
    {
      name: "initStakingTwo";
      accounts: [
        {
          name: "admin";
          isMut: false;
          isSigner: true;
          docs: ["#1"];
        },
        {
          name: "payer";
          isMut: true;
          isSigner: true;
          docs: ["#2"];
        },
        {
          name: "transferAuthority";
          isMut: false;
          isSigner: false;
          docs: ["#3"];
        },
        {
          name: "staking";
          isMut: true;
          isSigner: false;
          docs: ["#4"];
        },
        {
          name: "lmTokenMint";
          isMut: true;
          isSigner: false;
          docs: ["#5"];
        },
        {
          name: "cortex";
          isMut: true;
          isSigner: false;
          docs: ["#6"];
        },
        {
          name: "stakingRewardTokenVault";
          isMut: true;
          isSigner: false;
          docs: ["#7"];
        },
        {
          name: "feeRedistributionMint";
          isMut: false;
          isSigner: false;
          docs: ["#8"];
        },
        {
          name: "systemProgram";
          isMut: false;
          isSigner: false;
          docs: ["#9"];
        },
        {
          name: "tokenProgram";
          isMut: false;
          isSigner: false;
          docs: ["#10"];
        },
      ];
      args: [];
      returns: "u8";
    },
    {
      name: "initStakingThree";
      accounts: [
        {
          name: "admin";
          isMut: false;
          isSigner: true;
          docs: ["#1"];
        },
        {
          name: "payer";
          isMut: true;
          isSigner: true;
          docs: ["#2"];
        },
        {
          name: "transferAuthority";
          isMut: false;
          isSigner: false;
          docs: ["#3"];
        },
        {
          name: "staking";
          isMut: true;
          isSigner: false;
          docs: ["#4"];
        },
        {
          name: "lmTokenMint";
          isMut: true;
          isSigner: false;
          docs: ["#5"];
        },
        {
          name: "cortex";
          isMut: true;
          isSigner: false;
          docs: ["#6"];
        },
        {
          name: "stakingLmRewardTokenVault";
          isMut: true;
          isSigner: false;
          docs: ["#7"];
        },
        {
          name: "feeRedistributionMint";
          isMut: false;
          isSigner: false;
          docs: ["#8"];
        },
        {
          name: "systemProgram";
          isMut: false;
          isSigner: false;
          docs: ["#9"];
        },
        {
          name: "tokenProgram";
          isMut: false;
          isSigner: false;
          docs: ["#10"];
        },
      ];
      args: [];
      returns: "u8";
    },
    {
      name: "initStakingFour";
      accounts: [
        {
          name: "admin";
          isMut: false;
          isSigner: true;
          docs: ["#1"];
        },
        {
          name: "payer";
          isMut: true;
          isSigner: true;
          docs: ["#2"];
        },
        {
          name: "transferAuthority";
          isMut: false;
          isSigner: false;
          docs: ["#3"];
        },
        {
          name: "staking";
          isMut: true;
          isSigner: false;
          docs: ["#4"];
        },
        {
          name: "lmTokenMint";
          isMut: true;
          isSigner: false;
          docs: ["#5"];
        },
        {
          name: "cortex";
          isMut: true;
          isSigner: false;
          docs: ["#6"];
        },
        {
          name: "stakingStakedTokenVault";
          isMut: true;
          isSigner: false;
          docs: ["#7"];
        },
        {
          name: "stakingRewardTokenVault";
          isMut: true;
          isSigner: false;
          docs: ["#8"];
        },
        {
          name: "stakingLmRewardTokenVault";
          isMut: true;
          isSigner: false;
          docs: ["#9"];
        },
        {
          name: "feeRedistributionMint";
          isMut: false;
          isSigner: false;
          docs: ["#10"];
        },
        {
          name: "stakingStakedTokenMint";
          isMut: false;
          isSigner: false;
          docs: ["#11"];
        },
        {
          name: "adrenaProgram";
          isMut: false;
          isSigner: false;
          docs: ["#12"];
        },
        {
          name: "systemProgram";
          isMut: false;
          isSigner: false;
          docs: ["#13"];
        },
        {
          name: "tokenProgram";
          isMut: false;
          isSigner: false;
          docs: ["#14"];
        },
      ];
      args: [];
      returns: "u8";
    },
    {
      name: "addLiquidStake";
      accounts: [
        {
          name: "owner";
          isMut: true;
          isSigner: true;
          docs: ["#1"];
        },
        {
          name: "fundingAccount";
          isMut: true;
          isSigner: false;
          docs: ["#2"];
        },
        {
          name: "rewardTokenAccount";
          isMut: true;
          isSigner: false;
          docs: ["#3"];
        },
        {
          name: "lmTokenAccount";
          isMut: true;
          isSigner: false;
          docs: ["#4"];
        },
        {
          name: "stakingStakedTokenVault";
          isMut: true;
          isSigner: false;
          docs: ["#5"];
        },
        {
          name: "stakingRewardTokenVault";
          isMut: true;
          isSigner: false;
          docs: ["#6"];
        },
        {
          name: "stakingLmRewardTokenVault";
          isMut: true;
          isSigner: false;
          docs: ["#7"];
        },
        {
          name: "transferAuthority";
          isMut: false;
          isSigner: false;
          docs: ["#8"];
        },
        {
          name: "userStaking";
          isMut: true;
          isSigner: false;
          docs: ["#9"];
        },
        {
          name: "staking";
          isMut: true;
          isSigner: false;
          docs: ["#10"];
        },
        {
          name: "cortex";
          isMut: true;
          isSigner: false;
          docs: ["#11"];
        },
        {
          name: "pool";
          isMut: true;
          isSigner: false;
          docs: ["#13"];
        },
        {
          name: "genesisLock";
          isMut: true;
          isSigner: false;
          docs: ["#14"];
        },
        {
          name: "lmTokenMint";
          isMut: true;
          isSigner: false;
          docs: ["#15"];
        },
        {
          name: "governanceTokenMint";
          isMut: true;
          isSigner: false;
          docs: ["#16"];
        },
        {
          name: "feeRedistributionMint";
          isMut: false;
          isSigner: false;
          docs: ["#17"];
        },
        {
          name: "governanceRealm";
          isMut: false;
          isSigner: false;
          docs: [
            "#18",
            "A realm represent one project within the governance program",
          ];
        },
        {
          name: "governanceRealmConfig";
          isMut: false;
          isSigner: false;
          docs: ["#19"];
        },
        {
          name: "governanceGoverningTokenHolding";
          isMut: true;
          isSigner: false;
          docs: [
            "#20",
            "Token account owned by governance program holding user's locked tokens",
          ];
        },
        {
          name: "governanceGoverningTokenOwnerRecord";
          isMut: true;
          isSigner: false;
          docs: ["#21", "Account owned by governance storing user information"];
        },
        {
          name: "governanceProgram";
          isMut: false;
          isSigner: false;
          docs: ["#22"];
        },
        {
          name: "adrenaProgram";
          isMut: false;
          isSigner: false;
          docs: ["#23"];
        },
        {
          name: "systemProgram";
          isMut: false;
          isSigner: false;
          docs: ["#24"];
        },
        {
          name: "tokenProgram";
          isMut: false;
          isSigner: false;
          docs: ["#25"];
        },
      ];
      args: [
        {
          name: "params";
          type: {
            defined: "AddLiquidStakeParams";
          };
        },
      ];
    },
    {
      name: "addLockedStake";
      accounts: [
        {
          name: "owner";
          isMut: true;
          isSigner: true;
          docs: ["#1"];
        },
        {
          name: "fundingAccount";
          isMut: true;
          isSigner: false;
          docs: ["#2"];
        },
        {
          name: "rewardTokenAccount";
          isMut: true;
          isSigner: false;
          docs: ["#3"];
        },
        {
          name: "stakingStakedTokenVault";
          isMut: true;
          isSigner: false;
          docs: ["#4"];
        },
        {
          name: "stakingRewardTokenVault";
          isMut: true;
          isSigner: false;
          docs: ["#5"];
        },
        {
          name: "transferAuthority";
          isMut: false;
          isSigner: false;
          docs: ["#6"];
        },
        {
          name: "userStaking";
          isMut: true;
          isSigner: false;
          docs: ["#7"];
        },
        {
          name: "staking";
          isMut: true;
          isSigner: false;
          docs: ["#8"];
        },
        {
          name: "cortex";
          isMut: true;
          isSigner: false;
          docs: ["#9"];
        },
        {
          name: "lmTokenMint";
          isMut: true;
          isSigner: false;
          docs: ["#10"];
        },
        {
          name: "governanceTokenMint";
          isMut: true;
          isSigner: false;
          docs: ["#11"];
        },
        {
          name: "feeRedistributionMint";
          isMut: false;
          isSigner: false;
          docs: ["#12"];
        },
        {
          name: "governanceRealm";
          isMut: false;
          isSigner: false;
          docs: [
            "#13",
            "A realm represent one project within the governance program",
          ];
        },
        {
          name: "governanceRealmConfig";
          isMut: false;
          isSigner: false;
          docs: ["#14"];
        },
        {
          name: "governanceGoverningTokenHolding";
          isMut: true;
          isSigner: false;
          docs: [
            "#15",
            "Token account owned by governance program holding user's locked tokens",
          ];
        },
        {
          name: "governanceGoverningTokenOwnerRecord";
          isMut: true;
          isSigner: false;
          docs: ["#16", "Account owned by governance storing user information"];
        },
        {
          name: "governanceProgram";
          isMut: false;
          isSigner: false;
          docs: ["#17"];
        },
        {
          name: "adrenaProgram";
          isMut: false;
          isSigner: false;
          docs: ["#18"];
        },
        {
          name: "systemProgram";
          isMut: false;
          isSigner: false;
          docs: ["#19"];
        },
        {
          name: "tokenProgram";
          isMut: false;
          isSigner: false;
          docs: ["#20"];
        },
      ];
      args: [
        {
          name: "params";
          type: {
            defined: "AddLockedStakeParams";
          };
        },
      ];
    },
    {
      name: "upgradeLockedStake";
      accounts: [
        {
          name: "owner";
          isMut: true;
          isSigner: true;
          docs: ["#1"];
        },
        {
          name: "fundingAccount";
          isMut: true;
          isSigner: false;
          docs: ["#2"];
        },
        {
          name: "rewardTokenAccount";
          isMut: true;
          isSigner: false;
          docs: ["#3"];
        },
        {
          name: "lmTokenAccount";
          isMut: true;
          isSigner: false;
          docs: ["#4"];
        },
        {
          name: "stakingStakedTokenVault";
          isMut: true;
          isSigner: false;
          docs: ["#5"];
        },
        {
          name: "stakingRewardTokenVault";
          isMut: true;
          isSigner: false;
          docs: ["#6"];
        },
        {
          name: "transferAuthority";
          isMut: false;
          isSigner: false;
          docs: ["#7"];
        },
        {
          name: "userStaking";
          isMut: true;
          isSigner: false;
          docs: ["#8"];
        },
        {
          name: "staking";
          isMut: true;
          isSigner: false;
          docs: ["#9"];
        },
        {
          name: "cortex";
          isMut: true;
          isSigner: false;
          docs: ["#10"];
        },
        {
          name: "governanceTokenMint";
          isMut: true;
          isSigner: false;
          docs: ["#11"];
        },
        {
          name: "pool";
          isMut: true;
          isSigner: false;
          docs: ["#12"];
        },
        {
          name: "genesisLock";
          isMut: true;
          isSigner: false;
          docs: ["#13"];
        },
        {
          name: "lmTokenMint";
          isMut: true;
          isSigner: false;
          docs: ["#14"];
        },
        {
          name: "feeRedistributionMint";
          isMut: false;
          isSigner: false;
          docs: ["#15"];
        },
        {
          name: "governanceRealm";
          isMut: false;
          isSigner: false;
          docs: [
            "#16",
            "A realm represent one project within the governance program",
          ];
        },
        {
          name: "governanceRealmConfig";
          isMut: false;
          isSigner: false;
          docs: ["#17"];
        },
        {
          name: "governanceGoverningTokenHolding";
          isMut: true;
          isSigner: false;
          docs: [
            "#18",
            "Token account owned by governance program holding user's locked tokens",
          ];
        },
        {
          name: "governanceGoverningTokenOwnerRecord";
          isMut: true;
          isSigner: false;
          docs: ["#19", "Account owned by governance storing user information"];
        },
        {
          name: "stakingLmRewardTokenVault";
          isMut: true;
          isSigner: false;
          docs: ["#20"];
        },
        {
          name: "adrenaProgram";
          isMut: false;
          isSigner: false;
          docs: ["#21"];
        },
        {
          name: "governanceProgram";
          isMut: false;
          isSigner: false;
          docs: ["#22"];
        },
        {
          name: "systemProgram";
          isMut: false;
          isSigner: false;
          docs: ["#23"];
        },
        {
          name: "tokenProgram";
          isMut: false;
          isSigner: false;
          docs: ["#24"];
        },
      ];
      args: [
        {
          name: "params";
          type: {
            defined: "UpgradeLockedStakeParams";
          };
        },
      ];
    },
    {
      name: "removeLiquidStake";
      accounts: [
        {
          name: "owner";
          isMut: true;
          isSigner: true;
          docs: ["#1"];
        },
        {
          name: "stakedTokenAccount";
          isMut: true;
          isSigner: false;
          docs: ["#2"];
        },
        {
          name: "lmTokenAccount";
          isMut: true;
          isSigner: false;
          docs: ["#3"];
        },
        {
          name: "rewardTokenAccount";
          isMut: true;
          isSigner: false;
          docs: ["#4"];
        },
        {
          name: "stakingStakedTokenVault";
          isMut: true;
          isSigner: false;
          docs: ["#5"];
        },
        {
          name: "stakingRewardTokenVault";
          isMut: true;
          isSigner: false;
          docs: ["#6"];
        },
        {
          name: "stakingLmRewardTokenVault";
          isMut: true;
          isSigner: false;
          docs: ["#7"];
        },
        {
          name: "transferAuthority";
          isMut: false;
          isSigner: false;
          docs: ["#8"];
        },
        {
          name: "userStaking";
          isMut: true;
          isSigner: false;
          docs: ["#9"];
        },
        {
          name: "staking";
          isMut: true;
          isSigner: false;
          docs: ["#10"];
        },
        {
          name: "cortex";
          isMut: true;
          isSigner: false;
          docs: ["#11"];
        },
        {
          name: "pool";
          isMut: true;
          isSigner: false;
          docs: ["#12"];
        },
        {
          name: "genesisLock";
          isMut: true;
          isSigner: false;
          docs: ["#13"];
        },
        {
          name: "lmTokenMint";
          isMut: true;
          isSigner: false;
          docs: ["#14"];
        },
        {
          name: "governanceTokenMint";
          isMut: true;
          isSigner: false;
          docs: ["#15"];
        },
        {
          name: "feeRedistributionMint";
          isMut: false;
          isSigner: false;
          docs: ["#16"];
        },
        {
          name: "governanceRealm";
          isMut: false;
          isSigner: false;
          docs: [
            "#17",
            "A realm represent one project within the governance program",
          ];
        },
        {
          name: "governanceRealmConfig";
          isMut: false;
          isSigner: false;
          docs: ["#18"];
        },
        {
          name: "governanceGoverningTokenHolding";
          isMut: true;
          isSigner: false;
          docs: [
            "#19",
            "Token account owned by governance program holding user's locked tokens",
          ];
        },
        {
          name: "governanceGoverningTokenOwnerRecord";
          isMut: true;
          isSigner: false;
          docs: ["#20", "Account owned by governance storing user information"];
        },
        {
          name: "governanceProgram";
          isMut: false;
          isSigner: false;
          docs: ["#21"];
        },
        {
          name: "adrenaProgram";
          isMut: false;
          isSigner: false;
          docs: ["#22"];
        },
        {
          name: "systemProgram";
          isMut: false;
          isSigner: false;
          docs: ["#23"];
        },
        {
          name: "tokenProgram";
          isMut: false;
          isSigner: false;
          docs: ["#24"];
        },
      ];
      args: [
        {
          name: "params";
          type: {
            defined: "RemoveLiquidStakeParams";
          };
        },
      ];
    },
    {
      name: "removeLockedStake";
      accounts: [
        {
          name: "owner";
          isMut: true;
          isSigner: true;
          docs: ["#1"];
        },
        {
          name: "lmTokenAccount";
          isMut: true;
          isSigner: false;
          docs: ["#2"];
        },
        {
          name: "stakedTokenAccount";
          isMut: true;
          isSigner: false;
          docs: ["#3"];
        },
        {
          name: "rewardTokenAccount";
          isMut: true;
          isSigner: false;
          docs: ["#4"];
        },
        {
          name: "stakingStakedTokenVault";
          isMut: true;
          isSigner: false;
          docs: ["#5"];
        },
        {
          name: "stakingRewardTokenVault";
          isMut: true;
          isSigner: false;
          docs: ["#6"];
        },
        {
          name: "stakingLmRewardTokenVault";
          isMut: true;
          isSigner: false;
          docs: ["#7"];
        },
        {
          name: "transferAuthority";
          isMut: false;
          isSigner: false;
          docs: ["#8"];
        },
        {
          name: "userStaking";
          isMut: true;
          isSigner: false;
          docs: ["#9"];
        },
        {
          name: "staking";
          isMut: true;
          isSigner: false;
          docs: ["#10"];
        },
        {
          name: "cortex";
          isMut: true;
          isSigner: false;
          docs: ["#11"];
        },
        {
          name: "pool";
          isMut: true;
          isSigner: false;
          docs: ["#12"];
        },
        {
          name: "genesisLock";
          isMut: true;
          isSigner: false;
          docs: ["#13"];
        },
        {
          name: "lmTokenMint";
          isMut: true;
          isSigner: false;
          docs: ["#14"];
        },
        {
          name: "stakedTokenMint";
          isMut: true;
          isSigner: false;
          docs: ["#15"];
        },
        {
          name: "governanceTokenMint";
          isMut: true;
          isSigner: false;
          docs: ["#16"];
        },
        {
          name: "feeRedistributionMint";
          isMut: false;
          isSigner: false;
          docs: ["#17"];
        },
        {
          name: "governanceRealm";
          isMut: false;
          isSigner: false;
          docs: [
            "#18",
            "A realm represent one project within the governance program",
          ];
        },
        {
          name: "governanceRealmConfig";
          isMut: false;
          isSigner: false;
          docs: ["#19"];
        },
        {
          name: "governanceGoverningTokenHolding";
          isMut: true;
          isSigner: false;
          docs: [
            "#20",
            "Token account owned by governance program holding user's locked tokens",
          ];
        },
        {
          name: "governanceGoverningTokenOwnerRecord";
          isMut: true;
          isSigner: false;
          docs: ["#21", "Account owned by governance storing user information"];
        },
        {
          name: "governanceProgram";
          isMut: false;
          isSigner: false;
          docs: ["#22"];
        },
        {
          name: "adrenaProgram";
          isMut: false;
          isSigner: false;
          docs: ["#23"];
        },
        {
          name: "systemProgram";
          isMut: false;
          isSigner: false;
          docs: ["#24"];
        },
        {
          name: "tokenProgram";
          isMut: false;
          isSigner: false;
          docs: ["#25"];
        },
      ];
      args: [
        {
          name: "params";
          type: {
            defined: "RemoveLockedStakeParams";
          };
        },
      ];
    },
    {
      name: "claimStakes";
      accounts: [
        {
          name: "caller";
          isMut: true;
          isSigner: true;
          docs: ["#1"];
        },
        {
          name: "payer";
          isMut: true;
          isSigner: true;
          docs: ["#2"];
        },
        {
          name: "owner";
          isMut: true;
          isSigner: false;
          docs: ["#3"];
        },
        {
          name: "rewardTokenAccount";
          isMut: true;
          isSigner: false;
          docs: ["#4"];
        },
        {
          name: "lmTokenAccount";
          isMut: true;
          isSigner: false;
          docs: ["#5"];
        },
        {
          name: "stakingRewardTokenVault";
          isMut: true;
          isSigner: false;
          docs: ["#6"];
        },
        {
          name: "stakingLmRewardTokenVault";
          isMut: true;
          isSigner: false;
          docs: ["#7"];
        },
        {
          name: "transferAuthority";
          isMut: false;
          isSigner: false;
          docs: ["#8"];
        },
        {
          name: "userStaking";
          isMut: true;
          isSigner: false;
          docs: ["#9"];
        },
        {
          name: "staking";
          isMut: true;
          isSigner: false;
          docs: ["#10"];
        },
        {
          name: "cortex";
          isMut: true;
          isSigner: false;
          docs: ["#11"];
        },
        {
          name: "pool";
          isMut: true;
          isSigner: false;
          docs: ["#12"];
        },
        {
          name: "genesisLock";
          isMut: true;
          isSigner: false;
          docs: ["#13"];
        },
        {
          name: "lmTokenMint";
          isMut: true;
          isSigner: false;
          docs: ["#14"];
        },
        {
          name: "feeRedistributionMint";
          isMut: false;
          isSigner: false;
          docs: ["#15"];
        },
        {
          name: "adrenaProgram";
          isMut: false;
          isSigner: false;
          docs: ["#16"];
        },
        {
          name: "systemProgram";
          isMut: false;
          isSigner: false;
          docs: ["#17"];
        },
        {
          name: "tokenProgram";
          isMut: false;
          isSigner: false;
          docs: ["#18"];
        },
      ];
      args: [
        {
          name: "params";
          type: {
            defined: "ClaimStakesParams";
          };
        },
      ];
    },
    {
      name: "finalizeGenesisLockCampaign";
      accounts: [
        {
          name: "caller";
          isMut: true;
          isSigner: true;
          docs: ["#1"];
        },
        {
          name: "cortex";
          isMut: false;
          isSigner: false;
          docs: ["#2"];
        },
        {
          name: "pool";
          isMut: true;
          isSigner: false;
          docs: ["#3"];
        },
        {
          name: "genesisLock";
          isMut: true;
          isSigner: false;
          docs: ["#4"];
        },
        {
          name: "systemProgram";
          isMut: false;
          isSigner: false;
          docs: ["#5"];
        },
        {
          name: "tokenProgram";
          isMut: false;
          isSigner: false;
          docs: ["#6"];
        },
        {
          name: "adrenaProgram";
          isMut: false;
          isSigner: false;
          docs: ["#7"];
        },
      ];
      args: [];
    },
    {
      name: "setPoolLiquidityState";
      accounts: [
        {
          name: "admin";
          isMut: false;
          isSigner: true;
          docs: ["#1"];
        },
        {
          name: "cortex";
          isMut: true;
          isSigner: false;
          docs: ["#2"];
        },
        {
          name: "pool";
          isMut: true;
          isSigner: false;
          docs: ["#3"];
        },
      ];
      args: [
        {
          name: "params";
          type: {
            defined: "SetPoolLiquidityStateParams";
          };
        },
      ];
    },
    {
      name: "finalizeLockedStake";
      accounts: [
        {
          name: "caller";
          isMut: true;
          isSigner: true;
          docs: ["#1"];
        },
        {
          name: "owner";
          isMut: true;
          isSigner: false;
          docs: ["#2"];
        },
        {
          name: "transferAuthority";
          isMut: false;
          isSigner: false;
          docs: ["#3"];
        },
        {
          name: "userStaking";
          isMut: true;
          isSigner: false;
          docs: ["#4"];
        },
        {
          name: "staking";
          isMut: true;
          isSigner: false;
          docs: ["#5"];
        },
        {
          name: "cortex";
          isMut: true;
          isSigner: false;
          docs: ["#6"];
        },
        {
          name: "lmTokenMint";
          isMut: true;
          isSigner: false;
          docs: ["#7"];
        },
        {
          name: "governanceTokenMint";
          isMut: true;
          isSigner: false;
          docs: ["#8"];
        },
        {
          name: "governanceRealm";
          isMut: false;
          isSigner: false;
          docs: [
            "#9",
            "A realm represent one project within the governance program",
          ];
        },
        {
          name: "governanceRealmConfig";
          isMut: false;
          isSigner: false;
          docs: ["#10"];
        },
        {
          name: "governanceGoverningTokenHolding";
          isMut: true;
          isSigner: false;
          docs: [
            "#11",
            "Token account owned by governance program holding user's locked tokens",
          ];
        },
        {
          name: "governanceGoverningTokenOwnerRecord";
          isMut: true;
          isSigner: false;
          docs: ["#12", "Account owned by governance storing user information"];
        },
        {
          name: "governanceProgram";
          isMut: false;
          isSigner: false;
          docs: ["#13"];
        },
        {
          name: "adrenaProgram";
          isMut: false;
          isSigner: false;
          docs: ["#14"];
        },
        {
          name: "systemProgram";
          isMut: false;
          isSigner: false;
          docs: ["#15"];
        },
        {
          name: "tokenProgram";
          isMut: false;
          isSigner: false;
          docs: ["#16"];
        },
      ];
      args: [
        {
          name: "params";
          type: {
            defined: "FinalizeLockedStakeParams";
          };
        },
      ];
    },
    {
      name: "resolveStakingRound";
      accounts: [
        {
          name: "caller";
          isMut: true;
          isSigner: true;
          docs: ["#1"];
        },
        {
          name: "payer";
          isMut: true;
          isSigner: true;
          docs: ["#2"];
        },
        {
          name: "stakingStakedTokenVault";
          isMut: true;
          isSigner: false;
          docs: ["#3"];
        },
        {
          name: "stakingRewardTokenVault";
          isMut: true;
          isSigner: false;
          docs: ["#4"];
        },
        {
          name: "stakingLmRewardTokenVault";
          isMut: true;
          isSigner: false;
          docs: ["#5"];
        },
        {
          name: "transferAuthority";
          isMut: false;
          isSigner: false;
          docs: ["#6"];
        },
        {
          name: "staking";
          isMut: true;
          isSigner: false;
          docs: ["#7"];
        },
        {
          name: "cortex";
          isMut: true;
          isSigner: false;
          docs: ["#8"];
        },
        {
          name: "lmTokenMint";
          isMut: true;
          isSigner: false;
          docs: ["#9"];
        },
        {
          name: "feeRedistributionMint";
          isMut: false;
          isSigner: false;
          docs: ["#10"];
        },
        {
          name: "adrenaProgram";
          isMut: false;
          isSigner: false;
          docs: ["#11"];
        },
        {
          name: "systemProgram";
          isMut: false;
          isSigner: false;
          docs: ["#12"];
        },
        {
          name: "tokenProgram";
          isMut: false;
          isSigner: false;
          docs: ["#13"];
        },
      ];
      args: [];
    },
    {
      name: "getLpTokenPrice";
      accounts: [
        {
          name: "cortex";
          isMut: false;
          isSigner: false;
          docs: ["#1"];
        },
        {
          name: "pool";
          isMut: false;
          isSigner: false;
          docs: ["#2"];
        },
        {
          name: "lpTokenMint";
          isMut: false;
          isSigner: false;
          docs: ["#3"];
        },
      ];
      args: [];
      returns: "u64";
    },
    {
      name: "getPoolInfoSnapshot";
      accounts: [
        {
          name: "cortex";
          isMut: false;
          isSigner: false;
          docs: ["#1"];
        },
        {
          name: "pool";
          isMut: false;
          isSigner: false;
          docs: ["#2"];
        },
        {
          name: "lpTokenMint";
          isMut: false;
          isSigner: false;
          docs: ["#3"];
        },
      ];
      args: [];
      returns: {
        defined: "PoolInfoSnapshot";
      };
    },
    {
      name: "mintLmTokensFromBucket";
      accounts: [
        {
          name: "admin";
          isMut: false;
          isSigner: true;
          docs: ["#1"];
        },
        {
          name: "receivingAccount";
          isMut: true;
          isSigner: false;
          docs: ["#2"];
        },
        {
          name: "transferAuthority";
          isMut: false;
          isSigner: false;
          docs: ["#3"];
        },
        {
          name: "cortex";
          isMut: true;
          isSigner: false;
          docs: ["#4"];
        },
        {
          name: "lmTokenMint";
          isMut: true;
          isSigner: false;
          docs: ["#5"];
        },
        {
          name: "tokenProgram";
          isMut: false;
          isSigner: false;
          docs: ["#6"];
        },
      ];
      args: [
        {
          name: "params";
          type: {
            defined: "MintLmTokensFromBucketParams";
          };
        },
      ];
      returns: "u8";
    },
    {
      name: "increasePositionLong";
      accounts: [
        {
          name: "owner";
          isMut: false;
          isSigner: true;
          docs: ["#1"];
        },
        {
          name: "payer";
          isMut: true;
          isSigner: true;
          docs: ["#2"];
        },
        {
          name: "fundingAccount";
          isMut: true;
          isSigner: false;
          docs: ["#3"];
        },
        {
          name: "transferAuthority";
          isMut: false;
          isSigner: false;
          docs: ["#4"];
        },
        {
          name: "cortex";
          isMut: true;
          isSigner: false;
          docs: ["#5"];
        },
        {
          name: "pool";
          isMut: true;
          isSigner: false;
          docs: ["#6"];
        },
        {
          name: "position";
          isMut: true;
          isSigner: false;
          docs: ["#7"];
        },
        {
          name: "custody";
          isMut: true;
          isSigner: false;
          docs: ["#8"];
        },
        {
          name: "custodyTokenAccount";
          isMut: true;
          isSigner: false;
          docs: ["#9"];
        },
        {
          name: "custodyOracle";
          isMut: false;
          isSigner: false;
          docs: ["#10"];
        },
        {
          name: "custodyTradeOracle";
          isMut: false;
          isSigner: false;
          docs: ["#11"];
        },
        {
          name: "systemProgram";
          isMut: false;
          isSigner: false;
          docs: ["#12"];
        },
        {
          name: "tokenProgram";
          isMut: false;
          isSigner: false;
          docs: ["#13"];
        },
        {
          name: "adrenaProgram";
          isMut: false;
          isSigner: false;
          docs: ["#14"];
        },
      ];
      args: [
        {
          name: "params";
          type: {
            defined: "IncreasePositionLongParams";
          };
        },
      ];
    },
    {
      name: "patchCustodyLockedAmount";
      accounts: [
        {
          name: "admin";
          isMut: false;
          isSigner: true;
          docs: ["#1"];
        },
        {
          name: "pool";
          isMut: false;
          isSigner: false;
          docs: ["#2"];
        },
        {
          name: "cortex";
          isMut: false;
          isSigner: false;
          docs: ["#3"];
        },
        {
          name: "usdcCustody";
          isMut: true;
          isSigner: false;
          docs: ["#4"];
        },
        {
          name: "bonkCustody";
          isMut: true;
          isSigner: false;
          docs: ["#5"];
        },
        {
          name: "wbtcCustody";
          isMut: true;
          isSigner: false;
          docs: ["#6"];
        },
        {
          name: "jitoCustody";
          isMut: true;
          isSigner: false;
          docs: ["#7"];
        },
      ];
      args: [];
    },
    {
      name: "increasePositionShort";
      accounts: [
        {
          name: "owner";
          isMut: false;
          isSigner: true;
          docs: ["#1"];
        },
        {
          name: "payer";
          isMut: true;
          isSigner: true;
          docs: ["#2"];
        },
        {
          name: "fundingAccount";
          isMut: true;
          isSigner: false;
          docs: ["#3"];
        },
        {
          name: "transferAuthority";
          isMut: false;
          isSigner: false;
          docs: ["#4"];
        },
        {
          name: "cortex";
          isMut: true;
          isSigner: false;
          docs: ["#5"];
        },
        {
          name: "pool";
          isMut: true;
          isSigner: false;
          docs: ["#6"];
        },
        {
          name: "position";
          isMut: true;
          isSigner: false;
          docs: ["#7"];
        },
        {
          name: "custody";
          isMut: true;
          isSigner: false;
          docs: ["#8"];
        },
        {
          name: "custodyTradeOracle";
          isMut: false;
          isSigner: false;
          docs: ["#9"];
        },
        {
          name: "collateralCustody";
          isMut: true;
          isSigner: false;
          docs: ["#10"];
        },
        {
          name: "collateralCustodyOracle";
          isMut: false;
          isSigner: false;
          docs: ["#11"];
        },
        {
          name: "collateralCustodyTokenAccount";
          isMut: true;
          isSigner: false;
          docs: ["#12"];
        },
        {
          name: "systemProgram";
          isMut: false;
          isSigner: false;
          docs: ["#13"];
        },
        {
          name: "tokenProgram";
          isMut: false;
          isSigner: false;
          docs: ["#14"];
        },
        {
          name: "adrenaProgram";
          isMut: false;
          isSigner: false;
          docs: ["#15"];
        },
      ];
      args: [
        {
          name: "params";
          type: {
            defined: "IncreasePositionShortParams";
          };
        },
      ];
    },
    {
      name: "setStakingLmEmissionPotentiometers";
      accounts: [
        {
          name: "admin";
          isMut: false;
          isSigner: true;
          docs: ["#1"];
        },
        {
          name: "cortex";
          isMut: false;
          isSigner: false;
          docs: ["#2"];
        },
        {
          name: "staking";
          isMut: true;
          isSigner: false;
          docs: ["#3"];
        },
      ];
      args: [
        {
          name: "params";
          type: {
            defined: "SetStakingLmEmissionPotentiometersParams";
          };
        },
      ];
    },
    {
      name: "setAdmin";
      accounts: [
        {
          name: "admin";
          isMut: false;
          isSigner: true;
          docs: ["#1"];
        },
        {
          name: "cortex";
          isMut: true;
          isSigner: false;
          docs: ["#2"];
        },
      ];
      args: [
        {
          name: "params";
          type: {
            defined: "SetAdminParams";
          };
        },
      ];
    },
    {
      name: "setProtocolFeeRecipient";
      accounts: [
        {
          name: "admin";
          isMut: false;
          isSigner: true;
          docs: ["#1"];
        },
        {
          name: "cortex";
          isMut: true;
          isSigner: false;
          docs: ["#2"];
        },
        {
          name: "protocolFeeRecipient";
          isMut: false;
          isSigner: false;
          docs: ["#3"];
        },
        {
          name: "feeRedistributionMint";
          isMut: false;
          isSigner: false;
          docs: ["#4"];
        },
      ];
      args: [];
    },
    {
      name: "setCustodyMaxCumulativeShortPositionSizeUsd";
      accounts: [
        {
          name: "admin";
          isMut: false;
          isSigner: true;
          docs: ["#1"];
        },
        {
          name: "cortex";
          isMut: true;
          isSigner: false;
          docs: ["#2"];
        },
        {
          name: "pool";
          isMut: true;
          isSigner: false;
          docs: ["#3"];
        },
        {
          name: "custody";
          isMut: true;
          isSigner: false;
          docs: ["#4"];
        },
      ];
      args: [
        {
          name: "params";
          type: {
            defined: "SetCustodyMaxCumulativeShortPositionSizeUsdParams";
          };
        },
      ];
    },
    {
      name: "setTakeProfitLong";
      accounts: [
        {
          name: "owner";
          isMut: true;
          isSigner: true;
          docs: ["#1"];
        },
        {
          name: "cortex";
          isMut: true;
          isSigner: false;
          docs: ["#2"];
        },
        {
          name: "pool";
          isMut: true;
          isSigner: false;
          docs: ["#3"];
        },
        {
          name: "position";
          isMut: true;
          isSigner: false;
          docs: ["#4"];
        },
        {
          name: "custody";
          isMut: true;
          isSigner: false;
          docs: ["#5"];
        },
      ];
      args: [
        {
          name: "params";
          type: {
            defined: "SetTakeProfitLongParams";
          };
        },
      ];
    },
    {
      name: "setStopLossLong";
      accounts: [
        {
          name: "owner";
          isMut: true;
          isSigner: true;
          docs: ["#1"];
        },
        {
          name: "cortex";
          isMut: false;
          isSigner: false;
          docs: ["#2"];
        },
        {
          name: "pool";
          isMut: false;
          isSigner: false;
          docs: ["#3"];
        },
        {
          name: "position";
          isMut: true;
          isSigner: false;
          docs: ["#4"];
        },
        {
          name: "custody";
          isMut: false;
          isSigner: false;
          docs: ["#5"];
        },
      ];
      args: [
        {
          name: "params";
          type: {
            defined: "SetStopLossLongParams";
          };
        },
      ];
    },
    {
      name: "setTakeProfitShort";
      accounts: [
        {
          name: "owner";
          isMut: true;
          isSigner: true;
          docs: ["#1"];
        },
        {
          name: "cortex";
          isMut: true;
          isSigner: false;
          docs: ["#2"];
        },
        {
          name: "pool";
          isMut: true;
          isSigner: false;
          docs: ["#3"];
        },
        {
          name: "position";
          isMut: true;
          isSigner: false;
          docs: ["#4"];
        },
        {
          name: "custody";
          isMut: true;
          isSigner: false;
          docs: ["#5"];
        },
      ];
      args: [
        {
          name: "params";
          type: {
            defined: "SetTakeProfitShortParams";
          };
        },
      ];
    },
    {
      name: "setStopLossShort";
      accounts: [
        {
          name: "owner";
          isMut: true;
          isSigner: true;
          docs: ["#1"];
        },
        {
          name: "cortex";
          isMut: false;
          isSigner: false;
          docs: ["#2"];
        },
        {
          name: "pool";
          isMut: false;
          isSigner: false;
          docs: ["#3"];
        },
        {
          name: "position";
          isMut: true;
          isSigner: false;
          docs: ["#4"];
        },
        {
          name: "custody";
          isMut: false;
          isSigner: false;
          docs: ["#5"];
        },
      ];
      args: [
        {
          name: "params";
          type: {
            defined: "SetStopLossShortParams";
          };
        },
      ];
    },
    {
      name: "cancelTakeProfit";
      accounts: [
        {
          name: "owner";
          isMut: true;
          isSigner: true;
          docs: ["#1"];
        },
        {
          name: "cortex";
          isMut: false;
          isSigner: false;
          docs: ["#2"];
        },
        {
          name: "pool";
          isMut: false;
          isSigner: false;
          docs: ["#3"];
        },
        {
          name: "position";
          isMut: true;
          isSigner: false;
          docs: ["#4"];
        },
        {
          name: "custody";
          isMut: false;
          isSigner: false;
          docs: ["#5"];
        },
      ];
      args: [];
    },
    {
      name: "cancelStopLoss";
      accounts: [
        {
          name: "owner";
          isMut: true;
          isSigner: true;
          docs: ["#1"];
        },
        {
          name: "cortex";
          isMut: false;
          isSigner: false;
          docs: ["#2"];
        },
        {
          name: "pool";
          isMut: false;
          isSigner: false;
          docs: ["#3"];
        },
        {
          name: "position";
          isMut: true;
          isSigner: false;
          docs: ["#4"];
        },
        {
          name: "custody";
          isMut: false;
          isSigner: false;
          docs: ["#5"];
        },
      ];
      args: [];
    },
    {
      name: "patchStakingRound";
      accounts: [
        {
          name: "admin";
          isMut: false;
          isSigner: true;
          docs: ["#1"];
        },
        {
          name: "payer";
          isMut: true;
          isSigner: true;
          docs: ["#2"];
        },
        {
          name: "fundingAccount";
          isMut: true;
          isSigner: false;
          docs: ["#3"];
        },
        {
          name: "stakingRewardTokenVault";
          isMut: true;
          isSigner: false;
          docs: ["#4"];
        },
        {
          name: "stakingLmRewardTokenVault";
          isMut: true;
          isSigner: false;
          docs: ["#5"];
        },
        {
          name: "transferAuthority";
          isMut: false;
          isSigner: false;
          docs: ["#6"];
        },
        {
          name: "staking";
          isMut: true;
          isSigner: false;
          docs: ["#7"];
        },
        {
          name: "cortex";
          isMut: true;
          isSigner: false;
          docs: ["#8"];
        },
        {
          name: "lmTokenMint";
          isMut: true;
          isSigner: false;
          docs: ["#9"];
        },
        {
          name: "feeRedistributionMint";
          isMut: false;
          isSigner: false;
          docs: ["#10"];
        },
        {
          name: "adrenaProgram";
          isMut: false;
          isSigner: false;
          docs: ["#11"];
        },
        {
          name: "systemProgram";
          isMut: false;
          isSigner: false;
          docs: ["#12"];
        },
        {
          name: "tokenProgram";
          isMut: false;
          isSigner: false;
          docs: ["#13"];
        },
      ];
      args: [];
    },
    {
      name: "setPoolWhitelistedSwapper";
      accounts: [
        {
          name: "admin";
          isMut: false;
          isSigner: true;
          docs: ["#1"];
        },
        {
          name: "cortex";
          isMut: false;
          isSigner: false;
          docs: ["#2"];
        },
        {
          name: "pool";
          isMut: true;
          isSigner: false;
          docs: ["#3"];
        },
        {
          name: "whitelistedSwapper";
          isMut: false;
          isSigner: false;
          docs: ["#4"];
        },
      ];
      args: [];
    },
  ];
  accounts: [
    {
      name: "cortex";
      type: {
        kind: "struct";
        fields: [
          {
            name: "bump";
            type: "u8";
          },
          {
            name: "transferAuthorityBump";
            type: "u8";
          },
          {
            name: "lmTokenBump";
            type: "u8";
          },
          {
            name: "governanceTokenBump";
            type: "u8";
          },
          {
            name: "initialized";
            type: "u8";
          },
          {
            name: "feeConversionDecimals";
            type: "u8";
          },
          {
            name: "padding";
            type: {
              array: ["u8", 2];
            };
          },
          {
            name: "lmTokenMint";
            type: "publicKey";
          },
          {
            name: "inceptionTime";
            type: "i64";
          },
          {
            name: "admin";
            type: "publicKey";
          },
          {
            name: "feeRedistributionMint";
            type: "publicKey";
          },
          {
            name: "protocolFeeRecipient";
            type: "publicKey";
          },
          {
            name: "pools";
            type: {
              array: ["publicKey", 4];
            };
          },
          {
            name: "userProfilesCount";
            type: "u64";
          },
          {
            name: "governanceProgram";
            type: "publicKey";
          },
          {
            name: "governanceRealm";
            type: "publicKey";
          },
          {
            name: "coreContributorBucketAllocation";
            type: "u64";
          },
          {
            name: "foundationBucketAllocation";
            type: "u64";
          },
          {
            name: "ecosystemBucketAllocation";
            type: "u64";
          },
          {
            name: "coreContributorBucketVestedAmount";
            type: "u64";
          },
          {
            name: "coreContributorBucketMintedAmount";
            type: "u64";
          },
          {
            name: "foundationBucketVestedAmount";
            type: "u64";
          },
          {
            name: "foundationBucketMintedAmount";
            type: "u64";
          },
          {
            name: "ecosystemBucketVestedAmount";
            type: "u64";
          },
          {
            name: "ecosystemBucketMintedAmount";
            type: "u64";
          },
          {
            name: "genesisLiquidityAlpAmount";
            type: "u64";
          },
          {
            name: "uniquePositionIdCounter";
            type: "u64";
          },
        ];
      };
    },
    {
      name: "custody";
      type: {
        kind: "struct";
        fields: [
          {
            name: "bump";
            type: "u8";
          },
          {
            name: "tokenAccountBump";
            type: "u8";
          },
          {
            name: "allowTrade";
            type: "u8";
          },
          {
            name: "allowSwap";
            type: "u8";
          },
          {
            name: "decimals";
            type: "u8";
          },
          {
            name: "isStable";
            type: "u8";
          },
          {
            name: "padding";
            type: {
              array: ["u8", 2];
            };
          },
          {
            name: "pool";
            type: "publicKey";
          },
          {
            name: "mint";
            type: "publicKey";
          },
          {
            name: "tokenAccount";
            type: "publicKey";
          },
          {
            name: "oracle";
            type: "publicKey";
          },
          {
            name: "tradeOracle";
            type: "publicKey";
          },
          {
            name: "pricing";
            type: {
              defined: "PricingParams";
            };
          },
          {
            name: "fees";
            type: {
              defined: "Fees";
            };
          },
          {
            name: "borrowRate";
            type: {
              defined: "BorrowRateParams";
            };
          },
          {
            name: "collectedFees";
            type: {
              defined: "FeesStats";
            };
          },
          {
            name: "volumeStats";
            type: {
              defined: "VolumeStats";
            };
          },
          {
            name: "tradeStats";
            type: {
              defined: "TradeStats";
            };
          },
          {
            name: "assets";
            type: {
              defined: "Assets";
            };
          },
          {
            name: "longPositions";
            type: {
              defined: "PositionsAccounting";
            };
          },
          {
            name: "shortPositions";
            type: {
              defined: "PositionsAccounting";
            };
          },
          {
            name: "borrowRateState";
            type: {
              defined: "BorrowRateState";
            };
          },
        ];
      };
    },
    {
      name: "genesisLock";
      type: {
        kind: "struct";
        fields: [
          {
            name: "bump";
            type: "u8";
          },
          {
            name: "hasTransitionedToFullyPublic";
            type: "u8";
          },
          {
            name: "hasCompletedOtcIn";
            type: "u8";
          },
          {
            name: "hasCompletedOtcOut";
            type: "u8";
          },
          {
            name: "padding";
            type: {
              array: ["u8", 4];
            };
          },
          {
            name: "campaignDuration";
            type: "i64";
          },
          {
            name: "reservedGrantDuration";
            type: "i64";
          },
          {
            name: "campaignStartDate";
            type: "i64";
          },
          {
            name: "publicAmount";
            type: "u64";
          },
          {
            name: "reservedAmount";
            type: "u64";
          },
          {
            name: "publicAmountClaimed";
            type: "u64";
          },
          {
            name: "reservedAmountClaimed";
            type: "u64";
          },
          {
            name: "reservedGrantOwners";
            type: {
              array: ["publicKey", 43];
            };
          },
          {
            name: "reservedGrantAmounts";
            type: {
              array: ["u64", 43];
            };
          },
          {
            name: "paddingUnsafe";
            type: {
              array: ["u8", 8];
            };
          },
        ];
      };
    },
    {
      name: "pool";
      type: {
        kind: "struct";
        fields: [
          {
            name: "bump";
            type: "u8";
          },
          {
            name: "lpTokenBump";
            type: "u8";
          },
          {
            name: "nbStableCustody";
            type: "u8";
          },
          {
            name: "initialized";
            type: "u8";
          },
          {
            name: "allowTrade";
            type: "u8";
          },
          {
            name: "allowSwap";
            type: "u8";
          },
          {
            name: "liquidityState";
            type: "u8";
          },
          {
            name: "registeredCustodyCount";
            type: "u8";
          },
          {
            name: "name";
            type: {
              defined: "LimitedString";
            };
          },
          {
            name: "custodies";
            type: {
              array: ["publicKey", 8];
            };
          },
          {
            name: "padding1";
            type: {
              array: ["u8", 32];
            };
          },
          {
            name: "whitelistedSwapper";
            type: "publicKey";
          },
          {
            name: "ratios";
            type: {
              array: [
                {
                  defined: "TokenRatios";
                },
                8,
              ];
            };
          },
          {
            name: "padding2";
            type: {
              array: ["u8", 16];
            };
          },
          {
            name: "aumUsd";
            type: {
              defined: "U128Split";
            };
          },
          {
            name: "inceptionTime";
            type: "i64";
          },
          {
            name: "aumSoftCapUsd";
            type: "u64";
          },
        ];
      };
    },
    {
      name: "position";
      type: {
        kind: "struct";
        fields: [
          {
            name: "bump";
            type: "u8";
          },
          {
            name: "side";
            type: "u8";
          },
          {
            name: "takeProfitIsSet";
            type: "u8";
          },
          {
            name: "stopLossIsSet";
            type: "u8";
          },
          {
            name: "paddingUnsafe";
            type: {
              array: ["u8", 1];
            };
          },
          {
            name: "padding";
            type: {
              array: ["u8", 3];
            };
          },
          {
            name: "owner";
            type: "publicKey";
          },
          {
            name: "pool";
            type: "publicKey";
          },
          {
            name: "custody";
            type: "publicKey";
          },
          {
            name: "collateralCustody";
            type: "publicKey";
          },
          {
            name: "openTime";
            type: "i64";
          },
          {
            name: "updateTime";
            type: "i64";
          },
          {
            name: "price";
            type: "u64";
          },
          {
            name: "sizeUsd";
            type: "u64";
          },
          {
            name: "borrowSizeUsd";
            type: "u64";
          },
          {
            name: "collateralUsd";
            type: "u64";
          },
          {
            name: "unrealizedInterestUsd";
            type: "u64";
          },
          {
            name: "cumulativeInterestSnapshot";
            type: {
              defined: "U128Split";
            };
          },
          {
            name: "lockedAmount";
            type: "u64";
          },
          {
            name: "collateralAmount";
            type: "u64";
          },
          {
            name: "exitFeeUsd";
            type: "u64";
          },
          {
            name: "liquidationFeeUsd";
            type: "u64";
          },
          {
            name: "id";
            type: "u64";
          },
          {
            name: "takeProfitLimitPrice";
            type: "u64";
          },
          {
            name: "paddingUnsafe3";
            type: {
              array: ["u8", 8];
            };
          },
          {
            name: "stopLossLimitPrice";
            type: "u64";
          },
          {
            name: "stopLossClosePositionPrice";
            type: "u64";
          },
        ];
      };
    },
    {
      name: "staking";
      type: {
        kind: "struct";
        fields: [
          {
            name: "stakingType";
            type: "u8";
          },
          {
            name: "bump";
            type: "u8";
          },
          {
            name: "stakedTokenVaultBump";
            type: "u8";
          },
          {
            name: "rewardTokenVaultBump";
            type: "u8";
          },
          {
            name: "lmRewardTokenVaultBump";
            type: "u8";
          },
          {
            name: "rewardTokenDecimals";
            type: "u8";
          },
          {
            name: "stakedTokenDecimals";
            type: "u8";
          },
          {
            name: "initialized";
            type: "u8";
          },
          {
            name: "nbLockedTokens";
            type: "u64";
          },
          {
            name: "nbLiquidTokens";
            type: "u64";
          },
          {
            name: "stakedTokenMint";
            type: "publicKey";
          },
          {
            name: "resolvedRewardTokenAmount";
            type: "u64";
          },
          {
            name: "resolvedStakedTokenAmount";
            type: "u64";
          },
          {
            name: "resolvedLmRewardTokenAmount";
            type: "u64";
          },
          {
            name: "resolvedLmStakedTokenAmount";
            type: "u64";
          },
          {
            name: "currentStakingRound";
            type: {
              defined: "StakingRound";
            };
          },
          {
            name: "nextStakingRound";
            type: {
              defined: "StakingRound";
            };
          },
          {
            name: "resolvedStakingRounds";
            type: {
              array: [
                {
                  defined: "StakingRound";
                },
                32,
              ];
            };
          },
          {
            name: "registeredResolvedStakingRoundCount";
            type: "u8";
          },
          {
            name: "padding";
            type: {
              array: ["u8", 3];
            };
          },
          {
            name: "lmEmissionPotentiometerBps";
            type: "u16";
          },
          {
            name: "monthsElapsedSinceInception";
            type: "u16";
          },
          {
            name: "paddingUnsafe";
            type: {
              array: ["u8", 8];
            };
          },
          {
            name: "emissionAmountPerRoundLastUpdate";
            type: "i64";
          },
          {
            name: "currentMonthEmissionAmountPerRound";
            type: "u64";
          },
        ];
      };
    },
    {
      name: "userProfile";
      type: {
        kind: "struct";
        fields: [
          {
            name: "bump";
            type: "u8";
          },
          {
            name: "padding";
            type: {
              array: ["u8", 7];
            };
          },
          {
            name: "nickname";
            type: {
              defined: "LimitedString";
            };
          },
          {
            name: "createdAt";
            type: "i64";
          },
          {
            name: "owner";
            type: "publicKey";
          },
          {
            name: "swapCount";
            type: "u64";
          },
          {
            name: "swapVolumeUsd";
            type: "u64";
          },
          {
            name: "swapFeePaidUsd";
            type: "u64";
          },
          {
            name: "shortStats";
            type: {
              defined: "TradingStats";
            };
          },
          {
            name: "longStats";
            type: {
              defined: "TradingStats";
            };
          },
        ];
      };
    },
    {
      name: "userStaking";
      type: {
        kind: "struct";
        fields: [
          {
            name: "bump";
            type: "u8";
          },
          {
            name: "unusedUnsafe";
            type: {
              array: ["u8", 1];
            };
          },
          {
            name: "stakingType";
            type: "u8";
          },
          {
            name: "padding";
            type: {
              array: ["u8", 5];
            };
          },
          {
            name: "lockedStakeIdCounter";
            type: "u64";
          },
          {
            name: "liquidStake";
            type: {
              defined: "LiquidStake";
            };
          },
          {
            name: "lockedStakes";
            type: {
              array: [
                {
                  defined: "LockedStake";
                },
                32,
              ];
            };
          },
        ];
      };
    },
    {
      name: "vestRegistry";
      type: {
        kind: "struct";
        fields: [
          {
            name: "bump";
            type: "u8";
          },
          {
            name: "vests";
            type: {
              vec: "publicKey";
            };
          },
          {
            name: "vestingTokenAmount";
            type: "u64";
          },
          {
            name: "vestedTokenAmount";
            type: "u64";
          },
        ];
      };
    },
    {
      name: "vest";
      type: {
        kind: "struct";
        fields: [
          {
            name: "bump";
            type: "u8";
          },
          {
            name: "originBucket";
            type: "u8";
          },
          {
            name: "cancelled";
            type: "u8";
          },
          {
            name: "padding";
            type: {
              array: ["u8", 1];
            };
          },
          {
            name: "voteMultiplier";
            type: "u32";
          },
          {
            name: "amount";
            type: "u64";
          },
          {
            name: "unlockStartTimestamp";
            type: "i64";
          },
          {
            name: "unlockEndTimestamp";
            type: "i64";
          },
          {
            name: "claimedAmount";
            type: "u64";
          },
          {
            name: "lastClaimTimestamp";
            type: "i64";
          },
          {
            name: "owner";
            type: "publicKey";
          },
        ];
      };
    },
  ];
  types: [
    {
      name: "MintLmTokensFromBucketParams";
      type: {
        kind: "struct";
        fields: [
          {
            name: "bucketName";
            type: "u8";
          },
          {
            name: "amount";
            type: "u64";
          },
          {
            name: "reason";
            type: "string";
          },
        ];
      };
    },
    {
      name: "SetAdminParams";
      type: {
        kind: "struct";
        fields: [
          {
            name: "newAdmin";
            type: "publicKey";
          },
        ];
      };
    },
    {
      name: "AddCustodyParams";
      type: {
        kind: "struct";
        fields: [
          {
            name: "isStable";
            type: "bool";
          },
          {
            name: "pricing";
            type: {
              defined: "PricingParams";
            };
          },
          {
            name: "allowSwap";
            type: "bool";
          },
          {
            name: "allowTrade";
            type: "bool";
          },
          {
            name: "fees";
            type: {
              defined: "Fees";
            };
          },
          {
            name: "borrowRate";
            type: {
              defined: "BorrowRateParams";
            };
          },
          {
            name: "ratios";
            type: {
              array: [
                {
                  defined: "TokenRatios";
                },
                8,
              ];
            };
          },
        ];
      };
    },
    {
      name: "RemoveCustodyParams";
      type: {
        kind: "struct";
        fields: [
          {
            name: "ratios";
            type: {
              array: [
                {
                  defined: "TokenRatios";
                },
                8,
              ];
            };
          },
        ];
      };
    },
    {
      name: "SetCustodyAllowSwapParams";
      type: {
        kind: "struct";
        fields: [
          {
            name: "allowSwap";
            type: "bool";
          },
        ];
      };
    },
    {
      name: "SetCustodyAllowTradeParams";
      type: {
        kind: "struct";
        fields: [
          {
            name: "allowTrade";
            type: "bool";
          },
        ];
      };
    },
    {
      name: "SetCustodyConfigParams";
      type: {
        kind: "struct";
        fields: [
          {
            name: "isStable";
            type: "bool";
          },
          {
            name: "oracle";
            type: "publicKey";
          },
          {
            name: "tradeOracle";
            type: "publicKey";
          },
          {
            name: "pricing";
            type: {
              defined: "PricingParams";
            };
          },
          {
            name: "fees";
            type: {
              defined: "Fees";
            };
          },
          {
            name: "borrowRate";
            type: {
              defined: "BorrowRateParams";
            };
          },
          {
            name: "ratios";
            type: {
              array: [
                {
                  defined: "TokenRatios";
                },
                8,
              ];
            };
          },
        ];
      };
    },
    {
      name: "SetCustodyMaxCumulativeShortPositionSizeUsdParams";
      type: {
        kind: "struct";
        fields: [
          {
            name: "maxCumulativeShortPositionSizeUsd";
            type: "u64";
          },
        ];
      };
    },
    {
      name: "InitOneParams";
      type: {
        kind: "struct";
        fields: [
          {
            name: "coreContributorBucketAllocation";
            type: "u64";
          },
          {
            name: "foundationBucketAllocation";
            type: "u64";
          },
          {
            name: "ecosystemBucketAllocation";
            type: "u64";
          },
        ];
      };
    },
    {
      name: "AddPoolPartOneParams";
      type: {
        kind: "struct";
        fields: [
          {
            name: "name";
            type: "string";
          },
          {
            name: "aumSoftCapUsd";
            type: "u64";
          },
          {
            name: "lpTokenName";
            type: "string";
          },
          {
            name: "lpTokenSymbol";
            type: "string";
          },
          {
            name: "lpTokenUri";
            type: "string";
          },
        ];
      };
    },
    {
      name: "AddPoolPartTwoParams";
      type: {
        kind: "struct";
        fields: [
          {
            name: "genesisLockCampaignDuration";
            type: "i64";
          },
          {
            name: "genesisReservedGrantDuration";
            type: "i64";
          },
          {
            name: "genesisLockCampaignStartDate";
            type: "i64";
          },
          {
            name: "reservedSpots";
            type: {
              defined: "ReservedSpots";
            };
          },
        ];
      };
    },
    {
      name: "GenesisOtcInParams";
      type: {
        kind: "struct";
        fields: [
          {
            name: "custodyOneAmount";
            type: "u64";
          },
          {
            name: "custodyTwoAmount";
            type: "u64";
          },
          {
            name: "custodyThreeAmount";
            type: "u64";
          },
        ];
      };
    },
    {
      name: "SetPoolAllowSwapParams";
      type: {
        kind: "struct";
        fields: [
          {
            name: "allowSwap";
            type: "bool";
          },
        ];
      };
    },
    {
      name: "SetPoolAllowTradeParams";
      type: {
        kind: "struct";
        fields: [
          {
            name: "allowTrade";
            type: "bool";
          },
        ];
      };
    },
    {
      name: "SetPoolAumSoftCapUsdParams";
      type: {
        kind: "struct";
        fields: [
          {
            name: "aumSoftCapUsd";
            type: "u64";
          },
        ];
      };
    },
    {
      name: "SetPoolLiquidityStateParams";
      type: {
        kind: "struct";
        fields: [
          {
            name: "liquidityState";
            type: "u8";
          },
        ];
      };
    },
    {
      name: "InitStakingOneParams";
      type: {
        kind: "struct";
        fields: [
          {
            name: "stakingType";
            type: "u8";
          },
        ];
      };
    },
    {
      name: "SetStakingLmEmissionPotentiometersParams";
      type: {
        kind: "struct";
        fields: [
          {
            name: "lmEmissionPotentiometerBps";
            type: "u16";
          },
        ];
      };
    },
    {
      name: "AddVestParams";
      type: {
        kind: "struct";
        fields: [
          {
            name: "amount";
            type: "u64";
          },
          {
            name: "originBucket";
            type: "u8";
          },
          {
            name: "unlockStartTimestamp";
            type: "i64";
          },
          {
            name: "unlockEndTimestamp";
            type: "i64";
          },
          {
            name: "voteMultiplier";
            type: "u32";
          },
        ];
      };
    },
    {
      name: "AddGenesisLiquidityParams";
      type: {
        kind: "struct";
        fields: [
          {
            name: "amountIn";
            type: "u64";
          },
          {
            name: "minLpAmountOut";
            type: "u64";
          },
        ];
      };
    },
    {
      name: "AddLiquidityParams";
      type: {
        kind: "struct";
        fields: [
          {
            name: "amountIn";
            type: "u64";
          },
          {
            name: "minLpAmountOut";
            type: "u64";
          },
        ];
      };
    },
    {
      name: "RemoveLiquidityParams";
      type: {
        kind: "struct";
        fields: [
          {
            name: "lpAmountIn";
            type: "u64";
          },
          {
            name: "minAmountOut";
            type: "u64";
          },
        ];
      };
    },
    {
      name: "SwapParams";
      type: {
        kind: "struct";
        fields: [
          {
            name: "amountIn";
            type: "u64";
          },
          {
            name: "minAmountOut";
            type: "u64";
          },
        ];
      };
    },
    {
      name: "AddCollateralLongParams";
      type: {
        kind: "struct";
        fields: [
          {
            name: "collateral";
            type: "u64";
          },
        ];
      };
    },
    {
      name: "AddCollateralShortParams";
      type: {
        kind: "struct";
        fields: [
          {
            name: "collateral";
            type: "u64";
          },
        ];
      };
    },
    {
      name: "SetStopLossLongParams";
      type: {
        kind: "struct";
        fields: [
          {
            name: "stopLossLimitPrice";
            type: "u64";
          },
          {
            name: "closePositionPrice";
            type: {
              option: "u64";
            };
          },
        ];
      };
    },
    {
      name: "SetStopLossShortParams";
      type: {
        kind: "struct";
        fields: [
          {
            name: "stopLossLimitPrice";
            type: "u64";
          },
          {
            name: "closePositionPrice";
            type: {
              option: "u64";
            };
          },
        ];
      };
    },
    {
      name: "SetTakeProfitLongParams";
      type: {
        kind: "struct";
        fields: [
          {
            name: "takeProfitLimitPrice";
            type: "u64";
          },
        ];
      };
    },
    {
      name: "SetTakeProfitShortParams";
      type: {
        kind: "struct";
        fields: [
          {
            name: "takeProfitLimitPrice";
            type: "u64";
          },
        ];
      };
    },
    {
      name: "ClosePositionLongParams";
      type: {
        kind: "struct";
        fields: [
          {
            name: "price";
            type: {
              option: "u64";
            };
          },
        ];
      };
    },
    {
      name: "ClosePositionShortParams";
      type: {
        kind: "struct";
        fields: [
          {
            name: "price";
            type: {
              option: "u64";
            };
          },
        ];
      };
    },
    {
      name: "IncreasePositionLongParams";
      type: {
        kind: "struct";
        fields: [
          {
            name: "price";
            type: "u64";
          },
          {
            name: "collateral";
            type: "u64";
          },
          {
            name: "leverage";
            type: "u32";
          },
        ];
      };
    },
    {
      name: "IncreasePositionShortParams";
      type: {
        kind: "struct";
        fields: [
          {
            name: "price";
            type: "u64";
          },
          {
            name: "collateral";
            type: "u64";
          },
          {
            name: "leverage";
            type: "u32";
          },
        ];
      };
    },
    {
      name: "LiquidateLongParams";
      type: {
        kind: "struct";
        fields: [];
      };
    },
    {
      name: "LiquidateShortParams";
      type: {
        kind: "struct";
        fields: [];
      };
    },
    {
      name: "OpenPositionWithSwapParams";
      type: {
        kind: "struct";
        fields: [
          {
            name: "price";
            type: "u64";
          },
          {
            name: "collateral";
            type: "u64";
          },
          {
            name: "leverage";
            type: "u32";
          },
          {
            name: "referrer";
            type: {
              option: "publicKey";
            };
          },
        ];
      };
    },
    {
      name: "OpenPositionLongParams";
      type: {
        kind: "struct";
        fields: [
          {
            name: "price";
            type: "u64";
          },
          {
            name: "collateral";
            type: "u64";
          },
          {
            name: "leverage";
            type: "u32";
          },
          {
            name: "referrer";
            type: {
              option: "publicKey";
            };
          },
        ];
      };
    },
    {
      name: "OpenPositionShortParams";
      type: {
        kind: "struct";
        fields: [
          {
            name: "price";
            type: "u64";
          },
          {
            name: "collateral";
            type: "u64";
          },
          {
            name: "leverage";
            type: "u32";
          },
          {
            name: "referrer";
            type: {
              option: "publicKey";
            };
          },
        ];
      };
    },
    {
      name: "RemoveCollateralLongParams";
      type: {
        kind: "struct";
        fields: [
          {
            name: "collateralUsd";
            type: "u64";
          },
        ];
      };
    },
    {
      name: "RemoveCollateralShortParams";
      type: {
        kind: "struct";
        fields: [
          {
            name: "collateralUsd";
            type: "u64";
          },
        ];
      };
    },
    {
      name: "AddLiquidStakeParams";
      type: {
        kind: "struct";
        fields: [
          {
            name: "amount";
            type: "u64";
          },
        ];
      };
    },
    {
      name: "AddLockedStakeParams";
      type: {
        kind: "struct";
        fields: [
          {
            name: "amount";
            type: "u64";
          },
          {
            name: "lockedDays";
            type: "u32";
          },
        ];
      };
    },
    {
      name: "ClaimStakesParams";
      type: {
        kind: "struct";
        fields: [
          {
            name: "lockedStakeIndexes";
            type: {
              option: "bytes";
            };
          },
        ];
      };
    },
    {
      name: "FinalizeLockedStakeParams";
      type: {
        kind: "struct";
        fields: [
          {
            name: "lockedStakeId";
            type: "u64";
          },
          {
            name: "earlyExit";
            type: "bool";
          },
        ];
      };
    },
    {
      name: "RemoveLiquidStakeParams";
      type: {
        kind: "struct";
        fields: [
          {
            name: "amount";
            type: "u64";
          },
        ];
      };
    },
    {
      name: "RemoveLockedStakeParams";
      type: {
        kind: "struct";
        fields: [
          {
            name: "lockedStakeIndex";
            type: "u64";
          },
        ];
      };
    },
    {
      name: "UpgradeLockedStakeParams";
      type: {
        kind: "struct";
        fields: [
          {
            name: "lockedStakeId";
            type: "u64";
          },
          {
            name: "amount";
            type: {
              option: "u64";
            };
          },
          {
            name: "lockedDays";
            type: {
              option: "u32";
            };
          },
        ];
      };
    },
    {
      name: "EditUserProfileParams";
      type: {
        kind: "struct";
        fields: [
          {
            name: "nickname";
            type: "string";
          },
        ];
      };
    },
    {
      name: "InitUserProfileParams";
      type: {
        kind: "struct";
        fields: [
          {
            name: "nickname";
            type: "string";
          },
        ];
      };
    },
    {
      name: "GetAddLiquidityAmountAndFeeParams";
      type: {
        kind: "struct";
        fields: [
          {
            name: "amountIn";
            type: "u64";
          },
        ];
      };
    },
    {
      name: "GetEntryPriceAndFeeParams";
      type: {
        kind: "struct";
        fields: [
          {
            name: "collateral";
            type: "u64";
          },
          {
            name: "leverage";
            type: "u32";
          },
          {
            name: "side";
            type: "u8";
          },
        ];
      };
    },
    {
      name: "GetLiquidationPriceParams";
      type: {
        kind: "struct";
        fields: [
          {
            name: "addCollateral";
            type: "u64";
          },
          {
            name: "removeCollateral";
            type: "u64";
          },
        ];
      };
    },
    {
      name: "GetOpenPositionWithSwapAmountAndFeesParams";
      type: {
        kind: "struct";
        fields: [
          {
            name: "collateralAmount";
            type: "u64";
          },
          {
            name: "leverage";
            type: "u32";
          },
          {
            name: "side";
            type: "u8";
          },
        ];
      };
    },
    {
      name: "CustodyInfoSnapshot";
      type: {
        kind: "struct";
        fields: [
          {
            name: "assetsValueUsd";
            type: "u64";
          },
          {
            name: "owned";
            type: "u64";
          },
          {
            name: "locked";
            type: "u64";
          },
          {
            name: "price";
            type: "u64";
          },
          {
            name: "priceConfidence";
            type: "u64";
          },
          {
            name: "tradePrice";
            type: "u64";
          },
          {
            name: "tradePriceConfidence";
            type: "u64";
          },
          {
            name: "shortPnl";
            type: "i64";
          },
          {
            name: "longPnl";
            type: "i64";
          },
          {
            name: "openInterestLongUsd";
            type: "u64";
          },
          {
            name: "openInterestShortUsd";
            type: "u64";
          },
          {
            name: "cumulativeProfitUsd";
            type: "u64";
          },
          {
            name: "cumulativeLossUsd";
            type: "u64";
          },
          {
            name: "cumulativeSwapFeeUsd";
            type: "u64";
          },
          {
            name: "cumulativeLiquidityFeeUsd";
            type: "u64";
          },
          {
            name: "cumulativeClosePositionFeeUsd";
            type: "u64";
          },
          {
            name: "cumulativeLiquidationFeeUsd";
            type: "u64";
          },
          {
            name: "cumulativeBorrowFeeUsd";
            type: "u64";
          },
          {
            name: "cumulativeTradingVolumeUsd";
            type: "u64";
          },
        ];
      };
    },
    {
      name: "PoolInfoSnapshot";
      type: {
        kind: "struct";
        fields: [
          {
            name: "currentTime";
            type: "u64";
          },
          {
            name: "aumUsd";
            type: "u64";
          },
          {
            name: "lpTokenPrice";
            type: "u64";
          },
          {
            name: "custodiesInfoSnapshot";
            type: {
              vec: {
                defined: "CustodyInfoSnapshot";
              };
            };
          },
          {
            name: "lpCirculatingSupply";
            type: "u64";
          },
        ];
      };
    },
    {
      name: "GetRemoveLiquidityAmountAndFeeParams";
      type: {
        kind: "struct";
        fields: [
          {
            name: "lpAmountIn";
            type: "u64";
          },
        ];
      };
    },
    {
      name: "GetSwapAmountAndFeesParams";
      type: {
        kind: "struct";
        fields: [
          {
            name: "amountIn";
            type: "u64";
          },
        ];
      };
    },
    {
      name: "ExitPriceAndFee";
      type: {
        kind: "struct";
        fields: [
          {
            name: "price";
            type: "u64";
          },
          {
            name: "fee";
            type: "u64";
          },
          {
            name: "amountOut";
            type: "u64";
          },
          {
            name: "profitUsd";
            type: "u64";
          },
          {
            name: "lossUsd";
            type: "u64";
          },
        ];
      };
    },
    {
      name: "AmountAndFee";
      type: {
        kind: "struct";
        fields: [
          {
            name: "amount";
            type: "u64";
          },
          {
            name: "fee";
            type: "u64";
          },
        ];
      };
    },
    {
      name: "NewPositionPricesAndFee";
      type: {
        kind: "struct";
        fields: [
          {
            name: "entryPrice";
            type: "u64";
          },
          {
            name: "liquidationPrice";
            type: "u64";
          },
          {
            name: "exitFee";
            type: "u64";
          },
          {
            name: "liquidationFee";
            type: "u64";
          },
          {
            name: "size";
            type: "u64";
          },
        ];
      };
    },
    {
      name: "OpenPositionWithSwapAmountAndFees";
      type: {
        kind: "struct";
        fields: [
          {
            name: "entryPrice";
            type: "u64";
          },
          {
            name: "liquidationPrice";
            type: "u64";
          },
          {
            name: "swapFeeIn";
            type: "u64";
          },
          {
            name: "swapFeeOut";
            type: "u64";
          },
          {
            name: "exitFee";
            type: "u64";
          },
          {
            name: "liquidationFee";
            type: "u64";
          },
          {
            name: "size";
            type: "u64";
          },
        ];
      };
    },
    {
      name: "SwapAmountAndFees";
      type: {
        kind: "struct";
        fields: [
          {
            name: "amountOut";
            type: "u64";
          },
          {
            name: "feeIn";
            type: "u64";
          },
          {
            name: "feeOut";
            type: "u64";
          },
        ];
      };
    },
    {
      name: "ProfitAndLoss";
      docs: [
        "Specific to the codebase, this struct is used to store the profit and loss of a position.",
      ];
      type: {
        kind: "struct";
        fields: [
          {
            name: "profitUsd";
            type: "u64";
          },
          {
            name: "lossUsd";
            type: "u64";
          },
          {
            name: "exitFee";
            type: "u64";
          },
          {
            name: "exitFeeUsd";
            type: "u64";
          },
          {
            name: "borrowFeeUsd";
            type: "u64";
          },
        ];
      };
    },
    {
      name: "Fees";
      type: {
        kind: "struct";
        fields: [
          {
            name: "swapIn";
            type: "u16";
          },
          {
            name: "swapOut";
            type: "u16";
          },
          {
            name: "stableSwapIn";
            type: "u16";
          },
          {
            name: "stableSwapOut";
            type: "u16";
          },
          {
            name: "addLiquidity";
            type: "u16";
          },
          {
            name: "removeLiquidity";
            type: "u16";
          },
          {
            name: "closePosition";
            type: "u16";
          },
          {
            name: "liquidation";
            type: "u16";
          },
          {
            name: "feeMax";
            type: "u16";
          },
          {
            name: "padding";
            type: {
              array: ["u8", 6];
            };
          },
          {
            name: "padding2";
            type: "u64";
          },
        ];
      };
    },
    {
      name: "FeesStats";
      type: {
        kind: "struct";
        fields: [
          {
            name: "swapUsd";
            type: "u64";
          },
          {
            name: "addLiquidityUsd";
            type: "u64";
          },
          {
            name: "removeLiquidityUsd";
            type: "u64";
          },
          {
            name: "closePositionUsd";
            type: "u64";
          },
          {
            name: "liquidationUsd";
            type: "u64";
          },
          {
            name: "borrowUsd";
            type: "u64";
          },
        ];
      };
    },
    {
      name: "VolumeStats";
      type: {
        kind: "struct";
        fields: [
          {
            name: "swapUsd";
            type: "u64";
          },
          {
            name: "addLiquidityUsd";
            type: "u64";
          },
          {
            name: "removeLiquidityUsd";
            type: "u64";
          },
          {
            name: "openPositionUsd";
            type: "u64";
          },
          {
            name: "closePositionUsd";
            type: "u64";
          },
          {
            name: "liquidationUsd";
            type: "u64";
          },
        ];
      };
    },
    {
      name: "TradeStats";
      type: {
        kind: "struct";
        fields: [
          {
            name: "profitUsd";
            type: "u64";
          },
          {
            name: "lossUsd";
            type: "u64";
          },
          {
            name: "oiLongUsd";
            type: "u64";
          },
          {
            name: "oiShortUsd";
            type: "u64";
          },
        ];
      };
    },
    {
      name: "Assets";
      type: {
        kind: "struct";
        fields: [
          {
            name: "collateral";
            type: "u64";
          },
          {
            name: "owned";
            type: "u64";
          },
          {
            name: "locked";
            type: "u64";
          },
        ];
      };
    },
    {
      name: "PricingParams";
      type: {
        kind: "struct";
        fields: [
          {
            name: "maxInitialLeverage";
            type: "u32";
          },
          {
            name: "maxLeverage";
            type: "u32";
          },
          {
            name: "maxPositionLockedUsd";
            type: "u64";
          },
          {
            name: "maxCumulativeShortPositionSizeUsd";
            type: "u64";
          },
        ];
      };
    },
    {
      name: "BorrowRateParams";
      type: {
        kind: "struct";
        fields: [
          {
            name: "maxHourlyBorrowInterestRate";
            type: "u64";
          },
        ];
      };
    },
    {
      name: "BorrowRateState";
      type: {
        kind: "struct";
        fields: [
          {
            name: "currentRate";
            type: "u64";
          },
          {
            name: "lastUpdate";
            type: "i64";
          },
          {
            name: "cumulativeInterest";
            type: {
              defined: "U128Split";
            };
          },
        ];
      };
    },
    {
      name: "PositionsAccounting";
      type: {
        kind: "struct";
        fields: [
          {
            name: "openPositions";
            type: "u64";
          },
          {
            name: "sizeUsd";
            type: "u64";
          },
          {
            name: "borrowSizeUsd";
            type: "u64";
          },
          {
            name: "lockedAmount";
            type: "u64";
          },
          {
            name: "weightedPrice";
            type: {
              defined: "U128Split";
            };
          },
          {
            name: "totalQuantity";
            type: {
              defined: "U128Split";
            };
          },
          {
            name: "cumulativeInterestUsd";
            type: "u64";
          },
          {
            name: "padding";
            type: {
              array: ["u8", 8];
            };
          },
          {
            name: "cumulativeInterestSnapshot";
            type: {
              defined: "U128Split";
            };
          },
          {
            name: "exitFeeUsd";
            type: "u64";
          },
          {
            name: "stableLockedAmount";
            type: {
              array: [
                {
                  defined: "StableLockedAmountStat";
                },
                2,
              ];
            };
          },
        ];
      };
    },
    {
      name: "StableLockedAmountStat";
      type: {
        kind: "struct";
        fields: [
          {
            name: "custody";
            type: "publicKey";
          },
          {
            name: "lockedAmount";
            type: "u64";
          },
          {
            name: "padding";
            type: {
              array: ["u8", 8];
            };
          },
        ];
      };
    },
    {
      name: "OraclePrice";
      type: {
        kind: "struct";
        fields: [
          {
            name: "price";
            type: "u64";
          },
          {
            name: "exponent";
            type: "i32";
          },
          {
            name: "confidence";
            type: "u64";
          },
        ];
      };
    },
    {
      name: "TokenRatios";
      type: {
        kind: "struct";
        fields: [
          {
            name: "target";
            type: "u16";
          },
          {
            name: "min";
            type: "u16";
          },
          {
            name: "max";
            type: "u16";
          },
          {
            name: "padding";
            type: {
              array: ["u8", 2];
            };
          },
        ];
      };
    },
    {
      name: "StakingRound";
      type: {
        kind: "struct";
        fields: [
          {
            name: "startTime";
            type: "i64";
          },
          {
            name: "endTime";
            type: "i64";
          },
          {
            name: "rate";
            type: "u64";
          },
          {
            name: "totalStake";
            type: "u64";
          },
          {
            name: "totalClaim";
            type: "u64";
          },
          {
            name: "lmRate";
            type: "u64";
          },
          {
            name: "lmTotalStake";
            type: "u64";
          },
          {
            name: "lmTotalClaim";
            type: "u64";
          },
        ];
      };
    },
    {
      name: "TradingStats";
      type: {
        kind: "struct";
        fields: [
          {
            name: "openedPositionCount";
            type: "u64";
          },
          {
            name: "liquidatedPositionCount";
            type: "u64";
          },
          {
            name: "openingAverageLeverage";
            type: "u64";
          },
          {
            name: "openingSizeUsd";
            type: "u64";
          },
          {
            name: "profitsUsd";
            type: "u64";
          },
          {
            name: "lossesUsd";
            type: "u64";
          },
          {
            name: "feePaidUsd";
            type: "u64";
          },
        ];
      };
    },
    {
      name: "LiquidStake";
      type: {
        kind: "struct";
        fields: [
          {
            name: "amount";
            type: "u64";
          },
          {
            name: "stakeTime";
            type: "i64";
          },
          {
            name: "claimTime";
            type: "i64";
          },
          {
            name: "overlapTime";
            type: "i64";
          },
          {
            name: "overlapAmount";
            type: "u64";
          },
        ];
      };
    },
    {
      name: "LockedStake";
      type: {
        kind: "struct";
        fields: [
          {
            name: "amount";
            type: "u64";
          },
          {
            name: "stakeTime";
            type: "i64";
          },
          {
            name: "claimTime";
            type: "i64";
          },
          {
            name: "endTime";
            type: "i64";
          },
          {
            name: "lockDuration";
            type: "u64";
          },
          {
            name: "rewardMultiplier";
            type: "u32";
          },
          {
            name: "lmRewardMultiplier";
            type: "u32";
          },
          {
            name: "voteMultiplier";
            type: "u32";
          },
          {
            name: "qualifiedForRewardsInResolvedRoundCount";
            type: "u32";
          },
          {
            name: "amountWithRewardMultiplier";
            type: "u64";
          },
          {
            name: "amountWithLmRewardMultiplier";
            type: "u64";
          },
          {
            name: "resolved";
            type: "u8";
          },
          {
            name: "padding2";
            type: {
              array: ["u8", 7];
            };
          },
          {
            name: "id";
            type: "u64";
          },
          {
            name: "earlyExit";
            type: "u8";
          },
          {
            name: "padding3";
            type: {
              array: ["u8", 7];
            };
          },
          {
            name: "earlyExitFee";
            type: "u64";
          },
          {
            name: "isGenesis";
            type: "u8";
          },
          {
            name: "padding4";
            type: {
              array: ["u8", 7];
            };
          },
          {
            name: "genesisClaimTime";
            type: "i64";
          },
        ];
      };
    },
    {
      name: "LimitedString";
      type: {
        kind: "struct";
        fields: [
          {
            name: "value";
            type: {
              array: ["u8", 31];
            };
          },
          {
            name: "length";
            type: "u8";
          },
        ];
      };
    },
    {
      name: "U128Split";
      type: {
        kind: "struct";
        fields: [
          {
            name: "high";
            type: "u64";
          },
          {
            name: "low";
            type: "u64";
          },
        ];
      };
    },
    {
      name: "BucketName";
      type: {
        kind: "enum";
        variants: [
          {
            name: "CoreContributor";
          },
          {
            name: "Foundation";
          },
          {
            name: "Ecosystem";
          },
        ];
      };
    },
    {
      name: "ReservedSpots";
      type: {
        kind: "enum";
        variants: [
          {
            name: "None";
          },
          {
            name: "Test";
            fields: [
              {
                name: "firstReservedSpot";
                type: "publicKey";
              },
              {
                name: "secondReservedSpot";
                type: "publicKey";
              },
            ];
          },
        ];
      };
    },
    {
      name: "CortexInitializationStep";
      type: {
        kind: "enum";
        variants: [
          {
            name: "NotCreated";
          },
          {
            name: "Step1";
          },
          {
            name: "Step2";
          },
          {
            name: "Step3";
          },
          {
            name: "Initialized";
          },
        ];
      };
    },
    {
      name: "PoolLiquidityState";
      type: {
        kind: "enum";
        variants: [
          {
            name: "GenesisLiquidity";
          },
          {
            name: "Idle";
          },
          {
            name: "Active";
          },
        ];
      };
    },
    {
      name: "LeverageCheckType";
      type: {
        kind: "enum";
        variants: [
          {
            name: "Initial";
          },
          {
            name: "AddCollateral";
          },
          {
            name: "RemoveCollateral";
          },
          {
            name: "IncreasePosition";
          },
          {
            name: "Liquidate";
          },
        ];
      };
    },
    {
      name: "Side";
      type: {
        kind: "enum";
        variants: [
          {
            name: "None";
          },
          {
            name: "Long";
          },
          {
            name: "Short";
          },
        ];
      };
    },
    {
      name: "StakingType";
      type: {
        kind: "enum";
        variants: [
          {
            name: "LM";
          },
          {
            name: "LP";
          },
        ];
      };
    },
    {
      name: "StakingInitializationStep";
      type: {
        kind: "enum";
        variants: [
          {
            name: "NotCreated";
          },
          {
            name: "Step1";
          },
          {
            name: "Step2";
          },
          {
            name: "Step3";
          },
          {
            name: "Initialized";
          },
        ];
      };
    },
  ];
  events: [
    {
      name: "OpenPositionEvent";
      fields: [
        {
          name: "owner";
          type: "publicKey";
          index: false;
        },
        {
          name: "position";
          type: "publicKey";
          index: false;
        },
        {
          name: "custodyMint";
          type: "publicKey";
          index: false;
        },
        {
          name: "side";
          type: "u8";
          index: false;
        },
        {
          name: "sizeUsd";
          type: "u64";
          index: false;
        },
        {
          name: "price";
          type: "u64";
          index: false;
        },
        {
          name: "collateralAmountUsd";
          type: "u64";
          index: false;
        },
        {
          name: "leverage";
          type: "u32";
          index: false;
        },
        {
          name: "positionId";
          type: "u64";
          index: false;
        },
      ];
    },
    {
      name: "IncreasePositionEvent";
      fields: [
        {
          name: "owner";
          type: "publicKey";
          index: false;
        },
        {
          name: "position";
          type: "publicKey";
          index: false;
        },
        {
          name: "custodyMint";
          type: "publicKey";
          index: false;
        },
        {
          name: "side";
          type: "u8";
          index: false;
        },
        {
          name: "sizeUsd";
          type: "u64";
          index: false;
        },
        {
          name: "price";
          type: "u64";
          index: false;
        },
        {
          name: "collateralAmountUsd";
          type: "u64";
          index: false;
        },
        {
          name: "leverage";
          type: "u32";
          index: false;
        },
        {
          name: "positionId";
          type: "u64";
          index: false;
        },
      ];
    },
    {
      name: "ClosePositionEvent";
      fields: [
        {
          name: "owner";
          type: "publicKey";
          index: false;
        },
        {
          name: "position";
          type: "publicKey";
          index: false;
        },
        {
          name: "custodyMint";
          type: "publicKey";
          index: false;
        },
        {
          name: "side";
          type: "u8";
          index: false;
        },
        {
          name: "sizeUsd";
          type: "u64";
          index: false;
        },
        {
          name: "price";
          type: "u64";
          index: false;
        },
        {
          name: "collateralAmountUsd";
          type: "u64";
          index: false;
        },
        {
          name: "profitUsd";
          type: "u64";
          index: false;
        },
        {
          name: "lossUsd";
          type: "u64";
          index: false;
        },
        {
          name: "borrowFeeUsd";
          type: "u64";
          index: false;
        },
        {
          name: "exitFeeUsd";
          type: "u64";
          index: false;
        },
        {
          name: "positionId";
          type: "u64";
          index: false;
        },
      ];
    },
    {
      name: "AddCollateralEvent";
      fields: [
        {
          name: "owner";
          type: "publicKey";
          index: false;
        },
        {
          name: "position";
          type: "publicKey";
          index: false;
        },
        {
          name: "custodyMint";
          type: "publicKey";
          index: false;
        },
        {
          name: "side";
          type: "u8";
          index: false;
        },
        {
          name: "addAmountUsd";
          type: "u64";
          index: false;
        },
        {
          name: "newCollateralAmountUsd";
          type: "u64";
          index: false;
        },
        {
          name: "leverage";
          type: "u32";
          index: false;
        },
        {
          name: "positionId";
          type: "u64";
          index: false;
        },
      ];
    },
    {
      name: "RemoveCollateralEvent";
      fields: [
        {
          name: "owner";
          type: "publicKey";
          index: false;
        },
        {
          name: "position";
          type: "publicKey";
          index: false;
        },
        {
          name: "custodyMint";
          type: "publicKey";
          index: false;
        },
        {
          name: "side";
          type: "u8";
          index: false;
        },
        {
          name: "removeAmountUsd";
          type: "u64";
          index: false;
        },
        {
          name: "newCollateralAmountUsd";
          type: "u64";
          index: false;
        },
        {
          name: "leverage";
          type: "u32";
          index: false;
        },
        {
          name: "positionId";
          type: "u64";
          index: false;
        },
      ];
    },
    {
      name: "LiquidateEvent";
      fields: [
        {
          name: "owner";
          type: "publicKey";
          index: false;
        },
        {
          name: "position";
          type: "publicKey";
          index: false;
        },
        {
          name: "custodyMint";
          type: "publicKey";
          index: false;
        },
        {
          name: "side";
          type: "u8";
          index: false;
        },
        {
          name: "sizeUsd";
          type: "u64";
          index: false;
        },
        {
          name: "price";
          type: "u64";
          index: false;
        },
        {
          name: "collateralAmountUsd";
          type: "u64";
          index: false;
        },
        {
          name: "lossUsd";
          type: "u64";
          index: false;
        },
        {
          name: "borrowFeeUsd";
          type: "u64";
          index: false;
        },
        {
          name: "exitFeeUsd";
          type: "u64";
          index: false;
        },
        {
          name: "positionId";
          type: "u64";
          index: false;
        },
      ];
    },
    {
      name: "AddLockedStakeEvent";
      fields: [
        {
          name: "owner";
          type: "publicKey";
          index: false;
        },
        {
          name: "staking";
          type: "publicKey";
          index: false;
        },
        {
          name: "lockedStakeId";
          type: "u64";
          index: false;
        },
        {
          name: "amount";
          type: "u64";
          index: false;
        },
        {
          name: "lockedDays";
          type: "u32";
          index: false;
        },
      ];
    },
    {
      name: "UpgradeLockedStakeEvent";
      fields: [
        {
          name: "owner";
          type: "publicKey";
          index: false;
        },
        {
          name: "staking";
          type: "publicKey";
          index: false;
        },
        {
          name: "lockedStakeId";
          type: "u64";
          index: false;
        },
        {
          name: "amount";
          type: {
            option: "u64";
          };
          index: false;
        },
        {
          name: "lockedDays";
          type: {
            option: "u32";
          };
          index: false;
        },
      ];
    },
    {
      name: "FinalizeLockedStakeEvent";
      fields: [
        {
          name: "owner";
          type: "publicKey";
          index: false;
        },
        {
          name: "staking";
          type: "publicKey";
          index: false;
        },
        {
          name: "lockedStakeId";
          type: "u64";
          index: false;
        },
        {
          name: "earlyExit";
          type: "bool";
          index: false;
        },
      ];
    },
    {
      name: "RemoveLockedStakeEvent";
      fields: [
        {
          name: "owner";
          type: "publicKey";
          index: false;
        },
        {
          name: "staking";
          type: "publicKey";
          index: false;
        },
        {
          name: "lockedStakeId";
          type: "u64";
          index: false;
        },
      ];
    },
    {
      name: "SetStopLossEvent";
      fields: [
        {
          name: "positionId";
          type: "u64";
          index: false;
        },
        {
          name: "stopLossLimitPrice";
          type: "u64";
          index: false;
        },
        {
          name: "closePositionPrice";
          type: {
            option: "u64";
          };
          index: false;
        },
        {
          name: "positionSide";
          type: "u8";
          index: false;
        },
      ];
    },
    {
      name: "SetTakeProfitEvent";
      fields: [
        {
          name: "positionId";
          type: "u64";
          index: false;
        },
        {
          name: "takeProfitLimitPrice";
          type: "u64";
          index: false;
        },
        {
          name: "positionSide";
          type: "u8";
          index: false;
        },
      ];
    },
    {
      name: "CancelStopLossEvent";
      fields: [
        {
          name: "positionId";
          type: "u64";
          index: false;
        },
        {
          name: "positionSide";
          type: "u8";
          index: false;
        },
      ];
    },
    {
      name: "CancelTakeProfitEvent";
      fields: [
        {
          name: "positionId";
          type: "u64";
          index: false;
        },
        {
          name: "positionSide";
          type: "u8";
          index: false;
        },
      ];
    },
  ];
  errors: [
    {
      code: 6000;
      name: "MathOverflow";
      msg: "Overflow in arithmetic operation";
    },
    {
      code: 6001;
      name: "UnsupportedOracle";
      msg: "Unsupported price oracle";
    },
    {
      code: 6002;
      name: "InvalidOracleAccount";
      msg: "Invalid oracle account";
    },
    {
      code: 6003;
      name: "InvalidOracleState";
      msg: "Invalid oracle state";
    },
    {
      code: 6004;
      name: "StaleOraclePrice";
      msg: "Stale oracle price";
    },
    {
      code: 6005;
      name: "InvalidOraclePrice";
      msg: "Invalid oracle price";
    },
    {
      code: 6006;
      name: "InvalidEnvironment";
      msg: "Instruction is not allowed in production";
    },
    {
      code: 6007;
      name: "InvalidPoolLiquidityState";
      msg: "Invalid pool liquidity state";
    },
    {
      code: 6008;
      name: "InvalidCortexState";
      msg: "Invalid cortex state";
    },
    {
      code: 6009;
      name: "InvalidStakingState";
      msg: "Invalid staking state";
    },
    {
      code: 6010;
      name: "InvalidPoolState";
      msg: "Invalid pool state";
    },
    {
      code: 6011;
      name: "InvalidVestState";
      msg: "Invalid vest state";
    },
    {
      code: 6012;
      name: "InvalidStakeState";
      msg: "Invalid stake state";
    },
    {
      code: 6013;
      name: "InvalidCustody";
      msg: "Invalid custody";
    },
    {
      code: 6014;
      name: "InvalidCustodyAccount";
      msg: "Invalid custody account";
    },
    {
      code: 6015;
      name: "InvalidCustodyState";
      msg: "Invalid custody state";
    },
    {
      code: 6016;
      name: "InvalidCollateralCustody";
      msg: "Invalid collateral custody";
    },
    {
      code: 6017;
      name: "InvalidPositionState";
      msg: "Invalid position state";
    },
    {
      code: 6018;
      name: "PositionNotInLiquidationRange";
      msg: "The position is not in liquidation range";
    },
    {
      code: 6019;
      name: "InvalidStakingRoundState";
      msg: "Invalid staking round state";
    },
    {
      code: 6020;
      name: "InvalidAdrenaConfig";
      msg: "Invalid adrena config";
    },
    {
      code: 6021;
      name: "InvalidPoolConfig";
      msg: "Invalid pool config";
    },
    {
      code: 6022;
      name: "InvalidCustodyConfig";
      msg: "Invalid custody config";
    },
    {
      code: 6023;
      name: "InsufficientAmountReturned";
      msg: "Insufficient token amount returned";
    },
    {
      code: 6024;
      name: "MaxPriceSlippage";
      msg: "Price slippage limit exceeded";
    },
    {
      code: 6025;
      name: "MaxLeverage";
      msg: "Position leverage limit exceeded";
    },
    {
      code: 6026;
      name: "MinLeverage";
      msg: "Position leverage under minimum";
    },
    {
      code: 6027;
      name: "CustodyAmountLimit";
      msg: "Custody amount limit exceeded";
    },
    {
      code: 6028;
      name: "PositionAmountLimit";
      msg: "Position amount limit exceeded";
    },
    {
      code: 6029;
      name: "TokenRatioOutOfRange";
      msg: "Token ratio out of range";
    },
    {
      code: 6030;
      name: "UnsupportedToken";
      msg: "Token is not supported";
    },
    {
      code: 6031;
      name: "InstructionNotAllowed";
      msg: "Instruction is not allowed at this time";
    },
    {
      code: 6032;
      name: "MaxUtilization";
      msg: "Token utilization limit exceeded";
    },
    {
      code: 6033;
      name: "MaxRegisteredResolvedStakingRoundReached";
      msg: "Max registered resolved staking round reached";
    },
    {
      code: 6034;
      name: "InvalidGovernanceProgram";
      msg: "Governance program do not match Cortex's one";
    },
    {
      code: 6035;
      name: "InvalidGovernanceRealm";
      msg: "Governance realm do not match Cortex's one";
    },
    {
      code: 6036;
      name: "InvalidVestingUnlockTime";
      msg: "Vesting unlock time is too close or passed";
    },
    {
      code: 6037;
      name: "InvalidStakingLockingTime";
      msg: "Invalid staking locking time";
    },
    {
      code: 6038;
      name: "UserStakeNotFound";
      msg: "The user stake account specified could not be found";
    },
    {
      code: 6039;
      name: "InvalidAccountData";
      msg: "Invalid account data";
    },
    {
      code: 6040;
      name: "UnresolvedStake";
      msg: "Stake is not resolved";
    },
    {
      code: 6041;
      name: "BucketMintLimit";
      msg: "Reached bucket mint limit";
    },
    {
      code: 6042;
      name: "GenesisAlpLimitReached";
      msg: "Genesis ALP add liquidity limit reached";
    },
    {
      code: 6043;
      name: "PermissionlessOracleMissingSignature";
      msg: "Permissionless oracle update must be preceded by Ed25519 signature verification instruction";
    },
    {
      code: 6044;
      name: "PermissionlessOracleMalformedEd25519Data";
      msg: "Ed25519 signature verification data does not match expected format";
    },
    {
      code: 6045;
      name: "PermissionlessOracleSignerMismatch";
      msg: "Ed25519 signature was not signed by the oracle authority";
    },
    {
      code: 6046;
      name: "PermissionlessOracleMessageMismatch";
      msg: "Signed message does not match instruction params";
    },
    {
      code: 6047;
      name: "CustodyStableLockedAmountNotFound";
      msg: "Cannot find custody stable locked amount";
    },
    {
      code: 6048;
      name: "CustodyNotFound";
      msg: "Cannot find custody";
    },
    {
      code: 6049;
      name: "InsufficientBucketReserve";
      msg: "The bucket does not contain enough token for reserving this allocation";
    },
    {
      code: 6050;
      name: "UserNicknameTooLong";
      msg: "User nickname exceed 24 characters";
    },
    {
      code: 6051;
      name: "UserNicknameTooShort";
      msg: "User nickname is less than 3 characters";
    },
    {
      code: 6052;
      name: "InvalidGenesisLockState";
      msg: "Invalid genesis lock state";
    },
    {
      code: 6053;
      name: "GenesisLockCampaignFullySubscribed";
      msg: "The campaign is fully subscribed";
    },
    {
      code: 6054;
      name: "PoolAumSoftCapUsdReached";
      msg: "The pool is fully subscribed";
    },
    {
      code: 6055;
      name: "MaxRegisteredPool";
      msg: "The number of registered pool reached max amount";
    },
    {
      code: 6056;
      name: "MaxRegisteredCustodies";
      msg: "The number of registered custody reached max amount";
    },
    {
      code: 6057;
      name: "MaxCumulativeShortPositionSizeLimit";
      msg: "The short limit for this asset has been reached";
    },
    {
      code: 6058;
      name: "LockedStakeArrayFull";
      msg: "The max number of LockedStaking has been reached";
    },
    {
      code: 6059;
      name: "IndexOutOfBounds";
      msg: "Requested index is out of bounds";
    },
    {
      code: 6060;
      name: "InvalidCaller";
      msg: "The instruction must be call with a specific account as caller";
    },
    {
      code: 6061;
      name: "InvalidBucketName";
      msg: "Invalid bucket name";
    },
    {
      code: 6062;
      name: "InvalidThreadId";
      msg: "(deprecated)The provided Sablier thread does not have the expected ID";
    },
    {
      code: 6063;
      name: "PythPriceExponentTooLargeIncurringPrecisionLoss";
      msg: "The exponent used for pyth price lead to high precision loss";
    },
    {
      code: 6064;
      name: "MissingClosePositionPrice";
      msg: "The close position price is mandatory";
    },
    {
      code: 6065;
      name: "InvalidVoteMultiplier";
      msg: "Invalid vote multiplier";
    },
    {
      code: 6066;
      name: "PositionTooYoung";
      msg: "A position cannot be close right after open, a slight delay is enforced";
    },
    {
      code: 6067;
      name: "InsufficientCollateral";
      msg: "The minimum amount of collateral posted to open a position is not met";
    },
    {
      code: 6068;
      name: "InvalidLockDuration";
      msg: "The provided lock duration isn't valid";
    },
    {
      code: 6069;
      name: "StakeNotEstablished";
      msg: "The stake isn't established yet";
    },
    {
      code: 6070;
      name: "PositionAlreadyClosed";
      msg: "The position is already pending cleanup and close";
    },
  ];
};

export const IDL: Adrena = {
  version: "1.1.5",
  name: "adrena",
  instructions: [
    {
      name: "initOneCore",
      accounts: [
        {
          name: "admin",
          isMut: false,
          isSigner: true,
          docs: ["#1"],
        },
        {
          name: "payer",
          isMut: true,
          isSigner: true,
          docs: ["#2"],
        },
        {
          name: "transferAuthority",
          isMut: true,
          isSigner: false,
          docs: ["#3"],
        },
        {
          name: "cortex",
          isMut: true,
          isSigner: false,
          docs: ["#4"],
        },
        {
          name: "protocolFeeRecipient",
          isMut: false,
          isSigner: false,
          docs: ["#5"],
        },
        {
          name: "feeRedistributionMint",
          isMut: false,
          isSigner: false,
          docs: ["#6"],
        },
        {
          name: "lmTokenMint",
          isMut: true,
          isSigner: false,
          docs: ["#7"],
        },
        {
          name: "systemProgram",
          isMut: false,
          isSigner: false,
          docs: ["#8"],
        },
        {
          name: "tokenProgram",
          isMut: false,
          isSigner: false,
          docs: ["#9"],
        },
        {
          name: "rent",
          isMut: false,
          isSigner: false,
          docs: ["#10"],
        },
      ],
      args: [
        {
          name: "params",
          type: {
            defined: "InitOneParams",
          },
        },
      ],
    },
    {
      name: "initTwoLmTokenMetadata",
      accounts: [
        {
          name: "admin",
          isMut: false,
          isSigner: true,
          docs: ["#1"],
        },
        {
          name: "payer",
          isMut: true,
          isSigner: true,
          docs: ["#2"],
        },
        {
          name: "transferAuthority",
          isMut: false,
          isSigner: false,
          docs: ["#3"],
        },
        {
          name: "cortex",
          isMut: true,
          isSigner: false,
          docs: ["#5"],
        },
        {
          name: "lmTokenMint",
          isMut: true,
          isSigner: false,
          docs: ["#6"],
        },
        {
          name: "lmTokenMintMetadata",
          isMut: true,
          isSigner: false,
          docs: ["#7"],
        },
        {
          name: "systemProgram",
          isMut: false,
          isSigner: false,
          docs: ["#8"],
        },
        {
          name: "tokenProgram",
          isMut: false,
          isSigner: false,
          docs: ["#9"],
        },
        {
          name: "mplTokenMetadataProgram",
          isMut: false,
          isSigner: false,
          docs: ["#10"],
        },
        {
          name: "rent",
          isMut: false,
          isSigner: false,
          docs: ["#11"],
        },
      ],
      args: [],
    },
    {
      name: "initThreeGovernance",
      accounts: [
        {
          name: "admin",
          isMut: false,
          isSigner: true,
          docs: ["#1"],
        },
        {
          name: "payer",
          isMut: true,
          isSigner: true,
          docs: ["#2"],
        },
        {
          name: "transferAuthority",
          isMut: false,
          isSigner: false,
          docs: ["#3"],
        },
        {
          name: "cortex",
          isMut: true,
          isSigner: false,
          docs: ["#4"],
        },
        {
          name: "governanceTokenMint",
          isMut: true,
          isSigner: false,
          docs: ["#5"],
        },
        {
          name: "governanceRealm",
          isMut: false,
          isSigner: false,
          docs: [
            "#6",
            "A realm represent one project within the governance program",
          ],
        },
        {
          name: "governanceProgram",
          isMut: false,
          isSigner: false,
          docs: ["#7"],
        },
        {
          name: "systemProgram",
          isMut: false,
          isSigner: false,
          docs: ["#8"],
        },
        {
          name: "tokenProgram",
          isMut: false,
          isSigner: false,
          docs: ["#9"],
        },
        {
          name: "rent",
          isMut: false,
          isSigner: false,
          docs: ["#10"],
        },
      ],
      args: [],
    },
    {
      name: "initFourVesting",
      accounts: [
        {
          name: "admin",
          isMut: false,
          isSigner: true,
          docs: ["#1"],
        },
        {
          name: "payer",
          isMut: true,
          isSigner: true,
          docs: ["#2"],
        },
        {
          name: "transferAuthority",
          isMut: false,
          isSigner: false,
          docs: ["#3"],
        },
        {
          name: "cortex",
          isMut: true,
          isSigner: false,
          docs: ["#4"],
        },
        {
          name: "vestRegistry",
          isMut: true,
          isSigner: false,
          docs: ["#5"],
        },
        {
          name: "systemProgram",
          isMut: false,
          isSigner: false,
          docs: ["#6"],
        },
        {
          name: "tokenProgram",
          isMut: false,
          isSigner: false,
          docs: ["#7"],
        },
        {
          name: "rent",
          isMut: false,
          isSigner: false,
          docs: ["#8"],
        },
      ],
      args: [],
    },
    {
      name: "addVest",
      accounts: [
        {
          name: "admin",
          isMut: false,
          isSigner: true,
          docs: ["#1"],
        },
        {
          name: "owner",
          isMut: false,
          isSigner: false,
          docs: ["#2"],
        },
        {
          name: "payer",
          isMut: true,
          isSigner: true,
          docs: ["#3"],
        },
        {
          name: "transferAuthority",
          isMut: false,
          isSigner: false,
          docs: ["#4"],
        },
        {
          name: "cortex",
          isMut: true,
          isSigner: false,
          docs: ["#5"],
        },
        {
          name: "vestRegistry",
          isMut: true,
          isSigner: false,
          docs: ["#6"],
        },
        {
          name: "vest",
          isMut: true,
          isSigner: false,
          docs: ["#7"],
        },
        {
          name: "lmTokenMint",
          isMut: true,
          isSigner: false,
          docs: ["#8"],
        },
        {
          name: "governanceTokenMint",
          isMut: true,
          isSigner: false,
          docs: ["#9"],
        },
        {
          name: "governanceRealm",
          isMut: false,
          isSigner: false,
          docs: [
            "#10",
            "A realm represent one project within the governance program",
          ],
        },
        {
          name: "governanceRealmConfig",
          isMut: false,
          isSigner: false,
          docs: ["#11"],
        },
        {
          name: "governanceGoverningTokenHolding",
          isMut: true,
          isSigner: false,
          docs: [
            "#12",
            "Token account owned by governance program holding user's locked tokens",
          ],
        },
        {
          name: "governanceGoverningTokenOwnerRecord",
          isMut: true,
          isSigner: false,
          docs: ["#13", "Account owned by governance storing user information"],
        },
        {
          name: "governanceProgram",
          isMut: false,
          isSigner: false,
          docs: ["#14"],
        },
        {
          name: "systemProgram",
          isMut: false,
          isSigner: false,
          docs: ["#15"],
        },
        {
          name: "tokenProgram",
          isMut: false,
          isSigner: false,
          docs: ["#16"],
        },
        {
          name: "rent",
          isMut: false,
          isSigner: false,
          docs: ["#17"],
        },
      ],
      args: [
        {
          name: "params",
          type: {
            defined: "AddVestParams",
          },
        },
      ],
      returns: "u8",
    },
    {
      name: "claimVest",
      accounts: [
        {
          name: "caller",
          isMut: false,
          isSigner: true,
          docs: ["#1"],
        },
        {
          name: "owner",
          isMut: false,
          isSigner: false,
          docs: ["#2"],
        },
        {
          name: "payer",
          isMut: true,
          isSigner: false,
          docs: ["#3"],
        },
        {
          name: "receivingAccount",
          isMut: true,
          isSigner: false,
          docs: ["#4"],
        },
        {
          name: "transferAuthority",
          isMut: false,
          isSigner: false,
          docs: ["#5"],
        },
        {
          name: "cortex",
          isMut: true,
          isSigner: false,
          docs: ["#6"],
        },
        {
          name: "vestRegistry",
          isMut: true,
          isSigner: false,
          docs: ["#7"],
        },
        {
          name: "vest",
          isMut: true,
          isSigner: false,
          docs: ["#8"],
        },
        {
          name: "lmTokenMint",
          isMut: true,
          isSigner: false,
          docs: ["#9"],
        },
        {
          name: "governanceTokenMint",
          isMut: true,
          isSigner: false,
          docs: ["#10"],
        },
        {
          name: "governanceRealm",
          isMut: false,
          isSigner: false,
          docs: [
            "#11",
            "A realm represent one project within the governance program",
          ],
        },
        {
          name: "governanceRealmConfig",
          isMut: false,
          isSigner: false,
          docs: ["#12"],
        },
        {
          name: "governanceGoverningTokenHolding",
          isMut: true,
          isSigner: false,
          docs: [
            "#13",
            "Token account owned by governance program holding user's locked tokens",
          ],
        },
        {
          name: "governanceGoverningTokenOwnerRecord",
          isMut: true,
          isSigner: false,
          docs: ["#14", "Account owned by governance storing user information"],
        },
        {
          name: "governanceProgram",
          isMut: false,
          isSigner: false,
          docs: ["#15"],
        },
        {
          name: "adrenaProgram",
          isMut: false,
          isSigner: false,
          docs: ["#16"],
        },
        {
          name: "systemProgram",
          isMut: false,
          isSigner: false,
          docs: ["#17"],
        },
        {
          name: "tokenProgram",
          isMut: false,
          isSigner: false,
          docs: ["#18"],
        },
        {
          name: "rent",
          isMut: false,
          isSigner: false,
          docs: ["#19"],
        },
      ],
      args: [],
      returns: "u64",
    },
    {
      name: "addPoolPartOne",
      accounts: [
        {
          name: "admin",
          isMut: false,
          isSigner: true,
          docs: ["#1"],
        },
        {
          name: "payer",
          isMut: true,
          isSigner: true,
          docs: ["#2"],
        },
        {
          name: "transferAuthority",
          isMut: false,
          isSigner: false,
          docs: ["#3"],
        },
        {
          name: "cortex",
          isMut: true,
          isSigner: false,
          docs: ["#4"],
        },
        {
          name: "pool",
          isMut: true,
          isSigner: false,
          docs: ["#5"],
        },
        {
          name: "lpTokenMint",
          isMut: true,
          isSigner: false,
          docs: ["#6"],
        },
        {
          name: "lpTokenMintMetadata",
          isMut: true,
          isSigner: false,
          docs: ["#7"],
        },
        {
          name: "systemProgram",
          isMut: false,
          isSigner: false,
          docs: ["#8"],
        },
        {
          name: "tokenProgram",
          isMut: false,
          isSigner: false,
          docs: ["#9"],
        },
        {
          name: "mplTokenMetadataProgram",
          isMut: false,
          isSigner: false,
          docs: ["#10"],
        },
        {
          name: "adrenaProgram",
          isMut: false,
          isSigner: false,
          docs: ["#11"],
        },
        {
          name: "rent",
          isMut: false,
          isSigner: false,
          docs: ["#12"],
        },
      ],
      args: [
        {
          name: "params",
          type: {
            defined: "AddPoolPartOneParams",
          },
        },
      ],
      returns: "u8",
    },
    {
      name: "addPoolPartTwo",
      accounts: [
        {
          name: "admin",
          isMut: false,
          isSigner: true,
          docs: ["#1"],
        },
        {
          name: "payer",
          isMut: true,
          isSigner: true,
          docs: ["#2"],
        },
        {
          name: "transferAuthority",
          isMut: false,
          isSigner: false,
          docs: ["#3"],
        },
        {
          name: "cortex",
          isMut: true,
          isSigner: false,
          docs: ["#4"],
        },
        {
          name: "pool",
          isMut: true,
          isSigner: false,
          docs: ["#5"],
        },
        {
          name: "lpTokenMint",
          isMut: false,
          isSigner: false,
          docs: ["#6"],
        },
        {
          name: "genesisLock",
          isMut: true,
          isSigner: false,
          docs: ["#7"],
        },
        {
          name: "systemProgram",
          isMut: false,
          isSigner: false,
          docs: ["#8"],
        },
        {
          name: "tokenProgram",
          isMut: false,
          isSigner: false,
          docs: ["#9"],
        },
        {
          name: "rent",
          isMut: false,
          isSigner: false,
          docs: ["#10"],
        },
      ],
      args: [
        {
          name: "params",
          type: {
            defined: "AddPoolPartTwoParams",
          },
        },
      ],
      returns: "u8",
    },
    {
      name: "removePool",
      accounts: [
        {
          name: "admin",
          isMut: false,
          isSigner: true,
          docs: ["#1"],
        },
        {
          name: "payer",
          isMut: true,
          isSigner: true,
          docs: ["#2"],
        },
        {
          name: "transferAuthority",
          isMut: true,
          isSigner: false,
          docs: ["#3"],
        },
        {
          name: "cortex",
          isMut: true,
          isSigner: false,
          docs: ["#4"],
        },
        {
          name: "pool",
          isMut: true,
          isSigner: false,
          docs: ["#5"],
        },
        {
          name: "systemProgram",
          isMut: false,
          isSigner: false,
          docs: ["#6"],
        },
      ],
      args: [],
      returns: "u8",
    },
    {
      name: "addCustody",
      accounts: [
        {
          name: "admin",
          isMut: false,
          isSigner: true,
          docs: ["#1"],
        },
        {
          name: "payer",
          isMut: true,
          isSigner: true,
          docs: ["#2"],
        },
        {
          name: "transferAuthority",
          isMut: false,
          isSigner: false,
          docs: ["#3"],
        },
        {
          name: "cortex",
          isMut: true,
          isSigner: false,
          docs: ["#4"],
        },
        {
          name: "pool",
          isMut: true,
          isSigner: false,
          docs: ["#5"],
        },
        {
          name: "custody",
          isMut: true,
          isSigner: false,
          docs: ["#6"],
        },
        {
          name: "custodyTokenAccount",
          isMut: true,
          isSigner: false,
          docs: ["#7"],
        },
        {
          name: "custodyOracle",
          isMut: false,
          isSigner: false,
          docs: ["#8"],
        },
        {
          name: "custodyTradeOracle",
          isMut: false,
          isSigner: false,
          docs: ["#9"],
        },
        {
          name: "custodyTokenMint",
          isMut: false,
          isSigner: false,
          docs: ["#10"],
        },
        {
          name: "systemProgram",
          isMut: false,
          isSigner: false,
          docs: ["#11"],
        },
        {
          name: "tokenProgram",
          isMut: false,
          isSigner: false,
          docs: ["#12"],
        },
        {
          name: "rent",
          isMut: false,
          isSigner: false,
          docs: ["#13"],
        },
      ],
      args: [
        {
          name: "params",
          type: {
            defined: "AddCustodyParams",
          },
        },
      ],
      returns: "u8",
    },
    {
      name: "removeCustody",
      accounts: [
        {
          name: "admin",
          isMut: false,
          isSigner: true,
          docs: ["#1"],
        },
        {
          name: "payer",
          isMut: true,
          isSigner: true,
          docs: ["#2"],
        },
        {
          name: "transferAuthority",
          isMut: true,
          isSigner: false,
          docs: ["#3"],
        },
        {
          name: "cortex",
          isMut: false,
          isSigner: false,
          docs: ["#4"],
        },
        {
          name: "pool",
          isMut: true,
          isSigner: false,
          docs: ["#5"],
        },
        {
          name: "custody",
          isMut: true,
          isSigner: false,
          docs: ["#6"],
        },
        {
          name: "custodyTokenAccount",
          isMut: true,
          isSigner: false,
          docs: ["#7"],
        },
        {
          name: "systemProgram",
          isMut: false,
          isSigner: false,
          docs: ["#8"],
        },
        {
          name: "tokenProgram",
          isMut: false,
          isSigner: false,
          docs: ["#9"],
        },
      ],
      args: [
        {
          name: "params",
          type: {
            defined: "RemoveCustodyParams",
          },
        },
      ],
      returns: "u8",
    },
    {
      name: "setCustodyConfig",
      accounts: [
        {
          name: "admin",
          isMut: false,
          isSigner: true,
          docs: ["#1"],
        },
        {
          name: "pool",
          isMut: true,
          isSigner: false,
          docs: ["#2"],
        },
        {
          name: "cortex",
          isMut: true,
          isSigner: false,
          docs: ["#3"],
        },
        {
          name: "custody",
          isMut: true,
          isSigner: false,
          docs: ["#4"],
        },
      ],
      args: [
        {
          name: "params",
          type: {
            defined: "SetCustodyConfigParams",
          },
        },
      ],
      returns: "u8",
    },
    {
      name: "setCustodyAllowSwap",
      accounts: [
        {
          name: "admin",
          isMut: false,
          isSigner: true,
          docs: ["#1"],
        },
        {
          name: "cortex",
          isMut: true,
          isSigner: false,
          docs: ["#2"],
        },
        {
          name: "pool",
          isMut: true,
          isSigner: false,
          docs: ["#3"],
        },
        {
          name: "custody",
          isMut: true,
          isSigner: false,
          docs: ["#4"],
        },
      ],
      args: [
        {
          name: "params",
          type: {
            defined: "SetCustodyAllowSwapParams",
          },
        },
      ],
    },
    {
      name: "setCustodyAllowTrade",
      accounts: [
        {
          name: "admin",
          isMut: false,
          isSigner: true,
          docs: ["#1"],
        },
        {
          name: "cortex",
          isMut: true,
          isSigner: false,
          docs: ["#2"],
        },
        {
          name: "pool",
          isMut: true,
          isSigner: false,
          docs: ["#3"],
        },
        {
          name: "custody",
          isMut: true,
          isSigner: false,
          docs: ["#4"],
        },
      ],
      args: [
        {
          name: "params",
          type: {
            defined: "SetCustodyAllowTradeParams",
          },
        },
      ],
    },
    {
      name: "setPoolAllowSwap",
      accounts: [
        {
          name: "admin",
          isMut: false,
          isSigner: true,
          docs: ["#1"],
        },
        {
          name: "cortex",
          isMut: true,
          isSigner: false,
          docs: ["#2"],
        },
        {
          name: "pool",
          isMut: true,
          isSigner: false,
          docs: ["#3"],
        },
      ],
      args: [
        {
          name: "params",
          type: {
            defined: "SetPoolAllowSwapParams",
          },
        },
      ],
    },
    {
      name: "setPoolAllowTrade",
      accounts: [
        {
          name: "admin",
          isMut: false,
          isSigner: true,
          docs: ["#1"],
        },
        {
          name: "cortex",
          isMut: true,
          isSigner: false,
          docs: ["#2"],
        },
        {
          name: "pool",
          isMut: true,
          isSigner: false,
          docs: ["#3"],
        },
      ],
      args: [
        {
          name: "params",
          type: {
            defined: "SetPoolAllowTradeParams",
          },
        },
      ],
    },
    {
      name: "setPoolAumSoftCapUsd",
      accounts: [
        {
          name: "admin",
          isMut: false,
          isSigner: true,
          docs: ["#1"],
        },
        {
          name: "cortex",
          isMut: true,
          isSigner: false,
          docs: ["#2"],
        },
        {
          name: "pool",
          isMut: true,
          isSigner: false,
          docs: ["#3"],
        },
      ],
      args: [
        {
          name: "params",
          type: {
            defined: "SetPoolAumSoftCapUsdParams",
          },
        },
      ],
    },
    {
      name: "swap",
      accounts: [
        {
          name: "caller",
          isMut: false,
          isSigner: true,
          docs: ["#1"],
        },
        {
          name: "owner",
          isMut: false,
          isSigner: true,
          docs: ["#2"],
        },
        {
          name: "fundingAccount",
          isMut: true,
          isSigner: false,
          docs: ["#3"],
        },
        {
          name: "receivingAccount",
          isMut: true,
          isSigner: false,
          docs: ["#4"],
        },
        {
          name: "transferAuthority",
          isMut: false,
          isSigner: false,
          docs: ["#5"],
        },
        {
          name: "cortex",
          isMut: true,
          isSigner: false,
          docs: ["#6"],
        },
        {
          name: "lmStaking",
          isMut: true,
          isSigner: false,
          docs: ["#7"],
        },
        {
          name: "lpStaking",
          isMut: true,
          isSigner: false,
          docs: ["#8"],
        },
        {
          name: "pool",
          isMut: true,
          isSigner: false,
          docs: ["#9"],
        },
        {
          name: "stakingRewardTokenCustody",
          isMut: true,
          isSigner: false,
          docs: ["#10"],
        },
        {
          name: "stakingRewardTokenCustodyOracle",
          isMut: false,
          isSigner: false,
          docs: ["#11"],
        },
        {
          name: "stakingRewardTokenCustodyTokenAccount",
          isMut: true,
          isSigner: false,
          docs: ["#12"],
        },
        {
          name: "receivingCustody",
          isMut: true,
          isSigner: false,
          docs: ["#13"],
        },
        {
          name: "receivingCustodyOracle",
          isMut: false,
          isSigner: false,
          docs: ["#14"],
        },
        {
          name: "receivingCustodyTokenAccount",
          isMut: true,
          isSigner: false,
          docs: ["#15"],
        },
        {
          name: "dispensingCustody",
          isMut: true,
          isSigner: false,
          docs: ["#16"],
        },
        {
          name: "dispensingCustodyOracle",
          isMut: false,
          isSigner: false,
          docs: ["#17"],
        },
        {
          name: "dispensingCustodyTokenAccount",
          isMut: true,
          isSigner: false,
          docs: ["#18"],
        },
        {
          name: "lmStakingRewardTokenVault",
          isMut: true,
          isSigner: false,
          docs: ["#19"],
        },
        {
          name: "lpStakingRewardTokenVault",
          isMut: true,
          isSigner: false,
          docs: ["#20"],
        },
        {
          name: "lpTokenMint",
          isMut: true,
          isSigner: false,
          docs: ["#21"],
        },
        {
          name: "protocolFeeRecipient",
          isMut: true,
          isSigner: false,
          docs: ["#22"],
        },
        {
          name: "userProfile",
          isMut: true,
          isSigner: false,
          isOptional: true,
          docs: ["#23"],
        },
        {
          name: "tokenProgram",
          isMut: false,
          isSigner: false,
          docs: ["#24"],
        },
        {
          name: "adrenaProgram",
          isMut: false,
          isSigner: false,
          docs: ["#25"],
        },
      ],
      args: [
        {
          name: "params",
          type: {
            defined: "SwapParams",
          },
        },
      ],
    },
    {
      name: "addLiquidity",
      accounts: [
        {
          name: "owner",
          isMut: true,
          isSigner: true,
          docs: ["#1"],
        },
        {
          name: "fundingAccount",
          isMut: true,
          isSigner: false,
          docs: ["#2"],
        },
        {
          name: "lpTokenAccount",
          isMut: true,
          isSigner: false,
          docs: [
            "#3 Front end will target the owner account, but not limited to",
          ],
        },
        {
          name: "transferAuthority",
          isMut: false,
          isSigner: false,
          docs: ["#4"],
        },
        {
          name: "lmStaking",
          isMut: true,
          isSigner: false,
          docs: ["#5"],
        },
        {
          name: "lpStaking",
          isMut: true,
          isSigner: false,
          docs: ["#6"],
        },
        {
          name: "cortex",
          isMut: true,
          isSigner: false,
          docs: ["#7"],
        },
        {
          name: "pool",
          isMut: true,
          isSigner: false,
          docs: ["#8"],
        },
        {
          name: "stakingRewardTokenCustody",
          isMut: true,
          isSigner: false,
          docs: ["#9"],
        },
        {
          name: "stakingRewardTokenCustodyOracle",
          isMut: false,
          isSigner: false,
          docs: ["#10"],
        },
        {
          name: "stakingRewardTokenCustodyTokenAccount",
          isMut: true,
          isSigner: false,
          docs: ["#11"],
        },
        {
          name: "custody",
          isMut: true,
          isSigner: false,
          docs: ["#12"],
        },
        {
          name: "custodyOracle",
          isMut: false,
          isSigner: false,
          docs: ["#13"],
        },
        {
          name: "custodyTokenAccount",
          isMut: true,
          isSigner: false,
          docs: ["#14"],
        },
        {
          name: "lmStakingRewardTokenVault",
          isMut: true,
          isSigner: false,
          docs: ["#15"],
        },
        {
          name: "lpStakingRewardTokenVault",
          isMut: true,
          isSigner: false,
          docs: ["#16"],
        },
        {
          name: "lmTokenMint",
          isMut: true,
          isSigner: false,
          docs: ["#17"],
        },
        {
          name: "lpTokenMint",
          isMut: true,
          isSigner: false,
          docs: ["#18"],
        },
        {
          name: "protocolFeeRecipient",
          isMut: true,
          isSigner: false,
          docs: ["#19"],
        },
        {
          name: "tokenProgram",
          isMut: false,
          isSigner: false,
          docs: ["#20"],
        },
        {
          name: "adrenaProgram",
          isMut: false,
          isSigner: false,
          docs: ["#21"],
        },
      ],
      args: [
        {
          name: "params",
          type: {
            defined: "AddLiquidityParams",
          },
        },
      ],
    },
    {
      name: "addGenesisLiquidity",
      accounts: [
        {
          name: "owner",
          isMut: true,
          isSigner: true,
          docs: ["#1"],
        },
        {
          name: "fundingAccount",
          isMut: true,
          isSigner: false,
          docs: ["#2"],
        },
        {
          name: "transferAuthority",
          isMut: false,
          isSigner: false,
          docs: ["#3"],
        },
        {
          name: "lpUserStaking",
          isMut: true,
          isSigner: false,
          docs: ["#4"],
        },
        {
          name: "lpStaking",
          isMut: true,
          isSigner: false,
          docs: ["#5"],
        },
        {
          name: "cortex",
          isMut: true,
          isSigner: false,
          docs: ["#6"],
        },
        {
          name: "pool",
          isMut: true,
          isSigner: false,
          docs: ["#7"],
        },
        {
          name: "lpStakingStakedTokenVault",
          isMut: true,
          isSigner: false,
          docs: ["#8"],
        },
        {
          name: "custody",
          isMut: true,
          isSigner: false,
          docs: ["#9"],
        },
        {
          name: "custodyOracle",
          isMut: false,
          isSigner: false,
          docs: ["#10"],
        },
        {
          name: "custodyTokenAccount",
          isMut: true,
          isSigner: false,
          docs: ["#11"],
        },
        {
          name: "lmTokenMint",
          isMut: true,
          isSigner: false,
          docs: ["#12"],
        },
        {
          name: "lpTokenMint",
          isMut: true,
          isSigner: false,
          docs: ["#13"],
        },
        {
          name: "governanceTokenMint",
          isMut: true,
          isSigner: false,
          docs: ["#14"],
        },
        {
          name: "governanceRealm",
          isMut: false,
          isSigner: false,
          docs: [
            "#15",
            "A realm represent one project within the governance program",
          ],
        },
        {
          name: "governanceRealmConfig",
          isMut: false,
          isSigner: false,
          docs: ["#16"],
        },
        {
          name: "governanceGoverningTokenHolding",
          isMut: true,
          isSigner: false,
          docs: [
            "#17",
            "Token account owned by governance program holding user's locked tokens",
          ],
        },
        {
          name: "governanceGoverningTokenOwnerRecord",
          isMut: true,
          isSigner: false,
          docs: ["#18", "Account owned by governance storing user information"],
        },
        {
          name: "governanceProgram",
          isMut: false,
          isSigner: false,
          docs: ["#19"],
        },
        {
          name: "systemProgram",
          isMut: false,
          isSigner: false,
          docs: ["#20"],
        },
        {
          name: "tokenProgram",
          isMut: false,
          isSigner: false,
          docs: ["#21"],
        },
        {
          name: "adrenaProgram",
          isMut: false,
          isSigner: false,
          docs: ["#22"],
        },
        {
          name: "genesisLock",
          isMut: true,
          isSigner: false,
          docs: ["#23"],
        },
      ],
      args: [
        {
          name: "params",
          type: {
            defined: "AddGenesisLiquidityParams",
          },
        },
      ],
    },
    {
      name: "genesisOtcOut",
      accounts: [
        {
          name: "admin",
          isMut: false,
          isSigner: true,
          docs: ["#1"],
        },
        {
          name: "payer",
          isMut: true,
          isSigner: true,
          docs: ["#2"],
        },
        {
          name: "daoReceivingAccount",
          isMut: true,
          isSigner: false,
          docs: ["#3"],
        },
        {
          name: "transferAuthority",
          isMut: false,
          isSigner: false,
          docs: ["#4"],
        },
        {
          name: "cortex",
          isMut: false,
          isSigner: false,
          docs: ["#5"],
        },
        {
          name: "pool",
          isMut: false,
          isSigner: false,
          docs: ["#6"],
        },
        {
          name: "custodyUsdc",
          isMut: true,
          isSigner: false,
          docs: ["#7"],
        },
        {
          name: "custodyUsdcTokenAccount",
          isMut: true,
          isSigner: false,
          docs: ["#8"],
        },
        {
          name: "genesisLock",
          isMut: true,
          isSigner: false,
          docs: ["#9"],
        },
        {
          name: "tokenProgram",
          isMut: false,
          isSigner: false,
          docs: ["#10"],
        },
      ],
      args: [],
    },
    {
      name: "genesisOtcIn",
      accounts: [
        {
          name: "admin",
          isMut: false,
          isSigner: true,
          docs: ["#1"],
        },
        {
          name: "payer",
          isMut: true,
          isSigner: true,
          docs: ["#2"],
        },
        {
          name: "fundingAccountOne",
          isMut: true,
          isSigner: false,
          docs: ["#3"],
        },
        {
          name: "fundingAccountTwo",
          isMut: true,
          isSigner: false,
          docs: ["#4"],
        },
        {
          name: "fundingAccountThree",
          isMut: true,
          isSigner: false,
          docs: ["#5"],
        },
        {
          name: "cortex",
          isMut: false,
          isSigner: false,
          docs: ["#6"],
        },
        {
          name: "pool",
          isMut: false,
          isSigner: false,
          docs: ["#7"],
        },
        {
          name: "custodyOne",
          isMut: true,
          isSigner: false,
          docs: ["#8"],
        },
        {
          name: "custodyOneTokenAccount",
          isMut: true,
          isSigner: false,
          docs: ["#9"],
        },
        {
          name: "custodyTwo",
          isMut: true,
          isSigner: false,
          docs: ["#10"],
        },
        {
          name: "custodyTwoTokenAccount",
          isMut: true,
          isSigner: false,
          docs: ["#11"],
        },
        {
          name: "custodyThree",
          isMut: true,
          isSigner: false,
          docs: ["#12"],
        },
        {
          name: "custodyThreeTokenAccount",
          isMut: true,
          isSigner: false,
          docs: ["#13"],
        },
        {
          name: "genesisLock",
          isMut: true,
          isSigner: false,
          docs: ["#14"],
        },
        {
          name: "systemProgram",
          isMut: false,
          isSigner: false,
          docs: ["#15"],
        },
        {
          name: "tokenProgram",
          isMut: false,
          isSigner: false,
          docs: ["#16"],
        },
      ],
      args: [
        {
          name: "params",
          type: {
            defined: "GenesisOtcInParams",
          },
        },
      ],
    },
    {
      name: "removeLiquidity",
      accounts: [
        {
          name: "owner",
          isMut: true,
          isSigner: true,
          docs: ["#1"],
        },
        {
          name: "receivingAccount",
          isMut: true,
          isSigner: false,
          docs: [
            "#2 Front end will target the owner account, but not limited to",
          ],
        },
        {
          name: "lpTokenAccount",
          isMut: true,
          isSigner: false,
          docs: ["#3"],
        },
        {
          name: "transferAuthority",
          isMut: false,
          isSigner: false,
          docs: ["#4"],
        },
        {
          name: "lmStaking",
          isMut: true,
          isSigner: false,
          docs: ["#5"],
        },
        {
          name: "lpStaking",
          isMut: true,
          isSigner: false,
          docs: ["#6"],
        },
        {
          name: "cortex",
          isMut: true,
          isSigner: false,
          docs: ["#7"],
        },
        {
          name: "pool",
          isMut: true,
          isSigner: false,
          docs: ["#8"],
        },
        {
          name: "stakingRewardTokenCustody",
          isMut: true,
          isSigner: false,
          docs: ["#9"],
        },
        {
          name: "stakingRewardTokenCustodyOracle",
          isMut: false,
          isSigner: false,
          docs: ["#10"],
        },
        {
          name: "stakingRewardTokenCustodyTokenAccount",
          isMut: true,
          isSigner: false,
          docs: ["#11"],
        },
        {
          name: "custody",
          isMut: true,
          isSigner: false,
          docs: ["#12"],
        },
        {
          name: "custodyOracle",
          isMut: false,
          isSigner: false,
          docs: ["#13"],
        },
        {
          name: "custodyTokenAccount",
          isMut: true,
          isSigner: false,
          docs: ["#14"],
        },
        {
          name: "lmStakingRewardTokenVault",
          isMut: true,
          isSigner: false,
          docs: ["#15"],
        },
        {
          name: "lpStakingRewardTokenVault",
          isMut: true,
          isSigner: false,
          docs: ["#16"],
        },
        {
          name: "lpTokenMint",
          isMut: true,
          isSigner: false,
          docs: ["#17"],
        },
        {
          name: "protocolFeeRecipient",
          isMut: true,
          isSigner: false,
          docs: ["#18"],
        },
        {
          name: "tokenProgram",
          isMut: false,
          isSigner: false,
          docs: ["#19"],
        },
        {
          name: "adrenaProgram",
          isMut: false,
          isSigner: false,
          docs: ["#20"],
        },
      ],
      args: [
        {
          name: "params",
          type: {
            defined: "RemoveLiquidityParams",
          },
        },
      ],
    },
    {
      name: "openPositionLong",
      accounts: [
        {
          name: "owner",
          isMut: false,
          isSigner: true,
          docs: ["#1"],
        },
        {
          name: "payer",
          isMut: true,
          isSigner: true,
          docs: ["#2"],
        },
        {
          name: "fundingAccount",
          isMut: true,
          isSigner: false,
          docs: ["#3"],
        },
        {
          name: "transferAuthority",
          isMut: false,
          isSigner: false,
          docs: ["#4"],
        },
        {
          name: "cortex",
          isMut: true,
          isSigner: false,
          docs: ["#5"],
        },
        {
          name: "pool",
          isMut: true,
          isSigner: false,
          docs: ["#6"],
        },
        {
          name: "position",
          isMut: true,
          isSigner: false,
          docs: ["#7"],
        },
        {
          name: "custody",
          isMut: true,
          isSigner: false,
          docs: ["#8"],
        },
        {
          name: "custodyOracle",
          isMut: false,
          isSigner: false,
          docs: ["#9"],
        },
        {
          name: "custodyTradeOracle",
          isMut: false,
          isSigner: false,
          docs: ["#10"],
        },
        {
          name: "custodyTokenAccount",
          isMut: true,
          isSigner: false,
          docs: ["#11"],
        },
        {
          name: "userProfile",
          isMut: true,
          isSigner: false,
          isOptional: true,
          docs: ["#12"],
        },
        {
          name: "systemProgram",
          isMut: false,
          isSigner: false,
          docs: ["#13"],
        },
        {
          name: "tokenProgram",
          isMut: false,
          isSigner: false,
          docs: ["#14"],
        },
        {
          name: "adrenaProgram",
          isMut: false,
          isSigner: false,
          docs: ["#15"],
        },
      ],
      args: [
        {
          name: "params",
          type: {
            defined: "OpenPositionLongParams",
          },
        },
      ],
    },
    {
      name: "openPositionShort",
      accounts: [
        {
          name: "owner",
          isMut: false,
          isSigner: true,
          docs: ["#1"],
        },
        {
          name: "payer",
          isMut: true,
          isSigner: true,
          docs: ["#2"],
        },
        {
          name: "fundingAccount",
          isMut: true,
          isSigner: false,
          docs: ["#3"],
        },
        {
          name: "transferAuthority",
          isMut: false,
          isSigner: false,
          docs: ["#4"],
        },
        {
          name: "cortex",
          isMut: true,
          isSigner: false,
          docs: ["#5"],
        },
        {
          name: "pool",
          isMut: true,
          isSigner: false,
          docs: ["#6"],
        },
        {
          name: "position",
          isMut: true,
          isSigner: false,
          docs: ["#7"],
        },
        {
          name: "custody",
          isMut: true,
          isSigner: false,
          docs: ["#8"],
        },
        {
          name: "custodyTradeOracle",
          isMut: false,
          isSigner: false,
          docs: ["#9"],
        },
        {
          name: "collateralCustody",
          isMut: true,
          isSigner: false,
          docs: ["#10"],
        },
        {
          name: "collateralCustodyOracle",
          isMut: false,
          isSigner: false,
          docs: ["#11"],
        },
        {
          name: "collateralCustodyTokenAccount",
          isMut: true,
          isSigner: false,
          docs: ["#12"],
        },
        {
          name: "userProfile",
          isMut: true,
          isSigner: false,
          isOptional: true,
          docs: ["#13"],
        },
        {
          name: "systemProgram",
          isMut: false,
          isSigner: false,
          docs: ["#14"],
        },
        {
          name: "tokenProgram",
          isMut: false,
          isSigner: false,
          docs: ["#15"],
        },
        {
          name: "adrenaProgram",
          isMut: false,
          isSigner: false,
          docs: ["#16"],
        },
      ],
      args: [
        {
          name: "params",
          type: {
            defined: "OpenPositionShortParams",
          },
        },
      ],
    },
    {
      name: "openOrIncreasePositionWithSwapLong",
      accounts: [
        {
          name: "owner",
          isMut: false,
          isSigner: true,
          docs: ["#1"],
        },
        {
          name: "payer",
          isMut: true,
          isSigner: true,
          docs: ["#2"],
        },
        {
          name: "fundingAccount",
          isMut: true,
          isSigner: false,
          docs: ["#3"],
        },
        {
          name: "collateralAccount",
          isMut: true,
          isSigner: false,
          docs: ["#4"],
        },
        {
          name: "receivingCustody",
          isMut: true,
          isSigner: false,
          docs: ["#5"],
        },
        {
          name: "receivingCustodyOracle",
          isMut: false,
          isSigner: false,
          docs: ["#6"],
        },
        {
          name: "receivingCustodyTokenAccount",
          isMut: true,
          isSigner: false,
          docs: ["#7"],
        },
        {
          name: "principalCustody",
          isMut: true,
          isSigner: false,
          docs: ["#8"],
        },
        {
          name: "principalCustodyOracle",
          isMut: false,
          isSigner: false,
          docs: ["#9"],
        },
        {
          name: "principalCustodyTradeOracle",
          isMut: false,
          isSigner: false,
          docs: ["#10"],
        },
        {
          name: "principalCustodyTokenAccount",
          isMut: true,
          isSigner: false,
          docs: ["#11"],
        },
        {
          name: "transferAuthority",
          isMut: false,
          isSigner: false,
          docs: ["#12"],
        },
        {
          name: "cortex",
          isMut: true,
          isSigner: false,
          docs: ["#13"],
        },
        {
          name: "lmStaking",
          isMut: true,
          isSigner: false,
          docs: ["#14"],
        },
        {
          name: "lpStaking",
          isMut: true,
          isSigner: false,
          docs: ["#15"],
        },
        {
          name: "pool",
          isMut: true,
          isSigner: false,
          docs: ["#16"],
        },
        {
          name: "position",
          isMut: true,
          isSigner: false,
          docs: ["#17"],
        },
        {
          name: "stakingRewardTokenCustody",
          isMut: true,
          isSigner: false,
          docs: ["#18"],
        },
        {
          name: "stakingRewardTokenCustodyOracle",
          isMut: false,
          isSigner: false,
          docs: ["#19"],
        },
        {
          name: "stakingRewardTokenCustodyTokenAccount",
          isMut: true,
          isSigner: false,
          docs: ["#20"],
        },
        {
          name: "lmStakingRewardTokenVault",
          isMut: true,
          isSigner: false,
          docs: ["#21"],
        },
        {
          name: "lpStakingRewardTokenVault",
          isMut: true,
          isSigner: false,
          docs: ["#22"],
        },
        {
          name: "lpTokenMint",
          isMut: true,
          isSigner: false,
          docs: ["#23"],
        },
        {
          name: "protocolFeeRecipient",
          isMut: true,
          isSigner: false,
          docs: ["#24"],
        },
        {
          name: "userProfile",
          isMut: true,
          isSigner: false,
          isOptional: true,
          docs: ["#25"],
        },
        {
          name: "systemProgram",
          isMut: false,
          isSigner: false,
          docs: ["#26"],
        },
        {
          name: "tokenProgram",
          isMut: false,
          isSigner: false,
          docs: ["#27"],
        },
        {
          name: "adrenaProgram",
          isMut: false,
          isSigner: false,
          docs: ["#28"],
        },
      ],
      args: [
        {
          name: "params",
          type: {
            defined: "OpenPositionWithSwapParams",
          },
        },
      ],
    },
    {
      name: "openOrIncreasePositionWithSwapShort",
      accounts: [
        {
          name: "owner",
          isMut: false,
          isSigner: true,
          docs: ["#1"],
        },
        {
          name: "payer",
          isMut: true,
          isSigner: true,
          docs: ["#2"],
        },
        {
          name: "fundingAccount",
          isMut: true,
          isSigner: false,
          docs: ["#3"],
        },
        {
          name: "collateralAccount",
          isMut: true,
          isSigner: false,
          docs: ["#4"],
        },
        {
          name: "receivingCustody",
          isMut: true,
          isSigner: false,
          docs: ["#5"],
        },
        {
          name: "receivingCustodyOracle",
          isMut: false,
          isSigner: false,
          docs: ["#6"],
        },
        {
          name: "receivingCustodyTokenAccount",
          isMut: true,
          isSigner: false,
          docs: ["#7"],
        },
        {
          name: "collateralCustody",
          isMut: true,
          isSigner: false,
          docs: ["#8"],
        },
        {
          name: "collateralCustodyOracle",
          isMut: false,
          isSigner: false,
          docs: ["#9"],
        },
        {
          name: "collateralCustodyTokenAccount",
          isMut: true,
          isSigner: false,
          docs: ["#10"],
        },
        {
          name: "principalCustody",
          isMut: true,
          isSigner: false,
          docs: ["#11"],
        },
        {
          name: "principalCustodyTradeOracle",
          isMut: false,
          isSigner: false,
          docs: ["#12"],
        },
        {
          name: "principalCustodyTokenAccount",
          isMut: true,
          isSigner: false,
          docs: ["#13"],
        },
        {
          name: "transferAuthority",
          isMut: false,
          isSigner: false,
          docs: ["#14"],
        },
        {
          name: "cortex",
          isMut: true,
          isSigner: false,
          docs: ["#15"],
        },
        {
          name: "lmStaking",
          isMut: true,
          isSigner: false,
          docs: ["#16"],
        },
        {
          name: "lpStaking",
          isMut: true,
          isSigner: false,
          docs: ["#17"],
        },
        {
          name: "pool",
          isMut: true,
          isSigner: false,
          docs: ["#18"],
        },
        {
          name: "position",
          isMut: true,
          isSigner: false,
          docs: ["#19"],
        },
        {
          name: "stakingRewardTokenCustody",
          isMut: true,
          isSigner: false,
          docs: ["#20"],
        },
        {
          name: "stakingRewardTokenCustodyOracle",
          isMut: false,
          isSigner: false,
          docs: ["#21"],
        },
        {
          name: "stakingRewardTokenCustodyTokenAccount",
          isMut: true,
          isSigner: false,
          docs: ["#22"],
        },
        {
          name: "lmStakingRewardTokenVault",
          isMut: true,
          isSigner: false,
          docs: ["#23"],
        },
        {
          name: "lpStakingRewardTokenVault",
          isMut: true,
          isSigner: false,
          docs: ["#24"],
        },
        {
          name: "lpTokenMint",
          isMut: true,
          isSigner: false,
          docs: ["#25"],
        },
        {
          name: "protocolFeeRecipient",
          isMut: true,
          isSigner: false,
          docs: ["#26"],
        },
        {
          name: "userProfile",
          isMut: true,
          isSigner: false,
          isOptional: true,
          docs: ["#27"],
        },
        {
          name: "systemProgram",
          isMut: false,
          isSigner: false,
          docs: ["#28"],
        },
        {
          name: "tokenProgram",
          isMut: false,
          isSigner: false,
          docs: ["#29"],
        },
        {
          name: "adrenaProgram",
          isMut: false,
          isSigner: false,
          docs: ["#30"],
        },
      ],
      args: [
        {
          name: "params",
          type: {
            defined: "OpenPositionWithSwapParams",
          },
        },
      ],
    },
    {
      name: "addCollateralLong",
      accounts: [
        {
          name: "owner",
          isMut: true,
          isSigner: true,
          docs: ["#1"],
        },
        {
          name: "fundingAccount",
          isMut: true,
          isSigner: false,
          docs: ["#2"],
        },
        {
          name: "transferAuthority",
          isMut: false,
          isSigner: false,
          docs: ["#3"],
        },
        {
          name: "cortex",
          isMut: true,
          isSigner: false,
          docs: ["#4"],
        },
        {
          name: "pool",
          isMut: true,
          isSigner: false,
          docs: ["#5"],
        },
        {
          name: "position",
          isMut: true,
          isSigner: false,
          docs: ["#6"],
        },
        {
          name: "custody",
          isMut: true,
          isSigner: false,
          docs: ["#7"],
        },
        {
          name: "custodyOracle",
          isMut: false,
          isSigner: false,
          docs: ["#8"],
        },
        {
          name: "custodyTradeOracle",
          isMut: false,
          isSigner: false,
          docs: ["#9"],
        },
        {
          name: "custodyTokenAccount",
          isMut: true,
          isSigner: false,
          docs: ["#10"],
        },
        {
          name: "tokenProgram",
          isMut: false,
          isSigner: false,
          docs: ["#11"],
        },
        {
          name: "adrenaProgram",
          isMut: false,
          isSigner: false,
          docs: ["#12"],
        },
      ],
      args: [
        {
          name: "params",
          type: {
            defined: "AddCollateralLongParams",
          },
        },
      ],
    },
    {
      name: "addCollateralShort",
      accounts: [
        {
          name: "owner",
          isMut: true,
          isSigner: true,
          docs: ["#1"],
        },
        {
          name: "fundingAccount",
          isMut: true,
          isSigner: false,
          docs: ["#2"],
        },
        {
          name: "transferAuthority",
          isMut: false,
          isSigner: false,
          docs: ["#3"],
        },
        {
          name: "cortex",
          isMut: true,
          isSigner: false,
          docs: ["#4"],
        },
        {
          name: "pool",
          isMut: true,
          isSigner: false,
          docs: ["#5"],
        },
        {
          name: "position",
          isMut: true,
          isSigner: false,
          docs: ["#6"],
        },
        {
          name: "custody",
          isMut: true,
          isSigner: false,
          docs: ["#7"],
        },
        {
          name: "custodyTradeOracle",
          isMut: false,
          isSigner: false,
          docs: ["#8"],
        },
        {
          name: "collateralCustody",
          isMut: true,
          isSigner: false,
          docs: ["#9"],
        },
        {
          name: "collateralCustodyOracle",
          isMut: false,
          isSigner: false,
          docs: ["#10"],
        },
        {
          name: "collateralCustodyTokenAccount",
          isMut: true,
          isSigner: false,
          docs: ["#11"],
        },
        {
          name: "tokenProgram",
          isMut: false,
          isSigner: false,
          docs: ["#12"],
        },
        {
          name: "adrenaProgram",
          isMut: false,
          isSigner: false,
          docs: ["#13"],
        },
      ],
      args: [
        {
          name: "params",
          type: {
            defined: "AddCollateralShortParams",
          },
        },
      ],
    },
    {
      name: "removeCollateralLong",
      accounts: [
        {
          name: "owner",
          isMut: true,
          isSigner: true,
          docs: ["#1"],
        },
        {
          name: "receivingAccount",
          isMut: true,
          isSigner: false,
          docs: ["#2"],
        },
        {
          name: "transferAuthority",
          isMut: false,
          isSigner: false,
          docs: ["#3"],
        },
        {
          name: "cortex",
          isMut: true,
          isSigner: false,
          docs: ["#4"],
        },
        {
          name: "pool",
          isMut: true,
          isSigner: false,
          docs: ["#5"],
        },
        {
          name: "position",
          isMut: true,
          isSigner: false,
          docs: ["#6"],
        },
        {
          name: "custody",
          isMut: true,
          isSigner: false,
          docs: ["#7"],
        },
        {
          name: "custodyOracle",
          isMut: false,
          isSigner: false,
          docs: ["#8"],
        },
        {
          name: "custodyTradeOracle",
          isMut: false,
          isSigner: false,
          docs: ["#9"],
        },
        {
          name: "custodyTokenAccount",
          isMut: true,
          isSigner: false,
          docs: ["#10"],
        },
        {
          name: "adrenaProgram",
          isMut: false,
          isSigner: false,
          docs: ["#11"],
        },
        {
          name: "tokenProgram",
          isMut: false,
          isSigner: false,
          docs: ["#12"],
        },
      ],
      args: [
        {
          name: "params",
          type: {
            defined: "RemoveCollateralLongParams",
          },
        },
      ],
    },
    {
      name: "removeCollateralShort",
      accounts: [
        {
          name: "owner",
          isMut: true,
          isSigner: true,
          docs: ["#1"],
        },
        {
          name: "receivingAccount",
          isMut: true,
          isSigner: false,
          docs: ["#2"],
        },
        {
          name: "transferAuthority",
          isMut: false,
          isSigner: false,
          docs: ["#3"],
        },
        {
          name: "cortex",
          isMut: true,
          isSigner: false,
          docs: ["#4"],
        },
        {
          name: "pool",
          isMut: true,
          isSigner: false,
          docs: ["#5"],
        },
        {
          name: "position",
          isMut: true,
          isSigner: false,
          docs: ["#6"],
        },
        {
          name: "custody",
          isMut: true,
          isSigner: false,
          docs: ["#7"],
        },
        {
          name: "custodyTradeOracle",
          isMut: false,
          isSigner: false,
          docs: ["#8"],
        },
        {
          name: "collateralCustody",
          isMut: true,
          isSigner: false,
          docs: ["#9"],
        },
        {
          name: "collateralCustodyOracle",
          isMut: false,
          isSigner: false,
          docs: ["#10"],
        },
        {
          name: "collateralCustodyTokenAccount",
          isMut: true,
          isSigner: false,
          docs: ["#11"],
        },
        {
          name: "adrenaProgram",
          isMut: false,
          isSigner: false,
          docs: ["#12"],
        },
        {
          name: "tokenProgram",
          isMut: false,
          isSigner: false,
          docs: ["#13"],
        },
      ],
      args: [
        {
          name: "params",
          type: {
            defined: "RemoveCollateralShortParams",
          },
        },
      ],
    },
    {
      name: "closePositionLong",
      accounts: [
        {
          name: "caller",
          isMut: true,
          isSigner: true,
          docs: ["#1"],
        },
        {
          name: "owner",
          isMut: true,
          isSigner: false,
          docs: ["#2"],
        },
        {
          name: "receivingAccount",
          isMut: true,
          isSigner: false,
          docs: ["#3"],
        },
        {
          name: "transferAuthority",
          isMut: false,
          isSigner: false,
          docs: ["#4"],
        },
        {
          name: "lmStaking",
          isMut: true,
          isSigner: false,
          docs: ["#5"],
        },
        {
          name: "lpStaking",
          isMut: true,
          isSigner: false,
          docs: ["#6"],
        },
        {
          name: "cortex",
          isMut: true,
          isSigner: false,
          docs: ["#7"],
        },
        {
          name: "pool",
          isMut: true,
          isSigner: false,
          docs: ["#8"],
        },
        {
          name: "position",
          isMut: true,
          isSigner: false,
          docs: ["#9"],
        },
        {
          name: "stakingRewardTokenCustody",
          isMut: true,
          isSigner: false,
          docs: ["#10"],
        },
        {
          name: "stakingRewardTokenCustodyOracle",
          isMut: false,
          isSigner: false,
          docs: ["#11"],
        },
        {
          name: "stakingRewardTokenCustodyTokenAccount",
          isMut: true,
          isSigner: false,
          docs: ["#12"],
        },
        {
          name: "custody",
          isMut: true,
          isSigner: false,
          docs: ["#13"],
        },
        {
          name: "custodyOracle",
          isMut: false,
          isSigner: false,
          docs: ["#14"],
        },
        {
          name: "custodyTradeOracle",
          isMut: false,
          isSigner: false,
          docs: ["#15"],
        },
        {
          name: "custodyTokenAccount",
          isMut: true,
          isSigner: false,
          docs: ["#16"],
        },
        {
          name: "lmStakingRewardTokenVault",
          isMut: true,
          isSigner: false,
          docs: ["#17"],
        },
        {
          name: "lpStakingRewardTokenVault",
          isMut: true,
          isSigner: false,
          docs: ["#18"],
        },
        {
          name: "lpTokenMint",
          isMut: true,
          isSigner: false,
          docs: ["#19"],
        },
        {
          name: "protocolFeeRecipient",
          isMut: true,
          isSigner: false,
          docs: ["#20"],
        },
        {
          name: "userProfile",
          isMut: true,
          isSigner: false,
          isOptional: true,
          docs: ["#21"],
        },
        {
          name: "tokenProgram",
          isMut: false,
          isSigner: false,
          docs: ["#22"],
        },
        {
          name: "adrenaProgram",
          isMut: false,
          isSigner: false,
          docs: ["#23"],
        },
      ],
      args: [
        {
          name: "params",
          type: {
            defined: "ClosePositionLongParams",
          },
        },
      ],
    },
    {
      name: "closePositionShort",
      accounts: [
        {
          name: "caller",
          isMut: true,
          isSigner: true,
          docs: ["#1"],
        },
        {
          name: "owner",
          isMut: true,
          isSigner: false,
          docs: ["#2"],
        },
        {
          name: "receivingAccount",
          isMut: true,
          isSigner: false,
          docs: ["#3"],
        },
        {
          name: "transferAuthority",
          isMut: false,
          isSigner: false,
          docs: ["#4"],
        },
        {
          name: "lmStaking",
          isMut: true,
          isSigner: false,
          docs: ["#5"],
        },
        {
          name: "lpStaking",
          isMut: true,
          isSigner: false,
          docs: ["#6"],
        },
        {
          name: "cortex",
          isMut: true,
          isSigner: false,
          docs: ["#7"],
        },
        {
          name: "pool",
          isMut: true,
          isSigner: false,
          docs: ["#8"],
        },
        {
          name: "position",
          isMut: true,
          isSigner: false,
          docs: ["#9"],
        },
        {
          name: "stakingRewardTokenCustody",
          isMut: true,
          isSigner: false,
          docs: ["#10"],
        },
        {
          name: "stakingRewardTokenCustodyOracle",
          isMut: false,
          isSigner: false,
          docs: ["#11"],
        },
        {
          name: "stakingRewardTokenCustodyTokenAccount",
          isMut: true,
          isSigner: false,
          docs: ["#12"],
        },
        {
          name: "custody",
          isMut: true,
          isSigner: false,
          docs: ["#13"],
        },
        {
          name: "custodyTradeOracle",
          isMut: false,
          isSigner: false,
          docs: ["#14"],
        },
        {
          name: "collateralCustody",
          isMut: true,
          isSigner: false,
          docs: ["#15"],
        },
        {
          name: "collateralCustodyOracle",
          isMut: false,
          isSigner: false,
          docs: ["#16"],
        },
        {
          name: "collateralCustodyTokenAccount",
          isMut: true,
          isSigner: false,
          docs: ["#17"],
        },
        {
          name: "lmStakingRewardTokenVault",
          isMut: true,
          isSigner: false,
          docs: ["#18"],
        },
        {
          name: "lpStakingRewardTokenVault",
          isMut: true,
          isSigner: false,
          docs: ["#19"],
        },
        {
          name: "lpTokenMint",
          isMut: true,
          isSigner: false,
          docs: ["#20"],
        },
        {
          name: "protocolFeeRecipient",
          isMut: true,
          isSigner: false,
          docs: ["#21"],
        },
        {
          name: "userProfile",
          isMut: true,
          isSigner: false,
          isOptional: true,
          docs: ["#22"],
        },
        {
          name: "tokenProgram",
          isMut: false,
          isSigner: false,
          docs: ["#23"],
        },
        {
          name: "adrenaProgram",
          isMut: false,
          isSigner: false,
          docs: ["#24"],
        },
      ],
      args: [
        {
          name: "params",
          type: {
            defined: "ClosePositionShortParams",
          },
        },
      ],
    },
    {
      name: "liquidateLong",
      accounts: [
        {
          name: "signer",
          isMut: true,
          isSigner: true,
          docs: ["#1"],
        },
        {
          name: "receivingAccount",
          isMut: true,
          isSigner: false,
          docs: ["#2"],
        },
        {
          name: "transferAuthority",
          isMut: false,
          isSigner: false,
          docs: ["#3"],
        },
        {
          name: "lmStaking",
          isMut: true,
          isSigner: false,
          docs: ["#4"],
        },
        {
          name: "lpStaking",
          isMut: true,
          isSigner: false,
          docs: ["#5"],
        },
        {
          name: "cortex",
          isMut: true,
          isSigner: false,
          docs: ["#6"],
        },
        {
          name: "pool",
          isMut: true,
          isSigner: false,
          docs: ["#7"],
        },
        {
          name: "position",
          isMut: true,
          isSigner: false,
          docs: ["#8"],
        },
        {
          name: "stakingRewardTokenCustody",
          isMut: true,
          isSigner: false,
          docs: ["#9"],
        },
        {
          name: "stakingRewardTokenCustodyOracle",
          isMut: false,
          isSigner: false,
          docs: ["#10"],
        },
        {
          name: "stakingRewardTokenCustodyTokenAccount",
          isMut: true,
          isSigner: false,
          docs: ["#11"],
        },
        {
          name: "custody",
          isMut: true,
          isSigner: false,
          docs: ["#12"],
        },
        {
          name: "custodyOracle",
          isMut: false,
          isSigner: false,
          docs: ["#13"],
        },
        {
          name: "custodyTradeOracle",
          isMut: false,
          isSigner: false,
          docs: ["#14"],
        },
        {
          name: "custodyTokenAccount",
          isMut: true,
          isSigner: false,
          docs: ["#15"],
        },
        {
          name: "lmStakingRewardTokenVault",
          isMut: true,
          isSigner: false,
          docs: ["#16"],
        },
        {
          name: "lpStakingRewardTokenVault",
          isMut: true,
          isSigner: false,
          docs: ["#17"],
        },
        {
          name: "lpTokenMint",
          isMut: true,
          isSigner: false,
          docs: ["#18"],
        },
        {
          name: "protocolFeeRecipient",
          isMut: true,
          isSigner: false,
          docs: ["#19"],
        },
        {
          name: "userProfile",
          isMut: true,
          isSigner: false,
          isOptional: true,
          docs: ["#20"],
        },
        {
          name: "tokenProgram",
          isMut: false,
          isSigner: false,
          docs: ["#21"],
        },
        {
          name: "adrenaProgram",
          isMut: false,
          isSigner: false,
          docs: ["#22"],
        },
      ],
      args: [
        {
          name: "params",
          type: {
            defined: "LiquidateLongParams",
          },
        },
      ],
    },
    {
      name: "liquidateShort",
      accounts: [
        {
          name: "signer",
          isMut: true,
          isSigner: true,
          docs: ["#1"],
        },
        {
          name: "receivingAccount",
          isMut: true,
          isSigner: false,
          docs: ["#2"],
        },
        {
          name: "transferAuthority",
          isMut: false,
          isSigner: false,
          docs: ["#3"],
        },
        {
          name: "lmStaking",
          isMut: true,
          isSigner: false,
          docs: ["#4"],
        },
        {
          name: "lpStaking",
          isMut: true,
          isSigner: false,
          docs: ["#5"],
        },
        {
          name: "cortex",
          isMut: true,
          isSigner: false,
          docs: ["#6"],
        },
        {
          name: "pool",
          isMut: true,
          isSigner: false,
          docs: ["#7"],
        },
        {
          name: "position",
          isMut: true,
          isSigner: false,
          docs: ["#8"],
        },
        {
          name: "stakingRewardTokenCustody",
          isMut: true,
          isSigner: false,
          docs: ["#9"],
        },
        {
          name: "stakingRewardTokenCustodyOracle",
          isMut: false,
          isSigner: false,
          docs: ["#10"],
        },
        {
          name: "stakingRewardTokenCustodyTokenAccount",
          isMut: true,
          isSigner: false,
          docs: ["#11"],
        },
        {
          name: "custody",
          isMut: true,
          isSigner: false,
          docs: ["#12"],
        },
        {
          name: "custodyTradeOracle",
          isMut: false,
          isSigner: false,
          docs: ["#13"],
        },
        {
          name: "collateralCustody",
          isMut: true,
          isSigner: false,
          docs: ["#14"],
        },
        {
          name: "collateralCustodyOracle",
          isMut: false,
          isSigner: false,
          docs: ["#15"],
        },
        {
          name: "collateralCustodyTokenAccount",
          isMut: true,
          isSigner: false,
          docs: ["#16"],
        },
        {
          name: "lmStakingRewardTokenVault",
          isMut: true,
          isSigner: false,
          docs: ["#17"],
        },
        {
          name: "lpStakingRewardTokenVault",
          isMut: true,
          isSigner: false,
          docs: ["#18"],
        },
        {
          name: "lpTokenMint",
          isMut: true,
          isSigner: false,
          docs: ["#19"],
        },
        {
          name: "protocolFeeRecipient",
          isMut: true,
          isSigner: false,
          docs: ["#20"],
        },
        {
          name: "userProfile",
          isMut: true,
          isSigner: false,
          isOptional: true,
          docs: ["#21"],
        },
        {
          name: "tokenProgram",
          isMut: false,
          isSigner: false,
          docs: ["#22"],
        },
        {
          name: "adrenaProgram",
          isMut: false,
          isSigner: false,
          docs: ["#23"],
        },
      ],
      args: [
        {
          name: "params",
          type: {
            defined: "LiquidateShortParams",
          },
        },
      ],
    },
    {
      name: "updatePoolAum",
      accounts: [
        {
          name: "payer",
          isMut: true,
          isSigner: true,
          docs: ["#1"],
        },
        {
          name: "cortex",
          isMut: false,
          isSigner: false,
          docs: ["#2"],
        },
        {
          name: "pool",
          isMut: true,
          isSigner: false,
          docs: ["#3"],
        },
      ],
      args: [],
      returns: "u128",
    },
    {
      name: "getAddLiquidityAmountAndFee",
      accounts: [
        {
          name: "cortex",
          isMut: false,
          isSigner: false,
          docs: ["#1"],
        },
        {
          name: "pool",
          isMut: false,
          isSigner: false,
          docs: ["#2"],
        },
        {
          name: "custody",
          isMut: false,
          isSigner: false,
          docs: ["#3"],
        },
        {
          name: "custodyOracle",
          isMut: false,
          isSigner: false,
          docs: ["#4"],
        },
        {
          name: "lpTokenMint",
          isMut: false,
          isSigner: false,
          docs: ["#5"],
        },
      ],
      args: [
        {
          name: "params",
          type: {
            defined: "GetAddLiquidityAmountAndFeeParams",
          },
        },
      ],
      returns: {
        defined: "AmountAndFee",
      },
    },
    {
      name: "getRemoveLiquidityAmountAndFee",
      accounts: [
        {
          name: "cortex",
          isMut: false,
          isSigner: false,
          docs: ["#1"],
        },
        {
          name: "pool",
          isMut: false,
          isSigner: false,
          docs: ["#2"],
        },
        {
          name: "custody",
          isMut: false,
          isSigner: false,
          docs: ["#3"],
        },
        {
          name: "custodyOracle",
          isMut: false,
          isSigner: false,
          docs: ["#4"],
        },
        {
          name: "lpTokenMint",
          isMut: false,
          isSigner: false,
          docs: ["#5"],
        },
      ],
      args: [
        {
          name: "params",
          type: {
            defined: "GetRemoveLiquidityAmountAndFeeParams",
          },
        },
      ],
      returns: {
        defined: "AmountAndFee",
      },
    },
    {
      name: "getEntryPriceAndFee",
      accounts: [
        {
          name: "cortex",
          isMut: false,
          isSigner: false,
          docs: ["#1"],
        },
        {
          name: "pool",
          isMut: false,
          isSigner: false,
          docs: ["#2"],
        },
        {
          name: "custody",
          isMut: false,
          isSigner: false,
          docs: ["#3"],
        },
        {
          name: "custodyTradeOracle",
          isMut: false,
          isSigner: false,
          docs: ["#4"],
        },
        {
          name: "collateralCustody",
          isMut: false,
          isSigner: false,
          docs: ["#5"],
        },
        {
          name: "collateralCustodyOracle",
          isMut: false,
          isSigner: false,
          docs: ["#6"],
        },
      ],
      args: [
        {
          name: "params",
          type: {
            defined: "GetEntryPriceAndFeeParams",
          },
        },
      ],
      returns: {
        defined: "NewPositionPricesAndFee",
      },
    },
    {
      name: "disableTokensFreezeCapabilities",
      accounts: [
        {
          name: "admin",
          isMut: false,
          isSigner: true,
          docs: ["#1"],
        },
        {
          name: "transferAuthority",
          isMut: false,
          isSigner: false,
          docs: ["#2"],
        },
        {
          name: "cortex",
          isMut: false,
          isSigner: false,
          docs: ["#3"],
        },
        {
          name: "lmTokenMint",
          isMut: true,
          isSigner: false,
          docs: ["#4"],
        },
        {
          name: "pool",
          isMut: false,
          isSigner: false,
          docs: ["#5"],
        },
        {
          name: "lpTokenMint",
          isMut: true,
          isSigner: false,
          docs: ["#6"],
        },
        {
          name: "tokenProgram",
          isMut: false,
          isSigner: false,
          docs: ["#7"],
        },
      ],
      args: [],
    },
    {
      name: "genesisStakePatch",
      accounts: [
        {
          name: "caller",
          isMut: false,
          isSigner: true,
          docs: ["#1"],
        },
        {
          name: "payer",
          isMut: true,
          isSigner: true,
          docs: ["#2"],
        },
        {
          name: "owner",
          isMut: false,
          isSigner: false,
          docs: ["#3"],
        },
        {
          name: "rewardTokenAccount",
          isMut: true,
          isSigner: false,
          docs: ["#4"],
        },
        {
          name: "lmTokenAccount",
          isMut: true,
          isSigner: false,
          docs: ["#5"],
        },
        {
          name: "stakingRewardTokenVault",
          isMut: true,
          isSigner: false,
          docs: ["#6"],
        },
        {
          name: "stakingLmRewardTokenVault",
          isMut: true,
          isSigner: false,
          docs: ["#7"],
        },
        {
          name: "transferAuthority",
          isMut: false,
          isSigner: false,
          docs: ["#8"],
        },
        {
          name: "userStaking",
          isMut: true,
          isSigner: false,
          docs: ["#9"],
        },
        {
          name: "staking",
          isMut: true,
          isSigner: false,
          docs: ["#10"],
        },
        {
          name: "cortex",
          isMut: true,
          isSigner: false,
          docs: ["#11"],
        },
        {
          name: "pool",
          isMut: false,
          isSigner: false,
          docs: ["#12"],
        },
        {
          name: "genesisLock",
          isMut: false,
          isSigner: false,
          docs: ["#13"],
        },
        {
          name: "lmTokenMint",
          isMut: true,
          isSigner: false,
          docs: ["#14"],
        },
        {
          name: "feeRedistributionMint",
          isMut: false,
          isSigner: false,
          docs: ["#15"],
        },
        {
          name: "adrenaProgram",
          isMut: false,
          isSigner: false,
          docs: ["#16"],
        },
        {
          name: "systemProgram",
          isMut: false,
          isSigner: false,
          docs: ["#17"],
        },
        {
          name: "tokenProgram",
          isMut: false,
          isSigner: false,
          docs: ["#18"],
        },
      ],
      args: [],
    },
    {
      name: "getOpenPositionWithSwapAmountAndFees",
      accounts: [
        {
          name: "cortex",
          isMut: false,
          isSigner: false,
          docs: ["#1"],
        },
        {
          name: "pool",
          isMut: false,
          isSigner: false,
          docs: ["#2"],
        },
        {
          name: "receivingCustody",
          isMut: false,
          isSigner: false,
          docs: ["#3"],
        },
        {
          name: "receivingCustodyOracle",
          isMut: false,
          isSigner: false,
          docs: ["#4"],
        },
        {
          name: "collateralCustody",
          isMut: false,
          isSigner: false,
          docs: ["#5"],
        },
        {
          name: "collateralCustodyOracle",
          isMut: false,
          isSigner: false,
          docs: ["#6"],
        },
        {
          name: "principalCustody",
          isMut: false,
          isSigner: false,
          docs: ["#7"],
        },
        {
          name: "principalCustodyTradeOracle",
          isMut: false,
          isSigner: false,
          docs: ["#8"],
        },
        {
          name: "adrenaProgram",
          isMut: false,
          isSigner: false,
          docs: ["#9"],
        },
      ],
      args: [
        {
          name: "params",
          type: {
            defined: "GetOpenPositionWithSwapAmountAndFeesParams",
          },
        },
      ],
      returns: {
        defined: "OpenPositionWithSwapAmountAndFees",
      },
    },
    {
      name: "getExitPriceAndFee",
      accounts: [
        {
          name: "cortex",
          isMut: false,
          isSigner: false,
          docs: ["#1"],
        },
        {
          name: "pool",
          isMut: false,
          isSigner: false,
          docs: ["#2"],
        },
        {
          name: "position",
          isMut: false,
          isSigner: false,
          docs: ["#3"],
        },
        {
          name: "custody",
          isMut: false,
          isSigner: false,
          docs: ["#4"],
        },
        {
          name: "custodyTradeOracle",
          isMut: false,
          isSigner: false,
          docs: ["#5"],
        },
        {
          name: "collateralCustody",
          isMut: false,
          isSigner: false,
          docs: ["#6"],
        },
        {
          name: "collateralCustodyOracle",
          isMut: false,
          isSigner: false,
          docs: ["#7"],
        },
      ],
      args: [],
      returns: {
        defined: "ExitPriceAndFee",
      },
    },
    {
      name: "getPnl",
      accounts: [
        {
          name: "cortex",
          isMut: false,
          isSigner: false,
          docs: ["#1"],
        },
        {
          name: "pool",
          isMut: false,
          isSigner: false,
          docs: ["#2"],
        },
        {
          name: "position",
          isMut: false,
          isSigner: false,
          docs: ["#3"],
        },
        {
          name: "custody",
          isMut: false,
          isSigner: false,
          docs: ["#4"],
        },
        {
          name: "custodyTradeOracle",
          isMut: false,
          isSigner: false,
          docs: ["#5"],
        },
        {
          name: "collateralCustody",
          isMut: false,
          isSigner: false,
          docs: ["#6"],
        },
        {
          name: "collateralCustodyOracle",
          isMut: false,
          isSigner: false,
          docs: ["#7"],
        },
      ],
      args: [],
      returns: {
        defined: "ProfitAndLoss",
      },
    },
    {
      name: "getLiquidationPrice",
      accounts: [
        {
          name: "cortex",
          isMut: false,
          isSigner: false,
          docs: ["#1"],
        },
        {
          name: "pool",
          isMut: false,
          isSigner: false,
          docs: ["#2"],
        },
        {
          name: "position",
          isMut: false,
          isSigner: false,
          docs: ["#3"],
        },
        {
          name: "custody",
          isMut: false,
          isSigner: false,
          docs: ["#4"],
        },
        {
          name: "collateralCustody",
          isMut: false,
          isSigner: false,
          docs: ["#5"],
        },
        {
          name: "collateralCustodyOracle",
          isMut: false,
          isSigner: false,
          docs: ["#6"],
        },
      ],
      args: [
        {
          name: "params",
          type: {
            defined: "GetLiquidationPriceParams",
          },
        },
      ],
      returns: "u64",
    },
    {
      name: "getLiquidationState",
      accounts: [
        {
          name: "cortex",
          isMut: false,
          isSigner: false,
          docs: ["#1"],
        },
        {
          name: "pool",
          isMut: false,
          isSigner: false,
          docs: ["#2"],
        },
        {
          name: "position",
          isMut: false,
          isSigner: false,
          docs: ["#3"],
        },
        {
          name: "custody",
          isMut: false,
          isSigner: false,
          docs: ["#4"],
        },
        {
          name: "custodyTradeOracle",
          isMut: false,
          isSigner: false,
          docs: ["#5"],
        },
        {
          name: "collateralCustody",
          isMut: false,
          isSigner: false,
          docs: ["#6"],
        },
        {
          name: "collateralCustodyOracle",
          isMut: false,
          isSigner: false,
          docs: ["#7"],
        },
      ],
      args: [],
      returns: "u8",
    },
    {
      name: "getOraclePrice",
      accounts: [
        {
          name: "cortex",
          isMut: false,
          isSigner: false,
          docs: ["#1"],
        },
        {
          name: "pool",
          isMut: false,
          isSigner: false,
          docs: ["#2"],
        },
        {
          name: "custody",
          isMut: false,
          isSigner: false,
          docs: ["#3"],
        },
        {
          name: "custodyOracle",
          isMut: false,
          isSigner: false,
          docs: ["#4"],
        },
      ],
      args: [],
      returns: "u64",
    },
    {
      name: "getSwapAmountAndFees",
      accounts: [
        {
          name: "cortex",
          isMut: false,
          isSigner: false,
          docs: ["#1"],
        },
        {
          name: "pool",
          isMut: false,
          isSigner: false,
          docs: ["#2"],
        },
        {
          name: "receivingCustody",
          isMut: false,
          isSigner: false,
          docs: ["#3"],
        },
        {
          name: "receivingCustodyOracle",
          isMut: false,
          isSigner: false,
          docs: ["#4"],
        },
        {
          name: "dispensingCustody",
          isMut: false,
          isSigner: false,
          docs: ["#5"],
        },
        {
          name: "dispensingCustodyOracle",
          isMut: false,
          isSigner: false,
          docs: ["#6"],
        },
      ],
      args: [
        {
          name: "params",
          type: {
            defined: "GetSwapAmountAndFeesParams",
          },
        },
      ],
      returns: {
        defined: "SwapAmountAndFees",
      },
    },
    {
      name: "getAssetsUnderManagement",
      accounts: [
        {
          name: "cortex",
          isMut: false,
          isSigner: false,
          docs: ["#1"],
        },
        {
          name: "pool",
          isMut: false,
          isSigner: false,
          docs: ["#2"],
        },
      ],
      args: [],
      returns: "u128",
    },
    {
      name: "initUserStaking",
      accounts: [
        {
          name: "owner",
          isMut: true,
          isSigner: true,
          docs: ["#1"],
        },
        {
          name: "rewardTokenAccount",
          isMut: true,
          isSigner: false,
          docs: ["#2"],
        },
        {
          name: "lmTokenAccount",
          isMut: true,
          isSigner: false,
          docs: ["#3"],
        },
        {
          name: "stakingRewardTokenVault",
          isMut: true,
          isSigner: false,
          docs: ["#4"],
        },
        {
          name: "stakingLmRewardTokenVault",
          isMut: true,
          isSigner: false,
          docs: ["#5"],
        },
        {
          name: "userStaking",
          isMut: true,
          isSigner: false,
          docs: ["#6"],
        },
        {
          name: "transferAuthority",
          isMut: false,
          isSigner: false,
          docs: ["#7"],
        },
        {
          name: "staking",
          isMut: false,
          isSigner: false,
          docs: ["#8"],
        },
        {
          name: "cortex",
          isMut: true,
          isSigner: false,
          docs: ["#9"],
        },
        {
          name: "pool",
          isMut: true,
          isSigner: false,
          docs: ["#10"],
        },
        {
          name: "genesisLock",
          isMut: true,
          isSigner: false,
          docs: ["#11"],
        },
        {
          name: "lmTokenMint",
          isMut: false,
          isSigner: false,
          docs: ["#12"],
        },
        {
          name: "feeRedistributionMint",
          isMut: false,
          isSigner: false,
          docs: ["#13"],
        },
        {
          name: "adrenaProgram",
          isMut: false,
          isSigner: false,
          docs: ["#14"],
        },
        {
          name: "systemProgram",
          isMut: false,
          isSigner: false,
          docs: ["#15"],
        },
        {
          name: "tokenProgram",
          isMut: false,
          isSigner: false,
          docs: ["#16"],
        },
      ],
      args: [],
    },
    {
      name: "initUserProfile",
      accounts: [
        {
          name: "user",
          isMut: false,
          isSigner: true,
          docs: ["#1"],
        },
        {
          name: "payer",
          isMut: true,
          isSigner: true,
          docs: ["#2"],
        },
        {
          name: "userProfile",
          isMut: true,
          isSigner: false,
          docs: ["#3"],
        },
        {
          name: "cortex",
          isMut: true,
          isSigner: false,
          docs: ["#4"],
        },
        {
          name: "systemProgram",
          isMut: false,
          isSigner: false,
          docs: ["#5"],
        },
      ],
      args: [
        {
          name: "params",
          type: {
            defined: "InitUserProfileParams",
          },
        },
      ],
    },
    {
      name: "editUserProfile",
      accounts: [
        {
          name: "user",
          isMut: false,
          isSigner: true,
          docs: ["#1"],
        },
        {
          name: "payer",
          isMut: true,
          isSigner: true,
          docs: ["#2"],
        },
        {
          name: "userProfile",
          isMut: true,
          isSigner: false,
          docs: ["#3"],
        },
        {
          name: "systemProgram",
          isMut: false,
          isSigner: false,
          docs: ["#4"],
        },
      ],
      args: [
        {
          name: "params",
          type: {
            defined: "EditUserProfileParams",
          },
        },
      ],
    },
    {
      name: "deleteUserProfile",
      accounts: [
        {
          name: "admin",
          isMut: false,
          isSigner: true,
          docs: ["#1"],
        },
        {
          name: "user",
          isMut: false,
          isSigner: false,
          docs: ["#2"],
        },
        {
          name: "payer",
          isMut: true,
          isSigner: true,
          docs: ["#3"],
        },
        {
          name: "userProfile",
          isMut: true,
          isSigner: false,
          docs: ["#4"],
        },
        {
          name: "cortex",
          isMut: true,
          isSigner: false,
          docs: ["#5"],
        },
        {
          name: "systemProgram",
          isMut: false,
          isSigner: false,
          docs: ["#6"],
        },
      ],
      args: [],
    },
    {
      name: "initStakingOne",
      accounts: [
        {
          name: "admin",
          isMut: false,
          isSigner: true,
          docs: ["#1"],
        },
        {
          name: "payer",
          isMut: true,
          isSigner: true,
          docs: ["#2"],
        },
        {
          name: "transferAuthority",
          isMut: false,
          isSigner: false,
          docs: ["#3"],
        },
        {
          name: "staking",
          isMut: true,
          isSigner: false,
          docs: ["#4"],
        },
        {
          name: "lmTokenMint",
          isMut: true,
          isSigner: false,
          docs: ["#5"],
        },
        {
          name: "cortex",
          isMut: true,
          isSigner: false,
          docs: ["#6"],
        },
        {
          name: "stakingStakedTokenVault",
          isMut: true,
          isSigner: false,
          docs: ["#7"],
        },
        {
          name: "feeRedistributionMint",
          isMut: false,
          isSigner: false,
          docs: ["#8"],
        },
        {
          name: "stakingStakedTokenMint",
          isMut: false,
          isSigner: false,
          docs: ["#9"],
        },
        {
          name: "adrenaProgram",
          isMut: false,
          isSigner: false,
          docs: ["#10"],
        },
        {
          name: "systemProgram",
          isMut: false,
          isSigner: false,
          docs: ["#11"],
        },
        {
          name: "tokenProgram",
          isMut: false,
          isSigner: false,
          docs: ["#12"],
        },
        {
          name: "rent",
          isMut: false,
          isSigner: false,
          docs: ["#13"],
        },
      ],
      args: [
        {
          name: "params",
          type: {
            defined: "InitStakingOneParams",
          },
        },
      ],
      returns: "u8",
    },
    {
      name: "initStakingTwo",
      accounts: [
        {
          name: "admin",
          isMut: false,
          isSigner: true,
          docs: ["#1"],
        },
        {
          name: "payer",
          isMut: true,
          isSigner: true,
          docs: ["#2"],
        },
        {
          name: "transferAuthority",
          isMut: false,
          isSigner: false,
          docs: ["#3"],
        },
        {
          name: "staking",
          isMut: true,
          isSigner: false,
          docs: ["#4"],
        },
        {
          name: "lmTokenMint",
          isMut: true,
          isSigner: false,
          docs: ["#5"],
        },
        {
          name: "cortex",
          isMut: true,
          isSigner: false,
          docs: ["#6"],
        },
        {
          name: "stakingRewardTokenVault",
          isMut: true,
          isSigner: false,
          docs: ["#7"],
        },
        {
          name: "feeRedistributionMint",
          isMut: false,
          isSigner: false,
          docs: ["#8"],
        },
        {
          name: "systemProgram",
          isMut: false,
          isSigner: false,
          docs: ["#9"],
        },
        {
          name: "tokenProgram",
          isMut: false,
          isSigner: false,
          docs: ["#10"],
        },
      ],
      args: [],
      returns: "u8",
    },
    {
      name: "initStakingThree",
      accounts: [
        {
          name: "admin",
          isMut: false,
          isSigner: true,
          docs: ["#1"],
        },
        {
          name: "payer",
          isMut: true,
          isSigner: true,
          docs: ["#2"],
        },
        {
          name: "transferAuthority",
          isMut: false,
          isSigner: false,
          docs: ["#3"],
        },
        {
          name: "staking",
          isMut: true,
          isSigner: false,
          docs: ["#4"],
        },
        {
          name: "lmTokenMint",
          isMut: true,
          isSigner: false,
          docs: ["#5"],
        },
        {
          name: "cortex",
          isMut: true,
          isSigner: false,
          docs: ["#6"],
        },
        {
          name: "stakingLmRewardTokenVault",
          isMut: true,
          isSigner: false,
          docs: ["#7"],
        },
        {
          name: "feeRedistributionMint",
          isMut: false,
          isSigner: false,
          docs: ["#8"],
        },
        {
          name: "systemProgram",
          isMut: false,
          isSigner: false,
          docs: ["#9"],
        },
        {
          name: "tokenProgram",
          isMut: false,
          isSigner: false,
          docs: ["#10"],
        },
      ],
      args: [],
      returns: "u8",
    },
    {
      name: "initStakingFour",
      accounts: [
        {
          name: "admin",
          isMut: false,
          isSigner: true,
          docs: ["#1"],
        },
        {
          name: "payer",
          isMut: true,
          isSigner: true,
          docs: ["#2"],
        },
        {
          name: "transferAuthority",
          isMut: false,
          isSigner: false,
          docs: ["#3"],
        },
        {
          name: "staking",
          isMut: true,
          isSigner: false,
          docs: ["#4"],
        },
        {
          name: "lmTokenMint",
          isMut: true,
          isSigner: false,
          docs: ["#5"],
        },
        {
          name: "cortex",
          isMut: true,
          isSigner: false,
          docs: ["#6"],
        },
        {
          name: "stakingStakedTokenVault",
          isMut: true,
          isSigner: false,
          docs: ["#7"],
        },
        {
          name: "stakingRewardTokenVault",
          isMut: true,
          isSigner: false,
          docs: ["#8"],
        },
        {
          name: "stakingLmRewardTokenVault",
          isMut: true,
          isSigner: false,
          docs: ["#9"],
        },
        {
          name: "feeRedistributionMint",
          isMut: false,
          isSigner: false,
          docs: ["#10"],
        },
        {
          name: "stakingStakedTokenMint",
          isMut: false,
          isSigner: false,
          docs: ["#11"],
        },
        {
          name: "adrenaProgram",
          isMut: false,
          isSigner: false,
          docs: ["#12"],
        },
        {
          name: "systemProgram",
          isMut: false,
          isSigner: false,
          docs: ["#13"],
        },
        {
          name: "tokenProgram",
          isMut: false,
          isSigner: false,
          docs: ["#14"],
        },
      ],
      args: [],
      returns: "u8",
    },
    {
      name: "addLiquidStake",
      accounts: [
        {
          name: "owner",
          isMut: true,
          isSigner: true,
          docs: ["#1"],
        },
        {
          name: "fundingAccount",
          isMut: true,
          isSigner: false,
          docs: ["#2"],
        },
        {
          name: "rewardTokenAccount",
          isMut: true,
          isSigner: false,
          docs: ["#3"],
        },
        {
          name: "lmTokenAccount",
          isMut: true,
          isSigner: false,
          docs: ["#4"],
        },
        {
          name: "stakingStakedTokenVault",
          isMut: true,
          isSigner: false,
          docs: ["#5"],
        },
        {
          name: "stakingRewardTokenVault",
          isMut: true,
          isSigner: false,
          docs: ["#6"],
        },
        {
          name: "stakingLmRewardTokenVault",
          isMut: true,
          isSigner: false,
          docs: ["#7"],
        },
        {
          name: "transferAuthority",
          isMut: false,
          isSigner: false,
          docs: ["#8"],
        },
        {
          name: "userStaking",
          isMut: true,
          isSigner: false,
          docs: ["#9"],
        },
        {
          name: "staking",
          isMut: true,
          isSigner: false,
          docs: ["#10"],
        },
        {
          name: "cortex",
          isMut: true,
          isSigner: false,
          docs: ["#11"],
        },
        {
          name: "pool",
          isMut: true,
          isSigner: false,
          docs: ["#13"],
        },
        {
          name: "genesisLock",
          isMut: true,
          isSigner: false,
          docs: ["#14"],
        },
        {
          name: "lmTokenMint",
          isMut: true,
          isSigner: false,
          docs: ["#15"],
        },
        {
          name: "governanceTokenMint",
          isMut: true,
          isSigner: false,
          docs: ["#16"],
        },
        {
          name: "feeRedistributionMint",
          isMut: false,
          isSigner: false,
          docs: ["#17"],
        },
        {
          name: "governanceRealm",
          isMut: false,
          isSigner: false,
          docs: [
            "#18",
            "A realm represent one project within the governance program",
          ],
        },
        {
          name: "governanceRealmConfig",
          isMut: false,
          isSigner: false,
          docs: ["#19"],
        },
        {
          name: "governanceGoverningTokenHolding",
          isMut: true,
          isSigner: false,
          docs: [
            "#20",
            "Token account owned by governance program holding user's locked tokens",
          ],
        },
        {
          name: "governanceGoverningTokenOwnerRecord",
          isMut: true,
          isSigner: false,
          docs: ["#21", "Account owned by governance storing user information"],
        },
        {
          name: "governanceProgram",
          isMut: false,
          isSigner: false,
          docs: ["#22"],
        },
        {
          name: "adrenaProgram",
          isMut: false,
          isSigner: false,
          docs: ["#23"],
        },
        {
          name: "systemProgram",
          isMut: false,
          isSigner: false,
          docs: ["#24"],
        },
        {
          name: "tokenProgram",
          isMut: false,
          isSigner: false,
          docs: ["#25"],
        },
      ],
      args: [
        {
          name: "params",
          type: {
            defined: "AddLiquidStakeParams",
          },
        },
      ],
    },
    {
      name: "addLockedStake",
      accounts: [
        {
          name: "owner",
          isMut: true,
          isSigner: true,
          docs: ["#1"],
        },
        {
          name: "fundingAccount",
          isMut: true,
          isSigner: false,
          docs: ["#2"],
        },
        {
          name: "rewardTokenAccount",
          isMut: true,
          isSigner: false,
          docs: ["#3"],
        },
        {
          name: "stakingStakedTokenVault",
          isMut: true,
          isSigner: false,
          docs: ["#4"],
        },
        {
          name: "stakingRewardTokenVault",
          isMut: true,
          isSigner: false,
          docs: ["#5"],
        },
        {
          name: "transferAuthority",
          isMut: false,
          isSigner: false,
          docs: ["#6"],
        },
        {
          name: "userStaking",
          isMut: true,
          isSigner: false,
          docs: ["#7"],
        },
        {
          name: "staking",
          isMut: true,
          isSigner: false,
          docs: ["#8"],
        },
        {
          name: "cortex",
          isMut: true,
          isSigner: false,
          docs: ["#9"],
        },
        {
          name: "lmTokenMint",
          isMut: true,
          isSigner: false,
          docs: ["#10"],
        },
        {
          name: "governanceTokenMint",
          isMut: true,
          isSigner: false,
          docs: ["#11"],
        },
        {
          name: "feeRedistributionMint",
          isMut: false,
          isSigner: false,
          docs: ["#12"],
        },
        {
          name: "governanceRealm",
          isMut: false,
          isSigner: false,
          docs: [
            "#13",
            "A realm represent one project within the governance program",
          ],
        },
        {
          name: "governanceRealmConfig",
          isMut: false,
          isSigner: false,
          docs: ["#14"],
        },
        {
          name: "governanceGoverningTokenHolding",
          isMut: true,
          isSigner: false,
          docs: [
            "#15",
            "Token account owned by governance program holding user's locked tokens",
          ],
        },
        {
          name: "governanceGoverningTokenOwnerRecord",
          isMut: true,
          isSigner: false,
          docs: ["#16", "Account owned by governance storing user information"],
        },
        {
          name: "governanceProgram",
          isMut: false,
          isSigner: false,
          docs: ["#17"],
        },
        {
          name: "adrenaProgram",
          isMut: false,
          isSigner: false,
          docs: ["#18"],
        },
        {
          name: "systemProgram",
          isMut: false,
          isSigner: false,
          docs: ["#19"],
        },
        {
          name: "tokenProgram",
          isMut: false,
          isSigner: false,
          docs: ["#20"],
        },
      ],
      args: [
        {
          name: "params",
          type: {
            defined: "AddLockedStakeParams",
          },
        },
      ],
    },
    {
      name: "upgradeLockedStake",
      accounts: [
        {
          name: "owner",
          isMut: true,
          isSigner: true,
          docs: ["#1"],
        },
        {
          name: "fundingAccount",
          isMut: true,
          isSigner: false,
          docs: ["#2"],
        },
        {
          name: "rewardTokenAccount",
          isMut: true,
          isSigner: false,
          docs: ["#3"],
        },
        {
          name: "lmTokenAccount",
          isMut: true,
          isSigner: false,
          docs: ["#4"],
        },
        {
          name: "stakingStakedTokenVault",
          isMut: true,
          isSigner: false,
          docs: ["#5"],
        },
        {
          name: "stakingRewardTokenVault",
          isMut: true,
          isSigner: false,
          docs: ["#6"],
        },
        {
          name: "transferAuthority",
          isMut: false,
          isSigner: false,
          docs: ["#7"],
        },
        {
          name: "userStaking",
          isMut: true,
          isSigner: false,
          docs: ["#8"],
        },
        {
          name: "staking",
          isMut: true,
          isSigner: false,
          docs: ["#9"],
        },
        {
          name: "cortex",
          isMut: true,
          isSigner: false,
          docs: ["#10"],
        },
        {
          name: "governanceTokenMint",
          isMut: true,
          isSigner: false,
          docs: ["#11"],
        },
        {
          name: "pool",
          isMut: true,
          isSigner: false,
          docs: ["#12"],
        },
        {
          name: "genesisLock",
          isMut: true,
          isSigner: false,
          docs: ["#13"],
        },
        {
          name: "lmTokenMint",
          isMut: true,
          isSigner: false,
          docs: ["#14"],
        },
        {
          name: "feeRedistributionMint",
          isMut: false,
          isSigner: false,
          docs: ["#15"],
        },
        {
          name: "governanceRealm",
          isMut: false,
          isSigner: false,
          docs: [
            "#16",
            "A realm represent one project within the governance program",
          ],
        },
        {
          name: "governanceRealmConfig",
          isMut: false,
          isSigner: false,
          docs: ["#17"],
        },
        {
          name: "governanceGoverningTokenHolding",
          isMut: true,
          isSigner: false,
          docs: [
            "#18",
            "Token account owned by governance program holding user's locked tokens",
          ],
        },
        {
          name: "governanceGoverningTokenOwnerRecord",
          isMut: true,
          isSigner: false,
          docs: ["#19", "Account owned by governance storing user information"],
        },
        {
          name: "stakingLmRewardTokenVault",
          isMut: true,
          isSigner: false,
          docs: ["#20"],
        },
        {
          name: "adrenaProgram",
          isMut: false,
          isSigner: false,
          docs: ["#21"],
        },
        {
          name: "governanceProgram",
          isMut: false,
          isSigner: false,
          docs: ["#22"],
        },
        {
          name: "systemProgram",
          isMut: false,
          isSigner: false,
          docs: ["#23"],
        },
        {
          name: "tokenProgram",
          isMut: false,
          isSigner: false,
          docs: ["#24"],
        },
      ],
      args: [
        {
          name: "params",
          type: {
            defined: "UpgradeLockedStakeParams",
          },
        },
      ],
    },
    {
      name: "removeLiquidStake",
      accounts: [
        {
          name: "owner",
          isMut: true,
          isSigner: true,
          docs: ["#1"],
        },
        {
          name: "stakedTokenAccount",
          isMut: true,
          isSigner: false,
          docs: ["#2"],
        },
        {
          name: "lmTokenAccount",
          isMut: true,
          isSigner: false,
          docs: ["#3"],
        },
        {
          name: "rewardTokenAccount",
          isMut: true,
          isSigner: false,
          docs: ["#4"],
        },
        {
          name: "stakingStakedTokenVault",
          isMut: true,
          isSigner: false,
          docs: ["#5"],
        },
        {
          name: "stakingRewardTokenVault",
          isMut: true,
          isSigner: false,
          docs: ["#6"],
        },
        {
          name: "stakingLmRewardTokenVault",
          isMut: true,
          isSigner: false,
          docs: ["#7"],
        },
        {
          name: "transferAuthority",
          isMut: false,
          isSigner: false,
          docs: ["#8"],
        },
        {
          name: "userStaking",
          isMut: true,
          isSigner: false,
          docs: ["#9"],
        },
        {
          name: "staking",
          isMut: true,
          isSigner: false,
          docs: ["#10"],
        },
        {
          name: "cortex",
          isMut: true,
          isSigner: false,
          docs: ["#11"],
        },
        {
          name: "pool",
          isMut: true,
          isSigner: false,
          docs: ["#12"],
        },
        {
          name: "genesisLock",
          isMut: true,
          isSigner: false,
          docs: ["#13"],
        },
        {
          name: "lmTokenMint",
          isMut: true,
          isSigner: false,
          docs: ["#14"],
        },
        {
          name: "governanceTokenMint",
          isMut: true,
          isSigner: false,
          docs: ["#15"],
        },
        {
          name: "feeRedistributionMint",
          isMut: false,
          isSigner: false,
          docs: ["#16"],
        },
        {
          name: "governanceRealm",
          isMut: false,
          isSigner: false,
          docs: [
            "#17",
            "A realm represent one project within the governance program",
          ],
        },
        {
          name: "governanceRealmConfig",
          isMut: false,
          isSigner: false,
          docs: ["#18"],
        },
        {
          name: "governanceGoverningTokenHolding",
          isMut: true,
          isSigner: false,
          docs: [
            "#19",
            "Token account owned by governance program holding user's locked tokens",
          ],
        },
        {
          name: "governanceGoverningTokenOwnerRecord",
          isMut: true,
          isSigner: false,
          docs: ["#20", "Account owned by governance storing user information"],
        },
        {
          name: "governanceProgram",
          isMut: false,
          isSigner: false,
          docs: ["#21"],
        },
        {
          name: "adrenaProgram",
          isMut: false,
          isSigner: false,
          docs: ["#22"],
        },
        {
          name: "systemProgram",
          isMut: false,
          isSigner: false,
          docs: ["#23"],
        },
        {
          name: "tokenProgram",
          isMut: false,
          isSigner: false,
          docs: ["#24"],
        },
      ],
      args: [
        {
          name: "params",
          type: {
            defined: "RemoveLiquidStakeParams",
          },
        },
      ],
    },
    {
      name: "removeLockedStake",
      accounts: [
        {
          name: "owner",
          isMut: true,
          isSigner: true,
          docs: ["#1"],
        },
        {
          name: "lmTokenAccount",
          isMut: true,
          isSigner: false,
          docs: ["#2"],
        },
        {
          name: "stakedTokenAccount",
          isMut: true,
          isSigner: false,
          docs: ["#3"],
        },
        {
          name: "rewardTokenAccount",
          isMut: true,
          isSigner: false,
          docs: ["#4"],
        },
        {
          name: "stakingStakedTokenVault",
          isMut: true,
          isSigner: false,
          docs: ["#5"],
        },
        {
          name: "stakingRewardTokenVault",
          isMut: true,
          isSigner: false,
          docs: ["#6"],
        },
        {
          name: "stakingLmRewardTokenVault",
          isMut: true,
          isSigner: false,
          docs: ["#7"],
        },
        {
          name: "transferAuthority",
          isMut: false,
          isSigner: false,
          docs: ["#8"],
        },
        {
          name: "userStaking",
          isMut: true,
          isSigner: false,
          docs: ["#9"],
        },
        {
          name: "staking",
          isMut: true,
          isSigner: false,
          docs: ["#10"],
        },
        {
          name: "cortex",
          isMut: true,
          isSigner: false,
          docs: ["#11"],
        },
        {
          name: "pool",
          isMut: true,
          isSigner: false,
          docs: ["#12"],
        },
        {
          name: "genesisLock",
          isMut: true,
          isSigner: false,
          docs: ["#13"],
        },
        {
          name: "lmTokenMint",
          isMut: true,
          isSigner: false,
          docs: ["#14"],
        },
        {
          name: "stakedTokenMint",
          isMut: true,
          isSigner: false,
          docs: ["#15"],
        },
        {
          name: "governanceTokenMint",
          isMut: true,
          isSigner: false,
          docs: ["#16"],
        },
        {
          name: "feeRedistributionMint",
          isMut: false,
          isSigner: false,
          docs: ["#17"],
        },
        {
          name: "governanceRealm",
          isMut: false,
          isSigner: false,
          docs: [
            "#18",
            "A realm represent one project within the governance program",
          ],
        },
        {
          name: "governanceRealmConfig",
          isMut: false,
          isSigner: false,
          docs: ["#19"],
        },
        {
          name: "governanceGoverningTokenHolding",
          isMut: true,
          isSigner: false,
          docs: [
            "#20",
            "Token account owned by governance program holding user's locked tokens",
          ],
        },
        {
          name: "governanceGoverningTokenOwnerRecord",
          isMut: true,
          isSigner: false,
          docs: ["#21", "Account owned by governance storing user information"],
        },
        {
          name: "governanceProgram",
          isMut: false,
          isSigner: false,
          docs: ["#22"],
        },
        {
          name: "adrenaProgram",
          isMut: false,
          isSigner: false,
          docs: ["#23"],
        },
        {
          name: "systemProgram",
          isMut: false,
          isSigner: false,
          docs: ["#24"],
        },
        {
          name: "tokenProgram",
          isMut: false,
          isSigner: false,
          docs: ["#25"],
        },
      ],
      args: [
        {
          name: "params",
          type: {
            defined: "RemoveLockedStakeParams",
          },
        },
      ],
    },
    {
      name: "claimStakes",
      accounts: [
        {
          name: "caller",
          isMut: true,
          isSigner: true,
          docs: ["#1"],
        },
        {
          name: "payer",
          isMut: true,
          isSigner: true,
          docs: ["#2"],
        },
        {
          name: "owner",
          isMut: true,
          isSigner: false,
          docs: ["#3"],
        },
        {
          name: "rewardTokenAccount",
          isMut: true,
          isSigner: false,
          docs: ["#4"],
        },
        {
          name: "lmTokenAccount",
          isMut: true,
          isSigner: false,
          docs: ["#5"],
        },
        {
          name: "stakingRewardTokenVault",
          isMut: true,
          isSigner: false,
          docs: ["#6"],
        },
        {
          name: "stakingLmRewardTokenVault",
          isMut: true,
          isSigner: false,
          docs: ["#7"],
        },
        {
          name: "transferAuthority",
          isMut: false,
          isSigner: false,
          docs: ["#8"],
        },
        {
          name: "userStaking",
          isMut: true,
          isSigner: false,
          docs: ["#9"],
        },
        {
          name: "staking",
          isMut: true,
          isSigner: false,
          docs: ["#10"],
        },
        {
          name: "cortex",
          isMut: true,
          isSigner: false,
          docs: ["#11"],
        },
        {
          name: "pool",
          isMut: true,
          isSigner: false,
          docs: ["#12"],
        },
        {
          name: "genesisLock",
          isMut: true,
          isSigner: false,
          docs: ["#13"],
        },
        {
          name: "lmTokenMint",
          isMut: true,
          isSigner: false,
          docs: ["#14"],
        },
        {
          name: "feeRedistributionMint",
          isMut: false,
          isSigner: false,
          docs: ["#15"],
        },
        {
          name: "adrenaProgram",
          isMut: false,
          isSigner: false,
          docs: ["#16"],
        },
        {
          name: "systemProgram",
          isMut: false,
          isSigner: false,
          docs: ["#17"],
        },
        {
          name: "tokenProgram",
          isMut: false,
          isSigner: false,
          docs: ["#18"],
        },
      ],
      args: [
        {
          name: "params",
          type: {
            defined: "ClaimStakesParams",
          },
        },
      ],
    },
    {
      name: "finalizeGenesisLockCampaign",
      accounts: [
        {
          name: "caller",
          isMut: true,
          isSigner: true,
          docs: ["#1"],
        },
        {
          name: "cortex",
          isMut: false,
          isSigner: false,
          docs: ["#2"],
        },
        {
          name: "pool",
          isMut: true,
          isSigner: false,
          docs: ["#3"],
        },
        {
          name: "genesisLock",
          isMut: true,
          isSigner: false,
          docs: ["#4"],
        },
        {
          name: "systemProgram",
          isMut: false,
          isSigner: false,
          docs: ["#5"],
        },
        {
          name: "tokenProgram",
          isMut: false,
          isSigner: false,
          docs: ["#6"],
        },
        {
          name: "adrenaProgram",
          isMut: false,
          isSigner: false,
          docs: ["#7"],
        },
      ],
      args: [],
    },
    {
      name: "setPoolLiquidityState",
      accounts: [
        {
          name: "admin",
          isMut: false,
          isSigner: true,
          docs: ["#1"],
        },
        {
          name: "cortex",
          isMut: true,
          isSigner: false,
          docs: ["#2"],
        },
        {
          name: "pool",
          isMut: true,
          isSigner: false,
          docs: ["#3"],
        },
      ],
      args: [
        {
          name: "params",
          type: {
            defined: "SetPoolLiquidityStateParams",
          },
        },
      ],
    },
    {
      name: "finalizeLockedStake",
      accounts: [
        {
          name: "caller",
          isMut: true,
          isSigner: true,
          docs: ["#1"],
        },
        {
          name: "owner",
          isMut: true,
          isSigner: false,
          docs: ["#2"],
        },
        {
          name: "transferAuthority",
          isMut: false,
          isSigner: false,
          docs: ["#3"],
        },
        {
          name: "userStaking",
          isMut: true,
          isSigner: false,
          docs: ["#4"],
        },
        {
          name: "staking",
          isMut: true,
          isSigner: false,
          docs: ["#5"],
        },
        {
          name: "cortex",
          isMut: true,
          isSigner: false,
          docs: ["#6"],
        },
        {
          name: "lmTokenMint",
          isMut: true,
          isSigner: false,
          docs: ["#7"],
        },
        {
          name: "governanceTokenMint",
          isMut: true,
          isSigner: false,
          docs: ["#8"],
        },
        {
          name: "governanceRealm",
          isMut: false,
          isSigner: false,
          docs: [
            "#9",
            "A realm represent one project within the governance program",
          ],
        },
        {
          name: "governanceRealmConfig",
          isMut: false,
          isSigner: false,
          docs: ["#10"],
        },
        {
          name: "governanceGoverningTokenHolding",
          isMut: true,
          isSigner: false,
          docs: [
            "#11",
            "Token account owned by governance program holding user's locked tokens",
          ],
        },
        {
          name: "governanceGoverningTokenOwnerRecord",
          isMut: true,
          isSigner: false,
          docs: ["#12", "Account owned by governance storing user information"],
        },
        {
          name: "governanceProgram",
          isMut: false,
          isSigner: false,
          docs: ["#13"],
        },
        {
          name: "adrenaProgram",
          isMut: false,
          isSigner: false,
          docs: ["#14"],
        },
        {
          name: "systemProgram",
          isMut: false,
          isSigner: false,
          docs: ["#15"],
        },
        {
          name: "tokenProgram",
          isMut: false,
          isSigner: false,
          docs: ["#16"],
        },
      ],
      args: [
        {
          name: "params",
          type: {
            defined: "FinalizeLockedStakeParams",
          },
        },
      ],
    },
    {
      name: "resolveStakingRound",
      accounts: [
        {
          name: "caller",
          isMut: true,
          isSigner: true,
          docs: ["#1"],
        },
        {
          name: "payer",
          isMut: true,
          isSigner: true,
          docs: ["#2"],
        },
        {
          name: "stakingStakedTokenVault",
          isMut: true,
          isSigner: false,
          docs: ["#3"],
        },
        {
          name: "stakingRewardTokenVault",
          isMut: true,
          isSigner: false,
          docs: ["#4"],
        },
        {
          name: "stakingLmRewardTokenVault",
          isMut: true,
          isSigner: false,
          docs: ["#5"],
        },
        {
          name: "transferAuthority",
          isMut: false,
          isSigner: false,
          docs: ["#6"],
        },
        {
          name: "staking",
          isMut: true,
          isSigner: false,
          docs: ["#7"],
        },
        {
          name: "cortex",
          isMut: true,
          isSigner: false,
          docs: ["#8"],
        },
        {
          name: "lmTokenMint",
          isMut: true,
          isSigner: false,
          docs: ["#9"],
        },
        {
          name: "feeRedistributionMint",
          isMut: false,
          isSigner: false,
          docs: ["#10"],
        },
        {
          name: "adrenaProgram",
          isMut: false,
          isSigner: false,
          docs: ["#11"],
        },
        {
          name: "systemProgram",
          isMut: false,
          isSigner: false,
          docs: ["#12"],
        },
        {
          name: "tokenProgram",
          isMut: false,
          isSigner: false,
          docs: ["#13"],
        },
      ],
      args: [],
    },
    {
      name: "getLpTokenPrice",
      accounts: [
        {
          name: "cortex",
          isMut: false,
          isSigner: false,
          docs: ["#1"],
        },
        {
          name: "pool",
          isMut: false,
          isSigner: false,
          docs: ["#2"],
        },
        {
          name: "lpTokenMint",
          isMut: false,
          isSigner: false,
          docs: ["#3"],
        },
      ],
      args: [],
      returns: "u64",
    },
    {
      name: "getPoolInfoSnapshot",
      accounts: [
        {
          name: "cortex",
          isMut: false,
          isSigner: false,
          docs: ["#1"],
        },
        {
          name: "pool",
          isMut: false,
          isSigner: false,
          docs: ["#2"],
        },
        {
          name: "lpTokenMint",
          isMut: false,
          isSigner: false,
          docs: ["#3"],
        },
      ],
      args: [],
      returns: {
        defined: "PoolInfoSnapshot",
      },
    },
    {
      name: "mintLmTokensFromBucket",
      accounts: [
        {
          name: "admin",
          isMut: false,
          isSigner: true,
          docs: ["#1"],
        },
        {
          name: "receivingAccount",
          isMut: true,
          isSigner: false,
          docs: ["#2"],
        },
        {
          name: "transferAuthority",
          isMut: false,
          isSigner: false,
          docs: ["#3"],
        },
        {
          name: "cortex",
          isMut: true,
          isSigner: false,
          docs: ["#4"],
        },
        {
          name: "lmTokenMint",
          isMut: true,
          isSigner: false,
          docs: ["#5"],
        },
        {
          name: "tokenProgram",
          isMut: false,
          isSigner: false,
          docs: ["#6"],
        },
      ],
      args: [
        {
          name: "params",
          type: {
            defined: "MintLmTokensFromBucketParams",
          },
        },
      ],
      returns: "u8",
    },
    {
      name: "increasePositionLong",
      accounts: [
        {
          name: "owner",
          isMut: false,
          isSigner: true,
          docs: ["#1"],
        },
        {
          name: "payer",
          isMut: true,
          isSigner: true,
          docs: ["#2"],
        },
        {
          name: "fundingAccount",
          isMut: true,
          isSigner: false,
          docs: ["#3"],
        },
        {
          name: "transferAuthority",
          isMut: false,
          isSigner: false,
          docs: ["#4"],
        },
        {
          name: "cortex",
          isMut: true,
          isSigner: false,
          docs: ["#5"],
        },
        {
          name: "pool",
          isMut: true,
          isSigner: false,
          docs: ["#6"],
        },
        {
          name: "position",
          isMut: true,
          isSigner: false,
          docs: ["#7"],
        },
        {
          name: "custody",
          isMut: true,
          isSigner: false,
          docs: ["#8"],
        },
        {
          name: "custodyTokenAccount",
          isMut: true,
          isSigner: false,
          docs: ["#9"],
        },
        {
          name: "custodyOracle",
          isMut: false,
          isSigner: false,
          docs: ["#10"],
        },
        {
          name: "custodyTradeOracle",
          isMut: false,
          isSigner: false,
          docs: ["#11"],
        },
        {
          name: "systemProgram",
          isMut: false,
          isSigner: false,
          docs: ["#12"],
        },
        {
          name: "tokenProgram",
          isMut: false,
          isSigner: false,
          docs: ["#13"],
        },
        {
          name: "adrenaProgram",
          isMut: false,
          isSigner: false,
          docs: ["#14"],
        },
      ],
      args: [
        {
          name: "params",
          type: {
            defined: "IncreasePositionLongParams",
          },
        },
      ],
    },
    {
      name: "patchCustodyLockedAmount",
      accounts: [
        {
          name: "admin",
          isMut: false,
          isSigner: true,
          docs: ["#1"],
        },
        {
          name: "pool",
          isMut: false,
          isSigner: false,
          docs: ["#2"],
        },
        {
          name: "cortex",
          isMut: false,
          isSigner: false,
          docs: ["#3"],
        },
        {
          name: "usdcCustody",
          isMut: true,
          isSigner: false,
          docs: ["#4"],
        },
        {
          name: "bonkCustody",
          isMut: true,
          isSigner: false,
          docs: ["#5"],
        },
        {
          name: "wbtcCustody",
          isMut: true,
          isSigner: false,
          docs: ["#6"],
        },
        {
          name: "jitoCustody",
          isMut: true,
          isSigner: false,
          docs: ["#7"],
        },
      ],
      args: [],
    },
    {
      name: "increasePositionShort",
      accounts: [
        {
          name: "owner",
          isMut: false,
          isSigner: true,
          docs: ["#1"],
        },
        {
          name: "payer",
          isMut: true,
          isSigner: true,
          docs: ["#2"],
        },
        {
          name: "fundingAccount",
          isMut: true,
          isSigner: false,
          docs: ["#3"],
        },
        {
          name: "transferAuthority",
          isMut: false,
          isSigner: false,
          docs: ["#4"],
        },
        {
          name: "cortex",
          isMut: true,
          isSigner: false,
          docs: ["#5"],
        },
        {
          name: "pool",
          isMut: true,
          isSigner: false,
          docs: ["#6"],
        },
        {
          name: "position",
          isMut: true,
          isSigner: false,
          docs: ["#7"],
        },
        {
          name: "custody",
          isMut: true,
          isSigner: false,
          docs: ["#8"],
        },
        {
          name: "custodyTradeOracle",
          isMut: false,
          isSigner: false,
          docs: ["#9"],
        },
        {
          name: "collateralCustody",
          isMut: true,
          isSigner: false,
          docs: ["#10"],
        },
        {
          name: "collateralCustodyOracle",
          isMut: false,
          isSigner: false,
          docs: ["#11"],
        },
        {
          name: "collateralCustodyTokenAccount",
          isMut: true,
          isSigner: false,
          docs: ["#12"],
        },
        {
          name: "systemProgram",
          isMut: false,
          isSigner: false,
          docs: ["#13"],
        },
        {
          name: "tokenProgram",
          isMut: false,
          isSigner: false,
          docs: ["#14"],
        },
        {
          name: "adrenaProgram",
          isMut: false,
          isSigner: false,
          docs: ["#15"],
        },
      ],
      args: [
        {
          name: "params",
          type: {
            defined: "IncreasePositionShortParams",
          },
        },
      ],
    },
    {
      name: "setStakingLmEmissionPotentiometers",
      accounts: [
        {
          name: "admin",
          isMut: false,
          isSigner: true,
          docs: ["#1"],
        },
        {
          name: "cortex",
          isMut: false,
          isSigner: false,
          docs: ["#2"],
        },
        {
          name: "staking",
          isMut: true,
          isSigner: false,
          docs: ["#3"],
        },
      ],
      args: [
        {
          name: "params",
          type: {
            defined: "SetStakingLmEmissionPotentiometersParams",
          },
        },
      ],
    },
    {
      name: "setAdmin",
      accounts: [
        {
          name: "admin",
          isMut: false,
          isSigner: true,
          docs: ["#1"],
        },
        {
          name: "cortex",
          isMut: true,
          isSigner: false,
          docs: ["#2"],
        },
      ],
      args: [
        {
          name: "params",
          type: {
            defined: "SetAdminParams",
          },
        },
      ],
    },
    {
      name: "setProtocolFeeRecipient",
      accounts: [
        {
          name: "admin",
          isMut: false,
          isSigner: true,
          docs: ["#1"],
        },
        {
          name: "cortex",
          isMut: true,
          isSigner: false,
          docs: ["#2"],
        },
        {
          name: "protocolFeeRecipient",
          isMut: false,
          isSigner: false,
          docs: ["#3"],
        },
        {
          name: "feeRedistributionMint",
          isMut: false,
          isSigner: false,
          docs: ["#4"],
        },
      ],
      args: [],
    },
    {
      name: "setCustodyMaxCumulativeShortPositionSizeUsd",
      accounts: [
        {
          name: "admin",
          isMut: false,
          isSigner: true,
          docs: ["#1"],
        },
        {
          name: "cortex",
          isMut: true,
          isSigner: false,
          docs: ["#2"],
        },
        {
          name: "pool",
          isMut: true,
          isSigner: false,
          docs: ["#3"],
        },
        {
          name: "custody",
          isMut: true,
          isSigner: false,
          docs: ["#4"],
        },
      ],
      args: [
        {
          name: "params",
          type: {
            defined: "SetCustodyMaxCumulativeShortPositionSizeUsdParams",
          },
        },
      ],
    },
    {
      name: "setTakeProfitLong",
      accounts: [
        {
          name: "owner",
          isMut: true,
          isSigner: true,
          docs: ["#1"],
        },
        {
          name: "cortex",
          isMut: true,
          isSigner: false,
          docs: ["#2"],
        },
        {
          name: "pool",
          isMut: true,
          isSigner: false,
          docs: ["#3"],
        },
        {
          name: "position",
          isMut: true,
          isSigner: false,
          docs: ["#4"],
        },
        {
          name: "custody",
          isMut: true,
          isSigner: false,
          docs: ["#5"],
        },
      ],
      args: [
        {
          name: "params",
          type: {
            defined: "SetTakeProfitLongParams",
          },
        },
      ],
    },
    {
      name: "setStopLossLong",
      accounts: [
        {
          name: "owner",
          isMut: true,
          isSigner: true,
          docs: ["#1"],
        },
        {
          name: "cortex",
          isMut: false,
          isSigner: false,
          docs: ["#2"],
        },
        {
          name: "pool",
          isMut: false,
          isSigner: false,
          docs: ["#3"],
        },
        {
          name: "position",
          isMut: true,
          isSigner: false,
          docs: ["#4"],
        },
        {
          name: "custody",
          isMut: false,
          isSigner: false,
          docs: ["#5"],
        },
      ],
      args: [
        {
          name: "params",
          type: {
            defined: "SetStopLossLongParams",
          },
        },
      ],
    },
    {
      name: "setTakeProfitShort",
      accounts: [
        {
          name: "owner",
          isMut: true,
          isSigner: true,
          docs: ["#1"],
        },
        {
          name: "cortex",
          isMut: true,
          isSigner: false,
          docs: ["#2"],
        },
        {
          name: "pool",
          isMut: true,
          isSigner: false,
          docs: ["#3"],
        },
        {
          name: "position",
          isMut: true,
          isSigner: false,
          docs: ["#4"],
        },
        {
          name: "custody",
          isMut: true,
          isSigner: false,
          docs: ["#5"],
        },
      ],
      args: [
        {
          name: "params",
          type: {
            defined: "SetTakeProfitShortParams",
          },
        },
      ],
    },
    {
      name: "setStopLossShort",
      accounts: [
        {
          name: "owner",
          isMut: true,
          isSigner: true,
          docs: ["#1"],
        },
        {
          name: "cortex",
          isMut: false,
          isSigner: false,
          docs: ["#2"],
        },
        {
          name: "pool",
          isMut: false,
          isSigner: false,
          docs: ["#3"],
        },
        {
          name: "position",
          isMut: true,
          isSigner: false,
          docs: ["#4"],
        },
        {
          name: "custody",
          isMut: false,
          isSigner: false,
          docs: ["#5"],
        },
      ],
      args: [
        {
          name: "params",
          type: {
            defined: "SetStopLossShortParams",
          },
        },
      ],
    },
    {
      name: "cancelTakeProfit",
      accounts: [
        {
          name: "owner",
          isMut: true,
          isSigner: true,
          docs: ["#1"],
        },
        {
          name: "cortex",
          isMut: false,
          isSigner: false,
          docs: ["#2"],
        },
        {
          name: "pool",
          isMut: false,
          isSigner: false,
          docs: ["#3"],
        },
        {
          name: "position",
          isMut: true,
          isSigner: false,
          docs: ["#4"],
        },
        {
          name: "custody",
          isMut: false,
          isSigner: false,
          docs: ["#5"],
        },
      ],
      args: [],
    },
    {
      name: "cancelStopLoss",
      accounts: [
        {
          name: "owner",
          isMut: true,
          isSigner: true,
          docs: ["#1"],
        },
        {
          name: "cortex",
          isMut: false,
          isSigner: false,
          docs: ["#2"],
        },
        {
          name: "pool",
          isMut: false,
          isSigner: false,
          docs: ["#3"],
        },
        {
          name: "position",
          isMut: true,
          isSigner: false,
          docs: ["#4"],
        },
        {
          name: "custody",
          isMut: false,
          isSigner: false,
          docs: ["#5"],
        },
      ],
      args: [],
    },
    {
      name: "patchStakingRound",
      accounts: [
        {
          name: "admin",
          isMut: false,
          isSigner: true,
          docs: ["#1"],
        },
        {
          name: "payer",
          isMut: true,
          isSigner: true,
          docs: ["#2"],
        },
        {
          name: "fundingAccount",
          isMut: true,
          isSigner: false,
          docs: ["#3"],
        },
        {
          name: "stakingRewardTokenVault",
          isMut: true,
          isSigner: false,
          docs: ["#4"],
        },
        {
          name: "stakingLmRewardTokenVault",
          isMut: true,
          isSigner: false,
          docs: ["#5"],
        },
        {
          name: "transferAuthority",
          isMut: false,
          isSigner: false,
          docs: ["#6"],
        },
        {
          name: "staking",
          isMut: true,
          isSigner: false,
          docs: ["#7"],
        },
        {
          name: "cortex",
          isMut: true,
          isSigner: false,
          docs: ["#8"],
        },
        {
          name: "lmTokenMint",
          isMut: true,
          isSigner: false,
          docs: ["#9"],
        },
        {
          name: "feeRedistributionMint",
          isMut: false,
          isSigner: false,
          docs: ["#10"],
        },
        {
          name: "adrenaProgram",
          isMut: false,
          isSigner: false,
          docs: ["#11"],
        },
        {
          name: "systemProgram",
          isMut: false,
          isSigner: false,
          docs: ["#12"],
        },
        {
          name: "tokenProgram",
          isMut: false,
          isSigner: false,
          docs: ["#13"],
        },
      ],
      args: [],
    },
    {
      name: "setPoolWhitelistedSwapper",
      accounts: [
        {
          name: "admin",
          isMut: false,
          isSigner: true,
          docs: ["#1"],
        },
        {
          name: "cortex",
          isMut: false,
          isSigner: false,
          docs: ["#2"],
        },
        {
          name: "pool",
          isMut: true,
          isSigner: false,
          docs: ["#3"],
        },
        {
          name: "whitelistedSwapper",
          isMut: false,
          isSigner: false,
          docs: ["#4"],
        },
      ],
      args: [],
    },
  ],
  accounts: [
    {
      name: "cortex",
      type: {
        kind: "struct",
        fields: [
          {
            name: "bump",
            type: "u8",
          },
          {
            name: "transferAuthorityBump",
            type: "u8",
          },
          {
            name: "lmTokenBump",
            type: "u8",
          },
          {
            name: "governanceTokenBump",
            type: "u8",
          },
          {
            name: "initialized",
            type: "u8",
          },
          {
            name: "feeConversionDecimals",
            type: "u8",
          },
          {
            name: "padding",
            type: {
              array: ["u8", 2],
            },
          },
          {
            name: "lmTokenMint",
            type: "publicKey",
          },
          {
            name: "inceptionTime",
            type: "i64",
          },
          {
            name: "admin",
            type: "publicKey",
          },
          {
            name: "feeRedistributionMint",
            type: "publicKey",
          },
          {
            name: "protocolFeeRecipient",
            type: "publicKey",
          },
          {
            name: "pools",
            type: {
              array: ["publicKey", 4],
            },
          },
          {
            name: "userProfilesCount",
            type: "u64",
          },
          {
            name: "governanceProgram",
            type: "publicKey",
          },
          {
            name: "governanceRealm",
            type: "publicKey",
          },
          {
            name: "coreContributorBucketAllocation",
            type: "u64",
          },
          {
            name: "foundationBucketAllocation",
            type: "u64",
          },
          {
            name: "ecosystemBucketAllocation",
            type: "u64",
          },
          {
            name: "coreContributorBucketVestedAmount",
            type: "u64",
          },
          {
            name: "coreContributorBucketMintedAmount",
            type: "u64",
          },
          {
            name: "foundationBucketVestedAmount",
            type: "u64",
          },
          {
            name: "foundationBucketMintedAmount",
            type: "u64",
          },
          {
            name: "ecosystemBucketVestedAmount",
            type: "u64",
          },
          {
            name: "ecosystemBucketMintedAmount",
            type: "u64",
          },
          {
            name: "genesisLiquidityAlpAmount",
            type: "u64",
          },
          {
            name: "uniquePositionIdCounter",
            type: "u64",
          },
        ],
      },
    },
    {
      name: "custody",
      type: {
        kind: "struct",
        fields: [
          {
            name: "bump",
            type: "u8",
          },
          {
            name: "tokenAccountBump",
            type: "u8",
          },
          {
            name: "allowTrade",
            type: "u8",
          },
          {
            name: "allowSwap",
            type: "u8",
          },
          {
            name: "decimals",
            type: "u8",
          },
          {
            name: "isStable",
            type: "u8",
          },
          {
            name: "padding",
            type: {
              array: ["u8", 2],
            },
          },
          {
            name: "pool",
            type: "publicKey",
          },
          {
            name: "mint",
            type: "publicKey",
          },
          {
            name: "tokenAccount",
            type: "publicKey",
          },
          {
            name: "oracle",
            type: "publicKey",
          },
          {
            name: "tradeOracle",
            type: "publicKey",
          },
          {
            name: "pricing",
            type: {
              defined: "PricingParams",
            },
          },
          {
            name: "fees",
            type: {
              defined: "Fees",
            },
          },
          {
            name: "borrowRate",
            type: {
              defined: "BorrowRateParams",
            },
          },
          {
            name: "collectedFees",
            type: {
              defined: "FeesStats",
            },
          },
          {
            name: "volumeStats",
            type: {
              defined: "VolumeStats",
            },
          },
          {
            name: "tradeStats",
            type: {
              defined: "TradeStats",
            },
          },
          {
            name: "assets",
            type: {
              defined: "Assets",
            },
          },
          {
            name: "longPositions",
            type: {
              defined: "PositionsAccounting",
            },
          },
          {
            name: "shortPositions",
            type: {
              defined: "PositionsAccounting",
            },
          },
          {
            name: "borrowRateState",
            type: {
              defined: "BorrowRateState",
            },
          },
        ],
      },
    },
    {
      name: "genesisLock",
      type: {
        kind: "struct",
        fields: [
          {
            name: "bump",
            type: "u8",
          },
          {
            name: "hasTransitionedToFullyPublic",
            type: "u8",
          },
          {
            name: "hasCompletedOtcIn",
            type: "u8",
          },
          {
            name: "hasCompletedOtcOut",
            type: "u8",
          },
          {
            name: "padding",
            type: {
              array: ["u8", 4],
            },
          },
          {
            name: "campaignDuration",
            type: "i64",
          },
          {
            name: "reservedGrantDuration",
            type: "i64",
          },
          {
            name: "campaignStartDate",
            type: "i64",
          },
          {
            name: "publicAmount",
            type: "u64",
          },
          {
            name: "reservedAmount",
            type: "u64",
          },
          {
            name: "publicAmountClaimed",
            type: "u64",
          },
          {
            name: "reservedAmountClaimed",
            type: "u64",
          },
          {
            name: "reservedGrantOwners",
            type: {
              array: ["publicKey", 43],
            },
          },
          {
            name: "reservedGrantAmounts",
            type: {
              array: ["u64", 43],
            },
          },
          {
            name: "paddingUnsafe",
            type: {
              array: ["u8", 8],
            },
          },
        ],
      },
    },
    {
      name: "pool",
      type: {
        kind: "struct",
        fields: [
          {
            name: "bump",
            type: "u8",
          },
          {
            name: "lpTokenBump",
            type: "u8",
          },
          {
            name: "nbStableCustody",
            type: "u8",
          },
          {
            name: "initialized",
            type: "u8",
          },
          {
            name: "allowTrade",
            type: "u8",
          },
          {
            name: "allowSwap",
            type: "u8",
          },
          {
            name: "liquidityState",
            type: "u8",
          },
          {
            name: "registeredCustodyCount",
            type: "u8",
          },
          {
            name: "name",
            type: {
              defined: "LimitedString",
            },
          },
          {
            name: "custodies",
            type: {
              array: ["publicKey", 8],
            },
          },
          {
            name: "padding1",
            type: {
              array: ["u8", 32],
            },
          },
          {
            name: "whitelistedSwapper",
            type: "publicKey",
          },
          {
            name: "ratios",
            type: {
              array: [
                {
                  defined: "TokenRatios",
                },
                8,
              ],
            },
          },
          {
            name: "padding2",
            type: {
              array: ["u8", 16],
            },
          },
          {
            name: "aumUsd",
            type: {
              defined: "U128Split",
            },
          },
          {
            name: "inceptionTime",
            type: "i64",
          },
          {
            name: "aumSoftCapUsd",
            type: "u64",
          },
        ],
      },
    },
    {
      name: "position",
      type: {
        kind: "struct",
        fields: [
          {
            name: "bump",
            type: "u8",
          },
          {
            name: "side",
            type: "u8",
          },
          {
            name: "takeProfitIsSet",
            type: "u8",
          },
          {
            name: "stopLossIsSet",
            type: "u8",
          },
          {
            name: "paddingUnsafe",
            type: {
              array: ["u8", 1],
            },
          },
          {
            name: "padding",
            type: {
              array: ["u8", 3],
            },
          },
          {
            name: "owner",
            type: "publicKey",
          },
          {
            name: "pool",
            type: "publicKey",
          },
          {
            name: "custody",
            type: "publicKey",
          },
          {
            name: "collateralCustody",
            type: "publicKey",
          },
          {
            name: "openTime",
            type: "i64",
          },
          {
            name: "updateTime",
            type: "i64",
          },
          {
            name: "price",
            type: "u64",
          },
          {
            name: "sizeUsd",
            type: "u64",
          },
          {
            name: "borrowSizeUsd",
            type: "u64",
          },
          {
            name: "collateralUsd",
            type: "u64",
          },
          {
            name: "unrealizedInterestUsd",
            type: "u64",
          },
          {
            name: "cumulativeInterestSnapshot",
            type: {
              defined: "U128Split",
            },
          },
          {
            name: "lockedAmount",
            type: "u64",
          },
          {
            name: "collateralAmount",
            type: "u64",
          },
          {
            name: "exitFeeUsd",
            type: "u64",
          },
          {
            name: "liquidationFeeUsd",
            type: "u64",
          },
          {
            name: "id",
            type: "u64",
          },
          {
            name: "takeProfitLimitPrice",
            type: "u64",
          },
          {
            name: "paddingUnsafe3",
            type: {
              array: ["u8", 8],
            },
          },
          {
            name: "stopLossLimitPrice",
            type: "u64",
          },
          {
            name: "stopLossClosePositionPrice",
            type: "u64",
          },
        ],
      },
    },
    {
      name: "staking",
      type: {
        kind: "struct",
        fields: [
          {
            name: "stakingType",
            type: "u8",
          },
          {
            name: "bump",
            type: "u8",
          },
          {
            name: "stakedTokenVaultBump",
            type: "u8",
          },
          {
            name: "rewardTokenVaultBump",
            type: "u8",
          },
          {
            name: "lmRewardTokenVaultBump",
            type: "u8",
          },
          {
            name: "rewardTokenDecimals",
            type: "u8",
          },
          {
            name: "stakedTokenDecimals",
            type: "u8",
          },
          {
            name: "initialized",
            type: "u8",
          },
          {
            name: "nbLockedTokens",
            type: "u64",
          },
          {
            name: "nbLiquidTokens",
            type: "u64",
          },
          {
            name: "stakedTokenMint",
            type: "publicKey",
          },
          {
            name: "resolvedRewardTokenAmount",
            type: "u64",
          },
          {
            name: "resolvedStakedTokenAmount",
            type: "u64",
          },
          {
            name: "resolvedLmRewardTokenAmount",
            type: "u64",
          },
          {
            name: "resolvedLmStakedTokenAmount",
            type: "u64",
          },
          {
            name: "currentStakingRound",
            type: {
              defined: "StakingRound",
            },
          },
          {
            name: "nextStakingRound",
            type: {
              defined: "StakingRound",
            },
          },
          {
            name: "resolvedStakingRounds",
            type: {
              array: [
                {
                  defined: "StakingRound",
                },
                32,
              ],
            },
          },
          {
            name: "registeredResolvedStakingRoundCount",
            type: "u8",
          },
          {
            name: "padding",
            type: {
              array: ["u8", 3],
            },
          },
          {
            name: "lmEmissionPotentiometerBps",
            type: "u16",
          },
          {
            name: "monthsElapsedSinceInception",
            type: "u16",
          },
          {
            name: "paddingUnsafe",
            type: {
              array: ["u8", 8],
            },
          },
          {
            name: "emissionAmountPerRoundLastUpdate",
            type: "i64",
          },
          {
            name: "currentMonthEmissionAmountPerRound",
            type: "u64",
          },
        ],
      },
    },
    {
      name: "userProfile",
      type: {
        kind: "struct",
        fields: [
          {
            name: "bump",
            type: "u8",
          },
          {
            name: "padding",
            type: {
              array: ["u8", 7],
            },
          },
          {
            name: "nickname",
            type: {
              defined: "LimitedString",
            },
          },
          {
            name: "createdAt",
            type: "i64",
          },
          {
            name: "owner",
            type: "publicKey",
          },
          {
            name: "swapCount",
            type: "u64",
          },
          {
            name: "swapVolumeUsd",
            type: "u64",
          },
          {
            name: "swapFeePaidUsd",
            type: "u64",
          },
          {
            name: "shortStats",
            type: {
              defined: "TradingStats",
            },
          },
          {
            name: "longStats",
            type: {
              defined: "TradingStats",
            },
          },
        ],
      },
    },
    {
      name: "userStaking",
      type: {
        kind: "struct",
        fields: [
          {
            name: "bump",
            type: "u8",
          },
          {
            name: "unusedUnsafe",
            type: {
              array: ["u8", 1],
            },
          },
          {
            name: "stakingType",
            type: "u8",
          },
          {
            name: "padding",
            type: {
              array: ["u8", 5],
            },
          },
          {
            name: "lockedStakeIdCounter",
            type: "u64",
          },
          {
            name: "liquidStake",
            type: {
              defined: "LiquidStake",
            },
          },
          {
            name: "lockedStakes",
            type: {
              array: [
                {
                  defined: "LockedStake",
                },
                32,
              ],
            },
          },
        ],
      },
    },
    {
      name: "vestRegistry",
      type: {
        kind: "struct",
        fields: [
          {
            name: "bump",
            type: "u8",
          },
          {
            name: "vests",
            type: {
              vec: "publicKey",
            },
          },
          {
            name: "vestingTokenAmount",
            type: "u64",
          },
          {
            name: "vestedTokenAmount",
            type: "u64",
          },
        ],
      },
    },
    {
      name: "vest",
      type: {
        kind: "struct",
        fields: [
          {
            name: "bump",
            type: "u8",
          },
          {
            name: "originBucket",
            type: "u8",
          },
          {
            name: "cancelled",
            type: "u8",
          },
          {
            name: "padding",
            type: {
              array: ["u8", 1],
            },
          },
          {
            name: "voteMultiplier",
            type: "u32",
          },
          {
            name: "amount",
            type: "u64",
          },
          {
            name: "unlockStartTimestamp",
            type: "i64",
          },
          {
            name: "unlockEndTimestamp",
            type: "i64",
          },
          {
            name: "claimedAmount",
            type: "u64",
          },
          {
            name: "lastClaimTimestamp",
            type: "i64",
          },
          {
            name: "owner",
            type: "publicKey",
          },
        ],
      },
    },
  ],
  types: [
    {
      name: "MintLmTokensFromBucketParams",
      type: {
        kind: "struct",
        fields: [
          {
            name: "bucketName",
            type: "u8",
          },
          {
            name: "amount",
            type: "u64",
          },
          {
            name: "reason",
            type: "string",
          },
        ],
      },
    },
    {
      name: "SetAdminParams",
      type: {
        kind: "struct",
        fields: [
          {
            name: "newAdmin",
            type: "publicKey",
          },
        ],
      },
    },
    {
      name: "AddCustodyParams",
      type: {
        kind: "struct",
        fields: [
          {
            name: "isStable",
            type: "bool",
          },
          {
            name: "pricing",
            type: {
              defined: "PricingParams",
            },
          },
          {
            name: "allowSwap",
            type: "bool",
          },
          {
            name: "allowTrade",
            type: "bool",
          },
          {
            name: "fees",
            type: {
              defined: "Fees",
            },
          },
          {
            name: "borrowRate",
            type: {
              defined: "BorrowRateParams",
            },
          },
          {
            name: "ratios",
            type: {
              array: [
                {
                  defined: "TokenRatios",
                },
                8,
              ],
            },
          },
        ],
      },
    },
    {
      name: "RemoveCustodyParams",
      type: {
        kind: "struct",
        fields: [
          {
            name: "ratios",
            type: {
              array: [
                {
                  defined: "TokenRatios",
                },
                8,
              ],
            },
          },
        ],
      },
    },
    {
      name: "SetCustodyAllowSwapParams",
      type: {
        kind: "struct",
        fields: [
          {
            name: "allowSwap",
            type: "bool",
          },
        ],
      },
    },
    {
      name: "SetCustodyAllowTradeParams",
      type: {
        kind: "struct",
        fields: [
          {
            name: "allowTrade",
            type: "bool",
          },
        ],
      },
    },
    {
      name: "SetCustodyConfigParams",
      type: {
        kind: "struct",
        fields: [
          {
            name: "isStable",
            type: "bool",
          },
          {
            name: "oracle",
            type: "publicKey",
          },
          {
            name: "tradeOracle",
            type: "publicKey",
          },
          {
            name: "pricing",
            type: {
              defined: "PricingParams",
            },
          },
          {
            name: "fees",
            type: {
              defined: "Fees",
            },
          },
          {
            name: "borrowRate",
            type: {
              defined: "BorrowRateParams",
            },
          },
          {
            name: "ratios",
            type: {
              array: [
                {
                  defined: "TokenRatios",
                },
                8,
              ],
            },
          },
        ],
      },
    },
    {
      name: "SetCustodyMaxCumulativeShortPositionSizeUsdParams",
      type: {
        kind: "struct",
        fields: [
          {
            name: "maxCumulativeShortPositionSizeUsd",
            type: "u64",
          },
        ],
      },
    },
    {
      name: "InitOneParams",
      type: {
        kind: "struct",
        fields: [
          {
            name: "coreContributorBucketAllocation",
            type: "u64",
          },
          {
            name: "foundationBucketAllocation",
            type: "u64",
          },
          {
            name: "ecosystemBucketAllocation",
            type: "u64",
          },
        ],
      },
    },
    {
      name: "AddPoolPartOneParams",
      type: {
        kind: "struct",
        fields: [
          {
            name: "name",
            type: "string",
          },
          {
            name: "aumSoftCapUsd",
            type: "u64",
          },
          {
            name: "lpTokenName",
            type: "string",
          },
          {
            name: "lpTokenSymbol",
            type: "string",
          },
          {
            name: "lpTokenUri",
            type: "string",
          },
        ],
      },
    },
    {
      name: "AddPoolPartTwoParams",
      type: {
        kind: "struct",
        fields: [
          {
            name: "genesisLockCampaignDuration",
            type: "i64",
          },
          {
            name: "genesisReservedGrantDuration",
            type: "i64",
          },
          {
            name: "genesisLockCampaignStartDate",
            type: "i64",
          },
          {
            name: "reservedSpots",
            type: {
              defined: "ReservedSpots",
            },
          },
        ],
      },
    },
    {
      name: "GenesisOtcInParams",
      type: {
        kind: "struct",
        fields: [
          {
            name: "custodyOneAmount",
            type: "u64",
          },
          {
            name: "custodyTwoAmount",
            type: "u64",
          },
          {
            name: "custodyThreeAmount",
            type: "u64",
          },
        ],
      },
    },
    {
      name: "SetPoolAllowSwapParams",
      type: {
        kind: "struct",
        fields: [
          {
            name: "allowSwap",
            type: "bool",
          },
        ],
      },
    },
    {
      name: "SetPoolAllowTradeParams",
      type: {
        kind: "struct",
        fields: [
          {
            name: "allowTrade",
            type: "bool",
          },
        ],
      },
    },
    {
      name: "SetPoolAumSoftCapUsdParams",
      type: {
        kind: "struct",
        fields: [
          {
            name: "aumSoftCapUsd",
            type: "u64",
          },
        ],
      },
    },
    {
      name: "SetPoolLiquidityStateParams",
      type: {
        kind: "struct",
        fields: [
          {
            name: "liquidityState",
            type: "u8",
          },
        ],
      },
    },
    {
      name: "InitStakingOneParams",
      type: {
        kind: "struct",
        fields: [
          {
            name: "stakingType",
            type: "u8",
          },
        ],
      },
    },
    {
      name: "SetStakingLmEmissionPotentiometersParams",
      type: {
        kind: "struct",
        fields: [
          {
            name: "lmEmissionPotentiometerBps",
            type: "u16",
          },
        ],
      },
    },
    {
      name: "AddVestParams",
      type: {
        kind: "struct",
        fields: [
          {
            name: "amount",
            type: "u64",
          },
          {
            name: "originBucket",
            type: "u8",
          },
          {
            name: "unlockStartTimestamp",
            type: "i64",
          },
          {
            name: "unlockEndTimestamp",
            type: "i64",
          },
          {
            name: "voteMultiplier",
            type: "u32",
          },
        ],
      },
    },
    {
      name: "AddGenesisLiquidityParams",
      type: {
        kind: "struct",
        fields: [
          {
            name: "amountIn",
            type: "u64",
          },
          {
            name: "minLpAmountOut",
            type: "u64",
          },
        ],
      },
    },
    {
      name: "AddLiquidityParams",
      type: {
        kind: "struct",
        fields: [
          {
            name: "amountIn",
            type: "u64",
          },
          {
            name: "minLpAmountOut",
            type: "u64",
          },
        ],
      },
    },
    {
      name: "RemoveLiquidityParams",
      type: {
        kind: "struct",
        fields: [
          {
            name: "lpAmountIn",
            type: "u64",
          },
          {
            name: "minAmountOut",
            type: "u64",
          },
        ],
      },
    },
    {
      name: "SwapParams",
      type: {
        kind: "struct",
        fields: [
          {
            name: "amountIn",
            type: "u64",
          },
          {
            name: "minAmountOut",
            type: "u64",
          },
        ],
      },
    },
    {
      name: "AddCollateralLongParams",
      type: {
        kind: "struct",
        fields: [
          {
            name: "collateral",
            type: "u64",
          },
        ],
      },
    },
    {
      name: "AddCollateralShortParams",
      type: {
        kind: "struct",
        fields: [
          {
            name: "collateral",
            type: "u64",
          },
        ],
      },
    },
    {
      name: "SetStopLossLongParams",
      type: {
        kind: "struct",
        fields: [
          {
            name: "stopLossLimitPrice",
            type: "u64",
          },
          {
            name: "closePositionPrice",
            type: {
              option: "u64",
            },
          },
        ],
      },
    },
    {
      name: "SetStopLossShortParams",
      type: {
        kind: "struct",
        fields: [
          {
            name: "stopLossLimitPrice",
            type: "u64",
          },
          {
            name: "closePositionPrice",
            type: {
              option: "u64",
            },
          },
        ],
      },
    },
    {
      name: "SetTakeProfitLongParams",
      type: {
        kind: "struct",
        fields: [
          {
            name: "takeProfitLimitPrice",
            type: "u64",
          },
        ],
      },
    },
    {
      name: "SetTakeProfitShortParams",
      type: {
        kind: "struct",
        fields: [
          {
            name: "takeProfitLimitPrice",
            type: "u64",
          },
        ],
      },
    },
    {
      name: "ClosePositionLongParams",
      type: {
        kind: "struct",
        fields: [
          {
            name: "price",
            type: {
              option: "u64",
            },
          },
        ],
      },
    },
    {
      name: "ClosePositionShortParams",
      type: {
        kind: "struct",
        fields: [
          {
            name: "price",
            type: {
              option: "u64",
            },
          },
        ],
      },
    },
    {
      name: "IncreasePositionLongParams",
      type: {
        kind: "struct",
        fields: [
          {
            name: "price",
            type: "u64",
          },
          {
            name: "collateral",
            type: "u64",
          },
          {
            name: "leverage",
            type: "u32",
          },
        ],
      },
    },
    {
      name: "IncreasePositionShortParams",
      type: {
        kind: "struct",
        fields: [
          {
            name: "price",
            type: "u64",
          },
          {
            name: "collateral",
            type: "u64",
          },
          {
            name: "leverage",
            type: "u32",
          },
        ],
      },
    },
    {
      name: "LiquidateLongParams",
      type: {
        kind: "struct",
        fields: [],
      },
    },
    {
      name: "LiquidateShortParams",
      type: {
        kind: "struct",
        fields: [],
      },
    },
    {
      name: "OpenPositionWithSwapParams",
      type: {
        kind: "struct",
        fields: [
          {
            name: "price",
            type: "u64",
          },
          {
            name: "collateral",
            type: "u64",
          },
          {
            name: "leverage",
            type: "u32",
          },
          {
            name: "referrer",
            type: {
              option: "publicKey",
            },
          },
        ],
      },
    },
    {
      name: "OpenPositionLongParams",
      type: {
        kind: "struct",
        fields: [
          {
            name: "price",
            type: "u64",
          },
          {
            name: "collateral",
            type: "u64",
          },
          {
            name: "leverage",
            type: "u32",
          },
          {
            name: "referrer",
            type: {
              option: "publicKey",
            },
          },
        ],
      },
    },
    {
      name: "OpenPositionShortParams",
      type: {
        kind: "struct",
        fields: [
          {
            name: "price",
            type: "u64",
          },
          {
            name: "collateral",
            type: "u64",
          },
          {
            name: "leverage",
            type: "u32",
          },
          {
            name: "referrer",
            type: {
              option: "publicKey",
            },
          },
        ],
      },
    },
    {
      name: "RemoveCollateralLongParams",
      type: {
        kind: "struct",
        fields: [
          {
            name: "collateralUsd",
            type: "u64",
          },
        ],
      },
    },
    {
      name: "RemoveCollateralShortParams",
      type: {
        kind: "struct",
        fields: [
          {
            name: "collateralUsd",
            type: "u64",
          },
        ],
      },
    },
    {
      name: "AddLiquidStakeParams",
      type: {
        kind: "struct",
        fields: [
          {
            name: "amount",
            type: "u64",
          },
        ],
      },
    },
    {
      name: "AddLockedStakeParams",
      type: {
        kind: "struct",
        fields: [
          {
            name: "amount",
            type: "u64",
          },
          {
            name: "lockedDays",
            type: "u32",
          },
        ],
      },
    },
    {
      name: "ClaimStakesParams",
      type: {
        kind: "struct",
        fields: [
          {
            name: "lockedStakeIndexes",
            type: {
              option: "bytes",
            },
          },
        ],
      },
    },
    {
      name: "FinalizeLockedStakeParams",
      type: {
        kind: "struct",
        fields: [
          {
            name: "lockedStakeId",
            type: "u64",
          },
          {
            name: "earlyExit",
            type: "bool",
          },
        ],
      },
    },
    {
      name: "RemoveLiquidStakeParams",
      type: {
        kind: "struct",
        fields: [
          {
            name: "amount",
            type: "u64",
          },
        ],
      },
    },
    {
      name: "RemoveLockedStakeParams",
      type: {
        kind: "struct",
        fields: [
          {
            name: "lockedStakeIndex",
            type: "u64",
          },
        ],
      },
    },
    {
      name: "UpgradeLockedStakeParams",
      type: {
        kind: "struct",
        fields: [
          {
            name: "lockedStakeId",
            type: "u64",
          },
          {
            name: "amount",
            type: {
              option: "u64",
            },
          },
          {
            name: "lockedDays",
            type: {
              option: "u32",
            },
          },
        ],
      },
    },
    {
      name: "EditUserProfileParams",
      type: {
        kind: "struct",
        fields: [
          {
            name: "nickname",
            type: "string",
          },
        ],
      },
    },
    {
      name: "InitUserProfileParams",
      type: {
        kind: "struct",
        fields: [
          {
            name: "nickname",
            type: "string",
          },
        ],
      },
    },
    {
      name: "GetAddLiquidityAmountAndFeeParams",
      type: {
        kind: "struct",
        fields: [
          {
            name: "amountIn",
            type: "u64",
          },
        ],
      },
    },
    {
      name: "GetEntryPriceAndFeeParams",
      type: {
        kind: "struct",
        fields: [
          {
            name: "collateral",
            type: "u64",
          },
          {
            name: "leverage",
            type: "u32",
          },
          {
            name: "side",
            type: "u8",
          },
        ],
      },
    },
    {
      name: "GetLiquidationPriceParams",
      type: {
        kind: "struct",
        fields: [
          {
            name: "addCollateral",
            type: "u64",
          },
          {
            name: "removeCollateral",
            type: "u64",
          },
        ],
      },
    },
    {
      name: "GetOpenPositionWithSwapAmountAndFeesParams",
      type: {
        kind: "struct",
        fields: [
          {
            name: "collateralAmount",
            type: "u64",
          },
          {
            name: "leverage",
            type: "u32",
          },
          {
            name: "side",
            type: "u8",
          },
        ],
      },
    },
    {
      name: "CustodyInfoSnapshot",
      type: {
        kind: "struct",
        fields: [
          {
            name: "assetsValueUsd",
            type: "u64",
          },
          {
            name: "owned",
            type: "u64",
          },
          {
            name: "locked",
            type: "u64",
          },
          {
            name: "price",
            type: "u64",
          },
          {
            name: "priceConfidence",
            type: "u64",
          },
          {
            name: "tradePrice",
            type: "u64",
          },
          {
            name: "tradePriceConfidence",
            type: "u64",
          },
          {
            name: "shortPnl",
            type: "i64",
          },
          {
            name: "longPnl",
            type: "i64",
          },
          {
            name: "openInterestLongUsd",
            type: "u64",
          },
          {
            name: "openInterestShortUsd",
            type: "u64",
          },
          {
            name: "cumulativeProfitUsd",
            type: "u64",
          },
          {
            name: "cumulativeLossUsd",
            type: "u64",
          },
          {
            name: "cumulativeSwapFeeUsd",
            type: "u64",
          },
          {
            name: "cumulativeLiquidityFeeUsd",
            type: "u64",
          },
          {
            name: "cumulativeClosePositionFeeUsd",
            type: "u64",
          },
          {
            name: "cumulativeLiquidationFeeUsd",
            type: "u64",
          },
          {
            name: "cumulativeBorrowFeeUsd",
            type: "u64",
          },
          {
            name: "cumulativeTradingVolumeUsd",
            type: "u64",
          },
        ],
      },
    },
    {
      name: "PoolInfoSnapshot",
      type: {
        kind: "struct",
        fields: [
          {
            name: "currentTime",
            type: "u64",
          },
          {
            name: "aumUsd",
            type: "u64",
          },
          {
            name: "lpTokenPrice",
            type: "u64",
          },
          {
            name: "custodiesInfoSnapshot",
            type: {
              vec: {
                defined: "CustodyInfoSnapshot",
              },
            },
          },
          {
            name: "lpCirculatingSupply",
            type: "u64",
          },
        ],
      },
    },
    {
      name: "GetRemoveLiquidityAmountAndFeeParams",
      type: {
        kind: "struct",
        fields: [
          {
            name: "lpAmountIn",
            type: "u64",
          },
        ],
      },
    },
    {
      name: "GetSwapAmountAndFeesParams",
      type: {
        kind: "struct",
        fields: [
          {
            name: "amountIn",
            type: "u64",
          },
        ],
      },
    },
    {
      name: "ExitPriceAndFee",
      type: {
        kind: "struct",
        fields: [
          {
            name: "price",
            type: "u64",
          },
          {
            name: "fee",
            type: "u64",
          },
          {
            name: "amountOut",
            type: "u64",
          },
          {
            name: "profitUsd",
            type: "u64",
          },
          {
            name: "lossUsd",
            type: "u64",
          },
        ],
      },
    },
    {
      name: "AmountAndFee",
      type: {
        kind: "struct",
        fields: [
          {
            name: "amount",
            type: "u64",
          },
          {
            name: "fee",
            type: "u64",
          },
        ],
      },
    },
    {
      name: "NewPositionPricesAndFee",
      type: {
        kind: "struct",
        fields: [
          {
            name: "entryPrice",
            type: "u64",
          },
          {
            name: "liquidationPrice",
            type: "u64",
          },
          {
            name: "exitFee",
            type: "u64",
          },
          {
            name: "liquidationFee",
            type: "u64",
          },
          {
            name: "size",
            type: "u64",
          },
        ],
      },
    },
    {
      name: "OpenPositionWithSwapAmountAndFees",
      type: {
        kind: "struct",
        fields: [
          {
            name: "entryPrice",
            type: "u64",
          },
          {
            name: "liquidationPrice",
            type: "u64",
          },
          {
            name: "swapFeeIn",
            type: "u64",
          },
          {
            name: "swapFeeOut",
            type: "u64",
          },
          {
            name: "exitFee",
            type: "u64",
          },
          {
            name: "liquidationFee",
            type: "u64",
          },
          {
            name: "size",
            type: "u64",
          },
        ],
      },
    },
    {
      name: "SwapAmountAndFees",
      type: {
        kind: "struct",
        fields: [
          {
            name: "amountOut",
            type: "u64",
          },
          {
            name: "feeIn",
            type: "u64",
          },
          {
            name: "feeOut",
            type: "u64",
          },
        ],
      },
    },
    {
      name: "ProfitAndLoss",
      docs: [
        "Specific to the codebase, this struct is used to store the profit and loss of a position.",
      ],
      type: {
        kind: "struct",
        fields: [
          {
            name: "profitUsd",
            type: "u64",
          },
          {
            name: "lossUsd",
            type: "u64",
          },
          {
            name: "exitFee",
            type: "u64",
          },
          {
            name: "exitFeeUsd",
            type: "u64",
          },
          {
            name: "borrowFeeUsd",
            type: "u64",
          },
        ],
      },
    },
    {
      name: "Fees",
      type: {
        kind: "struct",
        fields: [
          {
            name: "swapIn",
            type: "u16",
          },
          {
            name: "swapOut",
            type: "u16",
          },
          {
            name: "stableSwapIn",
            type: "u16",
          },
          {
            name: "stableSwapOut",
            type: "u16",
          },
          {
            name: "addLiquidity",
            type: "u16",
          },
          {
            name: "removeLiquidity",
            type: "u16",
          },
          {
            name: "closePosition",
            type: "u16",
          },
          {
            name: "liquidation",
            type: "u16",
          },
          {
            name: "feeMax",
            type: "u16",
          },
          {
            name: "padding",
            type: {
              array: ["u8", 6],
            },
          },
          {
            name: "padding2",
            type: "u64",
          },
        ],
      },
    },
    {
      name: "FeesStats",
      type: {
        kind: "struct",
        fields: [
          {
            name: "swapUsd",
            type: "u64",
          },
          {
            name: "addLiquidityUsd",
            type: "u64",
          },
          {
            name: "removeLiquidityUsd",
            type: "u64",
          },
          {
            name: "closePositionUsd",
            type: "u64",
          },
          {
            name: "liquidationUsd",
            type: "u64",
          },
          {
            name: "borrowUsd",
            type: "u64",
          },
        ],
      },
    },
    {
      name: "VolumeStats",
      type: {
        kind: "struct",
        fields: [
          {
            name: "swapUsd",
            type: "u64",
          },
          {
            name: "addLiquidityUsd",
            type: "u64",
          },
          {
            name: "removeLiquidityUsd",
            type: "u64",
          },
          {
            name: "openPositionUsd",
            type: "u64",
          },
          {
            name: "closePositionUsd",
            type: "u64",
          },
          {
            name: "liquidationUsd",
            type: "u64",
          },
        ],
      },
    },
    {
      name: "TradeStats",
      type: {
        kind: "struct",
        fields: [
          {
            name: "profitUsd",
            type: "u64",
          },
          {
            name: "lossUsd",
            type: "u64",
          },
          {
            name: "oiLongUsd",
            type: "u64",
          },
          {
            name: "oiShortUsd",
            type: "u64",
          },
        ],
      },
    },
    {
      name: "Assets",
      type: {
        kind: "struct",
        fields: [
          {
            name: "collateral",
            type: "u64",
          },
          {
            name: "owned",
            type: "u64",
          },
          {
            name: "locked",
            type: "u64",
          },
        ],
      },
    },
    {
      name: "PricingParams",
      type: {
        kind: "struct",
        fields: [
          {
            name: "maxInitialLeverage",
            type: "u32",
          },
          {
            name: "maxLeverage",
            type: "u32",
          },
          {
            name: "maxPositionLockedUsd",
            type: "u64",
          },
          {
            name: "maxCumulativeShortPositionSizeUsd",
            type: "u64",
          },
        ],
      },
    },
    {
      name: "BorrowRateParams",
      type: {
        kind: "struct",
        fields: [
          {
            name: "maxHourlyBorrowInterestRate",
            type: "u64",
          },
        ],
      },
    },
    {
      name: "BorrowRateState",
      type: {
        kind: "struct",
        fields: [
          {
            name: "currentRate",
            type: "u64",
          },
          {
            name: "lastUpdate",
            type: "i64",
          },
          {
            name: "cumulativeInterest",
            type: {
              defined: "U128Split",
            },
          },
        ],
      },
    },
    {
      name: "PositionsAccounting",
      type: {
        kind: "struct",
        fields: [
          {
            name: "openPositions",
            type: "u64",
          },
          {
            name: "sizeUsd",
            type: "u64",
          },
          {
            name: "borrowSizeUsd",
            type: "u64",
          },
          {
            name: "lockedAmount",
            type: "u64",
          },
          {
            name: "weightedPrice",
            type: {
              defined: "U128Split",
            },
          },
          {
            name: "totalQuantity",
            type: {
              defined: "U128Split",
            },
          },
          {
            name: "cumulativeInterestUsd",
            type: "u64",
          },
          {
            name: "padding",
            type: {
              array: ["u8", 8],
            },
          },
          {
            name: "cumulativeInterestSnapshot",
            type: {
              defined: "U128Split",
            },
          },
          {
            name: "exitFeeUsd",
            type: "u64",
          },
          {
            name: "stableLockedAmount",
            type: {
              array: [
                {
                  defined: "StableLockedAmountStat",
                },
                2,
              ],
            },
          },
        ],
      },
    },
    {
      name: "StableLockedAmountStat",
      type: {
        kind: "struct",
        fields: [
          {
            name: "custody",
            type: "publicKey",
          },
          {
            name: "lockedAmount",
            type: "u64",
          },
          {
            name: "padding",
            type: {
              array: ["u8", 8],
            },
          },
        ],
      },
    },
    {
      name: "OraclePrice",
      type: {
        kind: "struct",
        fields: [
          {
            name: "price",
            type: "u64",
          },
          {
            name: "exponent",
            type: "i32",
          },
          {
            name: "confidence",
            type: "u64",
          },
        ],
      },
    },
    {
      name: "TokenRatios",
      type: {
        kind: "struct",
        fields: [
          {
            name: "target",
            type: "u16",
          },
          {
            name: "min",
            type: "u16",
          },
          {
            name: "max",
            type: "u16",
          },
          {
            name: "padding",
            type: {
              array: ["u8", 2],
            },
          },
        ],
      },
    },
    {
      name: "StakingRound",
      type: {
        kind: "struct",
        fields: [
          {
            name: "startTime",
            type: "i64",
          },
          {
            name: "endTime",
            type: "i64",
          },
          {
            name: "rate",
            type: "u64",
          },
          {
            name: "totalStake",
            type: "u64",
          },
          {
            name: "totalClaim",
            type: "u64",
          },
          {
            name: "lmRate",
            type: "u64",
          },
          {
            name: "lmTotalStake",
            type: "u64",
          },
          {
            name: "lmTotalClaim",
            type: "u64",
          },
        ],
      },
    },
    {
      name: "TradingStats",
      type: {
        kind: "struct",
        fields: [
          {
            name: "openedPositionCount",
            type: "u64",
          },
          {
            name: "liquidatedPositionCount",
            type: "u64",
          },
          {
            name: "openingAverageLeverage",
            type: "u64",
          },
          {
            name: "openingSizeUsd",
            type: "u64",
          },
          {
            name: "profitsUsd",
            type: "u64",
          },
          {
            name: "lossesUsd",
            type: "u64",
          },
          {
            name: "feePaidUsd",
            type: "u64",
          },
        ],
      },
    },
    {
      name: "LiquidStake",
      type: {
        kind: "struct",
        fields: [
          {
            name: "amount",
            type: "u64",
          },
          {
            name: "stakeTime",
            type: "i64",
          },
          {
            name: "claimTime",
            type: "i64",
          },
          {
            name: "overlapTime",
            type: "i64",
          },
          {
            name: "overlapAmount",
            type: "u64",
          },
        ],
      },
    },
    {
      name: "LockedStake",
      type: {
        kind: "struct",
        fields: [
          {
            name: "amount",
            type: "u64",
          },
          {
            name: "stakeTime",
            type: "i64",
          },
          {
            name: "claimTime",
            type: "i64",
          },
          {
            name: "endTime",
            type: "i64",
          },
          {
            name: "lockDuration",
            type: "u64",
          },
          {
            name: "rewardMultiplier",
            type: "u32",
          },
          {
            name: "lmRewardMultiplier",
            type: "u32",
          },
          {
            name: "voteMultiplier",
            type: "u32",
          },
          {
            name: "qualifiedForRewardsInResolvedRoundCount",
            type: "u32",
          },
          {
            name: "amountWithRewardMultiplier",
            type: "u64",
          },
          {
            name: "amountWithLmRewardMultiplier",
            type: "u64",
          },
          {
            name: "resolved",
            type: "u8",
          },
          {
            name: "padding2",
            type: {
              array: ["u8", 7],
            },
          },
          {
            name: "id",
            type: "u64",
          },
          {
            name: "earlyExit",
            type: "u8",
          },
          {
            name: "padding3",
            type: {
              array: ["u8", 7],
            },
          },
          {
            name: "earlyExitFee",
            type: "u64",
          },
          {
            name: "isGenesis",
            type: "u8",
          },
          {
            name: "padding4",
            type: {
              array: ["u8", 7],
            },
          },
          {
            name: "genesisClaimTime",
            type: "i64",
          },
        ],
      },
    },
    {
      name: "LimitedString",
      type: {
        kind: "struct",
        fields: [
          {
            name: "value",
            type: {
              array: ["u8", 31],
            },
          },
          {
            name: "length",
            type: "u8",
          },
        ],
      },
    },
    {
      name: "U128Split",
      type: {
        kind: "struct",
        fields: [
          {
            name: "high",
            type: "u64",
          },
          {
            name: "low",
            type: "u64",
          },
        ],
      },
    },
    {
      name: "BucketName",
      type: {
        kind: "enum",
        variants: [
          {
            name: "CoreContributor",
          },
          {
            name: "Foundation",
          },
          {
            name: "Ecosystem",
          },
        ],
      },
    },
    {
      name: "ReservedSpots",
      type: {
        kind: "enum",
        variants: [
          {
            name: "None",
          },
          {
            name: "Test",
            fields: [
              {
                name: "firstReservedSpot",
                type: "publicKey",
              },
              {
                name: "secondReservedSpot",
                type: "publicKey",
              },
            ],
          },
        ],
      },
    },
    {
      name: "CortexInitializationStep",
      type: {
        kind: "enum",
        variants: [
          {
            name: "NotCreated",
          },
          {
            name: "Step1",
          },
          {
            name: "Step2",
          },
          {
            name: "Step3",
          },
          {
            name: "Initialized",
          },
        ],
      },
    },
    {
      name: "PoolLiquidityState",
      type: {
        kind: "enum",
        variants: [
          {
            name: "GenesisLiquidity",
          },
          {
            name: "Idle",
          },
          {
            name: "Active",
          },
        ],
      },
    },
    {
      name: "LeverageCheckType",
      type: {
        kind: "enum",
        variants: [
          {
            name: "Initial",
          },
          {
            name: "AddCollateral",
          },
          {
            name: "RemoveCollateral",
          },
          {
            name: "IncreasePosition",
          },
          {
            name: "Liquidate",
          },
        ],
      },
    },
    {
      name: "Side",
      type: {
        kind: "enum",
        variants: [
          {
            name: "None",
          },
          {
            name: "Long",
          },
          {
            name: "Short",
          },
        ],
      },
    },
    {
      name: "StakingType",
      type: {
        kind: "enum",
        variants: [
          {
            name: "LM",
          },
          {
            name: "LP",
          },
        ],
      },
    },
    {
      name: "StakingInitializationStep",
      type: {
        kind: "enum",
        variants: [
          {
            name: "NotCreated",
          },
          {
            name: "Step1",
          },
          {
            name: "Step2",
          },
          {
            name: "Step3",
          },
          {
            name: "Initialized",
          },
        ],
      },
    },
  ],
  events: [
    {
      name: "OpenPositionEvent",
      fields: [
        {
          name: "owner",
          type: "publicKey",
          index: false,
        },
        {
          name: "position",
          type: "publicKey",
          index: false,
        },
        {
          name: "custodyMint",
          type: "publicKey",
          index: false,
        },
        {
          name: "side",
          type: "u8",
          index: false,
        },
        {
          name: "sizeUsd",
          type: "u64",
          index: false,
        },
        {
          name: "price",
          type: "u64",
          index: false,
        },
        {
          name: "collateralAmountUsd",
          type: "u64",
          index: false,
        },
        {
          name: "leverage",
          type: "u32",
          index: false,
        },
        {
          name: "positionId",
          type: "u64",
          index: false,
        },
      ],
    },
    {
      name: "IncreasePositionEvent",
      fields: [
        {
          name: "owner",
          type: "publicKey",
          index: false,
        },
        {
          name: "position",
          type: "publicKey",
          index: false,
        },
        {
          name: "custodyMint",
          type: "publicKey",
          index: false,
        },
        {
          name: "side",
          type: "u8",
          index: false,
        },
        {
          name: "sizeUsd",
          type: "u64",
          index: false,
        },
        {
          name: "price",
          type: "u64",
          index: false,
        },
        {
          name: "collateralAmountUsd",
          type: "u64",
          index: false,
        },
        {
          name: "leverage",
          type: "u32",
          index: false,
        },
        {
          name: "positionId",
          type: "u64",
          index: false,
        },
      ],
    },
    {
      name: "ClosePositionEvent",
      fields: [
        {
          name: "owner",
          type: "publicKey",
          index: false,
        },
        {
          name: "position",
          type: "publicKey",
          index: false,
        },
        {
          name: "custodyMint",
          type: "publicKey",
          index: false,
        },
        {
          name: "side",
          type: "u8",
          index: false,
        },
        {
          name: "sizeUsd",
          type: "u64",
          index: false,
        },
        {
          name: "price",
          type: "u64",
          index: false,
        },
        {
          name: "collateralAmountUsd",
          type: "u64",
          index: false,
        },
        {
          name: "profitUsd",
          type: "u64",
          index: false,
        },
        {
          name: "lossUsd",
          type: "u64",
          index: false,
        },
        {
          name: "borrowFeeUsd",
          type: "u64",
          index: false,
        },
        {
          name: "exitFeeUsd",
          type: "u64",
          index: false,
        },
        {
          name: "positionId",
          type: "u64",
          index: false,
        },
      ],
    },
    {
      name: "AddCollateralEvent",
      fields: [
        {
          name: "owner",
          type: "publicKey",
          index: false,
        },
        {
          name: "position",
          type: "publicKey",
          index: false,
        },
        {
          name: "custodyMint",
          type: "publicKey",
          index: false,
        },
        {
          name: "side",
          type: "u8",
          index: false,
        },
        {
          name: "addAmountUsd",
          type: "u64",
          index: false,
        },
        {
          name: "newCollateralAmountUsd",
          type: "u64",
          index: false,
        },
        {
          name: "leverage",
          type: "u32",
          index: false,
        },
        {
          name: "positionId",
          type: "u64",
          index: false,
        },
      ],
    },
    {
      name: "RemoveCollateralEvent",
      fields: [
        {
          name: "owner",
          type: "publicKey",
          index: false,
        },
        {
          name: "position",
          type: "publicKey",
          index: false,
        },
        {
          name: "custodyMint",
          type: "publicKey",
          index: false,
        },
        {
          name: "side",
          type: "u8",
          index: false,
        },
        {
          name: "removeAmountUsd",
          type: "u64",
          index: false,
        },
        {
          name: "newCollateralAmountUsd",
          type: "u64",
          index: false,
        },
        {
          name: "leverage",
          type: "u32",
          index: false,
        },
        {
          name: "positionId",
          type: "u64",
          index: false,
        },
      ],
    },
    {
      name: "LiquidateEvent",
      fields: [
        {
          name: "owner",
          type: "publicKey",
          index: false,
        },
        {
          name: "position",
          type: "publicKey",
          index: false,
        },
        {
          name: "custodyMint",
          type: "publicKey",
          index: false,
        },
        {
          name: "side",
          type: "u8",
          index: false,
        },
        {
          name: "sizeUsd",
          type: "u64",
          index: false,
        },
        {
          name: "price",
          type: "u64",
          index: false,
        },
        {
          name: "collateralAmountUsd",
          type: "u64",
          index: false,
        },
        {
          name: "lossUsd",
          type: "u64",
          index: false,
        },
        {
          name: "borrowFeeUsd",
          type: "u64",
          index: false,
        },
        {
          name: "exitFeeUsd",
          type: "u64",
          index: false,
        },
        {
          name: "positionId",
          type: "u64",
          index: false,
        },
      ],
    },
    {
      name: "AddLockedStakeEvent",
      fields: [
        {
          name: "owner",
          type: "publicKey",
          index: false,
        },
        {
          name: "staking",
          type: "publicKey",
          index: false,
        },
        {
          name: "lockedStakeId",
          type: "u64",
          index: false,
        },
        {
          name: "amount",
          type: "u64",
          index: false,
        },
        {
          name: "lockedDays",
          type: "u32",
          index: false,
        },
      ],
    },
    {
      name: "UpgradeLockedStakeEvent",
      fields: [
        {
          name: "owner",
          type: "publicKey",
          index: false,
        },
        {
          name: "staking",
          type: "publicKey",
          index: false,
        },
        {
          name: "lockedStakeId",
          type: "u64",
          index: false,
        },
        {
          name: "amount",
          type: {
            option: "u64",
          },
          index: false,
        },
        {
          name: "lockedDays",
          type: {
            option: "u32",
          },
          index: false,
        },
      ],
    },
    {
      name: "FinalizeLockedStakeEvent",
      fields: [
        {
          name: "owner",
          type: "publicKey",
          index: false,
        },
        {
          name: "staking",
          type: "publicKey",
          index: false,
        },
        {
          name: "lockedStakeId",
          type: "u64",
          index: false,
        },
        {
          name: "earlyExit",
          type: "bool",
          index: false,
        },
      ],
    },
    {
      name: "RemoveLockedStakeEvent",
      fields: [
        {
          name: "owner",
          type: "publicKey",
          index: false,
        },
        {
          name: "staking",
          type: "publicKey",
          index: false,
        },
        {
          name: "lockedStakeId",
          type: "u64",
          index: false,
        },
      ],
    },
    {
      name: "SetStopLossEvent",
      fields: [
        {
          name: "positionId",
          type: "u64",
          index: false,
        },
        {
          name: "stopLossLimitPrice",
          type: "u64",
          index: false,
        },
        {
          name: "closePositionPrice",
          type: {
            option: "u64",
          },
          index: false,
        },
        {
          name: "positionSide",
          type: "u8",
          index: false,
        },
      ],
    },
    {
      name: "SetTakeProfitEvent",
      fields: [
        {
          name: "positionId",
          type: "u64",
          index: false,
        },
        {
          name: "takeProfitLimitPrice",
          type: "u64",
          index: false,
        },
        {
          name: "positionSide",
          type: "u8",
          index: false,
        },
      ],
    },
    {
      name: "CancelStopLossEvent",
      fields: [
        {
          name: "positionId",
          type: "u64",
          index: false,
        },
        {
          name: "positionSide",
          type: "u8",
          index: false,
        },
      ],
    },
    {
      name: "CancelTakeProfitEvent",
      fields: [
        {
          name: "positionId",
          type: "u64",
          index: false,
        },
        {
          name: "positionSide",
          type: "u8",
          index: false,
        },
      ],
    },
  ],
  errors: [
    {
      code: 6000,
      name: "MathOverflow",
      msg: "Overflow in arithmetic operation",
    },
    {
      code: 6001,
      name: "UnsupportedOracle",
      msg: "Unsupported price oracle",
    },
    {
      code: 6002,
      name: "InvalidOracleAccount",
      msg: "Invalid oracle account",
    },
    {
      code: 6003,
      name: "InvalidOracleState",
      msg: "Invalid oracle state",
    },
    {
      code: 6004,
      name: "StaleOraclePrice",
      msg: "Stale oracle price",
    },
    {
      code: 6005,
      name: "InvalidOraclePrice",
      msg: "Invalid oracle price",
    },
    {
      code: 6006,
      name: "InvalidEnvironment",
      msg: "Instruction is not allowed in production",
    },
    {
      code: 6007,
      name: "InvalidPoolLiquidityState",
      msg: "Invalid pool liquidity state",
    },
    {
      code: 6008,
      name: "InvalidCortexState",
      msg: "Invalid cortex state",
    },
    {
      code: 6009,
      name: "InvalidStakingState",
      msg: "Invalid staking state",
    },
    {
      code: 6010,
      name: "InvalidPoolState",
      msg: "Invalid pool state",
    },
    {
      code: 6011,
      name: "InvalidVestState",
      msg: "Invalid vest state",
    },
    {
      code: 6012,
      name: "InvalidStakeState",
      msg: "Invalid stake state",
    },
    {
      code: 6013,
      name: "InvalidCustody",
      msg: "Invalid custody",
    },
    {
      code: 6014,
      name: "InvalidCustodyAccount",
      msg: "Invalid custody account",
    },
    {
      code: 6015,
      name: "InvalidCustodyState",
      msg: "Invalid custody state",
    },
    {
      code: 6016,
      name: "InvalidCollateralCustody",
      msg: "Invalid collateral custody",
    },
    {
      code: 6017,
      name: "InvalidPositionState",
      msg: "Invalid position state",
    },
    {
      code: 6018,
      name: "PositionNotInLiquidationRange",
      msg: "The position is not in liquidation range",
    },
    {
      code: 6019,
      name: "InvalidStakingRoundState",
      msg: "Invalid staking round state",
    },
    {
      code: 6020,
      name: "InvalidAdrenaConfig",
      msg: "Invalid adrena config",
    },
    {
      code: 6021,
      name: "InvalidPoolConfig",
      msg: "Invalid pool config",
    },
    {
      code: 6022,
      name: "InvalidCustodyConfig",
      msg: "Invalid custody config",
    },
    {
      code: 6023,
      name: "InsufficientAmountReturned",
      msg: "Insufficient token amount returned",
    },
    {
      code: 6024,
      name: "MaxPriceSlippage",
      msg: "Price slippage limit exceeded",
    },
    {
      code: 6025,
      name: "MaxLeverage",
      msg: "Position leverage limit exceeded",
    },
    {
      code: 6026,
      name: "MinLeverage",
      msg: "Position leverage under minimum",
    },
    {
      code: 6027,
      name: "CustodyAmountLimit",
      msg: "Custody amount limit exceeded",
    },
    {
      code: 6028,
      name: "PositionAmountLimit",
      msg: "Position amount limit exceeded",
    },
    {
      code: 6029,
      name: "TokenRatioOutOfRange",
      msg: "Token ratio out of range",
    },
    {
      code: 6030,
      name: "UnsupportedToken",
      msg: "Token is not supported",
    },
    {
      code: 6031,
      name: "InstructionNotAllowed",
      msg: "Instruction is not allowed at this time",
    },
    {
      code: 6032,
      name: "MaxUtilization",
      msg: "Token utilization limit exceeded",
    },
    {
      code: 6033,
      name: "MaxRegisteredResolvedStakingRoundReached",
      msg: "Max registered resolved staking round reached",
    },
    {
      code: 6034,
      name: "InvalidGovernanceProgram",
      msg: "Governance program do not match Cortex's one",
    },
    {
      code: 6035,
      name: "InvalidGovernanceRealm",
      msg: "Governance realm do not match Cortex's one",
    },
    {
      code: 6036,
      name: "InvalidVestingUnlockTime",
      msg: "Vesting unlock time is too close or passed",
    },
    {
      code: 6037,
      name: "InvalidStakingLockingTime",
      msg: "Invalid staking locking time",
    },
    {
      code: 6038,
      name: "UserStakeNotFound",
      msg: "The user stake account specified could not be found",
    },
    {
      code: 6039,
      name: "InvalidAccountData",
      msg: "Invalid account data",
    },
    {
      code: 6040,
      name: "UnresolvedStake",
      msg: "Stake is not resolved",
    },
    {
      code: 6041,
      name: "BucketMintLimit",
      msg: "Reached bucket mint limit",
    },
    {
      code: 6042,
      name: "GenesisAlpLimitReached",
      msg: "Genesis ALP add liquidity limit reached",
    },
    {
      code: 6043,
      name: "PermissionlessOracleMissingSignature",
      msg: "Permissionless oracle update must be preceded by Ed25519 signature verification instruction",
    },
    {
      code: 6044,
      name: "PermissionlessOracleMalformedEd25519Data",
      msg: "Ed25519 signature verification data does not match expected format",
    },
    {
      code: 6045,
      name: "PermissionlessOracleSignerMismatch",
      msg: "Ed25519 signature was not signed by the oracle authority",
    },
    {
      code: 6046,
      name: "PermissionlessOracleMessageMismatch",
      msg: "Signed message does not match instruction params",
    },
    {
      code: 6047,
      name: "CustodyStableLockedAmountNotFound",
      msg: "Cannot find custody stable locked amount",
    },
    {
      code: 6048,
      name: "CustodyNotFound",
      msg: "Cannot find custody",
    },
    {
      code: 6049,
      name: "InsufficientBucketReserve",
      msg: "The bucket does not contain enough token for reserving this allocation",
    },
    {
      code: 6050,
      name: "UserNicknameTooLong",
      msg: "User nickname exceed 24 characters",
    },
    {
      code: 6051,
      name: "UserNicknameTooShort",
      msg: "User nickname is less than 3 characters",
    },
    {
      code: 6052,
      name: "InvalidGenesisLockState",
      msg: "Invalid genesis lock state",
    },
    {
      code: 6053,
      name: "GenesisLockCampaignFullySubscribed",
      msg: "The campaign is fully subscribed",
    },
    {
      code: 6054,
      name: "PoolAumSoftCapUsdReached",
      msg: "The pool is fully subscribed",
    },
    {
      code: 6055,
      name: "MaxRegisteredPool",
      msg: "The number of registered pool reached max amount",
    },
    {
      code: 6056,
      name: "MaxRegisteredCustodies",
      msg: "The number of registered custody reached max amount",
    },
    {
      code: 6057,
      name: "MaxCumulativeShortPositionSizeLimit",
      msg: "The short limit for this asset has been reached",
    },
    {
      code: 6058,
      name: "LockedStakeArrayFull",
      msg: "The max number of LockedStaking has been reached",
    },
    {
      code: 6059,
      name: "IndexOutOfBounds",
      msg: "Requested index is out of bounds",
    },
    {
      code: 6060,
      name: "InvalidCaller",
      msg: "The instruction must be call with a specific account as caller",
    },
    {
      code: 6061,
      name: "InvalidBucketName",
      msg: "Invalid bucket name",
    },
    {
      code: 6062,
      name: "InvalidThreadId",
      msg: "(deprecated)The provided Sablier thread does not have the expected ID",
    },
    {
      code: 6063,
      name: "PythPriceExponentTooLargeIncurringPrecisionLoss",
      msg: "The exponent used for pyth price lead to high precision loss",
    },
    {
      code: 6064,
      name: "MissingClosePositionPrice",
      msg: "The close position price is mandatory",
    },
    {
      code: 6065,
      name: "InvalidVoteMultiplier",
      msg: "Invalid vote multiplier",
    },
    {
      code: 6066,
      name: "PositionTooYoung",
      msg: "A position cannot be close right after open, a slight delay is enforced",
    },
    {
      code: 6067,
      name: "InsufficientCollateral",
      msg: "The minimum amount of collateral posted to open a position is not met",
    },
    {
      code: 6068,
      name: "InvalidLockDuration",
      msg: "The provided lock duration isn't valid",
    },
    {
      code: 6069,
      name: "StakeNotEstablished",
      msg: "The stake isn't established yet",
    },
    {
      code: 6070,
      name: "PositionAlreadyClosed",
      msg: "The position is already pending cleanup and close",
    },
  ],
};
