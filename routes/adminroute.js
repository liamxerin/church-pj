const express = require('express');
const Brother = require('../models/BrotherModel.js')
const { getallBrothers,
    getallRows,getSearch,
    getBrother,
    searchPeople,
     getUpdate,
    getData } = require('../controllers/BrotherController.js');
const router = express.Router();
router.get('/allmembers', getallBrothers);
router.get('/admin_page',getallRows);
router.get('/update/:id',getUpdate)
router.get('/search', getSearch)
router.get('/search-results',searchPeople)
router.get('/analytis', getData)
router.get('/people_details/:id', getBrother)

module.exports = router;