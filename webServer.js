/**
 * Project 2 Express server connected to MongoDB 'project2'.
 * Start with: node webServer.js
 * Client uses axios to call these endpoints.
 */

// eslint-disable-next-line import/no-extraneous-dependencies
import mongoose from "mongoose";
// eslint-disable-next-line import/no-extraneous-dependencies
import bluebird from "bluebird";
import express from "express";
import session from "express-session";
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import multer from "multer";
import path from "path";

// ToDO - Your submission should work without this line. Comment out or delete this line for tests and before submission!
// import models from "./modelData/photoApp.js";

// Load the Mongoose schema for User, Photo, and SchemaInfo
// ToDO - Your submission will use code below, so make sure to uncomment this line for tests and before submission!
import User from "./schema/user.js";
import Photo from "./schema/photo.js";
import SchemaInfo from "./schema/schemaInfo.js";

const portno = 3001; // Port number to use
const app = express();

const __filename2 = fileURLToPath(import.meta.url);
const __dirname2 = path.dirname(__filename2);

// Enable CORS for all routes with credentials
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', 'http://localhost:5173');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

// Session middleware
app.use(session({
  secret: 'secretKey',
  resave: false,
  saveUninitialized: false,
}));

// JSON body parser
app.use(express.json());

mongoose.Promise = bluebird;
mongoose.set("strictQuery", false);
mongoose.connect("mongodb://127.0.0.1/project3", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// We have the express static module
// (http://expressjs.com/en/starter/static-files.html) do all the work for us.
app.use(express.static(__dirname));

app.use("/images", express.static(path.join(__dirname2, "images")));


app.get("/", function (request, response) {
  response.send("Simple web server of files from " + __dirname);
});

/**
 * Authentication middleware - checks if user is logged in
 */
const requireAuth = (req, res, next) => {
  if (!req.session.user_id) {
    return res.status(401).send('Unauthorized');
  }
  return next();
};

app.post('/user', async (req, res) => {
  const { login_name, password, first_name, last_name, location, description, occupation } = req.body;

  if (!login_name || login_name.trim() === "") {
    return res.status(400).send("Login name is required");
  }
  if (!first_name || !last_name) {
    return res.status(400).send("First and last name are required");
  }
  if (!password || password.trim() === "") {
    return res.status(400).send("Password cannot be empty");
  }

  const existing = await User.findOne({ login_name }).exec();
  if (existing) {
    return res.status(400).send("Login name already exists");
  }

  try {
    const newUser = await User.create({
      login_name,
      password,
      first_name,
      last_name,
      location: location || "",
      description: description || "",
      occupation: occupation || "",
    });

    return res.status(200).send({
      _id: newUser._id,
      login_name: newUser.login_name,
    });

  } catch (err) {
    return res.status(500).send("Error creating user");
  }
});


/**
 * POST /admin/login - Login endpoint
 */
app.post('/admin/login', async (req, res) => {
  const { login_name, password } = req.body;

  const user = await User.findOne({ login_name }).exec();
  if (!user) {
    return res.status(400).send('Invalid login_name');
  }

  // If user has a password, enforce matching
  if (user.password && user.password !== password) {
    return res.status(400).send('Invalid password');
  }

  // Set session
  req.session.user_id = user._id;

  return res.status(200).send({
    _id: user._id,
    first_name: user.first_name,
    last_name: user.last_name,
  });
});



/**
 * POST /admin/logout - Logout endpoint
 */
app.post('/admin/logout', (request, response) => {
  if (!request.session.user_id) {
    return response.status(400).send('No user logged in');
  }

  request.session.destroy((err) => {
    if (err) {
      return response.status(500).send('Logout failed');
    }
    return response.status(200).send('Logged out successfully');
  });
});

/**
 * /test/info - Returns the SchemaInfo object of the database in JSON format.
 *              This is good for testing connectivity with MongoDB.
 */

app.get('/test/info', async (request, response) => {
  try {
    const info = await SchemaInfo.findOne({});
    if (!info) {
      return response.status(404).send("SchemaInfo not found");
    }
    return response.status(200).send(info);
  } catch (err) {
    return response.status(500).send(JSON.stringify(err));
  }
});


/**
 * /test/counts - Returns an object with the counts of the different collections
 *                in JSON format.
 */


app.get('/test/counts', async (request, response) => {
  try {
    const userCount = await User.countDocuments({});
    const photoCount = await Photo.countDocuments({});
    const schemaCount = await SchemaInfo.countDocuments({});

    return response.status(200).send({
      user: userCount,
      photo: photoCount,
      schemaInfo: schemaCount
    });
  } catch (err) {
    return response.status(500).send(JSON.stringify(err));
  }
});

/**
 * URL /user/list - Returns all the User objects.
 */
app.get('/user/list', requireAuth, async (request, response) => {
  try {
    const users = await User.find({}, '_id first_name last_name').exec();
    return response.status(200).send(users);
  } catch (err) {
    return response.status(500).send(JSON.stringify(err));
  }
});

/**
 * URL /user/:id/commentCounts - Returns photo and comment counts for a user
 * IMPORTANT: This must come BEFORE /user/:id route
 */
app.get('/user/:id/commentCounts', requireAuth, async (request, response) => {
  const userId = request.params.id;

  try {
    // Verify user exists
    const user = await User.findById(userId).exec();
    if (!user) {
      return response.status(400).send("User not found");
    }

    // Count photos by this user
    const photoCount = await Photo.countDocuments({ user_id: userId }).exec();

    // Count comments by this user (across all photos)
    const allPhotos = await Photo.find({}, 'comments').exec();
    let commentCount = 0;

    allPhotos.forEach(photo => {
      if (photo.comments) {
        commentCount += photo.comments.filter(
          comment => comment.user_id.toString() === userId
        ).length;
      }
    });

    return response.status(200).send({
      photoCount,
      commentCount
    });
  } catch (err) {
    return response.status(400).send("Error fetching counts");
  }
});



/**
 * URL /commentsOfUser/:id - Returns all comments made by a user
 */
app.get('/commentsOfUser/:id', requireAuth, async (request, response) => {
  const userId = request.params.id;

  try {
    // Verify user exists
    const user = await User.findById(userId).exec();
    if (!user) {
      return response.status(400).send("User not found");
    }

    // Find all photos that have comments by this user
    const allPhotos = await Photo.find({ 'comments.user_id': userId }).exec();

    const userComments = [];

    allPhotos.forEach(photo => {
      if (photo.comments) {
        photo.comments.forEach(comment => {
          if (comment.user_id.toString() === userId) {
            userComments.push({
              _id: comment._id,
              comment: comment.comment,
              date_time: comment.date_time,
              photo: {
                _id: photo._id,
                file_name: photo.file_name,
                user_id: photo.user_id
              }
            });
          }
        });
      }
    });

    return response.status(200).send(userComments);
  } catch (err) {
    return response.status(400).send("Error fetching user comments");
  }
});

/**
 * URL /user/:id - Returns the information for User (id).
 * IMPORTANT: This must come AFTER /user/:id/commentCounts route
 */
app.get('/user/:id', requireAuth, async (request, response) => {
  const userId = request.params.id;

  try {
    const user = await User.findById(userId, '_id first_name last_name location description occupation').exec();

    if (!user) {
      return response.status(400).send("User not found");
    }

    return response.status(200).send(user);
  } catch (err) {
    return response.status(400).send("Invalid user ID");
  }
});

/**
 * URL /photosOfUser/:id - Returns the Photos for User (id).
 */
app.get('/photosOfUser/:id', requireAuth, async (request, response) => {
  const userId = request.params.id;

  try {
    // First verify the user exists
    const user = await User.findById(userId).exec();

    if (!user) {
      return response.status(400).send("User not found");
    }

    // Fetch photos for this user
    const photos = await Photo.find({ user_id: userId }, '_id user_id file_name date_time comments').exec();  

    // Process photos to populate comment user information
    const photosWithComments = await Promise.all(
      photos.map(async (photo) => {
        const photoObj = photo.toObject();

        if (photoObj.comments && photoObj.comments.length > 0) {
          // Fetch user info for each comment
          photoObj.comments = await Promise.all(
            photoObj.comments.map(async (comment) => {
              try {
                const commentUser = await User.findById(comment.user_id, '_id first_name last_name').exec();
                return {
                  _id: comment._id,
                  comment: comment.comment,
                  date_time: comment.date_time,
                  user: commentUser ? commentUser.toObject() : null
                };
              } catch (err) {
                // Handle invalid user_id in comment
                return {
                  _id: comment._id,
                  comment: comment.comment,
                  date_time: comment.date_time,
                  user: null
                };
              }
            })
          );
        } else {
          photoObj.comments = [];
        }

        return photoObj;
      })
    );

    return response.status(200).send(photosWithComments);
  } catch (err) {
    console.error("Error in /photosOfUser/:id:", err);
    return response.status(400).send("Invalid user ID or error fetching photos");
  }
});


/**
 * POST /commentsOfPhoto/:photo_id
 */
app.post('/commentsOfPhoto/:photo_id', requireAuth, async (req, res) => {
  const photoId = req.params.photo_id;
  const { comment } = req.body;

  if (!comment || comment.trim().length === 0) {
    return res.status(400).send("Empty comment not allowed");
  }

  try {
    const photo = await Photo.findById(photoId).exec();
    if (!photo) {
      return res.status(400).send("Photo not found");
    }

    const newComment = {
      comment: comment,
      date_time: new Date(),
      user_id: req.session.user_id
    };

    photo.comments.push(newComment);
    await photo.save();

    res.status(200).send(newComment);
  } catch (err) {
    res.status(500).send("Error adding comment");
  }
});

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname2, "images"));
  },
  filename: function (req, file, cb) {
    // Use the original filename to pass the test
    const uniqueName = `photo_${Date.now()}_${file.originalname}`;
    cb(null, uniqueName);
  },
});

const upload = multer({ storage: storage });


app.post('/photos/new', requireAuth, upload.single('uploadedphoto'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).send("No file uploaded");
    }

    const newPhoto = await Photo.create({
      file_name: req.file.filename,
      date_time: new Date(),
      user_id: req.session.user_id,
      comments: [],
    });

    return res.status(200).send({
      _id: newPhoto._id,
      file_name: newPhoto.file_name,
      date_time: newPhoto.date_time,
      user_id: newPhoto.user_id,
      comments: []
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Upload failed");
  }
});





const server = app.listen(portno, function () {
  const port = server.address().port;
  console.log(
    "Listening at http://localhost:" +
    port +
    " exporting the directory " +
    __dirname
  );
});
