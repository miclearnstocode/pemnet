const API_URL = process.env.NEXT_PUBLIC_API_URL || '';

export async function getItems() {
  const response = await fetch(`${API_URL}/items`, {
    cache: 'no-store', // Don't cache, get fresh data
  });
  
  if (!response.ok) {
    throw new Error('Failed to fetch items');
  }
  
  return response.json();
}

export async function createItem(itemData) {
  const response = await fetch(`${API_URL}/items`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(itemData),
  });
  
  if (!response.ok) {
    throw new Error('Failed to create item');
  }
  
  return response.json();
}

export async function updateItem(id, itemData) {
  const response = await fetch(`${API_URL}/items/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(itemData),
  });
  
  if (!response.ok) {
    throw new Error('Failed to update item');
  }
  
  return response.json();
}

export async function deleteItem(id) {
  const response = await fetch(`${API_URL}/items/${id}`, {
    method: 'DELETE',
  });
  
  if (!response.ok) {
    throw new Error('Failed to delete item');
  }
  
  return true;
}