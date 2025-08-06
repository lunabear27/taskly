# Taskly - A Full-Stack Trello Clone

Taskly is a modern, collaborative project management application built with React, TypeScript, and Supabase. It provides a Trello-like experience with real-time updates, drag-and-drop functionality, and team collaboration features.

<!-- Test comment for automatic redeployment verification -->

## 🚀 Features

- **User Authentication**: Secure email/password authentication with email verification
- **Board Management**: Create, edit, and organize boards with lists and cards
- **Drag & Drop**: Intuitive drag-and-drop interface using @dnd-kit
- **Real-time Updates**: Live collaboration with Supabase Realtime
- **Dark Mode**: Toggle between light and dark themes with persistent preference
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **TypeScript**: Full type safety throughout the application
- **Modern UI**: Beautiful interface built with Tailwind CSS and Shadcn/ui
- **User-specific Board Starring**: Star boards for quick access (user-specific)
- **Board Settings**: Edit board title and description
- **Member Management**: Invite and manage board members with role-based permissions
- **Email Verification**: Secure signup process with email verification requirement
- **Rate Limiting Protection**: Smart handling of API rate limits with user-friendly feedback

## 🛠️ Tech Stack

- **Frontend**: React 19 + TypeScript + Vite
- **Styling**: Tailwind CSS with dark mode support
- **UI Components**: Shadcn/ui component library
- **State Management**: Zustand for global state
- **Drag & Drop**: @dnd-kit for smooth interactions
- **Backend**: Supabase (PostgreSQL + Auth + Realtime)
- **Routing**: React Router v7
- **Icons**: Lucide React
- **Date Handling**: date-fns
- **Notifications**: Sonner for toast notifications

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
   -- Run the complete database schema
   -- Copy and paste the contents of tables.sql
   ```

   Or run the individual commands from `tables.sql` and `enable_realtime.sql`.

5. **Start the development server**

   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to `http://localhost:5173` (or the port shown in terminal)

## 🎯 Usage

1. **Sign up**: Create an account with email verification
2. **Verify Email**: Check your email and click the verification link
3. **Login**: Sign in with your verified account
4. **Create Boards**: Start by creating your first board
5. **Add Lists**: Organize your work with lists (e.g., "To Do", "In Progress", "Done")
6. **Create Cards**: Add tasks as cards within lists
7. **Drag & Drop**: Move cards between lists to track progress
8. **Star Boards**: Click the star icon to favorite boards for quick access
9. **Manage Members**: Invite team members to collaborate on boards
10. **Real-time Updates**: See changes instantly across all connected clients

## 🏗️ Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── ui/            # Base UI components (Button, Input, Modal, etc.)
│   ├── Card.tsx       # Card component with drag-and-drop
│   ├── List.tsx       # List component with cards
│   ├── BoardHeader.tsx # Board header with actions
│   ├── BoardSettingsModal.tsx # Board settings modal
│   └── BoardMemberManager.tsx # Member management
├── hooks/             # Custom React hooks
│   ├── useAuth.ts     # Authentication hook
│   ├── useBoards.ts   # Boards management hook
│   ├── useDarkMode.ts # Dark mode management
│   └── useBoardState.ts # Board state management
├── lib/               # Utility functions and configurations
│   ├── supabase.ts    # Supabase client configuration
│   └── utils.ts       # Helper functions
├── pages/             # Page components
│   ├── Login.tsx      # Authentication page
│   ├── Register.tsx   # Registration page with email verification
│   ├── Dashboard.tsx  # Main dashboard
│   └── Board.tsx      # Board view with drag-and-drop
├── store/             # Zustand stores
│   ├── auth.ts        # Authentication state
│   ├── boards.ts      # Boards and cards state
│   ├── boardMembers.ts # Board member management
│   └── notifications.ts # Notification system
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

### Database Setup

1. **Run the main schema**: Execute `tables.sql` in your Supabase SQL editor
2. **Enable real-time**: Execute `enable_realtime.sql` to enable real-time subscriptions
3. **Verify setup**: Check that all tables have RLS policies enabled

### Tailwind Configuration

The project includes a custom Tailwind configuration with:

- Dark mode support with persistent preference
- Custom color palette
- Responsive design utilities
- Shadcn/ui component styling

## 🚀 Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
4. Deploy!

### Netlify

1. Build the project: `npm run build`
2. Deploy the `dist` folder to Netlify
3. Add environment variables in Netlify dashboard

## 🐛 Known Issues & Solutions

### Rate Limiting

- The app includes smart rate limiting handling for email verification
- Users will see a countdown timer when hitting rate limits
- This prevents spam and protects the Supabase service

### Email Verification

- Users must verify their email before logging in
- Clear notifications guide users through the process
- Rate limiting protection prevents abuse

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
- [Shadcn/ui](https://ui.shadcn.com) for the beautiful component library
- [Lucide](https://lucide.dev) for the beautiful icons
- [Sonner](https://sonner.emilkowal.ski) for toast notifications
