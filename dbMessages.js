import mongoose from 'mongoose';

const whatsappSchema  = new mongoose.Schema({
    message : String,
    name : String,
    received : Boolean,
    timestamp : String
});


export default mongoose.model('messageContent', whatsappSchema);
