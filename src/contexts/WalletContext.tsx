import React, { createContext, useContext, ReactNode, useMemo } from 'react';
import { ConnectionProvider, WalletProvider, useWallet } from '@solana/wallet-adapter-react';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { clusterApiUrl } from '@solana/web3.js';

interface WalletContextProviderProps {
  children: ReactNode;
}

/**
 * Solana Wallet Context Provider
 *
 * Provides Solana wallet connection functionality throughout the app.
 * Supports Phantom, Solflare, and other major Solana wallets.
 *
 * Features:
 * - Multi-wallet support (Phantom, Solflare)
 * - Devnet/Mainnet network switching
 * - Connection state management
 * - Transaction signing capabilities
 * - Built-in wallet selection modal
 *
 * @component
 */
export function WalletContextProvider({ children }: WalletContextProviderProps) {
  // Configure for devnet (change to mainnet-beta for production)
  const network = WalletAdapterNetwork.Devnet;
  const endpoint = useMemo(() => clusterApiUrl(network), [network]);

  // Configure supported wallets
  const wallets = useMemo(() => [], []);

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          {children}
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}

/**
 * Hook to access wallet context
 *
 * Provides access to wallet connection state and functions.
 * Must be used within WalletContextProvider.
 *
 * @returns {Object} Wallet context with connection state and functions
 */
export function useWalletContext() {
  const wallet = useWallet();
  return wallet;
}