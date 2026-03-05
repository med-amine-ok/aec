'use client'
import ErrorBoundary from "../components/error";
import Nav from "../components/nav";
import Team from "../components/team";

export default function Accepted() {
  return (
    <ErrorBoundary>
      <div className="relative min-h-screen overflow-hidden">
        <Nav />
        <Team />
      </div>
    </ErrorBoundary>
  );
}
