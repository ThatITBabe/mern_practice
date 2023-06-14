import mongoose from 'mongoose'


const connectDB = ()=> {
    mongoose.connect("mongodb+srv://Login-app:myLogin@cluster0.ftrponn.mongodb.net/")
        .then(() => {
            console.log("Connected to DataBase successfully!!")
        }).catch(error => console.log(error))
}

export default connectDB