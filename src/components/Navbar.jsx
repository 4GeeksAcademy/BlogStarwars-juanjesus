import { Link, useNavigate } from "react-router-dom";
import useGlobalReducer from "../hooks/useGlobalReducer.jsx";

export const Navbar = () => {
  const { store, dispatch } = useGlobalReducer();
  const navigate = useNavigate();
  const maxFavorites = 15;

  const displayedFavorites = store.favorites.slice(0, maxFavorites);

  const removeFavorite = (type, uid, e) => {
    e.stopPropagation(); // evita que el dropdown se cierre
    dispatch({ type: "REMOVE_FAVORITE", payload: { type, uid } });
  };

  return (
    <nav className="navbar navbar-dark bg-dark">
      <div className="container">
        <Link to="/">
          <span className="navbar-brand mb-0 h1">
            <i className="fa-solid fa-jedi fa-2x" style={{ color: "#f5c000" }}></i>
          </span>
        </Link>

        <div className="ml-auto dropdown">
          <button
            className="btn btn-warning dropdown-toggle"
            type="button"
            id="favoritesDropdown"
            data-bs-toggle="dropdown"
            aria-expanded="false"
          >
            Favorites ({store.favorites.length})
          </button>
          <ul className="dropdown-menu dropdown-menu-end" aria-labelledby="favoritesDropdown">
            {displayedFavorites.length > 0 ? (
              displayedFavorites.map((fav) => (
                <li key={`${fav.type}-${fav.uid}`} className="d-flex align-items-center justify-content-between px-2">
                  <button
                    className="dropdown-item text-start w-100"
                    onClick={() => navigate(`/single/${fav.type}/${fav.uid}`)}
                  >
                    {fav.name}
                  </button>
                  <button
                    className="btn btn-outline-secondary btn-sm ms-2"
                    onClick={(e) => removeFavorite(fav.type, fav.uid, e)}
                  >
                    <i className="fas fa-trash"></i>
                  </button>
                </li>
              ))
            ) : (
              <li>
                <span className="dropdown-item text-muted">No favorites yet</span>
              </li>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
};
