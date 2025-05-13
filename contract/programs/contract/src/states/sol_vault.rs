use anchor_lang::prelude::*;

#[account]
#[derive(InitSpace)]
pub struct SolVault {
    pub creator: Pubkey,
    pub recipient: Pubkey,
    pub unlock_time: i64,
    pub amount: u64,
    #[max_len(100)]
    pub memo: String,
    pub is_claimed: bool,
}
