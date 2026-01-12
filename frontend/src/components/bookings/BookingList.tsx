import { useState, useEffect } from "react";
import { toast } from "sonner";
import type { Room, Booking } from "../../types";
import { getBookings, deleteBooking } from "../../services/api";
import EditBookingForm from "./EditBookingForm";
import { Calendar, Clock, Edit2, Trash2, X } from "lucide-react";

interface BookingListProps {
  room: Room;
  onRefresh: number;
  onNewBooking: () => void;
}

export default function BookingList({ room, onRefresh, onNewBooking }: BookingListProps) {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filterType, setFilterType] = useState<"single" | "range">("single");
  const [selectedDate, setSelectedDate] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [editingBooking, setEditingBooking] = useState<Booking | null>(null);

  useEffect(() => {
    loadBookings();
  }, [room.id, selectedDate, startDate, endDate, onRefresh]);

  const loadBookings = async () => {
    try {
      setLoading(true);
      setError("");


      const dateParam = filterType === "single" ? selectedDate : undefined;
      const data = await getBookings(room.id, dateParam || undefined);


      let filteredData = data;
      if (filterType === "range" && startDate && endDate) {
        filteredData = data.filter((booking) => {
          const bookingDate = booking.date.split("T")[0];
          return bookingDate >= startDate && bookingDate <= endDate;
        });
      }

      setBookings(filteredData);
    } catch (err: any) {
      setError(err.message);
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("pt-BR");
  };

  const handleDelete = async (id: string, title: string) => {
    toast.custom((t) => (
      <div className="card-base p-6 w-full max-w-sm shadow-2xl relative overflow-hidden">
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-3 text-rose-600 dark:text-rose-400">
            <div className="p-2 bg-rose-100 dark:bg-rose-900/30 rounded-full">
              <Trash2 size={24} />
            </div>
            <h3 className="font-bold text-lg text-slate-900 dark:text-white">Cancelar Agendamento</h3>
          </div>

          <p className="text-slate-600 dark:text-slate-300">
            Tem certeza que deseja cancelar o agendamento <span className="font-bold text-slate-900 dark:text-white">"{title}"</span>?
          </p>

          <div className="flex gap-3 mt-2">
            <button
              onClick={() => toast.dismiss(t)}
              className="flex-1 btn-secondary justify-center"
            >
              Não, manter
            </button>
            <button
              onClick={async () => {
                toast.dismiss(t);
                try {
                  await deleteBooking(id);
                  toast.success("Agendamento cancelado com sucesso!");
                  loadBookings();
                } catch (err: any) {
                  toast.error(err.message);
                }
              }}
              className="flex-1 btn-danger justify-center bg-rose-600 hover:bg-rose-700 text-white dark:bg-rose-600 dark:hover:bg-rose-700 border-none"
            >
              Sim, cancelar
            </button>
          </div>
        </div>
      </div>
    ), { duration: Infinity });
  };

  const handleEditSuccess = () => {
    setEditingBooking(null);
    loadBookings();
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
        {error}
      </div>
    );
  }

  if (editingBooking) {
    return (
      <EditBookingForm
        booking={editingBooking}
        onSuccess={handleEditSuccess}
        onCancel={() => setEditingBooking(null)}
      />
    );
  }

  const clearFilters = () => {
    setSelectedDate("");
    setStartDate("");
    setEndDate("");
  };

  const hasActiveFilter = filterType === "single" ? selectedDate : (startDate || endDate);

  return (
    <div className="card-base p-4 sm:p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          Agendamentos
          <span className="text-slate-400 font-normal hidden sm:inline">•</span>
          <span className="text-primary font-medium text-base hidden sm:inline">{room.name}</span>
        </h2>
        <button
          onClick={onNewBooking}
          className="btn-primary"
        >
          <Calendar size={18} />
          <span className="hidden sm:inline">Novo Agendamento</span>
        </button>
      </div>

      <div className="mb-6 space-y-4">
        <div className="flex bg-slate-100 dark:bg-dark-card p-1 rounded-lg w-fit border border-slate-200 dark:border-slate-700/50">
          <button
            onClick={() => setFilterType("single")}
            className={`px-4 py-2 rounded-md font-medium text-sm transition-all ${filterType === "single"
              ? "bg-white dark:bg-slate-700 text-primary shadow-sm"
              : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
              }`}
          >
            Data Única
          </button>
          <button
            onClick={() => setFilterType("range")}
            className={`px-4 py-2 rounded-md font-medium text-sm transition-all ${filterType === "range"
              ? "bg-white dark:bg-slate-700 text-primary shadow-sm"
              : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
              }`}
          >
            Período
          </button>
        </div>

        {filterType === "single" ? (
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Filtrar por Data
            </label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="input-base dark:[color-scheme:dark]"
            />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Data Início
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="input-base dark:[color-scheme:dark]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Data Fim
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                min={startDate}
                className="input-base dark:[color-scheme:dark]"
              />
            </div>
          </div>
        )}

        {hasActiveFilter && (
          <button
            onClick={clearFilters}
            className="text-sm text-primary dark:text-primary hover:text-primary-hover dark:hover:text-primary-hover font-medium"
          >
            Limpar filtro
          </button>
        )}
      </div>

      <div className="space-y-4">
        {bookings.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            {hasActiveFilter
              ? "Nenhum agendamento encontrado neste período"
              : "Nenhum agendamento encontrado"}
          </div>
        ) : (
          bookings.map((booking, index) => (
            <div
              key={booking.id}
              className={`group card-base card-hover-effect p-5 animate-slide-up ${index <= 3 ? `stagger-${index + 1}` : ''}`}
            >
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-slate-900 dark:text-white text-lg mb-2 group-hover:text-primary transition-colors">
                    {booking.title}
                  </h3>
                  <div className="space-y-1.5 hidden sm:block">
                    <p className="text-slate-500 dark:text-slate-400 flex items-center gap-2 text-sm">
                      <Calendar size={16} className="text-primary/70" />
                      <span className="font-medium text-slate-700 dark:text-slate-300">{formatDate(booking.date)}</span>
                    </p>
                    <p className="text-slate-500 dark:text-slate-400 flex items-center gap-2 text-sm">
                      <Clock size={16} className="text-primary/70" />
                      <span>{booking.startTime} - {booking.endTime}</span>
                    </p>
                  </div>
                  { }
                  <div className="sm:hidden flex flex-wrap gap-2 text-xs text-slate-500 dark:text-slate-400">
                    <span className="bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded font-medium text-slate-700 dark:text-slate-300">
                      {formatDate(booking.date)}
                    </span>
                    <span className="bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded font-medium text-slate-700 dark:text-slate-300">
                      {booking.startTime}-{booking.endTime}
                    </span>
                  </div>
                </div>
                <div className="flex gap-2 sm:ml-4 flex-shrink-0 pt-1">
                  <button
                    onClick={() => setEditingBooking(booking)}
                    className="btn-secondary py-2 px-3 text-sm h-10"
                    title="Editar"
                  >
                    <Edit2 size={16} />
                    <span className="hidden sm:inline">Editar</span>
                  </button>
                  <button
                    onClick={() => handleDelete(booking.id, booking.title)}
                    className="btn-danger py-2 px-3 text-sm h-10"
                    title="Deletar"
                  >
                    <Trash2 size={16} />
                    <span className="hidden sm:inline">Deletar</span>
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
