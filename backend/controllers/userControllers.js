import User from "../models/user.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import Chat from "../models/Chat.js";

// Generate JWT
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: "30d",
    });
};

// Register User
export const registerUser = async (req, res) => {
    const { name, email, password } = req.body;

    try {
        if (!name || !email || !password) {
            return res.json({ success: false, message: "All fields are required" });
        }

        const userExists = await User.findOne({ email });

        if (userExists) {
            return res.json({ success: false, message: "User already exists" });
        }

        const user = await User.create({
            name,
            email,
            password, // ✅ model will hash
        });

        const token = generateToken(user._id);

        res.json({ success: true, token });

    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

// Login User
export const loginUser = async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });

        if (user) {
            const isMatch = await bcrypt.compare(password, user.password);

            if (isMatch) {
                const token = generateToken(user._id);
                return res.json({ success: true, token });
            }
        }

        return res.json({ success: false, message: "Invalid Email or Password" });

    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

// Get User (Protected)
export const getUser = async (req, res) => {
    try {
        res.json({ success: true, user: req.user });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};


//Api to get published images

export const getPublishedImages = async (req,res)=>{
    try{
        const publishedImageMessages = await Chat.aggregate([
            {$unwind: "$messages"},
            {
                $match:{
                    "messages.isImage":true,
                    "messages.isPublished":true
                }
            },
            {
                $project:{
                    _id:0,
                    imageUrl:"$messages.content",
                    userName:"$userName"
                }
            }
        ])

        res.json({success:true,images:publishedImageMessages.reverse()})

    }
    catch(error){
        return res.json({success:false,message:error.message});
    }
}