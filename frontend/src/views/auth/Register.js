import React, { useState } from "react";
import axios from "axios";

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
    await axios.post("https://localhost:7109/api/Auth/register", formData);

    const loginRes = await axios.post("https://localhost:7109/api/Auth/login", {
      username: formData.username,
      password: formData.password,
    });

    localStorage.setItem("token", loginRes.data.token);
    localStorage.setItem("user", JSON.stringify(loginRes.data));

    alert("Registration + login successful!");

    const role = loginRes.data.role;
    if (role === "Admin") {
      window.location.href = "/admin/dashboard";
    } else if (role === "Client") {
      window.location.href = "/client/dashboard";
    } else if (role === "Worker") {
      window.location.href = "/worker/dashboard";
    } else {
      window.location.href = "/auth/login";
    }
  } catch (err) {
    alert("Registration or login failed: " + (err.response?.data || err.message));
  }
};

  return (
    <>
      <div className="container mx-auto px-4 h-full">
        <div className="flex content-center items-center justify-center h-full">
          <div className="w-full lg:w-6/12 px-4">
            <div className="relative flex flex-col min-w-0 break-words w-full mb-6 shadow-lg rounded-lg bg-blueGray-200 border-0">
              <div className="rounded-t mb-0 px-6 py-6">
                <div className="text-center mb-3">
                  <h6 className="text-blueGray-500 text-sm font-bold">
                    Sign up with
                  </h6>
                </div>
                <div className="btn-wrapper text-center">
                  <button className="bg-white ...">
                    <img alt="..." className="w-5 mr-1" src={require("assets/img/github.svg").default} />
                    Github
                  </button>
                  <button className="bg-white ...">
                    <img alt="..." className="w-5 mr-1" src={require("assets/img/google.svg").default} />
                    Google
                  </button>
                </div>
                <hr className="mt-6 border-b-1 border-blueGray-300" />
              </div>
              <div className="flex-auto px-4 lg:px-10 py-10 pt-0">
                <div className="text-blueGray-400 text-center mb-3 font-bold">
                  <small>Or sign up with credentials</small>
                </div>
                <form>

                  {/* Name */}
                  <div className="relative w-full mb-3">
                    <label className="block uppercase text-blueGray-600 text-xs font-bold mb-2">Name</label>
                    <input
                      name="name"
                      onChange={handleChange}
                      type="text"
                      className="border-0 px-3 py-3 ..."
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
                      className="border-0 px-3 py-3 ..."
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
                      className="border-0 px-3 py-3 ..."
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
                      className="border-0 px-3 py-3 ..."
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
                      className="border-0 px-3 py-3 ..."
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
                      className="border-0 px-3 py-3 ..."
                      placeholder="Password"
                    />
                  </div>

                  {/* Role Selection */}
                  <div className="relative w-full mb-3">
                    <label className="block uppercase text-blueGray-600 text-xs font-bold mb-2">Role</label>
                    <select
                      name="role"
                      onChange={handleChange}
                      className="border-0 px-3 py-3 text-sm rounded shadow focus:outline-none focus:ring w-full"
                      value={formData.role}
                    >
                      <option value="Client">Client</option>
                      <option value="Worker">Worker</option>
                    </select>
                  </div>

                  {/* Checkbox */}
                  <div>
                    <label className="inline-flex items-center cursor-pointer">
                      <input
                        id="customCheckLogin"
                        type="checkbox"
                        className="form-checkbox border-0 rounded text-blueGray-700 ml-1 w-5 h-5"
                      />
                      <span className="ml-2 text-sm font-semibold text-blueGray-600">
                        I agree with the{" "}
                        <a href="#pablo" className="text-lightBlue-500" onClick={(e) => e.preventDefault()}>
                          Privacy Policy
                        </a>
                      </span>
                    </label>
                  </div>

                  {/* Submit Button */}
                  <div className="text-center mt-6">
                    <button
                      type="button"
                      onClick={handleRegister}
                      className="bg-blueGray-800 text-white ..."
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
    </>
  );
}
