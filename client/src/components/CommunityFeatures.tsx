import React, { useState, useEffect } from 'react';
import { Container, Box, Typography, Grid, Card, CardContent, CardMedia, Chip, Button, TextField, Dialog, DialogTitle, DialogContent, DialogActions, Avatar, List, ListItem, ListItemAvatar, ListItemText, Divider, IconButton, Rating, Alert } from '@mui/material';
import { useI18n } from '../hooks/useI18n';
import { useAuth } from '../hooks/useAuth';
import { useApi } from '../hooks/useApi';
import { Add as AddIcon, Star as StarIcon, LocationOn as LocationIcon, People as PeopleIcon, Share as ShareIcon, Comment as CommentIcon } from '@mui/icons-material';

interface SuccessStory {
  id: string;
  title: string;
  description: string;
  author: string;
  location: string;
  scheme: string;
  date: string;
  rating: number;
  imageUrl?: string;
  likes: number;
  comments: number;
}

interface HelpCenter {
  id: string;
  name: string;
  address: string;
  phone: string;
  email: string;
  services: string[];
  distance: string;
  rating: number;
}

interface ForumPost {
  id: string;
  title: string;
  author: string;
  content: string;
  date: string;
  likes: number;
  replies: number;
  category: string;
}

export const CommunityFeatures: React.FC = () => {
  const { t, currentLanguage } = useI18n();
  const { user } = useAuth();
  const { api } = useApi();
  
  const [activeTab, setActiveTab] = useState<'stories' | 'help' | 'forum'>('stories');
  const [successStories, setSuccessStories] = useState<SuccessStory[]>([]);
  const [helpCenters, setHelpCenters] = useState<HelpCenter[]>([]);
  const [forumPosts, setForumPosts] = useState<ForumPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Dialog states
  const [storyDialogOpen, setStoryDialogOpen] = useState(false);
  const [newStory, setNewStory] = useState({
    title: '',
    description: '',
    scheme: '',
    location: ''
  });
  const [commentDialogOpen, setCommentDialogOpen] = useState(false);
  const [selectedStory, setSelectedStory] = useState<SuccessStory | null>(null);
  const [newComment, setNewComment] = useState('');

  useEffect(() => {
    fetchCommunityData();
  }, []);

  const fetchCommunityData = async () => {
    try {
      setLoading(true);
      
      // Mock data for demonstration
      const mockStories: SuccessStory[] = [
        {
          id: '1',
          title: t('community.stories.story1.title', 'How PMAY Changed My Life'),
          description: t('community.stories.story1.description', 'I was living in a small rented house with my family of 5. Thanks to Pradhan Mantri Awas Yojana, I now have my own home with all basic amenities.'),
          author: 'Ramesh Kumar',
          location: 'Lucknow, Uttar Pradesh',
          scheme: 'PMAY',
          date: '2024-03-15',
          rating: 4.8,
          imageUrl: '/images/story1.jpg',
          likes: 156,
          comments: 23
        },
        {
          id: '2',
          title: t('community.stories.story2.title', 'Education Dreams Fulfilled'),
          description: t('community.stories.story2.description', 'My daughter\'s education was at risk due to financial constraints. The scholarship scheme helped her complete her engineering degree.'),
          author: 'Sunita Devi',
          location: 'Patna, Bihar',
          scheme: 'Scholarship Scheme',
          date: '2024-02-20',
          rating: 4.9,
          imageUrl: '/images/story2.jpg',
          likes: 234,
          comments: 45
        },
        {
          id: '3',
          title: t('community.stories.story3.title', 'Small Business Success'),
          description: t('community.stories.story3.description', 'With the help of MUDRA loan, I started my tailoring business. Now I employ 5 people and have expanded to 3 locations.'),
          author: 'Amit Sharma',
          location: 'Jaipur, Rajasthan',
          scheme: 'MUDRA Loan',
          date: '2024-01-10',
          rating: 4.7,
          imageUrl: '/images/story3.jpg',
          likes: 189,
          comments: 31
        }
      ];

      const mockHelpCenters: HelpCenter[] = [
        {
          id: '1',
          name: t('community.helpCenters.center1.name', 'Government Scheme Help Center'),
          address: '123 Scheme Road, Sector 15, Noida',
          phone: '+91-120-1234567',
          email: 'help@noida.gov.in',
          services: ['Scheme Registration', 'Application Assistance', 'Document Verification', 'Status Tracking'],
          distance: '2.5 km',
          rating: 4.3
        },
        {
          id: '2',
          name: t('community.helpCenters.center2.name', 'Citizen Service Center'),
          address: '456 Citizen Avenue, Connaught Place, New Delhi',
          phone: '+91-11-7654321',
          email: 'support@delhi.gov.in',
          services: ['Online Registration', 'Grievance Redressal', 'Scheme Information', 'Application Status'],
          distance: '5.2 km',
          rating: 4.1
        },
        {
          id: '3',
          name: t('community.helpCenters.center3.name', 'Rural Development Office'),
          address: '789 Village Road, Main Market, Mathura',
          phone: '+91-565-9876543',
          email: 'rural@mathura.gov.in',
          services: ['Rural Schemes', 'Agriculture Support', 'Skill Development', 'Financial Assistance'],
          distance: '15.8 km',
          rating: 4.5
        }
      ];

      const mockForumPosts: ForumPost[] = [
        {
          id: '1',
          title: t('community.forum.post1.title', 'How to apply for PMAY online?'),
          author: 'NewUser123',
          content: t('community.forum.post1.content', 'I want to apply for Pradhan Mantri Awas Yojana but I am confused about the online process. Can someone guide me step by step?'),
          date: '2024-03-20',
          likes: 45,
          replies: 12,
          category: 'Housing'
        },
        {
          id: '2',
          title: t('community.forum.post2.title', 'Documents required for scholarship'),
          author: 'Student2024',
          content: t('community.forum.post2.content', 'What documents are needed for the education scholarship scheme? I have my marksheet and income certificate. Is anything else required?'),
          date: '2024-03-18',
          likes: 32,
          replies: 8,
          category: 'Education'
        },
        {
          id: '3',
          title: t('community.forum.post3.title', 'MUDRA loan approval time'),
          author: 'SmallBizOwner',
          content: t('community.forum.post3.content', 'I applied for MUDRA loan last month. How much time does it usually take for approval? Any updates on my application status?'),
          date: '2024-03-15',
          likes: 28,
          replies: 15,
          category: 'Business'
        }
      ];

      setSuccessStories(mockStories);
      setHelpCenters(mockHelpCenters);
      setForumPosts(mockForumPosts);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load community data');
    } finally {
      setLoading(false);
    }
  };

  const handleShareStory = () => {
    // Implementation for sharing story
    console.log('Sharing story:', newStory);
  };

  const handleLikeStory = (storyId: string) => {
    setSuccessStories(prev => prev.map(story => 
      story.id === storyId 
        ? { ...story, likes: story.likes + 1 }
        : story
    ));
  };

  const handleCommentStory = (story: SuccessStory) => {
    setSelectedStory(story);
    setCommentDialogOpen(true);
  };

  const handleSubmitComment = () => {
    if (newComment.trim()) {
      // Implementation for submitting comment
      console.log('Comment submitted:', newComment);
      setNewComment('');
      setCommentDialogOpen(false);
    }
  };

  const handleSubmitStory = () => {
    if (newStory.title && newStory.description && newStory.scheme) {
      const story: SuccessStory = {
        id: Date.now().toString(),
        ...newStory,
        author: user?.firstName || 'Anonymous',
        location: user?.city || 'Unknown',
        date: new Date().toISOString().split('T')[0],
        rating: 0,
        likes: 0,
        comments: 0
      };
      
      setSuccessStories(prev => [story, ...prev]);
      setNewStory({ title: '', description: '', scheme: '', location: '' });
      setStoryDialogOpen(false);
    }
  };

  const renderSuccessStories = () => (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5" fontWeight="600">
          {t('community.successStories', 'Success Stories')}
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setStoryDialogOpen(true)}
        >
          {t('community.shareStory', 'Share Your Story')}
        </Button>
      </Box>

      {successStories.map((story) => (
        <Card key={story.id} sx={{ mb: 3, boxShadow: 2 }}>
          <CardContent>
            <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
              <Box>
                <Typography variant="h6" fontWeight="600" gutterBottom>
                  {story.title}
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  {story.description}
                </Typography>
                <Box display="flex" gap={2} alignItems="center" mb={2}>
                  <Chip label={story.scheme} size="small" color="primary" variant="outlined" />
                  <Box display="flex" alignItems="center" gap={1}>
                    <LocationIcon fontSize="small" color="action" />
                    <Typography variant="caption" color="text.secondary">
                      {story.location}
                    </Typography>
                  </Box>
                  <Box display="flex" alignItems="center" gap={1}>
                    <PeopleIcon fontSize="small" color="action" />
                    <Typography variant="caption" color="text.secondary">
                      {story.author}
                    </Typography>
                  </Box>
                </Box>
              </Box>
              {story.imageUrl && (
                <CardMedia
                  component="img"
                  sx={{ width: 120, height: 80, borderRadius: '8px', objectFit: 'cover' }}
                  image={story.imageUrl}
                  alt={story.title}
                />
              )}
            </Box>
            
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Box display="flex" alignItems="center" gap={2}>
                <Rating value={story.rating} precision={0.1} readOnly size="small" />
                <Typography variant="caption" color="text.secondary">
                  {story.rating}/5
                </Typography>
              </Box>
              <Box display="flex" gap={1}>
                <Button
                  size="small"
                  startIcon={<CommentIcon />}
                  onClick={() => handleCommentStory(story)}
                >
                  {story.comments} {t('community.comments', 'Comments')}
                </Button>
                <Button
                  size="small"
                  startIcon={<ShareIcon />}
                  onClick={() => handleShareStory()}
                >
                  {t('community.share', 'Share')}
                </Button>
                <IconButton size="small" onClick={() => handleLikeStory(story.id)}>
                  <StarIcon color="primary" />
                </IconButton>
                <Typography variant="caption" color="text.secondary">
                  {story.likes}
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      ))}
    </Box>
  );

  const renderHelpCenters = () => (
    <Box>
      <Typography variant="h5" fontWeight="600" gutterBottom>
        {t('community.helpCenters', 'Nearby Help Centers')}
      </Typography>
      
      <Grid container spacing={3}>
        {helpCenters.map((center) => (
          <Grid item xs={12} md={6} key={center.id}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                  <Box>
                    <Typography variant="h6" fontWeight="600">
                      {center.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      {center.address}
                    </Typography>
                  </Box>
                  <Rating value={center.rating} precision={0.1} readOnly />
                </Box>
                
                <Box display="flex" gap={2} alignItems="center" mb={2}>
                  <Box display="flex" alignItems="center" gap={1}>
                    <LocationIcon fontSize="small" color="action" />
                    <Typography variant="caption" color="text.secondary">
                      {center.distance} away
                    </Typography>
                  </Box>
                  <Box display="flex" alignItems="center" gap={1}>
                    <PeopleIcon fontSize="small" color="action" />
                    <Typography variant="caption" color="text.secondary">
                      {t('community.openHours', 'Open Hours: 10 AM - 6 PM')}
                    </Typography>
                  </Box>
                </Box>

                <Box mb={2}>
                  <Typography variant="subtitle2" gutterBottom>
                    {t('community.services', 'Services Offered:')}
                  </Typography>
                  <Box display="flex" flexWrap="wrap" gap={1}>
                    {center.services.map((service, index) => (
                      <Chip key={index} label={service} size="small" variant="outlined" />
                    ))}
                  </Box>
                </Box>

                <Box display="flex" gap={2}>
                  <Button
                    variant="outlined"
                    startIcon={<LocationIcon />}
                    href={`https://maps.google.com/?q=${center.address}`}
                    target="_blank"
                  >
                    {t('community.getDirections', 'Get Directions')}
                  </Button>
                  <Button
                    variant="contained"
                    startIcon={<PeopleIcon />}
                    href={`tel:${center.phone}`}
                  >
                    {t('community.callNow', 'Call Now')}
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );

  const renderForum = () => (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5" fontWeight="600">
          {t('community.forum', 'Community Forum')}
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setStoryDialogOpen(true)}
        >
          {t('community.askQuestion', 'Ask Question')}
        </Button>
      </Box>

      <List>
        {forumPosts.map((post) => (
          <React.Fragment key={post.id}>
            <ListItem alignItems="flex-start" sx={{ borderBottom: '1px solid', borderColor: 'divider' }}>
              <ListItemAvatar>
                <Avatar>
                  {post.author.charAt(0)}
                </Avatar>
              </ListItemAvatar>
              <ListItemText
                primary={
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Typography variant="h6" fontWeight="600">
                      {post.title}
                    </Typography>
                    <Chip label={post.category} size="small" color="primary" variant="outlined" />
                  </Box>
                }
                secondary={
                  <Box>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      {post.content}
                    </Typography>
                    <Box display="flex" justifyContent="space-between" alignItems="center" mt={2}>
                      <Box display="flex" gap={2} alignItems="center">
                        <Typography variant="caption" color="text.secondary">
                          {post.author} • {post.date}
                        </Typography>
                      </Box>
                      <Box display="flex" gap={1}>
                        <Button size="small" startIcon={<CommentIcon />}>
                          {post.replies} {t('community.replies', 'Replies')}
                        </Button>
                        <Button size="small" startIcon={<ShareIcon />}>
                          {t('community.share', 'Share')}
                        </Button>
                      </Box>
                    </Box>
                  </Box>
                }
              />
            </ListItem>
          </React.Fragment>
        ))}
      </List>
    </Box>
  );

  return (
    <Container maxWidth="lg">
      <Box py={4}>
        <Typography variant="h4" gutterBottom>
          {t('community.title', 'Community & Support')}
        </Typography>
        
        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        <Grid container spacing={4}>
          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {t('community.explore', 'Explore')}
                </Typography>
                <Box display="flex" flexDirection="column" gap={1}>
                  <Button
                    fullWidth
                    variant={activeTab === 'stories' ? 'contained' : 'outlined'}
                    onClick={() => setActiveTab('stories')}
                  >
                    {t('community.successStories', 'Success Stories')}
                  </Button>
                  <Button
                    fullWidth
                    variant={activeTab === 'help' ? 'contained' : 'outlined'}
                    onClick={() => setActiveTab('help')}
                  >
                    {t('community.helpCenters', 'Help Centers')}
                  </Button>
                  <Button
                    fullWidth
                    variant={activeTab === 'forum' ? 'contained' : 'outlined'}
                    onClick={() => setActiveTab('forum')}
                  >
                    {t('community.forum', 'Community Forum')}
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={9}>
            <Card>
              <CardContent>
                {activeTab === 'stories' && renderSuccessStories()}
                {activeTab === 'help' && renderHelpCenters()}
                {activeTab === 'forum' && renderForum()}
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Share Story Dialog */}
        <Dialog open={storyDialogOpen} onClose={() => setStoryDialogOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle>{t('community.shareYourStory', 'Share Your Success Story')}</DialogTitle>
          <DialogContent>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label={t('community.storyTitle', 'Story Title')}
                  value={newStory.title}
                  onChange={(e) => setNewStory(prev => ({ ...prev, title: e.target.value }))}
                  margin="normal"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label={t('community.storyDescription', 'Your Story')}
                  multiline
                  rows={4}
                  value={newStory.description}
                  onChange={(e) => setNewStory(prev => ({ ...prev, description: e.target.value }))}
                  margin="normal"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label={t('community.schemeName', 'Scheme Name')}
                  value={newStory.scheme}
                  onChange={(e) => setNewStory(prev => ({ ...prev, scheme: e.target.value }))}
                  margin="normal"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label={t('community.location', 'Location')}
                  value={newStory.location}
                  onChange={(e) => setNewStory(prev => ({ ...prev, location: e.target.value }))}
                  margin="normal"
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setStoryDialogOpen(false)}>{t('common.cancel', 'Cancel')}</Button>
            <Button onClick={handleSubmitStory} variant="contained">{t('common.submit', 'Submit')}</Button>
          </DialogActions>
        </Dialog>

        {/* Comment Dialog */}
        <Dialog open={commentDialogOpen} onClose={() => setCommentDialogOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle>{t('community.addComment', 'Add Comment')}</DialogTitle>
          <DialogContent>
            {selectedStory && (
              <Box mb={2}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  {t('community.commentingOn', 'Commenting on')}: {selectedStory.title}
                </Typography>
              </Box>
            )}
            <TextField
              fullWidth
              label={t('community.yourComment', 'Your Comment')}
              multiline
              rows={3}
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setCommentDialogOpen(false)}>{t('common.cancel', 'Cancel')}</Button>
            <Button onClick={handleSubmitComment} variant="contained">{t('common.submit', 'Submit')}</Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Container>
  );
};