import * as React from 'react';
// import axios from 'axios';
import { ThemeProvider, CssBaseline, TextField, InputAdornment, IconButton, Box, LinearProgress, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';

import catPop from './cat-pop.gif';
import catSilent from './cat-silent.gif';
import deepseek from './deepseek.png';

import { appTheme } from "./themes/theme.js";
import './App.css';

function App() {
  const [modelIsLoaded, setModelIsLoaded] = React.useState(false);
  const [model, setModel] = React.useState('1.5b');
  const [prompt, setPrompt] = React.useState("");
  const [loadingResponse, setLoadingResponse] = React.useState(false);
  const [chat, setChat] = React.useState([]);
  const [catTalking, setCatTalking] = React.useState(false);
  const [imageStyle, setImageStyle] = React.useState({ width: '100px', height: 'auto' });
  const [modelStyle, setModelStyle] = React.useState({ width: '30px', height: 'auto' });
  const [imagePos, setImagePos] = React.useState({ position: "absolute", bottom: 110, left: 40 });
  const [fontSize, setFontSize] = React.useState('16px');
  const [textFieldHeight, setTextFieldHeight] = React.useState(22.5);

  const AlwaysScrollToBottom = () => {
    const elementRef = React.useRef();
    React.useEffect(() => elementRef.current.scrollIntoView());
    return <div ref={elementRef} />;
  };

  const handleChange = (event) => {
    setModel(event.target.value);
  };

  function sendPrompt(prompt) {
    // Add prompt to UI
    var currentChat = chat;
    currentChat = [...currentChat, {"text": prompt, "type": "prompt"}]
    setChat(currentChat)

    setLoadingResponse(true);

    const url = `/api/llm-model?llmProvider=ollama&model=deepseek-r1:${model}&prompt=` + prompt;
    const requestOptions = {
      method: 'GET',
      timeout: 100000
    };

    fetch(url, requestOptions).then(response => {
      setLoadingResponse(false);

      let updateChat = [...currentChat, {"text": "", "type": "response"}];
      setChat(updateChat)

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      reader.read().then(function processText({ done, value }) {
        if (done) {
          console.log('Stream complete');
          setCatTalking(false);
          return;
        } else {
          setCatTalking(true);
        }

        buffer += decoder.decode(value, { stream: true });
        setChat([...currentChat, {"text": buffer, "type": "response"}])

        return reader.read().then(processText);
      });
    })
  }

  function handleChatEnterSubmit(event) {
    event.preventDefault();
    sendPrompt(prompt);
    setPrompt("");
  }

  React.useEffect(() => {
    const checkEndpoint = async () => {
      try {
        const response = await fetch('/api/healthcheck');
        const responseText = await response.text();
        if (response.ok && responseText.trim() === 'Healthy') {
          setModelIsLoaded(true);
        } else {
          throw new Error('Endpoint not ready');
        }
      } catch (error) {
        console.log('Endpoint not ready, retrying...');
        setTimeout(checkEndpoint, 5000); // Retry after 5 seconds
      }
    };

    checkEndpoint();
  }, []);

  React.useEffect(() => {
    const updateImageStyle = () => {
      setImageStyle({ width: `${Math.ceil(window.innerWidth * 0.0643)}px`, height: 'auto' });
      setModelStyle({ width: `${Math.ceil(window.innerWidth * 0.0366)}px`, height: 'auto' });
      setImagePos({ position: "absolute", bottom: Math.ceil((window.innerHeight * 0.1142)), left: Math.ceil(window.innerWidth * 0.0257) });
    };

    const updateFontSize = () => {
      setFontSize(window.innerWidth < 615 ? `${Math.ceil(window.innerWidth * 0.026)}px` : '16px');
    };

    const updateTextFieldHeight = () => {
      setTextFieldHeight(window.innerWidth < 615 ? Math.ceil(Math.ceil(window.innerWidth * 0.0366) * 10) / 10 : 22.5);
    };

    window.addEventListener('resize', updateImageStyle);
    window.addEventListener('resize', updateFontSize);
    window.addEventListener('resize', updateTextFieldHeight);
    updateImageStyle(); // Set the initial size
    updateFontSize(); // Set the initial font size
    updateTextFieldHeight(); // Set the initial text field height

    return () => {
      window.removeEventListener('resize', updateImageStyle);
      window.removeEventListener('resize', updateFontSize);
      window.removeEventListener('resize', updateTextFieldHeight);
    }
  }, []);

  if (!modelIsLoaded) {
    return (
      <ThemeProvider theme={appTheme}>
        <CssBaseline enableColorScheme />
        <div className="App">
          <Box sx={{display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100%'}}>
            <h1>Loading...</h1>
            <p>Please wait while we connect to the model</p>
          </Box>
        </div>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider theme={appTheme}>
      <CssBaseline enableColorScheme />
      <div className="App">
        <Box sx={imagePos}>
        {catTalking && <img src={catPop} alt="Cat Talking" style={imageStyle} />}
          {!catTalking && <img src={catSilent} alt="Cat Silent" style={imageStyle} />}
        </Box>
        <Box sx={{display: 'flex', justifyContent: 'center'}}>
          <Box sx={{display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', width: '80%'}}>
            <Box sx={{display: 'flex', flexDirection: 'row', alignItems: 'center'}}>
              <p className='header' style={{ fontSize: fontSize }}>LLM Provider:</p>
              <p className='text' style={{ fontSize: fontSize }}>Ollama</p>
            </Box>
            <Box sx={{display: 'flex', flexDirection: 'row', alignItems: 'center'}}>
              <Box sx={{display: 'flex', flexDirection: 'row', alignItems: 'center', marginTop: 2.5}}>
                <img src={deepseek} alt="Model Image" style={modelStyle} />
              </Box>
              <Box sx={{display: 'flex', flexDirection: 'column', justifyContent: 'right', paddingLeft: 1, marginBottom: 0}}>
                <Box sx={{display: 'flex', flexDirection: 'row', alignItems: 'center'}}>
                  <p className='header' style={{ fontSize: fontSize }}>LLM Model:</p>
                  <p className='text' style={{ fontSize: fontSize }}>deepseek-r1</p>
                </Box>
                <Box sx={{marginTop: 0}}>
                  <FormControl variant="standard" fullWidth size="small">
                    <Select
                      labelId="model-dropdown"
                      id="model-propdown-id"
                      value={model}
                      label='model type'
                      onChange={handleChange}
                    >
                      <MenuItem value='1.5b'>1.5b</MenuItem>
                    </Select>
                  </FormControl>
                </Box>
              </Box>
            </Box>
          </Box>
        </Box>
        <Box 
          id="chat-div" 
          sx={{
            width: '80%', 
            height: '70%', 
            marginTop: 1, 
            backgroundColor: 'black', 
            marginLeft: 'auto', 
            marginRight: 'auto', 
            display: 'flex', 
            flexDirection: 'column', 
            overflow: 'auto'
            }}
        >
          {chat.map((item, index) => (
            <Box 
              key={index} 
              sx={{
                marginLeft: item.type === "prompt" ? 'auto' : 1, 
                marginRight: item.type === "prompt" ? 1 : 'auto', 
                marginTop: 1,
                marginBottom: 1,
                padding: 1.5,
                backgroundColor: item.type === "prompt" ? 'teal' : 'indigo',
                borderRadius: 5,
                maxWidth: '70%',
                fontSize: fontSize
              }}
            >
                {item.text}
            </Box>
          ))}
          <AlwaysScrollToBottom />
        </Box>
        <form onSubmit={handleChatEnterSubmit}>
          <Box id="textfield-div" sx={{backgroundColor: 'black', width: '80%', marginLeft: 'auto', marginRight: 'auto'}}>
            {loadingResponse && <LinearProgress />}
            <TextField 
              id="api-textfield" 
              label="Prompt..." 
              value={prompt}
              autoComplete='off'
              variant="outlined" 
              color="primary" 
              inputProps={{ style: { fontSize: fontSize, height: textFieldHeight } }} 
              InputLabelProps={{ style: { fontSize: fontSize } }}
              sx={{ width: '100%', marginTop: 'auto' }}
              onChange={(e) => setPrompt(e.target.value)}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => {
                        sendPrompt(prompt);
                        setPrompt("");
                      }}
                      edge="end"
                    >
                      <SendIcon sx={{ fontSize: fontSize }} />
                    </IconButton>
                  </InputAdornment>
                )
              }}    
            />
          </Box>
        </form>
      </div>
    </ThemeProvider>
  );
}

export default App;
