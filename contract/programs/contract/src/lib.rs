#![allow(unexpected_cfgs)]
use anchor_lang::prelude::*;

pub mod errors;
pub mod instructions;
pub mod states;

use instructions::claim::*;
use instructions::init_vault::*;
use instructions::transfer::*;
use states::vault::AssetType;

declare_id!("5Fy9pnLmcQu9vsM6o3Vwc2tzytBxt4MGL5SBGboqyBJ");

#[program]
pub mod contract {

    use super::*;

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
