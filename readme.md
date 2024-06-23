<!-- this is readme -->

<h1> Backend of social media app</h1>
# Social Media App

## Overview

Welcome to the **Social Media App**! This project is a powerful and dynamic social media platform that combines the features of Twitter and YouTube. It is built using Node.js, Express.js, and MongoDB, offering robust backend support to handle a variety of social media functionalities.

## Features

- **User Authentication**: Secure login and registration system.
- **Post Creation**: Users can create, edit, and delete text posts and videos.
- **Feed**: Dynamic feed displaying posts from followed users.
- **Likes and Comments**: Interactive features to engage with posts.
- **Notifications**: Real-time notifications for user activities.
- **Search**: Advanced search functionality to find users and content.
- **Profile Management**: Customizable user profiles.

## Tech Stack

- **Backend**: Node.js, Express.js
- **Database**: MongoDB
- **Tools**: Visual Studio Code (VSCode), Postman for API testing
- **Other Technologies**: JWT for authentication, Mongoose for MongoDB interactions, Multer for file uploads

## Installation

1. **Clone the repository**
    ```bash
    git clone https://github.com/yourusername/social-media-app.git
    cd social-media-app
    ```

2. **Install dependencies**
    ```bash
    npm install
    ```

3. **Create a `.env` file in the root directory and add the following variables**
    ```plaintext
    PORT=3000
    MONGODB_URI=your_mongodb_uri
    JWT_SECRET=your_secret_key
    ```

4. **Start the application**
    ```bash
    npm start
    ```

## API Endpoints

### Auth

- **POST /api/auth/register**: Register a new user
- **POST /api/auth/login**: Login an existing user

### Users

- **GET /api/users**: Get all users
- **GET /api/users/:id**: Get a specific user
- **PUT /api/users/:id**: Update a user
- **DELETE /api/users/:id**: Delete a user

### Posts

- **GET /api/posts**: Get all posts
- **GET /api/posts/:id**: Get a specific post
- **POST /api/posts**: Create a new post
- **PUT /api/posts/:id**: Update a post
- **DELETE /api/posts/:id**: Delete a post

### Comments

- **POST /api/posts/:id/comments**: Add a comment to a post
- **DELETE /api/posts/:postId/comments/:commentId**: Delete a comment from a post

### Likes

- **POST /api/posts/:id/like**: Like a post
- **POST /api/posts/:id/unlike**: Unlike a post

## Contributing

Contributions are welcome! Please fork the repository and create a pull request with your changes.

## License

This project is licensed under the MIT License. See the file for details.

## Contact

Feel free to reach out if you have any questions or suggestions!

- **Email**: ayushempire03@gmail.com
- **GitHub**: [hubofayush](https://github.com/hubofayush)

