import express, { Application } from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import { connectDatabase } from './config/connectDatabase';
import { createDatabase } from './config/createDatabase';

const app: Application = express();

app.use(cors({
    origin: process.env.REACT_APP_FRONT_BASE_URL,
    credentials: true
}));

app.use(bodyParser.json());

const startServer = async () => {
    await createDatabase();
    await connectDatabase();
    const PORT = process.env.PORT || 3001;
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
};

void startServer();
