import React from 'react';
import { FolderOpen, Users, StickyNote, Activity, Star, Settings } from 'lucide-react';
import { AppView } from '../types';
import { LOGO_URL } from '../constants';

interface SidebarProps {
  currentView: AppView;
  onChangeView: (view: AppView) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentView, onChangeView }) => {
  const navItems = [
    { view: AppView.DOCUMENTS, label: 'Documenten', icon: FolderOpen },
    { view: AppView.CONTACTS, label: 'Contacten', icon: Users },
    { view: AppView.TEAM_NOTES, label: 'Team Notities', icon: StickyNote },
    { view: AppView.FAVORITES, label: 'Favorieten', icon: Star },
  ];

  return (
    <div className="w-64 bg-white border-r border-gray-200 flex flex-col h-full shadow-sm z-10 shrink-0">
      <div className="p-6 flex items-center gap-3 border-b border-gray-100">
        {LOGO_URL ? (
          <img 
            src={LOGO_URL} 
            alt="Logo Apotheek" 
            className="h-12 w-auto object-contain rounded-md"
          />
        ) : (
          <div className="bg-apotheek-teal p-2 rounded-lg text-white">
            <Activity size={24} />
          </div>
        )}
        
        <div>
          <h1 className="font-bold text-apotheek-teal leading-tight">Service Apotheek</h1>
          <p className="text-xs text-gray-500 font-medium">De Goede - Steyl / reuver</p>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        {navItems.map((item) => {
          const isActive = currentView === item.view;
          return (
            <button
              key={item.view}
              onClick={() => onChangeView(item.view)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                isActive
                  ? 'bg-apotheek-light text-apotheek-darkTeal font-semibold shadow-sm border border-apotheek-teal/20'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-apotheek-teal'
              }`}
            >
              <item.icon size={20} className={isActive ? 'text-apotheek-teal' : 'text-gray-400'} />
              {item.label}
            </button>
          );
        })}
        
        {/* Settings Item - Separated */}
        <div className="pt-4 mt-2 border-t border-gray-100">
          <button
            onClick={() => onChangeView(AppView.SETTINGS)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
              currentView === AppView.SETTINGS
                ? 'bg-gray-100 text-gray-800 font-semibold'
                : 'text-gray-600 hover:bg-gray-50 hover:text-apotheek-teal'
            }`}
          >
            <Settings size={20} className={currentView === AppView.SETTINGS ? 'text-gray-800' : 'text-gray-400'} />
            Instellingen
          </button>
        </div>
      </nav>

      <div className="p-4 border-t border-gray-100">
        <div className="bg-orange-50 rounded-lg p-3 border border-orange-100 mb-4">
          <p className="text-xs text-apotheek-orange font-bold mb-1">Hulp nodig?</p>
          <p className="text-xs text-gray-600">Bel de IT support of vraag de apotheker.</p>
        </div>

        {/* VenturDigital Credits */}
        <div className="text-center">
          <p className="text-[10px] text-gray-400">Gemaakt door <span className="font-bold text-gray-500">VenturDigital</span></p>
          <a 
            href="mailto:info@venturdigital.com" 
            className="text-[10px] text-apotheek-teal hover:underline block mt-0.5"
          >
            Wil jij ook dit? info@venturdigital.com
          </a>
        </div>
      </div>
    </div>
  );
};
