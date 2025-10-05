import React, { useState } from 'react';
import { useWalletContext } from '../contexts/WalletContext';
import { useOperatorProfile } from '../hooks/useOperatorProfile';
import { validateHandle, validateSkills, SkillTagSchema } from '../lib/validation/schemas';
import { SkillTag } from '../lib/validation/schemas';

interface ProfileCreationProps {
  walletAddress: string;
  onProfileCreated: () => void;
  onCancel: () => void;
}

/**
 * Profile Creation Component
 *
 * Handles operator profile creation with wallet signature verification.
 * Integrates with Zod validation and requires cryptographic proof of ownership.
 *
 * Features:
 * - Handle validation and uniqueness checking
 * - Skill selection with validation
 * - Wallet signature requirement for security
 * - Real-time validation feedback
 * - Terminal aesthetic UI design
 *
 * @component
 */
export default function ProfileCreation({ walletAddress, onProfileCreated, onCancel }: ProfileCreationProps) {
  const { signMessage } = useWalletContext();
  const { createProfile } = useOperatorProfile(walletAddress);

  const [handle, setHandle] = useState('');
  const [selectedSkills, setSelectedSkills] = useState<SkillTag[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<{
    handle?: string;
    skills?: string;
  }>({});

  const availableSkills: SkillTag[] = ['Dev', 'Design', 'VibeOps', 'BizOps', 'Narrative', 'Coordination'];

  // Real-time handle validation
  const validateHandleInput = (value: string) => {
    const result = validateHandle(value);
    setValidationErrors(prev => ({
      ...prev,
      handle: result.valid ? undefined : result.error
    }));
    return result.valid;
  };

  // Real-time skills validation
  const validateSkillsInput = (skills: SkillTag[]) => {
    const result = validateSkills(skills);
    setValidationErrors(prev => ({
      ...prev,
      skills: result.valid ? undefined : result.error
    }));
    return result.valid;
  };

  const handleSkillToggle = (skill: SkillTag) => {
    let newSkills: SkillTag[];
    if (selectedSkills.includes(skill)) {
      newSkills = selectedSkills.filter(s => s !== skill);
    } else {
      newSkills = [...selectedSkills, skill];
    }

    setSelectedSkills(newSkills);
    validateSkillsInput(newSkills);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Final validation
    const handleValid = validateHandleInput(handle);
    const skillsValid = validateSkillsInput(selectedSkills);

    if (!handleValid || !skillsValid) {
      setError('Please fix the validation errors above');
      return;
    }

    if (!signMessage) {
      setError('Wallet does not support message signing');
      return;
    }

    setIsCreating(true);

    try {
      await createProfile(handle, selectedSkills, signMessage);
      onProfileCreated();
    } catch (err) {
      console.error('Profile creation failed:', err);
      setError(err instanceof Error ? err.message : 'Failed to create profile');
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="operator-card rounded-lg p-6 space-y-6">
      <div className="space-y-2">
        <h2 className="text-xl font-bold text-[var(--color-primary)]">
          Create Operator Profile
        </h2>
        <p className="text-sm text-[var(--color-text-muted)]">
          Establish your identity in the Operator Network
        </p>
        <div className="text-xs text-[var(--color-text-muted)] font-mono">
          Wallet: {walletAddress.slice(0, 8)}...{walletAddress.slice(-8)}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Handle Input */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-white">
            Operator Handle *
          </label>
          <input
            type="text"
            value={handle}
            onChange={(e) => {
              setHandle(e.target.value);
              validateHandleInput(e.target.value);
            }}
            placeholder="Enter your handle (3-20 characters)"
            className={`w-full px-3 py-2 bg-[var(--color-surface)] border rounded-lg text-white placeholder-[var(--color-text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] ${
              validationErrors.handle
                ? 'border-red-500 focus:ring-red-500'
                : 'border-[var(--color-primary)]/30'
            }`}
            disabled={isCreating}
          />
          {validationErrors.handle && (
            <p className="text-sm text-red-400">{validationErrors.handle}</p>
          )}
          <p className="text-xs text-[var(--color-text-muted)]">
            Letters, numbers, and underscores only. Must be unique.
          </p>
        </div>

        {/* Skills Selection */}
        <div className="space-y-3">
          <label className="block text-sm font-medium text-white">
            Skills * (Select 1-5)
          </label>
          <div className="grid grid-cols-2 gap-2">
            {availableSkills.map((skill) => (
              <button
                key={skill}
                type="button"
                onClick={() => handleSkillToggle(skill)}
                disabled={isCreating}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                  selectedSkills.includes(skill)
                    ? 'bg-[var(--color-primary)] text-black'
                    : 'bg-[var(--color-surface)] text-[var(--color-text-muted)] border border-[var(--color-primary)]/30 hover:bg-[var(--color-primary)]/10'
                }`}
              >
                {skill}
              </button>
            ))}
          </div>
          {validationErrors.skills && (
            <p className="text-sm text-red-400">{validationErrors.skills}</p>
          )}
          <p className="text-xs text-[var(--color-text-muted)]">
            Choose skills that represent your expertise and interests.
          </p>
        </div>

        {/* Security Notice */}
        <div className="bg-[var(--color-primary)]/10 border border-[var(--color-primary)]/30 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <div className="w-2 h-2 bg-[var(--color-primary)] rounded-full mt-2"></div>
            <div className="space-y-1">
              <div className="text-sm font-medium text-[var(--color-primary)]">
                Signature Required
              </div>
              <div className="text-xs text-[var(--color-text-muted)]">
                You'll be asked to sign a message to verify ownership of this wallet.
                This ensures only you can create a profile for this address.
              </div>
            </div>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-900/50 border border-red-500/50 rounded-lg p-4">
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
              <span className="text-red-300 text-sm">{error}</span>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex space-x-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={isCreating}
            className="px-4 py-2 bg-[var(--color-surface)] text-[var(--color-text-muted)] rounded border border-[var(--color-primary)]/30 hover:bg-[var(--color-primary)]/10 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isCreating || !handle || selectedSkills.length === 0 || !!validationErrors.handle || !!validationErrors.skills}
            className="flex-1 px-4 py-2 bg-[var(--color-primary)] text-black rounded font-medium hover:bg-[var(--color-primary)]/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isCreating ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                <span>Creating Profile...</span>
              </div>
            ) : (
              'Create Profile'
            )}
          </button>
        </div>
      </form>
    </div>
  );
}