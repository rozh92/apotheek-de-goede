import React, { useState, useMemo } from 'react';
import { Search, Plus, User, Phone, Mail, MapPin, Trash2, Edit2, Star, Folder, ArrowLeft, ChevronRight, Pencil, FolderPlus, Home } from 'lucide-react';
import { Contact, SortOption, Folder as IFolder } from '../types';
import { GENERAL_CONTACT_FOLDER_ID } from '../constants';

interface ContactsManagerProps {
  contacts: Contact[];
  folders: IFolder[];
  onAddContact: (contact: Omit<Contact, 'id' | 'createdAt' | 'isFavorite'>) => void;
  onDeleteContact: (id: string) => void;
  onUpdateContact: (contact: Contact) => void;
  onToggleFavorite: (id: string) => void;
  onAddFolder: (name: string, parentId: string | null) => void;
  onRenameFolder: (id: string, newName: string) => void;
  onDeleteFolder: (id: string) => void;
}

export const ContactsManager: React.FC<ContactsManagerProps> = ({
  contacts,
  folders,
  onAddContact,
  onDeleteContact,
  onUpdateContact,
  onToggleFavorite,
  onAddFolder,
  onRenameFolder,
  onDeleteFolder
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFolderId, setActiveFolderId] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<SortOption>('ALPHABETICAL');
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    function: '',
    folderId: '',
    phone: '',
    email: '',
    address: '',
    notes: ''
  });

  // Derived state
  const activeFolder = folders.find(f => f.id === activeFolderId);
  const subFolders = folders.filter(f => f.parentId === activeFolderId);
  const currentContacts = contacts.filter(c => c.folderId === activeFolderId);

  const getFolderContactCount = (folderId: string) => contacts.filter(c => c.folderId === folderId).length;

  const filteredContacts = useMemo(() => {
    if (searchTerm) {
       return contacts.filter(c => {
        const term = searchTerm.toLowerCase();
        return c.name.toLowerCase().includes(term) || 
               c.function.toLowerCase().includes(term) ||
               c.notes.toLowerCase().includes(term);
      });
    }
    return currentContacts;
  }, [contacts, searchTerm, activeFolderId, currentContacts]);

  const sortedContacts = useMemo(() => {
    return [...filteredContacts].sort((a, b) => {
      if (sortBy === 'ALPHABETICAL') return a.name.localeCompare(b.name);
      if (sortBy === 'NEWEST') return b.createdAt - a.createdAt;
      if (sortBy === 'OLDEST') return a.createdAt - b.createdAt;
      return 0;
    });
  }, [filteredContacts, sortBy]);

  // Breadcrumbs
  const breadcrumbs = useMemo(() => {
    const crumbs = [];
    let current = activeFolder;
    while (current) {
      crumbs.unshift(current);
      current = folders.find(f => f.id === current.parentId);
    }
    return crumbs;
  }, [activeFolder, folders]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isEditing && editId) {
      const original = contacts.find(c => c.id === editId);
      if (original) {
        onUpdateContact({
          ...original,
          ...formData
        });
      }
    } else {
      onAddContact({
        ...formData,
        folderId: formData.folderId || GENERAL_CONTACT_FOLDER_ID
      });
    }
    closeModal();
  };

  const openAddModal = () => {
    setIsEditing(false);
    setEditId(null);
    setFormData({ 
      name: '', 
      function: '', 
      folderId: activeFolderId || GENERAL_CONTACT_FOLDER_ID, 
      phone: '', 
      email: '', 
      address: '', 
      notes: '' 
    });
    setIsModalOpen(true);
  };

  const openEditModal = (contact: Contact) => {
    setIsEditing(true);
    setEditId(contact.id);
    setFormData({
      name: contact.name,
      function: contact.function,
      folderId: contact.folderId,
      phone: contact.phone || '',
      email: contact.email || '',
      address: contact.address || '',
      notes: contact.notes
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setIsEditing(false);
    setEditId(null);
  };

  const handleRenameFolderReq = (folder: IFolder) => {
    const newName = prompt("Nieuwe naam voor map:", folder.name);
    if (newName && newName !== folder.name) {
      onRenameFolder(folder.id, newName);
    }
  };

  const handleDeleteFolderReq = (folder: IFolder) => {
    if (folder.id === GENERAL_CONTACT_FOLDER_ID) {
      alert("De map 'Overig' kan niet verwijderd worden.");
      return;
    }
    if (confirm(`Weet je zeker dat je de map '${folder.name}' wilt verwijderen?\nAlle submappen en contacten worden verplaatst naar 'Overig'.`)) {
      onDeleteFolder(folder.id);
      if (activeFolderId === folder.id) setActiveFolderId(folder.parentId);
    }
  };

  const handleAddFolderReq = () => {
    const name = prompt("Naam van de nieuwe map:");
    if (name) onAddFolder(name, activeFolderId);
  };

  const renderFolderOptions = (parentId: string | null = null, depth = 0) => {
    const children = folders.filter(f => f.parentId === parentId);
    return children.map(f => (
      <React.Fragment key={f.id}>
        <option value={f.id}>
          {'\u00A0\u00A0'.repeat(depth)} {f.name}
        </option>
        {renderFolderOptions(f.id, depth + 1)}
      </React.Fragment>
    ));
  };

  return (
    <div className="flex flex-col h-full bg-apotheek-main">
      <div className="bg-white p-6 border-b border-gray-200 shadow-sm">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
             <h2 className="text-2xl font-bold text-gray-800">Contacten</h2>
             <div className="flex items-center gap-2 text-sm text-gray-500 mt-1 flex-wrap">
               <button 
                  onClick={() => setActiveFolderId(null)}
                  className={`flex items-center hover:text-apotheek-teal ${!activeFolderId ? 'font-bold text-apotheek-teal' : ''}`}
               >
                 <Home size={14} className="mr-1" /> Contacten
               </button>
               {breadcrumbs.map(crumb => (
                 <React.Fragment key={crumb.id}>
                   <ChevronRight size={14} />
                   <button 
                      onClick={() => setActiveFolderId(crumb.id)}
                      className={`hover:text-apotheek-teal ${activeFolderId === crumb.id ? 'font-bold text-apotheek-teal' : ''}`}
                   >
                     {crumb.name}
                   </button>
                 </React.Fragment>
               ))}
               {searchTerm && <><ChevronRight size={14} /> <span>Zoeken: "{searchTerm}"</span></>}
             </div>
          </div>
          <button 
            onClick={openAddModal}
            className="bg-apotheek-teal hover:bg-apotheek-darkTeal text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors shadow-sm"
          >
            <Plus size={20} />
            Nieuw Contact
          </button>
        </div>

        <div className="mt-6 flex flex-col md:flex-row gap-4">
           {activeFolderId && !searchTerm && (
            <button 
              onClick={() => setActiveFolderId(activeFolder?.parentId || null)}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
            >
              <ArrowLeft size={18} /> Omhoog
            </button>
          )}

          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input 
              type="text" 
              placeholder="Zoek in alle mappen op naam, functie..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-apotheek-teal outline-none"
            />
          </div>
           <select 
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-apotheek-teal outline-none bg-white text-gray-700"
            >
              <option value="ALPHABETICAL">A-Z</option>
              <option value="NEWEST">Nieuwst toegevoegd</option>
              <option value="OLDEST">Oudst toegevoegd</option>
            </select>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        
        {/* Folder View */}
        {!searchTerm && (
           <div className="mb-8">
            <div className="flex justify-between items-center mb-4">
               <h3 className="text-lg font-semibold text-gray-700">
                 {activeFolderId ? `Mappen in '${activeFolder?.name}'` : 'Hoofdmappen'}
               </h3>
            </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {subFolders.map(folder => (
              <div key={folder.id} className="group relative">
                <button 
                  onClick={() => setActiveFolderId(folder.id)}
                  className="w-full bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md hover:border-apotheek-teal/50 transition-all flex flex-col items-center text-center gap-3"
                >
                  <div className="bg-apotheek-light p-4 rounded-full group-hover:scale-110 transition-transform">
                    <Folder className="text-apotheek-teal w-8 h-8" fill="currentColor" fillOpacity={0.2} />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-800 group-hover:text-apotheek-teal truncate max-w-[150px]">{folder.name}</h3>
                    <p className="text-xs text-gray-500 mt-1">{getFolderContactCount(folder.id)} contacten</p>
                  </div>
                </button>
                {/* Folder Actions */}
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1 bg-white/80 p-1 rounded-lg backdrop-blur-sm">
                   <button 
                      onClick={(e) => { e.stopPropagation(); handleRenameFolderReq(folder); }} 
                      className="p-1.5 text-gray-500 hover:text-apotheek-teal"
                      title="Naam wijzigen"
                   >
                     <Pencil size={14} />
                   </button>
                   <button 
                      onClick={(e) => { e.stopPropagation(); handleDeleteFolderReq(folder); }}
                      className="p-1.5 text-gray-500 hover:text-red-500"
                      title="Map verwijderen"
                   >
                     <Trash2 size={14} />
                   </button>
                </div>
              </div>
            ))}

            {/* New Folder Button */}
            <button 
              onClick={handleAddFolderReq}
              className="bg-gray-50 p-6 rounded-xl border-2 border-dashed border-gray-300 hover:border-apotheek-teal hover:bg-apotheek-light/30 transition-all flex flex-col items-center justify-center gap-3 text-gray-400 hover:text-apotheek-teal"
            >
              <FolderPlus size={32} />
              <span className="font-medium text-sm">Nieuwe Map</span>
            </button>
          </div>
          </div>
        )}

        {/* Contacts Grid */}
        <h3 className="text-lg font-semibold text-gray-700 mb-4">
          {searchTerm ? 'Zoekresultaten' : (activeFolderId ? `Contacten in '${activeFolder?.name}'` : 'Contacten in hoofdmap')}
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {sortedContacts.map((contact) => (
            <div key={contact.id} className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow relative">
              
              <div className="absolute top-4 right-4 flex gap-1">
                  <button 
                    onClick={() => onToggleFavorite(contact.id)}
                    className={`p-1.5 rounded-md transition-colors ${contact.isFavorite ? 'text-yellow-400 hover:text-yellow-500' : 'text-gray-300 hover:text-yellow-400'}`}
                  >
                    <Star size={18} fill={contact.isFavorite ? "currentColor" : "none"} />
                  </button>
                  <button 
                    onClick={() => openEditModal(contact)}
                    className="p-1.5 text-gray-300 hover:text-apotheek-teal transition-colors"
                  >
                    <Edit2 size={18} />
                  </button>
              </div>

              <div className="p-5 flex items-start gap-4">
                <div className="p-3 bg-apotheek-light text-apotheek-teal rounded-full mt-1">
                  <User size={28} />
                </div>
                <div className="flex-1 min-w-0 pr-8">
                  <div>
                    <h3 className="text-lg font-bold text-gray-800 truncate">{contact.name}</h3>
                    <p className="text-apotheek-teal font-medium text-sm">{contact.function}</p>
                    <span className="text-xs text-gray-400 border border-gray-200 rounded px-1.5 py-0.5 mt-1 inline-block">
                       {folders.find(f => f.id === contact.folderId)?.name}
                    </span>
                  </div>

                  <div className="mt-4 space-y-2">
                    {contact.phone && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Phone size={16} className="text-gray-400" />
                        <a href={`tel:${contact.phone}`} className="hover:text-apotheek-teal hover:underline">{contact.phone}</a>
                      </div>
                    )}
                    {contact.email && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Mail size={16} className="text-gray-400" />
                        <a href={`mailto:${contact.email}`} className="hover:text-apotheek-teal hover:underline truncate">{contact.email}</a>
                      </div>
                    )}
                    {contact.address && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <MapPin size={16} className="text-gray-400" />
                        <span className="truncate">{contact.address}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="bg-apotheek-main p-4 rounded-b-xl border-t border-gray-100 flex justify-between items-center">
                  <p className="text-sm text-gray-600 italic truncate max-w-[80%]">
                    {contact.notes ? `"${contact.notes}"` : <span className="opacity-50">Geen notities</span>}
                  </p>
                  <button 
                      onClick={() => onDeleteContact(contact.id)}
                      className="text-gray-300 hover:text-red-500 transition-colors"
                    >
                      <Trash2 size={18} />
                    </button>
              </div>
            </div>
          ))}
          
          {sortedContacts.length === 0 && !searchTerm && (
            <div className="col-span-full flex flex-col items-center justify-center py-6 text-gray-400">
              <p>Geen contacten in deze map.</p>
            </div>
          )}
        </div>
      </div>

       {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden">
            <div className="p-4 border-b border-gray-100 bg-apotheek-teal text-white flex justify-between items-center">
              <h3 className="font-bold">{isEditing ? 'Contact Wijzigen' : 'Nieuw Contact Toevoegen'}</h3>
              <button onClick={closeModal} className="hover:bg-white/20 p-1 rounded">X</button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                 <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Naam *</label>
                  <input 
                    required
                    type="text" 
                    value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                    placeholder="Dr. Jansen"
                    className="w-full border border-gray-300 rounded-lg p-2 focus:ring-1 focus:ring-apotheek-teal outline-none"
                  />
                </div>
                 <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Functie *</label>
                  <input 
                    required
                    type="text" 
                    value={formData.function}
                    onChange={e => setFormData({...formData, function: e.target.value})}
                    placeholder="Huisarts, Chirurg"
                    className="w-full border border-gray-300 rounded-lg p-2 focus:ring-1 focus:ring-apotheek-teal outline-none"
                  />
                </div>
              </div>

              <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Map</label>
                  <select 
                    value={formData.folderId}
                    onChange={e => setFormData({...formData, folderId: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg p-2 outline-none"
                  >
                    {renderFolderOptions(null)}
                  </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Telefoonnummer</label>
                <input 
                  type="tel" 
                  value={formData.phone}
                  onChange={e => setFormData({...formData, phone: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg p-2 outline-none"
                />
              </div>

               <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input 
                  type="email" 
                  value={formData.email}
                  onChange={e => setFormData({...formData, email: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg p-2 outline-none"
                />
              </div>

               <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Adres</label>
                <input 
                  type="text" 
                  value={formData.address}
                  onChange={e => setFormData({...formData, address: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg p-2 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notities</label>
                <textarea 
                  value={formData.notes}
                  onChange={e => setFormData({...formData, notes: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg p-2 outline-none h-20 resize-none"
                  placeholder="Beschikbaarheid, voorkeuren, etc."
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button 
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                >
                  Annuleren
                </button>
                <button 
                  type="submit"
                  className="px-4 py-2 bg-apotheek-teal text-white rounded-lg hover:bg-apotheek-darkTeal"
                >
                  {isEditing ? 'Wijzigen' : 'Toevoegen'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
