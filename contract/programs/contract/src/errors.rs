use anchor_lang::prelude::*;

#[error_code]
pub enum VaultError {
    #[msg("The unlock time must be in the future.")]
    InvalidUnlockTime,

    #[msg("Vault has already been claimed.")]
    AlreadyClaimed,

    #[msg("Unauthorized: Only the creator can perform this action.")]
    Unauthorized,

    #[msg("Invalid asset type.")]
    InvalidAssetType,

    #[msg("Vault USDC account is required for storing USDC.")]
    MissingUsdcAccount,

    #[msg("Vault is not yet unlocked.")]
    VaultLocked,

    #[msg("Insufficient funds in the vault.")]
    InsufficientFunds,

    #[msg("Invalid owner of the vault.")]
    InvalidOwner,
}
