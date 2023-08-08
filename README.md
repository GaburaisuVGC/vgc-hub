# VGC Hub

VGC Hub is a web application built using the MERN (MongoDB, Express.js, React, Node.js) stack. It serves as a platform for Pokémon VGC players to connect, discuss, and share things about tips, events or anything else. I started this project in order to progress as a software engineer.

## Table of Contents

1. [Introduction](#introduction)
2. [Installation](#installation)
3. [Usage](#usage)
4. [Contributing](#contributing)

## Introduction

VGC Hub is a full-stack web application developed using the MERN stack. It provides users with a platform to engage with other Pokémon VGC players or enthusiasts, share their experiences, and discuss about anything. The project was initiated to create a community-driven space for VGC players to connect and discuss, but also for myself, in order to progress as a software engineer.

### Technologies Used

- Frontend: React.js
- Backend: Node.js, Express.js
- Database: MongoDB

## Installation

### Frontend

1. Clone the repository:
   ```sh
   git clone https://github.com/GaburaisuVGC/vgc-hub.git
2. Navigate to the project directory:
    ```sh
    cd vgc-hub
3. Install the dependencies:
    ```sh
    npm install
4. Create a .env file in the root directory and add the following environment variable:
    ```env
    REACT_APP_API_BASE_URL=Your backend URL
    REACT_APP_MAX_FILE_SIZE=10485760
### Backend

1. Clone the repository:
    ```sh
    git clone https://github.com/GaburaisuVGC/vgc-hub.git
2. Navigate to the project directory:

    ```sh
    cd vgc-hub-api
3. Install the dependencies:
    ```sh
    npm install
4. Create a .env file in the root directory and add the following environment variables:
    ```env
    BACKEND_PORT=Your Express port
    MONGODB_URI=Your MongoDB URI
    MAIL_PASSWORD=Password of the sender of your mails
    MAIL_EMAIL=Email of the sender of your mails
    EMAIL_VERIFICATION_SECRET=Put a secret here
    CLIENT_URL=Your Frontend URL
    JWT_SECRET=Put a secret here
## Usage

### Frontend

1. Navigate to the frontend directory:

    ```sh
    cd vgc-hub
2. Start the development server:

    ```sh
    npm start
3. Access the frontend in your browser at http://localhost:3000.

### Backend

1. Navigate to the backend directory:
    ```sh
    cd vgc-hub-backend
2. Start the Node.js server:
    ```sh
    npm start
## Contributing
Contributions are welcome! If you'd like to contribute to VGC Hub, please contact me on Discord (@gaburaisu).