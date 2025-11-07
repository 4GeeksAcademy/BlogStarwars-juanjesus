import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import useGlobalReducer from "../hooks/useGlobalReducer.jsx";
import { storeActions } from "../store.js";
import placeholderImg from "../assets/img/descarga.png"; 

export const Demo = () => {
  const { store, dispatch } = useGlobalReducer();
  const [searchParams] = useSearchParams();
  const category = searchParams.get("category") || "people";

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const handleImageError = (e) => {
    e.target.src = placeholderImg;
  };

  useEffect(() => {
    const fetchCategoryPage = async () => {
      try {
        const url = `https://www.swapi.tech/api/${category}?page=${page}&limit=12`;
        const res = await fetch(url);
        const data = await res.json();

        if (data && data.results) {
          dispatch({
            type: "SET_LIST",
            payload: { resource: category, results: data.results },
          });

          if (data.total_records) {
            setTotalPages(Math.ceil(data.total_records / 12));
          } else {
            setTotalPages(10);
          }
        }
      } catch (error) {
        console.error(`Error fetching ${category} page ${page}:`, error);
      }
    };

    fetchCategoryPage();
  }, [category, page]);

  const data = store[category] || [];

  return (
    <div className="container mt-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="text-capitalize">{category}</h1>
        <Link to="/" className="btn btn-outline-primary">
          Back Home
        </Link>
      </div>

      <div className="row g-4">
        {data && data.length > 0 ? (
          data.map((item) => (
            <div key={item.uid} className="col-12 col-sm-6 col-md-4 col-lg-3">
              <div className="card h-100 text-center bg-dark text-light border-light">
                <img
                  src={placeholderImg}
                  alt={item.name || item.title}
                  className="card-img-top"
                  style={{ height: "250px", objectFit: "cover" }}
                  loading="lazy"
                  onError={handleImageError}
                />
                <div className="card-body">
                  <h5 className="card-title text-truncate">{item.name || item.title || "Unnamed"}</h5>

                  <div className="d-flex justify-content-between align-items-center mt-2">
                    <Link
                      to={`/single/${category}/${item.uid}`}
                      className="btn btn-outline-primary btn-sm"
                    >
                      Learn More
                    </Link>

                    <button
                      className="btn btn-outline-warning btn-sm"
                      onClick={() =>
                        store.favorites.some((f) => f.type === category && f.uid === item.uid)
                          ? storeActions.removeFavorite(dispatch, category, item.uid)
                          : storeActions.addFavorite(dispatch, {
                              type: category,
                              uid: item.uid,
                              name: item.name || item.title,
                            })
                      }
                    >
                      {store.favorites.some((f) => f.type === category && f.uid === item.uid)
                        ? "★"
                        : "☆"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <p className="text-muted text-center">Loading {category}...</p>
        )}
      </div>

      {totalPages > 1 && (
        <div className="d-flex justify-content-center mt-4">
          <nav>
            <ul className="pagination pagination-dark rounded p-2" style={{ backgroundColor: "#343a40" }}>
              <li className={`page-item ${page === 1 ? "disabled" : ""}`}>
                <button className="page-link" onClick={() => setPage((p) => p - 1)}>
                  Previous
                </button>
              </li>

              {[...Array(totalPages).keys()]
                .slice(Math.max(0, page - 3), Math.min(totalPages, page + 2))
                .map((n) => (
                  <li key={n + 1} className={`page-item ${page === n + 1 ? "active" : ""}`}>
                    <button className="page-link" onClick={() => setPage(n + 1)}>
                      {n + 1}
                    </button>
                  </li>
                ))}

              <li className={`page-item ${page === totalPages ? "disabled" : ""}`}>
                <button className="page-link" onClick={() => setPage((p) => p + 1)}>
                  Next
                </button>
              </li>
            </ul>
          </nav>
        </div>
      )}
    </div>
  );
};
