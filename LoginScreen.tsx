import React, { useState } from 'react';
import { Lock, Activity, X, Shield, FileText, Info } from 'lucide-react';
import { LOGO_URL } from '../constants';

interface LoginScreenProps {
  onLogin: (password: string) => void;
  error?: boolean;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin, error }) => {
  const [password, setPassword] = useState('');
  const [modalContent, setModalContent] = useState<{title: string, content: React.ReactNode} | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin(password);
  };

  const openModal = (type: 'TERMS' | 'PRIVACY' | 'DISCLAIMER') => {
    if (type === 'TERMS') {
      setModalContent({
        title: 'Algemene Voorwaarden',
        content: (
          <div className="space-y-4 text-sm text-gray-600">
            <p><strong>1. Gebruik van het Dashboard</strong><br/>Dit dashboard is uitsluitend bedoeld voor geautoriseerde medewerkers van Service Apotheek de Goede. Het delen van inloggegevens met derden is niet toegestaan.</p>
            <p><strong>2. Vertrouwelijkheid</strong><br/>Alle informatie op dit dashboard, inclusief patiëntgegevens, artscontacten en bedrijfsnotities, is strikt vertrouwelijk.</p>
            <p><strong>3. Aansprakelijkheid</strong><br/>De apotheek is niet aansprakelijk voor eventuele typefouten in handmatig ingevoerde data. Controleer altijd kritische medische informatie bij de bron.</p>
          </div>
        )
      });
    } else if (type === 'PRIVACY') {
      setModalContent({
        title: 'Privacyverklaring',
        content: (
          <div className="space-y-4 text-sm text-gray-600">
            <p><strong>Gegevensverwerking</strong><br/>Wij verwerken persoonsgegevens in overeenstemming met de AVG. Dit interne dashboard slaat gegevens lokaal op en/of in een beveiligde database.</p>
            <p><strong>Doeleinden</strong><br/>Gegevens worden uitsluitend gebruikt voor interne bedrijfsvoering, communicatie tussen collega's en het snel vinden van contactgegevens van zorgverleners.</p>
            <p><strong>Bewaartermijn</strong><br/>Notities en gegevens worden niet langer bewaard dan noodzakelijk voor de bedrijfsvoering.</p>
          </div>
        )
      });
    } else {
      setModalContent({
        title: 'Disclaimer',
        content: (
          <div className="space-y-4 text-sm text-gray-600">
            <p>Aan de informatie op dit dashboard kunnen geen rechten worden ontleend. Hoewel wij streven naar correctheid, kunnen er onjuistheden in de weergegeven data sluipen.</p>
            <p>Bij twijfel over medische protocollen of doseringen, raadpleeg altijd de officiële bronnen (zoals Farmacotherapeutisch Kompas of KNMP Kennisbank).</p>
          </div>
        )
      });
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-apotheek-main p-4 relative">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
        
        {/* Header */}
        <div className="bg-apotheek-teal p-8 flex flex-col items-center text-white">
          <div className="bg-white p-3 rounded-xl mb-4 shadow-lg">
            {LOGO_URL ? (
              <img src={LOGO_URL} alt="Logo" className="h-12 w-auto" />
            ) : (
              <Activity className="text-apotheek-teal" size={32} />
            )}
          </div>
          <h1 className="text-2xl font-bold">Welkom terug</h1>
          <p className="text-apotheek-light opacity-90">Service Apotheek de Goede</p>
        </div>

        {/* Login Form */}
        <div className="p-8 pt-10">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Team Wachtwoord</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-apotheek-teal focus:border-transparent outline-none transition-all"
                  placeholder="Voer wachtwoord in..."
                  autoFocus
                />
              </div>
            </div>

            {error && (
              <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg flex items-center gap-2">
                <Info size={16} />
                <span>Wachtwoord onjuist. Probeer opnieuw.</span>
              </div>
            )}

            <button 
              type="submit"
              className="w-full bg-apotheek-teal text-white py-3 rounded-xl font-bold hover:bg-apotheek-darkTeal transition-colors shadow-lg shadow-apotheek-teal/20"
            >
              Inloggen
            </button>
          </form>

          <div className="mt-8 text-center">
             <p className="text-xs text-gray-400">Problemen met inloggen? Vraag de apotheker.</p>
          </div>
        </div>

        {/* Footer Links */}
        <div className="bg-gray-50 p-4 border-t border-gray-100 flex justify-center gap-6 text-xs text-gray-500">
          <button onClick={() => openModal('TERMS')} className="hover:text-apotheek-teal hover:underline">Algemene Voorwaarden</button>
          <button onClick={() => openModal('PRIVACY')} className="hover:text-apotheek-teal hover:underline">Privacy</button>
          <button onClick={() => openModal('DISCLAIMER')} className="hover:text-apotheek-teal hover:underline">Disclaimer</button>
        </div>
      </div>

      <div className="mt-8 text-center">
        <p className="text-xs text-gray-400">© {new Date().getFullYear()} Service Apotheek de Goede - Intern Dashboard</p>
        <div className="mt-2">
           <p className="text-[10px] text-gray-400">Gemaakt door <span className="font-bold text-gray-500">VenturDigital</span></p>
           <a 
            href="mailto:info@venturdigital.com" 
            className="text-[10px] text-apotheek-teal/80 hover:text-apotheek-teal hover:underline transition-colors"
           >
             Wil jij ook dit dashboard? info@venturdigital.com
           </a>
        </div>
      </div>

      {/* Modal Overlay */}
      {modalContent && (
        <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden">
            <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-apotheek-light">
              <h3 className="font-bold text-apotheek-darkTeal flex items-center gap-2">
                <Shield size={16} /> {modalContent.title}
              </h3>
              <button onClick={() => setModalContent(null)} className="p-1 hover:bg-white/50 rounded-full transition-colors">
                <X size={20} className="text-gray-500" />
              </button>
            </div>
            <div className="p-6">
              {modalContent.content}
            </div>
            <div className="p-4 bg-gray-50 border-t border-gray-100 text-right">
              <button 
                onClick={() => setModalContent(null)}
                className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50"
              >
                Sluiten
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};