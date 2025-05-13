use anchor_lang::prelude::*;

#[account]
pub struct SolVault {
    pub creator: Pubkey,
    pub recipient: Pubkey,
    pub unlock_time: i64,
    pub amount: u64,
    pub memo: String,
    pub is_claimed: bool,
    pub bump: u8,
}
