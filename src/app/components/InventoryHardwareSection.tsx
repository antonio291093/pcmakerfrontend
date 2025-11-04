'use client';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Swal from 'sweetalert2';
import {
  FaMicrochip,
  FaMemory,
  FaHdd,
  FaPlus,
  FaEdit,
  FaTrash,
} from 'react-icons/fa';

interface InventarioItem {
  id: number;
  tipo: string;
  descripcion: string;
  cantidad: number;
  disponibilidad: boolean;
  estado: string;
  sucursal_id: number;
}

export default function InventoryHardwareSection() {
  const [inventario, setInventario] = useState<InventarioItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [editando, setEditando] = useState<InventarioItem | null>(null);

  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  // 🔹 Cargar inventario desde el backend
  const cargarInventario = async () => {
    try {
      setLoading(true);
      const resp = await fetch(`${API_URL}/api/inventario`, {
        credentials: 'include',
      });
      if (!resp.ok) throw new Error('Error al obtener inventario');
      const data = await resp.json();
      setInventario(data);
    } catch (err) {
      console.error('Error cargando inventario:', err);
      Swal.fire('Error', 'No se pudo cargar el inventario', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarInventario();
  }, []);

  // 🔹 Cuando el usuario elige editar un artículo
  useEffect(() => {
    if (editando) {
      Swal.fire({
        title: 'Editar artículo',
        html: `
          <input id="swal-descripcion" class="swal2-input" value="${editando.descripcion}" placeholder="Descripción">
          <input id="swal-cantidad" type="number" class="swal2-input" value="${editando.cantidad}" placeholder="Cantidad">
        `,
        focusConfirm: false,
        showCancelButton: true,
        confirmButtonText: 'Guardar cambios',
        cancelButtonText: 'Cancelar',
        preConfirm: () => {
          const descripcion = (document.getElementById('swal-descripcion') as HTMLInputElement).value;
          const cantidad = parseInt((document.getElementById('swal-cantidad') as HTMLInputElement).value);

          if (!descripcion || isNaN(cantidad)) {
            Swal.showValidationMessage('Todos los campos son obligatorios');
            return null;
          }

          return { ...editando, descripcion, cantidad };
        },
      }).then((res) => {
        if (res.isConfirmed && res.value) {
          guardarInventario(res.value as InventarioItem);
        } else {
          setEditando(null); // Cancelado
        }
      });
    }
  }, [editando]);


  // 🔸 Guardar nuevo o editar existente
  const guardarInventario = async (item: InventarioItem) => {
    try {
      const metodo = editando ? 'PUT' : 'POST';
      const url = editando
        ? `${API_URL}/api/inventario/${editando.id}`
        : `${API_URL}/api/inventario/general`;

      const resp = await fetch(url, {
        method: metodo,
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(item),
      });

      if (!resp.ok) throw new Error('Error guardando inventario');
      const nuevo = await resp.json();

      if (editando) {
        nuevo.descripcion = nuevo.descripcion || nuevo.especificacion;
        setInventario((prev) =>
          prev.map((i) => (i.id === nuevo.id ? nuevo : i))
        );
        Swal.fire('Actualizado', 'El artículo se actualizó correctamente', 'success');
      } else {
        nuevo.descripcion = nuevo.descripcion || nuevo.especificacion;
        setInventario((prev) => [nuevo, ...prev]);
        Swal.fire('Agregado', 'Artículo agregado al inventario', 'success');
      }

      setEditando(null);
    } catch (err) {
      console.error(err);
      Swal.fire('Error', 'No se pudo guardar el artículo', 'error');
    }
  };

  // 🔸 Eliminar artículo
  const eliminarInventario = async (id: number) => {
    const confirm = await Swal.fire({
      title: '¿Eliminar artículo?',
      text: 'Esta acción no se puede deshacer',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
    });

    if (!confirm.isConfirmed) return;

    try {
      const resp = await fetch(`${API_URL}/api/inventario/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (!resp.ok) throw new Error('Error eliminando artículo');
      setInventario((prev) => prev.filter((i) => i.id !== id));
      Swal.fire('Eliminado', 'Artículo eliminado correctamente', 'success');
    } catch (err) {
      console.error(err);
      Swal.fire('Error', 'No se pudo eliminar el artículo', 'error');
    }
  };

  // 🔹 Selección de ícono por tipo
  const obtenerIcono = (tipo: string) => {
    switch (tipo.toLowerCase()) {
      case 'ram':
      case 'memoria':
        return <FaMemory className="text-indigo-600 text-2xl" />;
      case 'disco':
      case 'ssd':
      case 'hdd':
        return <FaHdd className="text-amber-600 text-2xl" />;
      case 'fuente':
      case 'psu':
        return <FaMicrochip className="text-green-600 text-2xl" />;
      default:
        return <FaMicrochip className="text-gray-500 text-2xl" />;
    }
  };

  if (loading) {
    return (
      <div className="text-center text-gray-500 py-6">Cargando inventario...</div>
    );
  }

  return (
    <motion.div
      initial={{ y: 30, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 70 }}
      className="bg-white p-6 rounded-xl shadow w-full"
    >
      <div className="flex justify-between items-center mb-4">
        <h2 className="font-semibold text-lg text-gray-700">
          Inventario de Hardware y Accesorios
        </h2>
        <button
          onClick={() =>
            Swal.fire({
              title: 'Agregar nuevo artículo',
              html: `
                <input id="swal-descripcion" class="swal2-input" placeholder="Descripción">
                <select id="swal-estado" class="swal2-select">
                  <option value="nuevo">Nuevo</option>
                  <option value="usado" selected>Usado</option>
                </select>
              `,
              focusConfirm: false,
              showCancelButton: true,
              confirmButtonText: 'Guardar',
              cancelButtonText: 'Cancelar',
              preConfirm: () => {
                const descripcion = (document.getElementById('swal-descripcion') as HTMLInputElement).value;
                const estado = (document.getElementById('swal-estado') as HTMLSelectElement).value;

                if (!descripcion.trim()) {
                  Swal.showValidationMessage('La descripción es obligatoria');
                  return null;
                }

                return { descripcion, estado };
              },
            }).then((res) => {
              if (res.isConfirmed && res.value) {
                const { descripcion, estado } = res.value;
                guardarInventario({
                  id: 0,
                  tipo: 'Otro',
                  descripcion,
                  cantidad: 1,
                  disponibilidad: true,
                  estado,
                  sucursal_id: 1,
                } as InventarioItem);
              }
            })
          }
          className="flex items-center gap-2 bg-indigo-600 text-white px-3 py-2 rounded-lg shadow hover:bg-indigo-700"
        >
          <FaPlus /> Agregar
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {inventario.map((item) => (
          <motion.div
            key={item.id}
            whileHover={{ scale: 1.02 }}
            className="p-4 rounded-lg bg-gray-50 shadow-sm border border-gray-100 flex flex-col items-start"
          >
            <div className="flex items-center gap-3 mb-2">
              {obtenerIcono(item.tipo)}
              <span className="font-semibold text-gray-800">{item.descripcion}</span>
            </div>
            <span className="text-sm text-gray-600">
              Cantidad: {item.cantidad}
            </span>
            <span className="text-xs text-gray-400 mt-1">
              Estado: {item.estado}
            </span>

            <div className="flex gap-3 mt-4">
              <button
                onClick={() => setEditando(item)}
                className="text-blue-600 hover:text-blue-800"
              >
                <FaEdit />
              </button>
              <button
                onClick={() => eliminarInventario(item.id)}
                className="text-red-500 hover:text-red-700"
              >
                <FaTrash />
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
