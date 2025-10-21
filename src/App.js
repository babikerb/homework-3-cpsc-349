import { useEffect, useState } from "react";
import "./App.css";

export default function Movies() {
  const apiKey = process.env.REACT_APP_API_KEY;
  const baseUrl = "https://api.themoviedb.org/3";
  const imageUrl = "https://image.tmdb.org/t/p/w500";

  const [movies, setMovies] = useState([]);
  const [currentPages, setCurrentPages] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("popularity.desc");

  function fetchDefaultMovies() {
    setLoading(true);
    setError(null);
    const url = `${baseUrl}/discover/movie?sort_by=${"popularity.desc"}&api_key=${apiKey}&page=${currentPages}`;
    fetch(url)
      .then((response) => {
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return response.json();
      })
      .then((data) => {
        setMovies(data.results);
        setTotalPages(data.total_pages || 1);
        console.log(data.results);
      })
      .catch((err) => {
        console.error("Error fetching movies:", err);
        setError(err.message || "Unknown error");
      })
      .finally(() => setLoading(false));
  }

  function fetchSearchMovies() {
    if (!searchQuery.trim()) return;
    setLoading(true);
    setError(null);
    const url = `${baseUrl}/search/movie?query=${encodeURIComponent(
      searchQuery
    )}&api_key=${apiKey}&page=${currentPages}`;
    fetch(url)
      .then((response) => {
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return response.json();
      })
      .then((data) => {
        setMovies((prev) => [...prev, ...data.results]);
        setTotalPages(data.total_pages || 1);
        console.log(data.results);
      })
      .catch((err) => {
        console.error("Error fetching search results:", err);
        setError(err.message || "Unknown error");
      })
      .finally(() => setLoading(false));
  }

  function fetchMovies() {
    if (searchQuery.trim()) {
      fetchSearchMovies();
    } else {
      fetchDefaultMovies();
    }
  }

  function handleEnter(event) {
    if (event.key === "Enter") {
      setMovies([]);
      setCurrentPages(1);
      fetchMovies();
    }
  }

  function sortMovies(movies, sortBy) {
    const sortedMovies = [...movies];
    switch (sortBy) {
      case "release_date.asc":
        sortedMovies.sort(
          (a, b) => new Date(a.release_date) - new Date(b.release_date)
        );
        break;
      case "release_date.desc":
        sortedMovies.sort(
          (a, b) => new Date(b.release_date) - new Date(a.release_date)
        );
        break;
      case "vote_average.asc":
        sortedMovies.sort((a, b) => a.vote_average - b.vote_average);
        break;
      case "vote_average.desc":
        sortedMovies.sort((a, b) => b.vote_average - a.vote_average);
        break;
      default:
        sortedMovies.sort((a, b) => b.popularity - a.popularity);
        break;
    }
    setMovies(sortedMovies);
    setSortBy(sortBy);
  }

  useEffect(() => {
    fetchMovies();
  }, [currentPages]);

  return (
    <div className="main">
      <header className="header">
        <h1>Movie Explorer</h1>
        <div className="controls">
          <input
            className="input"
            type="text"
            placeholder="Search for a movie..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleEnter}
          />
          <select
            className="select"
            value={sortBy}
            onChange={(e) => sortMovies(movies, e.target.value)}
          >
            <option value="">Sort By</option>
            <option value="release_date.asc">Release Date (Asc)</option>
            <option value="release_date.desc">Release Date (Desc)</option>
            <option value="vote_average.asc">Rating (Asc)</option>
            <option value="vote_average.desc">Rating (Desc)</option>
          </select>
        </div>
      </header>
      <main>
        <div className="movie-container">
          {movies.map((movie) => (
            <div className="movie-card" key={movie.id}>
              {movie.poster_path && (
                <img
                  src={`${imageUrl}${movie.poster_path}`}
                  alt={movie.title}
                  style={{ width: "200px" }}
                />
              )}
              <h3>{movie.title}</h3>
              <p>Release Date:{movie.release_date}</p>
              <p>Rating: {movie.vote_average}</p>
            </div>
          ))}
        </div>
      </main>
      <footer className="footer">
        <button
          className="prevBtn"
          disabled={currentPages === 1}
          onClick={() => {
            setCurrentPages((prev) => Math.max(prev - 1, 1));
          }}
        >
          Previous
        </button>
        <span>
          Page {currentPages} of {totalPages}
        </span>
        <button
          className="nextBtn"
          disabled={currentPages === totalPages}
          onClick={() => {
            setCurrentPages((prev) => Math.min(prev + 1, totalPages));
          }}
        >
          Next
        </button>
      </footer>
    </div>
  );
}
