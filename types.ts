export enum AppView {
  DOCUMENTS = 'DOCUMENTS',
  CONTACTS = 'CONTACTS',
  TEAM_NOTES = 'TEAM_NOTES',
  FAVORITES = 'FAVORITES',
  SETTINGS = 'SETTINGS'
}

export enum DocumentType {
  PDF = 'PDF',
  WORD = 'WORD',
  JPG = 'JPG',
  LINK = 'LINK'
}

export interface Folder {
  id: string;
  name: string;
  parentId: string | null;
}

export interface AppDocument {
  id: string;
  title: string;
  type: DocumentType;
  folderId: string; // Replaces category string
  url: string; 
  createdAt: number;
  notes: string;
  isFavorite: boolean;
}

export interface Contact {
  id: string;
  name: string;
  function: string;
  folderId: string; // Replaces category string
  phone?: string;
  email?: string;
  address?: string;
  notes: string;
  createdAt: number;
  isFavorite: boolean;
}

export interface TeamNote {
  id: string;
  author: string;
  content: string;
  createdAt: number;
  isImportant: boolean;
}

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: string; // e.g. 'Apotheker', 'Assistent'
}

export type SortOption = 'ALPHABETICAL' | 'NEWEST' | 'OLDEST';