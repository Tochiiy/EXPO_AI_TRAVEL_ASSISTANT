export const saveItinerary = async (token: string, data: { destination: string, dates: string, aiResponse: string }) => {
  const res = await fetch('http://localhost:5000/api/itineraries/add', {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}` 
    },
    body: JSON.stringify(data)
  });
  return res.json();
};