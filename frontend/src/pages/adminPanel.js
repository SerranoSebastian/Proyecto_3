import React, { useEffect, useState } from 'react';
import axios from 'axios';

const regiones = ['North', 'South', 'East', 'West'];

const styles = {
  container: {
    maxWidth: 880,
    margin: '2rem auto',
    background: '#f8f8fc',
    borderRadius: 16,
    boxShadow: '0 4px 16px 0 #bbc8ec2a',
    padding: '2.5rem 2.5rem 2rem 2.5rem',
    fontFamily: 'Segoe UI, sans-serif'
  },
  h2: {
    fontWeight: 'bold',
    marginBottom: 24,
    fontSize: 28,
    letterSpacing: 1
  },
  h3: {
    fontWeight: 'bold',
    marginTop: 24,
    fontSize: 20
  },
  input: {
    padding: '8px 12px',
    marginRight: 8,
    border: '1.5px solid #d2d5db',
    borderRadius: 6,
    fontSize: 16,
    outline: 'none',
    marginBottom: 10,
    marginTop: 8,
    background: '#fff'
  },
  button: {
    padding: '8px 16px',
    background: '#1976d2',
    color: '#fff',
    border: 'none',
    borderRadius: 6,
    fontWeight: 'bold',
    fontSize: 15,
    marginRight: 6,
    cursor: 'pointer',
    marginBottom: 10,
    marginTop: 8
  },
  dangerBtn: {
    background: '#e53935'
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    marginTop: 16,
    background: '#fff',
    borderRadius: 8,
    overflow: 'hidden',
    boxShadow: '0 2px 8px 0 #bbc8ec24'
  },
  th: {
    background: '#1976d2',
    color: '#fff',
    padding: '10px 8px',
    fontSize: 15,
    fontWeight: 'bold',
    border: 'none'
  },
  td: {
    padding: '8px 8px',
    borderBottom: '1.5px solid #eef0f7',
    fontSize: 15,
    background: '#f9fbff'
  },
  rowAlt: {
    background: '#e6eefc'
  },
  prodList: {
    marginTop: 8,
    marginBottom: 8,
    paddingLeft: 18
  }
};

const AdminPanel = () => {
  const [products, setProducts] = useState([]);
  const [name, setName] = useState('');
  const [salesDate, setSalesDate] = useState('');
  const [sales, setSales] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [msg, setMsg] = useState('');
  const token = localStorage.getItem('token');

  // Obtener productos
  const fetchProducts = async () => {
    const res = await axios.get('http://localhost:4000/api/analytics/products', {
      headers: { 'x-auth-token': token }
    });
    setProducts(res.data);
  };

  useEffect(() => {
    fetchProducts();
    // eslint-disable-next-line
  }, [token]);

  // Agregar producto
  const handleAdd = async () => {
    if (!name) return;
    await axios.post('http://localhost:4000/api/admin/product', { name }, {
      headers: { 'x-auth-token': token }
    });
    setName('');
    fetchProducts();
  };

  // Borrar producto
  const handleDelete = async id => {
    await axios.delete(`http://localhost:4000/api/admin/product/${id}`, {
      headers: { 'x-auth-token': token }
    });
    fetchProducts();
  };

  // --------- REPORTE DE VENTAS POR DÍA ---------

  // Consultar ventas del día seleccionado
  const fetchSales = async (date) => {
    if (!date) return;
    setIsLoaded(false);
    const res = await axios.get(`http://localhost:4000/api/admin/sales?date=${date}`, {
      headers: { 'x-auth-token': token }
    });
    if (res.data.length > 0) {
      setEditMode(true);
      setSales(res.data.map(r => ({
        product_id: r.product_id,
        product: r.product,
        region_id: r.region_id,
        region: r.region,
        sales_amount: r.sales_amount,
        quantity: r.quantity
      })));
    } else {
      // Inicializar ventas vacías para cada producto x región
      setEditMode(false);
      let initSales = [];
      products.forEach(p => {
        regiones.forEach(r => {
          initSales.push({
            product_id: p.id,
            product: p.name,
            region: r,
            sales_amount: '',
            quantity: ''
          });
        });
      });
      setSales(initSales);
    }
    setIsLoaded(true);
  };

  // Cuando cambie el día, consulta ventas de ese día
  useEffect(() => {
    if (salesDate) fetchSales(salesDate);
    // eslint-disable-next-line
  }, [salesDate, products.length]);

  // Cambios en tabla
  const handleSalesChange = (idx, field, value) => {
    setSales(prev =>
      prev.map((row, i) =>
        i === idx ? { ...row, [field]: value } : row
      )
    );
  };

  // Guardar/Actualizar ventas del día
  const handleSaveSales = async () => {
    // Filtrar solo las filas donde haya ventas reales
    const filtered = sales.filter(s =>
      s.sales_amount && s.quantity && parseFloat(s.sales_amount) > 0 && parseInt(s.quantity) > 0
    );
    await axios.post('http://localhost:4000/api/admin/sales', {
      date: salesDate,
      sales: filtered.map(s => ({
        product_id: s.product_id,
        region_id: regiones.indexOf(s.region) + 1, // Asume IDs fijos: 1=North...
        sales_amount: parseFloat(s.sales_amount),
        quantity: parseInt(s.quantity)
      }))
    }, {
      headers: { 'x-auth-token': token }
    });
    fetchSales(salesDate); // Refresca
    setMsg('Reporte guardado correctamente');
    setTimeout(() => setMsg(''), 1200);
  };

  // Eliminar ventas del día
  const handleDeleteSales = async () => {
    await axios.delete(`http://localhost:4000/api/admin/sales/${salesDate}`, {
      headers: { 'x-auth-token': token }
    });
    setSales([]);
    setEditMode(false);
    setMsg('Ventas eliminadas');
    setTimeout(() => setMsg(''), 1200);
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.h2}>Panel de administración</h2>

      {/* CRUD de productos */}
      <h3 style={styles.h3}>Productos</h3>
      <input
        style={styles.input}
        value={name}
        onChange={e => setName(e.target.value)}
        placeholder="Nuevo producto"
        autoFocus
      />
      <button style={styles.button} onClick={handleAdd}>Agregar</button>
      <ul style={styles.prodList}>
        {products.map(prod => (
          <li key={prod.id} style={{ marginBottom: 4 }}>
            {prod.name}{" "}
            <button
              style={{ ...styles.button, ...styles.dangerBtn, padding: '3px 12px', fontSize: 13 }}
              onClick={() => handleDelete(prod.id)}
            >
              Borrar
            </button>
          </li>
        ))}
      </ul>

      <hr style={{ margin: '26px 0 14px 0', border: 'none', borderTop: '2.5px solid #dde7fc' }} />

      {/* Reporte de ventas del día */}
      <h3 style={styles.h3}>Reporte de ventas por día</h3>
      <input
        type="date"
        style={styles.input}
        value={salesDate}
        onChange={e => setSalesDate(e.target.value)}
      />
      {salesDate && isLoaded && (
        <>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Producto</th>
                <th style={styles.th}>Región</th>
                <th style={styles.th}>Monto ventas</th>
                <th style={styles.th}>Cantidad</th>
              </tr>
            </thead>
            <tbody>
              {sales.map((row, idx) => (
                <tr key={idx} style={idx % 2 === 1 ? styles.rowAlt : {}}>
                  <td style={styles.td}>{row.product}</td>
                  <td style={styles.td}>{row.region}</td>
                  <td style={styles.td}>
                    <input
                      type="number"
                      value={row.sales_amount}
                      onChange={e => handleSalesChange(idx, 'sales_amount', e.target.value)}
                      min="0"
                      style={{ ...styles.input, width: 80, margin: 0, background: '#eef4fb' }}
                    />
                  </td>
                  <td style={styles.td}>
                    <input
                      type="number"
                      value={row.quantity}
                      onChange={e => handleSalesChange(idx, 'quantity', e.target.value)}
                      min="0"
                      style={{ ...styles.input, width: 60, margin: 0, background: '#eef4fb' }}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div style={{ marginTop: 16 }}>
            <button style={styles.button} onClick={handleSaveSales}>
              {editMode ? 'Actualizar reporte' : 'Guardar reporte'}
            </button>
            {editMode && (
              <button
                style={{ ...styles.button, ...styles.dangerBtn, marginLeft: 8 }}
                onClick={handleDeleteSales}
              >
                Eliminar todas las ventas de este día
              </button>
            )}
            {msg && <span style={{ marginLeft: 16, color: '#1976d2', fontWeight: 'bold' }}>{msg}</span>}
          </div>
        </>
      )}
    </div>
  );
};

export default AdminPanel;
