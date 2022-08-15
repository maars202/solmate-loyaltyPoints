use anchor_lang::prelude::*;
use anchor_lang::solana_program::entrypoint::ProgramResult;
use anchor_lang::solana_program::system_program;
use borsh::{BorshDeserialize, BorshSerialize};
use std::iter::repeat;
use anchor_spl::token::{self, Mint, SetAuthority, TokenAccount, Transfer};

declare_id!("4j7TmiMhCrWctQXoUTiCasiZVK7987b9ia1Hf1CGxSGR");

#[program]
// mod solana_point_system {
mod mysolanaapp {
    use super::*;

    pub fn create(ctx: Context<Create>) -> ProgramResult {
        msg!("Create function!!!");

        ctx.accounts.base_account.init_baseaccount(
            ctx.accounts.mintAddress.key(),
            ctx.accounts.owner.key(),
        );
        Ok(())
    
    }

    pub fn increment(ctx: Context<Increment>) -> ProgramResult {
        msg!("Increment function!!!");
        let base_account = &mut ctx.accounts.base_account;
        base_account.tier += 1;
        base_account.count += 1;
        Ok(())
    }
}

// Transaction instructions
#[derive(Accounts)]
pub struct Create<'info> {
    // #[account(init, payer = user, space = 16 + 16)]
    // pub base_account: Account<'info, BaseAccount>,
    #[account(
        init,
        payer = owner,
        space = 8 + LISTING_PROOF_LEN, 
        seeds = [owner.key().as_ref(), mintAddress.key().as_ref(), b"points"],
        bump,
    )]
    pub base_account: Account<'info, BaseAccount>,
    #[account(mut)]
    pub owner: Signer<'info>,
    // pub mintAddress: Pubkey,
    pub mintAddress: Account<'info, Mint>,
    pub system_program: Program <'info, System>,
}

// Transaction instructions
#[derive(Accounts)]
pub struct Increment<'info> {
    #[account(mut)]
    pub base_account: Account<'info, BaseAccount>,
    #[account(mut)]
    pub owner: Signer<'info>,
    pub system_program: Program <'info, System>,
}

// // An account that goes inside a transaction instruction
// #[account]
// pub struct BaseAccount {
//     pub count: u64,

// }



pub const LISTING_PROOF_LEN: usize = 32 // NFT MINT
  + 32  // SELLER KEY
  + 32  // SELLER TOKEN ACCOUNT
  + 32  // ESCROW TOKEN ACCOUNT
  + 16  // LIST PRICE 
  + 1; // bump


// An account that goes inside a transaction instruction
#[account]
pub struct BaseAccount {
    // pub count: Vec<u64>,
    // pub points: Account<'info, Points>,
    pub mintAddress: Pubkey,
    pub owner: Pubkey,
    pub tier: u64,
    pub count: u64,
}


impl BaseAccount {
    pub fn init_baseaccount(
        &mut self,
        mintAddress: Pubkey,
        owner: Pubkey,
    ) {
        self.mintAddress = mintAddress;
        self.owner = owner;
        self.tier = 0;
        self.count = 0;

    }
}



