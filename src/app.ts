import express, { Application } from 'express'
import cors from 'cors'
import bodyParser from 'body-parser'
import { connectDatabase } from './config/connectDatabase'
import { createDatabase } from './config/createDatabase'
import userRoutes from './routes/UserRoutes'
import projectRoutes from './routes/ProjectRoutes'
import taskRoutes from './routes/TaskRoutes'
import { Server } from 'socket.io'
import http from 'http'
import { WebSocketEvents } from './constants/WebSocketEvents'

const app: Application = express()

const server = http.createServer(app)

const io = new Server(server, {
    cors: {
        origin: process.env.REACT_APP_FRONT_BASE_URL,
        credentials: true
    }
})

app.locals.io = io

app.use(cors({
    origin: process.env.REACT_APP_FRONT_BASE_URL,
    credentials: true
}))

app.use(bodyParser.json())

// Routes
app.use('/api', userRoutes)
app.use('/api', projectRoutes)
app.use('/api', taskRoutes)

io.on('connection', (socket) => {
    socket.on(WebSocketEvents.JOIN_PROJECT_ROOM, (projectId: string) => {
        socket.join(projectId)
    })

    socket.on(WebSocketEvents.LEAVE_PROJECT_ROOM, (projectId: string) => {
        socket.leave(projectId)
    })
})

const startServer = async (): Promise<void> => {
    await createDatabase()
    await connectDatabase()
    const PORT = process.env.PORT || 3001
    server.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`)
    })
}

void startServer()
