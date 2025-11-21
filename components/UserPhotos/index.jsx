import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import {
  Typography, Card, CardContent, CardMedia, Divider,
  Button, Box, TextField
} from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useStore } from '../../lib/store';
import { fetchUserPhotos, fetchUser, addComment } from '../../lib/api';
import './styles.css';

function UserPhotos({ userId, photoIndex }) {


  const [currentIndex, setCurrentIndex] = useState(0);
  const { advancedFeaturesEnabled } = useStore();
  const navigate = useNavigate();

  const [commentText, setCommentText] = useState({});
  const queryClient = useQueryClient();

  const commentMutation = useMutation({
    mutationFn: ({ photoId, text }) => addComment(photoId, text),
    onSuccess: () => {
      queryClient.invalidateQueries(['photos', userId]);
    },
  });

  const handleCommentSubmit = (photoId) => {
    const text = commentText[photoId]?.trim();
    if (!text) return;

    commentMutation.mutate({ photoId, text });

    setCommentText((prev) => ({
      ...prev,
      [photoId]: "",
    }));
  };
  

  const { data: photos = [], isLoading: isLoadingPhotos } = useQuery({
    queryKey: ['photos', userId],
    queryFn: () => fetchUserPhotos(userId),
    enabled: !!userId,
  });

  const { data: user, isLoading: isLoadingUser } = useQuery({
    queryKey: ['user', userId],
    queryFn: () => fetchUser(userId),
    enabled: !!userId,
  });

  const userName = user ? `${user.first_name} ${user.last_name}` : '';
  const loading = isLoadingPhotos || isLoadingUser;

  useEffect(() => {
    if (photos.length > 0 && photoIndex !== undefined) {
      const index = parseInt(photoIndex, 10);
      if (!Number.isNaN(index) && index >= 0 && index < photos.length) {
        setCurrentIndex(index);
      }
    }
  }, [photos, photoIndex]);

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

  const handlePrevious = () => {
    if (currentIndex > 0) {
      const newIndex = currentIndex - 1;
      setCurrentIndex(newIndex);
      navigate(`/photos/${userId}/${newIndex}`);
    }
  };

  const handleNext = () => {
    if (currentIndex < photos.length - 1) {
      const newIndex = currentIndex + 1;
      setCurrentIndex(newIndex);
      navigate(`/photos/${userId}/${newIndex}`);
    }
  };

  if (loading) {
    return <Typography variant="body1">Loading photos...</Typography>;
  }

  if (photos.length === 0) {
    return (
      <Typography variant="body1">
        No photos found for {userName || 'this user'}.
      </Typography>
    );
  }

  // Advanced Features: Single Photo with Stepper
  if (advancedFeaturesEnabled) {
    const photo = photos[currentIndex];

    return (
      <div>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h4">Photos of {userName}</Typography>
          <Typography>Photo {currentIndex + 1} of {photos.length}</Typography>
        </Box>

        <Card style={{ marginBottom: '30px' }}>
          <CardMedia
            component="img"
            image={`/images/${photo.file_name}`}
            alt="User photo"
          />

          <CardContent>
            <Typography color="textSecondary">{formatDateTime(photo.date_time)}</Typography>

            {/* Existing comments */}
            {photo.comments.length > 0 && (
              <div style={{ marginTop: '15px' }}>
                <Typography variant="h6">Comments:</Typography>

                {photo.comments.map((comment) => (
                  <div key={comment._id} style={{ marginBottom: '15px' }}>
                    <Divider style={{ marginBottom: '10px' }} />
                    <Typography variant="body2" color="textSecondary">
                      {formatDateTime(comment.date_time)} –{' '}
                      <Link to={`/users/${comment.user._id}`}>
                        {comment.user.first_name} {comment.user.last_name}
                      </Link>
                    </Typography>
                    <Typography style={{ marginTop: '5px' }}>{comment.comment}</Typography>
                  </div>
                ))}
              </div>
            )}

            {/* Add comment input */}
            <div style={{ marginTop: '20px' }}>
              <TextField
                fullWidth
                label="Add a comment"
                value={commentText[photo._id] || ""}
                onChange={(e) =>
                  setCommentText((prev) => ({ ...prev, [photo._id]: e.target.value }))
                }
              />
              <Button
                variant="contained"
                style={{ marginTop: '10px' }}
                onClick={() => handleCommentSubmit(photo._id)}
              >
                Post Comment
              </Button>
            </div>

          </CardContent>
        </Card>

        <Box display="flex" justifyContent="center" gap={2}>
          <Button disabled={currentIndex === 0} onClick={handlePrevious}>← Previous</Button>
          <Button disabled={currentIndex === photos.length - 1} onClick={handleNext}>Next →</Button>
        </Box>
      </div>
    );
  }

  // Original: All Photos View
  return (
    <div>
      <Typography variant="h4" gutterBottom>
        Photos of {userName}
      </Typography>

      {photos.map((photo) => (
        <Card key={photo._id} style={{ marginBottom: '30px' }}>
          <CardMedia component="img" image={`/images/${photo.file_name}`} />

          <CardContent>
            <Typography color="textSecondary">
              {formatDateTime(photo.date_time)}
            </Typography>

            {photo.comments.length > 0 && (
              <div style={{ marginTop: '15px' }}>
                <Typography variant="h6">Comments:</Typography>

                {photo.comments.map((comment) => (
                  <div key={comment._id} style={{ marginBottom: '15px' }}>
                    <Divider style={{ marginBottom: '10px' }} />
                    <Typography variant="body2" color="textSecondary">
                      {formatDateTime(comment.date_time)} –{' '}
                      <Link to={`/users/${comment.user._id}`}>
                        {comment.user.first_name} {comment.user.last_name}
                      </Link>
                    </Typography>
                    <Typography style={{ marginTop: '5px' }}>
                      {comment.comment}
                    </Typography>
                  </div>
                ))}
              </div>
            )}

            {/* Add comment input for EACH photo */}
            <div style={{ marginTop: '20px' }}>
              <TextField
                fullWidth
                label="Add a comment"
                value={commentText[photo._id] || ""}
                onChange={(e) =>
                  setCommentText((prev) => ({ ...prev, [photo._id]: e.target.value }))
                }
              />
              <Button
                variant="contained"
                style={{ marginTop: '10px' }}
                onClick={() => handleCommentSubmit(photo._id)}
              >
                Post Comment
              </Button>
            </div>

          </CardContent>
        </Card>
      ))}
    </div>
  );
}


UserPhotos.propTypes = {
  userId: PropTypes.string.isRequired,
  photoIndex: PropTypes.string,
};

UserPhotos.defaultProps = {
  photoIndex: undefined,
};

export default UserPhotos;