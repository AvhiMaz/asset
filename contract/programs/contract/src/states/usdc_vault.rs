use anchor_lang::prelude::*;

#[account]
pub struct UsdcVault {
    pub creator: Pubkey,
    pub recipient: Pubkey,
    pub unlock_time: i64,
    pub amount: u64,
    pub memo: String,
    pub mint: Pubkey,
    pub is_claimed: bool,
    pub bump: u8,
}
