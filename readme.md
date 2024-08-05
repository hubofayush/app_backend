# Extended Project Report for Social Media App Backend

## Project Overview
This backend supports a social media platform merging features of Twitter and YouTube, built using Node.js, Express.js, and MongoDB. It aims to provide a scalable, efficient, and secure environment for user interactions, media uploads, and real-time updates.

## Features
- **User Authentication**: Secure login and registration with JWT.
- **Post Creation**: Users can create, edit, and delete text posts and video uploads.
- **Feed**: Real-time feed displaying posts from followed users.
- **Likes and Comments**: Interactive features allowing users to like and comment on posts.
- **Notifications**: Real-time notifications for user activities like likes, comments, and follows.
- **Search**: Advanced search functionality to find users and content quickly.
- **Profile Management**: Customizable user profiles with support for profile pictures and bio updates.

## Tech Stack
- **Backend**: Node.js, Express.js
- **Database**: MongoDB
- **Tools**: Visual Studio Code (VSCode), Postman for API testing
- **Other Technologies**: 
  - **JWT**: For authentication
  - **Mongoose**: For MongoDB interactions
  - **Multer**: For handling file uploads
  - **Cloudinary**: For managing media uploads
  - **Bcrypt.js**: For hashing passwords
  - **Cookie-parser**: For handling cookies

## Installation
1. Clone the repository:
    ```sh
    git clone https://github.com/hubofayush/app_backend.git
    cd app_backend
    ```
2. Install dependencies:
    ```sh
    npm install
    ```
3. Create a `.env` file in the root directory and add the following variables:
    ```env
    PORT=3000
    MONGODB_URI=your_mongodb_uri
    JWT_SECRET=your_secret_key
    CLOUDINARY_URL=your_cloudinary_url
    ```
4. Start the application:
    ```sh
    npm start
    ```

## API Endpoints

### Auth
- **POST /api/auth/register**: Register a new user.
- **POST /api/auth/login**: Login an existing user.

### Users
- **GET /api/users**: Get all users.
- **GET /api/users/:id**: Get a specific user.
- **PUT /api/users/:id**: Update a user.
- **DELETE /api/users/:id**: Delete a user.

### Posts
- **GET /api/posts**: Get all posts.
- **GET /api/posts/:id**: Get a specific post.
- **POST /api/posts**: Create a new post.
- **PUT /api/posts/:id**: Update a post.
- **DELETE /api/posts/:id**: Delete a post.

### Comments
- **POST /api/posts/:id/comments**: Add a comment to a post.
- **DELETE /api/posts/:postId/comments/:commentId**: Delete a comment from a post.

### Likes
- **POST /api/posts/:id/like**: Like a post.
- **POST /api/posts/:id/unlike**: Unlike a post.

### Notifications
- **GET /api/notifications**: Get all notifications for the authenticated user.
- **PUT /api/notifications/:id/mark-as-read**: Mark a notification as read.

### Search
- **GET /api/search?query=keyword**: Search for users or posts containing the keyword.

## Database Schema

### User
- **_id**: ObjectId
- **username**: String
- **email**: String
- **password**: String
- **profilePicture**: String
- **bio**: String
- **followers**: Array of ObjectIds
- **following**: Array of ObjectIds
- **createdAt**: Date
- **updatedAt**: Date

### Post
- **_id**: ObjectId
- **userId**: ObjectId (reference to User)
- **content**: String
- **mediaUrl**: String (optional, for video uploads)
- **likes**: Array of ObjectIds (reference to User)
- **comments**: Array of Comment subdocuments
- **createdAt**: Date
- **updatedAt**: Date

### Comment
- **_id**: ObjectId
- **userId**: ObjectId (reference to User)
- **postId**: ObjectId (reference to Post)
- **content**: String
- **createdAt**: Date
- **updatedAt**: Date

### Notification
- **_id**: ObjectId
- **userId**: ObjectId (reference to User receiving the notification)
- **type**: String (e.g., 'like', 'comment', 'follow')
- **content**: String
- **isRead**: Boolean
- **createdAt**: Date

## Contributing
Contributions are welcome! Please fork the repository and create a pull request with your changes. Follow the existing code style and include tests for new features.

## License
This project is licensed under the MIT License.

## Contact
For any questions or suggestions, please reach out:
- **Email**: ayushempire03@gmail.com
- **GitHub**: [hubofayush](https://github.com/hubofayush)

For more details, visit the [GitHub repository](https://github.com/hubofayush/app_backend).
