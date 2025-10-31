'use client'
import { motion } from 'framer-motion'
import { useState } from 'react'

type User = {
  id: number
  name: string
  role: string
}

type Task = {
  id: number
  name: string
  assignedTo: number | null // Permite asignar número o null
}

const exampleUsers: User[] = [
  { id: 1, name: 'Juan Pérez', role: 'Técnico' },
  { id: 2, name: 'María López', role: 'Ventas' }
]

const exampleTasks: Task[] = [
  { id: 1, name: 'Revisar laptops', assignedTo: null },
  { id: 2, name: 'Contactar clientes', assignedTo: null }
]

export default function TaskAssignment() {
  const [tasks, setTasks] = useState<Task[]>(exampleTasks)
  const [selectedTask, setSelectedTask] = useState<number | null>(null)
  const [selectedUser, setSelectedUser] = useState<number | null>(null)

  const assignTask = () => {
    if (selectedTask !== null && selectedUser !== null) {
      setTasks(tasks.map(t => (t.id === selectedTask ? { ...t, assignedTo: selectedUser } : t)))
      setSelectedTask(null)
      setSelectedUser(null)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 70 }}
      className='bg-white rounded-xl shadow p-6 max-w-3xl'
    >
      <h2 className='text-xl font-semibold mb-6 text-gray-700'>Asignación de tareas</h2>
      <div className='flex flex-col gap-4 max-w-md'>
        <select
          value={selectedTask ?? ''}
          onChange={e => setSelectedTask(Number(e.target.value))}
          className='border rounded-md p-2'
        >
          <option value='' disabled>
            Seleccione tarea
          </option>
          {tasks.map(t => (
            <option key={t.id} value={t.id}>
              {t.name}
            </option>
          ))}
        </select>
        <select
          value={selectedUser ?? ''}
          onChange={e => setSelectedUser(Number(e.target.value))}
          className='border rounded-md p-2'
        >
          <option value='' disabled>
            Seleccione usuario
          </option>
          {exampleUsers.map(u => (
            <option key={u.id} value={u.id}>
              {u.name} ({u.role})
            </option>
          ))}
        </select>
        <button
          onClick={assignTask}
          className='bg-indigo-600 text-white rounded-md py-2 font-medium hover:bg-indigo-700 transition-colors'
        >
          Asignar tarea
        </button>
      </div>
      <div className='mt-8'>
        <h3 className='text-lg font-semibold mb-4'>Tareas asignadas</h3>
        <ul>
          {tasks.map(t => (
            <li key={t.id} className='mb-2'>
              <span className='font-medium'>{t.name}</span> -{' '}
              <span>{t.assignedTo ? exampleUsers.find(u => u.id === t.assignedTo)?.name : 'Sin asignar'}</span>
            </li>
          ))}
        </ul>
      </div>
    </motion.div>
  )
}
