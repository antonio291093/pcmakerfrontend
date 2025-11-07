'use client';
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Swal from "sweetalert2";
import {
  FaMemory, FaHdd, FaMouse, FaKeyboard, FaHeadphones, FaUsb,
  FaGamepad, FaWifi, FaCamera, FaTools, FaMicrochip, FaQuestionCircle,
} from "react-icons/fa";

interface Producto {
  id: number;
  tipo: string;
  descripcion?: string;
  especificacion?: string;
  cantidad: number; // stock
  estado: string;
  precio?: number | null; // 🔹 Añadimos el precio
}

interface ProductoSeleccionado extends Producto {
  cantidadSeleccionada: number;
}

interface ModalSeleccionarProductoProps {
  onClose: () => void;
  onSeleccionar: (productos: ProductoSeleccionado[]) => void;
}

export default function ModalSeleccionarProducto({
  onClose,
  onSeleccionar,
}: ModalSeleccionarProductoProps) {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [seleccionados, setSeleccionados] = useState<ProductoSeleccionado[]>([]);
  const [loading, setLoading] = useState(true);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

  useEffect(() => {
    const fetchProductos = async () => {
      try {
        const res = await fetch(`${API_URL}/api/inventario`, {
          credentials: "include",
        });
        const data = await res.json();
        setProductos(data);
      } catch (error) {
        console.error("Error cargando inventario:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProductos();
  }, []);

  const toggleSeleccion = (producto: Producto) => {
    // 🚫 Verificamos si el producto no tiene stock
    if (producto.cantidad <= 0) {
      Swal.fire({
        icon: "error",
        title: "Sin stock disponible",
        text: `El producto "${producto.descripcion || producto.especificacion}" no tiene unidades disponibles.`,
        confirmButtonText: "Entendido",
        confirmButtonColor: "#4F46E5",
      });
      return;
    }

    // ⚠️ Verificamos si tiene precio asignado
    if (!producto.precio || producto.precio <= 0) {
      Swal.fire({
        icon: "warning",
        title: "Precio no asignado",
        text: `El producto "${producto.descripcion || producto.especificacion}" no tiene precio establecido. 
              Por favor, asigna un precio desde la sección de inventario antes de seleccionarlo.`,
        confirmButtonText: "Entendido",
        confirmButtonColor: "#4F46E5",
      });
      return;
    }

    // ✅ Si pasa las validaciones, se agrega o quita de la selección
    setSeleccionados((prev) => {
      const existe = prev.find((p) => p.id === producto.id);
      if (existe) {
        // Si ya está seleccionado, lo quitamos
        return prev.filter((p) => p.id !== producto.id);
      } else {
        // Lo agregamos con cantidad 1
        return [...prev, { ...producto, cantidadSeleccionada: 1 }];
      }
    });
  };

  const actualizarCantidad = (id: number, nuevaCantidad: number) => {
    setSeleccionados((prev) =>
      prev.map((p) =>
        p.id === id
          ? {
              ...p,
              cantidadSeleccionada:
                nuevaCantidad > p.cantidad ? p.cantidad : nuevaCantidad < 1 ? 1 : nuevaCantidad,
            }
          : p
      )
    );
  };

  const obtenerIcono = (tipo: string, especificacion?: string) => {
    const texto = `${tipo} ${especificacion || ""}`.toLowerCase();
    if (texto.includes("ram") || texto.includes("ddr")) return <FaMemory className="text-indigo-600 text-3xl" />;
    if (texto.includes("ssd") || texto.includes("hdd") || texto.includes("disco")) return <FaHdd className="text-amber-600 text-3xl" />;
    if (texto.includes("mouse")) return <FaMouse className="text-blue-600 text-3xl" />;
    if (texto.includes("teclado") || texto.includes("keyboard")) return <FaKeyboard className="text-gray-700 text-3xl" />;
    if (texto.includes("audifono") || texto.includes("auricular") || texto.includes("headset")) return <FaHeadphones className="text-pink-600 text-3xl" />;
    if (texto.includes("gamepad") || texto.includes("control")) return <FaGamepad className="text-purple-600 text-3xl" />;
    if (texto.includes("usb") || texto.includes("adaptador") || texto.includes("bluetooth")) return <FaUsb className="text-orange-600 text-3xl" />;
    if (texto.includes("router") || texto.includes("wifi") || texto.includes("network")) return <FaWifi className="text-green-600 text-3xl" />;
    if (texto.includes("camara") || texto.includes("webcam")) return <FaCamera className="text-rose-600 text-3xl" />;
    if (texto.includes("cable") || texto.includes("tipo c") || texto.includes("hdmi")) return <FaTools className="text-teal-600 text-3xl" />;
    if (texto.includes("fuente") || texto.includes("psu")) return <FaMicrochip className="text-green-600 text-3xl" />;
    return <FaQuestionCircle className="text-gray-400 text-3xl" />;
  };

  if (loading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
        <div className="bg-white p-6 rounded-xl shadow-lg max-w-md w-full text-center text-gray-500">
          Cargando productos...
        </div>
      </div>
    );
  }

  // Calcular total de productos seleccionados
  const totalSeleccionado = seleccionados.reduce((acc, p) => {
    const precio = Number(p.precio) || 0;
    return acc + precio * (p.cantidadSeleccionada || 1);
  }, 0);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white p-6 rounded-xl shadow-2xl max-w-6xl w-full max-h-[90vh] flex flex-col"
      >
        <h2 className="text-lg font-semibold text-gray-700 mb-4">Seleccionar productos</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 overflow-y-auto pr-2">
          {productos.map((producto) => {
            const seleccionado = seleccionados.find((p) => p.id === producto.id);
            return (
              <motion.div
                key={producto.id}
                whileHover={{ scale: 1.02 }}
                onClick={() => toggleSeleccion(producto)}
                className={`cursor-pointer p-4 rounded-lg border transition-all flex flex-col items-start shadow-sm ${
                  seleccionado ? "border-indigo-600 bg-indigo-50" : "border-gray-100 bg-gray-50 hover:bg-gray-100"
                }`}
              >
                <div className="flex items-center gap-3 mb-2">
                  {obtenerIcono(producto.tipo, producto.especificacion || producto.descripcion)}
                  <span className="font-semibold text-gray-800">
                    {producto.descripcion || producto.especificacion}
                  </span>
                </div>

                <span className="text-sm text-gray-600">Stock: {producto.cantidad}</span>
                <span className="text-sm text-gray-700">
                💲{" "}
                {producto.precio && !isNaN(Number(producto.precio))
                  ? Number(producto.precio).toFixed(2)
                  : "Sin precio"}
              </span>
                <span className="text-xs text-gray-400 mt-1">Estado: {producto.estado}</span>

                {seleccionado && (
                  <input
                    type="number"
                    min={1}
                    max={producto.cantidad}
                    value={seleccionado.cantidadSeleccionada}
                    onClick={(e) => e.stopPropagation()}
                    onChange={(e) =>
                      actualizarCantidad(producto.id, parseInt(e.target.value))
                    }
                    className="mt-3 w-full border rounded-md p-1 text-center text-sm"
                  />
                )}
              </motion.div>
            );
          })}
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-700"
          >
            Cancelar
          </button>
          <button
            disabled={seleccionados.length === 0}
            onClick={() => onSeleccionar(seleccionados)}
            className={`px-4 py-2 rounded-lg shadow text-white ${
              seleccionados.length > 0
                ? "bg-indigo-600 hover:bg-indigo-700"
                : "bg-gray-400 cursor-not-allowed"
            }`}
          >
            {seleccionados.length > 0
            ? `Seleccionar (${seleccionados.length}) - Total: $${totalSeleccionado.toFixed(2)}`
            : "Seleccionar (0)"}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
