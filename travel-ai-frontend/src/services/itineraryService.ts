export const saveItinerary = async (token: string, data: { destination: string, dates: string, aiResponse: string }) => {
  
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  const res = await fetch(`${API_URL}/api/itineraries/add`, {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}` 
    },
    body: JSON.stringify(data)
  });
  
  if (!res.ok) throw new Error('Failed to save itinerary');
  return res.json();
};