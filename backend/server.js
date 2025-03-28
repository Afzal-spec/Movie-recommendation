const express = require("express");
const cors = require("cors");
const { spawn } = require("child_process");
const path = require("path");
const axios = require("axios");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());

// Allow requests only from frontend URL in production (change in .env)
const allowedOrigins = process.env.FRONTEND_URL || "*";
app.use(cors({ origin: allowedOrigins }));

const pythonScriptPath = path.join(__dirname, "../movies_recommendation.py");

const TMDB_API_KEY = process.env.TMDB_API_KEY;

const getMoviePoster = async (movieTitle) => {
  try {
    const url = `https://api.themoviedb.org/3/search/movie?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(movieTitle)}`;
    const response = await axios.get(url);

    if (response.data.results.length === 0) return null; // No movie found

    const movie = response.data.results[0]; // First search result
    return movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : null;
  } catch (error) {
    console.error("Error fetching poster:", error.message);
    return null;
  }
};

app.post("/recommend", (req, res) => {
  const { movieTitle } = req.body;
  if (!movieTitle) return res.status(400).json({ error: "Movie title is required" });

  const pythonProcess = spawn("python", [pythonScriptPath, movieTitle]);
  let resultData = "";
  let errorData = "";

  pythonProcess.stdout.on("data", (data) => {
    resultData += data.toString();
  });

  pythonProcess.stderr.on("data", (error) => {
    errorData += error.toString();
  });

  pythonProcess.on("close", async (code) => {
    if (code === 0) {
      try {
        resultData = resultData.trim();
        const responseJson = JSON.parse(resultData);

        if (responseJson.error) {
          return res.status(404).json({ error: responseJson.error });
        }

        const { recommendations } = responseJson;
        if (!Array.isArray(recommendations)) {
          return res.status(500).json({ error: "Invalid response format from Python" });
        }

        // Fetch posters for each recommended movie
        const movieData = await Promise.all(
          recommendations.map(async (title) => {
            const poster = await getMoviePoster(title);
            return { title, poster };
          })
        );

        return res.json({ recommendations: movieData });
      } catch (error) {
        console.error("Error parsing Python response:", error);
        return res.status(500).json({ error: "Failed to parse Python response" });
      }
    } else {
      console.error(`Python script failed with error: ${errorData}`);
      return res.status(500).json({ error: "Python script execution failed", details: errorData });
    }
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
