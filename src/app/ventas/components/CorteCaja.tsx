'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  FaMoneyBillWave,
  FaShoppingCart,
  FaArrowDown,
  FaArrowUp,
  FaBalanceScale,
  FaFileInvoiceDollar,
  FaPlus,
  FaListUl
} from 'react-icons/fa'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'

export default function CorteCajaSection() {
  const [usuarioId, setUsuarioId] = useState<number | null>(null)
  const [sucursalId, setSucursalId] = useState<number | null>(null)
  const [ventas, setVentas] = useState(0)
  const [gastos, setGastos] = useState(0)
  const [ingresos, setIngresos] = useState(0)
  const [movimientos, setMovimientos] = useState<any[]>([])
  const [tipoMovimiento, setTipoMovimiento] = useState('gasto')
  const [monto, setMonto] = useState('')
  const [descripcion, setDescripcion] = useState('')
  const router = useRouter()

  const balance = ventas + ingresos - gastos

  // 🔹 Obtener usuario y sucursal
  useEffect(() => {
    fetch(`${API_URL}/api/usuarios/me`, { credentials: 'include' })
      .then(res => {
        if (!res.ok) throw new Error('No autenticado')
        return res.json()
      })
      .then(data => {
        setUsuarioId(data.user.id)
        setSucursalId(data.user.sucursal_id)
        obtenerResumen(data.user.sucursal_id)
        obtenerCortes(data.user.sucursal_id)
      })
      .catch(() => router.push('/login'))
  }, [router])

  // 🔹 Obtener resumen de caja
  const obtenerResumen = async (sucursal_id: number | null) => {
    try {
      const resp = await fetch(`${API_URL}/api/caja/resumen`, { credentials: 'include' })
      if (!resp.ok) return
      const data = await resp.json()
      // backend devuelve total_ventas, total_gastos, total_ingresos
      setVentas(Number(data.total_ventas) || 0)
      setGastos(Number(data.total_gastos) || 0)
      setIngresos(Number(data.total_ingresos) || 0)

    } catch (err) {
      console.error('Error cargando resumen de caja:', err)
    }
  }

  // 🔹 Registrar movimiento (gasto / ingreso)
  const registrarMovimiento = async () => {
    if (!monto || !tipoMovimiento || !usuarioId || !sucursalId) {
      alert('Faltan datos')
      return
    }
    try {
      const resp = await fetch(`${API_URL}/api/caja/movimiento`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          tipo: tipoMovimiento,
          monto: parseFloat(monto),
          descripcion,
          sucursal_id: sucursalId,
          usuario_id: usuarioId
        })
      })
      if (resp.ok) {
        alert('✅ Movimiento registrado correctamente')
        setMonto('')
        setDescripcion('')
        obtenerResumen(sucursalId)
        obtenerCortes(sucursalId)
      } else {
        alert('❌ Error al registrar el movimiento')
      }
    } catch (err) {
      console.error('Error registrando movimiento:', err)
    }
  }

  // 🔹 Generar corte de caja
  const generarCorte = async () => {
    try {
      const resp = await fetch(`${API_URL}/api/caja/corte`, {
        method: 'POST',
        credentials: 'include'
      })
      if (resp.ok) {
        alert('✅ Corte de caja generado correctamente')
        obtenerCortes(sucursalId)
      } else alert('❌ Error al generar el corte de caja')
    } catch (err) {
      console.error('Error generando corte de caja:', err)
    }
  }

  // 🔹 Obtener historial de cortes
  const obtenerCortes = async (sucursal_id: number | null) => {
    try {
      const resp = await fetch(`${API_URL}/api/caja/cortes`, { credentials: 'include' })
      if (!resp.ok) return
      const data = await resp.json()
      setMovimientos(data)
    } catch (err) {
      console.error('Error al cargar cortes:', err)
    }
  }

  return (
    <div className="p-6 bg-white rounded-xl shadow-md max-w-6xl mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-gray-800 flex items-center gap-3">
        <FaFileInvoiceDollar className="text-indigo-600" /> Corte de Caja
      </h2>

      {/* === Resumen de totales === */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="p-4 bg-green-50 border border-green-200 rounded-xl shadow-sm flex flex-col items-start">
          <FaShoppingCart className="text-green-600 text-3xl mb-2" />
          <p className="text-gray-600 text-sm">Total Ventas</p>
          <h3 className="text-2xl font-semibold text-green-700">${ventas.toFixed(2)}</h3>
        </div>

        <div className="p-4 bg-red-50 border border-red-200 rounded-xl shadow-sm flex flex-col items-start">
          <FaArrowDown className="text-red-600 text-3xl mb-2" />
          <p className="text-gray-600 text-sm">Total Gastos</p>
          <h3 className="text-2xl font-semibold text-red-700">${gastos.toFixed(2)}</h3>
        </div>

        <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl shadow-sm flex flex-col items-start">
          <FaArrowUp className="text-blue-600 text-3xl mb-2" />
          <p className="text-gray-600 text-sm">Ingresos Extra</p>
          <h3 className="text-2xl font-semibold text-blue-700">${ingresos.toFixed(2)}</h3>
        </div>

        <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl shadow-sm flex flex-col items-start">
          <FaBalanceScale className={`text-3xl mb-2 ${balance >= 0 ? 'text-green-700' : 'text-red-700'}`} />
          <p className="text-gray-600 text-sm">Balance Final</p>
          <h3
            className={`text-2xl font-bold ${
              balance >= 0 ? 'text-green-700' : 'text-red-700'
            }`}
          >
            ${balance.toFixed(2)}
          </h3>
        </div>
      </div>

      {/* === Formulario nuevo movimiento === */}
      <div className="bg-gray-50 border border-gray-200 rounded-xl p-5 mb-8">
        <h3 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
          <FaPlus className="text-indigo-600" /> Registrar movimiento
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <select
            className="border rounded-lg px-3 py-2"
            value={tipoMovimiento}
            onChange={e => setTipoMovimiento(e.target.value)}
          >
            <option value="gasto">Gasto</option>
            <option value="ingreso">Ingreso</option>
            <option value="venta">Venta manual</option>
          </select>
          <input
            type="number"
            placeholder="Monto"
            className="border rounded-lg px-3 py-2"
            value={monto}
            onChange={e => setMonto(e.target.value)}
          />
          <input
            type="text"
            placeholder="Descripción"
            className="border rounded-lg px-3 py-2"
            value={descripcion}
            onChange={e => setDescripcion(e.target.value)}
          />
          <button
            onClick={registrarMovimiento}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 rounded-lg transition"
          >
            Registrar
          </button>
        </div>
      </div>

      {/* === Historial de cortes === */}
      <div>
        <h3 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
          <FaListUl className="text-indigo-600" /> Historial de cortes
        </h3>
        <div className="overflow-x-auto">
          <table className="min-w-full border border-gray-200 rounded-lg">
            <thead>
              <tr className="bg-gray-100 text-gray-700">
                <th className="py-2 px-4 text-left">Fecha</th>
                <th className="py-2 px-4 text-left">Ventas</th>
                <th className="py-2 px-4 text-left">Gastos</th>
                <th className="py-2 px-4 text-left">Ingresos</th>
                <th className="py-2 px-4 text-left">Balance</th>
              </tr>
            </thead>
            <tbody>
              {movimientos.length === 0 && (
                <tr>
                  <td colSpan={5} className="text-center py-3 text-gray-500">
                    No hay cortes registrados
                  </td>
                </tr>
              )}
              {movimientos.map((m, i) => (
                <tr key={i} className="border-t hover:bg-gray-50">
                  <td className="py-2 px-4">{new Date(m.fecha).toLocaleDateString()}</td>
                  <td className="py-2 px-4 text-green-700">${m.total_ventas}</td>
                  <td className="py-2 px-4 text-red-700">${m.total_gastos}</td>
                  <td className="py-2 px-4 text-blue-700">${m.total_ingresos}</td>
                  <td className={`py-2 px-4 font-semibold ${m.balance_final >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                    ${m.balance_final}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* === Botón generar corte === */}
      <button
        onClick={generarCorte}
        className="flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white font-semibold py-3 w-full rounded-xl shadow transition mt-8"
      >
        <FaMoneyBillWave /> Generar Corte de Caja
      </button>
    </div>
  )
}
