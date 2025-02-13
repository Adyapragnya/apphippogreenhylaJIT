import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { Box, TextField, IconButton, Typography, Modal, Button } from '@mui/material';
import { Send as SendIcon } from '@mui/icons-material';
import axios from 'axios';
import './Chatbot.css';
import { useVessel } from '../../VesselContext';

const ChatBot = ({ open, onClose }) => {

    const { handleLocateVesselClick } = useVessel(); 

    const handleLocateVesselButtonClick = (vessel) => {
        // Call the context function to update the selected vessel
        handleLocateVesselClick(vessel);
    };

    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef(null); // Reference for auto-scrolling

    const baseURL = process.env.REACT_APP_API_BASE_URL;
    
    const addMessage = (text, sender, locateVesselButtonUrl = null) => {
        const newMessage = { text, sender, LocateVesselButtonUrl: locateVesselButtonUrl };
        setMessages((prev) => [...prev, newMessage]);
    
        if (locateVesselButtonUrl) {
            console.log("LocateVesselButtonUrl:", locateVesselButtonUrl);  // Log only if URL exists
        }
    };

    const queryAI = async (userMessage) => {
        try {
            const response = await axios.post(`${baseURL}/api/gpt-query`, { query: userMessage });
            const { response: aiResponse, vesselData } = response.data;
    
            // Always add AI's response
            addMessage(aiResponse, 'Bot');
    
            // If vessel data exists (even if it's empty), add messages with "Locate Vessel" buttons
            vesselData.forEach((vessel) => {
                addMessage(vessel.text, 'Bot', vessel.LocateVesselButtonUrl);
            });
    
        } catch (error) {
            console.error('Error querying OpenAI API:', error.message);
            addMessage('An error occurred while processing your request.', 'Bot');
        }
    };

    const handleSendMessage = async () => {
        if (!newMessage.trim()) return;

        const userMessage = newMessage.trim();
        addMessage(userMessage, 'You');
        setNewMessage('');
        setIsTyping(true);

        try {
            await queryAI(userMessage);
        } catch (error) {
            addMessage('An error occurred while processing your request.', 'Bot');
        } finally {
            setIsTyping(false);
        }
    };

    // Auto-scroll to bottom whenever messages are updated
    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages]);

    return (
        <Modal open={open} onClose={onClose}>
        <Box className="search-modal-container">
            <Box className="search-header">
                <Typography variant="h5" sx={{ color: '#fff' }}>
                    Your Hyla AI Search....!
                </Typography>
            </Box>

            <Box className="search-box">
                {messages.map((message, index) => (
                    <Box key={index} display="flex" justifyContent={message.sender === 'You' ? 'flex-end' : 'flex-start'} mb={2}>
                        <Box sx={{
                            bgcolor: message.sender === 'You' ? '#D7FBE8' : '#E0E7F1',
                            p: 2,
                            borderRadius: '20px',
                            maxWidth: '80%',
                        }}>
                            <Typography variant="body1" sx={{ whiteSpace: 'pre-line' }}>
                                {message.text}
                            </Typography>

                            {/* Check if LocateVesselButtonUrl exists */}
                            {message.LocateVesselButtonUrl && message.LocateVesselButtonUrl.name && (
                                <Button
                                    variant="contained"
                                    color="primary"
                                    onClick={() => handleLocateVesselButtonClick(message.LocateVesselButtonUrl)}
                                >
                                    Locate {message.LocateVesselButtonUrl.name}
                                </Button>
                            )}
                        </Box>
                    </Box>
                ))}
                {isTyping && <Typography variant="body2" style={{color:"#ffff"}}>Please wait...</Typography>}
            </Box>

            <Box className="input-container">
                <TextField
                    variant="outlined"
                    fullWidth
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="How may I assist you...!"
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' && !isTyping) {
                            e.preventDefault();
                            handleSendMessage();
                        }
                    }}
                />
                <IconButton onClick={handleSendMessage} disabled={isTyping || !newMessage.trim()}>
                    <SendIcon />
                </IconButton>
            </Box>
        </Box>
        </Modal>
    );
};

ChatBot.propTypes = {
    open: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
};

export default ChatBot;
