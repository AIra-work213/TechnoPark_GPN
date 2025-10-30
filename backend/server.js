express = require('express')
const app = express()
const dotenv = require('dotenv')
dotenv.config()
const cors = require('cors')
const TakeDocs = require('./takeDocs/takeDocs.controller')
const PORT = 8080

const start = async () => {
    try {
        app.use(cors({
            origin: 'http://localhost:3000',
            methods: ['GET', 'POST', 'PUT', 'DELETE'],
            credentials: true
        }));
    app.use(express.json({ limit: '10mb' }))
    app.use(express.urlencoded({ extended: true, limit: '10mb' }))

        app.locals.sharedData = {}
        
        app.use(TakeDocs)
        app.get('/', (req, res) => {
            res.send('Server is running!')
        })
        
        app.listen(PORT, () => {
            console.log(`http://localhost:${PORT}`)
        })
    } catch (e) {
        console.log(e)
    }
}

start()