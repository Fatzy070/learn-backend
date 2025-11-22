import User from '../model/UserSchema.js'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { sendEmail } from '../utils/mailer.js'
import { OAuth2Client } from 'google-auth-library'


const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID)

export const SignUp = async (req , res) => {
    try {
        const { name , email , password } = req.body
        
        if (!name || !email || !password) {
          return  res.status(400).json({ message: 'All fields are required' })
        }

        const parts = name.trim().split(" ");
    const firstName = parts[0];
    const lastName = parts.slice(1).join(" ") || "";
        
        const existingUser = await User.findOne({ email: email.toLowerCase() })
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' })
        }

     const strongPassword = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{6,}$/
    if (!strongPassword.test(password)) {
     return res.status(400).json({ message: 'Password too weak. Use letters, numbers & special chars, min 6 chars' })
    }
        const hashedPassword = await bcrypt.hash(password , 10 )
        const newUser = await User.create({
            firstName,
            lastName,
            email: email.toLowerCase() , 
            password: hashedPassword
        })
     
        const token = jwt.sign(
            { id: newUser._id } , 
            process.env.JWT_SECRET , 
            { expiresIn: '1h' }
        )
        

    res.status(200).json({
      message: "User created successfully",
      user: {
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        email: newUser.email,
        id: newUser._id,
        enrolledVideos: newUser.enrolledVideos
      },
      token,
    });      

    } catch (error) {
        console.log('Cannot Create a new User' , error);
        res.status(500).json({ message:"Server error while creating user" })
    }
}

export const Login = async (req , res) => {
    try {
        const { email , password } = req.body

        if ( !email || !password) {
          return  res.status(400).json({ message: 'All fields are required' })
        }
        
        const user = await User.findOne({ email: email.toLowerCase() })
        if (!user) {
            return res.status(404).json({ message:"User does not exist"}) 
        }
        
        const IsPassword = await bcrypt.compare(password , user.password )
        if (!IsPassword) {
            return res.status(401).json({ message:'Incorrect Password' })
        }

        const token = jwt.sign(
            { id: user._id  , role: user.role } ,
            process.env.JWT_SECRET ,
            { expiresIn: '7h' }
        )

        res.status(200).json({
            message:'Logged in successfully' ,
            user: { id: user._id , email: user.email ,  lastName: user.lastName, firstName: user.firstName , enrollVideo: user.enrolledVideos } ,
            token
        })
     } catch (error) {
        console.log('Failed to Login' , error );
        res.status(500).json({ message:'Server Error while logging in ' })
    }
}
export const googleLogin = async (req, res) => {
  try {
    const { token } = req.body;
    if (!token) {
      return res.status(400).json({ message: "Invalid token" });
    }

    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const email = payload.email.toLowerCase();
    let user = await User.findOne({ email });

    if (!user) {
      // Split full name into firstName and lastName
            const fullName =
        payload.name ||
        `${payload.given_name || ""} ${payload.family_name || ""}`.trim() ||
        email.split("@")[0];

      const [firstName, ...rest] = fullName.split(" ");
      const lastName = rest.join(" ") || "";

      user = await User.create({
        firstName,
        lastName,
        email,
        password: null,
      });

    }

    const jwtToken = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7h" }
    );

    res.status(200).json({
      user: { id: user._id , email: user.email ,  lastName: user.lastName, firstName: user.firstName , enrollVideo: user.enrolledVideos } ,
      token: jwtToken,
    });
  } catch (error) {
    console.log("Google login failed", error);
    res.status(500).json({ message: "Google login failed" });
  }
};

export const forgotPassword = async (req , res ) => {
    try {
        const { email } = req.body
        if (!email) {
            return res.status(400).json({  message:'Email is required' })
        }

        const user = await User.findOne({ email:email.toLowerCase() })
        if (!user) {
            return res.status(404).json({ message:"User not found" })
        }

        const resetCode = Math.floor(100000 + Math.random() * 900000).toString()

        user.resetPasswordToken = resetCode
        user.resetPasswordExpires = Date.now() + 10 * 60 * 1000
        await user.save()

        await sendEmail({
            to:user.email ,
            name:user.name ,
            code:resetCode
        })

        res.status(200).json({ message:"Reset code sent to email" })
    } catch (error) {
          console.error("Forgot Password error:", error);
     res.status(500).json({ message: "Server error while sending code" });
    }
}

export const resetPassword = async(req , res) => {
    try {
        const {  code , newPassword } = req.body
        if ( !code || !newPassword) {
            return res.status(400).json({ message:"All fields are required" })
        }

        const user = await User.findOne({
            resetPasswordToken: code ,
            resetPasswordExpires:{ $gt: Date.now()}
        })

        if (!user) {
            return res.status(400).json({ message:"Invalid or expired token" })
        }
        
        const hashedPassword =await bcrypt.hash(newPassword , 10)
        user.password = hashedPassword

        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;

        await user.save()

        const token = jwt.sign(
            { id:user._id , role: user.role },
            process.env.JWT_SECRET ,
            { expiresIn: '7h' }
        )

        res.status(200).json({ 
            message:"Password reset successfully" ,
            user: { id: user._id , email: user.email ,  lastName: user.lastName, firstName: user.firstName , enrollVideo: user.enrolledVideos } ,
            token
            })

    } catch (error) {
        console.log('Error while reseting password' , error);
        res.status(500).json({ message:"Server error while reseting password" })
    }
} 

export const getSingleUser = async (req , res ) => {
    try {
        const userId = req.user.id 

        const user = await User.findById(userId).select('-password')

        if(!user) {
            return res.status(404).json({ message:"User does not exit" })
        }

        res.status(200).json({ user })

    } catch (error) {
        console.log('Error getting single user: ' , error);
        res.status(500).json({ message: 'Server error fetching User' })
    }
} 

export const getAllUser = async(req , res ) => {
    try {
        const user = await User.find().select('-password')
        res.status(200).json({ user })

    } catch (error) {
        console.log('Error fetching all User :' , error );
        res.status(500).json({ message:'Server Error fetching Users ' })        
    }
}

export const editProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    const { firstName, lastName, image } = req.body;

    const user = await User.findByIdAndUpdate(
      userId,
      { firstName, lastName, image },
      { new: true, runValidators: true }
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      message: "User updated successfully",
      user,
    });

  } catch (error) {
    console.log("Failed to update", error);
    res.status(500).json({ message: "Failed to update Profile" });
  }
};