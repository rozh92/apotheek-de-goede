import React, { useState } from 'react';
import { GoogleGenAI } from "@google/genai";
import { MessageSquare, Send, X, Sparkles, Loader2 } from 'lucide-react';
import { AppDocument, Contact, Folder } from '../types';

interface GeminiAssistantProps {
  documents: AppDocument[];
  contacts: Contact[];
  docFolders: Folder[];
  contactFolders: Folder[];
}

interface Message {
  role: 'user' | 'model';
  text: string;
}

export const GeminiAssistant: React.FC<GeminiAssistantProps> = ({ documents, contacts, docFolders, contactFolders }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSend = async () => {
    if (!query.trim() || !process.env.API_KEY) return;
    
    const userMsg = query;
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setQuery('');
    setIsLoading(true);

    try {
      // Resolve folder names for better context
      const getDocFolderName = (id: string) => docFolders.find(f => f.id === id)?.name || 'Onbekend';
      const getContactFolderName = (id: string) => contactFolders.find(f => f.id === id)?.name || 'Onbekend';

      const contextData = {
        documents: documents.map(d => ({ 
          title: d.title, 
          folder: getDocFolderName(d.folderId), 
          notes: d.notes, 
          type: d.type 
        })),
        contacts: contacts.map(c => ({ 
          name: c.name, 
          function: c.function, 
          folder: getContactFolderName(c.folderId), 
          phone: c.phone, 
          notes: c.notes 
        }))
      };

      const systemPrompt = `
        Je bent een behulpzame AI-assistent voor 'Service Apotheek de Goede'.
        Je hebt toegang tot de volgende data in JSON formaat:
        ${JSON.stringify(contextData)}

        Antwoord beknopt en vriendelijk in het Nederlands.
        Als een gebruiker vraagt om een dokter, zoek in de contacten (let op mappen zoals huisarts/specialist).
        Als een gebruiker vraagt om een document, zoek in de documenten.
        Als de info niet bestaat, zeg dat eerlijk.
      `;

      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: userMsg,
        config: {
          systemInstruction: systemPrompt,
        },
      });

      const text = response.text || "Sorry, ik kon geen antwoord genereren.";
      setMessages(prev => [...prev, { role: 'model', text }]);
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { role: 'model', text: "Er is een fout opgetreden bij het verbinden met de assistent." }]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!process.env.API_KEY) return null;

  return (
    <>
      {/* Floating Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 bg-gradient-to-r from-apotheek-teal to-apotheek-darkTeal text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all z-50 flex items-center gap-2"
      >
        {isOpen ? <X size={24} /> : <Sparkles size={24} />}
        {!isOpen && <span className="font-semibold pr-1">AI Hulp</span>}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 w-96 bg-white rounded-2xl shadow-2xl border border-gray-200 z-50 flex flex-col overflow-hidden animate-in slide-in-from-bottom-5 fade-in duration-200" style={{height: '500px'}}>
          <div className="bg-apotheek-teal p-4 text-white flex items-center gap-2">
            <Sparkles size={18} />
            <h3 className="font-bold">Apotheek Assistent</h3>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
            {messages.length === 0 && (
              <div className="text-center text-gray-500 mt-10 text-sm">
                <p>Stel een vraag over documenten of contacten.</p>
                <p className="mt-2 text-xs opacity-70">Bijv: "Hebben we het nummer van Dr. Jansen?"</p>
              </div>
            )}
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] p-3 rounded-2xl text-sm ${
                  m.role === 'user' 
                    ? 'bg-apotheek-teal text-white rounded-br-none' 
                    : 'bg-white border border-gray-200 text-gray-800 rounded-bl-none shadow-sm'
                }`}>
                  {m.text}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white border border-gray-200 p-3 rounded-2xl rounded-bl-none shadow-sm">
                  <Loader2 size={16} className="animate-spin text-apotheek-teal" />
                </div>
              </div>
            )}
          </div>

          <div className="p-3 bg-white border-t border-gray-100 flex gap-2">
            <input 
              type="text" 
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Typ je vraag..."
              className="flex-1 border border-gray-200 rounded-full px-4 py-2 text-sm focus:outline-none focus:border-apotheek-teal"
            />
            <button 
              onClick={handleSend}
              disabled={isLoading || !query.trim()}
              className="bg-apotheek-teal text-white p-2 rounded-full hover:bg-apotheek-darkTeal disabled:opacity-50 transition-colors"
            >
              <Send size={18} />
            </button>
          </div>
        </div>
      )}
    </>
  );
};
