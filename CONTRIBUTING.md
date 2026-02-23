# Contributing to LastRunX

Thank you for your interest in contributing to LastRunX!

## Development Setup

1. Clone the repository
2. Copy `.env.example` to `.env` and fill in your credentials
3. Install dependencies: `npm install`
4. Run Prisma migrations: `npx prisma migrate dev`
5. Seed the database: `npx prisma db seed`
6. Start development server: `npm run dev`

## Project Structure

- `/app` - Next.js 14 App Router pages
- `/components` - Reusable React components
- `/lib` - Utility functions and configurations
- `/prisma` - Database schema and migrations
- `/public` - Static assets

## Tech Stack

- Next.js 14 with App Router
- TypeScript
- Prisma ORM
- PostgreSQL
- NextAuth.js for authentication
- TailwindCSS for styling

## Coding Standards

- Use TypeScript for type safety
- Follow existing code structure and naming conventions
- Write meaningful commit messages
- Test your changes thoroughly

## Need Help?

Open an issue for bugs or feature requests.
