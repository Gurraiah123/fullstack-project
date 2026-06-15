import { useState } from "react";
import "./App.css";

function App() {
  const [user, setUser] = useState({
    id: "",
    name: "",
    email: "",
    role: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUser({
      ...user,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch("http://44.203.23.148:8000/api/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: Number(user.id),
          name: user.name,
          email: user.email,
          role: user.role,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        alert("User inserted successfully");
        console.log(data);

        setUser({
          id: "",
          name: "",
          email: "",
          role: "",
        });
      } else {
        alert("Failed to insert user");
      }
    } catch (error) {
      console.error(error);
      alert("Server connection failed");
    }
  };

  return (
    <div className="main-container">
      <div className="overlay"></div>

      <div className="hero-section">
        <div className="hero-content">
          <h1>User Management</h1>

          <form
            onSubmit={handleSubmit}
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "15px",
              width: "400px",
              margin: "auto",
            }}
          >
            <input
              type="number"
              name="id"
              placeholder="User ID"
              value={user.id}
              onChange={handleChange}
            />

            <input
              type="text"
              name="name"
              placeholder="Name"
              value={user.name}
              onChange={handleChange}
            />

            <input
              type="email"
              name="email"
              placeholder="Email"
              value={user.email}
              onChange={handleChange}
            />

            <input
              type="text"
              name="role"
              placeholder="Role"
              value={user.role}
              onChange={handleChange}
            />

            <button type="submit">Save User</button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default App;
