// Importa íconos si los necesitas
export default function InventoryHardwareSection() {
  // Simulación de hardware, modifica de acuerdo a tu lógica real:
  const hardwareItems = [
    { id: 2001, name: "Fuente de poder EVGA 500W" },
    { id: 2002, name: "Disco SSD Kingston 240GB" },
    { id: 2003, name: "Memoria RAM 8GB DDR4" },
  ];

  return (
    <div className="w-full">
      <h2 className="font-semibold text-lg mb-4 text-gray-700">Inventario de hardware</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {hardwareItems.map(hw => (
          <div key={hw.id} className="p-4 rounded-lg bg-white shadow-sm flex flex-col items-start">
            <span className="font-semibold text-gray-800">{hw.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
