#![no_std]

use smart_wallet_interface::{
    types::{Signer, SignerExpiration, SignerKey, SignerLimits, SignerStorage},
    PolicyInterface, SmartWalletClient,
};
use soroban_sdk::{
    auth::{Context, ContractContext},
    contract, contracterror, contractimpl, contracttype, map, panic_with_error, symbol_short, vec,
    Address, BytesN, Env, Map, TryFromVal, Vec,
};

mod test;

#[contracttype]
#[derive(Clone, Debug, PartialEq)]
pub enum StorageKey {
    Admin,
    AuthorizedWallets(BytesN<32>), // signer -> set of authorized recipient wallets
    PolicySigners,                 // set of policy signers who can receive transfers
}

#[contracterror]
#[derive(Copy, Clone, Debug, PartialEq)]
#[repr(u32)]
pub enum Error {
    AlreadyInitialized = 1,
    NotInitialized = 2,
    NotFound = 3,
    NotAllowed = 4,
    InvalidRecipient = 5,
    InvalidFunction = 6,
}

#[contract]
pub struct WalletTransferPolicy;

#[contractimpl]
impl WalletTransferPolicy {
    /// Initialize the policy with an admin
    pub fn init(env: Env, admin: Address) {
        if env.storage().instance().has(&StorageKey::Admin) {
            panic_with_error!(&env, Error::AlreadyInitialized)
        }

        env.storage().instance().set(&StorageKey::Admin, &admin);
        env.storage()
            .instance()
            .set(&StorageKey::PolicySigners, &Map::<Address, ()>::new(&env));
    }

    /// Add a wallet signer with authorized recipient addresses
    pub fn add_wallet_signer(
        env: Env,
        signer_pubkey: BytesN<32>,
        smart_wallet: Address,
        authorized_recipients: Vec<Address>,
    ) {
        let admin = self::get_admin_address(&env);
        admin.require_auth();

        // Convert Vec to Map for storage (using () as value to simulate a set)
        let mut recipient_map = Map::<Address, ()>::new(&env);
        for recipient in authorized_recipients.iter() {
            recipient_map.set(recipient, ());
        }

        // Store authorized recipients for this signer
        env.storage().persistent().set(
            &StorageKey::AuthorizedWallets(signer_pubkey.clone()),
            &recipient_map,
        );

        // Add the signer to the smart wallet with this policy
        SmartWalletClient::new(&env, &smart_wallet).add_signer(&Signer::Ed25519(
            signer_pubkey.clone(),
            SignerExpiration(Some(u32::MAX)),
            SignerLimits(Some(map![
                &env,
                (
                    // This should be the asset contract address - for now using a placeholder
                    // In practice, this would be configured per asset
                    smart_wallet,
                    Some(vec![
                        &env,
                        SignerKey::Policy(env.current_contract_address())
                    ])
                )
            ])),
            SignerStorage::Persistent,
        ));
    }

    /// Add a wallet signer with authorized recipient addresses (test-only version)
    /// This version doesn't interact with the smart wallet contract
    #[cfg(test)]
    pub fn add_wallet_signer_test_only(
        env: Env,
        signer_pubkey: BytesN<32>,
        authorized_recipients: Vec<Address>,
    ) {
        let admin = self::get_admin_address(&env);
        admin.require_auth();

        // Convert Vec to Map for storage (using () as value to simulate a set)
        let mut recipient_map = Map::<Address, ()>::new(&env);
        for recipient in authorized_recipients.iter() {
            recipient_map.set(recipient, ());
        }

        // Store authorized recipients for this signer
        env.storage().persistent().set(
            &StorageKey::AuthorizedWallets(signer_pubkey),
            &recipient_map,
        );
    }

    /// Remove a wallet signer
    pub fn remove_wallet_signer(env: Env, signer_pubkey: BytesN<32>, smart_wallet: Address) {
        let admin = self::get_admin_address(&env);
        admin.require_auth();

        // Remove from smart wallet
        SmartWalletClient::new(&env, &smart_wallet)
            .remove_signer(&SignerKey::Ed25519(signer_pubkey.clone()));

        // Remove authorized recipients
        env.storage()
            .persistent()
            .remove(&StorageKey::AuthorizedWallets(signer_pubkey));
    }

    /// Remove a wallet signer (test-only version)
    /// This version doesn't interact with the smart wallet contract
    #[cfg(test)]
    pub fn remove_wallet_signer_test_only(env: Env, signer_pubkey: BytesN<32>) {
        let admin = self::get_admin_address(&env);
        admin.require_auth();

        // Remove authorized recipients
        env.storage()
            .persistent()
            .remove(&StorageKey::AuthorizedWallets(signer_pubkey));
    }

    /// Update authorized recipients for a signer
    pub fn update_wallet_signer(
        env: Env,
        signer_pubkey: BytesN<32>,
        authorized_recipients: Vec<Address>,
    ) {
        let admin = self::get_admin_address(&env);
        admin.require_auth();

        // Check if signer exists
        if !env
            .storage()
            .persistent()
            .has(&StorageKey::AuthorizedWallets(signer_pubkey.clone()))
        {
            panic_with_error!(&env, Error::NotFound);
        }

        // Convert Vec to Map for storage (using () as value to simulate a set)
        let mut recipient_map = Map::<Address, ()>::new(&env);
        for recipient in authorized_recipients.iter() {
            recipient_map.set(recipient, ());
        }

        env.storage().persistent().set(
            &StorageKey::AuthorizedWallets(signer_pubkey),
            &recipient_map,
        );
    }

    /// Add a policy signer (can receive transfers from any authorized wallet signer)
    pub fn add_policy_signer(env: Env, signer_address: Address) {
        let admin = self::get_admin_address(&env);
        admin.require_auth();

        let mut policy_signers = env
            .storage()
            .instance()
            .get::<StorageKey, Map<Address, ()>>(&StorageKey::PolicySigners)
            .unwrap_or_else(|| Map::<Address, ()>::new(&env));

        policy_signers.set(signer_address, ());
        env.storage()
            .instance()
            .set(&StorageKey::PolicySigners, &policy_signers);
    }

    /// Remove a policy signer
    pub fn remove_policy_signer(env: Env, signer_address: Address) {
        let admin = self::get_admin_address(&env);
        admin.require_auth();

        let mut policy_signers = env
            .storage()
            .instance()
            .get::<StorageKey, Map<Address, ()>>(&StorageKey::PolicySigners)
            .unwrap_or_else(|| Map::<Address, ()>::new(&env));

        policy_signers.remove(signer_address);
        env.storage()
            .instance()
            .set(&StorageKey::PolicySigners, &policy_signers);
    }

    /// Get authorized recipients for a signer (view function)
    pub fn get_authorized_recipients(env: Env, signer_pubkey: BytesN<32>) -> Vec<Address> {
        let recipient_map: Map<Address, ()> = env
            .storage()
            .persistent()
            .get(&StorageKey::AuthorizedWallets(signer_pubkey))
            .unwrap_or_else(|| Map::<Address, ()>::new(&env));

        recipient_map.keys()
    }

    /// Get all policy signers (view function)
    pub fn get_policy_signers(env: Env) -> Vec<Address> {
        let policy_signers: Map<Address, ()> = env
            .storage()
            .instance()
            .get(&StorageKey::PolicySigners)
            .unwrap_or_else(|| Map::<Address, ()>::new(&env));

        policy_signers.keys()
    }
}

fn get_admin_address(env: &Env) -> Address {
    env.storage()
        .instance()
        .get::<StorageKey, Address>(&StorageKey::Admin)
        .unwrap_or_else(|| panic_with_error!(&env, Error::NotInitialized))
}

#[contractimpl]
impl PolicyInterface for WalletTransferPolicy {
    /// Policy validation for wallet-to-wallet transfers
    fn policy__(env: Env, _source: Address, signer: SignerKey, contexts: Vec<Context>) {
        // Only allow single context (one function call)
        if contexts.len() != 1 {
            panic_with_error!(&env, Error::NotAllowed);
        }

        // Extract signer public key
        let signer_pubkey = match signer {
            SignerKey::Ed25519(pubkey) => pubkey,
            _ => panic_with_error!(&env, Error::NotAllowed),
        };

        // Validate the context
        if let Context::Contract(ContractContext { fn_name, args, .. }) = contexts.get_unchecked(0)
        {
            // Only allow transfer function
            if fn_name != symbol_short!("transfer") {
                panic_with_error!(&env, Error::InvalidFunction);
            }

            // Extract recipient address (should be args[1] in transfer function)
            if let Some(recipient_val) = args.get(1) {
                if let Ok(recipient) = Address::try_from_val(&env, &recipient_val) {
                    // Check if recipient is in authorized wallets for this signer
                    let authorized_recipients = env
                        .storage()
                        .persistent()
                        .get::<StorageKey, Map<Address, ()>>(&StorageKey::AuthorizedWallets(
                            signer_pubkey,
                        ))
                        .unwrap_or_else(|| panic_with_error!(&env, Error::NotFound));

                    if authorized_recipients.contains_key(recipient.clone()) {
                        return; // Transfer is allowed
                    }

                    // Check if recipient is a policy signer
                    let policy_signers = env
                        .storage()
                        .instance()
                        .get::<StorageKey, Map<Address, ()>>(&StorageKey::PolicySigners)
                        .unwrap_or_else(|| Map::<Address, ()>::new(&env));

                    if policy_signers.contains_key(recipient) {
                        return; // Transfer to policy signer is allowed
                    }

                    // Recipient not authorized
                    panic_with_error!(&env, Error::InvalidRecipient);
                } else {
                    panic_with_error!(&env, Error::InvalidRecipient);
                }
            } else {
                panic_with_error!(&env, Error::InvalidRecipient);
            }
        } else {
            panic_with_error!(&env, Error::NotAllowed);
        }
    }
}
