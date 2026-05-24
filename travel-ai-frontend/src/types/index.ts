

export interface User {
  id: string;
  name: string;
  email: string;
}

export interface SavedItinerary {
  _id?: string;
  destination: string;
  dates: string;
  aiResponse: string;
  savedAt: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface ChatMessage {
  role: 'user' | 'ai';
  content: string;
}