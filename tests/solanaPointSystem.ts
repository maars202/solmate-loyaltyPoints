// import * as anchor from "@project-serum/anchor";
// import { Program } from "@project-serum/anchor";
// import { SolanaPointSystem } from "../target/types/solana_point_system";

// describe("solanaPointSystem", () => {
//   // Configure the client to use the local cluster.
//   anchor.setProvider(anchor.AnchorProvider.env());

//   const program = anchor.workspace.SolanaPointSystem as Program<SolanaPointSystem>;

//   it("Is initialized!", async () => {
//     // Add your test here.
//     const tx = await program.methods.initialize().rpc();
//     console.log("Your transaction signature", tx);
//   });
// });

// const anchor = require('@project-serum/anchor');

// describe('mysolanaapp', () => {

//   // Configure the client to use the local cluster.
//   anchor.setProvider(anchor.Provider.env());

//   it('Is initialized!', async () => {
//     // Add your test here.
//     const program = anchor.workspace.Mysolanaapp;
//     const tx = await program.rpc.initialize();
//     console.log("Your transaction signature", tx);
//   });
// });

// const assert = require("assert");
// const anchor = require("@project-serum/anchor");
// const { PublicKey, SystemProgram } = require("@solana/web3.js");
// const { SystemProgram } = anchor.web3;

// import { PublicKey, SystemProgram } from "@solana/web3.js";
// import {
//   TOKEN_PROGRAM_ID,
//   createMint,
//   createAccount,
//   mintTo,
//   getAccount,
// } from "@solana/spl-token";


import * as anchor from "@project-serum/anchor";
import { Program } from "@project-serum/anchor";
import { PublicKey, SystemProgram } from "@solana/web3.js";
import {
  TOKEN_PROGRAM_ID,
  createMint,
  createAccount,
  mintTo,
  getAccount,
  getOrCreateAssociatedTokenAccount,
  AccountLayout
} from "@solana/spl-token";
import { SolanaPointSystem } from "../target/types/solana_point_system";
import { assert } from "chai";
import { BN } from "bn.js";

describe("mysolanaapp", () => {
    // Configure the client to use the local cluster.
    const provider = anchor.AnchorProvider.env();
    anchor.setProvider(provider);
  
    const program = anchor.workspace
      .SolanaPointSystem as Program<SolanaPointSystem>;

      // const SPL_ASSOCIATED_TOKEN_ACCOUNT_PROGRAM_ID = new PublicKey("3GX3oKKQL34uGYvfdXaAtssC7vy8uRnPTSHWobfNgioC");
  


      const SPL_ASSOCIATED_TOKEN_ACCOUNT_PROGRAM_ID: PublicKey = new PublicKey(
        'ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL',
      );

    let mintAddress: PublicKey = null;

    let nftMint: PublicKey = null;

    let sellerTokenAccount: PublicKey = null;
    let buyerTokenAccount: PublicKey = null;

    // added:
    let _sellerTokenAccount: PublicKey = null;
  
    let escrowTokenAccount: PublicKey = null;
  
    let escrowInfoAccount: PublicKey = null;
    let escrowInfoAccountBump: number = null;
  
    const sellerNftTokenAmount = 1;
    const sellerListingPrice = 1e9;
  
    const seller = anchor.web3.Keypair.generate();
    // const seller = provider.wallet;
    const buyer = anchor.web3.Keypair.generate();

    it("Initialises mint!", async () => {

      const airdropSellerSig = await provider.connection.requestAirdrop(
        seller.publicKey,
        2e9
      );

      // sleeper function for the airdrop to properly settle into account which takes some time 
      // so that following createMint function doesnt encounter errors:
        function delay(ms: number) {
          return new Promise( resolve => setTimeout(resolve, ms) );
      }

      await delay(10000);

      console.log("Seller account topped up to pay for gas fees: ", seller.publicKey.toBase58());

      // console.log("kind of like candy machine where mint is stored before being minted to an actual ownership:");

      nftMint = await createMint(
        provider.connection,
        seller,
        seller.publicKey,
        seller.publicKey,
        0
      );
      console.log("createMint done! with nftMint created storing that 1 mint and having public key: ", 
      nftMint.toBase58());


      sellerTokenAccount = await createAccount(
        provider.connection,
        seller,
        nftMint,
        seller.publicKey
      );
  
      console.log("sellerTokenAccount created with publickey: ", sellerTokenAccount.toBase58());
      
    await mintTo(
      provider.connection,
      // who is receiving the mint
      seller,
      // nft mint account to get that particular token signature:
      nftMint,
      // associatedTokenAccount.address,
      sellerTokenAccount,
      // wallet,
      seller,
      // for nfts can only be 1
      sellerNftTokenAmount
    );

    console.log("nftMint: ", nftMint)

    console.log("minting to sellerTokenAccount publicKey", sellerTokenAccount.toBase58(), " done!");

      const _sellerTokenAccount = await getAccount(
        provider.connection,
        sellerTokenAccount
      );

      console.log(sellerTokenAccount.toBase58(), " get _sellerTokenAccount ", _sellerTokenAccount, " after minting done");

      assert.ok(Number(_sellerTokenAccount.amount) == sellerNftTokenAmount);
      assert.ok(_sellerTokenAccount.owner.equals(seller.publicKey));
      assert.ok(_sellerTokenAccount.mint.equals(nftMint));

    })

    it.skip("findAssociatedTokenAddress based on owner and mint accounts",async () => {

        async function findAssociatedTokenAddress(
          walletAddress: PublicKey,
          tokenMintAddress: PublicKey
      ): Promise<PublicKey> {
          return (await PublicKey.findProgramAddress(
              [
                  walletAddress.toBuffer(),
                  TOKEN_PROGRAM_ID.toBuffer(),
                  tokenMintAddress.toBuffer(),
              ],
              SPL_ASSOCIATED_TOKEN_ACCOUNT_PROGRAM_ID
          ))[0];
      }
    
      const associatedTokenAddress = await findAssociatedTokenAddress(seller.publicKey, nftMint);
      console.log(associatedTokenAddress == sellerTokenAccount, "sellerTokenAccount: ", sellerTokenAccount);
      console.log(associatedTokenAddress == _sellerTokenAccount, "_sellerTokenAccount: ", _sellerTokenAccount);
      // console.log(associatedTokenAddress == initial_associatedTokenAddress, "initial_associatedTokenAddress: ", initial_associatedTokenAddress);
      
      
    })

  it("Creates baseAccount struct based on user and nft mint address: ", async () => {
    /* Call the create function via RPC */


    let [_escrowInfoAccount, _escrowInfoAccountBump] =
    await PublicKey.findProgramAddress(
        [seller.publicKey.toBytes(), nftMint.toBytes(), Buffer.from(anchor.utils.bytes.utf8.encode("points"))],
        // need programid since the program is the one that is "init" this account! and it uses its own programid to derive/find the suitable address!
        program.programId
      );

            // sleeper function for the airdrop to properly settle into account which takes some time 
      // so that following createMint function doesnt encounter errors:
      function delay(ms: number) {
        return new Promise( resolve => setTimeout(resolve, ms) );
    }

    await delay(1000);


    escrowInfoAccount = _escrowInfoAccount;
    escrowInfoAccountBump = _escrowInfoAccountBump;

    console.log("escrowInfoAccount: ", escrowInfoAccount);
    console.log("escrowInfoAccountBump: ", escrowInfoAccountBump)

    // WRONG NON DETERMINISTIC WAY OF GENERATING RANDOM KEYPAIR:
    // const baseAccount = anchor.web3.Keypair.generate();
    // console.log("this is the baseAccount: ", baseAccount);

    // this is the seller signing the account as owner: 
    console.log("this is the seller signing the account as owner: ", seller.publicKey.toBase58())
    console.log("base account pubkey ", escrowInfoAccount.toBase58())
    console.log("nftMint: ", nftMint.toBase58())
    console.log("SystemProgram.programId: ", SystemProgram.programId.toBase58())
    await program.rpc.create({
      accounts: {
        baseAccount: escrowInfoAccount,
        owner: seller.publicKey,
        mintAddress: nftMint,
        systemProgram: SystemProgram.programId,
      },
      signers: [seller],
    });

    console.log("create method from program executed!");


  await delay(5000);




    const account = await program.account.baseAccount.fetch(escrowInfoAccount);
    // console.log("one we cannot find: ", account);
    // console.log('Count 0: ', account.count.toString())
    // assert.ok(account.count.toString() == 0);
    // _baseAccount = baseAccount;
    console.log("account fetched: ", account);

  });

  it.skip("Fetches all base accounts in program and displays their public address", async () => {

    /* Fetch the account and check the value of count */
    const accounts = await program.account.baseAccount.all();
    // console.log("All accounts: ", accounts);
    for (var item of accounts){
      // console.log(item.publicKey.toBase58())
      console.log(item)
    }

  })

  it("increment count and tier", async () => {



    let [_escrowInfoAccount, _escrowInfoAccountBump] =
    await PublicKey.findProgramAddress(
        [seller.publicKey.toBytes(), nftMint.toBytes(), Buffer.from(anchor.utils.bytes.utf8.encode("points"))],
        // need programid since the program is the one that is "init" this account! and it uses its own programid to derive/find the suitable address!
        program.programId
      );

            // sleeper function for the airdrop to properly settle into account which takes some time 
      // so that following createMint function doesnt encounter errors:
      function delay(ms: number) {
        return new Promise( resolve => setTimeout(resolve, ms) );
    }

    await delay(1000);

    let accountInitial = await program.account.baseAccount.fetch(_escrowInfoAccount);


    console.log("Before incrementing: ", accountInitial)

    console.log("seller public key: ", seller.publicKey.toBase58());
    await program.rpc.increment({
      accounts: {
        baseAccount: _escrowInfoAccount,
        owner: seller.publicKey,
        systemProgram: SystemProgram.programId,
      },
      signers: [seller],
    });

    let accountAfter = await program.account.baseAccount.fetch(_escrowInfoAccount);
    console.log("After incrementing: ", accountAfter)


  })

  

  it.skip("gets all spl token accounts of user", async () => {

    // let [_escrowInfoAccount, _escrowInfoAccountBump] =
    // await PublicKey.findProgramAddress(
    //     // [provider.wallet.publicKey.toBytes(), mintAddress.as_ref(), Buffer.from(anchor.utils.bytes.utf8.encode("points"))],
    //     [seller.publicKey.toBytes(), nftMint.toBytes(), Buffer.from(anchor.utils.bytes.utf8.encode("points"))],
    //     // need programid since the program is the one that is "init" this account! and it uses its own programid to derive/find the suitable address!
    //     program.programId
    //   );

      const accounts = await provider.connection.getParsedProgramAccounts(
        TOKEN_PROGRAM_ID)
        for (var item of accounts){
          console.log("----------------------------------------------------------------------------------------")
          console.log(item.pubkey.toBase58())
          // console.log(item.account.data['parsed'].info)
          console.log(item.account.data['parsed'])
          // console.log(Object.keys(item.account.data['parsed']["info"]))
          
        }

        // console.log("accounts: ", accounts)

    // const baseAccount = _baseAccount;
    // console.log("this is the baseAccount: ", _baseAccount);
    // await program.rpc.increment({
    //   accounts: {
    //     baseAccount: baseAccount.publicKey,
    //   },
    // });

    // const account = await program.account.baseAccount.fetch(baseAccount.publicKey);
    // console.log('Count 1: ', account.count.toString())
    // assert.ok(account.count.toString() == 1);

  });


  it.skip("getTokenAccountsByOwner: gets all spl token accounts of user", async () => {

    const accounts = await provider.connection.getTokenAccountsByOwner(
      seller.publicKey, {
        programId: TOKEN_PROGRAM_ID
        // mint: new PublicKey("7BVpgkAv/Ng7VFo76VxiEvx7RQigjWbNjU8cMPG757vkh")
      })
      // for (var item of accounts.iter()){
      //   console.log("----------------------------------------------------------------------------------------")
      //   console.log(item.pubkey.toBase58())
      //   // console.log(item.account.data['parsed'].info)
      //   // console.log(Object.keys(item.account.data['parsed']["info"]))
        
      // }
      console.log(accounts);

      console.log("Token                                         Balance");
      console.log("------------------------------------------------------------");
      accounts.value.forEach((tokenAccount) => {
        const accountData = AccountLayout.decode(tokenAccount.account.data);
        console.log(`${new PublicKey(accountData.mint)}   ${accountData.amount}`);
      })
  })

  it.skip("getParsedTokenAccountsByOwner: gets all spl token accounts of user", async () => {

    const accounts = await provider.connection.getParsedTokenAccountsByOwner(
      seller.publicKey, {
        programId: TOKEN_PROGRAM_ID
        // mint: new PublicKey("7BVpgkAvNg7VFo76VxiEvx7RQigjWbNjU8cMPG757vkh")
      })
      for (var item of accounts.value){
        console.log("----------------------------------------------------------------------------------------")
        console.log(item.pubkey.toBase58())
        // console.log(item.account)
        console.log(item.account.data['parsed'].info)
        // console.log(Object.keys(item.account.data['parsed']["info"]))
        
      }
      console.log(accounts);
  })




});
