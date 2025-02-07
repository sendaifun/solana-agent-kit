pub mod governance;

use solana_program::{
    entrypoint,
    entrypoint::ProgramResult,
    pubkey::Pubkey,
    account_info::AccountInfo,
};

entrypoint!(process_instruction);

fn process_instruction(
    _program_id: &Pubkey,
    accounts: &[AccountInfo],
    instruction_data: &[u8],
) -> ProgramResult {
    // Parse instruction and call appropriate function
    match instruction_data[0] {
        0 => governance::GovernanceHandler::cast_vote(accounts, 1, spl_governance::state::vote_record::Vote::Approve),
        1 => governance::GovernanceHandler::check_voting_power(accounts),
        2 => governance::GovernanceHandler::delegate_vote(accounts, Pubkey::new_unique()),
        _ => Err(solana_program::program_error::ProgramError::InvalidInstructionData),
    }
}
