import express from "express";
import cors from "cors";
import colors from "colors";
import { createServer } from "http";
import { Server } from "socket.io";

// Initialize express server
const app = express();

// Create an HTTP server using the Server constructor
const server = createServer(app);

// Create a WebSocket server on top of the HTTP server, with CORS configuration allowing all origins
const io = new Server(server, {
    cors: {
        origin: "http://localhost:5173",
        methods: ["GET", "POST"],
        credentials: true,
    },
});

// Use middleware to enable CORS
app.use(cors());

app.get("/", (req, res) => {
    res.send("Hello World");
});

// Listen for incoming connections
io.on("connection", (socket) => {
    console.log(("\n[backend] New connection established with ID: " + socket.id).green);

    // Welcome to the new connection
    // socket.emit("welcome", "🎉 Welcome! You are connected to the server");

    // Broadcast a message to all other connected clients except the new one
    // socket.broadcast.emit("welcome", `🎉 New client connected with ID: ${socket.id}`);

    // Listen for a custom event
    socket.on("chat-message", (data) => {
        console.log(("\n[backend] Message received: " + data.message).yellow);

        // If room ID is provided, send the message to that room
        if (data.roomID) {
            socket.to(data.roomID).emit("chat-message", data.message);
        } else {
            // Broadcast the message to all connected clients
            io.emit("chat-message", data);
        }
    });

    // Listen for a join-room event
    socket.on("join-room", (roomID) => {
        console.log(("\n[backend] Client with ID: " + socket.id + " joined room: " + roomID).blue);

        // Join the room
        socket.join(roomID);
    });

    // Listen for a custom event
    socket.on("disconnect", () => {
        console.log(("\n[backend] Client disconnected with ID: " + socket.id).red);
    });
});

const PORT = 3000;
server.listen(PORT, () => {
    console.log(`\n[backend] Server is running on port ${PORT}\n`);
});
