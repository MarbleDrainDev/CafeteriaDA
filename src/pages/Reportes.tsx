import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { CSVLink } from 'react-csv';

interface Reporte {
    idReporte: number;
    idProducto: number;
    cantidadVendida: number;
    costoVenta: number;
    precioVenta: number;
    ganancia: number;
    sede: string;
}

const Reportes: React.FC = () => {
    const [reportes, setReportes] = useState<Reporte[]>([]);
    const [fechaInicio, setFechaInicio] = useState<string>('');
    const [fechaFin, setFechaFin] = useState<string>('');

    useEffect(() => {
        if (fechaInicio && fechaFin) {
            axios.get(`/api/reportes?fechaInicio=${fechaInicio}`)
                .then(response => {
                    setReportes(response.data);
                })
                .catch(error => {
                    console.error('Error fetching reportes:', error);
                });
        }
    }, [fechaInicio, fechaFin]);

    const handleFechaInicioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFechaInicio(e.target.value);
    };

    const handleFechaFinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFechaFin(e.target.value);
    };

    return (
        <div>
            <h1>Reportes</h1>
            <div>
                <label>
                    Fecha Inicio:
                    <input type="date" value={fechaInicio} onChange={handleFechaInicioChange} />
                </label>
                <label>
                    Fecha Fin:
                    <input type="date" value={fechaFin} onChange={handleFechaFinChange} />
                </label>
            </div>
            <table>
                <thead>
                    <tr>
                        <th>ID Reporte</th>
                        <th>ID Producto</th>
                        <th>Cantidad Vendida</th>
                        <th>Costo Venta</th>
                        <th>Precio Venta</th>
                        <th>Ganancia</th>
                        <th>Sede</th>
                    </tr>
                </thead>
                <tbody>
                    {reportes.map(reporte => (
                        <tr key={reporte.idReporte}>
                            <td>{reporte.idReporte}</td>
                            <td>{reporte.idProducto}</td>
                            <td>{reporte.cantidadVendida}</td>
                            <td>{reporte.costoVenta}</td>
                            <td>{reporte.precioVenta}</td>
                            <td>{reporte.ganancia}</td>
                            <td>{reporte.sede}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
            <CSVLink data={reportes} filename={`reportes_${fechaInicio}_to_${fechaFin}.csv`}>
                Descargar CSV
            </CSVLink>
        </div>
    );
};

export default Reportes;</tr>