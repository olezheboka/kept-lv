# Solījums.lv

Platform for tracking and analyzing political promises in Latvia.

## Tech Stack

- **Framework:** [Next.js 16](https://nextjs.org/) (App Router)
- **Language:** [TypeScript](https://www.typescriptlang.org/)
- **Database:** [PostgreSQL](https://www.postgresql.org/) with [Prisma ORM](https://www.prisma.io/)
- **Authentication:** [NextAuth.js](https://authjs.dev/)
- **Styling:** [Tailwind CSS 4](https://tailwindcss.com/) & [Radix UI](https://www.radix-ui.com/)

## Getting Started

### Prerequisites

- Node.js (Latest LTS recommended)
- PostgreSQL database (Local or hosted like Vercel Postgres/Supabase)

### Installation

1.  **Clone the repository:**
    ```bash
    git clone <repository_url>
    cd kept-lv
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Environment Setup:**
    Create a `.env` file in the root directory and configure your database connection and auth secrets.
    ```bash
    DATABASE_URL="postgresql://user:password@host:port/db_name"
    AUTH_SECRET="your-super-strong-secret"
    # Add other necessary env vars
    ```

4.  **Database Setup:**
    Push the Prisma schema to your database:
    ```bash
    npm run db:push
    ```

    Seed the database with initial data (parties, politicians, categories):
    ```bash
    npm run db:seed
    ```

5.  **Run Development Server:**
    ```bash
    npm run dev
    ```

    Open [http://localhost:3000](http://localhost:3000) to view the application.

## Key Commands

- `npm run dev`: Start development server.
- `npm run build`: Build for production.
- `npm run start`: Start production server.
- `npm run lint`: Run ESLint.
- `npm run db:push`: Push schema changes to the database.
- `npm run db:studio`: Open Prisma Studio to manage data visually.

## File Structure

- `app/`: Next.js App Router pages and layouts.
- `components/ui/`: Reusable UI components.
- `prisma/`: Database schema and seed scripts.
- `lib/`: Utility functions and shared logic.
- `types/`: Custom TypeScript type definitions.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.
