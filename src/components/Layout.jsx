import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { Music } from 'lucide-react';
import MusicalChat from './MusicalChat';

export default function Layout() {
    const location = useLocation();

    return (
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            <header style={{ borderBottom: '1px solid var(--bg-secondary)', padding: '1rem 0', backgroundColor: 'rgba(15, 23, 42, 0.8)', backdropFilter: 'blur(8px)', position: 'sticky', top: 0, zIndex: 10 }}>
                <div className="container" style={{ padding: '0 2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none', color: 'var(--text-primary)', fontWeight: 'bold', fontSize: '1.25rem' }}>
                        <Music color="var(--accent)" />
                        <span>MusicApp</span>
                    </Link>

                    <nav style={{ display: 'flex', gap: '1rem' }}>
                        <Link to="/sight-reading" className={`nav-link ${location.pathname === '/sight-reading' ? 'active' : ''}`}>Lectura</Link>
                        <Link to="/intervals" className={`nav-link ${location.pathname === '/intervals' ? 'active' : ''}`}>Intervalos</Link>
                        <Link to="/dictation" className={`nav-link ${location.pathname === '/dictation' ? 'active' : ''}`}>Dictados</Link>
                    </nav>
                </div>
            </header>

            <main style={{ flex: 1 }}>
                <Outlet />
            </main>

            <footer style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)', borderTop: '1px solid var(--bg-secondary)' }}>
                <p>© 2025 MusicApp - Pedagogía Musical Interactiva</p>
            </footer>

            <MusicalChat />
        </div>
    );
}
