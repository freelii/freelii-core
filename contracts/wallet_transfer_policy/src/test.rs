#![cfg(test)]

use std::println;
extern crate std;

use smart_wallet::Contract as SmartWalletContract;
use smart_wallet_interface::types::SignerKey;
use soroban_sdk::{
    auth::{Context, ContractContext},
    symbol_short,
    testutils::{Address as _, EnvTestConfig, Ledger as _},
    vec,
    xdr::ToXdr,
    Address, BytesN, Env, Error as SorobanError, TryIntoVal,
};

use crate::{Error, WalletTransferPolicy, WalletTransferPolicyClient};

#[test]
fn test_init() {
    let env = Env::default();
    env.mock_all_auths();

    let policy_address = env.register_contract(None, WalletTransferPolicy);
    let policy_client = WalletTransferPolicyClient::new(&env, &policy_address);

    let admin = Address::generate(&env);

    // Initialize the policy
    policy_client.init(&admin);

    // Test that policy signers is initialized (empty)
    let policy_signers = policy_client.get_policy_signers();
    assert_eq!(policy_signers.len(), 0);
}

#[test]
#[should_panic(expected = "Error(Contract, #1)")]
fn test_init_already_initialized() {
    let env = Env::default();
    env.mock_all_auths();

    let policy_address = env.register_contract(None, WalletTransferPolicy);
    let policy_client = WalletTransferPolicyClient::new(&env, &policy_address);

    let admin = Address::generate(&env);

    // Initialize the policy
    policy_client.init(&admin);

    // Try to initialize again - should panic
    policy_client.init(&admin);
}

#[test]
fn test_add_and_get_wallet_signer() {
    let env = Env::default();
    env.mock_all_auths();

    let policy_address = env.register_contract(None, WalletTransferPolicy);
    let policy_client = WalletTransferPolicyClient::new(&env, &policy_address);

    let admin = Address::generate(&env);
    let recipient1 = Address::generate(&env);
    let recipient2 = Address::generate(&env);
    let signer_pubkey = BytesN::from_array(&env, &[1u8; 32]);

    // Initialize the policy
    policy_client.init(&admin);

    // Add wallet signer with authorized recipients
    let authorized_recipients = vec![&env, recipient1.clone(), recipient2.clone()];
    policy_client.add_wallet_signer_test_only(&signer_pubkey, &authorized_recipients);

    // Get authorized recipients and verify
    let retrieved_recipients = policy_client.get_authorized_recipients(&signer_pubkey);
    assert_eq!(retrieved_recipients.len(), 2);
    assert!(retrieved_recipients.contains(&recipient1));
    assert!(retrieved_recipients.contains(&recipient2));
}

#[test]
fn test_update_wallet_signer() {
    let env = Env::default();
    env.mock_all_auths();

    let policy_address = env.register_contract(None, WalletTransferPolicy);
    let policy_client = WalletTransferPolicyClient::new(&env, &policy_address);

    let admin = Address::generate(&env);
    let recipient1 = Address::generate(&env);
    let recipient2 = Address::generate(&env);
    let recipient3 = Address::generate(&env);
    let signer_pubkey = BytesN::from_array(&env, &[1u8; 32]);

    // Initialize the policy
    policy_client.init(&admin);

    // Add wallet signer with initial recipients
    let initial_recipients = vec![&env, recipient1.clone(), recipient2.clone()];
    policy_client.add_wallet_signer_test_only(&signer_pubkey, &initial_recipients);

    // Update with new recipients
    let updated_recipients = vec![&env, recipient2.clone(), recipient3.clone()];
    policy_client.update_wallet_signer(&signer_pubkey, &updated_recipients);

    // Verify the update
    let retrieved_recipients = policy_client.get_authorized_recipients(&signer_pubkey);
    assert_eq!(retrieved_recipients.len(), 2);
    assert!(retrieved_recipients.contains(&recipient2));
    assert!(retrieved_recipients.contains(&recipient3));
    assert!(!retrieved_recipients.contains(&recipient1)); // Should be removed
}

#[test]
#[should_panic(expected = "Error(Contract, #3)")]
fn test_update_nonexistent_wallet_signer() {
    let env = Env::default();
    env.mock_all_auths();

    let policy_address = env.register_contract(None, WalletTransferPolicy);
    let policy_client = WalletTransferPolicyClient::new(&env, &policy_address);

    let admin = Address::generate(&env);
    let recipient = Address::generate(&env);
    let signer_pubkey = BytesN::from_array(&env, &[1u8; 32]);

    // Initialize the policy
    policy_client.init(&admin);

    // Try to update a non-existent signer - should panic
    let recipients = vec![&env, recipient];
    policy_client.update_wallet_signer(&signer_pubkey, &recipients);
}

#[test]
fn test_remove_wallet_signer() {
    let env = Env::default();
    env.mock_all_auths();

    let policy_address = env.register_contract(None, WalletTransferPolicy);
    let policy_client = WalletTransferPolicyClient::new(&env, &policy_address);

    let admin = Address::generate(&env);
    let recipient = Address::generate(&env);
    let signer_pubkey = BytesN::from_array(&env, &[1u8; 32]);

    // Initialize the policy
    policy_client.init(&admin);

    // Add wallet signer
    let recipients = vec![&env, recipient.clone()];
    policy_client.add_wallet_signer_test_only(&signer_pubkey, &recipients);

    // Verify it was added
    let retrieved_recipients = policy_client.get_authorized_recipients(&signer_pubkey);
    assert_eq!(retrieved_recipients.len(), 1);

    // Remove the wallet signer
    policy_client.remove_wallet_signer_test_only(&signer_pubkey);

    // Verify it was removed (should return empty vector)
    let retrieved_recipients = policy_client.get_authorized_recipients(&signer_pubkey);
    assert_eq!(retrieved_recipients.len(), 0);
}

#[test]
fn test_add_and_remove_policy_signer() {
    let env = Env::default();
    env.mock_all_auths();

    let policy_address = env.register_contract(None, WalletTransferPolicy);
    let policy_client = WalletTransferPolicyClient::new(&env, &policy_address);

    let admin = Address::generate(&env);
    let policy_signer = Address::generate(&env);

    // Initialize the policy
    policy_client.init(&admin);

    // Add policy signer
    policy_client.add_policy_signer(&policy_signer);

    // Verify it was added
    let policy_signers = policy_client.get_policy_signers();
    assert_eq!(policy_signers.len(), 1);
    assert!(policy_signers.contains(&policy_signer));

    // Remove policy signer
    policy_client.remove_policy_signer(&policy_signer);

    // Verify it was removed
    let policy_signers = policy_client.get_policy_signers();
    assert_eq!(policy_signers.len(), 0);
}

#[test]
fn test_policy_enforcement_authorized_recipient() {
    let env = Env::default();
    env.mock_all_auths();

    let policy_address = env.register_contract(None, WalletTransferPolicy);
    let policy_client = WalletTransferPolicyClient::new(&env, &policy_address);

    let admin = Address::generate(&env);
    let smart_wallet = Address::generate(&env);
    let authorized_recipient = Address::generate(&env);
    let signer_pubkey = BytesN::from_array(&env, &[1u8; 32]);
    let sac = Address::generate(&env);

    // Initialize the policy
    policy_client.init(&admin);

    // Add wallet signer with authorized recipient
    let recipients = vec![&env, authorized_recipient.clone()];
    policy_client.add_wallet_signer_test_only(&signer_pubkey, &recipients);

    // Create transfer context to authorized recipient
    let contexts = vec![
        &env,
        Context::Contract(ContractContext {
            contract: sac,
            fn_name: symbol_short!("transfer"),
            args: vec![
                &env,
                smart_wallet.to_val(),
                authorized_recipient.to_val(),
                100i128.try_into_val(&env).unwrap(),
            ],
        }),
    ];

    // This should succeed (no panic)
    policy_client.policy__(&smart_wallet, &SignerKey::Ed25519(signer_pubkey), &contexts);
}

#[test]
#[should_panic(expected = "Error(Contract, #5)")]
fn test_policy_enforcement_unauthorized_recipient() {
    let env = Env::default();
    env.mock_all_auths();

    let policy_address = env.register_contract(None, WalletTransferPolicy);
    let policy_client = WalletTransferPolicyClient::new(&env, &policy_address);

    let admin = Address::generate(&env);
    let smart_wallet = Address::generate(&env);
    let authorized_recipient = Address::generate(&env);
    let unauthorized_recipient = Address::generate(&env);
    let signer_pubkey = BytesN::from_array(&env, &[1u8; 32]);
    let sac = Address::generate(&env);

    // Initialize the policy
    policy_client.init(&admin);

    // Add wallet signer with authorized recipient
    let recipients = vec![&env, authorized_recipient.clone()];
    policy_client.add_wallet_signer_test_only(&signer_pubkey, &recipients);

    // Create transfer context to unauthorized recipient
    let contexts = vec![
        &env,
        Context::Contract(ContractContext {
            contract: sac,
            fn_name: symbol_short!("transfer"),
            args: vec![
                &env,
                smart_wallet.to_val(),
                unauthorized_recipient.to_val(), // This recipient is not authorized
                100i128.try_into_val(&env).unwrap(),
            ],
        }),
    ];

    // This should panic with InvalidRecipient
    policy_client.policy__(&smart_wallet, &SignerKey::Ed25519(signer_pubkey), &contexts);
}

fn address_to_bytes(env: &Env, address: &Address) -> BytesN<32> {
    let mut address_array = [0; 32];
    let address_bytes = address.to_xdr(env);

    address_bytes
        .slice(address_bytes.len() - 32..)
        .copy_into_slice(&mut address_array);

    BytesN::from_array(env, &address_array)
}
