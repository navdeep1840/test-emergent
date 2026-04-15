import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import POSTerminal from './components/POSTerminal';
import BillHistory from './components/BillHistory';
import MenuManagement from './components/MenuManagement';

function App() {
  const [activeView, setActiveView] = useState('pos');

  return (
    <div className="flex min-h-screen bg-cafe-surface-alt" data-testid="app-container">
      <Sidebar activeView={activeView} setActiveView={setActiveView} />
      <main className="ml-20 xl:ml-64 flex-1 min-h-screen p-4 sm:p-6 lg:p-8">
        {activeView === 'pos' && <POSTerminal />}
        {activeView === 'history' && <BillHistory />}
        {activeView === 'menu' && <MenuManagement />}
      </main>
    </div>
  );
}

export default App;
