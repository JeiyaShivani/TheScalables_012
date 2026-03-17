import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { PlusCircle, Package } from 'lucide-react';

const VendorDashboard = () => {
    const [products, setProducts] = useState([]);
    const [name, setName] = useState('');
    const [price, setPrice] = useState('');
    const [loading, setLoading] = useState(false);

    const fetchProducts = async () => {
        try {
            const res = await fetch('http://localhost:5001/products');
            const data = await res.json();
            setProducts(data);
        } catch (err) {
            console.error('Error fetching products:', err);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!name || !price) return;

        setLoading(true);
        try {
            const res = await fetch('http://localhost:5001/products', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, price })
            });

            if (res.ok) {
                setName('');
                setPrice('');
                fetchProducts();
            }
        } catch (err) {
            console.error('Error adding product:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Layout role="vendor">
            <div className="max-w-5xl mx-auto">
                <header className="mb-8">
                    <h2 className="text-3xl font-bold text-gray-900">Vendor Dashboard</h2>
                    <p className="mt-2 text-gray-600">Manage your artisan products and catalog.</p>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Add Product Form */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                <PlusCircle className="w-5 h-5 text-brand-500" />
                                Add New Product
                            </h3>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Product Name
                                    </label>
                                    <input
                                        type="text"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-shadow"
                                        placeholder="e.g. Handmade Ceramic Vase"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Price ($)
                                    </label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        value={price}
                                        onChange={(e) => setPrice(e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-shadow"
                                        placeholder="e.g. 45.00"
                                        required
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full bg-brand-600 text-white font-medium py-2.5 px-4 rounded-lg hover:bg-brand-700 focus:ring-4 focus:ring-brand-100 transition-colors disabled:opacity-70"
                                >
                                    {loading ? 'Adding...' : 'Submit Product'}
                                </button>
                            </form>
                        </div>
                    </div>

                    {/* Product List */}
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                <Package className="w-5 h-5 text-brand-500" />
                                Your Products
                            </h3>

                            {products.length === 0 ? (
                                <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                                    <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                                    <p className="text-gray-500 font-medium">No products added yet.</p>
                                    <p className="text-sm text-gray-400 mt-1">Add your first custom artisan product!</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {products.map((product) => (
                                        <div key={product.id} className="border border-gray-100 bg-gray-50 rounded-xl p-4 hover:shadow-md transition-shadow">
                                            <div className="font-semibold text-gray-900">{product.name}</div>
                                            <div className="text-brand-600 font-bold mt-1">${Number(product.price).toFixed(2)}</div>
                                            <div className="text-xs text-gray-400 mt-3 pt-3 border-t border-gray-200 truncate">
                                                ID: {product.id}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default VendorDashboard;
