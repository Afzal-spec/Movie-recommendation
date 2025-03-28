import React, { useState } from "react";
import axios from "axios";
import "./MovieSearch.css";

const MovieSearch = () => {
  const [movieTitle, setMovieTitle] = useState("");
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const fetchRecommendations = async () => {
    if (!movieTitle) return;
    setLoading(true);
    setRecommendations([]);
    setErrorMessage(""); // Clear previous error

    try {
      const response = await axios.post("http://localhost:5000/recommend", {
        movieTitle,
      });

      if (response.data.recommendations.length === 0) {
        setErrorMessage("Oops! The movie is not in the dataset. Try another one.");
      } else {
        setRecommendations(response.data.recommendations);
      }
    } catch (error) {
      if (error.response && error.response.status === 404) {
        setErrorMessage("Oops! The movie is not in the dataset. Try another one.");
      } else {
        setErrorMessage("Something went wrong. Please try again later.");
      }
    }
    setLoading(false);
  };

  const clearResults = () => {
    setMovieTitle("");
    setRecommendations([]);
    setErrorMessage("");
  };

  return (
    <div className="container">
      {/* Search Bar */}
      <div className="input-group">
        <input
          type="text"
          className="form-control"
          placeholder="Enter a movie name..."
          value={movieTitle}
          onChange={(e) => setMovieTitle(e.target.value)}
        />
        <button className="btn btn-primary" onClick={fetchRecommendations}>
          Get Recommendations
        </button>
        {(recommendations.length > 0 || errorMessage) && (
          <button className="btn btn-danger ms-2" onClick={clearResults}>
            Clear
          </button>
        )}
      </div>

      {/* Loading Indicator */}
      {loading && <div className="spinner-border text-primary mt-3" role="status"></div>}

      {/* Error Message */}
      {errorMessage && <div className="alert alert-warning mt-3">{errorMessage}</div>}

      {/* Movie Recommendations */}
      <div className="row mt-3">
        {recommendations.map((movie, index) => (
          <div key={index} className="col-md-4 mb-3">
            <div className="card shadow-sm border-0 hover-effect fade-in">
              {movie.poster ? (
                <img src={movie.poster} alt={movie.title} className="card-img-top" />
              ) : (
                <div className="no-image">No Image Available</div>
              )}
              <div className="card-body text-center">
                <h5 className="card-title">{movie.title}</h5>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MovieSearch;
