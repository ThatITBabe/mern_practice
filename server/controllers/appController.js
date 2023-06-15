import UserModel from '../model/User.model.js'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken';
import ENV from '../config.js'
import otpGenerator from 'otp-generator'


/**middleware for verify user */
export async function verifyUser(req, res, next){
  try{

    const { username } = req.method == "GET" ? req.query : req.body;

    //check existing user
    let exist = await UserModel.findOne({ username});
    if(!exist) return res.status(404).send({ error: "Can't find User joor!"});
    next();

  }catch (error){
    return res.status(404).send({error: "Authentication error"})
  }
}


/** POST: http://localhost:8080/api/register 
 * @param : {
  "username" : "example123",
  "password" : "admin123",
  "email": "example@gmail.com",
  "firstName" : "bill",
  "lastName": "william",
  "mobile": 8009860560,
  "address" : "Apt. 556, Kulas Light, Gwenborough",
  "profile": ""
}
*/
export async function register(req, res) {
  try {
    const { username, password, profile, email } = req.body;

    // Check existing user
    const existingUsername = UserModel.findOne({ username }).exec();
    const existingEmail = UserModel.findOne({ email }).exec();

    Promise.all([existingUsername, existingEmail])
      .then(([existingUsernameResult, existingEmailResult]) => {
        if (existingUsernameResult) {
          throw new Error("Please use a unique username");
        }
        if (existingEmailResult) {
          throw new Error("Please use a unique email");
        }

        if (password) {
          bcrypt.hash(password, 10)
            .then(hashedPassword => {
              const user = new UserModel({
                username,
                password: hashedPassword,
                profile: profile || "",
                email,
              });

              user.save()
                .then(result => {
                  res.status(201).send({ msg: "User Registration Successful" });
                })
                .catch(error => {
                  res.status(500).send({ error: "Error saving user" });
                });
            })
            .catch(error => {
              res.status(500).send({ error: "Unable to hash password" });
            });
        }
      })
      .catch(error => {
        res.status(500).send({ error: error.message });
      });
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
}


/** POST: http://localhost:8080/api/login 
 * @param: {
  "username" : "example123",
  "password" : "admin123"
}
*/
export async function login(req, res){

    const { username, password } = req.body;

    try {

        UserModel.findOne({ username })
            .then(user => {
                bcrypt.compare(password, user.password)
                    .then(passwordCheck => {

                        if(!passwordCheck) return res.status(400).send({error: "How far na? You don't have a Password"})

                        //jwt token creation
                        const token = jwt.sign({
                                        userId: user._id,
                                        username : user.username
                                    }, ENV.JWT_SECRET, {expiresIn : "24h"});
                        return res.status(200).send({
                            msg: "Logged in Successfully...!",
                            username: user.username,
                            token
                        });
                    })
                    .catch(error => {
                        return res.status(400).send({error: error.message})
                        // console.error("Error comparing passwords:", error);
                        // return res.status(500).send({ error: "Error comparing passwords" });
                    })
            })
            .catch(error => {
                return res.status(400).send({error: error.message});
                // console.error(error); // Log the error for debugging purposes
                // console.error("Error finding user:", error);
                // return res.status(500).send({ error: "Error finding user" });

            })
    } catch (error) {
        return res.status(500).send({error: error.message})
    }
}


/** GET: http://localhost:8080/api/user/example123 */
export async function getUser(req, res) {
  const { username } = req.params;

  try {
    if (!username) {
      return res.status(400).send({ error: "Invalid Username" });
    }
    const user = await UserModel.findOne({ username }).exec();
    
    if (!user) {
      console.error("User not found");
      return res.status(404).send({ error: "User not found" });
    }

    /** remove password from user */
    // mongoose return unnecessary data with object so convert it into json
    const {  password, ...rest } = Object.assign({}, user.toJSON());

    return res.status(200).send(rest);
  } catch (error) {
    console.error("Error retrieving user data:", error);
    return res.status(500).send({ error: "Internal Server Error" });
  }
}



/** PUT: http://localhost:8080/api/updateuser  
 * @param: {
  "id" : "<token>"
}
body: {
    firstName: '',
    address : '',
    profile : ''
}
*/
export async function updateUser(req, res){
  
  try{

    // const id = req.query.id;

    const { userId } = req.user

    if(userId){
      const body = req.body;

      //update the data
      await UserModel.updateOne({ _id: userId }, body)

      return res.status(201).send({ msg: "RECORD UPDATED MY G!" });

    }else{
      return res.status(401).send({ error: "User Not Found na...!"})
    }

  }catch(error){
    return res.status(401).send({ error: error.message })
  }
}


/** GET: http://localhost:8080/api/generateOTP */
export async function generateOTP(req, res){
  req.app.locals.OTP = await otpGenerator.generate(6, { lowerCaseAlphabets: false, upperCaseAlphabets: false, specialChars: false });
  res.status(201).send({code: req.app.locals.OTP})
}


/** GET: http://localhost:8080/api/verifyOTP */
export async function verifyOTP(req, res){
  const { code } = req.query;
  if(parseInt(req.app.locals.OTP) === parseInt(code)){
    req.app.locals.OTP = null; // reset the OTP value
    req.app.locals.resetSession = true; // start session for reset password
    return res.status(201).send({ msg: 'Verification Successsful, jaye loo!'})
  }
  return res.status(400).send({ error: "Invalid OTP joor"});
}


// successfully redirect user when OTP is valid
/** GET: http://localhost:8080/api/createResetSession */
export async function createResetSession(req, res){
  if(req.app.locals.resetSession){
    req.app.locals.resetSession = false; //aLLOW ACCESS TO THIS ROUTE ONLY ONCE
  return res.status(201).send({ msg: "Access granted"})
  }
  return res.status(440).send({ error: "Session expired my dear"})
}


// update the password when we have valid session
/** PUT: http://localhost:8080/api/resetPassword */
// export async function resetPassword(req, res){
//   try{
//     const { username, password } = req.body;

//     try{
// UserModel.findOne({ username }).exec()
// .then(user => {
//   bcrypt.hash(password, 10)
//   .then(hashedPassword => {
//     UserModel.updateOne({ username: user.username }, { password: hashedPassword}, (err, data) => {
//       if(err) throw err;
//       return res.status(201).send({ msg : " Record Updated"})
//     })
//   })

//   .catch(e => {
//     return res.status(500).send({error: "Enable.hash password"})
//   })
// })
// .catch(error => {
//   return res.status(404).send("Username not Found")
// })
//     }catch(error){
//       return res.status(500).send({ error })
//     }

//   }catch(error){
//     return res.status(401).send({ error})
//   }
// }


// export async function resetPassword(req, res) {
//   try {
//     const { username, password } = req.body;

//     const user = await UserModel.findOne({ username }).exec();
//     if (!user) {
//       return res.status(404).send({ error: "Username not found" });
//     }

//     const hashedPassword = await bcrypt.hash(password, 10);

//     await UserModel.findOneAndUpdate(
//       { username: user.username },
//       { password: hashedPassword },
//       { new: true }
//     );

//     return res.status(201).send({ msg: "Password reset successful" });
//   } catch (error) {
//     console.error("Error resetting password:", error);
//     return res.status(500).send({ error: "Internal Server Error" });
//   }
// }

export async function resetPassword(req, res) {
  try {
    if (!req.app.locals.resetSession) {
      return res.status(440).send({ error: "Session expired!" });
    }

    const { username, password } = req.body;

    const user = await UserModel.findOne({ username });
    if (!user) {
      return res.status(404).send({ error: "Username not found" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await UserModel.findOneAndUpdate(
      { username: user.username },
      { password: hashedPassword },
      { new: true }
    );

    req.app.locals.resetSession = false; // Reset session

    return res.status(201).send({ msg: "Record Updated...!" });
  } catch (error) {
    console.error("Error resetting password:", error);
    return res.status(500).send({ error: "Internal Server Error" });
  }
}

