const multer = require("multer")

const MAX_RESUME_FILE_SIZE = 3 * 1024 * 1024

function allowPdfOnly(req, file, callback) {
    const hasPdfExtension = /\.pdf$/i.test(file.originalname)
    const isPdf = file.mimetype === "application/pdf" || file.mimetype === "application/x-pdf"

    if (hasPdfExtension && isPdf) {
        return callback(null, true)
    }

    const error = new Error("Only PDF resumes are supported.")
    error.statusCode = 400
    return callback(error)
}

const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: MAX_RESUME_FILE_SIZE
    },
    fileFilter: allowPdfOnly
})



module.exports = upload
