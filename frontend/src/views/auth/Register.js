import React, { useState } from "react";
import api from "utils/axiosInstance";
import SkillHireLogo from "assets/img/skillhire-logo2.png"; 

export default function Register() {
  const [formData, setFormData] = useState({
    name: "",
    surname: "",
    personalNumber: "",
    username: "",
    email: "",
    password: "",
    role: "Client",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async () => {
  try {
    await api.post("/Auth/register", formData);

    const loginRes = await api.post("/Auth/login", {
      username: formData.username,
      password: formData.password,
    });

    localStorage.setItem("token", loginRes.data.token);
    localStorage.setItem("user", JSON.stringify(loginRes.data));

    alert("Registration + login successful!");

    const role = loginRes.data.role;
    if (role === "Admin") {
      window.location.href = "/admin";
    } else if (role === "Client") {
      window.location.href = "/client/HireWorker";
    } else if (role === "Worker") {
      window.location.href = "/worker/MyPhotos";
    } else {
      window.location.href = "/auth/login";
    }
  } catch (err) {
    alert("Registration or login failed: " + (err.response?.data || err.message));
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
          <div className="w-full lg:w-6/12 px-4">
            <div className="relative flex flex-col min-w-0 break-words w-full mb-6 shadow-lg rounded-lg bg-blueGray-200 border-0 mt-20">
              <div className="rounded-t mb-0 px-6 py-6">
                <div className="text-center mb-3">
                    {}
                    <img
                      src={SkillHireLogo}
                      alt="SkillHire"
                      className="h-25 mx-auto"
                    />

                  </div>
              </div>
              <div className="flex-auto px-4 lg:px-10 py-10 pt-0">
                <div className="text-blueGray-400 text-center mb-3 font-bold">
                  <small>Sign up with credentials</small>
                </div>
                <form>

                  {/* Name */}
                  <div className="relative w-full mb-3">
                    <label className="block uppercase text-blueGray-600 text-xs font-bold mb-2">Name</label>
                    <input
                      name="name"
                      onChange={handleChange}
                      type="text"
                      className="border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
                      placeholder="Name"
                    />
                  </div>

                  {/* Surname */}
                  <div className="relative w-full mb-3">
                    <label className="block uppercase text-blueGray-600 text-xs font-bold mb-2">Surname</label>
                    <input 
                      name="surname"
                      onChange={handleChange}
                      type="text"
                      className="border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
                      placeholder="Surname"
                    />
                  </div>

                  {/* Username */}
                  <div className="relative w-full mb-3">
                    <label className="block uppercase text-blueGray-600 text-xs font-bold mb-2">Username</label>
                    <input
                      name="username"
                      onChange={handleChange}
                      type="text"
                      className="border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
                      placeholder="Username"
                    />
                  </div>

                  {/* Personal Number */}
                  <div className="relative w-full mb-3">
                    <label className="block uppercase text-blueGray-600 text-xs font-bold mb-2">Personal Number</label>
                    <input
                      name="personalNumber"
                      onChange={handleChange}
                      type="text"
                      className="border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
                      placeholder="Personal Number"
                    />
                  </div>

                  {/* Email */}
                  <div className="relative w-full mb-3">
                    <label className="block uppercase text-blueGray-600 text-xs font-bold mb-2">Email</label>
                    <input
                      name="email"
                      onChange={handleChange}
                      type="email"
                      className="border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
                      placeholder="Email"
                    />
                  </div>

                  {/* Password */}
                  <div className="relative w-full mb-3">
                    <label className="block uppercase text-blueGray-600 text-xs font-bold mb-2">Password</label>
                    <input
                      name="password"
                      onChange={handleChange}
                      type="password"
                      className="border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
                      placeholder="Password"
                    />
                  </div>

                  {/* Role Selection */}
                  <div className="relative w-full mb-3">
                    <label className="block uppercase text-blueGray-600 text-xs font-bold mb-2">Role</label>
                    <select
                      name="role"
                      onChange={handleChange}
                      className="border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
                      value={formData.role}
                    >
                      <option value="Client">Client</option>
                      <option value="Worker">Worker</option>
                    </select>
                  </div>
                  {/* Submit Button */}
                  <div className="text-center mt-6">
                    <button
                      type="button"
                      onClick={handleRegister}
                      className="bg-blueGray-800 text-white active:bg-blueGray-600 text-sm font-bold uppercase px-6 py-3 rounded shadow hover:shadow-lg outline-none focus:outline-none mr-1 mb-1 w-full ease-linear transition-all duration-150"
                    >
                      Create Account
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
      </div>
    </>
  );
}
