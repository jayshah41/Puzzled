import React, { useState } from 'react';
import '../styles/GeneralStyles.css';

const SubscriptionPlans = () => {

  const [selectedOption, setSelectedOption] = useState("$3995 Per Annum");
  const colourMap = {
    "$895 Per Month": "#cd7f32",
    "$1495 Per Quarter": "#c0c0c0",
    "$3995 Per Annum": "#ffd700"
  }

  const handleChange = (event) => {
    setSelectedOption(event.target.value);
  };

  const info = [selectedOption, 'Company: All data', 'Market Data: All Data', 'Projects: All Data', 'Shareholders: All Data', 'Directors: All Data', 'Financials: All Data', 'Capital Raises: All Data'];
  const features = info.map(e => <li>{e}</li>);

  return (
    <div className="two-card-container">
    <div style={{ width: '25vw', backgroundColor: 'white', display:'flex', flexDirection: 'column', boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)', margin: 'auto', marginBottom: '50px', padding: '20px', border: `10px solid ${colourMap[selectedOption]}` }}>
      <h3 style={{ margin: 'auto' }}>Tier 2 Pricing</h3>
      <ul>
        {features}
      </ul>
    </div>
    <div>
      <h3>Select your payment period</h3>
      <label>
        <input type="radio" value="$895 Per Month" checked={selectedOption === "$895 Per Month"} onChange={handleChange} />
        Monthly
      </label>
      <br />
      <label>
        <input type="radio" value="$1495 Per Quarter" checked={selectedOption === "$1495 Per Quarter"} onChange={handleChange} />
        Quarterly
      </label>
      <br />
      <label>
        <input type="radio" value="$3995 Per Annum" checked={selectedOption === "$3995 Per Annum"} onChange={handleChange} />
        Annually
      </label>
      <br />
    </div>
    </div>
  )
}

export default SubscriptionPlans