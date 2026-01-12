import { useState } from 'react';
import { Toaster } from 'sonner';
import RoomList from './components/rooms/RoomList';
import BookingList from './components/bookings/BookingList';
import RoomForm from './components/rooms/RoomForm';
import BookingForm from './components/bookings/BookingForm';
import type { Room } from './types';
import { ThemeProvider } from './contexts/ThemeContext';
import { ParticlesBackground } from './components/ParticlesBackground';
import { ThemeToggle } from './components/ThemeToggle';

function App() {
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [isBookingFormOpen, setIsBookingFormOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleRoomCreated = () => {
    setRefreshKey(prev => prev + 1);
  };

  const handleBookingCreated = () => {
    setIsBookingFormOpen(false);
    setRefreshKey(prev => prev + 1);
  };

  return (
    <ThemeProvider defaultTheme="dark" storageKey="daccta-theme">
      <div className="min-h-screen transition-colors duration-300 relative bg-slate-50 dark:bg-dark-bg text-slate-900 dark:text-gray-100 font-sans selection:bg-primary/30">
        <ParticlesBackground />
        <Toaster
          richColors
          position="top-right"
          theme="system"
          toastOptions={{
            classNames: {
              toast: 'glass !bg-white/90 dark:!bg-dark-card/90 !border-slate-200 dark:!border-slate-700 !text-slate-900 dark:!text-white !shadow-xl',
              title: '!font-bold',
              description: '!text-slate-500 dark:!text-slate-400',
              actionButton: '!bg-primary !text-white',
              cancelButton: '!bg-slate-100 dark:!bg-slate-800 !text-slate-900 dark:!text-white',
              error: '!text-rose-600 dark:!text-rose-400 !border-rose-200 dark:!border-rose-900/30',
              success: '!text-emerald-600 dark:!text-emerald-400 !border-emerald-200 dark:!border-emerald-900/30',
              warning: '!text-amber-600 dark:!text-amber-400 !border-amber-200 dark:!border-amber-900/30',
              info: '!text-blue-600 dark:!text-blue-400 !border-blue-200 dark:!border-blue-900/30',
            }
          }}
        />

        <header className="glass-header sticky top-0 z-50 transition-all duration-300">
          <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <img src="/logo.png" alt="Desafio Daccta" className="h-9 w-auto hover:opacity-90 transition-opacity" />
            </div>
            <div className="flex items-center gap-4">
              <ThemeToggle />
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 py-10 sm:px-6 lg:px-8">
          {!selectedRoom ? (
            <div className="grid grid-cols-1 lg:col-span-2 lg:grid-cols-3 gap-8 animate-fade-in">
              <div className="lg:col-span-2">
                <RoomList
                  onSelectRoom={setSelectedRoom}
                  onRefresh={refreshKey}
                />
              </div>
              <div>
                <RoomForm onSuccess={handleRoomCreated} />
              </div>
            </div>
          ) : (
            <div className="animate-slide-in">
              <button
                onClick={() => {
                  setSelectedRoom(null);
                  setIsBookingFormOpen(false);
                }}
                className="mb-6 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white font-medium flex items-center gap-2 transition-colors"
              >
                ← Voltar para salas
              </button>

              {isBookingFormOpen ? (
                <div className="max-w-2xl mx-auto">
                  <BookingForm
                    room={selectedRoom}
                    onSuccess={handleBookingCreated}
                    onCancel={() => setIsBookingFormOpen(false)}
                  />
                </div>
              ) : (
                <BookingList
                  room={selectedRoom}
                  onRefresh={refreshKey}
                  onNewBooking={() => setIsBookingFormOpen(true)}
                />
              )}
            </div>
          )}
        </main>
      </div>
    </ThemeProvider>
  );
}

export default App;
