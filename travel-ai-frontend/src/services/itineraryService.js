export const saveItinerary = async (token, data) => {
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
