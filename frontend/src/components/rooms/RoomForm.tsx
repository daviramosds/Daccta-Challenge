import { useState } from "react";
import { toast } from "sonner";
import { createRoom } from "../../services/api";
import { Plus } from "lucide-react";

interface RoomFormProps {
  onSuccess: () => void;
}

export default function RoomForm({ onSuccess }: RoomFormProps) {
  const [name, setName] = useState("");
  const [capacity, setCapacity] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();


    if (!name.trim()) {
      toast.error("Nome é obrigatório");
      return;
    }

    const capacityNum = parseInt(capacity);
    if (!capacity || capacityNum <= 0) {
      toast.error("Capacidade deve ser maior que zero");
      return;
    }

    try {
      setLoading(true);
      await createRoom({ name: name.trim(), capacity: capacityNum });
      setName("");
      setCapacity("");
      toast.success("Sala criada com sucesso!");
      onSuccess();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="card-base p-6 animate-slide-up">
      <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
        <span className="w-1.5 h-6 bg-primary rounded-full"></span>
        Nova Sala
      </h2>

      <div className="mb-5">
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
          Nome da Sala
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="input-base"
          placeholder="Ex: Sala de Reunião A"
          disabled={loading}
        />
      </div>

      <div className="mb-6">
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
          Capacidade
        </label>
        <input
          type="number"
          value={capacity}
          onChange={(e) => setCapacity(e.target.value)}
          className="input-base"
          placeholder="Ex: 10"
          min="1"
          disabled={loading}
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full btn-primary py-3 text-base shadow-lg shadow-green-500/10 hover:shadow-green-500/20 bg-emerald-600 hover:bg-emerald-700"
      >
        <Plus size={20} />
        {loading ? "Criando..." : "Criar Sala"}
      </button>
    </form>
  );
}
