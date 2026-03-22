'use client'
import ErrorBoundary from "../components/error";
import Nav from "../components/nav";
import OceanSurface from "../components/OceanSurface";
import Regclose from "../components/regclose";
import Reg from "../components/register";

export default function Register() {
  return ( 
    <ErrorBoundary>
      <div className="relative overflow-hidden min-h-screen">
         <div className="fixed inset-0 z-0 pointer-events-none">
                  <OceanSurface />
                </div>
        <div className="relative z-10">
          <Nav />
          {/* <Regclose/> */}
          <Reg/>
        </div>
      </div>
    </ErrorBoundary>
  );
}
