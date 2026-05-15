'use client';
import { usePathname } from 'next/navigation';
import Link from 'next/link';

const links = [
  { href: '/catalogue', label: '📋 Catalogue', id: 'nav-catalogue' },
  { href: '/flashcards', label: '🎴 Flashcards', id: 'nav-flashcards' },
  { href: '/quiz', label: '🧪 Quiz', id: 'nav-quiz' },
  { href: '/stats', label: '📊 Stats', id: 'nav-stats' },
];

export default function Navbar() {
  const pathname = usePathname();

  return (
    <nav style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000, height: '70px',
      background: 'rgba(10, 10, 15, 0.85)', backdropFilter: 'blur(20px)',
      borderBottom: '1px solid rgba(255,255,255,0.06)',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '0 32px',
    }}>
      <Link href="/" style={{
        display: 'flex', alignItems: 'center', gap: '12px',
        textDecoration: 'none', color: 'inherit',
      }}>
        <span style={{
          fontSize: '1.5rem', fontFamily: 'Orbitron, sans-serif', fontWeight: 800,
          background: 'linear-gradient(135deg, #00FF88, #00D4FF)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          letterSpacing: '2px',
        }}>SASP</span>
        <span style={{
          fontFamily: 'Rajdhani, sans-serif', fontWeight: 600,
          color: '#8a8a9a', fontSize: '0.85rem', letterSpacing: '3px',
          textTransform: 'uppercase',
        }}>Academy</span>
      </Link>
      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
        {links.map(link => {
          const isActive = pathname === link.href;
          return (
            <Link key={link.href} id={link.id} href={link.href} style={{
              padding: '8px 16px', borderRadius: '8px', textDecoration: 'none',
              color: isActive ? '#00FF88' : '#8a8a9a',
              fontFamily: 'Rajdhani, sans-serif', fontWeight: 600,
              fontSize: '0.85rem', letterSpacing: '1px', textTransform: 'uppercase',
              border: `1px solid ${isActive ? 'rgba(0,255,136,0.2)' : 'transparent'}`,
              background: isActive ? 'rgba(0,255,136,0.05)' : 'transparent',
              transition: 'all 0.2s',
            }}>{link.label}</Link>
          );
        })}
      </div>
    </nav>
  );
}
