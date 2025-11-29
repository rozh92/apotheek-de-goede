import React, { useState } from 'react';
import { TeamMember } from '../types';
import { Plus, Trash2, Mail, User, Shield, Lock, Key, Edit2, Save, X, Search } from 'lucide-react';
import { MANAGER_PASSWORD } from '../constants';

interface SettingsManagerProps {
  teamMembers: TeamMember[];
  onAddMember: (member: Omit<TeamMember, 'id'>) => void;
  onDeleteMember: (id: string) => void;
  onUpdateMember: (member: TeamMember) => void;
  currentTeamPassword: string;
  onUpdateTeamPassword: (pass: string) => void;
}

export const SettingsManager: React.FC<SettingsManagerProps> = ({ 
  teamMembers, 
  onAddMember, 
  onDeleteMember,
  onUpdateMember,
  currentTeamPassword,
  onUpdateTeamPassword
}) => {
  const [isManagerAuthenticated, setIsManagerAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [authError, setAuthError] = useState(false);

  // New Member Form
  const [newMemberData, setNewMemberData] = useState({ name: '', email: '' });

  // Edit Member State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState({ name: '', email: '' });

  // Search State
  const [searchTerm, setSearchTerm] = useState('');

  // Password Change State
  const [newTeamPassword, setNewTeamPassword] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleManagerLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput === MANAGER_PASSWORD) {
      setIsManagerAuthenticated(true);
      setAuthError(false);
    } else {
      setAuthError(true);
    }
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMemberData.name || !newMemberData.email) return;
    onAddMember({
      name: newMemberData.name,
      email: newMemberData.email,
      role: 'Medewerker' // Default role, hidden in UI
    });
    setNewMemberData({ name: '', email: '' });
  };

  const startEditing = (member: TeamMember) => {
    setEditingId(member.id);
    setEditData({ name: member.name, email: member.email });
  };

  const saveEditing = (id: string) => {
    const member = teamMembers.find(m => m.id === id);
    if (member) {
      onUpdateMember({ ...member, name: editData.name, email: editData.email });
    }
    setEditingId(null);
  };

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTeamPassword.length < 4) return alert("Wachtwoord te kort");
    onUpdateTeamPassword(newTeamPassword);
    setNewTeamPassword('');
    setSuccessMsg('Team wachtwoord succesvol gewijzigd!');
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const filteredMembers = teamMembers.filter(member => 
    member.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    member.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!isManagerAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-apotheek-main p-4">
        <div className="bg-white p-8 rounded-xl shadow-lg max-w-sm w-full border border-gray-200 text-center">
          <div className="bg-gray-100 p-4 rounded-full w-fit mx-auto mb-4">
            <Lock size={32} className="text-gray-500" />
          </div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Manager Toegang</h2>
          <p className="text-sm text-gray-500 mb-6">Voer het manager-wachtwoord in om instellingen te wijzigen.</p>
          
          <form onSubmit={handleManagerLogin} className="space-y-4">
            <input 
              type="password" 
              value={passwordInput}
              onChange={(e) => setPasswordInput(e.target.value)}
              className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-apotheek-teal outline-none"
              placeholder="Wachtwoord..."
              autoFocus
            />
            {authError && <p className="text-red-500 text-sm">Wachtwoord onjuist.</p>}
            <button type="submit" className="w-full bg-gray-800 text-white py-2 rounded-lg hover:bg-gray-700">
              Verifiëren
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-apotheek-main p-6 overflow-y-auto">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <Shield className="text-apotheek-teal" />
          Instellingen & Beheer
        </h2>
        <p className="text-sm text-gray-500">Beveiligde omgeving voor team- en wachtwoordbeheer.</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        
        {/* Column 1: Team Password */}
        <div className="xl:col-span-1">
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Key size={20} className="text-apotheek-orange" />
              Team Wachtwoord
            </h3>
            <div className="bg-gray-50 p-3 rounded-lg border border-gray-100 mb-4">
              <p className="text-xs text-gray-500 mb-1">Huidig wachtwoord:</p>
              <p className="font-mono font-bold text-lg text-gray-700">{currentTeamPassword}</p>
            </div>
            
            <form onSubmit={handlePasswordChange} className="space-y-3">
              <label className="block text-sm font-medium text-gray-700">Wijzig wachtwoord naar:</label>
              <input 
                type="text" 
                value={newTeamPassword}
                onChange={(e) => setNewTeamPassword(e.target.value)}
                placeholder="Nieuw wachtwoord"
                className="w-full border border-gray-300 rounded-lg p-2 focus:ring-1 focus:ring-apotheek-teal outline-none"
              />
              <button 
                type="submit" 
                disabled={!newTeamPassword}
                className="w-full bg-apotheek-teal text-white py-2 rounded-lg hover:bg-apotheek-darkTeal disabled:opacity-50"
              >
                Opslaan
              </button>
              {successMsg && <p className="text-green-600 text-sm text-center mt-2">{successMsg}</p>}
            </form>
          </div>
        </div>

        {/* Column 2 & 3: Team Members */}
        <div className="xl:col-span-2 space-y-6">
          
          {/* Add New Member */}
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
             <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Plus size={20} className="text-apotheek-teal" />
              Nieuwe Collega Toevoegen
            </h3>
            <form onSubmit={handleAddSubmit} className="flex flex-col md:flex-row gap-4 items-end">
              <div className="flex-1 w-full">
                <label className="block text-sm font-medium text-gray-700 mb-1">Naam</label>
                <input 
                  type="text" 
                  required
                  value={newMemberData.name}
                  onChange={e => setNewMemberData({...newMemberData, name: e.target.value})}
                  placeholder="Bijv. Lisa"
                  className="w-full border border-gray-300 rounded-lg p-2 focus:ring-1 focus:ring-apotheek-teal outline-none"
                />
              </div>
              <div className="flex-1 w-full">
                <label className="block text-sm font-medium text-gray-700 mb-1">E-mailadres</label>
                <input 
                  type="email" 
                  required
                  value={newMemberData.email}
                  onChange={e => setNewMemberData({...newMemberData, email: e.target.value})}
                  placeholder="lisa@apotheek.nl"
                  className="w-full border border-gray-300 rounded-lg p-2 focus:ring-1 focus:ring-apotheek-teal outline-none"
                />
              </div>
              <button 
                type="submit"
                className="bg-gray-800 text-white px-6 py-2 rounded-lg hover:bg-gray-700 w-full md:w-auto"
              >
                Toevoegen
              </button>
            </form>
          </div>

          {/* Member List */}
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
              <User size={20} className="text-apotheek-teal" />
              Teamlijst & E-mails ({teamMembers.length})
            </h3>

            {/* Search Bar */}
            <div className="mb-4 relative">
               <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
               <input 
                 type="text" 
                 value={searchTerm}
                 onChange={(e) => setSearchTerm(e.target.value)}
                 placeholder="Zoek collega..."
                 className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-apotheek-teal outline-none text-sm"
               />
            </div>
            
            <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
              {filteredMembers.map(member => (
                <div key={member.id} className="p-4 rounded-lg border border-gray-100 hover:border-apotheek-teal/30 transition-colors bg-gray-50/50">
                  {editingId === member.id ? (
                    <div className="flex flex-col md:flex-row gap-3 items-center">
                      <input 
                        value={editData.name}
                        onChange={(e) => setEditData({...editData, name: e.target.value})}
                        className="flex-1 border border-gray-300 rounded p-1.5 text-sm"
                      />
                      <input 
                        value={editData.email}
                        onChange={(e) => setEditData({...editData, email: e.target.value})}
                        className="flex-1 border border-gray-300 rounded p-1.5 text-sm"
                      />
                      <div className="flex gap-2">
                        <button onClick={() => saveEditing(member.id)} className="bg-green-500 text-white p-1.5 rounded hover:bg-green-600"><Save size={16}/></button>
                        <button onClick={() => setEditingId(null)} className="bg-gray-400 text-white p-1.5 rounded hover:bg-gray-500"><X size={16}/></button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-bold text-gray-800">{member.name}</p>
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <Mail size={14} />
                          <span>{member.email}</span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button 
                          onClick={() => startEditing(member)}
                          className="text-gray-400 hover:text-apotheek-teal p-2"
                        >
                          <Edit2 size={18} />
                        </button>
                        <button 
                          onClick={() => onDeleteMember(member.id)}
                          className="text-gray-400 hover:text-red-500 p-2"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
              
              {teamMembers.length === 0 && (
                <p className="text-center text-gray-400 italic py-4">Nog geen e-mailadressen toegevoegd.</p>
              )}
               {teamMembers.length > 0 && filteredMembers.length === 0 && (
                <p className="text-center text-gray-400 italic py-4">Geen resultaten gevonden.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
