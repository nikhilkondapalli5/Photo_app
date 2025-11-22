import React from 'react';
import { AppBar, Toolbar, Typography, FormControlLabel, Switch, Button } from '@mui/material';
import { useLocation, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from "axios";
import useStore from '../../lib/store';
import { fetchUser, logout } from '../../lib/api';
import './styles.css';

function TopBar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { advancedFeaturesEnabled, toggleAdvancedFeatures, currentUser, clearCurrentUser } = useStore();
  const queryClient = useQueryClient();

  const path = location.pathname;
  const userMatch = path.match(/\/users\/([^/]+)/);
  const photoMatch = path.match(/\/photos\/([^/]+)/);
  const userId = userMatch ? userMatch[1] : (photoMatch ? photoMatch[1] : null);

  const { data: user } = useQuery({
    queryKey: ['user', userId],
    queryFn: () => fetchUser(userId),
    enabled: !!userId && !!currentUser,
  });

  const logoutMutation = useMutation({
    mutationFn: logout,
    onSuccess: () => {
      clearCurrentUser();
      navigate('/login-register');
    },
  });

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  let contextText = '';
  if (userId && user) {
    const userName = `${user.first_name} ${user.last_name}`;
    if (userMatch) {
      contextText = userName;
    } else if (photoMatch) {
      contextText = `Photos of ${userName}`;
    }
  } else if (userId) {
    // Fallback while loading or error
    contextText = userMatch ? 'User Details' : 'User Photos';
  }

  const handleUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("uploadedphoto", file);

    try {
      await axios.post("http://localhost:3001/photos/new", formData, {
        withCredentials: true,
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      alert("Photo uploaded!");

      // Refresh photos using react-query
      queryClient.invalidateQueries(["photos", currentUser._id]);

    } catch (err) {
      alert("Upload failed");
      console.error(err);
    }
  };

  return (
    <AppBar className="topbar-appBar" position="absolute">
      <Toolbar style={{ justifyContent: 'space-between' }}>
        <Typography variant="h5" color="inherit">
          Nikhil Sesha Sai Kondapalli & Nrityya Sivakumar Annu
        </Typography>

        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>

          {currentUser ? (
            <>
              {/* Always visible when logged in */}
              <Typography variant="body1" color="inherit">
                Hi {currentUser.first_name}
              </Typography>

              <Button
                variant="contained"
                color="secondary"
                onClick={handleLogout}
                disabled={logoutMutation.isPending}
              >
                Logout
              </Button>

              {/* Add Photo only when viewing your own page */}
              {currentUser._id === userId && (
                <Button variant="contained" color="secondary" component="label">
                  Add Photo
                  <input
                    type="file"
                    hidden
                    accept="image/*"
                    onChange={(e) => handleUpload(e)}
                  />
                </Button>
              )}
            </>
          ) : (
            <Typography variant="body1" color="inherit">
              Please Login
            </Typography>
          )}

          <FormControlLabel
            control={(
              <Switch
                checked={advancedFeaturesEnabled}
                onChange={toggleAdvancedFeatures}
                color="default"
              />
            )}
            label="Enable Advanced Features"
          />

          <Typography variant="h6" color="inherit">
            {contextText}
          </Typography>
        </div>
      </Toolbar>
    </AppBar>
  );



}

export default TopBar;