import React, { useState } from 'react';
import axios from 'axios';
import sha1 from 'sha1';
import uuidv1 from 'uuid/v1';
import copy from 'copy-to-clipboard';

import './App.css';

function App() {
  const cachedToken = window.localStorage.getItem('token');
  const cachedCDNs = window.localStorage.getItem('cdns') || '[]';
  const [token, setToken] = useState(cachedToken || '');
  const [directory, setDirectory] = useState('default');
  const [fileName, setFileName] = useState('');
  const [fileContent, setFileContent] = useState('');
  const [CDNs, setCDNs] = useState(JSON.parse(cachedCDNs));

  function upload(e) {
    if (!token) {
      alert('token is required');
      return;
    }

    const filePathAndName = `${directory}/${fileName}`;
    axios({
      url: `https://api.github.com/repos/HY-BOT/CDN/contents/${filePathAndName}`,
      method: 'put',
      headers: {
        Authorization: `token ${token}`
      },
      data: {
        message: `Upload: ${filePathAndName}`,
        content: fileContent,
        sha: sha1(fileContent)
      }
    })
      .then(res => {
        console.log('res: ', res);
        const newCDNs = [
          ...CDNs,
          `https://cdn.jsdelivr.net/gh/HY-BOT/CDN@master/${filePathAndName}`
        ];
        setCDNs(newCDNs);
        window.localStorage.setItem('cdns', JSON.stringify(newCDNs));
      })
      .catch(err => {
        console.log('err: ', err);
        alert('Something went wrong, please check the console log');
      });
  }

  return (
    <div style={{ width: 700, margin: '30px auto' }}>
      <div style={{ marginBottom: 20 }}>
        Step1:{' '}
        <input
          placeholder="type token"
          type="password"
          value={token}
          onChange={e => {
            setToken(e.target.value);
            window.localStorage.setItem('token', e.target.value);
          }}
        />
      </div>
      <div style={{ marginBottom: 20 }}>
        Step2:{' '}
        <input
          type="file"
          onChange={e => {
            const file = e.target.files[0];
            setFileName(file.name);
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.addEventListener(
              'load',
              () => {
                const content = reader.result;
                setFileContent(content.split('base64,')[1]);
              },
              false
            );
          }}
        />
      </div>
      <div style={{ marginBottom: 20 }}>
        Step3:{' '}
        <select
          value={directory}
          onChange={e => {
            setDirectory(e.target.value);
          }}
        >
          <option value="default">default</option>
          <option value="common">common</option>
        </select>
      </div>
      <div style={{ marginBottom: 20 }}>
        Step4:{' '}
        <input
          value={fileName}
          onChange={e => {
            setFileName(e.target.value);
          }}
          placeholder="custom filename and path (optional)"
          type="text"
          style={{ width: '400px' }}
        />
        <button
          onClick={() => {
            const ext = fileName.split('.')[1];
            const newFileName = `${uuidv1()}.${ext}`;
            setFileName(newFileName);
          }}
        >
          generate
        </button>
      </div>
      <div style={{ marginBottom: 20 }}>
        Step5: <button onClick={upload}>Upload</button>
      </div>
      <hr />
      <strong>Recently upload files:</strong>
      <ul>
        {CDNs.map((cdn, index) => {
          return (
            <li
              key={index}
              style={{
                display: 'flex',
                alignItems: 'center',
                marginTop: '20px'
              }}
            >
              <span
                style={{
                  cursor: 'pointer',
                  fontSize: 20,
                  marginRight: 20,
                  fontWeight: 'bold',
                  width: 100
                }}
                onClick={() => {
                  copy(cdn);
                }}
              >
                copy ->
              </span>
              <a href={cdn} target="_blank">
                {cdn}
              </a>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export default App;
