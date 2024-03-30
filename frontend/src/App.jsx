import React, { useEffect, useMemo, useState } from "react";
import { io } from "socket.io-client";

import { Button, Container, TextField, Typography } from "@mui/material";

const App = () => {
    const [socketID, setSocketID] = useState("");
    const [roomID, setRoomID] = useState("");
    const [roomNameToJoin, setRoomNameToJoin] = useState("");
    const [message, setMessage] = useState("");
    const [messages, setMessages] = useState([]);

    // Connect to the server
    // const socket = io("http://localhost:3000");
    const socket = useMemo(() => io("http://localhost:3000"), []);

    useEffect(() => {
        // Log a message when the connection is established
        socket.on("connect", () => {
            setSocketID(socket.id);
            console.log("\n[frontend] Connected to the server with ID: " + socket.id);
        });

        // socket.on("welcome", (message) => {
        //     console.log("\n[frontend] Server says: " + message);
        // });

        // Listen for incoming messages
        socket.on("chat-message", (message) => {
            console.log("\n[frontend] Message received: " + message);

            // Update the messages state
            setMessages((messages) => [...messages, message]);
        });

        // Close the connection when the component is unmounted
        return () => {
            socket.disconnect();
        };
    }, []);

    const sendMessage = (e) => {
        e.preventDefault();

        // If room ID is provided, send the message to that room
        if (roomID) {
            socket.emit("chat-message", { roomID, message });
        } else {
            // Emit the message to the server
            socket.emit("chat-message", message);
        }

        // Clear the input field
        setMessage("");
        setRoomID("");
    };

    const joinRoomHandler = (e) => {
        e.preventDefault();

        // Join the room
        socket.emit("join-room", roomNameToJoin);

        // Clear the input field
        setRoomNameToJoin("");
    };

    return (
        <Container maxWidth="sm" style={{ marginTop: "2rem" }} onSubmit={sendMessage}>
            <Typography variant="h4">Welcome to the Socket.IO Chat App</Typography>

            <Typography variant="body1" style={{ marginTop: "1rem" }}>
                Your Socket ID: <strong>{socketID}</strong>
            </Typography>

            <form>
                {/* Message */}
                <TextField
                    label="Enter your message"
                    fullWidth
                    style={{ marginTop: "1rem" }}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                />

                {/* Room ID */}
                <TextField
                    label="Enter room ID to send message"
                    fullWidth
                    style={{ marginTop: "1rem" }}
                    value={roomID}
                    onChange={(e) => setRoomID(e.target.value)}
                />

                <Button
                    variant="contained"
                    color="primary"
                    style={{ marginTop: "1rem" }}
                    fullWidth
                    type="submit"
                    onClick={sendMessage}
                >
                    Send
                </Button>
            </form>

            <form style={{ marginTop: "5rem" }} onSubmit={joinRoomHandler}>
                {/* Room ID to join */}
                <TextField
                    label="Enter room ID to join"
                    fullWidth
                    style={{ marginTop: "1rem" }}
                    value={roomNameToJoin}
                    onChange={(e) => setRoomNameToJoin(e.target.value)}
                />

                <Button
                    variant="contained"
                    color="primary"
                    style={{ marginTop: "1rem" }}
                    fullWidth
                    type="submit"
                    onClick={joinRoomHandler}
                >
                    Join Room
                </Button>
            </form>

            {/* Display messages */}
            <div style={{ marginTop: "2rem" }}>
                {messages.map((msg, index) => (
                    <Typography key={index} variant="body1">
                        {msg}
                    </Typography>
                ))}
            </div>
        </Container>
    );
};

export default App;
