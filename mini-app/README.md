# Mini App

This mini app is designed to provide a responsive layout optimized for both desktop and mobile users. It utilizes React and Next.js, ensuring a seamless experience across different devices.

## Features

- **Responsive Design**: The app automatically adjusts its layout based on the screen size, providing a full-screen experience on both desktop (landscape) and mobile (vertical).
- **Custom Hooks**: The app includes a custom hook for media queries, allowing components to adapt to screen size changes dynamically.
- **Global and Responsive Styles**: CSS files are included to manage global styles and responsive adjustments.

## Project Structure

```
mini-app
├── src
│   ├── components
│   │   ├── Layout.tsx        # Main layout for desktop users
│   │   └── MobileLayout.tsx  # Layout optimized for mobile users
│   ├── styles
│   │   ├── globals.css       # Global CSS styles
│   │   └── responsive.css     # Responsive styles for different screen sizes
│   ├── hooks
│   │   └── useMediaQuery.ts   # Custom hook for media queries
│   ├── utils
│   │   └── constants.ts       # Constants for responsive design
│   └── App.tsx                # Main entry point of the application
├── public
│   └── favicon.ico            # Favicon for the application
├── package.json               # NPM configuration file
├── tsconfig.json              # TypeScript configuration file
├── next.config.js             # Next.js configuration file
├── vercel.json                # Vercel configuration file
└── README.md                  # Project documentation
```

## Setup Instructions

1. **Clone the Repository**: 
   ```
   git clone <repository-url>
   cd mini-app
   ```

2. **Install Dependencies**: 
   ```
   npm install
   ```

3. **Run the Development Server**: 
   ```
   npm run dev
   ```

4. **Open in Browser**: Navigate to `http://localhost:3000` to view the app.

## Usage Guidelines

- The app will automatically detect the device type and render the appropriate layout.
- For desktop users, the app will open in landscape full screen.
- For mobile users, the app will open in vertical full screen.

## Deployment

This app is optimized for deployment on Vercel. Ensure that your Vercel account is set up and follow the deployment instructions provided by Vercel to publish your app.