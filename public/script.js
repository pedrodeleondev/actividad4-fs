document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token');
    
    // Verificar autenticación para evitar recargas infinitas
    if ((window.location.pathname.includes('login.html') || window.location.pathname.includes('register.html')) && token) {
        window.location.href = 'dashboard.html';
        return;
    }
    
    if (window.location.pathname.includes('dashboard.html') && !token) {
        window.location.href = 'login.html';
        return;
    }

    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const productForm = document.getElementById('product-form');
    const productList = document.getElementById('product-list');
    let currentEditingProductId = null;
    
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;

            const res = await fetch('/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });

            const data = await res.json();
            if (res.ok) {
                localStorage.setItem('token', data.token);
                window.location.href = 'dashboard.html';
            } else {
                alert(data.error);
            }
        });
    }
    
    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;

            const res = await fetch('/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });

            const data = await res.json();
            if (res.ok) {
                alert('Registro exitoso, ahora inicia sesión.');
                window.location.href = 'login.html';
            } else {
                alert(data.error);
            }
        });
    }
    
    if (productForm) {
        productForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const name = document.getElementById('name').value;
            const description = document.getElementById('description').value;
            const price = document.getElementById('price').value;
            const image = document.getElementById('image').value;

            if (currentEditingProductId) {
                const res = await fetch(`/products/${currentEditingProductId}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': token
                    },
                    body: JSON.stringify({ name, description, price, image })
                });

                const data = await res.json();
                if (res.ok) {
                    alert('Producto actualizado con éxito');
                    loadProducts();
                    productForm.reset();
                    currentEditingProductId = null;
                    productForm.querySelector('button[type="submit"]').textContent = 'Agregar Producto';
                } else {
                    alert(data.error);
                }
            } else {
                const res = await fetch('/products', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': token
                    },
                    body: JSON.stringify({ name, description, price, image })
                });

                const data = await res.json();
                if (res.ok) {
                    alert('Producto agregado con éxito');
                    loadProducts();
                    productForm.reset();
                } else {
                    alert(data.error);
                }
            }
        });
    }

    const loadProducts = async () => {
        const res = await fetch('/products', {
            headers: { 'Authorization': token }
        });

        const products = await res.json();
        productList.innerHTML = '';

        products.forEach(product => {
            const li = document.createElement('li');
            li.innerHTML = `
                <strong>${product.name}</strong> - ${product.price} $
                <button onclick="editProduct('${product._id}', '${product.name}', '${product.description}', '${product.price}', '${product.image}')">Editar</button>
                <button onclick="deleteProduct('${product._id}')">Eliminar</button>
            `;
            productList.appendChild(li);
        });
    };

    window.editProduct = (id, name, description, price, image) => {
        document.getElementById('name').value = name;
        document.getElementById('description').value = description;
        document.getElementById('price').value = price;
        document.getElementById('image').value = image;
        currentEditingProductId = id;
        productForm.querySelector('button[type="submit"]').textContent = 'Guardar Cambios';
    };

    window.deleteProduct = async (id) => {
        const res = await fetch(`/products/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': token }
        });

        if (res.ok) {
            alert('Producto eliminado');
            loadProducts();
        } else {
            alert('Error al eliminar producto');
        }
    };

    if (window.location.pathname.includes('dashboard.html')) {
        loadProducts();
    }

    window.logout = () => {
        localStorage.removeItem('token');
        window.location.href = 'login.html';
    };
});
