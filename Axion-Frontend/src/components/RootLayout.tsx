import { Outlet } from 'react-router';
import { TopBar } from './TopBar';

export function RootLayout() {
  return (
    <div className="flex flex-col h-screen overflow-hidden bg-[var(--bg-base)]">
      <TopBar />
      <main className="flex-1 overflow-auto p-6">
        <Outlet />
      </main>
    </div>
  );
}
