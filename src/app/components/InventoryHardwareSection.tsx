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
  FaQuestionCircle,
  FaLaptopCode,
  FaStore
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
  precio?: number;
}

interface EquipoArmado {
  id: number;
  nombre: string;
  procesador: string;
  etiqueta: string;
  sucursal_nombre: string;
  precio: number;
  estado: string;
  disponibilidad: boolean;
  memorias_ram: string[];
  almacenamientos: string[];
}

export default function InventoryHardwareSection() {
  const [inventario, setInventario] = useState<InventarioItem[]>([]);
  const [equiposArmados, setEquiposArmados] = useState<EquipoArmado[]>([]);
  const [loading, setLoading] = useState(true);
  const [editando, setEditando] = useState<InventarioItem | null>(null);

  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  // 🔹 Cargar inventario de accesorios
  const cargarInventario = async () => {
    try {
      const resp = await fetch(`${API_URL}/api/inventario`, { credentials: 'include' });
      if (!resp.ok) throw new Error('Error al obtener inventario');
      const data = await resp.json();
      setInventario(data);
    } catch (err) {
      console.error('Error cargando inventario:', err);
      Swal.fire('Error', 'No se pudo cargar el inventario', 'error');
    }
  };

  // 🔹 Cargar equipos armados
  const cargarEquiposArmados = async () => {
    try {
      const resp = await fetch(`${API_URL}/api/inventario/equipos-armados`, { credentials: 'include' });
      if (!resp.ok) throw new Error('Error al obtener equipos armados');
      const data = await resp.json();
      setEquiposArmados(data);
    } catch (err) {
      console.error('Error cargando equipos armados:', err);
      Swal.fire('Error', 'No se pudieron cargar los equipos armados', 'error');
    }
  };

  useEffect(() => {
    (async () => {
      setLoading(true);
      await Promise.all([cargarInventario(), cargarEquiposArmados()]);
      setLoading(false);
    })();
  }, []);

  // 🔹 Modal de edición (sin cambios)
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

  // 🔸 Guardar / editar artículo
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
        setInventario((prev) => prev.map((i) => (i.id === nuevo.id ? nuevo : i)));
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
    if (texto.includes('teclado')) return <FaKeyboard className="text-gray-700 text-3xl" />;
    if (texto.includes('audifono') || texto.includes('headset')) return <FaHeadphones className="text-pink-600 text-3xl" />;
    if (texto.includes('gamepad') || texto.includes('control')) return <FaGamepad className="text-purple-600 text-3xl" />;
    if (texto.includes('usb') || texto.includes('bluetooth')) return <FaUsb className="text-orange-600 text-3xl" />;
    if (texto.includes('router') || texto.includes('wifi')) return <FaWifi className="text-green-600 text-3xl" />;
    if (texto.includes('camara')) return <FaCamera className="text-rose-600 text-3xl" />;
    if (texto.includes('cable') || texto.includes('hdmi')) return <FaTools className="text-teal-600 text-3xl" />;
    if (texto.includes('fuente') || texto.includes('psu')) return <FaMicrochip className="text-green-600 text-3xl" />;
    return <FaQuestionCircle className="text-gray-400 text-3xl" />;
  };

  if (loading) {
    return <div className="text-center text-gray-500 py-6">Cargando inventario...</div>;
  }

  return (
    <motion.div
      initial={{ y: 30, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 70 }}
      className="bg-white p-6 rounded-xl shadow w-full"
    >
      {/* === INVENTARIO GENERAL === */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="font-semibold text-lg text-gray-700">Inventario de Hardware y Accesorios</h2>
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

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-8">
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
            <span className="text-sm text-gray-600">Cantidad: {item.cantidad}</span>
            <span className="text-sm text-gray-600">
              💲 Precio: {Number(item.precio || 0).toFixed(2)} MXN
            </span>
            <span className="text-xs text-gray-400 mt-1">Estado: {item.estado}</span>

            <div className="flex gap-3 mt-4">
              <button onClick={() => setEditando(item)} className="text-blue-600 hover:text-blue-800">
                <FaEdit />
              </button>
              <button onClick={() => eliminarInventario(item.id)} className="text-red-500 hover:text-red-700">
                <FaTrash />
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* === EQUIPOS ARMADOS === */}
      <h2 className="font-semibold text-lg text-gray-700 mb-4 flex items-center gap-2">
        <FaLaptopCode className="text-indigo-600" /> Equipos Armados
      </h2>

      {equiposArmados.length === 0 ? (
        <p className="text-gray-500 text-center py-4">No hay equipos armados registrados.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {equiposArmados.map((eq) => (
            <motion.div
              key={eq.id}
              whileHover={{ scale: 1.02 }}
              className="p-4 rounded-lg bg-gray-50 shadow-sm border border-gray-100"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold text-gray-800">{eq.nombre}</span>
                <span className="text-xs text-gray-500">#{eq.etiqueta}</span>
              </div>
              <span className="text-sm text-gray-600">🧠 {eq.procesador}</span>
              <span className="text-sm text-gray-600 mt-1">
                💾 RAM: {eq.memorias_ram?.join(', ') || 'N/A'}
              </span>
              <span className="text-sm text-gray-600">
                📦 Almacenamiento: {eq.almacenamientos?.join(', ') || 'N/A'}
              </span>
              <span className="text-sm text-gray-600 flex items-center gap-1 mt-1">
                <FaStore className="text-gray-500" /> {eq.sucursal_nombre}
              </span>
              <span className="text-sm text-gray-800 mt-2 font-medium">
                💲 Precio: {Number(eq.precio || 0).toFixed(2)} MXN
              </span>
              <span className="text-xs text-gray-400 mt-1">Estado: {eq.estado}</span>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
}
