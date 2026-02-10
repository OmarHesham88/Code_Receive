# Code Receive - Email Verification Dashboard

This is a **Next.js** application that monitors a Gmail inbox for verification codes and displays them in a real-time dashboard.

## Features

- **Real-time Monitoring**: Automatically fetches verification codes from emails.
- **Secure Architecture**: Uses a local SQLite database to store codes, preventing IMAP rate limits.
- **Privacy Focused**: "Protected" codes (e.g., password resets) can be masked.
- **Multi-language Support**: English and Arabic UI.

## Requirements

- Node.js 18+
- A Gmail account with 2-Step Verification enabled and an App Password.

## Setup

1.  **Install Dependencies**:
    ```bash
    npm install
    ```

2.  **Configure Environment**:
    Copy `.env.example` to `.env` and fill in your details:
    ```bash
    cp .env.example .env
    ```
    - `IMAP_USER`: Your Gmail address.
    - `IMAP_PASSWORD`: Your App Password (not your login password).
    - `AUTHORIZED_INBOX`: The email address allowed to access the dashboard (usually same as IMAP_USER).
    - `ADMIN_PASSWORDS`: Comma-separated list of admin passwords.

3.  **Initialize Database**:
    ```bash
    npx prisma db push
    ```

4.  **Run the App**:
    ```bash
    npm run dev
    ```
    Open [http://localhost:3000](http://localhost:3000).

## Architecture

- **Frontend**: Next.js (React)
- **Backend**: Next.js API Routes
- **Database**: SQLite (via Prisma)
- **Email Fetching**: `imapflow` + `mailparser` (Background Sync)

## License

ISC
