/* eslint-disable @typescript-eslint/no-explicit-any */
import { ChangeEvent, useRef, useState, useEffect } from "react";
import ReactJson from "react-json-view";

import "./App.css";

interface DownloadFileProps {
  data: string;
  fileName: string;
  fileType: string;
}

function App() {
  const [darkMode, setDarkMode] = useState(true);
  const [frameRate1, setFrameRate1] = useState(12);
  const [frameRate2, setFrameRate2] = useState(12);

  const inputRef = useRef<HTMLInputElement>(null);
  const [files, setFiles] = useState<string[]>([]);
  const [fileProcessed, setFileProcessed] = useState<string[]>([]);
  const [fileNames, setFileNames] = useState<string[]>([]);

  const inputRef2 = useRef<HTMLInputElement>(null);
  const [files2, setFiles2] = useState<string[]>([]);
  const [fileProcessed2, setFileProcessed2] = useState<string[]>([]);
  const [fileNames2, setFileNames2] = useState<string[]>([]);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const fileReaders: any[] = [];
    const newFiles: string[] = [];
    const newFileProcessed: string[] = [];
    const newFileNames: string[] = [];

    if (e.target.files) {
      Array.from(e.target.files).forEach((file) => {
        const fileReader = new FileReader();
        fileReaders.push(
          new Promise<void>((resolve) => {
            fileReader.readAsText(file, "UTF-8");
            fileReader.onload = (e) => {
              if (e.target?.result) {
                const result = e.target.result.toString();
                const json = JSON.parse(result);
                const filename = Object.keys(json.mc)[0];
                const subTextures = Object.entries(json.res).map(
                  ([name, { x, y, w, h }]: [string, any]) => ({
                    name,
                    width: w,
                    height: h,
                    frameX: json.mc[filename].frames.find(
                      ({ res }: { res: string }) => res === name
                    ).x,
                    frameY: json.mc[filename].frames.find(
                      ({ res }: { res: string }) => res === name
                    ).y,
                    x,
                    y,
                  })
                );

                const resultJSON = {
                  SubTexture: subTextures,
                  imagePath: filename + ".png",
                  name: filename,
                  frameRate: frameRate1,
                };
                newFiles.push(result);
                newFileProcessed.push(JSON.stringify(resultJSON, null, 2));
                newFileNames.push(filename);
                resolve();
              }
            };
          })
        );
      });

      Promise.all(fileReaders).then(() => {
        setFiles(newFiles);
        setFileProcessed(newFileProcessed);
        setFileNames(newFileNames);
      });
    }
  };

  const resetFileInput = () => {
    if (inputRef.current) {
      inputRef.current.value = "";
      setFiles([]);
      setFileProcessed([]);
    }
  };

  const downloadFile = ({ data, fileName, fileType }: DownloadFileProps) => {
    const blob = new Blob([data], { type: fileType });
    const a = document.createElement("a");
    a.download = fileName + ".json";
    a.href = window.URL.createObjectURL(blob);
    const clickEvt = new MouseEvent("click", {
      view: window,
      bubbles: true,
      cancelable: true,
    });
    a.dispatchEvent(clickEvt);
    a.remove();
  };

  const handleFileChange2 = (e: ChangeEvent<HTMLInputElement>) => {
    const fileReaders: any[] = [];
    const newFiles2: string[] = [];
    const newFileProcessed2: string[] = [];
    const newFileNames2: string[] = [];

    if (e.target.files) {
      Array.from(e.target.files).forEach((file) => {
        const fileReader = new FileReader();
        fileReaders.push(
          new Promise<void>((resolve) => {
            fileReader.readAsText(file, "UTF-8 ");
            const filename2 = file.name.replace(/\.json$/, "");

            fileReader.onload = (e) => {
              if (e.target?.result) {
                const result = e.target.result.toString();
                const json = JSON.parse(result);
                const resultJSON: {
                  mc: {
                    [key: string]: {
                      frames: { res: string; y: number; x: number }[];
                      frameRate: number;
                    };
                  };
                  res: {
                    [key: string]: {
                      h: number;
                      y: number;
                      w: number;
                      x: number;
                    };
                  };
                } = {
                  mc: {
                    [filename2]: {
                      frames: [],
                      frameRate: frameRate2,
                    },
                  },
                  res: {},
                };

                json.frames.forEach((frame: any, index: number) => {
                  resultJSON.mc[filename2].frames.push({
                    res: index.toString().padStart(2, "0"),
                    y: -frame.oy,
                    x: -frame.ox,
                  });

                  resultJSON.res[index.toString().padStart(2, "0")] = {
                    h: frame.h,
                    y: frame.y,
                    w: frame.w,
                    x: frame.x,
                  };
                });

                newFiles2.push(result);
                newFileProcessed2.push(JSON.stringify(resultJSON, null, 2));
                newFileNames2.push(filename2);
                resolve();
              }
            };
          })
        );
      });

      Promise.all(fileReaders).then(() => {
        setFiles2(newFiles2);
        setFileProcessed2(newFileProcessed2);
        setFileNames2(newFileNames2);
      });
    }
  };

  const resetFileInput2 = () => {
    if (inputRef2.current) {
      inputRef2.current.value = "";
      setFiles2([]);
      setFileProcessed2([]);
    }
  };

  const handleFrameRateChange = (converter: number, newRate: number) => {
    const updatedRate = Math.max(1, newRate);
    if (converter === 1) {
      setFrameRate1(updatedRate);
      if (fileProcessed.length > 0) {
        const updatedJSONs = fileProcessed.map((fp) => {
          const updatedJSON = JSON.parse(fp);
          updatedJSON.frameRate = updatedRate;
          return JSON.stringify(updatedJSON, null, 2);
        });
        setFileProcessed(updatedJSONs);
      }
    } else {
      setFrameRate2(updatedRate);
      if (fileProcessed2.length > 0) {
        const updatedJSONs2 = fileProcessed2.map((fp2) => {
          const updatedJSON = JSON.parse(fp2);
          const filename = Object.keys(updatedJSON.mc)[0];
          updatedJSON.mc[filename].frameRate = updatedRate;
          return JSON.stringify(updatedJSON, null, 2);
        });
        setFileProcessed2(updatedJSONs2);
      }
    }
  };

  const handleFrameRateInputChange = (
    converter: number,
    e: ChangeEvent<HTMLInputElement>
  ) => {
    const newRate = parseInt(e.target.value, 10);
    if (!isNaN(newRate)) {
      handleFrameRateChange(converter, newRate);
    }
  };

  useEffect(() => {
    if (darkMode) {
      document.body.classList.add("dark-mode");
    } else {
      document.body.classList.remove("dark-mode");
    }
  }, [darkMode]);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  return (
    <main>
      <button className="theme-toggle" onClick={toggleDarkMode}>
        {darkMode ? "Light Mode" : "Dark Mode"}
      </button>

      <div className="converter-section">
        <h1>JSON to TexturePacker Converter</h1>
        <div className="file-input-group">
          <label htmlFor="newFile">Upload JSON files:</label>
          <input
            ref={inputRef}
            type="file"
            id="newFile"
            onChange={handleFileChange}
            multiple
          />
          <div className="frame-rate-control">
            <button onClick={() => handleFrameRateChange(1, frameRate1 - 1)}>
              -
            </button>
            <input
              type="number"
              value={frameRate1}
              onChange={(e) => handleFrameRateInputChange(1, e)}
              min="1"
            />
            <button onClick={() => handleFrameRateChange(1, frameRate1 + 1)}>
              +
            </button>
          </div>
          <button type="button" onClick={resetFileInput}>
            Clear
          </button>
          <button
            disabled={fileProcessed.length === 0}
            type="button"
            onClick={() =>
              files.forEach((_file, index) =>
                downloadFile({
                  data: fileProcessed[index],
                  fileName: fileNames[index],
                  fileType: "text/json",
                })
              )
            }
          >
            Download All
          </button>
        </div>

        <div className="json-view-container">
          {files.map((file, index) => (
            <div className="json-view" key={index}>
              <h3>{fileNames[index]}</h3>
              <ReactJson
                src={JSON.parse(file)}
                theme={darkMode ? "monokai" : "rjv-default"}
              />
            </div>
          ))}
          {fileProcessed.map((processedFile, index) => (
            <div className="json-view" key={index}>
              <h3>Processed: {fileNames[index]}</h3>
              <ReactJson
                src={JSON.parse(processedFile)}
                theme={darkMode ? "monokai" : "rjv-default"}
              />
            </div>
          ))}
        </div>
      </div>

      <div className="converter-section">
        <h1>JSON to TexturePacker Converter 2</h1>
        <div className="file-input-group">
          <label htmlFor="newFile2">Upload JSON files:</label>
          <input
            ref={inputRef2}
            type="file"
            id="newFile2"
            onChange={handleFileChange2}
            multiple
          />
          <div className="frame-rate-control">
            <button onClick={() => handleFrameRateChange(2, frameRate2 - 1)}>
              -
            </button>
            <input
              type="number"
              value={frameRate2}
              onChange={(e) => handleFrameRateInputChange(2, e)}
              min="1"
            />
            <button onClick={() => handleFrameRateChange(2, frameRate2 + 1)}>
              +
            </button>
          </div>

          <button type="button" onClick={resetFileInput2}>
            Clear
          </button>
          <button
            disabled={fileProcessed2.length === 0}
            type="button"
            onClick={() =>
              files2.forEach((_file, index) =>
                downloadFile({
                  data: fileProcessed2[index],
                  fileName: fileNames2[index],
                  fileType: "text/json",
                })
              )
            }
          >
            Download All
          </button>
        </div>

        <div className="json-view-container">
          {files2.map((file, index) => (
            <div className="json-view" key={index}>
              <h3>{fileNames2[index]}</h3>
              <ReactJson
                src={JSON.parse(file)}
                theme={darkMode ? "monokai" : "rjv-default"}
              />
            </div>
          ))}
          {fileProcessed2.map((processedFile, index) => (
            <div className="json-view" key={index}>
              <h3>Processed: {fileNames2[index]}</h3>
              <ReactJson
                src={JSON.parse(processedFile)}
                theme={darkMode ? "monokai" : "rjv-default"}
              />
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}

export default App;
