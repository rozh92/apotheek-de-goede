import { AppDocument, Contact, DocumentType, TeamNote, Folder, TeamMember } from './types';

// *** PLAATS HIER JE IMGUR LINK ***
export const LOGO_URL = 'https://i.imgur.com/JQ6x5po.png'; 

// HET WACHTWOORD VOOR HET TEAM (Standaard, kan gewijzigd worden in settings)
export const APP_PASSWORD = 'apotheek2024';

// HET WACHTWOORD VOOR DE MANAGER (Voor toegang tot instellingen)
export const MANAGER_PASSWORD = 'manager2024';

// Fixed IDs for default folders to ensure we always have a fallback
export const GENERAL_DOC_FOLDER_ID = 'doc-folder-general';
export const GENERAL_CONTACT_FOLDER_ID = 'contact-folder-general';

export const INITIAL_DOC_FOLDERS: Folder[] = [
  { id: GENERAL_DOC_FOLDER_ID, name: 'Algemeen', parentId: null },
  { id: 'doc-folder-admin', name: 'Administratie', parentId: null },
  { id: 'doc-folder-income', name: 'Inkomen', parentId: null },
  { id: 'doc-folder-meds', name: 'Medicijnen', parentId: null },
  { id: 'doc-folder-proto', name: 'Protocollen', parentId: null },
  // Subfolder example
  { id: 'doc-folder-proto-diabetes', name: 'Diabetes', parentId: 'doc-folder-proto' }
];

export const INITIAL_CONTACT_FOLDERS: Folder[] = [
  { id: GENERAL_CONTACT_FOLDER_ID, name: 'Overig', parentId: null },
  { id: 'contact-folder-gp', name: 'Huisartsen', parentId: null },
  { id: 'contact-folder-spec', name: 'Specialisten', parentId: null },
  { id: 'contact-folder-pharm', name: 'Apotheken', parentId: null },
  { id: 'contact-folder-supp', name: 'Leveranciers', parentId: null },
  // Subfolder example
  { id: 'contact-folder-gp-steyl', name: 'Steyl', parentId: 'contact-folder-gp' },
  { id: 'contact-folder-gp-venlo', name: 'Venlo', parentId: 'contact-folder-gp' }
];

export const INITIAL_DOCUMENTS: AppDocument[] = [
  {
    id: '1',
    title: 'Handleiding Kassasysteem',
    type: DocumentType.PDF,
    folderId: 'doc-folder-admin',
    url: '#',
    createdAt: Date.now() - 10000000,
    notes: 'Bijgewerkt voor versie 2.0',
    isFavorite: false
  },
  {
    id: '2',
    title: 'Nieuwsbrief Juli',
    type: DocumentType.WORD,
    folderId: 'doc-folder-income',
    url: '#',
    createdAt: Date.now() - 5000000,
    notes: '',
    isFavorite: true
  },
  {
    id: '3',
    title: 'Instructie insulinepennen',
    type: DocumentType.LINK,
    folderId: 'doc-folder-proto-diabetes', // Inside subfolder
    url: 'https://www.apotheek.nl/medicijnen/insuline',
    createdAt: Date.now(),
    notes: 'Handig voor patiëntuitleg',
    isFavorite: false
  }
];

export const INITIAL_CONTACTS: Contact[] = [
  {
    id: '1',
    name: 'Dr. Jansen',
    function: 'Huisarts',
    folderId: 'contact-folder-gp-steyl', // Inside subfolder
    phone: '077-1234567',
    email: 'jansen@huisartsenpost-steyl.nl',
    address: 'Kerkstraat 1, Steyl',
    notes: 'Belt vaak tussen 12:00 en 13:00',
    createdAt: Date.now() - 20000000,
    isFavorite: true
  },
  {
    id: '2',
    name: 'Dr. De Vries',
    function: 'Cardioloog',
    folderId: 'contact-folder-spec',
    phone: '077-7654321',
    notes: 'Alleen voor spoed bellen',
    createdAt: Date.now() - 10000000,
    isFavorite: false
  }
];

export const INITIAL_NOTES: TeamNote[] = [
  {
    id: '1',
    author: 'Sanne',
    content: 'Vergeet niet de bestelling voor maandag door te geven!',
    createdAt: Date.now() - 3600000,
    isImportant: true
  },
  {
    id: '2',
    author: 'Mark',
    content: 'De printer heeft kuren, monteur komt morgen.',
    createdAt: Date.now() - 86400000,
    isImportant: false
  }
];

export const INITIAL_TEAM_MEMBERS: TeamMember[] = [
  { id: 'tm-1', name: 'Sanne de Vries', email: 'sanne@apotheekdegoede.nl', role: 'Apothekersassistent' },
  { id: 'tm-2', name: 'Mark Jansen', email: 'mark@apotheekdegoede.nl', role: 'Apotheker' },
];