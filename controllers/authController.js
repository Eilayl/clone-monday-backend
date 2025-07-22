const User = require('../models/User');

exports.signup = async (req, res) => {
    try {
        const { email, signupwithgoogle, fields, survey } = req.body;
        if (!signupwithgoogle && fields === null)
            return res.status(404).json({ message: "Fields are required when not signing up with Google" });
        if (!email)
            return res.status(400).json({ message: "Email is required when signing up with Google" });
        const userExist = await User.findOne({ email });
        if (userExist)
            return res.status(400).json({ message: "User already exists" });
        if(!survey)
            return res.status(400).json({ message: "Survey is required" });

        if (signupwithgoogle) {
                    const newUser = new User({
                        email,
                        signupwithgoogle,
                        fields: {
                            password: null,
                            phone: null,
                            name: null
                        },
                        userSurvey: survey ? survey.map((item) => ({
                            question: item.question,
                            answer: item.answer,
                        })) : []
                    });
                    await newUser.save();
                    return res.status(200).json({ message: "User created successfully" });
        }

        if(!signupwithgoogle && fields){
                const newUser = new User({
                    email,
                    signupwithgoogle,
                    fields: {
                        password: fields.password,
                        phone: fields.phone,
                        name: fields.name
                    },
                    userSurvey: survey ? survey.map((item) => ({
                        question: item.question,
                        answer: item.answer,
                    })) : []
                });
                await newUser.save();
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

      return `email: ${user.email}\nfields: ${JSON.stringify(user.fields)}\nsignupwithgoogle: ${user.signupwithgoogle}\n\nuserSurvey:\n${surveyString}\n\n`;
    });

    return res.status(200).json({message:(dataString.join("\n------------------\n"))});

  } catch (error) {
    return res.status(500).json({ message: "Something went wrong: " + error.message });
  }
};