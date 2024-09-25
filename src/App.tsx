import { ChangeEvent, useRef, useState } from 'react'
import ReactJson from 'react-json-view'

import './App.css'

interface DownloadFileProps {
  data: string;
  fileName: string;
  fileType: string;
}

function App() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<string>("");
  const [fileProcessed, setFileProcessed] = useState<string>("");
  const [fileName, setFileName] = useState("");

  const inputRef2 = useRef<HTMLInputElement>(null);
  const [file2, setFile2] = useState<string>("");
  const [fileProcessed2, setFileProcessed2] = useState<string>("");
  const [fileName2, setFileName2] = useState("");

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const fileReader = new FileReader();
    if (e.target.files && e.target.files[0]) {
      fileReader.readAsText(e.target.files[0], "UTF-8");
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
          };
          setFile(result);
          setFileProcessed(JSON.stringify(resultJSON, null, 2));
          setFileName(filename);
        }
      };
    }
  };

  const resetFileInput = () => {
    if (inputRef.current) {
      inputRef.current.value = "";
      setFile("");
      setFileProcessed("");
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
    const fileReader = new FileReader();
    if (e.target.files && e.target.files[0]) {
      fileReader.readAsText(e.target.files[0], "UTF-8");
      const filename2 = e.target.files[0].name.replace(/\.json$/, "");

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
              [key: string]: { h: number; y: number; w: number; x: number };
            };
          } = {
            mc: {
              [filename2]: {
                frames: [],
                frameRate: 3,
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

          setFile2(result);
          setFileProcessed2(JSON.stringify(resultJSON, null, 2));
          setFileName2(filename2);
        }
      };
    }
  };

  const resetFileInput2 = () => {
    if (inputRef2.current) {
      inputRef2.current.value = "";
      setFile2("");
      setFileProcessed2("");
    }
  };


    return (
        <main>
            <div>
                <h1>JSON to TexturePacker Converter</h1>
                <div>
                    <label htmlFor="newFile">Upload JSON file:</label>
                    <input ref={inputRef} type="file" id="newFile" onChange={handleFileChange} />
                    <button type="button" onClick={resetFileInput}>Clear</button>
                    <button disabled={!fileProcessed} type="button"
                        onClick={
                            () => downloadFile({
                                data: fileProcessed, fileName, fileType: "text/json"
                            })}
                    >Download</button>
                </div>

                <div style={{ display: "flex" }}>
                    <div>
                        {file && <ReactJson src={JSON.parse(file)} theme="monokai" />}
                    </div>
                    <div>
                        {fileProcessed && <ReactJson src={JSON.parse(fileProcessed)} theme="monokai" />}
                    </div>
                </div>
            </div>
            <div>
                <h1>JSON to TexturePacker Converter 2</h1>
                <div>
                    <label htmlFor="newFile2">Upload JSON file:</label>
                    <input ref={inputRef2} type="file" id="newFile2" onChange={handleFileChange2} />
                    <button type="button" onClick={resetFileInput2}>Clear</button>
                    <button disabled={!fileProcessed2} type="button"
                        onClick={
                            () => downloadFile2({
                                data: fileProcessed2, fileName2, fileType: "text/json"
                            })}
                    >Download</button>
                </div>

                <div style={{ display: "flex" }}>
                    <div>
                        {file2 && <ReactJson src={JSON.parse(file2)} theme="monokai" />}
                    </div>
                    <div>
                        {fileProcessed2 && <ReactJson src={JSON.parse(fileProcessed2)} theme="monokai" />}
                    </div>
                </div>
            </div>
        </main>
    )
}

export default App
