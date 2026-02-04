import dotenv from 'dotenv'
dotenv.config()
import express from 'express'
import cors from 'cors'
import path, { dirname } from 'path';
import { fileURLToPath } from 'url';
import db from './config/db.js'
import UserRoutes from './routes/UserRoutes.js'
import CourseRoutes from './routes/CourseRoutes.js'

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express()
const PORT = process.env.PORT || 3000 

app.use(express.json())
app.use(express.urlencoded({ extended:true   }))
app.use(cors({
    origin:'*' ,
    method :[ 'PUT' , 'GET' , 'POST' , 'DELETE' , 'OPTIONS' ] ,
    credentials: true 
}))
db()

app.set('views' , path.join(__dirname , 'views') )
app.set('view engine' , 'ejs')


app.use('/api' , UserRoutes)
app.use('/api/courses' , CourseRoutes)

app.listen(PORT , () => {
    console.log(`Server is running on Localhost:${PORT} `);
})






