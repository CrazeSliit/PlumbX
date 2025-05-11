"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import Head from "next/head";

const ProductPage = () => {
  const router = useRouter();
  const [cart, setCart] = useState([]);
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [addingToCartId, setAddingToCartId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch products from backend
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get("/api/inventory");
        setProducts(response.data);
        setFilteredProducts(response.data);
      } catch (error) {
        console.error("Error fetching products:", error);
        setError("Failed to load products. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Filter products based on search query
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredProducts(products);
    } else {
      const filtered = products.filter((product) =>
        product.itemName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.size.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredProducts(filtered);
    }
  }, [searchQuery, products]);

  // Load cart from localStorage
  useEffect(() => {
    const storedCart = localStorage.getItem("cart");
    if (storedCart) {
      setCart(JSON.parse(storedCart));
    }
  }, []);

  // Add product to cart
  const addToCart = (product) => {
    setAddingToCartId(product._id);

    const existingItem = cart.find((item) => item._id === product._id);
    let updatedCart;

    if (existingItem) {
      updatedCart = cart.map((item) =>
        item._id === product._id ? { ...item, quantity: item.quantity + 1 } : item
      );
    } else {
      updatedCart = [...cart, { ...product, quantity: 1 }];
    }

    setCart(updatedCart);
    localStorage.setItem("cart", JSON.stringify(updatedCart));

    setTimeout(() => {
      alert(`${product.itemName} added to cart!`);
      setAddingToCartId(null);
    }, 300); // Short delay for better UX
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-2xl font-semibold text-gray-600">Loading Products...</div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Our Products | MyShop</title>
      </Head>

      <div className="container mx-auto p-6 bg-gray-100 min-h-screen shadow-2xl">
        <h1 className="text-4xl font-extrabold text-center text-gray-900 mb-8">Our Products</h1>

        {/* Search Bar */}
        <div className="max-w-2xl mx-auto mb-8">
          <div className="relative">
            <input
              type="text"
              placeholder="Search products by name or size..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
            />
            <div className="absolute right-3 top-3">
              <svg
                className="w-6 h-6 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
          </div>
        </div>

        {error && (
          <div className="text-center text-red-600 mb-6 text-lg">{error}</div>
        )}

        {filteredProducts.length === 0 && !error ? (
          <p className="text-center text-xl text-gray-700">
            {searchQuery ? "No products found matching your search." : "No products found."}
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredProducts.map((product) => (
              <div
                key={product._id}
                className="bg-white rounded-lg shadow-lg p-6 flex flex-col items-center transition-transform duration-300 hover:scale-105"
              >
                <img
                  src={product.imageUrl || "/placeholder.png"} // 👈 fallback image
                  alt={product.itemName}
                  className="w-full h-56 object-cover rounded-md mb-4"
                />
                <h2 className="text-2xl font-semibold text-gray-800 text-center">
                  {product.itemName}
                </h2>
                <p className="text-gray-700 text-lg mt-2">Size: {product.size}</p>
                <p className="text-green-600 text-xl font-bold mt-3">
                  LKR {Number(product.price).toFixed(2)}
                </p>

                <button
                  className="mt-4 bg-yellow-500 text-white px-6 py-2 rounded-lg hover:bg-yellow-600 disabled:opacity-50"
                  onClick={() => addToCart(product)}
                  disabled={addingToCartId === product._id}
                >
                  {addingToCartId === product._id ? "Adding..." : "Add to Cart"}
                </button>
              </div>
            ))}
          </div>
        )}

        {/* View Cart Button */}
        <div className="flex justify-center mt-10">
          <button
            className="bg-yellow-500 text-white px-6 py-3 rounded-lg hover:bg-yellow-600"
            onClick={() => router.push("/customers/cart")}
          >
            View Cart
          </button>
        </div>
      </div>
    </>
  );
};

export default ProductPage;
