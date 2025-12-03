 import multer  from "multer";

 export const uploadCloud = () => {
  const storage = multer.diskStorage({}); // تخزين مؤقت
  return multer({ storage });
};

