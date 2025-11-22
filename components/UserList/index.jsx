import React from 'react';
import { Divider, List, ListItem, ListItemText, Typography, Badge, Box } from '@mui/material';
import { Link } from 'react-router-dom';
import { useQuery, useQueries } from '@tanstack/react-query';
import useStore from '../../lib/store';
import { fetchUsers, fetchUserCommentCounts } from '../../lib/api';
import './styles.css';

function UserList() {
  const { advancedFeaturesEnabled, currentUser } = useStore();

  const { data: users = [], isLoading: isLoadingUsers, isError } = useQuery({
    queryKey: ['users'],
    queryFn: fetchUsers,
    enabled: !!currentUser, // Only fetch when logged in
  });

  // Fetch counts for each user if advanced features are enabled
  const userCountQueries = useQueries({
    queries: users.map((user) => ({
      queryKey: ['userCommentCounts', user._id],
      queryFn: () => fetchUserCommentCounts(user._id),
      enabled: advancedFeaturesEnabled,
    })),
  });

  // Create a map of user counts for easy lookup
  const userCounts = {};
  if (advancedFeaturesEnabled) {
    userCountQueries.forEach((query, index) => {
      if (query.data && users[index]) {
        userCounts[users[index]._id] = query.data;
      }
    });
  }

  if (isLoadingUsers) {
    return <Typography variant="body1">Loading users...</Typography>;
  }

  if (isError) {
    return <Typography variant="body1" color="error">Error loading users.</Typography>;
  }

  return (
    <div>
      <List component="nav">
        {users.map((user) => (
          <React.Fragment key={user._id}>
            <ListItem
              component={Link}
              to={`/users/${user._id}`}
              button
              style={{ textDecoration: 'none', color: 'inherit' }}
            >
              <ListItemText
                primary={`${user.first_name} ${user.last_name}`}
              />
              {advancedFeaturesEnabled && userCounts[user._id] && (
                <Box display="flex" gap={1}>
                  <Badge
                    badgeContent={userCounts[user._id].photoCount}
                    sx={{
                      '& .MuiBadge-badge': {
                        backgroundColor: '#4caf50',
                        color: 'white',
                      }
                    }}
                    max={999}
                  >
                    <Box
                      component="span"
                      sx={{
                        width: 20,
                        height: 20,
                        display: 'inline-block'
                      }}
                    />
                  </Badge>
                  <Link
                    to={`/comments/${user._id}`}
                    onClick={(e) => e.stopPropagation()}
                    style={{ textDecoration: 'none' }}
                  >
                    <Badge
                      badgeContent={userCounts[user._id].commentCount}
                      sx={{
                        '& .MuiBadge-badge': {
                          backgroundColor: '#f44336',
                          color: 'white',
                          cursor: 'pointer',
                          '&:hover': {
                            backgroundColor: '#d32f2f'
                          }
                        }
                      }}
                      max={999}
                    >
                      <Box
                        component="span"
                        sx={{
                          width: 20,
                          height: 20,
                          display: 'inline-block'
                        }}
                      />
                    </Badge>
                  </Link>
                </Box>
              )}
            </ListItem>
            <Divider />
          </React.Fragment>
        ))}
      </List>
    </div>
  );
}

export default UserList;