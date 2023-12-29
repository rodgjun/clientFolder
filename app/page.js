"use client";
import React, { useEffect, useState } from "react";
import Link from 'next/link';
import { Line } from "react-chartjs-2";
import Chart from 'chart.js/auto';
import {CategoryScale} from 'chart.js'; 
Chart.register(CategoryScale);

const Index = () => {
  const [provinces, setProvinces] = useState([]);
  const [selectedProvince, setSelectedProvince] = useState("PHILIPPINES");
  const [historicalPrices, setHistoricalPrices] = useState([]);
  const [predictedPrices, setPredictedPrices] = useState([]);
  const [accuracyMetrics, setAccuracyMetrics] = useState({}); // New state for accuracy metrics

  useEffect(() => {
    // Fetch accuracy metrics when the component mounts
    fetch("http://localhost:8080/api/accuracy-metrics")
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        // Round off the metrics to 2 decimal places
        const roundedMetrics = Object.fromEntries(
          Object.entries(data).map(([key, value]) => [key, value.toFixed(2)])
        );
        setAccuracyMetrics(roundedMetrics);
      })
      .catch((error) => {
        console.error("Error fetching accuracy metrics:", error);
      });
  }, []);


  useEffect(() => {
    // Fetch the list of provinces
    fetch("http://localhost:8080/api/provinces")
      .then((response) => response.json())
      .then((data) => {
        setProvinces(data.provinces);
      })
      .catch((error) => {
        console.error("Error fetching provinces:", error);
      });

    // Fetch historical prices for the selected province
    fetchHistoricalPrices(selectedProvince);

    // Fetch predicted prices for the selected province
    fetchPredictedPrices(selectedProvince);
  }, [selectedProvince]);

  const fetchHistoricalPrices = (province) => {
    fetch(`http://localhost:8080/api/historical-prices?province=${province}`)
      .then((response) => response.json())
      .then((data) => {
        setHistoricalPrices(data.historicalPrices);
      })
      .catch((error) => {
        console.error("Error fetching historical prices:", error);
      });
  };

  const fetchPredictedPrices = (province) => {
    fetch(`http://localhost:8080/api/predicted-prices?province=${province}`)
      .then((response) => response.json())
      .then((data) => {
        setPredictedPrices(data.predictedPrices);
        setAccuracyMetrics(data.accuracyMetrics);
      })
      .catch((error) => {
        console.error("Error fetching predicted prices:", error);
      });
  };

  const handleProvinceChange = (event) => {
    const selectedProvince = event.target.value;
    setSelectedProvince(selectedProvince);
  };

  const historicalPricesChart = {
    labels: historicalPrices.map((entry) => `${entry.Month} ${entry.Year}`),
    datasets: [
      {
        label: "Historical Prices",
        data: historicalPrices.map((entry) => entry[selectedProvince]),
        fill: false,
        borderColor: "rgb(75, 192, 192)",
      },
    ],
    options: {
      scales: {
        x: {
          type: 'category', // Use category scale for the x-axis
          labels: historicalPrices.map((entry) => entry.Month),
          title: {
            display: true,
            text: `Year`
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

  const predictedPricesChart = {
    labels: predictedPrices.map((entry) => `${entry.Month} ${entry.Year}`),
    datasets: [
      {
        label: "Actual Prices",
        data: predictedPrices.map((entry) => entry[selectedProvince]),
        fill: false,
        borderColor: "rgb(75, 192, 192)",
      },
      {
        label: "Predicted Prices",
        data: predictedPrices.map((entry) => entry.Predictions), // Adjust the property name based on your data structure
        fill: false,
        borderColor: "rgb(255, 99, 132)",
      },
    ],
    options: {
      scales: {
        x: {
          type: 'category', // Use category scale for the x-axis
          labels: predictedPrices.map((entry) => entry.Month),
          title: {
            display: true,
            text: predictedPrices.map((entry) => entry.Year), 
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
      </form>
      <br></br>
      <div className="mt-4">
        <h2 className="text-2xl mb-2">Historical Prices</h2>
        <Line data={historicalPricesChart} />
      </div>
      <br></br>     
      <div className="mt-4">
        <h2 className="text-2xl mb-2">Predicted Prices</h2>
        <Line data={predictedPricesChart} />
      </div>
      <br></br>
      <div className="mt-4">
        <h2 className="text-2xl mb-2">Accuracy Metrics</h2>
        <table>
          <thead>
            <tr>
              <th>Metric</th>
              <th>Value</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>RMSE</td>
              <td>{accuracyMetrics.RMSE}</td>
            </tr>
            <tr>
              <td>MAE</td>
              <td>{accuracyMetrics.MAE}</td>
            </tr>
            <tr>
              <td>MAPE</td>
              <td>{`${accuracyMetrics.MAPE}%`}</td>
            </tr>
            <tr>
              <td>R-squared</td>
              <td>{accuracyMetrics.R_squared}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <div className="button-container">
        <Link href="/predictions">
          <button className="button">Go to Predictions</button>
        </Link>
      </div>
    </div>
    
  );
};

export default Index;
