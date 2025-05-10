<div align="center">
   
# Privy App Kit - React Native

A mobile chat application that enables interaction with Solana blockchain through natural language conversation. Built with React Native, Expo, and integrated with AI for Solana transaction capabilities.
### Demo
<a href="https://vimeo.com/1076322377">
   <img src="https://github.com/user-attachments/assets/71332279-5886-4321-a9d5-b38eecc94f37" alt="Watch the video" width="600">
</a>
  
</div>

## Features

- Embedded wallet authentication with Privy (Google, Apple, Email)
- Chat interface for natural language interaction with Solana blockchain
- Solana transaction capabilities through AI assistant
- Chat history management
- User profile management

## Demo


## Prerequisites

- Node.js (v16+)
- MongoDB
- OpenAI API Key
- Helius API Key (for Solana RPC access)

## Setup Instructions

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/privy-sak-react-native.git
   cd privy-sak-react-native
   ```

2. Install dependencies:
   ```
   yarn install
   ```

3. Configure environment variables:
   - Copy `.env.local.example` to `.env.local` in root and `.env.example` to `.env` in server directories
   - Fill in the required API keys and configuration
   - Copy `app.example.json` to `app.json` and update with your app's information

4. Start the server:
   ```
   cd server
   yarn dev
   ```

5. Run the app on iOS (Client):
   ```
   npx expo run:ios
   ```

**Note:** This app cannot be run with Expo Go as some polyfills used in the project are not compatible with Expo Go. You must use the development build with `npx expo run:ios` or `npx expo run:android`.

## Environment Variables

The following environment variables are required:

- `OPENAI_API_KEY`: Your OpenAI API key for AI functionality
- `MONGODB_URI`: MongoDB connection string (local by default)
- `HELIUS_STAKED_URL`: Helius RPC URL with API key (Not necessary staked)
- `PORT`: Server port (default: 3001)

## Project Structure

- `src/`: React Native app source code
  - `screens/`: App screens
  - `components/`: Reusable components
  - `hooks/`: Custom React hooks
  - `walletProviders/`: Privy Embedded wallet integration
  - `navigation/`: Navigation setup
  - `assets/`: Images, colors, icons
  - `lib/`: Utility functions and API interactions
  - `state/`: Redux state management

- `server/`: Backend API
  - `controllers/`: API endpoint controllers
  - `models/`: MongoDB models
  - `routes/`: API routes
  - `middleware/`: Custom middleware
  - `db/`: Database connection

