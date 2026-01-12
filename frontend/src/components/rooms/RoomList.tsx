import { useState, useEffect } from "react";
import { toast } from "sonner";
import type { Room } from "../../types";
import { getRooms, deleteRoom } from "../../services/api";
import { Trash2, Calendar, LayoutGrid, List } from "lucide-react";

interface RoomListProps {
  onSelectRoom: (room: Room) => void;
  onRefresh: number;
}

export default function RoomList({ onSelectRoom, onRefresh }: RoomListProps) {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  useEffect(() => {
    loadRooms();
  }, [onRefresh]);

  const loadRooms = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await getRooms();
      setRooms(data);
    } catch (err: any) {
      setError(err.message);
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    toast.custom((t) => (
      <div className="card-base p-6 w-full max-w-sm shadow-2xl relative overflow-hidden">
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-3 text-rose-600 dark:text-rose-400">
            <div className="p-2 bg-rose-100 dark:bg-rose-900/30 rounded-full">
              <Trash2 size={24} />
            </div>
            <h3 className="font-bold text-lg text-slate-900 dark:text-white">Excluir Sala</h3>
          </div>

          <p className="text-slate-600 dark:text-slate-300">
            Tem certeza que deseja excluir a sala <span className="font-bold text-slate-900 dark:text-white">"{name}"</span>?
            Esta ação não pode ser desfeita.
          </p>

          <div className="flex gap-3 mt-2">
            <button
              onClick={() => toast.dismiss(t)}
              className="flex-1 btn-secondary justify-center"
            >
              Cancelar
            </button>
            <button
              onClick={async () => {
                toast.dismiss(t);
                try {
                  await deleteRoom(id);
                  toast.success("Sala deletada com sucesso!");
                  loadRooms();
                } catch (err: any) {
                  toast.error(err.message);
                }
              }}
              className="flex-1 btn-danger justify-center bg-rose-600 hover:bg-rose-700 text-white dark:bg-rose-600 dark:hover:bg-rose-700 border-none"
            >
              Excluir
            </button>
          </div>
        </div>
      </div>
    ), { duration: Infinity });
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

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Salas de Reunião</h2>
        <div className="flex gap-2 bg-white dark:bg-dark-card border border-slate-200 dark:border-slate-700 rounded-lg p-1 transition-colors">
          <button
            onClick={() => setViewMode("grid")}
            className={`p-2 rounded-lg transition-all ${viewMode === "grid"
              ? "bg-primary/10 text-primary font-medium"
              : "text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              }`}
            title="Visualização em cards"
          >
            <LayoutGrid size={20} />
          </button>
          <button
            onClick={() => setViewMode("list")}
            className={`p-2 rounded-lg transition-all ${viewMode === "list"
              ? "bg-primary/10 text-primary font-medium"
              : "text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              }`}
            title="Visualização em lista"
          >
            <List size={20} />
          </button>
        </div>
      </div>

      {rooms.length === 0 ? (
        <div className="col-span-full text-center py-12 text-gray-500">
          Nenhuma sala cadastrada
        </div>
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {rooms.map((room, index) => (
            <div
              key={room.id}
              className={`card-base card-hover-effect p-6 flex flex-col group h-full relative animate-slide-up ${index <= 3 ? `stagger-${index + 1}` : ''}`}
            >
              <button
                onClick={() => handleDelete(room.id, room.name)}
                className="absolute top-4 right-4 p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg transition-all opacity-100 sm:opacity-0 group-hover:opacity-100 cursor-pointer"
                title="Excluir sala"
              >
                <Trash2 size={18} />
              </button>

              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2 pr-8">
                {room.name}
              </h3>

              <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 mb-6 flex-1">
                <span className="text-sm font-medium">Capacidade:</span>
                <span className="font-bold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-sm">{room.capacity}</span>
                <span className="text-sm">pessoas</span>
              </div>

              <div className="mt-auto">
                <button
                  onClick={() => onSelectRoom(room)}
                  className="w-full btn-primary group-hover:shadow-primary/30"
                >
                  <Calendar size={18} />
                  Agendamentos
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {rooms.map((room) => (
            <div
              key={room.id}
              className="card-base card-hover-effect p-4 flex items-center justify-between"
            >
              <div className="flex-1">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  {room.name}
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-2">
                  <span className="font-medium">Capacidade:</span>
                  <span className="bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-xs font-bold text-slate-700 dark:text-slate-300">{room.capacity} pessoas</span>
                </p>
              </div>
              <div className="flex gap-3 ml-4">
                <button
                  onClick={() => onSelectRoom(room)}
                  className="btn-primary py-2 text-sm"
                >
                  <Calendar size={16} />
                  Ver
                </button>
                <button
                  onClick={() => handleDelete(room.id, room.name)}
                  className="btn-danger py-2 px-3"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
