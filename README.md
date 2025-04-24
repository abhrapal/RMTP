Here’s a sample project documentation file for your RTMP Video Streaming project. Save this as `README.md` in the root of your project directory.

---

# **RTMP Video Streaming Application**

## **Overview**
This project is a web-based application that allows users to upload video files and stream them to an RTMP server in real-time. The application uses Node.js for the back-end, FFmpeg for video processing, and a front-end interface for user interaction.

---

## **Features**
- Upload video files from the front-end.
- Dynamically specify the RTMP server URL and stream key.
- Real-time progress updates during streaming using Server-Sent Events (SSE).
- Supports video encoding with FFmpeg.
- Displays a progress bar on the front-end to show the streaming status.

---

## **Technologies Used**
- **Back-End:**
  - Node.js
  - Express.js
  - Multer (for file uploads)
  - FFmpeg (for video processing)
- **Front-End:**
  - HTML, CSS, JavaScript
  - Server-Sent Events (SSE) for real-time updates

---

## **Project Structure**
```
/Users/abhrapal/RMTP/
├── public/
│   ├── index.html         # Front-end HTML file
│   └── (other static assets, if any)
├── uploads/               # Directory for temporary uploaded files
├── server.js              # Back-end server code
├── .env                   # Environment variables (optional)
├── README.md              # Project documentation
```

---

## **Setup Instructions**

### **Prerequisites**
1. Install [Node.js](https://nodejs.org/) (v14 or higher).
2. Install [FFmpeg](https://ffmpeg.org/) and ensure it is available in your system's PATH.
3. (Optional) Install a text editor like [Visual Studio Code](https://code.visualstudio.com/).

---

### **Installation**
1. Clone the repository or download the project files.
2. Navigate to the project directory:
   ```bash
   cd /Users/abhrapal/RMTP
   ```
3. Install the required Node.js dependencies:
   ```bash
   npm install
   ```

---

### **Configuration**
1. Create a `.env` file in the root directory (optional) to store environment variables:
   ```bash
   STREAM_KEY=your_stream_key
   ```
2. Ensure the uploads directory exists and has write permissions:
   ```bash
   mkdir uploads
   chmod 755 uploads
   ```

---

### **Running the Application**
1. Start the server:
   ```bash
   node server.js
   ```
2. Open your browser and navigate to:
   ```
   http://localhost:3000/
   ```

---

## **Usage**
1. **Upload Video:**
   - Enter the RTMP server URL and stream key in the input fields.
   - Select a video file to upload.
   - Click the "Stream Video" button.

2. **Real-Time Progress:**
   - The progress bar will update dynamically as the video is streamed.
   - The status message will display the current progress or any errors.

3. **Streaming Completion:**
   - Once the video is fully streamed, a success message will be displayed.

---

## **Endpoints**

### **1. `/`**
- **Method:** `GET`
- **Description:** Serves the front-end HTML file.

### **2. `/upload`**
- **Method:** `POST`
- **Description:** Handles video file uploads and streams the video to the specified RTMP server.
- **Request Body:**
  - `video` (file): The video file to be streamed.
  - `rtmpUrl` (string): The RTMP server URL with the stream key.
- **Response:**
  - `200 OK`: Streaming started successfully.
  - `400 Bad Request`: Invalid file or missing RTMP URL.
  - `500 Internal Server Error`: Streaming failed.

### **3. `/progress`**
- **Method:** `GET`
- **Description:** Sends real-time progress updates to the front-end using SSE.

---

## **Error Handling**
- **Invalid File Type:**
  - If the uploaded file is not a video, the server will reject the upload with a `400 Bad Request` error.
- **Missing RTMP URL:**
  - If the RTMP URL is not provided, the server will return a `400 Bad Request` error.
- **FFmpeg Errors:**
  - Any errors during video processing or streaming will be logged to the console and sent to the front-end.

---

## **Customization**

### **1. Default RTMP Server URL and Stream Key**
- Modify the default values in `index.html`:
  ```html
  <input type="text" id="serverUrl" value="rtmps://live-api-s.facebook.com:443/rtmp/" placeholder="e.g., rtmps://live-api-s.facebook.com:443/rtmp">
  <input type="text" id="streamKey" value="FB-704632118905087-0-Ab02h4MS6bKIeOBuw_WHlKbf" placeholder="Enter your stream key">
  ```

### **2. FFmpeg Settings**
- Adjust the FFmpeg command in server.js to modify encoding settings:
  ```javascript
  const ffmpeg = spawn("ffmpeg", [
      "-re",
      "-i", videoPath,
      "-c:v", "libx264",
      "-preset", "fast",
      "-b:v", "3000k",
      "-maxrate", "3000k",
      "-bufsize", "6000k",
      "-g", "60", // Keyframe interval
      "-c:a", "aac",
      "-b:a", "128k",
      "-f", "flv",
      rtmpUrl,
  ]);
  ```

---

## **Known Issues**
1. **Keyframe Interval Too Low:**
   - Ensure the `-g` option in the FFmpeg command matches the frame rate of the video (e.g., `-g 60` for 30 FPS and 2-second intervals).

2. **Progress Updates Not Displayed:**
   - Ensure the `/progress` endpoint is working and the front-end is listening for SSE events.

3. **Large File Uploads:**
   - For large files, consider increasing the server's timeout settings or using chunked uploads.

---

## **Future Enhancements**
- Add WebSocket support for more interactive real-time updates.
- Implement file size and duration validation on the front-end.
- Add support for multiple simultaneous streams.
- Enhance the UI with a more modern design.

---

## **License**
This project is licensed under the MIT License. Feel free to use and modify it as needed.

