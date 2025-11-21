import React from 'react';
import PropTypes from 'prop-types';
import { Typography, Button, Card, CardContent } from '@mui/material';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { fetchUser } from '../../lib/api';
import './styles.css';

// Component to display user details
function UserDetail({ userId }) {
  const { data: user, isLoading, isError, error } = useQuery({
    queryKey: ['user', userId],
    queryFn: () => fetchUser(userId),
    enabled: !!userId,
  });

  if (isLoading) {
    return <Typography variant="body1">Loading user details...</Typography>;
  }

  if (isError) {
    return <Typography variant="body1" color="error">{error.message || 'Failed to load user details'}</Typography>;
  }

  if (!user) {
    return <Typography variant="body1">User not found.</Typography>;
  }
  // Render user details
  return (
    <Card style={{ maxWidth: '800px', margin: '20px auto' }}>
      <CardContent>
        <Typography variant="h4" gutterBottom>
          {user.first_name} {user.last_name}
        </Typography>

        <Typography variant="body1" gutterBottom style={{ marginTop: '15px' }}>
          <strong>Location:</strong> {user.location}
        </Typography>

        <Typography variant="body1" gutterBottom>
          <strong>Occupation:</strong> {user.occupation}
        </Typography>

        <Typography variant="body1" gutterBottom>
          <strong>Description:</strong> {user.description}
        </Typography>

        <Button
          variant="contained"
          color="primary"
          component={Link}
          to={`/photos/${userId}`}
          style={{ marginTop: '20px' }}
        >
          View Photos
        </Button>
      </CardContent>
    </Card>
  );
}

UserDetail.propTypes = {
  userId: PropTypes.string.isRequired,
};

export default UserDetail;