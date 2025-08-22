async function getPhotos() {
  try {
    const response = await fetch('https://jsonplaceholder.typicode.com/photos');
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching photos:', error);
    throw error;
  }
}

export default getPhotos;