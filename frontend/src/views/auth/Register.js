import React, { useState } from "react";
import { useHistory } from "react-router-dom";
import axios from "axios";

export default function Register() {
  const history = useHistory();

  const [form, setForm] = useState({
    name: "",
    surname: "",
    personalNumber: "",
    username: "",
    email: "",
    password: "",
    role: "Worker", 
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleRegister = async () => {
    try {
      await axios.post("https://localhost:7109/api/Auth/register", form);
      history.push("/login");
    } catch (err) {
      console.error("Registration failed", err);
      alert("Something went wrong during registration.");
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
                  <h6 className="text-blueGray-500 text-sm font-bold">Sign up with</h6>
                </div>
                <div className="btn-wrapper text-center">
                  <button className="bg-white ...">{/* GitHub */}</button>
                  <button className="bg-white ...">{/* Google */}</button>
                </div>
                <hr className="mt-6 border-b-1 border-blueGray-300" />
              </div>
              <div className="flex-auto px-4 lg:px-10 py-10 pt-0">
                <div className="text-blueGray-400 text-center mb-3 font-bold">
                  <small>Or sign up with credentials</small>
                </div>
                <form onSubmit={(e) => e.preventDefault()}>
                  <div className="relative w-full mb-3">
                    <label className="block uppercase ...">Name</label>
                    <input name="name" type="text" value={form.name} onChange={handleChange} className="..." placeholder="Name" required />
                  </div>

                  <div className="relative w-full mb-3">
                    <label className="block uppercase ...">Surname</label>
                    <input name="surname" type="text" value={form.surname} onChange={handleChange} className="..." placeholder="Surname" required />
                  </div>

                  <div className="relative w-full mb-3">
                    <label className="block uppercase ...">Personal Number</label>
                    <input name="personalNumber" type="text" value={form.personalNumber} onChange={handleChange} className="..." placeholder="Personal Number" required />
                  </div>

                  <div className="relative w-full mb-3">
                    <label className="block uppercase ...">Username</label>
                    <input name="username" type="text" value={form.username} onChange={handleChange} className="..." placeholder="Username" required />
                  </div>

                  <div className="relative w-full mb-3">
                    <label className="block uppercase ...">Email</label>
                    <input name="email" type="email" value={form.email} onChange={handleChange} className="..." placeholder="Email" required />
                  </div>

                  <div className="relative w-full mb-3">
                    <label className="block uppercase ...">Password</label>
                    <input name="password" type="password" value={form.password} onChange={handleChange} className="..." placeholder="Password" required />
                  </div>

                  <div className="relative w-full mb-3">
                    <label className="block uppercase ...">Role</label>
                    <select name="role" value={form.role} onChange={handleChange} className="..." required>
                      <option value="Worker">Worker</option>
                      <option value="Client">Client</option>
                      <option value="Admin">Admin</option>
                    </select>
                  </div>

                  <div>
                    <label className="inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="form-checkbox ..." />
                      <span className="ml-2 text-sm font-semibold text-blueGray-600">
                        I agree with the{" "}
                        <a href="#" className="text-lightBlue-500">Privacy Policy</a>
                      </span>
                    </label>
                  </div>

                  <div className="text-center mt-6">
                    <button onClick={handleRegister} className="bg-blueGray-800 text-white ..." type="button">
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
