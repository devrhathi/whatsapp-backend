//importing
import express from 'express';
import mongoose from 'mongoose';
import Messages from './dbMessages.js';
import Pusher from 'pusher';
import cors from 'cors';


//app config
const app = express();
const port = process.env.PORT || 9000;
const pusher = new Pusher({
    appId: "1104205",
    key: "5d6b59d793e8c19278c8",
    secret: "28ebd8aebb314216f095",
    cluster: "ap2",
    useTLS: true
  });



//middleware
app.use(express.json());
app.use(cors());



//db config
const connection_url = 'mongodb+srv://admin:scUQG2B4o2b4z0Hf@cluster0.95wbe.mongodb.net/whatsappdb?retryWrites=true&w=majority';

mongoose.connect(connection_url, {
    useCreateIndex: true,
    useNewUrlParser: true,
    useUnifiedTopology: true
});

const db = mongoose.connection;
db.once("open", ()=>{
     console.log("DB Connected");

    const msgCollection = db.collection("messagecontent");
    const changeStream = msgCollection.watch();

    changeStream.on('change', (change)=>{
        console.log(change);

        if(change.operationType === 'insert'){
            const messageDetails = change.fullDocument;
            pusher.trigger('message', 'inserted', {
                name : messageDetails.user,
                message : messageDetails.message
            });
        }
        else{
            console.log('Error Triggering Pusher');
        }

    });
});

//api routes
app.get('/', (req, res)=>res.status(200).send('hello world'));


app.get('/messages/sync', (req, res)=>{
    Messages.find((err, data)=>{
        if(err){
            res.status(500).send(err);
        }
        else{
            res.status(200).send(data);
        }
    });
});


app.post('/messages/new', (req, res)=>{
    const dbMessage = req.body;

    Messages.create(dbMessage, (err, data)=>{
        if(err){
            res.status(500).send(err);
        }
        else{
            res.status(201).send(`new message created: \n ${data}`);
        }
    });

});

//listen    
app.listen(port,()=>{console.log(`listening at ${port}`)});