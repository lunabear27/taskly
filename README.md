# Taskly - A Full-Stack Trello Clone

Taskly is a modern, collaborative project management application built with React, TypeScript, and Supabase. It provides a Trello-like experience with real-time updates, drag-and-drop functionality, and team collaboration features.

## 🚀 Features

- **User Authentication**: Secure email/password authentication via Supabase Auth
- **Board Management**: Create, edit, and organize boards with lists and cards
- **Drag & Drop**: Intuitive drag-and-drop interface using @dnd-kit
- **Real-time Updates**: Live collaboration with Supabase Realtime
- **Dark Mode**: Toggle between light and dark themes
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **TypeScript**: Full type safety throughout the application
- **Modern UI**: Beautiful interface built with Tailwind CSS

## 🛠️ Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS with dark mode support
- **State Management**: Zustand for global state
- **Drag & Drop**: @dnd-kit for smooth interactions
- **Backend**: Supabase (PostgreSQL + Auth + Realtime)
- **Routing**: React Router v6
- **Icons**: Lucide React
- **Date Handling**: date-fns

## 📦 Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd taskly
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up Supabase**

   - Create a new project at [supabase.com](https://supabase.com)
   - Get your project URL and anon key from the project settings
   - Create a `.env` file in the root directory:

   ```env
   VITE_SUPABASE_URL=your_supabase_url_here
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here
   ```

4. **Set up the database**
   Run the following SQL in your Supabase SQL editor:

   ```sql
   -- Enable Row Level Security
   ALTER TABLE auth.users ENABLE ROW LEVEL SECURITY;

   -- Create boards table
   CREATE TABLE boards (
     id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
     title TEXT NOT NULL,
     description TEXT,
     created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE,
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
     updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
     is_public BOOLEAN DEFAULT false
   );

   -- Create board_members table
   CREATE TABLE board_members (
     id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
     board_id UUID REFERENCES boards(id) ON DELETE CASCADE,
     user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
     role TEXT CHECK (role IN ('owner', 'admin', 'member')) DEFAULT 'member',
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
     UNIQUE(board_id, user_id)
   );

   -- Create lists table
   CREATE TABLE lists (
     id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
     title TEXT NOT NULL,
     board_id UUID REFERENCES boards(id) ON DELETE CASCADE,
     position INTEGER NOT NULL,
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
     updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );

   -- Create cards table
   CREATE TABLE cards (
     id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
     title TEXT NOT NULL,
     description TEXT,
     list_id UUID REFERENCES lists(id) ON DELETE CASCADE,
     position INTEGER NOT NULL,
     due_date TIMESTAMP WITH TIME ZONE,
     tags TEXT[] DEFAULT '{}',
     created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE,
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
     updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );

   -- Create comments table
   CREATE TABLE comments (
     id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
     content TEXT NOT NULL,
     card_id UUID REFERENCES cards(id) ON DELETE CASCADE,
     user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
     updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );

   -- Create tags table
   CREATE TABLE tags (
     id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
     name TEXT NOT NULL,
     color TEXT NOT NULL,
     board_id UUID REFERENCES boards(id) ON DELETE CASCADE,
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );

   -- Enable RLS on all tables
   ALTER TABLE boards ENABLE ROW LEVEL SECURITY;
   ALTER TABLE board_members ENABLE ROW LEVEL SECURITY;
   ALTER TABLE lists ENABLE ROW LEVEL SECURITY;
   ALTER TABLE cards ENABLE ROW LEVEL SECURITY;
   ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
   ALTER TABLE tags ENABLE ROW LEVEL SECURITY;

   -- Create policies
   -- Boards: Users can see public boards or boards they're members of
   CREATE POLICY "Users can view boards they have access to" ON boards
     FOR SELECT USING (
       is_public = true OR
       created_by = auth.uid() OR
       EXISTS (
         SELECT 1 FROM board_members
         WHERE board_id = boards.id AND user_id = auth.uid()
       )
     );

   -- Users can create boards
   CREATE POLICY "Users can create boards" ON boards
     FOR INSERT WITH CHECK (auth.uid() = created_by);

   -- Users can update boards they own or are admin of
   CREATE POLICY "Users can update boards they own or admin" ON boards
     FOR UPDATE USING (
       created_by = auth.uid() OR
       EXISTS (
         SELECT 1 FROM board_members
         WHERE board_id = boards.id AND user_id = auth.uid() AND role IN ('owner', 'admin')
       )
     );

   -- Users can delete boards they own
   CREATE POLICY "Users can delete boards they own" ON boards
     FOR DELETE USING (created_by = auth.uid());

   -- Similar policies for other tables...
   -- (Add comprehensive RLS policies for all tables)

   -- Create indexes for better performance
   CREATE INDEX idx_boards_created_by ON boards(created_by);
   CREATE INDEX idx_lists_board_id ON lists(board_id);
   CREATE INDEX idx_cards_list_id ON cards(list_id);
   CREATE INDEX idx_board_members_board_id ON board_members(board_id);
   CREATE INDEX idx_board_members_user_id ON board_members(user_id);
   ```

5. **Start the development server**

   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to `http://localhost:5173`

## 🎯 Usage

1. **Sign up/Login**: Create an account or sign in with your email
2. **Create Boards**: Start by creating your first board
3. **Add Lists**: Organize your work with lists (e.g., "To Do", "In Progress", "Done")
4. **Create Cards**: Add tasks as cards within lists
5. **Drag & Drop**: Move cards between lists to track progress
6. **Collaborate**: Invite team members to your boards
7. **Real-time Updates**: See changes instantly across all connected clients

## 🏗️ Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── ui/            # Base UI components (Button, Input, Modal)
│   ├── Card.tsx       # Card component with drag-and-drop
│   └── List.tsx       # List component with cards
├── hooks/             # Custom React hooks
│   ├── useAuth.ts     # Authentication hook
│   └── useBoards.ts   # Boards management hook
├── lib/               # Utility functions and configurations
│   ├── supabase.ts    # Supabase client configuration
│   └── utils.ts       # Helper functions
├── pages/             # Page components
│   ├── Login.tsx      # Authentication page
│   ├── Register.tsx   # Registration page
│   ├── Dashboard.tsx  # Main dashboard
│   └── Board.tsx      # Board view with drag-and-drop
├── store/             # Zustand stores
│   ├── auth.ts        # Authentication state
│   └── boards.ts      # Boards and cards state
└── types/             # TypeScript type definitions
    └── index.ts       # All type interfaces
```

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the root directory:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Tailwind Configuration

The project includes a custom Tailwind configuration with:

- Dark mode support
- Custom color palette
- Responsive design utilities

## 🚀 Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy!

### Netlify

1. Build the project: `npm run build`
2. Deploy the `dist` folder to Netlify
3. Add environment variables in Netlify dashboard

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit your changes: `git commit -am 'Add feature'`
4. Push to the branch: `git push origin feature-name`
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- [Supabase](https://supabase.com) for the backend infrastructure
- [@dnd-kit](https://dndkit.com) for the drag-and-drop functionality
- [Tailwind CSS](https://tailwindcss.com) for the styling framework
- [Lucide](https://lucide.dev) for the beautiful icons
