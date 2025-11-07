// src/pages/Single.jsx
import { Link, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import useGlobalReducer from "../hooks/useGlobalReducer.jsx";
import { storeActions } from "../store.js";
import placeholderImg from "../assets/img/descarga.png";

export const Single = () => {
  const { store, dispatch } = useGlobalReducer();
  const { category, uid } = useParams();
  const [item, setItem] = useState(null);

  const handleImageError = (e) => (e.target.src = placeholderImg);

  const fetchRelation = async (url) => {
    if (!url) return null;

    const cleanUrl = url.replace(/\/$/, "");
    const segments = cleanUrl.split("/");
    const resource = segments[segments.length - 2];
    const uid = segments[segments.length - 1];

    const cached = store[resource]?.find((r) => r.uid === uid);
    if (cached) return cached.name || cached.title;

    try {
      const data = await fetch(cleanUrl)
        .then((res) => res.json())
        .then((json) => (json.result?.properties ? json.result.properties : null));
      return data?.name || data?.title || null;
    } catch (err) {
      console.error("fetchRelation error:", err);
      return null;
    }
  };

  useEffect(() => {
    let mounted = true;

    const fetchItem = async () => {
      try {
        const data = await fetch(`https://www.swapi.tech/api/${category}/${uid}`)
          .then((res) => res.json())
          .then((json) =>
            json.result?.properties
              ? { ...json.result.properties }
              : json.result
          );

        if (data && mounted) {
          const resolved = { ...data };

          if (resolved.homeworld) {
            resolved.Homeworld = await fetchRelation(resolved.homeworld);
          }

          if (resolved.vehicles?.length) {
            const vehicleNames = await Promise.all(resolved.vehicles.map(fetchRelation));
            resolved.Vehicles = vehicleNames.filter(Boolean).join(", ");
          }

          if (resolved.starships?.length) {
            const starshipNames = await Promise.all(resolved.starships.map(fetchRelation));
            resolved.Starships = starshipNames.filter(Boolean).join(", ");
          }

          if (resolved.films?.length) {
            const filmNames = await Promise.all(resolved.films.map(fetchRelation));
            resolved.Films = filmNames.filter(Boolean).join(", ");
          }

          setItem(resolved);
        }
      } catch (error) {
        console.error("Error loading single item:", error);
      }
    };

    fetchItem();
    return () => {
      mounted = false;
    };
  }, [category, uid, store]);

  if (!item) return <p className="text-center mt-5">Loading {category}...</p>;

  const isFavorite = store.favorites.some((f) => f.type === category && f.uid === uid);

  const toggleFavorite = () => {
    if (isFavorite) {
      storeActions.removeFavorite(dispatch, category, uid);
    } else {
      storeActions.addFavorite(dispatch, { type: category, uid, name: item.name || item.title });
    }
  };

  return (
    <div className="container mt-5">
      <div className="card bg-dark text-light border-light mx-auto" style={{ maxWidth: "500px" }}>
        <img
          src={placeholderImg}
          className="card-img-top"
          alt={item.name || item.title}
          style={{ height: "400px", objectFit: "cover" }}
          onError={handleImageError}
        />
        <div className="card-body">
          <h2 className="card-title text-center">{item.name || item.title || "Unnamed"}</h2>

          {Object.entries(item).map(([key, value]) => {
            if (["uid", "created", "edited", "url"].includes(key)) return null;
            if (typeof value === "string" || typeof value === "number") {
              return (
                <p key={key} className="mb-1">
                  <strong>{key.replace("_", " ")}:</strong> {value}
                </p>
              );
            }
            return null;
          })}

          <button
            className={`btn mt-2 w-100 ${isFavorite ? "btn-warning" : "btn-outline-warning"}`}
            onClick={toggleFavorite}
          >
            {isFavorite ? "Remove from Favorites" : "Add to Favorites"}
          </button>

          <Link to="/" className="btn btn-outline-primary mt-3 w-100">
            Back Home
          </Link>
        </div>
      </div>
    </div>
  );
};
