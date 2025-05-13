use anchor_lang::prelude::*;

#[account]
pub struct ImageVault {
    pub creator: Pubkey,
    pub recipient: Pubkey,
    pub unlock_time: i64,
    pub memo: String,
    pub asset_reference: String,
    pub is_claimed: bool,
    pub bump: u8,
}
