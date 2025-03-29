#![allow(unexpected_cfgs)]
use anchor_lang::prelude::*;
pub mod states;

declare_id!("5Fy9pnLmcQu9vsM6o3Vwc2tzytBxt4MGL5SBGboqyBJ");

#[program]
pub mod contract {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        msg!("Greetings from: {:?}", ctx.program_id);
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize {}
