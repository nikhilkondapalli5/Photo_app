import React from 'react';
import PropTypes from 'prop-types';
import { Typography, Card, CardContent, CardMedia, Grid } from '@mui/material';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { fetchUserComments, fetchUser } from '../../lib/api';
import './styles.css';

function UserComments({ userId }) {
  const { data: comments = [], isLoading: isLoadingComments } = useQuery({
    queryKey: ['comments', userId],
    queryFn: () => fetchUserComments(userId),
    enabled: !!userId,
  });

  const { data: user, isLoading: isLoadingUser } = useQuery({
    queryKey: ['user', userId],
    queryFn: () => fetchUser(userId),
    enabled: !!userId,
  });

  const userName = user ? `${user.first_name} ${user.last_name}` : '';
  const loading = isLoadingComments || isLoadingUser;

  const formatDateTime = (dateTimeStr) => {
    const date = new Date(dateTimeStr);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return <Typography variant="body1">Loading comments...</Typography>;
  }

  if (comments.length === 0) {
    return (
      <Typography variant="body1">
        No comments found for {userName || 'this user'}.
      </Typography>
    );
  }

  return (
    <div>
      <Typography variant="h4" gutterBottom>
        Comments by {userName}
      </Typography>
      <Grid container spacing={2}>
        {comments.map((comment) => (
          <Grid item xs={12} key={comment._id}>
            <Card
              component={Link}
              to={`/photos/${comment.photo.user_id}`}
              style={{
                textDecoration: 'none',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'row'
              }}
            >
              <CardMedia
                component="img"
                image={`/images/${comment.photo.file_name}`}
                alt="Photo thumbnail"
                style={{
                  width: 150,
                  height: 150,
                  objectFit: 'cover'
                }}
              />
              <CardContent style={{ flex: 1 }}>
                <Typography variant="body2" color="textSecondary" gutterBottom>
                  {formatDateTime(comment.date_time)}
                </Typography>
                <Typography variant="body1" style={{ marginTop: '10px' }}>
                  {comment.comment}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </div>
  );
}

UserComments.propTypes = {
  userId: PropTypes.string.isRequired,
};

export default UserComments;