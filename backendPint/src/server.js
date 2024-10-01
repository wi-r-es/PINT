const express = require('express');
const cors = require('cors');
const path = require('path');
const logger = require('morgan');
const { Client } = require('pg');

const app = express();
//require('dotenv').config();

const { sendNotificationToTopic } = require("./utils/realTimeNotifications");

//por a correr 1 vez unica
//const {server} = require('./websockets');






const uploadRoute = require('./routes/uploadRoute');

const categoryRoutes = require('./routes/static_contentRoutes');
const forumRoutes = require('./routes/forumRoutes');
const postRoutes = require('./routes/postRoutes');
const eventRoutes = require('./routes/eventRoutes');
const mediaRoutes = require('./routes/mediaRoutes');
const ratingRoutes = require('./routes/ratingRoutes');
const adminRoutes = require('./routes/adminRoutes');
const formsRoutes = require('./routes/formsRoutes');
const commentsRoutes = require('./routes/commentsRoutes');
const userRoutes = require('./routes/userRoutes');
const dynamicRoutes = require('./routes/dynamic_contentRoutes');
const notificationsRoutes = require('./routes/notificationRoutes');
const authRoutes = require('./routes/authRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const warningsRoutes = require('./routes/warningsRoutes');



//middleware
app.set('port', process.env.PORT || 8000);
app.use(logger('dev'));

app.use(cors()); 
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Authorization, X-API-KEY, Origin, X-Requested-With, Content-Type, Accept, Access-Control-Allow-Request-Method');
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    next();
});

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

         

//API
app.use('/api/categories', categoryRoutes);
app.use('/api/forum', forumRoutes);
app.use('/api/post', postRoutes);
app.use('/api/event', eventRoutes);
app.use('/api/media', mediaRoutes);
app.use('/api/rating', ratingRoutes);
app.use('/api/administration', adminRoutes);
app.use('/api/form', formsRoutes);
app.use('/api/comment', commentsRoutes);
app.use('/api/user', userRoutes);
app.use('/api/dynamic', dynamicRoutes);
app.use('/api/notification', notificationsRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/upload', uploadRoute);
app.use('/api/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/api/warnings', warningsRoutes);






// Initialize PostgreSQL Client for LISTEN/NOTIFY
const pgClient = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false, // Disable SSL in non-production environments
});

// Connect to PostgreSQL
pgClient.connect((err) => {
  if (err) {
      console.error('Error connecting to the database:', err.stack);
  } else {
      console.log('Successfully connected to the PostgreSQL database.');
  }
});

// Listen for the 'content_validated' notifications from PostgreSQL
pgClient.query('LISTEN content_validated', (err) => {
  if (err) {
      console.error('Error starting LISTEN on content_validated:', err.stack);
  } else {
      console.log('Listening for content_validated notifications...');
  }
});

pgClient.on('notification', async (msg) => {
    const payload = msg.payload.split(','); // Format: 'content_title,topic_name,content_type'
    const contentTitle = payload[0];
    const topicName = payload[1];
    const contentType = payload[2];

    console.log(`Content titled "${contentTitle}" validated in subarea "${topicName}" of type ${contentType}`);

    await sendNotificationToTopic(
      topicName,  // Topic name
      `New ${contentType} in your subscriptions topics`, // Notification title
      `${contentTitle}, was created in ${topicName}`, // Notification body
    );

    


});

pgClient.on('error', (err) => {
    console.error('Error in PostgreSQL client:', err);
});


app.listen(app.get('port'), () => {
    console.log("Server started on port " + app.get('port'));
    //console.log(process.env.ENCRYPTION_KEY);
});

// server.listen(5000, () => {
//     console.log("WebSocket server started on port 5000");
// });

