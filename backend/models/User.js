import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name: String,
    email: { type: String, unique: true },
    password: String,
    location: {
        houseNo: { type: String, default: '' },
        street: { type: String, default: '' },
        city: { type: String, default: '' },
        pincode: { type: String, default: '' }
    }
});

export default mongoose.model("User", userSchema);
