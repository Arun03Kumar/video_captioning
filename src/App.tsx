import { useState, useRef } from "react";
import { Input } from "./components/ui/input";
import { Button } from "./components/ui/button";
import { Textarea } from "./components/ui/textarea";
import ReactPlayer from "react-player";

function App() {
  const [step, setStep] = useState(1);
  const [videoUrl, setVideoUrl] = useState("");
  const [videoError, setVideoError] = useState("");
  const [videoDuration, setVideoDuration] = useState(0);
  const [captions, setCaptions] = useState([]);
  const [currentCaption, setCurrentCaption] = useState("");
  const [newCaption, setNewCaption] = useState({
    start: "",
    end: "",
    text: "",
  });
  const [validationError, setValidationError] = useState("");
  const [editingIndex, setEditingIndex] = useState(null);
  const playerRef = useRef(null);

  const handleNext = () => {
    if (videoUrl.trim() !== "") {
      setStep(2);
    }
  };

  const handleProgress = (state) => {
    const currentTime = state.playedSeconds;
    const activeCaption = captions.find((caption) => {
      const start = parseFloat(caption.start);
      const end = parseFloat(caption.end);
      return currentTime >= start && currentTime <= end;
    });
    setCurrentCaption(activeCaption ? activeCaption.text : "");
  };

  const handleError = () => {
    setVideoError(
      "Error loading video. Please ensure the URL is correct and points to a supported video platform or direct file (e.g., .mp4)."
    );
  };

  const handleAddCaption = () => {
    const startTime = parseFloat(newCaption.start);
    const endTime = parseFloat(newCaption.end);

    if (isNaN(startTime) || isNaN(endTime)) {
      setValidationError(
        "Please enter valid numeric values for start and end times."
      );
      return;
    }
    if (startTime < 0 || endTime < 0) {
      setValidationError("Time values cannot be negative.");
      return;
    }
    if (endTime <= startTime) {
      setValidationError("End time must be greater than start time.");
      return;
    }
    if (!newCaption.text.trim()) {
      setValidationError("Please enter caption text.");
      return;
    }
    // Validate that caption times are within video duration (if available)
    if (
      videoDuration > 0 &&
      (startTime >= videoDuration || endTime > videoDuration)
    ) {
      setValidationError(
        `Caption times must be within the video duration (max ${videoDuration.toFixed(
          2
        )} sec).`
      );
      return;
    }
    // Validate no overlapping caption exists (optional)
    const isOverlapping = captions.some((caption) => {
      const existingStart = parseFloat(caption.start);
      const existingEnd = parseFloat(caption.end);
      return startTime < existingEnd && endTime > existingStart;
    });
    if (isOverlapping) {
      setValidationError(
        "Caption time range overlaps with an existing caption."
      );
      return;
    }

    setValidationError("");
    if (editingIndex !== null) {
      const updatedCaptions = [...captions];
      updatedCaptions[editingIndex] = newCaption;
      setCaptions(updatedCaptions);
      setEditingIndex(null);
    } else {
      setCaptions([...captions, newCaption]);
    }
    setNewCaption({ start: "", end: "", text: "" });
  };

  const handleEditCaption = (index) => {
    const captionToEdit = captions[index];
    setNewCaption(captionToEdit);
    setEditingIndex(index);
  };

  const handleDeleteCaption = (index) => {
    const updatedCaptions = captions.filter((_, i) => i !== index);
    setCaptions(updatedCaptions);
    if (editingIndex === index) {
      setEditingIndex(null);
      setNewCaption({ start: "", end: "", text: "" });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      {step === 1 && (
        <div className="p-8 w-full max-w-md">
          <Input
            type="text"
            placeholder="Enter YouTube Video URL"
            value={videoUrl}
            onChange={(e) => setVideoUrl(e.target.value)}
            className="w-full mb-3 border border-black"
          />
          <Button onClick={handleNext}>Next</Button>
        </div>
      )}
      {step === 2 && (
        <div className="flex flex-col md:flex-row overflow-hidden w-full max-w-6xl">
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
                onDuration={(duration) => setVideoDuration(duration)}
                style={{ position: "absolute", top: 0, left: 0 }}
              />
              {videoError && (
                <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-75 text-red-400 p-4">
                  {videoError}
                </div>
              )}
              {currentCaption && !videoError && (
                <div className="absolute bottom-6 left-4 right-4 bg-black bg-opacity-20 text-white text-lg text-center py-2 rounded">
                  {currentCaption}
                </div>
              )}
            </div>
          </div>
          <div className="md:w-1/2 p-6">
            <h3 className="text-xl font-semibold mb-4">Caption Manager</h3>
            <div className="mb-4">
              <div className="flex gap-2 mb-3">
                <Input
                  type="text"
                  placeholder="Start Time (sec)"
                  value={newCaption.start}
                  onChange={(e) =>
                    setNewCaption({ ...newCaption, start: e.target.value })
                  }
                  className="flex-1 border border-black"
                />
                <Input
                  type="text"
                  placeholder="End Time (sec)"
                  value={newCaption.end}
                  onChange={(e) =>
                    setNewCaption({ ...newCaption, end: e.target.value })
                  }
                  className="flex-1 border border-black"
                />
              </div>
              <Textarea
                placeholder="Caption Text"
                className="w-full mb-3 border border-black"
                value={newCaption.text}
                onChange={(e) =>
                  setNewCaption({ ...newCaption, text: e.target.value })
                }
              />
              {validationError && (
                <p className="text-red-500 text-sm mb-2">{validationError}</p>
              )}
              <div className="flex justify-end">
                <Button onClick={handleAddCaption} className="cursor-pointer">
                  {editingIndex !== null ? "Update Caption" : "Add Caption"}
                </Button>
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Captions List</h4>
              {captions.length > 0 ? (
                <ul className="space-y-2 max-h-64 overflow-y-auto">
                  {captions.map((caption, index) => (
                    <li
                      key={index}
                      className="border border-gray-200 p-2 rounded-md flex justify-between items-center"
                    >
                      <div>
                        <span className="block font-bold">
                          {caption.start} - {caption.end}
                        </span>
                        <span>{caption.text}</span>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          onClick={() => handleEditCaption(index)}
                          size="sm"
                          className="flex items-center justify-center text-xs px-2 py-1 cursor-pointer"
                        >
                          Edit
                        </Button>
                        <Button
                          onClick={() => handleDeleteCaption(index)}
                          size="sm"
                          variant="destructive"
                          className="flex items-center justify-center text-xs px-2 py-1 cursor-pointer"
                        >
                          Delete
                        </Button>
                      </div>
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
