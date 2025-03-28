from fastapi import FastAPI
from pydantic import BaseModel
import json

app = FastAPI()

class MovieRequest(BaseModel):
    movieTitle: str

@app.post("/recommend")
def recommend_movie(data: MovieRequest):
    movie_title = data.movieTitle
    # Dummy response (Replace this with your ML logic)
    recommendations = ["Movie 1", "Movie 2", "Movie 3"]
    return {"recommendations": recommendations}

