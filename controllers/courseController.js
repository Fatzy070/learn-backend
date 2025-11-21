import axios from 'axios'
import User from '../model/UserSchema.js'

export const getPlaylistVideos = async (req , res) => {
    try {
       const { playlistId } = req.params
       const apiKey = process.env.YOUTUBE_API_KEY

       const response = await axios.get(`https://www.googleapis.com/youtube/v3/playlistItems` , {
       
            params: {
                part:'snippet' ,
                maxResults: 50 , 
                playlistId,
                key:apiKey
            }
     
       })

       const items = response.data.items.map((item) => ({
            title: item.snippet.title,
     thumbnail: item.snippet.thumbnails?.high?.url || item.snippet.thumbnails?.default?.url || "",
      videoId: item.snippet.resourceId.videoId,
      description: item.snippet.description,
       }))

       res.json({ videos: items })
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Failed to load videos" });
    }
}

export const enrollVideo = async (req , res) => {
    try {
        const userId = req.user._id 
        const { videoId , title , thumbnail , playlistId } = req.body

        const user = await User.findById(userId)

        const alreadyEnrolled = user.enrolledVideos.find(v => v.videoId ===  videoId)
        if (alreadyEnrolled) {
            return res.status(400).json({ message:"Already enrolled" })
        }

        user.enrolledVideos.push({ videoId , title , thumbnail , playlistId })
        await user.save()

        res.status(200).json({ 
            message:"Enrolled successfully! 🎉" ,
            enrolledVideos: user.enrollVideos
         })

    } catch (error) {
        console.log("error enrolling video :" , error);
        res.status(500).json({ message:'failed enroll video' })
    }
}

export const unenrollVideo = async (req , res) => {
    try {
        const userId = req.user._id 
        const { videoId } = req.params

        const user = await User.findById(userId)

        user.enrolledVideos = user.enrolledVideos.filter(v => v.videoId !== videoId )
        
        await user.save()

        res.json({
            message:"Unenrolled successfully" ,
            enrolledVideos: user.enrolledVideos
        })
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Failed to unenroll" });
    }
}

export const fetchEnrollVideos = async (req , res) => {
    try {
        const userId = req.user._id 

        const user = await User.findById(userId)

        const enrolledVideos = user.enrolledVideos

        res.status(200).json({
            enrolledVideos
         })
    } catch (error) {
        console.log('Error' , error ) 
        res.status(500).json({ message :"Failed to fetch Enroll Videos" })
    }
}

export const completeLesson = async (req, res) => {
  try {
    const userId = req.user._id;
    const { videoId } = req.params;

    const user = await User.findById(userId);

    if (!user.completedLessons.includes(videoId)) {
      user.completedLessons.push(videoId);
      await user.save();
    }

    res.json({
      message: "Lesson marked as completed",
      completedLessons: user.completedLessons
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to mark lesson completed" });
  }
};

export const progress = async (req, res) => {
  try {
    const { videoId } = req.params;
    let { progress } = req.body;
    const user = req.user;

    if (!user.videoProgress) user.videoProgress = {};

    
    progress = Math.min(progress, 100);

 
    user.videoProgress[videoId] = Math.max(progress, user.videoProgress[videoId] || 0);

    await user.save();

    res.json({ message: 'Progress updated', videoProgress: user.videoProgress });
  } catch (error) {
    console.error('Error saving progress:', error);
    res.status(500).json({ message: "Failed to update progress" });
  }
};

export const searchVideos = async (req, res) => {
  try {
    const { query } = req.query;
    const apiKey = process.env.YOUTUBE_API_KEY;

    // For example, search in a specific playlist or channel
    const playlistIds = ['PLU83Ru7iGtAtTlQ8MRGHCBu4tzATiRfmY', 'PLC3y8-rFHvwgg3vaYJgHGnModB54rxOk3', 'PLtK75qxsQaMLZSo7KL-PmiRarU7hrpnwK']; // or from DB

    let allResults = [];

    for (const playlistId of playlistIds) {
      const response = await axios.get('https://www.googleapis.com/youtube/v3/playlistItems', {
        params: {
          part: 'snippet',
          maxResults: 50,
          playlistId,
          key: apiKey
        }
      });

      const items = response.data.items.map(item => ({
        videoId: item.snippet.resourceId.videoId,
        title: item.snippet.title,
        description: item.snippet.description,
        thumbnail: item.snippet.thumbnails?.high?.url || item.snippet.thumbnails?.default?.url || ""
      }));

      allResults = allResults.concat(items);
    }

    // Filter by query
    const filtered = allResults.filter(video => video.title.toLowerCase().includes(query.toLowerCase()));

    res.json({ videos: filtered });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to search videos" });
  }
};


export const getVideoById = async (req, res) => {
  try {
    const { videoId } = req.params;
    const userId = req.user?._id; // optional, in case you want user-specific info
    const apiKey = process.env.YOUTUBE_API_KEY;

 
    const response = await axios.get(`https://www.googleapis.com/youtube/v3/videos`, {
      params: {
        part: 'snippet,contentDetails',
        id: videoId,
        key: apiKey
      }
    });

    if (!response.data.items || response.data.items.length === 0) {
      return res.status(404).json({ message: "Video not found" });
    }

    const item = response.data.items[0];
    const video = {
      videoId: item.id,
      title: item.snippet.title,
      description: item.snippet.description,
      thumbnail: item.snippet.thumbnails?.high?.url || item.snippet.thumbnails?.default?.url || "",
    };

    res.status(200).json({ video });
  } catch (error) {
    console.error("Error fetching video:", error);
    res.status(500).json({ message: "Failed to fetch video" });
  }
};
