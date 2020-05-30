import React from 'react';

import Container from '@material-ui/core/Container';
import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';

export default function() {
  return (
    <Container>
      <Box>this is the homepage and class list</Box>
      <Box>
        <Button variant="contained" color="primary">Test</Button>
      </Box>
    </Container>
  )
}