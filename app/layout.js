import './globals.css';
import Navbar from '@/components/Navbar';

export const metadata = {
  title: 'SASP Academy — Révision Véhicules GTA V',
  description: 'Application de révision pour identifier tous les véhicules de GTA V. Prépare-toi pour l\'épreuve d\'identification véhicule de la SASP.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="fr">
      <body>
        <Navbar />
        <main style={{ paddingTop: '70px', minHeight: '100vh' }}>
          {children}
        </main>
      </body>
    </html>
  );
}
