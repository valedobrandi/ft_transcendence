#!bin/bash

docker run -p 5173:5173 -v $(pwd):/app pong-game
