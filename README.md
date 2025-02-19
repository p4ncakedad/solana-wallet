# Solana Wallet Balance Checker

A Next.js web application that allows users to check SOL and token balances for any Solana wallet address. Built with Next.js, TailwindCSS, and Solana Web3.js.

## Features

- Check SOL balance for any Solana wallet address
- View all SPL token balances
- Clean and responsive UI
- Real-time balance updates
- Devnet connection for testing

## Prerequisites

- Node.js 16.8 or later
- npm or yarn package manager

## Getting Started

1. Clone the repository:
```bash
git clone <your-repo-url>
cd <your-repo-name>
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Run the development server:
```bash
npm run dev
# or
yarn dev
```

4. Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Deployment on Vercel

The easiest way to deploy this app is to use the [Vercel Platform](https://vercel.com).

1. Create a Vercel account if you haven't already
2. Install the Vercel CLI:
```bash
npm install -g vercel
```

3. Deploy the app:
```bash
vercel
```

Alternatively, you can connect your GitHub repository to Vercel for automatic deployments:

1. Push your code to GitHub
2. Import your repository on Vercel
3. Vercel will detect it's a Next.js app and set up the build configuration automatically
4. Your app will be deployed and you'll get a URL to access it

## Environment Variables

No environment variables are required for basic functionality as the app uses the Solana devnet. For production, you might want to switch to mainnet-beta by updating the connection in `src/utils/solana.ts`.

## Built With

- [Next.js](https://nextjs.org/) - The React framework
- [TailwindCSS](https://tailwindcss.com/) - Utility-first CSS framework
- [@solana/web3.js](https://solana-labs.github.io/solana-web3.js/) - Solana JavaScript API
- [@solana/spl-token](https://www.npmjs.com/package/@solana/spl-token) - SPL Token JavaScript API

## License

This project is licensed under the MIT License. 