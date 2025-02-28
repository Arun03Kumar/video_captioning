import React, { useState, useRef } from 'react';
import ReactPlayer from 'react-player';

function App() {
  const [step, setStep] = useState(1);
  const [videoUrl, setVideoUrl] = useState('');
  const [videoError, setVideoError] = useState('');
  const [captions, setCaptions] = useState([]);
  const [currentCaption, setCurrentCaption] = useState('');
  const [newCaption, setNewCaption] = useState({ start: '', end: '', text: '' });
  const playerRef = useRef(null);

  const handleNext = () => {
    if (videoUrl.trim() !== '') {
      setStep(2);
    }
  };

  const handleProgress = (state) => {
    const currentTime = state.playedSeconds;
    const activeCaption = captions.find(caption => {
      const start = parseFloat(caption.start);
      const end = parseFloat(caption.end);
      return currentTime >= start && currentTime <= end;
    });
    setCurrentCaption(activeCaption ? activeCaption.text : '');
  };

  const handleError = () => {
    setVideoError('Error loading video. Please ensure the URL is correct and points to a supported video platform or direct file (e.g., .mp4).');
  };

  const handleAddCaption = () => {
    if (newCaption.start && newCaption.end && newCaption.text) {
      setCaptions([...captions, newCaption]);
      setNewCaption({ start: '', end: '', text: '' });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      {step === 1 && (
        <div className="bg-white shadow-lg rounded-lg p-8 w-full max-w-md">
          <h2 className="text-2xl font-bold mb-6 text-center">Enter Video URL</h2>
          <input
            type="text"
            placeholder="Enter video URL (e.g., YouTube link or direct .mp4)"
            className="w-full border border-gray-300 rounded-md p-3 mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={videoUrl}
            onChange={(e) => setVideoUrl(e.target.value)}
          />
          <button
            className="w-full bg-blue-600 text-white py-3 rounded-md hover:bg-blue-700 transition"
            onClick={handleNext}
          >
            Next
          </button>
        </div>
      )}
      {step === 2 && (
        <div className="flex flex-col md:flex-row bg-white shadow-lg rounded-lg overflow-hidden w-full max-w-6xl">
          <div className="md:w-2/3 relative flex justify-center items-center p-4">
            <div className="relative w-full max-w-3xl pb-[56.25%]">
              <ReactPlayer
                ref={playerRef}
                url={videoUrl}
                controls
                width="100%"
                height="100%"
                onProgress={handleProgress}
                onError={handleError}
                style={{ position: 'absolute', top: 0, left: 0 }}
              />
              {videoError && (
                <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-75 text-red-400 p-4">
                  {videoError}
                </div>
              )}
              {currentCaption && !videoError && (
                <div className="absolute bottom-6 left-4 right-4 bg-black bg-opacity-60 text-white text-lg text-center py-2 rounded">
                  {currentCaption}
                </div>
              )}
            </div>
          </div>
          <div className="md:w-1/3 p-6 border-t md:border-t-0 md:border-l border-gray-200">
            <h3 className="text-xl font-semibold mb-4">Caption Manager</h3>
            <div className="mb-4">
              <input
                type="text"
                placeholder="Start Time (sec)"
                className="w-full border border-gray-300 rounded-md p-2 mb-3 focus:outline-none focus:ring-2 focus:ring-green-500"
                value={newCaption.start}
                onChange={(e) => setNewCaption({ ...newCaption, start: e.target.value })}
              />
              <input
                type="text"
                placeholder="End Time (sec)"
                className="w-full border border-gray-300 rounded-md p-2 mb-3 focus:outline-none focus:ring-2 focus:ring-green-500"
                value={newCaption.end}
                onChange={(e) => setNewCaption({ ...newCaption, end: e.target.value })}
              />
              <textarea
                placeholder="Caption Text"
                className="w-full border border-gray-300 rounded-md p-2 mb-3 focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
                value={newCaption.text}
                onChange={(e) => setNewCaption({ ...newCaption, text: e.target.value })}
              />
              <button
                className="w-full bg-green-600 text-white py-2 rounded-md hover:bg-green-700 transition"
                onClick={handleAddCaption}
              >
                Add Caption
              </button>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Captions List</h4>
              {captions.length > 0 ? (
                <ul className="space-y-2 max-h-64 overflow-y-auto">
                  {captions.map((caption, index) => (
                    <li key={index} className="border border-gray-200 p-2 rounded-md">
                      <span className="block font-bold">{caption.start} - {caption.end}</span>
                      <span>{caption.text}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500">No captions added yet.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
