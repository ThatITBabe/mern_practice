import express from 'express'
import cors from 'cors'
import morgan from 'morgan'
import connect from './database/conn.js'
import router from './router/route.js'

const app = express();

/***middleware */
app.use(express.json());
app.use(cors());
app.use(morgan('tiny'));
app.disable('x-powered-by') //less hackers know about our stock

const port = 8082;

/***HTTP GET Request */
app.get('/', (req, res) => {
    res.status(201).json("Home GET Request");
})

/** api route */
app.use('/api', router)

/*start server only when we have a valid connection*/
connect().then(() => {
    try{
        app.listen(port, () => {
            console.log(`Server connected to http://localhost:${port}`)
        })
    }catch(error){
        console.log('Cannot connect to the Server')
    }
}).catch(error =>{
        console.log('Invalid Database Connection')
    })




