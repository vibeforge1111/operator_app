/**
 * Privy Authentication Provider
 *
 * Configures Privy for seamless Web2 and Web3 authentication with
 * embedded wallets for BNB Chain and Solana. Users automatically
 * get wallets created on signup without needing existing crypto wallets.
 */

import { PrivyProvider as BasePrivyProvider } from '@privy-io/react-auth';
import { bsc, bscTestnet } from 'viem/chains';
import { ReactNode } from 'react';

interface PrivyProviderProps {
  children: ReactNode;
}

// Custom BNB Chain configuration
const bnbChain = {
  ...bsc,
  rpcUrls: {
    default: {
      http: [import.meta.env.VITE_BNB_CHAIN_RPC_URL || 'https://bsc-dataseed1.binance.org'],
    },
    public: {
      http: [import.meta.env.VITE_BNB_CHAIN_RPC_URL || 'https://bsc-dataseed1.binance.org'],
    },
  },
};

const bnbTestnet = {
  ...bscTestnet,
  rpcUrls: {
    default: {
      http: [import.meta.env.VITE_BNB_TESTNET_RPC_URL || 'https://data-seed-prebsc-1-s1.binance.org:8545'],
    },
    public: {
      http: [import.meta.env.VITE_BNB_TESTNET_RPC_URL || 'https://data-seed-prebsc-1-s1.binance.org:8545'],
    },
  },
};

export function PrivyProvider({ children }: PrivyProviderProps) {
  const appId = import.meta.env.VITE_PRIVY_APP_ID;
  const isDevelopment = import.meta.env.DEV;

  // Check if we have a valid Privy App ID
  const isConfigured = appId && appId !== 'your-privy-app-id-here';

  if (!isConfigured) {
    // Show configuration instructions if Privy is not set up
    return (
      <div className="min-h-screen terminal-bg flex items-center justify-center p-8">
        <div className="max-w-2xl w-full space-y-6 clean-card p-8">
          <h2 className="text-2xl font-bold text-[var(--color-primary)]">Privy Configuration Required</h2>
          <div className="space-y-4 text-[var(--color-text-muted)]">
            <p>To enable authentication, you need to set up Privy:</p>
            <ol className="list-decimal list-inside space-y-2 ml-4">
              <li>Go to <a href="https://dashboard.privy.io" target="_blank" className="text-[var(--color-primary)] underline">dashboard.privy.io</a></li>
              <li>Create a new app called "Operator Network"</li>
              <li>Enable Email, Google, Discord login methods</li>
              <li>Enable embedded wallets</li>
              <li>Add BNB Chain (ID: 56) and Solana</li>
              <li>Copy your App ID</li>
              <li>Update your .env file: <code className="bg-[var(--muted)] px-2 py-1 rounded">VITE_PRIVY_APP_ID=your-app-id</code></li>
              <li>Restart the dev server</li>
            </ol>
          </div>
          <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
            <p className="text-sm text-yellow-500">
              For now, you can continue with Firebase authentication.
            </p>
          </div>
          {/* Fallback to render children without Privy */}
          {children}
        </div>
      </div>
    );
  }

  return (
    <BasePrivyProvider
      appId={appId}
      config={{
        // Appearance configuration
        appearance: {
          theme: 'dark',
          accentColor: '#00ff00', // Match the operator network green
          logo: '/logo.png',
        },

        // Login methods - prioritize easy Web2 methods
        loginMethods: [
          'email',
          'google',
          'discord',
          'twitter',
          'github',
          'wallet', // Still allow external wallet connection if user prefers
        ],

        // Embedded wallets configuration
        embeddedWallets: {
          // Automatically create wallets for new users
          createOnLogin: 'users-without-wallets',

          // No prompts needed - seamless experience
          requireUserPasswordOnCreate: false,

          // Show wallet UI in app
          showWalletUIs: true,
        },

        // Chain configuration
        defaultChain: isDevelopment ? bnbTestnet : bnbChain,
        supportedChains: [
          isDevelopment ? bnbTestnet : bnbChain,
          // Solana support is automatic with Privy
        ],

        // Additional Solana configuration
        solanaConfig: {
          // Use devnet in development, mainnet in production
          rpcUrl: isDevelopment
            ? 'https://api.devnet.solana.com'
            : 'https://api.mainnet-beta.solana.com',
        },

        // Wallet connection options
        walletConnectCloudProjectId: undefined, // We don't need WalletConnect for embedded wallets

        // Legal compliance
        legal: {
          termsAndConditionsUrl: '/terms',
          privacyPolicyUrl: '/privacy',
        },

        // Custom text
        loginMessage: 'Welcome to Operator Network! Sign in to manage your operator profile and connect with machines.',

        // Disable external wallet prompts for new users
        externalWallets: {
          // Still support MetaMask, etc. if users want to connect existing wallets
          enabled: true,
          // But don't prompt to install if not present
          requireInstall: false,
        },
      }}
    >
      {children}
    </BasePrivyProvider>
  );
}