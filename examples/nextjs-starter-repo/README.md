# Solana Agent Kit Next.js Starter

This is a starter template demonstrating how to integrate the Solana Agent Kit with a Next.js frontend application.

## Features

- Real-time chat interface with Solana Agent
- Handles Solana blockchain interactions
- Built with Next.js 14 and TypeScript
- Fully typed responses and actions

## Getting Started

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Copy `.env.example` to `.env.local` and fill in your environment variables:
   ```
   OPENAI_API_KEY=your_api_key_here
   ```
4. Run the development server:
   ```bash
   npm run dev
   ```
5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Project Structure

- `/src/app` - Next.js app router pages and API routes
- `/src/components` - React components for the chat interface
- `/src/lib` - Utility functions and Solana Agent setup

## Usage

The chat interface allows users to:
- Send messages to the Solana Agent
- Receive responses with blockchain information
- Execute Solana transactions (when implemented)

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
