import React from 'react';
import ReactDOM from 'react-dom/client';
import { Grid, Typography, Paper } from '@mui/material';
import {
  BrowserRouter, Route, Routes, useParams, Navigate,
} from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

import './styles/main.css';
// import './lib/mockSetup.js';
import TopBar from './components/TopBar';
import UserDetail from './components/UserDetail';
import UserList from './components/UserList';
import UserPhotos from './components/UserPhotos';
import UserComments from './components/UserComments';
import LoginRegister from './components/LoginRegister';
import useStore from './lib/store';
import { checkSession } from './lib/api';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
      refetchOnWindowFocus: false,
    },
  },
});

function UserCommentsRoute() {
  const { userId } = useParams();
  return <UserComments userId={userId} />;
}

function UserDetailRoute() {
  const { userId } = useParams();
  console.log('UserDetailRoute: userId is:', userId);
  return <UserDetail userId={userId} />;
}

function UserPhotosRoute() {
  const { userId, photoIndex } = useParams();
  return <UserPhotos userId={userId} photoIndex={photoIndex} />;
}

function ProtectedRoute({ children }) {
  const currentUser = useStore((state) => state.currentUser);
  return currentUser ? children : <Navigate to="/login-register" replace />;
}

function PhotoShare() {
  const currentUser = useStore((state) => state.currentUser);
  const setCurrentUser = useStore((state) => state.setCurrentUser);
  const [isCheckingSession, setIsCheckingSession] = React.useState(true);

  // Check session on mount to restore user after page refresh
  React.useEffect(() => {
    const restoreSession = async () => {
      try {
        const user = await checkSession();
        setCurrentUser(user);
      } catch (err) {
        // No active session, user stays logged out
        console.log('No active session');
      } finally {
        setIsCheckingSession(false);
      }
    };
    restoreSession();
  }, []); // Only run once on mount

  // Show loading state while checking session
  if (isCheckingSession) {
    return <div>Loading...</div>;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <div>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TopBar />
            </Grid>
            <div className="main-topbar-buffer" />
            {currentUser && (
              <Grid item sm={3}>
                <Paper className="main-grid-item">
                  <UserList />
                </Paper>
              </Grid>
            )}
            <Grid item sm={currentUser ? 9 : 12}>
              <Paper className="main-grid-item">
                <Routes>
                  <Route
                    path="/"
                    element={
                      currentUser ? (
                        <Typography variant="body1">
                          Welcome to the photosharing app! Select a user to view their details and photos.
                        </Typography>
                      ) : (
                        <Navigate to="/login-register" replace />
                      )
                    }
                  />
                  <Route path="/login-register" element={<LoginRegister />} />
                  <Route
                    path="/users/:userId"
                    element={(
                      <ProtectedRoute>
                        <UserDetailRoute />
                      </ProtectedRoute>
                    )}
                  />
                  <Route
                    path="/photos/:userId"
                    element={(
                      <ProtectedRoute>
                        <UserPhotosRoute />
                      </ProtectedRoute>
                    )}
                  />
                  <Route
                    path="/photos/:userId/:photoIndex"
                    element={(
                      <ProtectedRoute>
                        <UserPhotosRoute />
                      </ProtectedRoute>
                    )}
                  />
                  <Route
                    path="/comments/:userId"
                    element={(
                      <ProtectedRoute>
                        <UserCommentsRoute />
                      </ProtectedRoute>
                    )}
                  />
                  <Route
                    path="/users"
                    element={(
                      <ProtectedRoute>
                        <UserList />
                      </ProtectedRoute>
                    )}
                  />
                </Routes>
              </Paper>
            </Grid>
          </Grid>
        </div>
      </BrowserRouter>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}

const root = ReactDOM.createRoot(document.getElementById('photoshareapp'));
root.render(<PhotoShare />);