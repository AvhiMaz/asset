#![allow(unexpected_cfgs)]
use anchor_lang::prelude::*;

pub mod errors;
pub mod instructions;
pub mod states;

use instructions::sol::*;

use instructions::claim::*;
use instructions::init_vault::*;
use instructions::transfer::*;
use states::vault::AssetType;

declare_id!("J1Zk92BRXxaAv3obJkEVSx2qjpHRVM2cziTG1e1zDfzY");

#[program]
pub mod contract {

    use super::*;

    pub fn init_sol_vault(
        ctx: Context<InitSolVault>,
        recipient: Pubkey,
        unlock_time: i64,
        memo: String,
        amount: u64,
    ) -> Result<()> {
        ctx.accounts
            .init_sol_vault(recipient, unlock_time, amount, memo)?;
        Ok(())
    }

    pub fn init_vault(
        ctx: Context<InitVault>,
        unlock_time: i64,
        bump: u8,
        asset_type: AssetType,
        asset_reference: String,
        recipient: Pubkey,
    ) -> Result<()> {
        ctx.accounts
            .init(unlock_time, bump, asset_type, asset_reference, recipient)?;

        Ok(())
    }

    pub fn transfer(ctx: Context<DepositToVault>, amount: u64) -> Result<()> {
        ctx.accounts.transfer_to_vault(amount)?;
        Ok(())
    }

    pub fn claim(ctx: Context<Claim>) -> Result<()> {
        ctx.accounts.claim()?;
        Ok(())
    }
}
