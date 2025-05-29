import fs from "fs";
import path from "path";

export const cleanupOldAvatars = async (keepLatest: number = 3) => {
  const avatarDir = "uploads/avatars/";

  try {
    // Read all files in the avatar directory
    const files = fs.readdirSync(avatarDir);

    // Get file stats and sort by creation time (newest first)
    const fileStats = files.map((file) => ({
      name: file,
      path: path.join(avatarDir, file),
      ctime: fs.statSync(path.join(avatarDir, file)).ctime,
    }));

    fileStats.sort((a, b) => b.ctime.getTime() - a.ctime.getTime());

    // Keep only the latest N files, delete the rest
    const filesToDelete = fileStats.slice(keepLatest);

    filesToDelete.forEach((file) => {
      fs.unlinkSync(file.path);
    });

    return true;
  } catch (error) {
    console.error("Error cleaning up old avatars:", error);
    return false;
  }
};
