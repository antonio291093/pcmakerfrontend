'use client'
import { motion } from 'framer-motion'

const exampleInventory = [
  { id: 1, name: 'Laptop HP 245 G7', quantity: 8, details: 'Disponible' },
  { id: 2, name: 'Cargador 65W', quantity: 4, details: 'Bajo stock' }
]

export default function InventoryManagement() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 70 }}
      className="bg-white rounded-xl shadow p-6 max-w-6xl"
    >
      <h2 className="text-xl font-semibold mb-6 text-gray-700">Inventario de equipos y accesorios</h2>
      <table className="w-full table-auto">
        <thead>
          <tr>
            <th className="p-3 border-b text-left text-sm font-medium text-gray-600">Nombre</th>
            <th className="p-3 border-b text-left text-sm font-medium text-gray-600">Cantidad</th>
            <th className="p-3 border-b text-left text-sm font-medium text-gray-600">Detalles</th>
            <th className="p-3 border-b text-center text-sm font-medium text-gray-600">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {exampleInventory.map(item => (
            <tr key={item.id} className="hover:bg-gray-50 transition-colors">
              <td className="p-3 text-sm">{item.name}</td>
              <td className="p-3 text-sm">{item.quantity}</td>
              <td className="p-3 text-sm">{item.details}</td>
              <td className="p-3 text-center">
                <button className="text-indigo-600 hover:underline text-sm">Editar</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </motion.div>
  )
}
