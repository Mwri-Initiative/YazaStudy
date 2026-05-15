export interface Subject {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
}

export interface StudyMaterial {
  id: string;
  title: string;
  description: string;
  subject: string;
  price: number;
  type: 'pdf' | 'video' | 'practice';
  previewUrl?: string;
  downloadUrl?: string;
  thumbnail?: string;
  pages?: number;
  duration?: string;
  difficulty: 'basic' | 'intermediate' | 'advanced';
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  purchasedMaterials: string[];
  createdAt: string;
}

export interface CartItem {
  material: StudyMaterial;
  quantity: number;
}
