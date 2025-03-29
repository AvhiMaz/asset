#![allow(unexpected_cfgs)]
use anchor_lang::prelude::*;

pub mod instructions;
pub mod states;

use instructions::init_vault::*;
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
    ) -> Result<()> {
        ctx.accounts
            .init(unlock_time, bump, asset_type, asset_reference)?;

        Ok(())
    }
}
