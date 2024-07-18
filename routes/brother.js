const express = require('express')
const Brother = require('../models/BrotherModel.js')
const multer = require('multer');
const{
    getallBrothers,

    createBrother,
    deleteBrother,
    updateBrother
} = require("../controllers/BrotherController.js")

// const storage = multer.diskStorage({
//     destination: (req, file, cb) => {
//         cb(null, 'uploads/'); // Ensure this directory exists
//     },
//     filename: (req, file, cb) => {
//         const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
//         cb(null, file.fieldname + '-' + uniqueSuffix + '.' + file.mimetype.split('/')[1]);
//     }
// });

// const upload = multer({ storage: storage });


const upload = multer({ dest: 'uploads/' });
const router = express.Router()

router.get('/admin', getallBrothers

)
router.post("/add_people",upload.single('family_image'), createBrother)

router.delete("/:id",deleteBrother)
router.patch("/:id",upload.single('family_image'), updateBrother)


module.exports = router