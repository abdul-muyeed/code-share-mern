



const uploadFile = (req, res) => {
  // Upload logic here
  console.log("Upload route hit");
  res.status(200).json({ message: "File uploaded successfully" });
};

export const UploadController = {
  uploadFile,
};
