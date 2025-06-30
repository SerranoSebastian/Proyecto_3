import React, { useState, useEffect } from 'react';
import axios from 'axios';
import BarChart from '../components/BarChart';
import PieChart from '../components/PieChart';
import KpiCards from '../components/KpiCards';

const Dashboard = () => {
  const [data, setData] = useState([]);
  const [region, setRegion] = useState('All');
  const [startDate, setStartDate] = useState('2023-01-01');
  const [endDate, setEndDate] = useState('2023-12-31');
  const [loading, setLoading] = useState(false);
  const [byProduct, setByProduct] = useState([]);
  const [byRegion, setByRegion] = useState([]);
  const [kpis, setKpis] = useState(null);
  const [groupBy, setGroupBy] = useState('day');

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      const token = localStorage.getItem('token');
      try {
        // Cambia aquí: Primer fetch es a /api/sales/grouped con el agrupador dinámico
        const [groupedRes, prodRes, regRes, kpiRes] = await Promise.all([
          axios.get('http://localhost:4000/api/sales/grouped', { headers: { 'x-auth-token': token }, params: { region, startDate, endDate, groupBy } }),
          axios.get('http://localhost:4000/api/analytics/by-product', { headers: { 'x-auth-token': token }, params: { region, startDate, endDate } }),
          axios.get('http://localhost:4000/api/analytics/by-region', { headers: { 'x-auth-token': token }, params: { startDate, endDate } }),
          axios.get('http://localhost:4000/api/analytics/kpis', { headers: { 'x-auth-token': token }, params: { region, startDate, endDate } })
        ]);
        setData(groupedRes.data);
        setByProduct(prodRes.data.map(d => ({ label: d.product, value: d.total_sales })));
        setByRegion(regRes.data.map(d => ({ label: d.region, value: d.total_sales })));
        setKpis(kpiRes.data);
      } catch (err) {
        setData([]);
        setByProduct([]);
        setByRegion([]);
        setKpis(null);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, [region, startDate, endDate, groupBy]);

  return (
    <div style={{ maxWidth: '1000px', margin: '2rem auto' }}>
      <h2>Dashboard de ventas</h2>
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
        <select value={region} onChange={e => setRegion(e.target.value)}>
          <option value="All">Todas las regiones</option>
          <option value="North">Norte</option>
          <option value="South">Sur</option>
          <option value="East">Este</option>
          <option value="West">Oeste</option>
        </select>
        <select value={groupBy} onChange={e => setGroupBy(e.target.value)}>
          <option value="day">Dia</option>
          <option value="week">Semana</option>
          <option value="month">Mes</option>
          <option value="quarter">Cuatrimestre</option>
          <option value="semester">Semestre</option>
          <option value="year">Ano</option>
        </select>
        <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} />
        <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} />
      </div>

      {kpis && <KpiCards kpis={kpis} />}

      <h4>Ventas por fecha</h4>
      {loading ? <p>Cargando...</p> : <BarChart data={data} />}

      <div style={{ display: 'flex', gap: '2rem', marginTop: '2rem' }}>
        <div style={{ flex: 1 }}>
          <h4>Ventas por producto</h4>
          <PieChart data={byProduct} labelKey="label" dataKey="value" title="Ventas por producto" />
        </div>
        <div style={{ flex: 1 }}>
          <h4>Ventas por region</h4>
          <PieChart data={byRegion} labelKey="label" dataKey="value" title="Ventas por region" />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
