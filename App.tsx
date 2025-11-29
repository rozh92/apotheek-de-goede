import React, { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { DocumentsManager } from './components/DocumentsManager';
import { ContactsManager } from './components/ContactsManager';
import { TeamNotes } from './components/TeamNotes';
import { FavoritesView } from './components/FavoritesView';
import { SettingsManager } from './components/SettingsManager';
import { GeminiAssistant } from './components/GeminiAssistant';
import { LoginScreen } from './components/LoginScreen';
import { AppView, AppDocument, Contact, TeamNote, Folder, TeamMember } from './types';
import { 
  INITIAL_CONTACTS, 
  INITIAL_DOCUMENTS, 
  INITIAL_NOTES, 
  INITIAL_DOC_FOLDERS, 
  INITIAL_CONTACT_FOLDERS,
  GENERAL_DOC_FOLDER_ID,
  GENERAL_CONTACT_FOLDER_ID,
  INITIAL_TEAM_MEMBERS,
  APP_PASSWORD
} from './constants';

const generateId = () => Math.random().toString(36).substr(2, 9);

const App: React.FC = () => {
  // Auth State
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authError, setAuthError] = useState(false);
  
  // Dynamic Team Password (starts with default constant, can be changed by manager)
  const [teamPassword, setTeamPassword] = useState(APP_PASSWORD);

  const [currentView, setCurrentView] = useState<AppView>(AppView.DOCUMENTS);
  
  // Data State
  const [documents, setDocuments] = useState<AppDocument[]>(INITIAL_DOCUMENTS);
  const [contacts, setContacts] = useState<Contact[]>(INITIAL_CONTACTS);
  const [notes, setNotes] = useState<TeamNote[]>(INITIAL_NOTES);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>(INITIAL_TEAM_MEMBERS);

  // Folder State
  const [docFolders, setDocFolders] = useState<Folder[]>(INITIAL_DOC_FOLDERS);
  const [contactFolders, setContactFolders] = useState<Folder[]>(INITIAL_CONTACT_FOLDERS);

  // --- Auth Handler ---
  const handleLogin = (password: string) => {
    // Check against the current state password, not just the constant
    if (password === teamPassword) {
      setIsAuthenticated(true);
      setAuthError(false);
    } else {
      setAuthError(true);
    }
  };

  // --- Folder Logic Helpers ---
  
  const addFolder = (setFolders: React.Dispatch<React.SetStateAction<Folder[]>>, name: string, parentId: string | null) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    setFolders(prev => [...prev, { id: generateId(), name: trimmed, parentId }]);
  };

  const renameFolder = (setFolders: React.Dispatch<React.SetStateAction<Folder[]>>, id: string, newName: string) => {
    const trimmed = newName.trim();
    if (!trimmed) return;
    setFolders(prev => prev.map(f => f.id === id ? { ...f, name: trimmed } : f));
  };

  const deleteFolderRecursive = (
    folders: Folder[], 
    folderIdToDelete: string, 
    fallbackFolderId: string,
    itemType: 'DOCS' | 'CONTACTS'
  ) => {
    // 1. Identify all folders to delete (the target + all descendants)
    const foldersToDelete = new Set<string>();
    const stack = [folderIdToDelete];
    
    while (stack.length > 0) {
      const currentId = stack.pop()!;
      foldersToDelete.add(currentId);
      // Find children
      const children = folders.filter(f => f.parentId === currentId);
      children.forEach(c => stack.push(c.id));
    }

    // 2. Move items from these folders to fallback
    if (itemType === 'DOCS') {
      setDocuments(prev => prev.map(d => foldersToDelete.has(d.folderId) ? { ...d, folderId: fallbackFolderId } : d));
    } else {
      setContacts(prev => prev.map(c => foldersToDelete.has(c.folderId) ? { ...c, folderId: fallbackFolderId } : c));
    }

    // 3. Remove folders
    return folders.filter(f => !foldersToDelete.has(f.id));
  };

  // --- Document Folder Handlers ---
  const handleAddDocFolder = (name: string, parentId: string | null) => addFolder(setDocFolders, name, parentId);
  const handleRenameDocFolder = (id: string, newName: string) => renameFolder(setDocFolders, id, newName);
  const handleDeleteDocFolder = (id: string) => {
    if (id === GENERAL_DOC_FOLDER_ID) return;
    setDocFolders(prev => deleteFolderRecursive(prev, id, GENERAL_DOC_FOLDER_ID, 'DOCS'));
  };

  // --- Contact Folder Handlers ---
  const handleAddContactFolder = (name: string, parentId: string | null) => addFolder(setContactFolders, name, parentId);
  const handleRenameContactFolder = (id: string, newName: string) => renameFolder(setContactFolders, id, newName);
  const handleDeleteContactFolder = (id: string) => {
    if (id === GENERAL_CONTACT_FOLDER_ID) return;
    setContactFolders(prev => deleteFolderRecursive(prev, id, GENERAL_CONTACT_FOLDER_ID, 'CONTACTS'));
  };

  // --- Item Handlers ---

  // Document Handlers
  const handleAddDocument = (doc: Omit<AppDocument, 'id' | 'createdAt' | 'isFavorite'>) => {
    const newDoc: AppDocument = { ...doc, id: generateId(), createdAt: Date.now(), isFavorite: false };
    setDocuments(prev => [newDoc, ...prev]);
  };
  const handleDeleteDocument = (id: string) => {
    if (confirm('Weet je zeker dat je dit document wilt verwijderen?')) {
        setDocuments(prev => prev.filter(d => d.id !== id));
    }
  };
  const handleUpdateDocument = (updatedDoc: AppDocument) => {
    setDocuments(prev => prev.map(d => d.id === updatedDoc.id ? updatedDoc : d));
  };
  const handleToggleFavoriteDoc = (id: string) => {
    setDocuments(prev => prev.map(d => d.id === id ? { ...d, isFavorite: !d.isFavorite } : d));
  };

  // Contact Handlers
  const handleAddContact = (contact: Omit<Contact, 'id' | 'createdAt' | 'isFavorite'>) => {
    const newContact: Contact = { ...contact, id: generateId(), createdAt: Date.now(), isFavorite: false };
    setContacts(prev => [newContact, ...prev]);
  };
  const handleDeleteContact = (id: string) => {
    if (confirm('Weet je zeker dat je dit contact wilt verwijderen?')) {
        setContacts(prev => prev.filter(c => c.id !== id));
    }
  };
  const handleUpdateContact = (updatedContact: Contact) => {
    setContacts(prev => prev.map(c => c.id === updatedContact.id ? updatedContact : c));
  };
  const handleToggleFavoriteContact = (id: string) => {
    setContacts(prev => prev.map(c => c.id === id ? { ...c, isFavorite: !c.isFavorite } : c));
  };

  // Note Handlers
  const handleAddNote = (note: Omit<TeamNote, 'id' | 'createdAt'>) => {
    const newNote: TeamNote = { ...note, id: generateId(), createdAt: Date.now() };
    setNotes(prev => [newNote, ...prev]);
  };
  const handleDeleteNote = (id: string) => {
    setNotes(prev => prev.filter(n => n.id !== id));
  };
  const handleUpdateNote = (updatedNote: TeamNote) => {
    setNotes(prev => prev.map(n => n.id === updatedNote.id ? updatedNote : n));
  };

  // Team Member Handlers
  const handleAddTeamMember = (member: Omit<TeamMember, 'id'>) => {
    const newMember: TeamMember = { ...member, id: generateId() };
    setTeamMembers(prev => [...prev, newMember]);
  };
  const handleDeleteTeamMember = (id: string) => {
    if (confirm('Weet je zeker dat je deze medewerker wilt verwijderen?')) {
      setTeamMembers(prev => prev.filter(m => m.id !== id));
    }
  };
  const handleUpdateTeamMember = (updatedMember: TeamMember) => {
    setTeamMembers(prev => prev.map(m => m.id === updatedMember.id ? updatedMember : m));
  };

  // If not logged in, show login screen
  if (!isAuthenticated) {
    return <LoginScreen onLogin={handleLogin} error={authError} />;
  }

  return (
    <div className="flex h-screen w-full bg-apotheek-main">
      <Sidebar currentView={currentView} onChangeView={setCurrentView} />
      
      <main className="flex-1 overflow-hidden relative">
        {currentView === AppView.DOCUMENTS && (
          <DocumentsManager 
            documents={documents}
            folders={docFolders}
            onAddDocument={handleAddDocument}
            onAddContact={handleAddContact}
            onDeleteDocument={handleDeleteDocument}
            onUpdateDocument={handleUpdateDocument}
            onToggleFavorite={handleToggleFavoriteDoc}
            onAddFolder={handleAddDocFolder}
            onRenameFolder={handleRenameDocFolder}
            onDeleteFolder={handleDeleteDocFolder}
          />
        )}
        {currentView === AppView.CONTACTS && (
          <ContactsManager 
            contacts={contacts}
            folders={contactFolders}
            onAddContact={handleAddContact}
            onDeleteContact={handleDeleteContact}
            onUpdateContact={handleUpdateContact}
            onToggleFavorite={handleToggleFavoriteContact}
            onAddFolder={handleAddContactFolder}
            onRenameFolder={handleRenameContactFolder}
            onDeleteFolder={handleDeleteContactFolder}
          />
        )}
        {currentView === AppView.TEAM_NOTES && (
          <TeamNotes 
            notes={notes}
            teamMembers={teamMembers}
            onAddNote={handleAddNote}
            onDeleteNote={handleDeleteNote}
            onUpdateNote={handleUpdateNote}
          />
        )}
        {currentView === AppView.FAVORITES && (
          <FavoritesView 
            documents={documents}
            contacts={contacts}
            docFolders={docFolders}
            contactFolders={contactFolders}
            onToggleFavoriteDoc={handleToggleFavoriteDoc}
            onToggleFavoriteContact={handleToggleFavoriteContact}
          />
        )}
        {currentView === AppView.SETTINGS && (
          <SettingsManager 
            teamMembers={teamMembers}
            onAddMember={handleAddTeamMember}
            onDeleteMember={handleDeleteTeamMember}
            onUpdateMember={handleUpdateTeamMember}
            currentTeamPassword={teamPassword}
            onUpdateTeamPassword={setTeamPassword}
          />
        )}
      </main>

      {/* AI Assistant available globally */}
      <GeminiAssistant 
        documents={documents} 
        contacts={contacts} 
        docFolders={docFolders}
        contactFolders={contactFolders}
      />
    </div>
  );
};

export default App;