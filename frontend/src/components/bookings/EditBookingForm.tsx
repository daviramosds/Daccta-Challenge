import { useState } from "react";
import { toast } from "sonner";
import type { Booking } from "../../types";
import { updateBooking } from "../../services/api";
import { X } from "lucide-react";

interface EditBookingFormProps {
  booking: Booking;
  onSuccess: () => void;
  onCancel: () => void;
}

const normalizeTimeFormat = (time: string): string => {
  return time.substring(0, 5);
};

export default function EditBookingForm({ booking, onSuccess, onCancel }: EditBookingFormProps) {
  const [date, setDate] = useState(booking.date.split("T")[0]);
  const [startTime, setStartTime] = useState(normalizeTimeFormat(booking.startTime));
  const [endTime, setEndTime] = useState(normalizeTimeFormat(booking.endTime));
  const [title, setTitle] = useState(booking.title);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();


    if (!date || !startTime || !endTime || !title.trim()) {
      toast.error("Todos os campos são obrigatórios");
      return;
    }

    if (endTime <= startTime) {
      toast.error("Horário de término deve ser maior que o de início");
      return;
    }

    const [year, month, day] = date.split('-').map(Number);
    const selectedDate = new Date(year, month - 1, day);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (selectedDate < today) {
      toast.error("Não é permitido criar agendamentos no passado");
      return;
    }

    try {
      setLoading(true);
      await updateBooking(booking.id, {
        date,
        startTime,
        endTime,
        title: title.trim(),
      });
      toast.success("Agendamento atualizado com sucesso!");
      onSuccess();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="card-base p-6 animate-slide-up">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <span className="w-1.5 h-6 bg-primary rounded-full"></span>
          Editar Agendamento
        </h2>
        <button
          type="button"
          onClick={onCancel}
          className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
        >
          <X size={24} />
        </button>
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Título</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="input-base"
          placeholder="Ex: Reunião de Planejamento"
          disabled={loading}
        />
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Data</label>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="input-base dark:[color-scheme:dark]"
          disabled={loading}
        />
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            Horário Início
          </label>
          <input
            type="time"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            className="input-base dark:[color-scheme:dark]"
            disabled={loading}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            Horário Fim
          </label>
          <input
            type="time"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            className="input-base dark:[color-scheme:dark]"
            disabled={loading}
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full btn-primary py-3 text-base shadow-lg shadow-purple-500/10 hover:shadow-purple-500/20"
      >
        {loading ? "Salvando..." : "Salvar Alterações"}
      </button>
    </form>
  );
}
