import React, { useState } from "react";
import MovieSearch from "./components/MovieSearch";

const App = () => {
  return (
    <div className="container mt-5">
      <h1 className="text-center">🎬 Movie Recommendation System</h1>
      <MovieSearch />
    </div>
  );
};

export default App;
