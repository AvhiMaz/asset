use crate::{
    errors::VaultError,
    states::Vault,
};
use anchor_lang::prelude::*;

#[derive(Accounts)]
#[instruction(unlock_time: i64)]
pub struct DepositToVault<'info> {
    #[account(mut, signer)]
    pub creator: Signer<'info>,

    #[account(mut, 
        seeds = [b"vault", creator.key().as_ref(), &unlock_time.to_le_bytes()],
        bump,
        has_one = creator)]
    pub vault: Account<'info, Vault>,

    pub system_program: Program<'info, System>,
}

impl<'info> DepositToVault<'info> {
    pub fn transfer_sol_to_vault(&mut self, amount: u64) -> Result<()> {
        let vault = &mut self.vault;

        require!(!vault.is_claimed, VaultError::AlreadyClaimed);

        //require!(
        //    matches!(vault.asset_type, AssetType::Sol | AssetType::Usdc),
        //    VaultError::InvalidAssetType
        //);

        let ix = anchor_lang::solana_program::system_instruction::transfer(
            &self.creator.key(),
            &vault.to_account_info().key(),
            amount,
        );
        anchor_lang::solana_program::program::invoke(
            &ix,
            &[
                self.creator.to_account_info(),
                vault.to_account_info(),
                self.system_program.to_account_info(),
            ],
        )?;

        vault.asset_amount += amount;

        Ok(())
    }
}
