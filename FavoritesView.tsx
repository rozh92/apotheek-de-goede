import React from 'react';
import { AppDocument, Contact, DocumentType, Folder } from '../types';
import { FileText, Link as LinkIcon, Image as ImageIcon, Star, User, Phone, Mail } from 'lucide-react';

interface FavoritesViewProps {
  documents: AppDocument[];
  contacts: Contact[];
  docFolders: Folder[];
  contactFolders: Folder[];
  onToggleFavoriteDoc: (id: string) => void;
  onToggleFavoriteContact: (id: string) => void;
}

export const FavoritesView: React.FC<FavoritesViewProps> = ({ 
  documents, 
  contacts,
  docFolders,
  contactFolders,
  onToggleFavoriteDoc,
  onToggleFavoriteContact
}) => {
  const favDocs = documents.filter(d => d.isFavorite);
  const favContacts = contacts.filter(c => c.isFavorite);

  const getDocFolderName = (id: string) => docFolders.find(f => f.id === id)?.name || 'Onbekend';
  const getContactFolderName = (id: string) => contactFolders.find(f => f.id === id)?.name || 'Onbekend';

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

  return (
    <div className="flex flex-col h-full bg-apotheek-main">
      <div className="bg-white p-6 border-b border-gray-200 shadow-sm">
         <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Star className="text-yellow-400" fill="currentColor" /> 
            Mijn Favorieten
         </h2>
         <p className="text-sm text-gray-500">Snel toegang tot je belangrijkste documenten en contacten.</p>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-8">
        
        {/* Favorite Documents */}
        <section>
          <h3 className="text-lg font-bold text-apotheek-teal mb-4 border-b border-gray-200 pb-2">Documenten ({favDocs.length})</h3>
          {favDocs.length === 0 ? (
             <p className="text-gray-400 text-sm italic">Geen favoriete documenten.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
               {favDocs.map(doc => (
                 <div key={doc.id} className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 relative">
                    <button 
                      onClick={() => onToggleFavoriteDoc(doc.id)}
                      className="absolute top-2 right-2 text-yellow-400 hover:text-gray-300"
                    >
                      <Star size={16} fill="currentColor" />
                    </button>
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-2 bg-apotheek-main rounded-lg">
                        {getIcon(doc.type)}
                      </div>
                      <div className="overflow-hidden pr-6">
                        <button 
                          onClick={() => handleDocumentClick(doc)}
                          className="font-semibold text-gray-800 line-clamp-1 hover:text-apotheek-teal hover:underline text-left"
                        >
                          {doc.title}
                        </button>
                        <span className="text-xs text-gray-500">{getDocFolderName(doc.folderId)}</span>
                      </div>
                    </div>
                 </div>
               ))}
            </div>
          )}
        </section>

        {/* Favorite Contacts */}
        <section>
          <h3 className="text-lg font-bold text-apotheek-teal mb-4 border-b border-gray-200 pb-2">Contacten ({favContacts.length})</h3>
           {favContacts.length === 0 ? (
             <p className="text-gray-400 text-sm italic">Geen favoriete contacten.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {favContacts.map(contact => (
                <div key={contact.id} className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 flex gap-4 relative">
                   <button 
                      onClick={() => onToggleFavoriteContact(contact.id)}
                      className="absolute top-2 right-2 text-yellow-400 hover:text-gray-300"
                    >
                      <Star size={16} fill="currentColor" />
                    </button>
                   <div className="p-2 bg-apotheek-light text-apotheek-teal rounded-full h-fit">
                      <User size={20} />
                   </div>
                   <div className="flex-1 pr-6">
                      <h4 className="font-bold text-gray-800">{contact.name}</h4>
                      <p className="text-xs text-apotheek-teal font-semibold mb-2">{contact.function}</p>
                      
                      {contact.phone && (
                        <div className="flex items-center gap-2 text-xs text-gray-600 mb-1">
                          <Phone size={12} /> {contact.phone}
                        </div>
                      )}
                      {contact.email && (
                        <div className="flex items-center gap-2 text-xs text-gray-600">
                          <Mail size={12} /> <span className="truncate">{contact.email}</span>
                        </div>
                      )}
                      <span className="text-xs text-gray-400 border border-gray-200 rounded px-1.5 py-0.5 mt-2 inline-block">
                        {getContactFolderName(contact.folderId)}
                      </span>
                   </div>
                </div>
              ))}
            </div>
          )}
        </section>

      </div>
    </div>
  );
};
