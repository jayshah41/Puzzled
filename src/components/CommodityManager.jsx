import React from 'react';

const CommodityManager = ({ commodities, setCommodities, commodityOptions }) => {
  const addCommodity = () => {
    if (commodities.length < 5) {
      setCommodities([...commodities, '']);
    }
  };

  const removeCommodity = (index) => {
    const updatedCommodities = [...commodities];
    updatedCommodities.splice(index, 1);
    setCommodities(updatedCommodities);
  };

  const handleCommodityChange = (index, value) => {
    const updatedCommodities = [...commodities];
    updatedCommodities[index] = value;
    setCommodities(updatedCommodities);
  };

  return (
    <div>
      {commodities.map((commodity, index) => (
        <div key={index} style={{ display: 'flex', marginBottom: '10px' }}>
          <select
            value={commodity}
            onChange={(e) => handleCommodityChange(index, e.target.value)}
            className="auth-input"
            style={{ marginBottom: 0, marginRight: '10px', flex: 1 }}
            required
          >
            <option value="" disabled>Select a commodity</option>
            {commodityOptions.map((option) => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
          <button
            type="button"
            onClick={() => removeCommodity(index)}
            style={{ padding: '0 10px', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '5px' }}
          >
            ✕
          </button>
        </div>
      ))}
      {commodities.length < 3 && (
        <button
          type="button"
          onClick={addCommodity}
          className="auth-button"
          style={{ backgroundColor: '#28a745', marginBottom: '10px' }}
        >
          Add Commodity
        </button>
      )}
    </div>
  );
};

export default CommodityManager;