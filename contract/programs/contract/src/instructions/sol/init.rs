use anchor_lang::prelude::*;

use crate::states::SolVault;

#[derive(Accounts)]
#[instruction(unlock_time: i64)]
pub struct InitSolVault<'info> {
    #[account(mut)]
    pub creator: Signer<'info>,

    #[account(
        init,
        payer = creator,
        space = 8 + SolVault::INIT_SPACE,
        seeds = [b"solvault", creator.key().as_ref(), &unlock_time.to_be_bytes()],
        bump,
    )]
    pub vault: Account<'info, SolVault>,
    pub system_program: Program<'info, System>,
}

impl<'info> InitSolVault<'info> {
    pub fn init_sol_vault(
        &mut self,
        recipient: Pubkey,
        unlock_time: i64,
        amount: u64,
        memo: String,
    ) -> Result<()> {
        let vault = &mut self.vault;

        vault.creator = self.creator.key();
        vault.recipient = recipient;
        vault.unlock_time = unlock_time;
        vault.amount = amount;
        vault.memo = memo;
        vault.is_claimed = false;

        Ok(())
    }
}
