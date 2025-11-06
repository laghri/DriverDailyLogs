import axios from 'axios';
const API_URL = process.env.REACT_APP_API_URL || 'http://127.0.0.1:8000/api';

export async function calculateTrip(payload) {
  const res = await axios.post(`${API_URL}/trips/calculate/`, payload);
  return res.data;
}
