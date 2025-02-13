import express from 'express';
import User from '../models/User.js'; // Adjust the path as needed
import crypto from 'crypto';
import CryptoJS from 'crypto-js';
import LoginUsers from '../models/LoginUsers.js'; 
import UserCounter from '../models/UserCounter.js';
import LoginCounter from '../models/LoginCounter.js';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

const router = express.Router();
const encryptionKey = 'mysecretkey'; // Secret key used for encryption and decryption
const secretKey = '12345'; // Replace with your actual key

dotenv.config(); // Load environment variables from .env file

const internalURL = process.env.REACT_APP_API_BASE_URL_FOR_INTERNAL ;

// Function to decrypt data (adjusted for your current encryption scheme)
const decryptData = (encryptedText) => {
  if (!encryptedText) {
    return null; // Handle empty or null data
  }

  try {
    // Decrypt using the same secret key as used in encryption
    const bytes = CryptoJS.AES.decrypt(encryptedText, secretKey);
    const decryptedData = bytes.toString(CryptoJS.enc.Utf8);
    return decryptedData || null;
  } catch (error) {
    console.error('Decryption error:', error);
    return null;
  }
};


// Function to send email with login details and reset token
const sendLoginEmail = async (adminEmail, password) => {
    try {
      console.log(password);
      const token = jwt.sign({ email: adminEmail }, encryptionKey, { expiresIn: '1h' }); // Generate a token
  
      const transporter = nodemailer.createTransport({
        service: 'gmail', // or your email provider
        auth: {
          user: 'admin@hylapps.com',
          pass: 'ngsl cgmz pnmt uiux',
        },
      });
  
      const mailOptions = {
        from: 'admin@hylapps.com',
        to: adminEmail,
        subject: 'Your GreenHyla Account Details',
        text: `Welcome! Your account has been created. 
Email: ${adminEmail}
Temporary Password: ${password}
    
URL Link to GreenHyla: ${internalURL}

Thank You,
HYLA Admin`,
      };
    
      await transporter.sendMail(mailOptions);
      console.log('Login email sent successfully.');
    } catch (error) {
      console.error('Error sending email:', error);
    }
  };
    
  router.post('/create', async (req, res) => {
    try {

      const userCounter = await UserCounter.findOneAndUpdate(
        {},
        { $inc: { userId: 1 } },
        { new: true, upsert: true }
      );




      const loginCounter = await LoginCounter.findOneAndUpdate(
        {},
        { $inc: { seq: 1 } },
        { new: true, upsert: true }
      );
    
    
      let loginUserId;

      // Determine loginUserId based on userType
      if (req.body.userType === 'hyla admin') {
        loginUserId = `HYLA${loginCounter.seq}`;
      } else if (req.body.userType === 'organizational user' && req.body.orgId) {
        loginUserId = `HYLA${loginCounter.seq}_${req.body.orgId}`;
      } else if (req.body.userType === 'guest') {
        loginUserId = `HYLA${loginCounter.seq}_GUEST${userCounter.userId}`;
      }
  
      // Function to generate a random alphanumeric string
function generateRandomString(length) {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}
  
      const newUserData = {
        ...req.body,
        userId: userCounter.userId,
      };
  
      // Set orgId based on user type
      if (req.body.userType === 'organizational user' && req.body.orgId) {
        newUserData.orgId = `${req.body.orgId}`;
      } else {
        newUserData.orgId = null; // Adjust as necessary
      }
  
      const newUser = new User(newUserData);
     
      const randomtext = generateRandomString(10);
      // const hashedPassword = CryptoJS.SHA256(decryptData(randomtext)).toString();
      const hashedPassword = CryptoJS.SHA256(randomtext).toString();

      const OrgUserAndGuest = new LoginUsers({
        loginUserId,
        role: newUser.userType,
        email: decryptData(newUser.userEmail),
        password: hashedPassword,
      });
  
      await OrgUserAndGuest.save();
      await newUser.save();
      await sendLoginEmail(decryptData(newUser.userEmail), randomtext);
  
      res.status(201).json({ message: 'User created and email sent successfully', user: newUser });
    } catch (error) {
      if (error.code === 11000 && error.keyPattern.email) {
        // Handle duplicate email error
        res.status(400).json({ message: 'Email already exists!' });
      } else {
        // Handle other errors
        res.status(500).json({ message: 'Error creating User or sending email.', error: error.message });
      }
    }
  });






 router.post('/create-guest-account', async (req, res) => {
  try {

    const userCounter = await UserCounter.findOneAndUpdate(
      {},
      { $inc: { userId: 1 } },
      { new: true, upsert: true }
    );




    const loginCounter = await LoginCounter.findOneAndUpdate(
      {},
      { $inc: { seq: 1 } },
      { new: true, upsert: true }
    );
  
  
    let loginUserId;

    if (req.body.userType === 'guest') {
      loginUserId = `HYLA${loginCounter.seq}_GUEST${userCounter.userId}`;
    }

    // Function to generate a random alphanumeric string
function generateRandomString(length) {
const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
let result = '';
const charactersLength = characters.length;
for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
}
return result;
}

    

  

    const newUser = new User({
      userId: userCounter.userId,
      ...req.body,
     
    });
   
    const randomtext = generateRandomString(10);
    // const hashedPassword = CryptoJS.SHA256(decryptData(randomtext)).toString();
    const hashedPassword = CryptoJS.SHA256(randomtext).toString();

    const OrgUserAndGuest = new LoginUsers({
      loginUserId,
      role: newUser.userType,
      email: newUser.userEmail,
      password: hashedPassword,
    });
   
    await OrgUserAndGuest.save();
    
    await newUser.save();
 

    await sendLoginEmail(newUser.userEmail, randomtext);
    
    res.status(201).json({ message: 'Guest User created and email sent successfully', user: newUser });
  } catch (error) {
    if (error.code === 11000 && error.keyPattern.email) {
      // Handle duplicate email error
      res.status(400).json({ message: 'Email already exists!' });
    } else {
      // Handle other errors
      res.status(500).json({ message: 'Error creating Guest User or sending email.', error: error.message });
    }
  }
});
  

// @desc Verify the password reset token
// @route GET /api/organizations/verify-token
// @access Public
router.get('/verify-token', (req, res) => {
    const { token } = req.query;
  
    if (!token) {
      return res.status(400).json({ message: 'Token is required' });
    }
  
    jwt.verify(token, encryptionKey, (err, decoded) => {
      if (err) {
        return res.status(401).json({ message: 'Invalid or expired token' });
      }
  
      // Token is valid
      res.json({ message: 'Token is valid', email: decoded.email });
    });
  });



// Get organization data and decrypt sensitive fields
router.get('/getData', async (req, res) => {
  try {
    let organizations = await User.find(); // Fetch data from the database

    // Decrypt necessary fields for each organization
    organizations = organizations.map(org => ({
      ...org._doc,
      contactEmail: decryptData(org.contactEmail),
      userEmail: decryptData(org.userEmail),
      userContactNumber: decryptData(org.userContactNumber),
      // Decrypt other fields as needed
    }));

    res.status(200).json(organizations);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving data', error: error.message });
  }
});


export default router; 
