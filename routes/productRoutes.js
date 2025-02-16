const express = require('express');
const Product = require('../models/Product');
const jwt = require('jsonwebtoken');

const router = express.Router();

// Middleware para verificar el token
const verifyToken = (req, res, next) => {
    const token = req.header('Authorization');
    if (!token) return res.status(401).json({ error: 'Acceso denegado' });

    try {
        const verified = jwt.verify(token, process.env.JWT_SECRET);
        req.user = verified;
        next();
    } catch (error) {
        res.status(400).json({ error: 'Token inválido' });
    }
};

// CRUD de productos
router.get('/', verifyToken, async (req, res) => {
    try {
        const products = await Product.find();
        res.json(products);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener los productos' });
    }
});

router.post('/', verifyToken, async (req, res) => {
    try {
        console.log('Datos recibidos:', req.body);
        const { name, description, price, image } = req.body;
        if (!name || !price) {
            return res.status(400).json({ error: 'Nombre y precio son obligatorios' });
        }
        const newProduct = new Product({ name, description, price, image });
        await newProduct.save();
        res.json({ message: 'Producto agregado con éxito', product: newProduct });
    } catch (error) {
        res.status(500).json({ error: 'Error al agregar el producto' });
    }
});

router.put('/:id', verifyToken, async (req, res) => {
    try {
        const { name, description, price, image } = req.body;
        const updatedProduct = await Product.findByIdAndUpdate(req.params.id, { name, description, price, image }, { new: true });
        res.json({ message: 'Producto actualizado', product: updatedProduct });
    } catch (error) {
        res.status(500).json({ error: 'Error al actualizar el producto' });
    }
});

router.delete('/:id', verifyToken, async (req, res) => {
    try {
        await Product.findByIdAndDelete(req.params.id);
        res.json({ message: 'Producto eliminado' });
    } catch (error) {
        res.status(500).json({ error: 'Error al eliminar el producto' });
    }
});

module.exports = router;