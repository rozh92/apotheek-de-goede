import React, { useState, useMemo, useRef } from 'react';
import { Search, Plus, FileText, Link as LinkIcon, Image as ImageIcon, Trash2, Edit2, Star, Download, Upload, Loader2, Folder, ArrowLeft, ChevronRight, Pencil, FolderPlus, Home } from 'lucide-react';
import { AppDocument, Contact, DocumentType, SortOption, Folder as IFolder } from '../types';
import { GoogleGenAI } from "@google/genai";
import { GENERAL_DOC_FOLDER_ID } from '../constants';

interface DocumentsManagerProps {
  documents: AppDocument[];
  folders: IFolder[];
  onAddDocument: (doc: Omit<AppDocument, 'id' | 'createdAt' | 'isFavorite'>) => void;
  onAddContact: (contact: Omit<Contact, 'id' | 'createdAt' | 'isFavorite'>) => void;
  onDeleteDocument: (id: string) => void;
  onUpdateDocument: (doc: AppDocument) => void;
  onToggleFavorite: (id: string) => void;
  onAddFolder: (name: string, parentId: string | null) => void;
  onRenameFolder: (id: string, newName: string) => void;
  onDeleteFolder: (id: string) => void;
}

export const DocumentsManager: React.FC<DocumentsManagerProps> = ({
  documents,
  folders,
  onAddDocument,
  onAddContact,
  onDeleteDocument,
  onUpdateDocument,
  onToggleFavorite,
  onAddFolder,
  onRenameFolder,
  onDeleteFolder
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFolderId, setActiveFolderId] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<SortOption>('NEWEST');
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);

  // Import State
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isImporting, setIsImporting] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    type: DocumentType.PDF,
    folderId: '',
    url: '',
    notes: ''
  });

  // Derived state for navigation
  const activeFolder = folders.find(f => f.id === activeFolderId);
  const subFolders = folders.filter(f => f.parentId === activeFolderId);
  const currentDocs = documents.filter(d => d.folderId === activeFolderId);

  // Calculate stats
  const getFolderDocCount = (folderId: string) => documents.filter(d => d.folderId === folderId).length;

  const filteredDocs = useMemo(() => {
    if (searchTerm) {
      // Global search
      return documents.filter(doc => {
        const matchesSearch = doc.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                              doc.notes.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesSearch;
      });
    }
    // Folder view
    return currentDocs;
  }, [documents, searchTerm, activeFolderId, currentDocs]);

  const sortedDocs = useMemo(() => {
    return [...filteredDocs].sort((a, b) => {
      if (sortBy === 'ALPHABETICAL') return a.title.localeCompare(b.title);
      if (sortBy === 'NEWEST') return b.createdAt - a.createdAt;
      if (sortBy === 'OLDEST') return a.createdAt - b.createdAt;
      return 0;
    });
  }, [filteredDocs, sortBy]);

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

  // Helper logic for 2-step folder selection in Modal
  const getRootFolderId = (folderId: string): string => {
    if (!folderId) return '';
    const folder = folders.find(f => f.id === folderId);
    if (!folder) return '';
    if (folder.parentId === null) return folder.id;
    return getRootFolderId(folder.parentId);
  };

  const rootFolders = folders.filter(f => f.parentId === null);
  // Determine currently selected root based on formData.folderId
  const currentRootId = getRootFolderId(formData.folderId) || (rootFolders.find(f => f.id === GENERAL_DOC_FOLDER_ID)?.id || rootFolders[0]?.id || '');
  
  // Available subfolders for the selected root
  const availableSubfolders = folders.filter(f => f.parentId === currentRootId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isEditing && editId) {
      const originalDoc = documents.find(d => d.id === editId);
      if (originalDoc) {
        onUpdateDocument({
          ...originalDoc,
          ...formData
        });
      }
    } else {
      onAddDocument({
        ...formData,
        folderId: formData.folderId || GENERAL_DOC_FOLDER_ID
      });
    }
    closeModal();
  };

  const openAddModal = () => {
    setIsEditing(false);
    setEditId(null);
    setFormData({ 
      title: '', 
      type: DocumentType.PDF, 
      folderId: activeFolderId || GENERAL_DOC_FOLDER_ID, 
      url: '', 
      notes: '' 
    });
    setIsModalOpen(true);
  };

  const openEditModal = (doc: AppDocument) => {
    setIsEditing(true);
    setEditId(doc.id);
    setFormData({
      title: doc.title,
      type: doc.type,
      folderId: doc.folderId,
      url: doc.url,
      notes: doc.notes
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setIsEditing(false);
    setEditId(null);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !process.env.API_KEY) return;

    setIsImporting(true);
    const reader = new FileReader();
    
    reader.onload = async (event) => {
      const text = event.target?.result as string;
      
      try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const folderNames = folders.map(f => f.name).join(', ');

        const prompt = `
          Analyseer de volgende HTML content.
          1. Haal hyperlinks eruit als documenten.
          2. Haal contacten eruit.
          
          Huidige mappen: ${folderNames}.
          
          Voor elk document, kies een bestaande mapnaam of verzin een nieuwe logische naam.
          
          Return JSON:
          {
            "documents": [{"title": "...", "url": "...", "type": "LINK", "folderName": "..."}],
            "contacts": [{"name": "...", "function": "...", "category": "Overig", "phone": "...", "email": "...", "address": "...", "notes": "..."}]
          }
        `;
        
        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: `HTML CONTENT:\n${text.substring(0, 30000)}`,
          config: {
            systemInstruction: prompt,
            responseMimeType: "application/json"
          }
        });

        const json = JSON.parse(response.text || '{}');
        
        // Process
        if (json.documents) {
          for (const d of json.documents) {
            const folderName = d.folderName || 'Algemeen';
            let targetFolder = folders.find(f => f.name.toLowerCase() === folderName.toLowerCase());
            
            if (!targetFolder) {
              targetFolder = folders.find(f => f.id === GENERAL_DOC_FOLDER_ID);
            }

            onAddDocument({
              title: d.title || 'Geimporteerde Link',
              type: DocumentType.LINK,
              folderId: targetFolder?.id || GENERAL_DOC_FOLDER_ID,
              url: d.url || '#',
              notes: 'Geimporteerd uit HTML bestand'
            });
          }
        }

        if (json.contacts) {
          json.contacts.forEach((c: any) => {
            onAddContact({
              name: c.name || 'Onbekend',
              function: c.function || 'Geimporteerd',
              folderId: 'contact-folder-general', // Fallback for now
              phone: c.phone || '',
              email: c.email || '',
              address: c.address || '',
              notes: c.notes || ''
            });
          });
        }
        
        alert(`Succesvol verwerkt!`);

      } catch (error) {
        console.error(error);
        alert('Er ging iets mis met het verwerken van het bestand.');
      } finally {
        setIsImporting(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    };
    
    reader.readAsText(file);
  };

  const getIcon = (type: DocumentType) => {
    switch (type) {
      case DocumentType.LINK: return <LinkIcon className="text-blue-500" />;
      case DocumentType.JPG: return <ImageIcon className="text-purple-500" />;
      default: return <FileText className="text-apotheek-teal" />;
    }
  };

  const handleDocumentClick = (doc: AppDocument) => {
    if (doc.type === DocumentType.LINK) {
      window.open(doc.url, '_blank');
    } else {
      const element = document.createElement("a");
      const file = new Blob([`Dit is een voorbeeld bestand voor: ${doc.title}\n\nNotities: ${doc.notes}`], {type: 'text/plain'});
      element.href = URL.createObjectURL(file);
      element.download = `${doc.title}.txt`;
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
    }
  };

  const handleRenameFolderReq = (folder: IFolder) => {
    const newName = prompt("Nieuwe naam voor map:", folder.name);
    if (newName && newName !== folder.name) {
      onRenameFolder(folder.id, newName);
    }
  };

  const handleDeleteFolderReq = (folder: IFolder) => {
    if (folder.id === GENERAL_DOC_FOLDER_ID) {
      alert("De map 'Algemeen' kan niet verwijderd worden.");
      return;
    }
    if (confirm(`Weet je zeker dat je de map '${folder.name}' wilt verwijderen?\nAlle submappen en documenten worden verplaatst naar 'Algemeen'.`)) {
      onDeleteFolder(folder.id);
      if (activeFolderId === folder.id) setActiveFolderId(folder.parentId);
    }
  };

  const handleAddFolderReq = () => {
    const name = prompt("Naam van de nieuwe map:");
    if (name) onAddFolder(name, activeFolderId);
  };

  return (
    <div className="flex flex-col h-full bg-apotheek-main">
      {/* Header Actions */}
      <div className="bg-white p-6 border-b border-gray-200 shadow-sm">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
             <h2 className="text-2xl font-bold text-gray-800">Documentenbeheer</h2>
             <div className="flex items-center gap-2 text-sm text-gray-500 mt-1 flex-wrap">
               <button 
                  onClick={() => setActiveFolderId(null)}
                  className={`flex items-center hover:text-apotheek-teal ${!activeFolderId ? 'font-bold text-apotheek-teal' : ''}`}
               >
                 <Home size={14} className="mr-1" /> Documenten
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
          <div className="flex gap-3">
             <input 
              type="file" 
              accept=".html,.htm" 
              ref={fileInputRef} 
              onChange={handleFileUpload} 
              className="hidden" 
            />
            <button 
              onClick={() => fileInputRef.current?.click()}
              disabled={isImporting}
              className="bg-white border border-apotheek-teal text-apotheek-teal hover:bg-apotheek-light px-4 py-2 rounded-lg flex items-center gap-2 transition-colors shadow-sm"
            >
              {isImporting ? <Loader2 size={20} className="animate-spin" /> : <Upload size={20} />}
              Importeer HTML
            </button>
            <button 
              onClick={openAddModal}
              className="bg-apotheek-teal hover:bg-apotheek-darkTeal text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors shadow-sm"
            >
              <Plus size={20} />
              Nieuw Document
            </button>
          </div>
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
              placeholder="Zoek in alle mappen..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-apotheek-teal focus:border-transparent outline-none"
            />
          </div>
          
          <div className="flex gap-2">
            <select 
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-apotheek-teal outline-none bg-white text-gray-700"
            >
              <option value="NEWEST">Nieuwste</option>
              <option value="OLDEST">Oudste</option>
              <option value="ALPHABETICAL">A-Z</option>
            </select>
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto p-6">
        
        {/* Folder View - Show subfolders */}
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
                      <p className="text-xs text-gray-500 mt-1">{getFolderDocCount(folder.id)} bestanden</p>
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

        {/* Documents Grid */}
        <h3 className="text-lg font-semibold text-gray-700 mb-4">
          {searchTerm ? 'Zoekresultaten' : (activeFolderId ? `Documenten in '${activeFolder?.name}'` : 'Documenten in hoofdmap')}
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {sortedDocs.map((doc) => (
            <div key={doc.id} className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow flex flex-col relative group">
              <div className="p-4 border-b border-gray-100 flex items-start justify-between bg-apotheek-main rounded-t-xl">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white rounded-lg shadow-sm border border-gray-100">
                    {getIcon(doc.type)}
                  </div>
                  <div className="overflow-hidden">
                    <button 
                      onClick={() => handleDocumentClick(doc)}
                      className="font-semibold text-gray-800 line-clamp-1 hover:text-apotheek-teal hover:underline text-left w-full" 
                      title={doc.title}
                    >
                      {doc.title}
                    </button>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-apotheek-light text-apotheek-darkTeal font-medium border border-apotheek-teal/20 inline-block mt-1">
                      {folders.find(f => f.id === doc.folderId)?.name}
                    </span>
                  </div>
                </div>
                <div className="flex gap-1">
                   <button 
                    onClick={() => onToggleFavorite(doc.id)}
                    className={`p-1.5 rounded-md transition-colors ${doc.isFavorite ? 'text-yellow-400 hover:text-yellow-500' : 'text-gray-300 hover:text-yellow-400'}`}
                  >
                    <Star size={18} fill={doc.isFavorite ? "currentColor" : "none"} />
                  </button>
                  <button 
                    onClick={() => openEditModal(doc)}
                    className="p-1.5 text-gray-300 hover:text-apotheek-teal transition-colors"
                  >
                    <Edit2 size={18} />
                  </button>
                </div>
              </div>
              
              <div className="p-4 flex-1">
                <p className="text-sm text-gray-600 italic line-clamp-2 min-h-[2.5rem]">
                  {doc.notes ? `"${doc.notes}"` : <span className="opacity-50">Geen notities</span>}
                </p>
                <div className="mt-4 flex items-center justify-between text-xs text-gray-400">
                  <span>{new Date(doc.createdAt).toLocaleDateString('nl-NL')}</span>
                  <div className="flex gap-2">
                     <button 
                      onClick={() => onDeleteDocument(doc.id)}
                      className="hover:text-red-500 transition-colors"
                      title="Verwijderen"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {sortedDocs.length === 0 && !searchTerm && (
            <div className="col-span-full flex flex-col items-center justify-center py-12 text-gray-400 border-2 border-dashed border-gray-200 rounded-xl">
              <FileText size={48} className="mb-2 opacity-50" />
              <p>Geen documenten in deze map.</p>
              <button onClick={openAddModal} className="mt-2 text-apotheek-teal hover:underline text-sm font-medium">
                Voeg je eerste document toe
              </button>
            </div>
          )}
        </div>
      </div>

       {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden">
            <div className="p-4 border-b border-gray-100 bg-apotheek-teal text-white flex justify-between items-center">
              <h3 className="font-bold">{isEditing ? 'Document Wijzigen' : 'Nieuw Document Toevoegen'}</h3>
              <button onClick={closeModal} className="hover:bg-white/20 p-1 rounded">X</button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Titel</label>
                <input 
                  required
                  type="text" 
                  value={formData.title}
                  onChange={e => setFormData({...formData, title: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg p-2 focus:ring-1 focus:ring-apotheek-teal outline-none"
                  placeholder="Bijv. Handleiding Kassa"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type Bestand</label>
                <select 
                  value={formData.type}
                  onChange={e => setFormData({...formData, type: e.target.value as DocumentType})}
                  className="w-full border border-gray-300 rounded-lg p-2 outline-none bg-white"
                >
                  <option value={DocumentType.PDF}>PDF Document</option>
                  <option value={DocumentType.WORD}>Word Document</option>
                  <option value={DocumentType.JPG}>Afbeelding (JPG)</option>
                  <option value={DocumentType.LINK}>Website Link</option>
                </select>
              </div>

              {/* Improved Folder Selection: Main Folder + Optional Subfolder */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Hoofdmap</label>
                  <select 
                    value={currentRootId}
                    onChange={(e) => {
                      const newRootId = e.target.value;
                      // When root changes, set folderId to the new root ID (clearing subfolder selection)
                      setFormData({ ...formData, folderId: newRootId });
                    }}
                    className="w-full border border-gray-300 rounded-lg p-2 outline-none"
                  >
                    {rootFolders.map(f => (
                      <option key={f.id} value={f.id}>{f.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Submap <span className="text-gray-400 font-normal">(Optioneel)</span></label>
                  <select 
                    value={availableSubfolders.some(f => f.id === formData.folderId) ? formData.folderId : ''}
                    onChange={(e) => {
                      const subId = e.target.value;
                      // If subId is selected, use it. If empty (default), use the root ID.
                      setFormData({ ...formData, folderId: subId || currentRootId });
                    }}
                    disabled={availableSubfolders.length === 0}
                    className="w-full border border-gray-300 rounded-lg p-2 outline-none disabled:bg-gray-50 disabled:text-gray-400"
                  >
                    <option value="">Geen submap</option>
                    {availableSubfolders.map(f => (
                      <option key={f.id} value={f.id}>{f.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {formData.type === DocumentType.LINK && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Website URL</label>
                  <input 
                    required
                    type="url" 
                    value={formData.url}
                    onChange={e => setFormData({...formData, url: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg p-2 focus:ring-1 focus:ring-apotheek-teal outline-none"
                    placeholder="https://..."
                  />
                </div>
              )}

              {formData.type !== DocumentType.LINK && (
                <div className="border-2 border-dashed border-gray-200 rounded-lg p-4 text-center bg-gray-50">
                  <Upload className="mx-auto text-gray-400 mb-2" />
                  <p className="text-sm text-gray-500">Sleep bestand hierheen of klik om te uploaden</p>
                  <p className="text-xs text-gray-400 mt-1">(Simulatie: er wordt geen bestand echt opgeslagen)</p>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notities</label>
                <textarea 
                  value={formData.notes}
                  onChange={e => setFormData({...formData, notes: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg p-2 outline-none h-24 resize-none"
                  placeholder="Extra informatie voor collega's..."
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