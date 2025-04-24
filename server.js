require("dotenv").config(); // Load environment variables
const express = require("express");
const multer = require("multer");
const { spawn } = require("child_process");
const fs = require("fs");

const app = express();
const upload = multer({ dest: "uploads/" });

// Serve static files from the "public" directory
app.use(express.static("public"));

// SSE endpoint for progress updates
app.get("/progress", (req, res) => {
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    // Send a ping every 10 seconds to keep the connection alive
    const interval = setInterval(() => {
        res.write("event: ping\n");
        res.write("data: {}\n\n");
    }, 10000);

    req.on("close", () => {
        clearInterval(interval);
    });
});

app.post("/upload", upload.single("video"), (req, res) => {
    if (!req.file) return res.status(400).send("No file uploaded");

    const rtmpUrl = req.body.rtmpUrl; // Get RTMP URL from the request body
    if (!rtmpUrl) return res.status(400).send("RTMP URL is required");

    // Validate MIME type (basic check)
    const mimeType = req.file.mimetype;
    if (!mimeType.startsWith("video/")) {
        fs.unlinkSync(req.file.path); // Delete invalid file
        return res.status(400).send("Invalid file type. Please upload a video.");
    }

    const videoPath = req.file.path;

    const ffmpeg = spawn("ffmpeg", [
        "-re",
        "-i", videoPath,
        "-c:v", "libx264",
        "-preset", "fast",
        "-b:v", "3000k",
        "-maxrate", "3000k",
        "-bufsize", "6000k",
        "-g", "60", // Set keyframe interval (e.g., 60 for 30 FPS and 2 seconds)
        "-c:a", "aac",
        "-b:a", "128k",
        "-f", "flv",
        rtmpUrl,
    ]);

    // Capture FFmpeg progress and send updates via SSE
    ffmpeg.stderr.on("data", (data) => {
        const output = data.toString();
        console.error(`FFmpeg stderr: ${output}`);

        // Extract progress information (e.g., time=00:00:10.00)
        const match = output.match(/time=(\d+:\d+:\d+\.\d+)/);
        if (match) {
            const currentTime = match[1];
            // Send progress update to the SSE endpoint
            res.write(`event: progress\n`);
            res.write(`data: {"time": "${currentTime}"}\n\n`);
        }
    });

    ffmpeg.on("close", (code) => {
        fs.unlinkSync(videoPath); // Clean up the uploaded file
        if (code === 0) {
            console.log("Streaming started successfully!");
            res.write(`event: complete\n`);
            res.write(`data: {"message": "Streaming completed successfully!"}\n\n`);
            res.end();
        } else {
            console.error(`FFmpeg process exited with code ${code}`);
            res.write(`event: error\n`);
            res.write(`data: {"message": "Streaming failed"}\n\n`);
            res.end();
        }
    });

    ffmpeg.on("error", (error) => {
        console.error(`FFmpeg Error: ${error}`);
        fs.unlinkSync(videoPath); // Clean up the uploaded file
        res.write(`event: error\n`);
        res.write(`data: {"message": "Streaming failed"}\n\n`);
        res.end();
    });
});

app.listen(3000, () => console.log("Server running on port 3000"));
