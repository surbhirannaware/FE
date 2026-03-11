import React from "react";

function Unauthorized() {
  return (
    <div className="h-screen flex items-center justify-center">
      <h1 className="text-2xl font-bold text-red-500">
        Access Denied 🚫
      </h1>
    </div>
  );
}

export default Unauthorized;