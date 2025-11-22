# TOURNAMENT - Gaming Tournament Platform

A modern, intense battle royale tournament platform built with MERN stack, featuring a lava and embers color scheme perfect for competitive gaming.

## 🎮 Features

- **Tournament Management**: Browse, filter, and register for BGMI and Free Fire tournaments
- **User Authentication**: Secure registration and login system
- **Leaderboards**: Track top players with stats and earnings
- **Real-time Updates**: Live tournament countdowns and status
- **Responsive Design**: Beautiful UI that works on all devices
- **Custom Styling**: Unique button designs with glow effects and animations

## 🎨 Color Palette

- **Base**: Deep Black (#0F0F0F)
- **Primary Accent**: Lava Orange (#FF4D00)
- **Secondary Accent**: Fiery Yellow (#FFAA00)
- **Supporting**: Charcoal Grey (#1A1A1A)
- **Text**: Off-White (#F0F0F0)

## 🚀 Getting Started

### Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or Atlas)
- npm or yarn

### Installation

1. Clone the repository
```bash
git clone <repository-url>
cd TOURNAMENT
```

2. Install server dependencies
```bash
npm install
```

3. Install client dependencies
```bash
cd client
npm install
cd ..
```

4. Set up environment variables
```bash
cp .env.example .env
# Edit .env with your MongoDB URI and JWT secret
```

5. Start the development server
```bash
npm run dev
```

This will start both the backend server (port 5000) and frontend React app (port 3000).

## 📁 Project Structure

```
TOURNAMENT/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── pages/          # Page components
│   │   ├── App.js          # Main app component
│   │   └── index.js        # Entry point
│   ├── public/
│   └── package.json
├── server/                 # Express backend
│   ├── models/             # MongoDB models
│   ├── routes/             # API routes
│   └── index.js            # Server entry point
├── package.json
└── README.md
```

## 🛠️ Tech Stack

- **Frontend**: React, React Router, Tailwind CSS
- **Backend**: Node.js, Express
- **Database**: MongoDB, Mongoose
- **Authentication**: JWT, bcrypt

## 📝 API Endpoints

### Tournaments
- `GET /api/tournaments` - Get all tournaments
- `GET /api/tournaments/:id` - Get single tournament
- `POST /api/tournaments` - Create tournament (admin)
- `POST /api/tournaments/:id/register` - Register for tournament

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### Users
- `GET /api/users/:id` - Get user profile
- `GET /api/users/leaderboard/top` - Get top players

## 🎯 Pages

- **Home**: Hero section, featured tournaments, how it works, leaderboard preview
- **Tournaments**: Tournament listings with filters and search
- **About Us**: Company story, team, values
- **Contact**: Contact form, FAQ, social links

## 🎨 Custom Components

- **Button**: Primary, secondary, and registration variants with custom animations
- **Navbar**: Responsive navigation with dropdown menus
- **Footer**: Four-column layout with links and newsletter

## 🔒 Security

- Password hashing with bcrypt
- JWT token authentication
- Input validation and sanitization

## 📱 Responsive Design

The website is fully responsive and works seamlessly on:
- Desktop (1920px+)
- Tablet (768px - 1024px)
- Mobile (320px - 767px)

## 🚧 Future Enhancements

- Real-time match updates
- Payment integration
- Team management system
- Live streaming integration
- Advanced analytics dashboard

## 📄 License

ISC

## 👥 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

