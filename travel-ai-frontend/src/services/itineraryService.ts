export const saveItinerary = async (token: string, data: { destination: string, dates: string, aiResponse: string }) => {
  
  const API_URL = 'https://expo-ai-travel-assistant.onrender.com';

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