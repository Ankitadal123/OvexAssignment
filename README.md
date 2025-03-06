# OVEX Request For Quote (RFQ) Application

This application provides a user interface for requesting quotes for cryptocurrency trading using OVEX's public API endpoints. Users can select markets, enter trade amounts, and receive quotes with real-time pricing.

## Features

- Select trading pairs from OVEX's available markets
- Choose between Buy and Sell sides
- Enter trade amounts and get real-time quotes
- View quote details including cost, rate, and amount to receive
- Real-time countdown for quote expiry
- Search markets by currency ID or name

## Prerequisites

Before you begin, ensure you have the following installed:
- [Node.js](https://nodejs.org/) (v18.0.0 or higher recommended)
- npm, yarn, pnpm, or bun package manager

## Getting Started

Follow these steps to set up the project locally:

1. **Clone the repository**

```bash
git clone <repository-url>
cd <repository-name>
```

2. **Install dependencies**

```bash
npm install
# or
yarn install
# or
pnpm install
# or
bun install
```

3. **Run the development server**

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

4. **Open the application**

Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## Project Structure

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## API Integration

The application uses the following OVEX API endpoints:

- **Markets API**: `https://www.ovex.io/api/v2/markets` - Fetches available trading pairs
- **RFQ API**: `https://www.ovex.io/api/v2/rfq/get_quote` - Gets quotes for trades
- **Currencies API**: `https://www.ovex.io/api/v2/currencies?type=coin` - Fetches currency information

All API calls are made server-side through Next.js API routes to enhance security and performance.

## Contributing

To contribute to this project:

1. Create a new branch from `development`:
```bash
git checkout development
git pull
git checkout -b feature/your-feature-name
```

2. Make your changes and commit them with descriptive messages:
```bash
git add .
git commit -m "Add feature: description of your changes"
```

3. Push your branch and create a pull request:
```bash
git push -u origin feature/your-feature-name
```

4. Create a pull request targeting the `development` branch

## Development Guidelines

- Use TypeScript for type safety
- Follow the existing code style and patterns
- Write meaningful commit messages
- Test your changes thoroughly before submitting a PR

## Available Scripts

- `npm run dev` - Start the development server
- `npm run build` - Build the application for production
- `npm run start` - Start the production server
- `npm run lint` - Run ESLint to check code quality

## Troubleshooting

### API Connection Issues

If you encounter issues connecting to the OVEX API:
- Check your internet connection
- Verify that the API endpoints are accessible
- Check the browser console for specific error messages

### Development Server Issues

If the development server fails to start:
- Ensure all dependencies are installed correctly
- Check for conflicting port usage (default is 3000)
- Verify that Node.js is installed and up to date

## Learn More

- [Next.js Documentation](https://nextjs.org/docs) - Learn about Next.js features and API
- [OVEX API Documentation](https://www.ovex.io/api/v2/docs) - Learn about OVEX's API endpoints

## License

[Include license information here]

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
