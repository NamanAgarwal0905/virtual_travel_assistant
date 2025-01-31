const express=require("express");
const router=express.Router();
const {processHotels}=require("../controllers/hotelController");
router.post("/hotels",processHotels);
module.exports=router;