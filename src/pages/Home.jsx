import { useEffect } from "react";
import { Link } from "react-router-dom";
import useGlobalReducer from "../hooks/useGlobalReducer.jsx";
import { storeActions } from "../store.js";
import placeholderImg from "../assets/img/descarga.png"; 
import heroBg from "../assets/img/thumb-1920-1249394.png"; 

export const Home = () => {
  const { store, dispatch } = useGlobalReducer();

  const categories = ["people", "planets", "starships", "vehicles", "films", "species"];

  useEffect(() => {
    categories.forEach((cat) => {
      if (!store[cat] || store[cat].length === 0) {
        storeActions.fetchList(dispatch, cat, { page: 1, limit: 10 }).catch((err) =>
          console.error(`Error fetching ${cat}:`, err)
        );
      }
    });
  }, []);

  const handleImageError = (e) => {
    e.target.src = placeholderImg;
  };

  const renderCategory = (title, resource) => {
    const data = store[resource];
    return (
      <div key={resource} className="mb-5">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h2 className="h4 text-capitalize">{title}</h2>
          <Link to={`/demo?category=${resource}`} className="btn btn-outline-primary btn-sm">
            View All
          </Link>
        </div>

        <div className="d-flex flex-nowrap overflow-auto pb-3" style={{ gap: "1rem" }}>
          {data && data.length > 0 ? (
            data.map((item) => (
              <div
                key={item.uid}
                className="card text-center bg-dark text-light border-light"
                style={{ minWidth: "14rem", flex: "0 0 auto" }}
              >
                <img
                  src={placeholderImg}
                  alt={item.name || item.title}
                  className="card-img-top"
                  style={{ height: "250px", objectFit: "cover" }}
                  onError={handleImageError}
                />
                <div className="card-body">
                  <h5 className="card-title text-truncate">{item.name || item.title || "Unnamed"}</h5>
                  <div className="d-flex justify-content-between align-items-center mt-2">
                    <Link
                      to={`/single/${resource}/${item.uid}`}
                      className="btn btn-outline-primary btn-sm"
                    >
                      Learn More
                    </Link>
                    <button
                      className="btn btn-outline-warning btn-sm"
                      onClick={() =>
                        store.favorites.some((f) => f.type === resource && f.uid === item.uid)
                          ? storeActions.removeFavorite(dispatch, resource, item.uid)
                          : storeActions.addFavorite(dispatch, {
                              type: resource,
                              uid: item.uid,
                              name: item.name || item.title,
                            })
                      }
                    >
                      {store.favorites.some((f) => f.type === resource && f.uid === item.uid)
                        ? "★"
                        : "☆"}
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p className="text-muted">Loading {title}...</p>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="container mt-4">
      {/* Hero image */}
      <div
        className="hero-container position-relative mb-5"
        style={{
          backgroundImage: `url(${heroBg})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          height: "50vh",
          width: "100%",
          borderRadius: "0.5rem",
        }}
      >
        <h1
          style={{
            fontFamily: "'Star Jedi', sans-serif",
            fontSize: "5rem",
            color: "#f5c000",
            textShadow: "2px 2px 6px black",
            position: "absolute",
            bottom: "20px",
            left: "50%",
            transform: "translateX(-50%)",
            margin: 0,
          }}
        >
          Database
        </h1>
      </div>

      {/* Categories */}
      {categories.map((cat) => renderCategory(cat, cat))}
    </div>
  );
};
