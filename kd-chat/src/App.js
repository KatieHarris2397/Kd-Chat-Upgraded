import * as React from 'react';
import axios from 'axios';
import { ThemeProvider, CssBaseline, TextField, InputAdornment, IconButton, Box, LinearProgress } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';

import { appTheme } from "./themes/theme.js";
import './App.css';

function App() {
  const [prompt, setPrompt] = React.useState("");
  const [loadingResponse, setLoadingResponse] = React.useState(false);
  const [chat, setChat] = React.useState([]);

  const AlwaysScrollToBottom = () => {
    const elementRef = React.useRef();
    React.useEffect(() => elementRef.current.scrollIntoView());
    return <div ref={elementRef} />;
  };

  function sendPrompt(prompt) {
    // Add prompt to UI
    var currentChat = chat;
    var currentChat = [...currentChat, {"text": prompt, "type": "prompt"}]
    setChat(currentChat)

    setLoadingResponse(true);

    const url = '/api/llm-model?llmProvider=ollama&model=dolphin-phi&prompt=' + prompt;
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
          return;
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

  return (
    <ThemeProvider theme={appTheme}>
      <CssBaseline enableColorScheme />
      <div className="App">
        <Box sx={{display: 'flex', justifyContent: 'center'}}>
          <Box sx={{display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', width: '80%', marginTop: 6}}>
            <Box sx={{display: 'flex', flexDirection: 'row', alignItems: 'center'}}>
              <p className='header'>LLM Provider:</p>
              <p className='text'>Ollama</p>
            </Box>
            <Box sx={{display: 'flex', flexDirection: 'row', alignItems: 'center'}}>
              <p className='header'>LLM Model:</p>
              <p className='text'>dolphin-phi</p>
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
                marginLeft: item.type == "prompt" ? 'auto' : 1, 
                marginRight: item.type == "prompt" ? 1 : 'auto', 
                marginTop: 1,
                marginBottom: 1,
                padding: 1.5,
                backgroundColor: item.type == "prompt" ? 'teal' : 'indigo',
                borderRadius: 5,
                maxWidth: '50%'
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
              sx={{width: '100%', marginTop: 'auto'}}
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
                      <SendIcon />
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
