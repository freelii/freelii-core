# Network-Aware Wallet Management

This document explains the implementation of network-aware wallet management in Freelii Core.

## 🎯 **Problem Solved**

When users switch between Stellar Testnet and Mainnet, they should only see wallets that belong to the current network. Previously, all wallets were shown regardless of network.

## ✅ **Implementation**

### **1. Network-Filtered Wallets**

**File: `src/wallet/useWallet.ts`**
- Fetches all wallets from database
- Filters wallets by current network using `useMemo`
- Automatically updates when network changes
- Clears wallet selection if selected wallet doesn't exist in new network

```typescript
// Filter wallets by current network
const wallets = useMemo(() => {
    if (!allWallets) return [];
    return allWallets.filter(wallet => wallet.network === network);
}, [allWallets, network]);
```

### **2. Enhanced Wallet Store**

**File: `src/hooks/stores/wallet-store.ts`**
- Added `clearSelection()` method for network switching
- Maintains existing functionality while supporting network changes

### **3. Custom Network Wallets Hook**

**File: `src/hooks/use-network-wallets.ts`**
- Provides easy access to network-filtered wallets
- Shows counts for testnet vs mainnet wallets
- Indicates if user has wallets in other networks

### **4. UI Components**

**Network Wallet Info (`src/components/network-wallet-info.tsx`)**
- Shows current network and wallet count
- Indicates wallets in other networks
- Provides helpful hints for users

**Network Switcher (Enhanced)**
- Integrated into sidebar bottom
- Shows wallet counts and network status
- Technical details in collapsible section

## 🚀 **User Experience**

### **When Switching Networks:**

1. **Automatic Filtering**: Only wallets for current network are shown
2. **Selection Clearing**: If selected wallet isn't in new network, selection is cleared
3. **Visual Feedback**: User sees wallet count for current and other networks
4. **Smart Hints**: Informed if they have wallets in other networks

### **Sidebar Information:**
- Current network (testnet/mainnet)
- Number of wallets in current network
- Number of wallets in other network (if any)
- Helpful hints when no wallets exist in current network

## 🔧 **Technical Details**

### **Network Detection Flow:**
```
1. User switches network in NetworkSwitcher
2. StellarContext updates current network
3. useWallet hook detects network change
4. Wallets are filtered by new network
5. Wallet store is updated with filtered wallets
6. Selected wallet is cleared if not in new network
7. UI updates automatically
```

### **Database Schema:**
- Wallets have `network` field storing 'stellar' (blockchain network)
- Wallets have `network_environment` field storing 'testnet' or 'mainnet' (environment)
- New wallets are automatically tagged with current network environment
- Filtering happens client-side for performance using `network_environment`

### **State Management:**
- **Global Network State**: StellarContext (persisted in localStorage)
- **Wallet State**: Zustand store (wallets filtered by network)
- **tRPC Queries**: Fetches all wallets, filtering handled in React

## 🧪 **Testing Scenarios**

### **Scenario 1: User has wallets in both networks**
1. Start on testnet with 2 wallets
2. Switch to mainnet with 1 wallet
3. User sees: "Wallets in mainnet: 1" and "Wallets in testnet: 2"
4. Switch back to testnet, sees original 2 wallets

### **Scenario 2: User has wallets in only one network**
1. User has 3 testnet wallets, 0 mainnet wallets
2. Switch to mainnet
3. User sees: "Wallets in mainnet: 0" and helpful hint to switch back

### **Scenario 3: New user**
1. No wallets in any network
2. Create wallet in testnet → tagged as testnet wallet
3. Switch to mainnet → no wallets shown
4. Create wallet in mainnet → tagged as mainnet wallet

## 📋 **Benefits**

1. **Network Isolation**: Users can't accidentally use wrong network wallets
2. **Clear Visibility**: Always know which network they're on and wallet counts
3. **Smooth UX**: Automatic filtering and selection management
4. **Network Safety**: Prevents cross-network transaction attempts
5. **Informative UI**: Users understand their wallet distribution across networks

## 🔄 **Migration Impact**

- **Existing Code**: Fully backward compatible
- **Database**: No schema changes needed (network field already exists)
- **Performance**: Client-side filtering is efficient
- **State**: Existing wallet selection behavior preserved when staying in same network

This implementation ensures users have a clear, safe, and intuitive experience when working with wallets across different Stellar networks.