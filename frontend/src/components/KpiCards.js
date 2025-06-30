import React from 'react';

const KpiCards = ({ kpis }) => (
  <div style={{ display: 'flex', gap: '2rem', margin: '2rem 0' }}>
    <div>
      <h4>Total</h4>
      <p>{kpis?.total ? Number(kpis.total).toLocaleString() : '-'}</p>
    </div>
    <div>
      <h4>Average</h4>
      <p>{kpis?.avg ? Number(kpis.avg).toLocaleString() : '-'}</p>
    </div>
    <div>
      <h4>Max</h4>
      <p>{kpis?.max ? Number(kpis.max).toLocaleString() : '-'}</p>
    </div>
    <div>
      <h4>Min</h4>
      <p>{kpis?.min ? Number(kpis.min).toLocaleString() : '-'}</p>
    </div>
  </div>
);

export default KpiCards;
