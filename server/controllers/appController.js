import UserModel from '../model/User.model.js'
import bcrypt from 'bcrypt'
import pkg from 'jsonwebtoken';
const { Jwt } = pkg


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

        // const existingUsername = UserModel.findOne({ username }).exec();

        UserModel.findOne({username})
            .then(user => {
                bcrypt.compare(password, user.password)
                    .then(passwordCheck => {

                        if(!passwordCheck) return res.status(400).send({error: "How far na? You don't have a Password"})

                        //jwt token creation
                        const token = Jwt.sign({
                                        userId: user._id,
                                        username : user.username
                                    }, 'secret', {expiresIn : "24h"})
                        return res.status(200).send({
                            msg: "Logged in Successfully...!",
                            username: user.username,
                            token
                        })
                    })
                    .catch(error => {
                        return res.status(400).send({error: "Password does not Match na"})
                    })
            })
            .catch(error => {
                return res.status(400).send({error: "Username not Found na"});
            })
    } catch (error) {
        return res.status(500).send({error: error.message})
    }
}


/** GET: http://localhost:8080/api/user/example123 */
export async function getUser(req, res){
    res.json('getUser route')
}


/** PUT: http://localhost:8080/api/updateuser  
 * @param: {
  "id" : "<userid>"
}
body: {
    firstName: '',
    address : '',
    profile : ''
}
*/
export async function updateUser(req, res){
    res.json('updateUser route')
}


/** GET: http://localhost:8080/api/generateOTP */
export async function generateOTP(req, res){
    res.json('generateOTP route')
}


/** GET: http://localhost:8080/api/verifyOTP */
export async function verifyOTP(req, res){
    res.json('verifyOTP route')
}


// successfully redirect user when OTP is valid
/** GET: http://localhost:8080/api/createResetSession */
export async function createResetSession(req, res){
    res.json('createResetSession route')
}


// update the password when we have valid session
/** PUT: http://localhost:8080/api/resetPassword */
export async function resetPassword(req, res){
    res.json('resetPassword route')
}