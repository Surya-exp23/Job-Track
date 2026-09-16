import mongoose , {Schema} from "mongoose";

const userSchema = new Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    passwordHash:{
        type:String
    },
    role:{
        type: String,
        enum:["CANDIDATE", "RECRUITER"],
        required: true
    },
    isEmailVerified:{
        type: Boolean,
        default: false
    },
    createdAt:{
        timestamps: true
    }
},
{
    timestamps: true,
}
)

export  const User = mongoose.model("User",userSchema) 