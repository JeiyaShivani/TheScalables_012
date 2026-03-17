import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { ShoppingCart, MessageSquare, Star, Info } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const CustomerMarketplace = () => {
    const { user } = useAuth();
    const [products, setProducts] = useState([]);
    const [reviews, setReviews] = useState([]);
    const [newReview, setNewReview] = useState('');
    const [selectedProductId, setSelectedProductId] = useState(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [prodRes, revRes] = await Promise.all([
                fetch('http://localhost:5001/products'),
                fetch('http://localhost:5001/reviews')
            ]);
            const prodData = await prodRes.json();
            const revData = await revRes.json();

            setProducts(prodData);
            setReviews(revData);
        } catch (err) {
            console.error('Error fetching data:', err);
        }
    };

    const handleOrder = async (product) => {
        try {
            const res = await fetch('http://localhost:5001/orders', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    productId: product.id,
                    productName: product.name,
                    customerName: user?.name || user?.email || 'Anonymous',
                    vendorId: product.vendorId
                })
            });

            if (res.ok) {
                alert('Order placed successfully');
            }
        } catch (err) {
            console.error('Error placing order:', err);
        }
    };

    const handleAddReview = async (e, productId) => {
        e.preventDefault();
        if (!newReview) return;

        try {
            const res = await fetch('http://localhost:5001/reviews', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    comment: newReview, 
                    productId,
                    customerName: user?.name || user?.email || 'Anonymous' 
                })
            });

            if (res.ok) {
                setNewReview('');
                setSelectedProductId(null);
                fetchData();
            }
        } catch (err) {
            console.error('Error adding review:', err);
        }
    };

    const getProductReviews = (productId) => {
        return reviews.filter(r => r.productId === productId);
    };

    return (
        <Layout role="customer">
            <div className="max-w-6xl mx-auto">
                <header className="mb-8 p-6 bg-white rounded-2xl shadow-sm border border-gray-100 flex justify-between items-center">
                    <div>
                        <h2 className="text-3xl font-bold text-gray-900">Artisan Marketplace</h2>
                        <p className="mt-2 text-gray-600">Discover and purchase unique handcrafted goods.</p>
                    </div>
                    <div className="hidden md:flex p-4 bg-brand-50 text-brand-700 rounded-xl items-center gap-3">
                        <Info className="w-5 h-5" />
                        <span className="text-sm font-medium">Try adding products via the Vendor portal!</span>
                    </div>
                </header>

                {products.length === 0 ? (
                    <div className="text-center py-24 bg-white rounded-2xl shadow-sm border border-gray-100">
                        <ShoppingCart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-xl font-medium text-gray-900">No products available</h3>
                        <p className="text-gray-500 mt-2">Vendors haven't listed any items yet. Check back soon!</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                        {products.map((product) => {
                            const productReviews = getProductReviews(product.id);
                            return (
                                <div key={product.id} className="bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all border border-gray-100 overflow-hidden flex flex-col group">
                                    {product.image ? (
                                        <div className="h-48 w-full border-b border-gray-50 overflow-hidden">
                                            <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform origin-bottom duration-300" />
                                        </div>
                                    ) : (
                                        <div className="h-48 bg-gradient-to-br from-brand-100 to-white flex flex-col items-center justify-center border-b border-gray-50 group-hover:scale-[1.02] transition-transform origin-bottom duration-300">
                                            <Star className="w-12 h-12 text-brand-300 mb-2" />
                                            <span className="text-xs font-semibold text-brand-600 uppercase tracking-widest">Handcrafted</span>
                                        </div>
                                    )}

                                    <div className="p-6 flex-1 flex flex-col">
                                        <div className="flex justify-between items-start mb-2">
                                            <h3 className="text-xl font-bold text-gray-900 leading-tight">{product.name}</h3>
                                            <span className="text-lg font-bold text-brand-600 ml-3">${Number(product.price).toFixed(2)}</span>
                                        </div>

                                        <button
                                            onClick={() => handleOrder(product)}
                                            className="mt-4 w-full bg-brand-600 text-white font-medium py-3 px-4 rounded-xl hover:bg-brand-700 hover:shadow-md transition-all flex items-center justify-center gap-2 active:scale-95 duration-200"
                                        >
                                            <ShoppingCart className="w-5 h-5" />
                                            Order Now
                                        </button>

                                        <div className="mt-6 pt-6 border-t border-gray-100 flex-1 flex flex-col">
                                            <div className="flex items-center justify-between mb-4">
                                                <div className="flex items-center gap-2">
                                                    <MessageSquare className="w-4 h-4 text-gray-400" />
                                                    <h4 className="text-sm font-semibold text-gray-700">Reviews ({productReviews.length})</h4>
                                                </div>
                                            </div>

                                            {productReviews.length > 0 ? (
                                                <div className="space-y-3 mb-4 max-h-32 overflow-y-auto pr-2 custom-scrollbar">
                                                    {productReviews.map(review => (
                                                        <div key={review.id} className="bg-gray-50 p-3.5 rounded-xl text-sm text-gray-700 border border-gray-100 shadow-sm">
                                                            "{review.comment}"
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <p className="text-sm text-gray-400 mb-4 italic">Be the first to review this product!</p>
                                            )}

                                            {selectedProductId === product.id ? (
                                                <form onSubmit={(e) => handleAddReview(e, product.id)} className="mt-auto animate-in fade-in slide-in-from-bottom-2 duration-200">
                                                    <textarea
                                                        value={newReview}
                                                        onChange={(e) => setNewReview(e.target.value)}
                                                        placeholder="Write a review..."
                                                        className="w-full px-3 py-2.5 text-sm border border-brand-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none resize-none mb-3 bg-brand-50/30"
                                                        rows="2"
                                                        required
                                                    />
                                                    <div className="flex gap-2">
                                                        <button
                                                            type="submit"
                                                            className="bg-brand-100 text-brand-700 text-sm font-semibold py-2 px-3 rounded-lg hover:bg-brand-200 transition-colors flex-1"
                                                        >
                                                            Submit
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                setSelectedProductId(null);
                                                                setNewReview('');
                                                            }}
                                                            className="bg-gray-100 text-gray-600 text-sm font-semibold py-2 px-3 rounded-lg hover:bg-gray-200 transition-colors"
                                                        >
                                                            Cancel
                                                        </button>
                                                    </div>
                                                </form>
                                            ) : (
                                                <button
                                                    onClick={() => setSelectedProductId(product.id)}
                                                    className="mt-auto text-sm text-brand-600 hover:text-brand-800 font-medium text-left w-max transition-colors px-2 py-1 -ml-2 rounded-md hover:bg-brand-50"
                                                >
                                                    + Add a Review
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </Layout>
    );
};

export default CustomerMarketplace;
