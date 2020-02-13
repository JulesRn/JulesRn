const config = require('./config')
const {success, error} = require('./functions')
const bodyParser = require('body-parser')
const express = require('express')
const morgan = require('morgan')('dev')
const products = require('./launch')
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./assets/swagger.json');

const app = express()

let ProductsRouter = express.Router()

app.use(morgan)
app.use(express.json()) 
app.use(express.urlencoded({ extended: true })) // for parsing application/x-www-form-urlencoded
app.use(config.rootAPI+'api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

ProductsRouter.route('/:id')

    // get infos on one product
    .get((req,res) => {

        let index = getIndex(req.params.id)

        if (typeof(index) == 'string') {
            res.json(error(index))
        } else {
            res.json(success(products[index]))
        }

    })

    // delete one product
    .delete((req,res) => {

        let index = getIndex(req.params.id)

        if (typeof(index) == 'string') {
            res.json(error(index))
        } else {
            products.splice(index, 1)
            res.json(success(true))
        }

    })

    // update one product's info
    .put((req,res) => {

        let index = getIndex(req.params.id)

        if (typeof(index) == 'string') {
            res.json(error(index))
        } else {

            let product = products[index];
            let same = false

            for (let i = 0; i < products.length; i++) {
                if (products[i].name == req.body.name && req.params.id != products[i].id) {
                    same = true
                    break
                }
            }

            if (same) {
                res.json(error('same name'))
            } else {
                product.name = req.body.name
                product.category = req.body.category
                product.price = parseInt(req.body.price)
                product.stock = parseInt(req.body.stock)
                res.json(success(true))
            }

            res.json(success(product))
        }

    })

ProductsRouter.route('/')

    // get all products
    .get((req,res) => {
        res.json(success(products))
    })

    // add a product
    .post((req,res) => {
        
        let sameName = false

        for (let i = 0; i < products.length; i++) {
            if (products[i].name == req.body.name) {
                sameName = true
                break
            }
        }
        
        if (sameName) {

            res.json(error('product already existing'))

        } else {

            let product = {
                id: createID(),
                name: req.body.name,
                category: req.body.category,
                price: parseInt(req.body.price),
                stock: parseInt(req.body.stock)
            }
        
            if (req.body.name && req.body.category && req.body.price && req.body.stock) {
                products.push(product)
                res.json(success(product))
            } else {
                res.json(error('missing values'))
            }

        }


    })

app.use(config.rootAPI +'products', ProductsRouter)

app.listen(config.port, () => {
    console.log('started on port '+ config.port)
})

function getIndex(id) {
    for (let i = 0; i < products.length; i++) {
        if (products[i].id == id)
            return i
    }
    return "wrong id"
}

function createID() {
    return products[products.length - 1].id + 1
}