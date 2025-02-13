import express from 'express';
import CryptoJS from 'crypto-js';
import Organization from '../models/Organization.js'; 
import LoginUsers from '../models/LoginUsers.js'; 
import multer from 'multer';
import path from 'path'; // Import the path module
import mongoose from 'mongoose';
import nodemailer from 'nodemailer';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import LoginCounter from '../models/LoginCounter.js';
import AisSatPull from '../models/AisSatPull.js';



const internalURL = process.env.REACT_APP_API_BASE_URL_FOR_INTERNAL ;
// Load environment variables from .env file
dotenv.config();

const router = express.Router();
const app = express();

// Configure multer to use diskStorage, which allows control over filenames
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // Save files to the 'uploads' folder
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname); // Use original file name
  }
});


// File filter to validate the types
const fileFilter = (req, file, cb) => {
  const filetypes = /jpeg|jpg|png|gif|pdf|mp4|doc|docx|xls|xlsx|txt|csv|svg/;
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = filetypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Error: File type not supported!'), false);
  }
};

// Limit file size to 100MB
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 100 * 1024 * 1024 }, // 100MB file size limit
});



const encryptionKey = 'mysecretkey';

// Helper to encrypt data
const encryptData = (data) => CryptoJS.AES.encrypt(data, encryptionKey).toString();

const decryptData = (encryptedData) => {
  try {
    // console.log('Attempting to decrypt:', encryptedData); // Log the encrypted data
    const bytes = CryptoJS.AES.decrypt(encryptedData, encryptionKey);
    const decrypted = bytes.toString(CryptoJS.enc.Utf8);
    // console.log('Decrypted data:', decrypted ? decrypted : 'Unable to decrypt');
    return decrypted;
  } catch (error) {
    console.error('Decryption error:', error.message);
    return null;
  }
};




// Counter model for managing orgId sequences
const counterSchema = new mongoose.Schema({
  _id: { type: String, required: true }, // This will hold the collection name
  seq: { type: Number, default: 555 } // Start from 555
});

const Counter = mongoose.model('Counter', counterSchema);

// Function to get the next sequence number for orgId
const getNextSequence = async (seqName) => {
  const sequenceDocument = await Counter.findByIdAndUpdate(
    { _id: seqName },
    { $inc: { seq: 1 } },
    { new: true, upsert: true } // Create if it doesn't exist
  );

  return sequenceDocument.seq;
};

// Function to reset the counter to start from 555
const resetCounter = async () => {
  await Counter.findByIdAndUpdate(
    { _id: 'orgId' },
    { seq: 555 },
    { upsert: true }
  );
};







// Function to send email with login details and reset token
const sendLoginEmail = async (adminEmail, password) => {
  try {
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
      subject: 'Your Organization Admin Account Details',
      text: `Welcome! Your account has been created.
Email: ${adminEmail}
Temporary Password: ${password}

URL Link to GreenHyla: ${internalURL}

Thank You,
HYLA Admin
`,
    };

    await transporter.sendMail(mailOptions);
    console.log('Login email sent successfully.');
  } catch (error) {
    console.error('Error sending email:', error);
  }
};



// @desc Create a new organization
// @route POST /api/organizations
// @access Public


router.post('/create', upload.array('files'), async (req, res) => {
  const {companyTitle, companyName, address, contactEmail, assignShips, adminFirstName, adminLastName, adminEmail, adminContactNumber } = req.body;

  if (!companyTitle || !companyName || !address || !contactEmail || !adminFirstName || !adminLastName || !adminEmail || !adminContactNumber || !assignShips) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  const session = await Organization.startSession();
  session.startTransaction();

  try {
    const organizationCount = await Organization.countDocuments().session(session);
    if (organizationCount === 0) {
      await resetCounter();
    }

    const loginCounter = await LoginCounter.findOneAndUpdate(
      {},
      { $inc: { seq: 1 } },
      { new: true, upsert: true, session }
    );

   

  

    const orgseq = await getNextSequence('orgId') ;
    const orgId = `ORG${orgseq}`;

    const loginUserId = `HYLA${loginCounter.seq}_${orgId}_ADMIN`;

    const newOrganization = new Organization({
      orgId,
      companyTitle,
      companyName,
      address,
      contactEmail: encryptData(contactEmail),
      assignShips,
      adminFirstName,
      adminLastName,
      adminEmail: encryptData(adminEmail),
      adminContactNumber: encryptData(adminContactNumber),
      files: req.files.map(file => file.path)
    });

    await newOrganization.save({ session });

    const hashedPassword = CryptoJS.SHA256(adminContactNumber).toString();

    const adminUser = new LoginUsers({
      loginUserId,
      role: 'organization admin',
      email: adminEmail,
      password: hashedPassword,
    });

    await adminUser.save({ session });
    await sendLoginEmail(adminEmail, adminContactNumber);


    // Create AisSatPull record
    const newAisSatPull = new AisSatPull({
      orgObjectId: newOrganization._id,  // Linking to the new organization's ID
      orgId: newOrganization.orgId,      // Save orgId for reference
      companyName: newOrganization.companyName,  // Use company name from organization
      sat0 : 360 * 60000,
      sat1a : 720 * 60000,
      sat1b : 1440 * 60000
    });

    await newAisSatPull.save({ session });


    await session.commitTransaction();
    session.endSession();

    res.status(201).json({ message: 'Organization created and email sent to admin.' });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();

    console.error('Error creating organization:', error);
    res.status(500).json({ message: 'Error creating organization or sending email.', error: error.message });
  }
});


// Function to generate a random password
function generateRandomPassword(length = 12) {
  const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+[]{}|;:,.<>?'; // Define the character set
  let password = '';

  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * charset.length); // Get a random index
    password += charset[randomIndex]; // Append the random character to the password
  }

  return password; // Return the generated password
}


// @desc Get all organizations
// @route GET /api/organizations/getData
// @access Public
router.get('/getData', async (req, res) => {
  try {
    console.log('aaaa');
    const organizations = await Organization.find();

    const decryptedOrganizations = organizations.map((org) => {
      // Decrypt the values only if available, otherwise use the original (encrypted) values
      const decryptedContactEmail = decryptData(org.contactEmail) || org.contactEmail;
      const decryptedAdminEmail = decryptData(org.adminEmail) || org.adminEmail;
      const decryptedAdminContactNumber = decryptData(org.adminContactNumber) || org.adminContactNumber;

      return {
        ...org._doc, // Spread the entire document fields
        contactEmail: decryptedContactEmail, // Replace with decrypted value or fallback to original
        adminEmail: decryptedAdminEmail,     // Replace with decrypted value or fallback
        adminContactNumber: decryptedAdminContactNumber // Replace with decrypted value or fallback
      };
    });

    res.json(decryptedOrganizations);
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ message: 'Server error', error });
  }
});


// Get all organizations
router.get('/', async (req, res) => {
  try {
    const organizations = await Organization.find({}, 'companyName');

    res.json(organizations.map(org => org.companyName));
  } catch (error) {
    console.error('Error fetching organizations:', error);
    res.status(500).send('Internal Server Error');
  }
});


// Endpoint to get organization id and name
router.get('/get-orgId-companyTitle', async (req, res) => {
  try {
    const organizations = await Organization.find(); // Get all organizations, adjust query if needed
    const result = organizations.map(org => ({
      orgId: org.orgId,
      companyName: org.companyName, // Assuming the name is stored in companyName field
    }));
    res.status(200).json(result);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch organizations' });
  }
});

// Get organization details by name
router.get('/get-companyTitle/:orgId', async (req, res) => {
  try {
    const organization = await Organization.findOne({ orgId: req.params.orgId });
    const organizationTitle = organization.companyTitle;

    if (!organization) {
      return res.status(404).send('Organization not found for orgId');
    }
    if (!organizationTitle) {
      return res.status(404).send('Organization Title not found');
    }

   
    res.json({ organizationTitle });

  } catch (error) {
    console.error('Error fetching organization title by orgId:', error);
    res.status(500).send('Internal Server Error');
  }
});

// Get organization title by orgId
router.get('/:name', async (req, res) => {
  try {
    const organization = await Organization.findOne({ companyName: req.params.name });

    if (!organization) {
      return res.status(404).send('Organization not found');
    }
    const decryptedContactEmail = decryptData(organization.contactEmail) || organization.contactEmail;
    res.json({
      orgId: organization.orgId,
      address: organization.address,
      contactEmail: decryptedContactEmail,
    });

  } catch (error) {
    console.error('Error fetching organization details:', error);
    res.status(500).send('Internal Server Error');
  }
});


// New API endpoint to get available vessels based on organization ID
router.get('/getAvailableVessels/:orgId', async (req, res) => {
  try {
    const orgId = req.params.orgId;
    const organization = await Organization.findOne({ orgId });
    // console.log(organization);
    if (!organization) {
      return res.status(404).json({ message: 'Organization not found' });
    }

    res.json({ assignShips: organization.assignShips });
  } catch (error) {
    console.error('Error fetching available vessels:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});


// Function to send email with login details and reset token
const sendResetPasswordEmail = async (email, password) => {
  try {
    console.log(password);
    // const token = jwt.sign({ email: adminEmail }, encryptionKey, { expiresIn: '1h' }); // Generate a token

    const transporter = nodemailer.createTransport({
      service: 'gmail', // or your email provider
      auth: {
        user: 'admin@hylapps.com',
        pass: 'ngsl cgmz pnmt uiux',
      },
    });

    const mailOptions = {
      from: 'admin@hylapps.com',
      to: email,
      subject: 'Your Hyla Account password has been reset',
      text: `Hello! Your Hyla Account password has been reset. 
Email: ${email}
New Password: ${password}
  
Thank You,
HYLA Admin`,
    };
  
    await transporter.sendMail(mailOptions);
    console.log('reset password done successfully.');
  } catch (error) {
    console.error('Error resetting password:', error);
  }
};

// @desc Request a password reset
// @route POST /api/organizations/reset-password
// @access Public


router.post('/reset-password', async (req, res) => {
  const { email } = req.body;

  if (!email ) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  try {
    // Find the user in the LoginUsers collection
    const user = await LoginUsers.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: 'User Email not found' });
    }

    function generateRandomString(length) {
      const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
      let result = '';
      const charactersLength = characters.length;
      for (let i = 0; i < length; i++) {
          result += characters.charAt(Math.floor(Math.random() * charactersLength));
      }
      return result;
      }

      const newPassword = generateRandomString(10);

    // Hash the new password
    const hashedNewPassword = CryptoJS.SHA256(newPassword).toString();

    // Update the user's password
    user.password = hashedNewPassword;
    await user.save();

    await sendResetPasswordEmail(email, newPassword);
  

    res.json({ message: 'Password reset successfully' });
  } catch (error) {
    console.error('Error resetting password:', error);
    res.status(500).json({ message: 'Internal server error', error });
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



export default router; 

