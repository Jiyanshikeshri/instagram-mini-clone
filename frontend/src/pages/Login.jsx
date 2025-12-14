import React from "react";

function Login() {
  return (
    <div>
      <h2>Login Page</h2>
      <button onClick={() => window.location.href="/home"}>
        Login
      </button>
    </div>
  );
}

export default Login;
