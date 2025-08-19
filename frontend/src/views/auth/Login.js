import React, { useState } from "react";
import { Link, useHistory } from "react-router-dom";
import axios from "axios";


import SkillHireLogo from "assets/img/skillhire-logo2.png"; 

export default function Login() {
  const [formData, setFormData] = useState({ username: "", password: "" });
  const history = useHistory();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleLogin = async () => {
    try {
      const res = await axios.post("https://localhost:7109/api/Auth/login", formData);

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data));

      const role = res.data.role;
      alert("Login successful!");

      if (role === "Admin") history.push("/admin/dashboard");
      else if (role === "Client") history.push("/client/dashboard");
      else if (role === "Worker") history.push("/worker/dashboard");
      else history.push("/auth/login");
    } catch (err) {
      alert("Login failed: " + (err.response?.data || err.message));
    }
  };

  return (
    <>
      <div
        className="min-h-screen bg-no-repeat bg-cover bg-center"
        style={{
          backgroundImage: `url(${require("assets/img/backgroundf.png")})`,
        }}
      >
        <div className="container mx-auto px-4 h-full">
          <div className="flex content-center items-center justify-center h-full">
            <div className="w-full lg:w-4/12 px-4">
              <div className="relative flex flex-col min-w-0 break-words w-full mb-6 shadow-lg rounded-lg bg-blueGray-200 border-0 mt-20">
                {/* Card Header */}
                <div className="rounded-t mb-0 px-6 py-6">
                  <div className="text-center mb-3">
                    {}
                    <img
                      src={SkillHireLogo}
                      alt="SkillHire"
                      className="h-25 mx-auto"
                    />

                  </div>
                  <hr className="mt-4 border-b-1 border-blueGray-300" />
                </div>

                {/* Card Body */}
                <div className="flex-auto px-4 lg:px-10 py-10 pt-0">
                  <div className="text-blueGray-400 text-center mb-3 font-bold">
                    <small>Sign in with credentials</small>
                  </div>
                  <form>
                    <div className="relative w-full mb-3">
                      <label className="block uppercase text-blueGray-600 text-xs font-bold mb-2">
                        Email
                      </label>
                      <input
                        type="text"
                        name="username"
                        value={formData.username}
                        onChange={handleChange}
                        className="border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
                        placeholder="Email or Username"
                      />
                    </div>

                    <div className="relative w-full mb-3">
                      <label className="block uppercase text-blueGray-600 text-xs font-bold mb-2">
                        Password
                      </label>
                      <input
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        className="border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
                        placeholder="Password"
                      />
                    </div>

                    <div className="text-center mt-6">
                      <button
                        className="bg-blueGray-800 text-white active:bg-blueGray-600 text-sm font-bold uppercase px-6 py-3 rounded shadow hover:shadow-lg outline-none focus:outline-none mr-1 mb-1 w-full ease-linear transition-all duration-150"
                        type="button"
                        onClick={handleLogin}
                      >
                        Sign In
                      </button>
                    </div>
                  </form>
                </div>
              </div>

              {/* Footer */}
              <div className="flex flex-wrap mt-6 relative">
                <div className="w-1/2"></div>
                <div className="w-1/2 text-right">
                  <Link to="/auth/register" className="text-blueGray-200">
                    <small>Create new account</small>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
