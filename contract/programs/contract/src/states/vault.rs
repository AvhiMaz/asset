use anchor_lang::prelude::*;

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Debug)]
pub enum AssetType {
    Sol,
    Usdc,
    Image,
    Voice,
    Text,
}

impl Space for AssetType {
    const INIT_SPACE: usize = 1;
}

#[account]
#[derive(InitSpace)]
pub struct Vault {
    pub creator: Pubkey,
    pub recipient: Pubkey,
    pub unlock_time: i64,
    pub asset_type: AssetType,
    pub asset_amount: u64,
    #[max_len(50)]
    pub asset_reference: String,
    pub vault_usdc_account: Pubkey,
    pub is_claimed: bool,
    pub bump: u8,
}
