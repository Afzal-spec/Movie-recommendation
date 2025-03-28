import axios from "axios";

const API_BASE_URL = "http://localhost:5000"; // Backend URL

export const getMovieRecommendations = async (movieTitle) => {
    try {
        const response = await axios.post(`${API_BASE_URL}/recommend`, { movieTitle });
        return response.data.recommendations || [];
    } catch (error) {
        console.error("Error fetching recommendations:", error);
        return [];
    }
};
