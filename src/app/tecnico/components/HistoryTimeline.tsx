'use client'
import { motion } from "framer-motion";

const data = [
  { equipo: "Laptop HP 245 G7", estado: "Ensamblado", fecha: "2025-09-10" },
  { equipo: "Dell Latitude 15", estado: "En revisión", fecha: "2025-09-13" },
  { equipo: "HP ProBook", estado: "Listo para venta", fecha: "2025-09-14" },
];

export default function HistoryTimeline() {
  return (
    <motion.div
      initial={{ y: 30, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: "spring", stiffness: 70, delay: 0.2 }}
      className="bg-white rounded-xl shadow p-6 max-w-2xl"
    >
      <h2 className="text-lg font-semibold mb-4 text-gray-700">Historial de equipos</h2>
      <ol className="relative border-l-2 border-indigo-200 pl-6">
        {data.map((item, idx) => (
          <motion.li
            key={idx}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 + idx * 0.07 }}
            className="mb-8"
          >
            <div className="absolute -left-4 w-3 h-3 bg-indigo-500 rounded-full border-2 border-white"></div>
            <div className="text-md font-semibold text-gray-800">{item.equipo}</div>
            <div className="text-xs text-gray-500">{item.estado}</div>
            <div className="text-xs text-gray-400">{item.fecha}</div>
          </motion.li>
        ))}
      </ol>
    </motion.div>
  );
}
