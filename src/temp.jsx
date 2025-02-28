import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

  export default function VideoCaptionApp() {
    const [videoUrl, setVideoUrl] = useState("");
    const [captions, setCaptions] = useState([]);
    const [currentCaption, setCurrentCaption] = useState("");
    const [timestamp, setTimestamp] = useState("");
    const [player, setPlayer] = useState(null);
    const [currentTime, setCurrentTime] = useState(0);
  
    // Function to extract YouTube Video ID
    const getYouTubeID = (url) => {
      const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:.*v=|.*\/|.*embed\/))([^?&]+)/);
      return match ? match[1] : null;
    };
  
    // YouTube Video URL Handling
    const videoID = getYouTubeID(videoUrl);
    const embeddedUrl = videoID ? `https://www.youtube.com/embed/${videoID}?enablejsapi=1` : null;
  
    useEffect(() => {
      if (window.YT && videoID) {
        const newPlayer = new window.YT.Player("youtube-player", {
          events: {
            onReady: (event) => {
              setPlayer(event.target);
              setInterval(() => {
                setCurrentTime(event.target.getCurrentTime());
              }, 500);
            },
          },
        });
      }
    }, [videoID]);
  
    const handleAddCaption = () => {
      if (!currentCaption || !timestamp) return;
      setCaptions([...captions, { text: currentCaption, time: parseFloat(timestamp) }]);
      setCurrentCaption("");
      setTimestamp("");
    };
  
    const getActiveCaption = () => {
      const activeCaption = captions.find(
        (caption) => currentTime >= caption.time && currentTime < caption.time + 3
      );
      return activeCaption ? activeCaption.text : "";
    };
  
    return (
      <div className="p-6 max-w-3xl mx-auto flex flex-col gap-4">
        <h1 className="text-2xl font-bold">YouTube Caption Tool</h1>
        <Input
          type="text"
          placeholder="Enter YouTube Video URL"
          value={videoUrl}
          onChange={(e) => setVideoUrl(e.target.value)}
        />
        {videoID && (
          <div className="relative">
            <iframe
              id="youtube-player"
              width="100%"
              height="400"
              src={embeddedUrl}
              frameBorder="0"
              allowFullScreen
              className="rounded-lg shadow-md"
            />
            <div className="absolute bottom-5 left-0 right-0 text-center text-white text-lg bg-black bg-opacity-50 p-2">
              {getActiveCaption()}
            </div>
          </div>
        )}
        <div className="flex gap-2">
          <Input
            type="text"
            placeholder="Enter caption"
            value={currentCaption}
            onChange={(e) => setCurrentCaption(e.target.value)}
          />
          <Input
            type="number"
            placeholder="Timestamp (in seconds)"
            value={timestamp}
            onChange={(e) => setTimestamp(e.target.value)}
          />
          <Button onClick={handleAddCaption}>Add</Button>
        </div>
        <ul className="mt-2">
          {captions.map((cap, index) => (
            <li key={index} className="p-2 bg-gray-200 rounded-md">
              {cap.time}s: {cap.text}
            </li>
          ))}
        </ul>
      </div>
    );
  }