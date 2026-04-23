import '@/styles/globals.css';
import { AuthProvider } from '@/context/AuthContext';

export const metadata = {
  title: 'StockPulse — Real-Time Stock Intelligence',
  description: 'Get live curated news for every stock in Indian and International markets — delivered the moment it breaks.',
  keywords: 'stock news, NSE, BSE, NASDAQ, NYSE, live market news, stock alerts',
  openGraph: {
    title: 'StockPulse — Real-Time Stock Intelligence',
    description: 'Live stock news for Indian and International markets.',
    type: 'website',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,400&display=swap" rel="stylesheet" />
      </head>
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
