import { ChangeEvent, useRef, useState } from 'react'
import ReactJson from 'react-json-view'

import './App.css'

function App() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<string>("")
  const [fileProcessed, setFileProcessed] = useState<string>("")
  const [fileName, setFileName] = useState("")

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const fileReader = new FileReader();
    if (e.target.files) {
      fileReader.readAsText(e.target.files[0], "UTF-8");
      fileReader.onload = e => {
        if (e.target?.result) {
          const result = e.target.result.toString()
          const json = JSON.parse(result)
          const filename = Object.keys(json.mc)[0];          
          const subTextures = Object.entries(json.res).map(([name, {x, y, w, h}]: any) => ({
            name,
            width: w,
            height: h,
            frameX: json.mc[filename].frames.find(({res}: any) => res == name).x,
            frameY: json.mc[filename].frames.find(({res}: any) => res == name).y,
            x,
            y
          }));
          
          
          const resultJSON = {
            SubTexture: subTextures,
            imagePath: filename + ".png",
            name: filename
          };
          setFile(result);
          setFileProcessed(JSON.stringify(resultJSON, null, 2))
          setFileName(filename)
        }
      };
    };
  }

  const resetFileInput = () => {
    if (inputRef.current) {
      inputRef.current.value = "";
      setFile("");
      setFileProcessed("");
    }
  }

  const downloadFile = ({ data, fileName, fileType }: any) => {
    // Create a blob with the data we want to download as a file
    const blob = new Blob([data], { type: fileType })
    // Create an anchor element and dispatch a click event on it
    // to trigger a download
    const a = document.createElement('a')
    a.download = fileName + ".json"
    a.href = window.URL.createObjectURL(blob)
    const clickEvt = new MouseEvent('click', {
      view: window,
      bubbles: true,
      cancelable: true,
    })
    a.dispatchEvent(clickEvt)
    a.remove()
  }

  return (
    <div>
      <div>
        <input ref={inputRef} type="file" id="newFile" onChange={handleFileChange} />
        <button type="button" onClick={resetFileInput}>Clear</button>
        <button disabled={!fileProcessed} type="button" onClick={() => downloadFile({data: fileProcessed, fileName, fileType:"text/json"})}>Download</button>
      </div>

      <div style={{display: "flex"}}>
        <div>
          {file && <ReactJson src={JSON.parse(file)} theme="monokai" />}
        </div>
        <div>
          {fileProcessed && <ReactJson src={JSON.parse(fileProcessed)} theme="monokai" />}
        </div>
      </div>
    </div>
  )
}

export default App
