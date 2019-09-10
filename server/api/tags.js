import Express from 'express'

const router = Express.Router();
import Tags from '../../models/tags'
import {responseClient} from '../util'

//delete tags
router.get('/delTag', function (req, res) {
    let {name} = req.query;
    Tags.remove({name})
        .then(result => {
            if(result.result.n === 1){
                responseClient(res,200,0,'Tag Deleted')
            }else{
                responseClient(res,200,1,'Tag Not Found');
            }
        }).catch(err => {
        responseClient(res);
    });
});

//add tages
router.post('/addTag', function (req, res) {
    let {name} = req.body;
    Tags.findOne({
        name
    }).then(result => {
        if (!result) {
            let tag = new Tags({
                name
            });
            tag.save()
                .then(data => {
                    responseClient(res, 200, 0, 'Tag Added', data);
                }).catch(err => {
                throw err
            })
        } else {
            responseClient(res, 200, 1, "Tag's already existed");
        }
    }).catch(err => {
        responseClient(res);
    });
});


module.exports = router;