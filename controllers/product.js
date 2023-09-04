
const asyncHandler = require('express-async-handler')
const slugify = require('slugify');


const Product = require('../models/product');



const getDetailProduct = asyncHandler(async(req , res ) =>{
    const { pid } = req.params
    
    const product = await Product.findById(pid)
    return res.status(200).json({
        success : product ? true : false,
        getProductData  : product ? product : 'Cannot get product'
    })
})

// Filtering , sorting & pagination
const getAllProduct = asyncHandler(async(req , res ) =>{
    const queries = {...req.query};

    //Tach cac truong dac biet ra khoi query
    const excludeFields = ['limit' , 'sort' , 'page' , 'fields'];
    excludeFields.forEach(el => delete queries[el])

    //Format lai cac operator cho dung cu phap mongoose
    let queryString = JSON.stringify(queries)
    //Replace QueryString Ex: gt => $gt || gte=>$gte
    queryString = queryString.replace(/\b(gte|gt|lt|lte)\b/g , macthedEl => `$${macthedEl}`)
    //console.log(queryString);
    const formatedQueries = JSON.parse(queryString);

    //Filtering
    if (queries?.title) {
        formatedQueries.title = { $regex: queries.title , $options:'i' } //$regex : Tim kiem tuong doi & option :'i' khong phan biet chu hoa va thuong
    }
    let queryCommand = Product.find(formatedQueries);
    
    //Sorting
    if (req.query.sort) {
        const sortBy = req.query.sort.split(',').join(' ')
        queryCommand = queryCommand.sort(sortBy)
    }

    //Fields limiting
    if(req.query.fields) {
        const fields = req.query.fields.split(',').join(' ');
        queryCommand = queryCommand.select(fields);
    }
    //Pagination
    const page = +req.query.page || 1 ;
    const limit = +req.query.limit || process.env.LIMIT_PRODUCT; //Product number a page
    const skip = (page - 1) * limit

    queryCommand.skip(skip).limit(limit);
    //Execute query
    // queryCommand.exec(async(err , response) =>{
    //     if (err) {
    //         throw new Error(err.message)
    //     }
    //     const counts = await Product.find(formatedQueries).countDocuments()
    //     return res.status(200).json({
    //         success : response ? true : false,
    //         DataProducts  : response ? response : 'Cannot get product',
    //         counts : counts
    //     })
    
    // })
    queryCommand
    .then(async(response)=>{
        console.log(formatedQueries);
        const counts = await Product.find(formatedQueries).countDocuments()
        return res.status(200).json({
            success : response ? true : false,
            counts : counts,
            DataProducts  : response ? response : 'Cannot get product',
        })
    })
    .catch((err)=>{
        throw new Error(err.message)
    })
    
})

//CUD product => Admin Role
const createProduct = asyncHandler(async(req , res ) =>{

    if (Object.keys(req.body).length == 0) {
        throw new Error('Missing inputs!!')
    }
    if(req.body.title){
        req.body.slug = slugify(req.body.title );
    } 
    const newProduct = await Product.create(req.body)
    return res.status(200).json({
        success : newProduct ? true : false,
        createdProduct : newProduct ? newProduct : 'Cannot create new product'
    })
})

const updateProduct = asyncHandler(async(req , res ) =>{
    const { pid } = req.params

    // if (Object.keys(req.body).length == 0) {
    //     throw new Error('Missing inputs!!')
    // }
    if (req.body && req.body.title) {
        req.body.slug = slugify(req.body.title);
    }
    const updateProduct = await Product.findByIdAndUpdate(pid , req.body , {new:true})
    
    return res.status(200).json({
        success : updateProduct ? true : false,
        dataUpdatedProduct : updateProduct ? updateProduct : 'Cannot update product'
    })
})

const deleteProduct = asyncHandler(async(req , res ) =>{
    const { pid } = req.params

    const deleteProduct = await Product.findByIdAndDelete(pid)
    
    return res.status(200).json({
        success : deleteProduct ? true : false,
        dataDeleteProduct : deleteProduct ? deleteProduct : 'Cannot delete product'
    })
})


const rating = asyncHandler(async(req , res)=>{
    const {_id} = req.user;
    const {star , comment , pid} = req.body;

    if (!star || !pid) {
        throw new Error('Missing Input')
    }
    const productToRating = await Product.findById(pid);
    const alreadyRating = productToRating?.ratings?.find(el => el.posteBy.toString()  === _id)

    console.log({alreadyRating});
    if (alreadyRating) {
        //User da danh gia san pham r => Update
        await Product.updateOne({
            ratings : {$elemMatch : alreadyRating}
        } , {
            $set : { "ratings.$.star" : star , "ratings.$.comment" : comment }
        } , {new : true})
    }else{
        //User danh gia lan dau tien => add new star and comment
        const response = await Product.findByIdAndUpdate(pid ,{
            $push : {ratings: {star : star , comment: comment , posteBy:_id }}
        } , {new : true})
        console.log({response});
    }
    //average(trung binh công) of rating
    const dataUpdatedProduct = await Product.findById(pid);
    const ratingCount = dataUpdatedProduct.ratings.length;
    const totalStar = dataUpdatedProduct.ratings.reduce((sum,cur)=> sum+=cur.star,0);
    // console.log({totalStar , ratingCount});
    dataUpdatedProduct.totalRatings = Math.round(totalStar*10 / ratingCount)/10;

    await dataUpdatedProduct.save()

    return res.status(200).json({
        status: true
    })
})


module.exports = {
    createProduct,
    getDetailProduct,
    getAllProduct,
    updateProduct,
    deleteProduct,
    rating
}