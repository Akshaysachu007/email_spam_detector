import { useState } from "react";
import axios from "axios";
import { Shield, Upload, AlertTriangle, CheckCircle } from "lucide-react";
import "../styles/HomePage.css";

function HomePage() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [dragActive, setDragActive] = useState(false);



  const uploadFile = async () => {
    if (!file) return;
    setLoading(true);
    const formData = new FormData();
    formData.append("file", file);
    try {
      const response = await axios.post("http://localhost:5000/upload", formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }

      );
      setResult(response.data);
    } catch (error) {
      console.error("Error uploading file", error);
    } finally {
      setLoading(false);
    }
  };


  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
    }
  };



  // page render

  return (
    <div className="container">
      <div className="card">
        <div className="header">
          <div className="icon-circle">
            <Shield size={36} color="white" />
          </div>
          <h2 className="title">Spam Email Detector</h2>
          <p className="subtitle">Upload an email file to analyze for spam</p>
        </div>

        <div
          className={`upload-area ${dragActive ? 'drag-active' : ''}`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <input
            type="file"
            id="fileInput"
            className="file-input"
            onChange={(e) => setFile(e.target.files[0])}
            accept=".txt,.eml,.msg"
          />
          <label htmlFor="fileInput" className="upload-label">
            <Upload size={48} color={dragActive ? '#667eea' : '#9ca3af'} className="upload-icon" />
            <p className="upload-text">
              {file ? file.name : 'Drop your file here or click to browse'}
            </p>
            <p className="upload-hint">Supports .txt, .eml, .msg files</p>
          </label>
        </div>

        <button
          className={`analyze-btn ${(!file || loading) ? 'disabled' : ''}`}
          onClick={uploadFile}
          disabled={!file || loading}
        >
          {loading ? 'Analyzing...' : 'Analyze Email'}
        </button>

        {result && (
          <div className={`result ${result.is_spam ? 'spam' : 'safe'}`}>
            <div className="result-header">
              {result.is_spam ? (
                <AlertTriangle size={32} color="#dc2626" className="result-icon" />
              ) : (
                <CheckCircle size={32} color="#16a34a" className="result-icon" />
              )}
              <div>
                <h3 className="result-title">
                  {result.is_spam ? 'Spam Detected' : 'Email is Safe'}
                </h3>
                <p className="result-confidence">
                  Confidence: {result.confidence_score}
                </p>
              </div>
            </div>
            <div className="result-analysis">
              <p>
                <strong>Analysis:</strong> {result.reasoning}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );

}
export default HomePage;






