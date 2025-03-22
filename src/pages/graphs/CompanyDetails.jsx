import React, { useState, useEffect, useCallback } from 'react';
import '../../styles/GeneralStyles.css';
import GraphPage from '../../components/GraphPage.jsx';
import useAuthToken from '../../hooks/useAuthToken';
import axios from 'axios';

const CompanyDetails = () => {
  const [companyData, setCompanyData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [filterTags, setFilterTags] = useState([]);

  const [filters, setFilters] = useState({
    asxCode: "",
    companyName: "",
    priorityCommodity: "",
    projectArea: ""
  });

  const { getAccessToken, authError } = useAuthToken(); 

  const fetchCompanyData = useCallback(async () => {
    setLoading(true);

    try {
      const token = await getAccessToken();
      if (!token) {
        setError(authError || "Authentication error");
        return;
      }

      const response = await axios.get("http://127.0.0.1:8000/data/company-details/", {
        headers: { Authorization: `Bearer ${token}` },
        params: Object.fromEntries(Object.entries(filters).filter(([_, v]) => v))
      });

      setCompanyData(response.data);
      setError("");
    } catch (err) {
      console.error(err);
      setError("Error fetching company details.");
    } finally {
      setLoading(false);
    }
  }, [filters, getAccessToken, authError]); 

  useEffect(() => {
    fetchCompanyData();
  }, [fetchCompanyData]);

  const topBy = (key, label) => {
    const sorted = [...companyData]
      .filter(item => item[key])
      .sort((a, b) => b[key] - a[key])
      .slice(0, 10);

    return {
      labels: sorted.map(item => item.asx_code),
      datasets: [{
        label,
        data: sorted.map(item => item[key]),
        backgroundColor: "#007bff"
      }]
    };
  };

  const valueByProjectArea = () => {
    if (!companyData || companyData.length === 0) {
      return {
        data: {
          labels: ["No Data"],
          datasets: [{
            label: "No Shareholder Data",
            data: [0],
            backgroundColor: "#ccc"
          }]
        },
        options: {
          responsive: true,
          plugins: {
            title: {
              display: true,
              text: "No Data Available"
            }
          }
        }
      };
    }

    const grouped = {};
    companyData.forEach(item => {
      const area = item.project_area;
      if (!area) return;
      grouped[area] = (grouped[area] || 0) + (item.value || 0);
    });

    const topAreas = Object.entries(grouped)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5);

    const data = {
      labels: topAreas.map(([area]) => area),
      datasets: [{
        label: "Shareholder Value",
        data: topAreas.map(([, val]) => val),
        backgroundColor: "#28a745"
      }]
    };

    const options = {
      responsive: true,
      plugins: {
        legend: {
          display: true,
          position: 'top'
        },
        title: {
          display: true,
          text: 'Shareholder Value by Project Area'
        }
      }
    };

    return { data, options };
  };

  const priorityCommodityDistribution = () => {
    const counts = {};
    companyData.forEach(item => {
      const commodity = item.priority_commodity;
      if (!commodity) return;
      counts[commodity] = (counts[commodity] || 0) + 1;
    });

    const topCommodities = Object.entries(counts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10);

    return {
      labels: topCommodities.map(([key]) => key),
      datasets: [{
        label: "Count",
        data: topCommodities.map(([, count]) => count),
        backgroundColor: "#ffc107"
      }]
    };
  };

  const metrics = [
    { title: "Total ASX Codes", value: new Set(companyData.map(d => d.asx_code)).size },
    { title: "Total Companies", value: new Set(companyData.map(d => d.company_name)).size },
    { title: "Project Areas", value: new Set(companyData.map(d => d.project_area).filter(Boolean)).size }
  ];

  const tableColumns = [
    { header: "ASX Code", key: "asx_code" },
    { header: "Company", key: "company_name" },
    { header: "Bank Balance", key: "bank_balance" },
    { header: "Value", key: "value" },
    { header: "Priority Commodity", key: "priority_commodity" },
    { header: "Project Area", key: "project_area" }
  ];

  const getUnique = (key) =>
    [...new Set(companyData.map(item => item[key]).filter(Boolean))].map(value => ({ label: value, value }));

  const allFilterOptions = [
    {
      label: "ASX Code",
      value: filters.asxCode,
      onChange: val => updateFilter("asxCode", val),
      options: [{ label: "Default", value: "" }, ...getUnique("asx_code")]
    },
    {
      label: "Company Name",
      value: filters.companyName,
      onChange: val => updateFilter("companyName", val),
      options: [{ label: "Default", value: "" }, ...getUnique("company_name")]
    },
    {
      label: "Priority Commodity",
      value: filters.priorityCommodity,
      onChange: val => updateFilter("priorityCommodity", val),
      options: [{ label: "Default", value: "" }, ...getUnique("priority_commodity")]
    },
    {
      label: "Project Area",
      value: filters.projectArea,
      onChange: val => updateFilter("projectArea", val),
      options: [{ label: "Default", value: "" }, ...getUnique("project_area")]
    }
  ];

  const updateFilter = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    if (value) {
      const tagLabel = {
        asxCode: "ASX Code",
        companyName: "Company Name",
        priorityCommodity: "Priority Commodity",
        projectArea: "Project Area"
      }[key];
      handleAddFilter({ label: tagLabel, value });
    }
  };

  const handleAddFilter = (filter) => {
    setFilterTags(prev => {
      const exists = prev.some(tag => tag.label === filter.label);
      return exists
        ? prev.map(tag => tag.label === filter.label ? filter : tag)
        : [...prev, filter];
    });
  };

  const handleRemoveFilter = (label) => {
    setFilterTags(prev => prev.filter(tag => tag.label !== label));
    switch (label) {
      case "ASX Code": updateFilter("asxCode", ""); break;
      case "Company Name": updateFilter("companyName", ""); break;
      case "Priority Commodity": updateFilter("priorityCommodity", ""); break;
      case "Project Area": updateFilter("projectArea", ""); break;
      default: break;
    }
  };

  const valueByArea = valueByProjectArea();

  return (
    <div className="standard-padding">
      {error && <div className="error-message">{error}</div>}
      {loading ? (
        <div className="loading-indicator">Loading...</div>
      ) : (
        <GraphPage
          title="Company Details"
          filterTags={filterTags}
          allFilterOptions={allFilterOptions}
          filterOptions={allFilterOptions.filter(opt => !filterTags.find(tag => tag.label === opt.label))}
          metricCards={metrics}
          chartData={[
            { title: "Top 10 Bank Balances", type: "bar", data: topBy("bank_balance", "Bank Balance") },
            { title: "Top 5 Values by Project Area", type: "bar", data: valueByArea.data, options: valueByArea.options },
            { title: "Top 10 Priority Commodities", type: "bar", data: priorityCommodityDistribution() }
          ]}
          tableColumns={tableColumns}
          tableData={companyData}
          handleAddFilter={handleAddFilter}
          handleRemoveFilter={handleRemoveFilter}
          applyFilters={fetchCompanyData}
        />
      )}
    </div>
  );
};

export default CompanyDetails;