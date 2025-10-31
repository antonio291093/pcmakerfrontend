'use client'
import { useState } from 'react'
import { motion } from 'framer-motion'

export default function SalesForm() {
  const [formData, setFormData] = useState({
    cliente: '',
    producto: '',
    cantidad: 1,
    precio: '',
    observacion: ''
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: name === 'cantidad' ? Number(value) : value
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Aquí enviar datos al backend para registrar la venta
    console.log('Venta registrada:', formData)
    // Limpiar campos si gustas
  }

  return (
    <motion.div
      initial={{ y: 30, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 70 }}
      className='bg-white rounded-xl shadow p-6 max-w-xl'
    >
      <h2 className='text-lg font-semibold mb-4 text-gray-700'>Registrar venta</h2>
      <form onSubmit={handleSubmit} className='flex flex-col gap-4'>
        <input
          type='text'
          name='cliente'
          placeholder='Nombre cliente'
          value={formData.cliente}
          onChange={handleChange}
          className='border rounded-md p-2 text-gray-600'
          required
        />
        <input
          type='text'
          name='producto'
          placeholder='Producto o equipo'
          value={formData.producto}
          onChange={handleChange}
          className='border rounded-md p-2 text-gray-600'
          required
        />
        <input
          type='number'
          name='cantidad'
          min={1}
          value={formData.cantidad}
          onChange={handleChange}
          className='border rounded-md p-2 text-gray-600'
          required
        />
        <input
          type='text'
          name='precio'
          placeholder='Precio'
          value={formData.precio}
          onChange={handleChange}
          className='border rounded-md p-2 text-gray-600'
          required
        />
        <textarea
          name='observacion'
          placeholder='Observaciones (opcional)'
          value={formData.observacion}
          onChange={handleChange}
          rows={3}
          className='border rounded-md p-2 text-gray-600 resize-none'
        />
        <motion.button
          whileTap={{ scale: 0.97 }}
          type='submit'
          className='bg-indigo-600 text-white rounded-md py-2 font-medium transition-colors hover:bg-indigo-700'
        >
          Registrar venta
        </motion.button>
      </form>
    </motion.div>
  )
}
