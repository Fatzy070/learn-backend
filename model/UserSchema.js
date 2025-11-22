import mongoose from "mongoose";
const Schema = mongoose.Schema;

const UserSchema = new Schema(
  {
    firstName: {
      type: String,
      required: [true, "First name is required"],
      trim: true,
    },
    lastName: {
      type: String,
      required: false,   // <-- important
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
       default: null,
       required: false,
    },
    role: {
      type: String,
      enum: ["user", "instructor", "admin"],
      default: "user",
    },
    resetPasswordToken: String,
    resetPasswordExpires: Date,
     enrolledVideos: [
        {
            videoId: { type: String, required: true },
            title: String,
            thumbnail: String,
            playlistId: String,
            enrolledAt: { type: Date, default: Date.now }
        }
    ],
     completedLessons: [String],
     image: String
  },
  { timestamps: true }
);

export default mongoose.model("users", UserSchema);
