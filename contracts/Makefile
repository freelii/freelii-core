install:
	rm -rf target/wasm32-unknown-unknown/release/
	stellar contract build
	stellar contract install --network testnet --wasm target/wasm32-unknown-unknown/release/zafegard_policy.wasm --source default
	stellar contract install --network testnet --wasm target/wasm32-unknown-unknown/release/one_time_policy.wasm --source default

bindings:
	stellar contract bindings typescript --network testnet --wasm target/wasm32-unknown-unknown/release/zafegard_policy.wasm --output-dir ./zafegard-policy-sdk --overwrite
	stellar contract bindings typescript --network testnet --wasm target/wasm32-unknown-unknown/release/one_time_policy.wasm --output-dir ./one-time-policy-sdk --overwrite