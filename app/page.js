'use client';

import { useState, useEffect, useRef } from 'react';
import { Box, Button, TextField, Stack, Typography } from '@mui/material';

export default function Home() {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: 'Welcome to Pantry Easy Customer Support! We\'re here to help you get the most out of your pantry management experience.'
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
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
    setMessages(prevMessages => [...prevMessages, { role: 'user', content: userMessage }]);

    // Add an initial empty message for the assistant
    setMessages(prevMessages => [...prevMessages, { role: 'assistant', content: '' }]);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify([{ role: 'user', content: userMessage }])
      });

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      let assistantMessageContent = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        assistantMessageContent += chunk;

        setMessages(prevMessages => {
          const newMessages = [...prevMessages];
          newMessages[newMessages.length - 1].content = assistantMessageContent;
          return newMessages;
        });
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsStreaming(false);
    }
  };

  return (
    <Box
      display="flex"
      flexDirection="column"
      justifyContent="flex-start"
      alignItems="center"
      height="110vh"
      width="130vw"
      bgcolor="gray.50"
      p={2}
    >
      <Box
        display="flex"
        flexDirection="column"
        justifyContent="space-between"
        alignItems="center"
        width="100%"
        maxWidth="520px"
        height="90%"
        border="1px solid gray"
        borderRadius={2}
        overflow="hidden"
        bgcolor="white"
      >
        <Box
          flexGrow={1}
          width="100%"
          p={2}
          overflow="auto"
        >
          <Stack spacing={3} width="100%">
            {messages.map((message, index) => (
              <Box
                key={index}
                alignSelf={message.role === 'assistant' ? 'flex-start' : 'flex-end'}
                bgcolor={message.role === 'assistant' ? 'lightblue' : 'lightgreen'}
                p={2}
                borderRadius={4}
                boxShadow={2}
                maxWidth="85%"
                alignItems={message.role === 'assistant' ? 'flex-start' : 'flex-end'}
              >
                <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                  {message.role[0].toUpperCase() + message.role.slice(1)}
                </Typography>
                <Typography variant="body1">{message.content}</Typography>
              </Box>
            ))}
            <div ref={messagesEndRef} />
          </Stack>
        </Box>
        <Stack direction="row" spacing={2} width="100%" p={2} borderTop="1px solid gray" bgcolor="white">
          <TextField
            label="Message"
            placeholder="Type your message here"
            fullWidth
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && !isStreaming && handleSend()}
            disabled={isStreaming}
          />
          <Button variant="contained" onClick={handleSend} disabled={isStreaming}>
            Send
          </Button>
        </Stack>
      </Box>
    </Box>
  );
}
