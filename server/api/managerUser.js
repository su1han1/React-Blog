import Express from 'express'
const router = Express.Router();

router.get('/',(req,res)=>{
    res.send('backend API process')
});

module.exports = router;