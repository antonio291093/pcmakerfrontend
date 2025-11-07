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
  FaHeadphones,
  FaUsb,
  FaMouse,
  FaKeyboard,
  FaWifi,
  FaCamera,
  FaGamepad,
  FaTools,
  FaQuestionCircle
} from 'react-icons/fa';

interface InventarioItem {
  id: number;
  tipo: string;
  descripcion?: string;
  especificacion?: string;
  cantidad: number;
  disponibilidad: boolean;
  estado: string;
  sucursal_id: number;
  precio?: number; // ✅ Nuevo campo
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

  // 🔹 Modal de edición de artículo
  useEffect(() => {
    if (editando) {
      Swal.fire({
        title: 'Editar artículo',
        html: `
          <input id="swal-descripcion" class="swal2-input" value="${editando.descripcion || ''}" placeholder="Descripción">
          <input id="swal-cantidad" type="number" class="swal2-input" value="${editando.cantidad}" placeholder="Cantidad">
          <input id="swal-precio" type="number" step="0.01" min="0" class="swal2-input" value="${editando.precio || 0}" placeholder="Precio (MXN)">
        `,
        focusConfirm: false,
        showCancelButton: true,
        confirmButtonText: 'Guardar cambios',
        cancelButtonText: 'Cancelar',
        preConfirm: () => {
          const descripcion = (document.getElementById('swal-descripcion') as HTMLInputElement).value;
          const cantidad = parseInt((document.getElementById('swal-cantidad') as HTMLInputElement).value);
          const precio = parseFloat((document.getElementById('swal-precio') as HTMLInputElement).value);

          if (!descripcion || isNaN(cantidad) || isNaN(precio)) {
            Swal.showValidationMessage('Todos los campos son obligatorios');
            return null;
          }

          return { ...editando, descripcion, cantidad, precio };
        },
      }).then((res) => {
        if (res.isConfirmed && res.value) {
          guardarInventario(res.value as InventarioItem);
        } else {
          setEditando(null);
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

      nuevo.descripcion = nuevo.descripcion || nuevo.especificacion;

      if (editando) {
        setInventario((prev) =>
          prev.map((i) => (i.id === nuevo.id ? nuevo : i))
        );
        Swal.fire('Actualizado', 'El artículo se actualizó correctamente', 'success');
      } else {
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

  const obtenerIcono = (tipo: string, especificacion?: string) => {
    const texto = `${tipo} ${especificacion || ''}`.toLowerCase().trim();
    if (texto.includes('ram') || texto.includes('ddr')) return <FaMemory className="text-indigo-600 text-3xl" />;
    if (texto.includes('ssd') || texto.includes('hdd') || texto.includes('disco')) return <FaHdd className="text-amber-600 text-3xl" />;
    if (texto.includes('mouse')) return <FaMouse className="text-blue-600 text-3xl" />;
    if (texto.includes('teclado') || texto.includes('keyboard')) return <FaKeyboard className="text-gray-700 text-3xl" />;
    if (texto.includes('audifono') || texto.includes('auricular') || texto.includes('headset')) return <FaHeadphones className="text-pink-600 text-3xl" />;
    if (texto.includes('gamepad') || texto.includes('control')) return <FaGamepad className="text-purple-600 text-3xl" />;
    if (texto.includes('usb') || texto.includes('adaptador') || texto.includes('bluetooth')) return <FaUsb className="text-orange-600 text-3xl" />;
    if (texto.includes('router') || texto.includes('wifi') || texto.includes('network')) return <FaWifi className="text-green-600 text-3xl" />;
    if (texto.includes('camara') || texto.includes('webcam')) return <FaCamera className="text-rose-600 text-3xl" />;
    if (texto.includes('cable') || texto.includes('tipo c') || texto.includes('hdmi')) return <FaTools className="text-teal-600 text-3xl" />;
    if (texto.includes('fuente') || texto.includes('psu')) return <FaMicrochip className="text-green-600 text-3xl" />;
    return <FaQuestionCircle className="text-gray-400 text-3xl" />;
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
                <input id="swal-precio" type="number" step="0.01" min="0" class="swal2-input" placeholder="Precio (MXN)">
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
                const precio = parseFloat((document.getElementById('swal-precio') as HTMLInputElement).value);
                const estado = (document.getElementById('swal-estado') as HTMLSelectElement).value;

                if (!descripcion.trim() || isNaN(precio)) {
                  Swal.showValidationMessage('Todos los campos son obligatorios');
                  return null;
                }

                return { descripcion, precio, estado };
              },
            }).then((res) => {
              if (res.isConfirmed && res.value) {
                const { descripcion, precio, estado } = res.value;
                guardarInventario({
                  id: 0,
                  tipo: 'Otro',
                  descripcion,
                  cantidad: 1,
                  disponibilidad: true,
                  estado,
                  sucursal_id: 1,
                  precio,
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
              {obtenerIcono(item.tipo, item.especificacion || item.descripcion)}
              <span className="font-semibold text-gray-800">
                {item.descripcion || item.especificacion}
              </span>
            </div>
            <span className="text-sm text-gray-600">
              Cantidad: {item.cantidad}
            </span>
            <span className="text-sm text-gray-600">
              💲 Precio: {Number(item.precio || 0).toFixed(2)} MXN
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
