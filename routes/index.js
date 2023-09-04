
const userRouter = require('./user');
const productRouter = require('./product')
const {notFound , errHandler} = require('../middlewares/errHandler')


const initRouter = (app) =>{
    app.use('/api/user' , userRouter)
    app.use('/api/product' , productRouter)



    app.use(notFound)
    app.use(errHandler)
}

module.exports = initRouter