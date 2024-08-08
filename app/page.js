'use client';

import { useState, useEffect, useRef } from 'react';
import { Box, Button, TextField, Stack, Typography, IconButton } from '@mui/material';
import ChatOutlinedIcon from '@mui/icons-material/ChatOutlined';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';

export default function Home() {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: 'Welcome! How can I help you today ?',
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [isMinimized, setIsMinimized] = useState(true);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (isStreaming || !inputMessage.trim()) return;
    setIsStreaming(true);
    const userMessage = inputMessage;
    setInputMessage('');
    setMessages((prevMessages) => [...prevMessages, { role: 'user', content: userMessage }]);

    setMessages((prevMessages) => [...prevMessages, { role: 'assistant', content: '' }]);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify([{ role: 'user', content: userMessage }]),
      });

      const reader = response.body.getReader();
      let assistantMessageContent = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = new TextDecoder().decode(value, { stream: true });
        assistantMessageContent += chunk;

        setMessages((prevMessages) => {
          const newMessages = [...prevMessages];
          newMessages[newMessages.length - 1].content = assistantMessageContent;
          return newMessages;
        });
        scrollToBottom();
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsStreaming(false);
    }
  };

  const toggleMinimize = () => {
    setIsMinimized(prev => !prev);
  };

  return (
    <Box
      position="fixed"
      bottom={16}
      right={16}
      width={isMinimized ? '60px' : '500px'}
      height={isMinimized ? '60px' : '650px'}
      borderRadius={isMinimized ? '50%' : '16px'}
      boxShadow={3}
      overflow="hidden"
      bgcolor="#f0f0f0"
      color="black"
      zIndex={1000}
    >
      {isMinimized ? (
        <Box display="flex" justifyContent="center" alignItems="center" height="100%">
          <IconButton onClick={toggleMinimize} color="inherit">
            <ChatOutlinedIcon fontSize="large" />
          </IconButton>
        </Box>
      ) : (
        <Box display="flex" flexDirection="column" height="100%">
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            p={1}
            bgcolor="black"
            color="white"
            borderBottom="1px solid white"
          >
            <Typography variant="subtitle1">Customer Support</Typography>
            <IconButton onClick={toggleMinimize} color="inherit">
              <CloseRoundedIcon />
            </IconButton>
          </Box>
          <Box
            flexGrow={1}
            p={1}
            overflow="auto"
            bgcolor="#f0f0f0"
          >
            <Stack spacing={1}>
              {messages.map((message, index) => (
                <Box
                  key={index}
                  alignSelf={message.role === 'assistant' ? 'flex-start' : 'flex-end'}
                  bgcolor={message.role === 'assistant' ? '#f8f8f8' : '#f5f5f5'}
                  color={message.role === 'assistant' ? '#003f6e' : '#003f6e'}
                  p={2}
                  borderRadius={2}
                  boxShadow={1}
                  border="1px solid #e0e0e0" // Light border
                  maxWidth="85%"
                >
                  <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                    {message.role[0].toUpperCase() + message.role.slice(1)}
                  </Typography>
                  <Typography variant="body2" color="black">
                    {message.content}
                  </Typography>
                </Box>
              ))}
              <div ref={messagesEndRef} />
            </Stack>
          </Box>
          <Stack direction="row" spacing={1} p={1} borderTop="1px solid white" bgcolor="white">
            <TextField
              label="Message"
              placeholder="Type your message here"
              fullWidth
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && !isStreaming && handleSend()}
              disabled={isStreaming}
              size="small"
              InputProps={{
                style: {
                  color: 'black',
                },
              }}
            />
            <Button
              variant="contained"
              onClick={handleSend}
              disabled={isStreaming}
              size="small"
              color="inherit"
              style={{
                backgroundColor: 'black',
                color: 'white',
                '&:hover': {
                  backgroundColor: 'white',
                  color: 'black',
                },
              }}
            >
              Send
            </Button>
          </Stack>
        </Box>
      )}
    </Box>
  );
}