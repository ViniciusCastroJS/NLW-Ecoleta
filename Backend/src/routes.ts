import express from 'express';
import PointsController from './controllers/PointsController';
import ItemsController from './controllers/ItemsController';
import multer from 'multer';
import ConfigMulter from './config/multer';
import {celebrate, Joi} from 'celebrate';


const itemscontroller = new ItemsController();
const pointscontroller = new PointsController();


const routes = express.Router();
const upload = multer(ConfigMulter)

/* Get Items */
routes.get('/items', itemscontroller.index)
/* Get Points */
routes.get('/points', pointscontroller.index);
/* Post Points */
routes.post('/points', upload.single('image'), 
celebrate({
  body: Joi.object().keys({
  name: Joi.string().required(),
  email: Joi.string(). required().email(),
  whatsapp: Joi.string().required(),
  latitude: Joi.number().required(),
  longitude: Joi.number().required(),
  city: Joi.string().required(),
  uf: Joi.string().required().max(2),
  items: Joi.string().required()
}),
},{abortEarly: false}) ,pointscontroller.create)
routes.get('/points/:id', pointscontroller.show)


export default routes;