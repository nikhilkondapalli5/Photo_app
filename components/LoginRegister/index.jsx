import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import {
  TextField,
  Button,
  Typography,
  Card,
  CardContent,
  Alert,
  Divider,
} from "@mui/material";
import axios from "axios";
import useStore from "../../lib/store";

function LoginRegister() {
  const [loginName, setLoginName] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  // Registration states
  const [reg, setReg] = useState({
    login_name: "",
    password: "",
    confirmPassword: "",
    first_name: "",
    last_name: "",
    location: "",
    description: "",
    occupation: "",
  });

  const navigate = useNavigate();
  const setCurrentUser = useStore((s) => s.setCurrentUser);

  // Login Mutation
  const loginMutation = useMutation({
    mutationFn: async ({ login_name, password }) => axios.post("http://localhost:3001/admin/login", {
      login_name,
      password,
    }),
    onSuccess: (res) => {
      setCurrentUser(res.data);
      navigate(`/users/${res.data._id}`);
    },
  });

  const handleLogin = (e) => {
    e.preventDefault();
    loginMutation.mutate({
      login_name: loginName,
      password: loginPassword,
    });
  };

  // Registration Mutation
  const registerMutation = useMutation({
    mutationFn: (body) => axios.post("http://localhost:3001/user", body),
    onSuccess: () => {
      alert("Registration successful!");
      setReg({
        login_name: "",
        password: "",
        confirmPassword: "",
        first_name: "",
        last_name: "",
        location: "",
        description: "",
        occupation: "",
      });
    },
  });

  const handleRegister = (e) => {
    e.preventDefault();

    if (reg.password !== reg.confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    registerMutation.mutate({
      login_name: reg.login_name,
      password: reg.password,
      first_name: reg.first_name,
      last_name: reg.last_name,
      location: reg.location,
      description: reg.description,
      occupation: reg.occupation,
    });
  };

  return (
    <div className="login-register-container">
      <Card style={{ maxWidth: "650px", margin: "40px auto", padding: 20 }}>
        <CardContent>

          {/* LOGIN SECTION */}
          <Typography variant="h4" gutterBottom>Login</Typography>

          {loginMutation.isError && (
            <Alert severity="error">
              {loginMutation.error?.response?.data || "Login failed"}
            </Alert>
          )}

          <form onSubmit={handleLogin}>
            <TextField
              fullWidth label="Login Name" margin="normal"
              value={loginName}
              onChange={(e) => setLoginName(e.target.value)}
            />
            <TextField
              fullWidth label="Password" type="password" margin="normal"
              value={loginPassword}
              onChange={(e) => setLoginPassword(e.target.value)}
            />

            <Button fullWidth type="submit" variant="contained" sx={{ mt: 2 }}>
              Login
            </Button>
          </form>

          <Divider sx={{ my: 4 }} />

          {/* REGISTRATION SECTION */}
          <Typography variant="h4" gutterBottom>
            Register New User
          </Typography>

          {registerMutation.isError && (
            <Alert severity="error">
              {registerMutation.error?.response?.data || "Registration failed"}
            </Alert>
          )}

          <form onSubmit={handleRegister}>
            <TextField
              fullWidth label="Login Name" margin="dense"
              value={reg.login_name}
              onChange={(e) => setReg({ ...reg, login_name: e.target.value })}
            />

            <TextField
              fullWidth label="Password" type="password" margin="dense"
              value={reg.password}
              onChange={(e) => setReg({ ...reg, password: e.target.value })}
            />

            <TextField
              fullWidth label="Confirm Password" type="password" margin="dense"
              value={reg.confirmPassword}
              onChange={(e) => setReg({ ...reg, confirmPassword: e.target.value })}
            />

            <TextField
              fullWidth label="First Name" margin="dense"
              value={reg.first_name}
              onChange={(e) => setReg({ ...reg, first_name: e.target.value })}
            />

            <TextField
              fullWidth label="Last Name" margin="dense"
              value={reg.last_name}
              onChange={(e) => setReg({ ...reg, last_name: e.target.value })}
            />

            <TextField
              fullWidth label="Location" margin="dense"
              value={reg.location}
              onChange={(e) => setReg({ ...reg, location: e.target.value })}
            />

            <TextField
              fullWidth label="Description" margin="dense"
              value={reg.description}
              onChange={(e) => setReg({ ...reg, description: e.target.value })}
            />

            <TextField
              fullWidth label="Occupation" margin="dense"
              value={reg.occupation}
              onChange={(e) => setReg({ ...reg, occupation: e.target.value })}
            />

            <Button
              fullWidth type="submit" variant="contained"
              sx={{ mt: 2 }} color="secondary"
            >
              Register Me
            </Button>
          </form>

        </CardContent>
      </Card>
    </div>
  );
}

export default LoginRegister;
