'use client';
import { useState } from 'react';
import { Box, Button, TextField, Stack, Typography } from '@mui/material';

export default function Home() {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: 'Welcome to Pantry Easy Customer Support! We\'re here to help you get the most out of your pantry management experience.'
    }
  ]);
  
  const [inputMessage, setInputMessage] = useState('');

  const handleSend = async () => {
    setInputMessage('');
    setMessages((messages)=>[...messages, { role: 'user', content: inputMessage }]);
    
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify([{ role: 'user', content: inputMessage }])
    })
   
    const data = await response.json();
    setMessages((messages)=>[...messages, { role: 'assistant', content: data.message }]);
  };

  return (
    <Box
      display="flex"
      flexDirection="column"
      justifyContent="flex-end"
      alignItems="center"
      height="100vh"
      width="100vw"
      bgcolor="gray.50"
      p={2}
    >
      <Box
        display="flex"
        flexDirection="column"
        justifyContent="space-between"
        alignItems="center"
        width="100%"
        maxWidth="600px"
        height="80%"
        border="1px solid gray"
        borderRadius={2}
        p={2}
        overflow="auto"
        bgcolor="white"
      >
        <Stack spacing={2} width="100%">
          {messages.map((message, index) => (
            <Box
              key={index}
              alignSelf={message.role === 'assistant' ? 'flex-start' : 'flex-end'}
              bgcolor={message.role === 'assistant' ? 'lightblue' : 'lightgreen'}
              p={2}
              borderRadius={2}
              boxShadow={2}
            >
              <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                {message.role[0].toUpperCase() + message.role.slice(1)}
              </Typography>
              <Typography variant="body1">{message.content}</Typography>
            </Box>
          ))}
        </Stack>
        <Stack direction="row" spacing={2} width="100%" mt={2}>
          <TextField
            label="Message"
            placeholder="Type your message here"
            fullWidth
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
          />
          <Button variant="contained" onClick={handleSend}>
            Send
          </Button>
        </Stack>
      </Box>
    </Box>
  );
}
