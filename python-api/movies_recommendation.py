import sys
import json
import pandas as pd
import re
from sklearn.metrics.pairwise import cosine_similarity

# Define absolute file paths (Ensure they exist)
ratings_path = r"C:/fullstack projects/my projects/Python_Package/movies_recommendation/ml-100k/u.data"
movies_path = r"C:/fullstack projects/my projects/Python_Package/movies_recommendation/ml-100k/u.item"

# Load Ratings Data
try:
    ratings = pd.read_csv(
        ratings_path, sep="\t",
        names=["user_id", "movie_id", "rating", "timestamp"],
        encoding="latin-1"
    )
    ratings.drop(columns=["timestamp"], inplace=True)
except Exception as e:
    print(json.dumps({"error": f"Error loading ratings data: {str(e)}"}))
    sys.exit(1)

# Load Movies Data (Including Genres)
try:
    movie_columns = ["movie_id", "title"] + [f"genre_{i}" for i in range(19)]
    movies = pd.read_csv(
        movies_path, sep="|",
        names=movie_columns, encoding="latin-1",
        usecols=["movie_id", "title"] + [f"genre_{i}" for i in range(19)]
    )

    # Ensure genre columns are numeric
    genre_columns = movies.columns[2:]
    movies[genre_columns] = movies[genre_columns].apply(pd.to_numeric, errors="coerce").fillna(0).astype(int)
except Exception as e:
    print(json.dumps({"error": f"Error loading movies data: {str(e)}"}))
    sys.exit(1)

# Merge ratings with movie titles
try:
    movie_ratings = ratings.merge(movies, on="movie_id")

    # Create user-movie rating matrix
    rating_matrix = movie_ratings.pivot_table(index="user_id", columns="title", values="rating").fillna(0)

    # Compute Cosine Similarity
    if rating_matrix.shape[1] == 0:
        print(json.dumps({"error": "No movies found in dataset"}))
        sys.exit(1)

    cosine_sim = cosine_similarity(rating_matrix.T)
    movie_similarity = pd.DataFrame(cosine_sim, index=rating_matrix.columns, columns=rating_matrix.columns)
except Exception as e:
    print(json.dumps({"error": f"Error computing similarity: {str(e)}"}))
    sys.exit(1)

# Function to clean movie titles
def clean_title(title):
    return re.sub(r"\(\d{4}\)", "", title).strip().lower()

# Function to get movie recommendations
def get_movie_recommendations(movie_title, top_n=10):
    try:
        normalized_movie_title = clean_title(movie_title)
        title_mapping = {clean_title(title): title for title in movie_similarity.columns}

        if normalized_movie_title not in title_mapping:
            return {"error": "Movie not found. Please search another one."}

        correct_title = title_mapping[normalized_movie_title]
        similar_scores = movie_similarity[correct_title].dropna().sort_values(ascending=False)

        # Return top N recommendations excluding the input movie
        filtered_recommendations = similar_scores.index[similar_scores.index != correct_title].tolist()

        return {"recommendations": filtered_recommendations[:top_n]}

    except KeyError:
        return {"error": "Movie title not found in similarity matrix"}
    except Exception as e:
        return {"error": f"Unexpected error: {str(e)}"}

# Handle API request
if __name__ == "__main__":
    try:
        if len(sys.argv) < 2:
            print(json.dumps({"error": "Movie title is required"}))
            sys.exit(1)

        movie_title = sys.argv[1]
        recommendations = get_movie_recommendations(movie_title)

        # Ensure proper JSON output
        print(json.dumps(recommendations, ensure_ascii=False))

    except Exception as e:
        print(json.dumps({"error": f"Unexpected error: {str(e)}"}))

sys.exit(0)
