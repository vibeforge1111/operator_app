import React, { useState, useEffect, useRef } from 'react';
import { OperatorProfile, SKILL_TAGS } from '../types/operator';
import { ChevronLeft, Save, LogOut, Mail, Upload, User } from 'lucide-react';

interface SettingsProps {
  profile: OperatorProfile & { profilePicture?: string };
  onBack: () => void;
  onProfileUpdate: (updates: Partial<OperatorProfile & { profilePicture?: string }>) => void;
  onDisconnect: () => void;
}

export function Settings({ profile, onBack, onProfileUpdate, onDisconnect }: SettingsProps) {
  // Profile settings state
  const [handle, setHandle] = useState(profile.handle);
  const [bio, setBio] = useState(profile.bio || '');
  const [selectedSkills, setSelectedSkills] = useState<string[]>(profile.skills);
  const [profilePicture, setProfilePicture] = useState<string | null>(profile.profilePicture || null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Notification settings state
  const [email, setEmail] = useState('');
  const [emailNotifications, setEmailNotifications] = useState(false);
  const [notificationTypes, setNotificationTypes] = useState({
    operations: true,
    machines: true,
    xpMilestones: true,
  });

  // Form state
  const [hasChanges, setHasChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');

  // Track changes
  useEffect(() => {
    const profileChanged =
      handle !== profile.handle ||
      bio !== (profile.bio || '') ||
      JSON.stringify(selectedSkills) !== JSON.stringify(profile.skills) ||
      profilePicture !== null;

    setHasChanges(profileChanged);
  }, [handle, bio, selectedSkills, profilePicture, profile]);

  const handleProfilePictureChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePicture(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSkillToggle = (skill: string) => {
    setSelectedSkills(prev =>
      prev.includes(skill)
        ? prev.filter(s => s !== skill)
        : [...prev, skill]
    );
  };

  const handleNotificationTypeToggle = (type: keyof typeof notificationTypes) => {
    setNotificationTypes(prev => ({
      ...prev,
      [type]: !prev[type]
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    setSaveMessage('');

    try {
      await onProfileUpdate({
        handle,
        bio,
        skills: selectedSkills,
        profilePicture: profilePicture || undefined
      });

      setSaveMessage('Settings saved successfully!');
      setHasChanges(false);

      // Clear success message after 3 seconds
      setTimeout(() => setSaveMessage(''), 3000);
    } catch (error) {
      setSaveMessage('Error saving settings. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--background)]">
      {/* Header - Aligned with other pages */}
      <div className="px-6 py-4 border-b border-[var(--border)]">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="p-2 hover:bg-[var(--muted)] rounded-lg transition-colors"
            aria-label="Back to dashboard"
          >
            <ChevronLeft className="w-5 h-5 text-[var(--foreground)]" />
          </button>
          <h1 className="text-2xl font-bold text-[var(--foreground)]">Settings</h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="space-y-8">
          {/* Profile Section */}
          <div className="bg-[var(--card)] border border-[var(--border)] rounded-lg p-6">
            <h2 className="text-lg font-semibold text-[var(--foreground)] mb-4">Profile</h2>
            <div className="space-y-4">
              {/* Profile Picture */}
              <div>
                <label className="block text-sm font-medium text-[var(--muted-foreground)] mb-2">
                  Profile Picture
                </label>
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 bg-[var(--muted)] rounded-full flex items-center justify-center overflow-hidden">
                    {profilePicture ? (
                      <img src={profilePicture} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      <User className="w-10 h-10 text-[var(--muted-foreground)]" />
                    )}
                  </div>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-2 px-4 py-2 border border-[var(--border)] rounded-lg hover:bg-[var(--muted)] transition-colors"
                  >
                    <Upload className="w-4 h-4" />
                    Upload Photo
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleProfilePictureChange}
                    className="hidden"
                  />
                </div>
              </div>

              {/* Handle */}
              <div>
                <label className="block text-sm font-medium text-[var(--muted-foreground)] mb-1">
                  Handle
                </label>
                <input
                  type="text"
                  value={handle}
                  onChange={(e) => setHandle(e.target.value)}
                  className="w-full px-3 py-2 bg-[var(--background)] border border-[var(--border)] rounded text-[var(--foreground)] focus:border-[var(--foreground)]/50 focus:outline-none"
                  placeholder="your_handle"
                />
              </div>

              {/* Bio */}
              <div>
                <label className="block text-sm font-medium text-[var(--muted-foreground)] mb-1">
                  Bio
                </label>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 bg-[var(--background)] border border-[var(--border)] rounded text-[var(--foreground)] focus:border-[var(--foreground)]/50 focus:outline-none resize-none"
                  placeholder="Tell us about yourself..."
                />
              </div>

              {/* Skills */}
              <div>
                <label className="block text-sm font-medium text-[var(--muted-foreground)] mb-1">
                  Skills
                </label>
                <div className="flex flex-wrap gap-2">
                  {SKILL_TAGS.map(skill => (
                    <button
                      key={skill}
                      onClick={() => handleSkillToggle(skill)}
                      className={`px-3 py-1 rounded-full border text-sm transition-all ${
                        selectedSkills.includes(skill)
                          ? 'bg-[var(--foreground)] text-[var(--background)] border-[var(--foreground)]'
                          : 'bg-[var(--background)] text-[var(--foreground)] border-[var(--border)] hover:border-[var(--foreground)]/50'
                      }`}
                    >
                      {skill}
                    </button>
                  ))}
                </div>
              </div>

              {/* Wallet */}
              <div>
                <label className="block text-sm font-medium text-[var(--muted-foreground)] mb-1">
                  Wallet Address
                </label>
                <div className="px-3 py-2 bg-[var(--muted)] border border-[var(--border)] rounded text-[var(--muted-foreground)] font-mono text-sm">
                  {profile.walletAddress}
                </div>
              </div>
            </div>
          </div>

          {/* Notifications Section */}
          <div className="bg-[var(--card)] border border-[var(--border)] rounded-lg p-6">
            <h2 className="text-lg font-semibold text-[var(--foreground)] mb-4">Notifications</h2>
            <div className="space-y-4">
              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-[var(--muted-foreground)] mb-1">
                  Email Address
                </label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted-foreground)]" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-10 pr-3 py-2 bg-[var(--background)] border border-[var(--border)] rounded text-[var(--foreground)] focus:border-[var(--foreground)]/50 focus:outline-none"
                      placeholder="your@email.com"
                    />
                  </div>
                </div>
              </div>

              {/* Email Notifications Toggle */}
              <div className="space-y-3">
                <label className="flex items-center justify-between cursor-pointer">
                  <span className="text-sm text-[var(--foreground)]">Email Notifications</span>
                  <button
                    onClick={() => setEmailNotifications(!emailNotifications)}
                    className={`relative w-11 h-6 rounded-full transition-colors ${
                      emailNotifications ? 'bg-[var(--foreground)]' : 'bg-[var(--muted)]'
                    }`}
                  >
                    <span
                      className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                        emailNotifications ? 'translate-x-5' : ''
                      }`}
                    />
                  </button>
                </label>
              </div>

              {/* Notification Types */}
              <div className="border-t border-[var(--border)] pt-4">
                <p className="text-sm font-medium text-[var(--muted-foreground)] mb-3">Notify me about:</p>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <div className="custom-checkbox">
                      <input
                        type="checkbox"
                        checked={notificationTypes.operations}
                        onChange={() => handleNotificationTypeToggle('operations')}
                      />
                      <span className="checkbox-mark"></span>
                    </div>
                    <span className="text-sm text-[var(--foreground)]">New operations</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <div className="custom-checkbox">
                      <input
                        type="checkbox"
                        checked={notificationTypes.machines}
                        onChange={() => handleNotificationTypeToggle('machines')}
                      />
                      <span className="checkbox-mark"></span>
                    </div>
                    <span className="text-sm text-[var(--foreground)]">Machine updates</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <div className="custom-checkbox">
                      <input
                        type="checkbox"
                        checked={notificationTypes.xpMilestones}
                        onChange={() => handleNotificationTypeToggle('xpMilestones')}
                      />
                      <span className="checkbox-mark"></span>
                    </div>
                    <span className="text-sm text-[var(--foreground)]">XP milestones</span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between items-center">
            <button
              onClick={onDisconnect}
              className="flex items-center gap-2 px-4 py-2 border border-red-500/20 text-red-500 rounded-lg hover:bg-red-500/10 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Disconnect Wallet
            </button>

            <div className="flex items-center gap-3">
              {saveMessage && (
                <span className={`text-sm ${saveMessage.includes('Error') ? 'text-red-500' : 'text-green-500'}`}>
                  {saveMessage}
                </span>
              )}
              <button
                onClick={handleSave}
                disabled={!hasChanges || isSaving}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  hasChanges && !isSaving
                    ? 'bg-[var(--foreground)] text-[var(--background)] hover:opacity-90'
                    : 'bg-[var(--muted)] text-[var(--muted-foreground)] cursor-not-allowed'
                }`}
              >
                {isSaving ? (
                  <>
                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Settings;