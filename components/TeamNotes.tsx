import React, { useState } from 'react';
import { TeamNote, TeamMember } from '../types';
import { Plus, Trash2, Pin, Edit2, Mail, Send, Loader2 } from 'lucide-react';
import { db } from '../firebase';
import { collection, addDoc } from 'firebase/firestore';

interface TeamNotesProps {
  notes: TeamNote[];
  teamMembers: TeamMember[];
  onAddNote: (note: Omit<TeamNote, 'id' | 'createdAt'>) => void;
  onDeleteNote: (id: string) => void;
  onUpdateNote: (note: TeamNote) => void;
}

export const TeamNotes: React.FC<TeamNotesProps> = ({ notes, teamMembers, onAddNote, onDeleteNote, onUpdateNote }) => {
  const [newNoteContent, setNewNoteContent] = useState('');
  const [authorName, setAuthorName] = useState('');
  const [isImportant, setIsImportant] = useState(false);
  const [isSending, setIsSending] = useState(false);

  // Edit State
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [editAuthor, setEditAuthor] = useState('');
  const [editImportant, setEditImportant] = useState(false);

  const sortedNotes = [...notes].sort((a, b) => {
    if (a.isImportant && !b.isImportant) return -1;
    if (!a.isImportant && b.isImportant) return 1;
    return b.createdAt - a.createdAt;
  });

  const sendEmailNotification = async (noteContent: string, author: string) => {
    // Filter members with valid emails
    const validEmails = teamMembers
      .map(m => m.email)
      .filter(email => email && email.includes('@'));

    if (validEmails.length === 0) return;

    try {
      // We schrijven naar de 'mail' collectie. De Firebase Extensie luistert hiernaar.
      await addDoc(collection(db, 'mail'), {
        to: validEmails,
        message: {
          subject: `Nieuwe notitie van ${author} - Apotheek Dashboard`,
          text: `Er is een nieuwe notitie geplaatst op het dashboard:\n\n"${noteContent}"\n\n- ${author}\n\nGa naar https://copharma.site om te reageren.`,
          html: `
            <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f4fafc;">
              <div style="background-color: white; padding: 20px; border-radius: 8px; border: 1px solid #e5e7eb;">
                <h2 style="color: #00A6D6; margin-top: 0;">Nieuwe Team Notitie</h2>
                <p>Er is een bericht geplaatst door <strong>${author}</strong>:</p>
                <blockquote style="border-left: 4px solid #00A6D6; padding-left: 15px; margin: 20px 0; color: #555; background-color: #f9f9f9; padding: 15px;">
                  "${noteContent.replace(/\n/g, '<br/>')}"
                </blockquote>
                <p style="font-size: 12px; color: #888;">Ga naar <a href="https://copharma.site" style="color: #00A6D6;">copharma.site</a> om het volledige bord te bekijken.</p>
              </div>
            </div>
          `
        }
      });
      console.log("Email trigger sent to Firebase for", validEmails.length, "recipients");
    } catch (e) {
      console.error("Error sending email trigger:", e);
      alert("Let op: De notitie is geplaatst, maar het versturen van de e-mail notificatie is mislukt. Controleer je internetverbinding en Firebase configuratie.");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteContent.trim() || !authorName.trim()) return;
    
    setIsSending(true);

    // 1. Voeg toe aan lokale state (zodat het direct zichtbaar is)
    // In een volledige productie app zou je dit ook naar Firestore kunnen schrijven, 
    // maar voor nu houden we de notities lokaal in de browser sessie zoals gevraagd, 
    // en gebruiken we Firestore puur voor de email trigger.
    onAddNote({
      content: newNoteContent,
      author: authorName,
      isImportant
    });

    // 2. Trigger de e-mail via Firebase
    if (teamMembers.length > 0) {
      await sendEmailNotification(newNoteContent, authorName);
      alert(`Notitie geplaatst! De e-mail notificaties worden verzonden.`);
    }

    setNewNoteContent('');
    setIsImportant(false);
    setIsSending(false);
  };

  const startEditing = (note: TeamNote) => {
    setIsEditing(true);
    setEditId(note.id);
    setEditContent(note.content);
    setEditAuthor(note.author);
    setEditImportant(note.isImportant);
  };

  const cancelEditing = () => {
    setIsEditing(false);
    setEditId(null);
  };

  const saveEditing = () => {
    if (editId) {
      const original = notes.find(n => n.id === editId);
      if (original) {
        onUpdateNote({
          ...original,
          content: editContent,
          author: editAuthor,
          isImportant: editImportant
        });
      }
      setIsEditing(false);
      setEditId(null);
    }
  };

  return (
    <div className="flex flex-col h-full bg-apotheek-main p-6">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-800">Team Prikbord</h2>
        <p className="text-sm text-gray-500">Berichten voor collega's.</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 h-full overflow-hidden">
        {/* Input Area */}
        <div className="w-full lg:w-1/3 bg-white p-6 rounded-xl shadow-sm border border-gray-200 h-fit">
          <h3 className="font-bold text-lg mb-4 text-apotheek-teal">Nieuw bericht plaatsen</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Jouw Naam</label>
              <input 
                type="text"
                value={authorName}
                onChange={(e) => setAuthorName(e.target.value)}
                className="w-full border border-gray-300 rounded-lg p-2 focus:ring-1 focus:ring-apotheek-teal outline-none"
                placeholder="Bijv. Sanne"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Bericht</label>
              <textarea 
                value={newNoteContent}
                onChange={(e) => setNewNoteContent(e.target.value)}
                className="w-full border border-gray-300 rounded-lg p-2 focus:ring-1 focus:ring-apotheek-teal outline-none resize-none h-32"
                placeholder="Schrijf hier je bericht..."
                required
              />
            </div>
            
            <div className="bg-blue-50 p-3 rounded-lg border border-blue-100 flex items-start gap-3">
               <Mail size={16} className="text-blue-500 mt-0.5 shrink-0" />
               <div className="text-xs text-blue-700">
                 {teamMembers.length > 0 ? (
                   <>
                     <strong>E-mail notificatie aan:</strong><br/>
                     Wordt verstuurd naar {teamMembers.filter(m => m.email).length} collega's.
                   </>
                 ) : (
                   <span className="text-gray-500">
                     Geen e-mailadressen ingesteld. Ga naar <strong>Instellingen</strong> om collega's toe te voegen.
                   </span>
                 )}
               </div>
            </div>

            <div className="flex items-center gap-2">
              <input 
                type="checkbox" 
                id="important"
                checked={isImportant}
                onChange={(e) => setIsImportant(e.target.checked)}
                className="w-4 h-4 text-apotheek-orange focus:ring-apotheek-orange border-gray-300 rounded"
              />
              <label htmlFor="important" className="text-sm text-gray-700 select-none cursor-pointer">Markeer als belangrijk</label>
            </div>
            <button 
              type="submit"
              disabled={isSending}
              className="w-full bg-apotheek-teal text-white py-2 rounded-lg hover:bg-apotheek-darkTeal transition-colors flex justify-center items-center gap-2 disabled:opacity-70"
            >
              {isSending ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
              {isSending ? 'Versturen...' : 'Plaatsen & Versturen'}
            </button>
          </form>
        </div>

        {/* Board Area */}
        <div className="flex-1 overflow-y-auto">
          <div className="columns-1 md:columns-2 gap-4 space-y-4 pb-12">
            {sortedNotes.map((note) => (
              <div 
                key={note.id} 
                className={`break-inside-avoid rounded-xl p-5 shadow-sm border relative group transition-all ${
                  note.isImportant 
                    ? 'bg-orange-50 border-apotheek-orange/30' 
                    : 'bg-white border-gray-200'
                }`}
              >
                {isEditing && editId === note.id ? (
                  <div className="space-y-3">
                     <input 
                        value={editAuthor}
                        onChange={(e) => setEditAuthor(e.target.value)}
                        className="w-full text-sm font-bold p-1 border rounded"
                      />
                     <textarea 
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        className="w-full text-sm p-1 border rounded h-24"
                      />
                      <div className="flex items-center gap-2">
                        <input 
                          type="checkbox" 
                          checked={editImportant}
                          onChange={(e) => setEditImportant(e.target.checked)}
                        />
                        <label className="text-xs">Belangrijk</label>
                      </div>
                      <div className="flex gap-2 justify-end">
                         <button onClick={cancelEditing} className="text-xs text-gray-500">Annuleren</button>
                         <button onClick={saveEditing} className="text-xs bg-apotheek-teal text-white px-2 py-1 rounded">Opslaan</button>
                      </div>
                  </div>
                ) : (
                  <>
                    {note.isImportant && (
                      <Pin className="absolute top-3 right-3 text-apotheek-orange rotate-45" size={16} fill="currentColor" />
                    )}
                    
                    <p className="text-gray-800 whitespace-pre-wrap mb-4 font-medium text-lg leading-relaxed font-handwriting">
                      {note.content}
                    </p>
                    
                    <div className="flex justify-between items-end border-t border-gray-100/50 pt-3">
                      <div>
                        <span className="font-bold text-sm text-apotheek-darkTeal block">{note.author}</span>
                        <span className="text-xs text-gray-400">{new Date(note.createdAt).toLocaleString('nl-NL', { weekday: 'short', hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all">
                        <button 
                          onClick={() => startEditing(note)}
                          className="text-gray-300 hover:text-apotheek-teal p-1"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button 
                          onClick={() => onDeleteNote(note.id)}
                          className="text-gray-300 hover:text-red-500 p-1"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ))}
            
            {sortedNotes.length === 0 && (
              <div className="text-center text-gray-400 mt-12 col-span-full">
                <p>Nog geen berichten op het prikbord.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
