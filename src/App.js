// src/App.js

import React, { useState, useEffect, useRef } from 'react';
import WaveSurfer from 'wavesurfer.js';
import './App.css';

function App() {
  const [audioFile, setAudioFile] = useState(null);
  const [recentFiles, setRecentFiles] = useState([]);
  const wavesurferRef = useRef(null);

  useEffect(() => {
    // Initialize Wavesurfer.js
    wavesurferRef.current = WaveSurfer.create({
      container: '#waveform',
      waveColor: '#1E90FF', // Thay đổi màu sắc của sóng âm
      progressColor: '#4682B4', // Màu của phần sóng đã phát
      height: 200, // Tăng chiều cao để sóng dày hơn
      barWidth: 3, // Điều chỉnh độ dày của các "bar" trong waveform
      responsive: true,
      backend: 'WebAudio', // Sử dụng WebAudio backend cho âm thanh tốt hơn
    });

    // Clean up on unmount
    return () => {
      if (wavesurferRef.current) {
        wavesurferRef.current.destroy();
      }
    };
  }, []);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAudioFile(file);
      const audioURL = URL.createObjectURL(file);

      // Load audio file to WaveSurfer
      wavesurferRef.current.load(audioURL);

      // Ensure the file is ready to play
      wavesurferRef.current.on('ready', () => {
        console.log('Audio loaded successfully');
        const duration = formatDuration(wavesurferRef.current.getDuration());
        const fileDetails = {
          name: file.name,
          size: formatFileSize(file.size),
          duration: duration,
          fileUrl: audioURL,
        };

        // Update recent files list (keep only the last 3 files)
        setRecentFiles((prevFiles) => {
          const updatedFiles = [fileDetails, ...prevFiles];
          if (updatedFiles.length > 3) updatedFiles.pop(); // Keep only the last 3 files
          return updatedFiles;
        });
      });

      // Handle errors in loading audio file
      wavesurferRef.current.on('error', (e) => {
        console.error('Error loading audio:', e);
      });
    }
  };

  const formatFileSize = (bytes) => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Byte';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i), 2) + ' ' + sizes[i];
  };

  const formatDuration = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const secondsRemaining = Math.floor(seconds % 60);
    return `${minutes}:${secondsRemaining < 10 ? '0' : ''}${secondsRemaining}`;
  };

  const playAudio = (fileUrl) => {
    if (wavesurferRef.current) {
      // Load the selected file into wavesurfer and play it
      wavesurferRef.current.load(fileUrl);

      // Wait for the audio file to be ready before playing it
      wavesurferRef.current.on('ready', () => {
        wavesurferRef.current.play();
        console.log('Playing audio...');
      });
      
      // Handle any errors during the play attempt
      wavesurferRef.current.on('error', (e) => {
        console.error('Error playing audio:', e);
      });
    }
  };

  const pauseAudio = () => {
    if (wavesurferRef.current) {
      // Pause the audio
      wavesurferRef.current.pause();
      console.log('Audio paused');
    }
  };

  return (
    <div className="App">
      <h1>Audio Spectrogram Analyzer</h1>

      <div className="up-container">
        {/* Upload audio file */}
        <div className="upload-container">
        <label className="upload-label">
          <span>Upload Audio File</span>
          <input
            type="file"
            accept="audio/*"
            onChange={handleFileUpload}
            className="upload-input"
          />
          <img src="/icon/upload.png" alt="Upload" className="upload-icon" />
        </label>


          <div className="upload-box">
            {audioFile && (
              <div className="file-info">
                <span>{audioFile.name}</span>
              </div>
            )}
          </div>
        </div>

        {/* Play and Pause buttons */}
        {audioFile && (
          <div>
            <button onClick={() => playAudio(URL.createObjectURL(audioFile))} className="play-btn">
              <img src="/icon/play-button.png" alt="Play" className="play-icon"  />
            </button>
            <button onClick={pauseAudio} className="pause-btn">
              <img src="/icon/pause-button.png" alt="Pause" className="pause-icon" />
            </button>
          </div>
        )}

        {/* Display Waveform */}
        <div id="waveform" className="waveform-container"></div>

      </div>

      {/* Recent Audio Files */}
      <div className="recent-files">
        <h3>Recent Files</h3>
        {recentFiles.length === 0 ? (
          <p>No recent files</p>
        ) : (
          <ul>
            {recentFiles.map((file, index) => (
              <li key={index}>
                <div className="file-info">
                  <strong>{file.name}</strong> <br />
                  <span>{file.duration}</span> <br />
                  <span>{file.size}</span> <br />
                  <button onClick={() => playAudio(file.fileUrl)} className="play-btn">
                    <img src="/icon/play-button.png" alt="Play" className="play-icon"  />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default App;
