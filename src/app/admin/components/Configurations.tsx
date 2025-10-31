'use client'
import { motion } from 'framer-motion'
import { useState } from 'react'

type Config = {
  id: number
  name: string
  value: string
}

const exampleConfigs: Config[] = [
  { id: 1, name: 'Tasa de comisión (%)', value: '3' }, // valor como string
  { id: 2, name: 'Horario laboral', value: 'Lunes a Viernes, 9am a 6pm' }
]

export default function Configurations() {
  const [configs, setConfigs] = useState<Config[]>(exampleConfigs)

  const updateConfig = (id: number, newValue: string) => {
    setConfigs(configs.map(c => (c.id === id ? { ...c, value: newValue } : c)))
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 70 }}
      className="bg-white rounded-xl shadow p-6 max-w-3xl"
    >
      <h2 className="text-xl font-semibold mb-6 text-gray-700">Configuración del sistema</h2>
      <ul className="space-y-4">
        {configs.map(c => (
          <li key={c.id} className="flex items-center gap-4">
            <label className="w-48 font-medium text-gray-700">{c.name}:</label>
            <input
              type="text"
              value={c.value}
              onChange={e => updateConfig(c.id, e.target.value)}
              className="border rounded-md p-2 flex-1 text-gray-600"
            />
          </li>
        ))}
      </ul>
    </motion.div>
  )
}
