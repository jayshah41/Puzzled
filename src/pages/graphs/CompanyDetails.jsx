import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";

const CompanyDetails = () => {
    const [companies, setCompanies] = useState([]);
    const [totalCompanies, setTotalCompanies] = useState(0);
    const [minPrice, setMinPrice] = useState("");
    const [maxPrice, setMaxPrice] = useState("");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const fetchCompanies = useCallback(async () => {
        const token = localStorage.getItem("accessToken");

        if (!token) {
            console.error("No token found! User is likely not logged in.");
            setError("Authentication error: No token found.");
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            const response = await axios.get("http://127.0.0.1:8000/data/companies/", {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json"
                },
                params: { min_price: minPrice, max_price: maxPrice, start_date: startDate, end_date: endDate },
            });

            console.log("API Response:", response.data);
            setCompanies(response.data || []); 
            setTotalCompanies(response.data.length || 0); 
            setError("");
        } catch (error) {
            console.error("Error fetching companies:", error.response?.data || error);
            setError("Failed to fetch company data.");
        } finally {
            setLoading(false);
        }
    }, [minPrice, maxPrice, startDate, endDate]);

    useEffect(() => {
        console.log("Fetching companies...");
        fetchCompanies();
    }, [fetchCompanies]);

    return (
        <div className="p-6 bg-white rounded-lg shadow-lg">
            <h1 className="text-2xl font-bold mb-4">Company Details</h1>

            {/* Show error message */}
            {error && <p className="text-red-500 mb-4">{error}</p>}

            {/* Filter Inputs */}
            <div className="flex space-x-4 mb-4">
                <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="p-2 border rounded" />
                <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="p-2 border rounded" />
                <input type="number" placeholder="Min Price" value={minPrice} onChange={e => setMinPrice(e.target.value)} className="p-2 border rounded" />
                <input type="number" placeholder="Max Price" value={maxPrice} onChange={e => setMaxPrice(e.target.value)} className="p-2 border rounded" />
            </div>

            {/* Display Total Companies */}
            <div className="p-4 border rounded-lg bg-gray-100 mb-4">
                <h2 className="text-lg font-semibold">Total Companies</h2>
                <p className="text-2xl">{totalCompanies}</p>
            </div>

            {/* Show Loading State */}
            {loading ? (
                <p className="text-center text-gray-500">Loading...</p>
            ) : (
                <table className="min-w-full bg-white border border-gray-300">
                    <thead>
                        <tr className="bg-gray-100">
                            <th className="border px-4 py-2">ASX Code</th>
                            <th className="border px-4 py-2">Company Name</th>
                        </tr>
                    </thead>
                    <tbody>
                        {companies.length > 0 ? (
                            companies.map(company => (
                                <tr key={company.asx_code}>
                                    <td className="border px-4 py-2">{company.asx_code}</td>
                                    <td className="border px-4 py-2">{company.company_name}</td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="2" className="border px-4 py-2 text-center">No companies found</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            )}
        </div>
    );
};

export default CompanyDetails;
