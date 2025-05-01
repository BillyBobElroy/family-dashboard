'use client';

import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { doc, getDoc, updateDoc, collection, getDocs } from 'firebase/firestore';
import { useFirebaseUser } from '@/hook/useFirebaseUser';
import { sendFamilyInvite } from '@/lib/invite-utils';

type Props = {
  onClose: () => void;
};

type FamilyMember = {
  id: string;
  displayName: string;
  role: string;
  color?: string;
};

const presetColors = [
  '#3B82F6', // Blue
  '#10B981', // Green
  '#F59E0B', // Amber
  '#EF4444', // Red
  '#8B5CF6', // Violet
  '#EC4899', // Pink
  '#0EA5E9', // Sky
  '#F97316', // Orange
];

export function FamilySettingsModal({ onClose }: Props) {
  const { user } = useFirebaseUser();
  const [familyName, setFamilyName] = useState('');
  const [members, setMembers] = useState<FamilyMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null);
  const [displayNameInput, setDisplayNameInput] = useState('');
  const [savingDisplayName, setSavingDisplayName] = useState(false);

  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteLink, setInviteLink] = useState('');
  const [inviteError, setInviteError] = useState('');

  useEffect(() => {
    if (!user?.familyId) return;

    const fetchData = async () => {
      if (!user.familyId) return;
      const familyDoc = await getDoc(doc(db, 'families', user.familyId));
      if (familyDoc.exists()) {
        setFamilyName(familyDoc.data().name);
      }

      const membersSnap = await getDocs(collection(db, `families/${user.familyId}/members`));
      const memberList: FamilyMember[] = membersSnap.docs.map(doc => ({
        id: doc.id,
        ...(doc.data() as Omit<FamilyMember, 'id'>),
      }));

      setMembers(memberList);

      const currentMember = memberList.find(m => m.id === user.uid);
      setDisplayNameInput(currentMember?.displayName ?? '');
      setLoading(false);
    };

    fetchData();
  }, [user]);

  const handleUpdateFamilyName = async () => {
    if (!user?.familyId || !familyName.trim()) return;
    await updateDoc(doc(db, 'families', user.familyId), {
      name: familyName.trim(),
    });
    onClose();
  };

  const handleSendInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.familyId || !inviteEmail) return;

    try {
      const inviteId = await sendFamilyInvite(inviteEmail, user.familyId, user.uid);
      const url = `${window.location.origin}/invite/${inviteId}`;
      setInviteLink(url);
      setInviteEmail('');
      setInviteError('');
    } catch (err) {
      console.error(err);
      setInviteError('Failed to send invite.');
    }
  };

  const handleUpdateDisplayName = async () => {
    if (!user || !user.familyId || !displayNameInput.trim()) return;

    setSavingDisplayName(true);
    try {
      const newName = displayNameInput.trim();

      await updateDoc(doc(db, 'users', user.uid), {
        displayName: newName,
      });

      await updateDoc(doc(db, `families/${user.familyId}/members/${user.uid}`), {
        displayName: newName,
      });

      window.dispatchEvent(new CustomEvent('user-display-name-updated', { detail: newName }));
    } catch (err) {
      console.error('Failed to update display name:', err);
    } finally {
      setSavingDisplayName(false);
    }
  };

  const handleColorChange = async (newColor: string) => {
    if (!user?.familyId || !user?.uid) return;

    await updateDoc(doc(db, `families/${user.familyId}/members/${user.uid}`), {
      color: newColor,
    });

    setMembers(prev =>
      prev.map(m => (m.id === user.uid ? { ...m, color: newColor } : m))
    );
  };

  if (loading) return null;

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center">
      <div className="bg-white rounded-xl p-6 shadow-lg w-full max-w-lg space-y-6 relative">
        <button onClick={onClose} className="absolute top-3 right-3 text-gray-500 hover:text-black text-xl">&times;</button>

        <h2 className="text-xl font-bold">Manage Family</h2>

        {/* Family Name */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Family Name</label>
          <input
            type="text"
            value={familyName}
            onChange={(e) => setFamilyName(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded"
          />
          <button
            onClick={handleUpdateFamilyName}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
          >
            Save Family Name
          </button>
        </div>

        {/* Member List */}
        <div>
          <h3 className="text-md font-semibold mb-2">Family Members</h3>
          <ul className="space-y-2">
            {members.map((m) => {
              const isSelected = selectedMemberId === m.id;
              const initial = m.displayName?.charAt(0).toUpperCase() || '?';

              return (
                <li
                  key={m.id}
                  onClick={() => setSelectedMemberId(m.id)}
                  className={`flex items-center justify-between p-2 rounded cursor-pointer ${
                    isSelected ? 'bg-blue-50' : 'hover:bg-gray-100'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center font-bold"
                      style={{ backgroundColor: m.color || '#E0F2FE', color: '#1E3A8A' }}
                    >
                      {initial}
                    </div>
                    <span>{m.displayName || 'Unnamed'}</span>
                  </div>
                  <span className="text-gray-500 text-sm">{m.role}</span>
                </li>
              );
            })}
          </ul>
        </div>

        {/* Current User Display Name + Color Editor */}
        {selectedMemberId === user?.uid && (
          <div className="space-y-4 pt-4 border-t">
            <div className="space-y-2">
              <label className="text-sm font-medium">Your Display Name</label>
              <input
                type="text"
                value={displayNameInput}
                onChange={(e) => setDisplayNameInput(e.target.value)}
                placeholder="e.g., Alex"
                className="w-full p-2 border border-gray-300 rounded"
              />
              <button
                onClick={handleUpdateDisplayName}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
                disabled={savingDisplayName}
              >
                {savingDisplayName ? 'Saving…' : 'Save Display Name'}
              </button>
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium">Choose Your Color</label>
              <div className="flex flex-wrap gap-2">
                {presetColors.map((color) => {
                  const isSelected = members.find(m => m.id === user?.uid)?.color === color;
                  return (
                    <button
                      key={color}
                      onClick={() => handleColorChange(color)}
                      className={`w-8 h-8 rounded-full border-2 transition-all duration-150 ${
                        isSelected ? 'border-black' : 'border-transparent'
                      }`}
                      style={{ backgroundColor: color }}
                      aria-label={`Select ${color}`}
                      type="button"
                    />
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Invite Form */}
        <div className="pt-4 border-t">
          <h3 className="text-md font-semibold mb-2">Invite Someone</h3>
          <form onSubmit={handleSendInvite} className="space-y-2">
            <input
              type="email"
              placeholder="Email address"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded"
              required
            />
            <button
              type="submit"
              className="bg-blue-600 text-white px-4 py-2 rounded w-full hover:bg-blue-700"
            >
              Send Invite
            </button>
            {inviteLink && (
              <p className="text-sm text-green-600 break-all">
                Invite sent: <a href={inviteLink} className="underline">{inviteLink}</a>
              </p>
            )}
            {inviteError && <p className="text-sm text-red-500">{inviteError}</p>}
          </form>
        </div>
      </div>
    </div>
  );
}