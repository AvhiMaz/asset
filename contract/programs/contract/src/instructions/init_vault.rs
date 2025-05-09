use anchor_lang::prelude::*;
use anchor_spl::{
    associated_token::AssociatedToken,
    token::{Mint, Token, TokenAccount},
};

use crate::states::{vault::AssetType, Vault};

#[derive(Accounts)]
#[instruction(unlock_time: i64, bump:u8, asset_type: AssetType, asset_reference: String)]
pub struct InitVault<'info> {
    #[account(mut)]
    pub creator: Signer<'info>,
    pub usdc_mint: Account<'info, Mint>, 

    #[account(
        init,
        payer = creator,
        space = 8 + Vault::INIT_SPACE,
        seeds = [b"vault", creator.key().as_ref(), &unlock_time.to_le_bytes()],
        bump
    )]
    pub vault: Account<'info, Vault>,

    #[account(
        init_if_needed,
        payer = creator,
        associated_token::mint = usdc_mint, 
        associated_token::authority = vault, 
    )]
    pub vault_usdc_account: Account<'info, TokenAccount>,
    
    
    pub rent: Sysvar<'info, Rent>,
    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, AssociatedToken>,
}

impl<'info> InitVault<'info> {
    pub fn init(
        &mut self,
        unlock_time: i64,
        bump: u8,
        asset_type: AssetType,
        asset_reference: String,
        recipient: Pubkey,
    ) -> Result<()> {
        let vault = &mut self.vault;

        vault.creator = self.creator.key();
        vault.recipient = recipient;
        vault.unlock_time = unlock_time;
        vault.asset_type = asset_type.clone();
        vault.asset_amount = 0;
        vault.asset_reference = asset_reference;
        vault.is_claimed = false;
        vault.bump = bump;

        if let AssetType::Usdc = asset_type {
            vault.vault_usdc_account = self.vault_usdc_account.key();
        } else {
            vault.vault_usdc_account = Pubkey::default();
        }

        msg!("Vault initialized successfully.");

        Ok(())
    }
}
