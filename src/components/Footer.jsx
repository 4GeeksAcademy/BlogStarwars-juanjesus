export const Footer = () => (
  <footer
    className="footer bg-dark text-light text-center py-3"
    style={{
      position: "fixed",
      bottom: 0,
      left: 0,
      width: "100%",
      zIndex: 1000,
    }}
  >
    <p className="mb-0">
      Juan Jesús Díaz. Made with <i className="fa fa-heart text-danger" /> by{" "}
      <a href="http://www.4geeksacademy.com" className="text-light text-decoration-underline">
        4Geeks Academy
      </a>
    </p>
  </footer>
);
