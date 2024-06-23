import multer from "multer";
// function middleware of multer
const storage = multer.diskStorage({
    // using diskstorage to store at disk not memory
    destination: function (req, file, cb) {
        cb(null, "./public/temp"); // using public folder and temp folder to store temp folder
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname);
    },
});
export const upload = multer({
    storage,
});
