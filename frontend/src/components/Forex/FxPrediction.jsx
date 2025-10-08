"use client";
import { useEffect, useState } from "react";
import axios from "axios";
import { DateTime } from "luxon";
import formatDate from './formatDate';
import {
  Box,
  Heading,
  Spinner,
  Table,
  VStack,
  HStack,
  Button,
  Text,
  Badge,
  Grid,
  GridItem,
} from "@chakra-ui/react";
import { toaster } from "../ui/toaster";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  LineElement,
  PointElement,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  LineElement,
  PointElement,
  Tooltip,
  Legend,
  Filler
);

function FxPrediction() {
  const [realData, setRealData] = useState([]);
  const [preds, setPreds] = useState([]);
  const [predHistory, setPredHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [training, setTraining] = useState(false);
  const [fetchingData, setFetchingData] = useState(false);
  const [currentTimeUTC, setCurrentTimeUTC] = useState("");
  const [generatedAt, setGeneratedAt] = useState("");
  const [predictionType, setPredictionType] = useState("next");
  const [hours] = useState(2);

  // ✅ Use environment-based BASE_URL
  const BASE_URL = 'https://www.zone2rock.com'

  const fetchRealData = async () => {
    const url = `${BASE_URL}/api/forex/real_data/`;
    try {
      const res = await axios.get(url);
      console.log("res_real:", res.data);

      const sortedData = res.data.sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      );

      const now = DateTime.utc();
      const twelveHoursAgo = now.minus({ hours: 48 });

      const recentData = sortedData.filter((p) => {
        const pointTime = DateTime.fromISO(p.date, { zone: 'utc' });
        return pointTime >= twelveHoursAgo;
      });

      console.log("Total real data points:", sortedData.length);
      console.log("Filtered to last 12 hours:", recentData.length);
      if (recentData.length > 0) {
        console.log("Oldest:", recentData[0].date);
        console.log("Newest:", recentData[recentData.length - 1].date);
      }

      setRealData(recentData);
    } catch (error) {
      console.error("Fetch real data error:", error);
      setRealData([]);
      toaster.create({
        description: "Failed to fetch real data",
        type: "error",
      });
    }
  };

  const fetchPreds = async (type = "next", numHours = 1) => {
    const url = `${BASE_URL}/api/forex/forecast/?hours=${numHours}&type=${type}`;
    try {
      const res = await axios.get(url);
      if (res.data.success) {
        setPreds(res.data.predictions);
        setGeneratedAt(res.data.generated_at);
        setCurrentTimeUTC(res.data.current_time_utc || DateTime.utc().toISO());
        setPredictionType(res.data.type);
        toaster.create({
          description: `Successfully loaded ${res.data.count} predictions`,
          type: "success",
        });
      } else {
        throw new Error("Failed to fetch predictions");
      }
    } catch (error) {
      console.error("Fetch predictions error:", error);
      setPreds([]);
      toaster.create({
        description: "Failed to fetch predictions. Please try training the model first.",
        type: "error",
      });
    }
  };

  const fetchHistory = async () => {
    const url = `${BASE_URL}/api/forex/predictions/history/`;
    try {
      const resp = await axios.get(url);
      const history_data = resp.data;

      const sortedHistory = history_data.sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      );
      setPredHistory(sortedHistory);
    } catch (error) {
      console.error("fetch pred history failed:", error);
      toaster.create({
        description: "Failed to fetch prediction history",
        type: "error",
      });
    }
  };

  const trainModel = async () => {
    setTraining(true);
    const url = `${BASE_URL}/api/forex/train/`;
    try {
      const res = await axios.post(url, { epochs: 500 });
      if (res.data.success) {
        toaster.create({
          description: res.data.message || "Model trained successfully",
          type: "success",
        });
        setTimeout(() => fetchPreds(predictionType, hours), 1000);
      } else {
        throw new Error(res.data.message || "Training failed");
      }
    } catch (error) {
      console.error("Training error:", error);
      toaster.create({
        description: error.response?.data?.message || "Training failed",
        type: "error",
      });
    } finally {
      setTraining(false);
    }
  };

  const fetchLatestData = async () => {
    const url = `${BASE_URL}/api/forex/real-data/latest-data/`;
    setFetchingData(true);

    try {
      const response = await axios.post(url);
      if (response.data.success) {
        console.log('✅ Data fetched successfully:', response.data);
        toaster.create({
          description: `Data updated! Latest price: $${response.data.latest_price?.toFixed(2)}`,
          type: "success",
        });
        await fetchRealData();
        await fetchHistory();
        return response.data;
      } else {
        console.error('❌ Update data failed:', response.data.error);
        toaster.create({
          description: response.data.error || "Failed to update data",
          type: "error",
        });
      }
    } catch (error) {
      console.error("Refresh latest data error:", error);
      if (error.response?.data?.error) {
        toaster.create({ description: error.response.data.error, type: "error" });
      } else if (error.request) {
        toaster.create({ description: "Network error. Please check your connection.", type: "error" });
      } else {
        toaster.create({ description: "Failed to fetch data. Please try again.", type: "error" });
      }
    } finally {
      setFetchingData(false);
    }
  };

  const formatDateTimeEEST = (isoString) => {
    if (!isoString) return "N/A";
    return DateTime.fromISO(isoString, { zone: "utc" })
      .setZone("Europe/Helsinki")
      .toFormat("hh:mm a 'EEST on' cccc, LLLL d, yyyy");
  };

  const formatTimeEEST = (isoString) => {
    if (!isoString) return "N/A";
    return DateTime.fromISO(isoString, { zone: "utc" })
      .setZone("Europe/Helsinki")
      .toFormat("hh:mm a");
  };

  useEffect(() => {
    const fetchAllData = async () => {
      setLoading(true);
      try {
        await Promise.all([
          fetchRealData(),
          fetchPreds(),
          fetchHistory()
        ]);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchAllData();
  }, []);

  // ... rest of your component (chart rendering, buttons, table) stays the same
}

export default FxPrediction;