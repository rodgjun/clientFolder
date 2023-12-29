"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Line } from "react-chartjs-2";
import Chart from "chart.js/auto";
import { CategoryScale } from "chart.js";
Chart.register(CategoryScale);

const Predictions = () => {
  const [provinces, setProvinces] = useState([]);
  const [selectedProvince, setSelectedProvince] = useState('PHILIPPINES');
  const [selectedYear, setSelectedYear] = useState('2024');
  const [predictions, setPredictions] = useState([]);

  useEffect(() => {
    // Fetch the list of provinces
    fetch('http://localhost:8080/api/provinces')
      .then((response) => response.json())
      .then((data) => {
        setProvinces(data.provinces);
      })
      .catch((error) => {
        console.error('Error fetching provinces:', error);
      });
  }, []);

  useEffect(() => {
    // Fetch predictions for the selected province and year
    fetchPredictions(selectedProvince, selectedYear);
  }, [selectedProvince, selectedYear]);

  const fetchPredictions = (province, year) => {
    fetch(`http://localhost:8080/api/predictions?province=${province}&year=${year}`)
      .then((response) => response.json())
      .then((data) => {
        console.log('Predictions API Response:', data);
        setPredictions(data.predictions);
      })
      .catch((error) => {
        console.error('Error fetching predictions:', error);
      });
  };

  const handleProvinceChange = (event) => {
    const selectedProvince = event.target.value;
    setSelectedProvince(selectedProvince);
  };

  const handleYearChange = (event) => {
    const selectedYear = event.target.value;
    setSelectedYear(selectedYear);
  };

  const predictionsChart = {
    labels: predictions.map((entry) => `${entry.Month} ${entry.Year}`),
    datasets: [
      {
        label: 'Predicted Prices',
        data: predictions.map((entry) => entry[selectedProvince]),
        fill: false,
        borderColor: 'rgb(255, 99, 132)',
      },
    ],
    options: {
      scales: {
        x: {
          type: 'category', // Use category scale for the x-axis
          labels: predictions.map((entry) => entry.Month),
          title: {
            display: true,
            text: `Year ${selectedYear}`,
          },
        },
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text: 'Prices',
          },
        },
      },
    },
  };

  return (
    <div>
      <h1 className="text-4xl mb-4">Price Prediction Dashboard</h1>

      <form>
        <label className="mr-2">Select Province:</label>
        <select
          value={selectedProvince}
          onChange={handleProvinceChange}
          className="p-2 border border-primary-color rounded"
        >
          {provinces.map((province) => (
            <option key={province} value={province}>
              {province}
            </option>
          ))}
        </select>

        <label className="ml-4 mr-2">Select Year:</label>
        <select
          value={selectedYear}
          onChange={handleYearChange}
          className="p-2 border border-primary-color rounded"
        >
          {['2024', '2025', '2026', '2027'].map((year) => (
            <option key={year} value={year}>
              {year}
            </option>
          ))}
        </select>
      </form>

      <div className="mt-4">
        <h2 className="text-2xl mb-2">Predicted Prices</h2>
        <Line data={predictionsChart} />
      </div>
    </div>
  );
};

export default Predictions;