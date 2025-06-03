export interface User {
  id: string;
  name: string;
  avatar: string;
  provider: string;
}

export interface Comment {
  id: string;
  content: string;
  user: User;
  createdAt: string;
  likes?: number;
  liked?: boolean;
  parentId: string | null;
  edited: boolean;
}