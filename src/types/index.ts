export interface User {
  id: string;
  email: string;
  username?: string;
  full_name?: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

export interface Board {
  id: string;
  title: string;
  description?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  last_opened_at?: string;
  is_starred?: boolean;
}

export interface BoardMember {
  id: string;
  board_id: string;
  user_id: string;
  role: "owner" | "admin" | "member";
  created_at: string;
}

export interface List {
  id: string;
  title: string;
  board_id: string;
  position: number;
  created_at: string;
  updated_at: string;
}

export interface Assignee {
  id: string;
  card_id: string;
  user_id: string;
  assigned_by: string;
  assigned_at: string;
  user?: User;
}

export interface Card {
  id: string;
  title: string;
  description?: string;
  list_id: string;
  position: number;
  due_date?: string;
  tags: string[];
  completed?: boolean;
  checklist?: Array<{
    id: string;
    text: string;
    completed: boolean;
  }>;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface Comment {
  id: string;
  content: string;
  card_id: string;
  user_id: string;
  created_at: string;
  updated_at: string;
  user?: User;
}

export interface Tag {
  id: string;
  name: string;
  color: string;
  board_id: string;
  created_at: string;
}

export interface AuthState {
  user: User | null;
  session: unknown | null;
  loading: boolean;
}

export interface BoardState {
  boards: Board[];
  currentBoard: Board | null;
  loading: boolean;
  error: string | null;
}

export interface CardState {
  cards: Card[];
  comments: Comment[];
  loading: boolean;
  error: string | null;
}
