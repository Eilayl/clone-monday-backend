const User = require('../models/User');
const crypto = require('crypto');
require('dotenv').config();
const {encrypt, decrypt} = require('../commands/encryption'); 

exports.signup = async (req, res) => {
  try {
      const { email, signupwithgoogle, fields, survey } = req.body;
      const iv = crypto.randomBytes(16)
      if (!signupwithgoogle && fields === null)
        return res.status(404).json({ message: "Fields are required when not signing up with Google" });
      if (!email)
        return res.status(400).json({ message: "Email is required when signing up with Google" });
      const userExist = await User.findOne({ email });
      if (userExist)
        return res.status(400).json({ message: "User already exists" });
      if(!survey)
        return res.status(400).json({ message: "Survey is required" });
      
      const base64data = Buffer.from(iv, 'binary').toString('base64')
        if (signupwithgoogle || (!signupwithgoogle && fields)) {
          const newUser = new User({
            email: email,
            iv: base64data,
            signupwithgoogle,
            fields: {
              password: signupwithgoogle ? null : encrypt(fields.password, iv),
              phone: signupwithgoogle ? null : encrypt(fields.phone, iv),
              name: signupwithgoogle ? null : encrypt(fields.name, iv)
            },
            userSurvey: survey ? survey.map((item) => ({
              question: item.question,
              answer: item.answer
            })) : []
          });
          await newUser.save();
          req.session.authenticated = true;
          req.session.user = {
  id: newUser._id,
  name: newUser.name,
  email: newUser.email
};
                    return res.status(200).json({ message: "User created successfully" });
        }
        
    } catch (error) {
        return res.status(500).json({ message: "Something went wrong" + error.message });
    }
};


exports.getUsers = async (req, res) => {
  try {
    const users = await User.find();
    if (!users || users.length === 0) {
      return res.status(404).json({ error: "No users found" });
    }

    const dataString = users.map(user => {
      let surveyString = "";

      if (user.userSurvey && user.userSurvey.length > 0) {
        surveyString = user.userSurvey.map(survey =>
          `question: ${survey.question} answer: ${survey.answer}`
        ).join("\n");
      } else {
        surveyString = "No survey responses";
      }
return `email: ${user.email}
fields: ${
  user.fields
    ? `phone: ${user.fields.phone ? decrypt(user.fields.phone, user.iv) : 'null'}
name: ${user.fields.name ? decrypt(user.fields.name, user.iv) : 'null'}`
    : 'null'
}
signupwithgoogle: ${user.signupwithgoogle}

userSurvey:
${surveyString}\n\n`;


    });

    return res.status(200).json({message:(dataString)});

  } catch (error) {
    return res.status(500).json({ message: "Something went wrong: " + error.message });
  }
};



exports.signIn = async (req, res) => {
  try {
    const { email } = req.body;

    const isExist = await User.findOne({ email }).lean();

    if (isExist) {
      req.session.authenticated = true;
      req.session.user = {
        id: isExist._id,
        name: isExist.name,
        email: isExist.email
      };

      return res.status(200).send({message: "User signed in successfully",});
    } else {
      return res.status(404).send({ error: "User not found" });
    }
  } catch (error) {
    console.error("SignIn Error:", error);
    return res.status(500).send({ error: "Something went wrong: " + error.message });
  }
};

