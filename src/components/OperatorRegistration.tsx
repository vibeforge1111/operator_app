import React, { useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletDisconnectButton } from '@solana/wallet-adapter-react-ui';
import { useOperatorProfile } from '../hooks/useOperatorProfile';
import { SKILL_TAGS, SKILL_DESCRIPTIONS, SkillTag } from '../types/operator';

/**
 * Operator Registration Component
 *
 * Initial onboarding flow for new operators joining the network.
 * Handles wallet authentication, profile creation, and skill selection
 * to establish persistent operator identities.
 *
 * Features:
 * - Solana wallet integration with connection status
 * - Handle validation (3-20 chars, alphanumeric + underscore)
 * - Multi-select skill system (1-5 skills max)
 * - Real-time validation feedback
 * - Secure profile creation with error handling
 * - Responsive design with terminal aesthetics
 *
 * Security:
 * - Client-side validation with server-side verification
 * - Wallet signature required for profile creation
 * - Input sanitization and length limits
 * - Error handling for network issues
 *
 * @component
 * @returns {JSX.Element} The operator registration interface
 *
 * @example
 * ```tsx
 * <OperatorRegistration />
 * ```
 */
export default function OperatorRegistration() {
  const { publicKey } = useWallet();
  const { createProfile } = useOperatorProfile(publicKey?.toString());

  const [handle, setHandle] = useState('');
  const [selectedSkills, setSelectedSkills] = useState<SkillTag[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  /**
   * Toggles a skill in the selected skills array
   *
   * Enforces the 5-skill maximum limit and prevents duplicates.
   * Allows deselecting skills by clicking them again.
   *
   * @param {SkillTag} skill - The skill to toggle
   */
  const handleSkillToggle = (skill: SkillTag) => {
    setSelectedSkills(prev => {
      if (prev.includes(skill)) {
        return prev.filter(s => s !== skill);
      }
      if (prev.length >= 5) {
        return prev; // Max 5 skills
      }
      return [...prev, skill];
    });
  };

  /**
   * Handles form submission for operator registration
   *
   * Validates input, creates the operator profile, and handles errors.
   * Requires wallet connection and valid handle/skills selection.
   *
   * @param {React.FormEvent} e - The form submission event
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!handle.trim() || selectedSkills.length === 0) return;

    setIsSubmitting(true);
    setError('');

    try {
      await createProfile(handle.trim(), selectedSkills);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * Validates operator handle format
   *
   * Ensures handle meets security requirements:
   * - 3-20 characters length
   * - Alphanumeric characters and underscores only
   * - No special characters or spaces
   *
   * @param {string} h - The handle to validate
   * @returns {boolean} True if handle is valid
   */
  const isValidHandle = (h: string) => {
    return h.length >= 3 && h.length <= 20 && /^[a-zA-Z0-9_]+$/.test(h);
  };

  return (
    <div className="min-h-screen terminal-bg">
      {/* Header */}
      <div className="border-b border-[var(--color-primary)]/20 bg-[var(--color-surface)]/50">
        <div className="max-w-4xl mx-auto px-6 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold text-[var(--color-primary)]">OPERATOR NETWORK</h1>
            <p className="text-sm text-[var(--color-text-muted)]">Registration Terminal</p>
          </div>
          <WalletDisconnectButton className="!bg-red-600 !text-white hover:!bg-red-700" />
        </div>
      </div>

      {/* Registration Form */}
      <div className="max-w-2xl mx-auto px-6 py-12">
        <div className="operator-card rounded-lg p-8 space-y-8">
          <div className="text-center space-y-4">
            <h2 className="text-3xl font-bold text-white">Become an Operator</h2>
            <p className="text-[var(--color-text-muted)]">
              Create your operator profile to join the network
            </p>
            <div className="text-sm text-[var(--color-primary)]">
              Connected: {publicKey?.toString().slice(0, 8)}...{publicKey?.toString().slice(-8)}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Handle Input */}
            <div className="space-y-3">
              <label className="block text-sm font-medium text-white">
                Operator Handle
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[var(--color-primary)]">
                  @
                </span>
                <input
                  type="text"
                  value={handle}
                  onChange={(e) => setHandle(e.target.value)}
                  className="w-full pl-8 pr-4 py-3 bg-[var(--color-bg)] border border-[var(--color-primary)]/30 rounded-lg text-white placeholder-[var(--color-text-muted)] focus:border-[var(--color-primary)] focus:outline-none"
                  placeholder="your_handle"
                  maxLength={20}
                />
              </div>
              <div className="flex justify-between text-xs">
                <span className={isValidHandle(handle) ? 'text-[var(--color-primary)]' : 'text-[var(--color-text-muted)]'}>
                  {isValidHandle(handle) ? '✓ Valid handle' : 'Alphanumeric + underscore, 3-20 chars'}
                </span>
                <span className="text-[var(--color-text-muted)]">{handle.length}/20</span>
              </div>
            </div>

            {/* Skills Selection */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Select Skills (1-5)
                </label>
                <p className="text-xs text-[var(--color-text-muted)] mb-4">
                  Choose skills that represent your capabilities
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {SKILL_TAGS.map((skill) => (
                  <button
                    key={skill}
                    type="button"
                    onClick={() => handleSkillToggle(skill)}
                    disabled={!selectedSkills.includes(skill) && selectedSkills.length >= 5}
                    className={`p-4 rounded-lg border text-left transition-all ${
                      selectedSkills.includes(skill)
                        ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/10 text-[var(--color-primary)]'
                        : 'border-[var(--color-primary)]/30 bg-[var(--color-bg)] text-white hover:border-[var(--color-primary)]/50'
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    <div className="font-medium">{skill}</div>
                    <div className="text-xs opacity-70">
                      {SKILL_DESCRIPTIONS[skill]}
                    </div>
                  </button>
                ))}
              </div>

              <div className="text-xs text-[var(--color-text-muted)]">
                Selected: {selectedSkills.length}/5
                {selectedSkills.length > 0 && (
                  <span className="ml-2 text-[var(--color-primary)]">
                    [{selectedSkills.join(', ')}]
                  </span>
                )}
              </div>
            </div>

            {/* Error Display */}
            {error && (
              <div className="p-3 bg-red-600/20 border border-red-600/50 rounded-lg text-red-400 text-sm">
                {error}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={!isValidHandle(handle) || selectedSkills.length === 0 || isSubmitting}
              className="w-full py-4 bg-[var(--color-primary)] text-black font-medium rounded-lg hover:bg-[var(--color-primary)]/80 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {isSubmitting ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="animate-spin w-4 h-4 border-2 border-black border-t-transparent rounded-full"></div>
                  <span>Creating Operator Profile...</span>
                </div>
              ) : (
                'Create Profile'
              )}
            </button>
          </form>

          <div className="text-center text-xs text-[var(--color-text-muted)] space-y-1">
            <div>Registration commits your identity to the network</div>
            <div className="text-[var(--color-primary)]">Handle will be permanent for MVP</div>
          </div>
        </div>
      </div>
    </div>
  );
}