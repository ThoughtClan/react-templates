import { Route, Routes } from "react-router-dom";

import Home from "./Home";

export default function AuthenticatedRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
    </Routes>
  );
}
