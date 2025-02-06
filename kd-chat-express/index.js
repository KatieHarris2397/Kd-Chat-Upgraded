const express = require("express");
const axios = require('axios');
const cors = require('cors');
const path = require('path');

require('dotenv').config()

const app = express();
app.use(cors());
app.use(express.json())
app.use(express.static(path.join(__dirname, "build")))

const PORT = 3000;

app.listen(PORT, () => console.log(`server running on port ${PORT}`));

app.get('/api/healthcheck', (req,res) => {
    try {
        axios({
            method: 'get',
            url: process.env.REACT_APP_API_URL,
        })
        .then((response) => {
            if (response.data === 'Ollama is running') {
                res.send('Healthy')
            } else {
                res.send('Unhealthy')
            }
        })
        .catch(err=>{
            console.error(err.response)
            res.sendStatus(400)
        })
    } catch(e) {
        console.error(e)
        res.sendStatus(500)
    }
});

app.get('/api/llm-model', (req,res) => {
    try {
        if (req.query.llmProvider == "localai"){
            axios({
                method: 'post',
                url: process.env.REACT_APP_API_URL + 'v1/chat/completions', //req.query.apiURL + 'v1/chat/completions',
                withCredentials: false,
                //timeout: 100000,
                data: {
                  model: req.query.model,
                  messages: [{
                    role: 'user',
                    content: req.query.prompt,
                    temperature: 0.1
                  }]
                }
            })
            .then((response) => {
                res.send(response.data)
            })
            .catch(err=>{
                console.error(err.response)
                res.sendStatus(400)
            })
        } else if (req.query.llmProvider == "ollama"){
            axios({
                method: 'post',
                url: process.env.REACT_APP_API_URL + '/api/generate', //req.query.apiURL + '/api/generate',
                withCredentials: false,
                responseType: 'stream',
                //timeout: 100000,
                data: {
                  model: req.query.model,
                  prompt: req.query.prompt,
                }
            })
            .then((response) => {
                const stream = response.data
                stream.on('data', data => {
                    //console.log(JSON.parse(data.toString('utf8')).response);
                    res.write(JSON.parse(data.toString('utf8')).response)
                });
                
                stream.on('end', () => {
                    console.log("stream done");
                    res.end()
                })
            })
            .catch(err=>{
                console.error(err.response)
                console.error(JSON.stringify(err))
                res.sendStatus(400)
            })
        }
    } catch(e) {
        console.error(e)
        res.sendStatus(500)
    }
})