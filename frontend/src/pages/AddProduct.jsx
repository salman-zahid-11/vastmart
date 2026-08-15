import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { createProduct } from '../services/productService';
import './AddProduct.css';

function AddProduct() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    subCategory: '',
    brand: '',
    stock: '',
    productType: 'physical',
    imageUrl: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const payload = {
        name: formData.name,
        description: formData.description,
        price: Number(formData.price),
        category: formData.category,
        subCategory: formData.subCategory,
        brand: formData.brand,
        stock: Number(formData.stock),
        productType: formData.productType,
        images: formData.imageUrl ? [formData.imageUrl] : [],
      };

      await createProduct(payload);
      navigate('/seller/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create product');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="add-product">
      <Link to="/seller/dashboard" className="add-product__back">← Back to dashboard</Link>
      <h1 className="add-product__title">Add a new product</h1>
      <p className="add-product__subtitle">It'll go live once an admin approves it.</p>

      {error && <p className="checkout-form__error">{error}</p>}

      <form onSubmit={handleSubmit} className="add-product__form">
        <div className="add-product__preview">
          <div className="add-product__preview-image">
            {formData.imageUrl ? (
              <img src={formData.imageUrl} alt="Preview" />
            ) : (
              <span>Image preview</span>
            )}
          </div>
          <div className="checkout-form__field">
            <label>Image URL</label>
            <input type="text" name="imageUrl" value={formData.imageUrl} onChange={handleChange} placeholder="https://..." />
          </div>
        </div>

        <div className="add-product__fields">
          <div className="checkout-form__field">
            <label>Product Name</label>
            <input type="text" name="name" value={formData.name} onChange={handleChange} required placeholder="e.g. Wireless Mechanical Keyboard" />
          </div>

          <div className="checkout-form__field">
            <label>Description</label>
            <textarea name="description" value={formData.description} onChange={handleChange} rows={4} required placeholder="Describe what makes this product great..." />
          </div>

          <div className="checkout-form__row">
            <div className="checkout-form__field">
              <label>Price (৳)</label>
              <input type="number" name="price" value={formData.price} onChange={handleChange} min="0" required />
            </div>
            <div className="checkout-form__field">
              <label>Stock Quantity</label>
              <input type="number" name="stock" value={formData.stock} onChange={handleChange} min="0" required />
            </div>
          </div>

          <div className="checkout-form__row">
            <div className="checkout-form__field">
              <label>Category</label>
              <input type="text" name="category" value={formData.category} onChange={handleChange} required placeholder="e.g. Electronics" />
            </div>
            <div className="checkout-form__field">
              <label>Sub-category</label>
              <input type="text" name="subCategory" value={formData.subCategory} onChange={handleChange} placeholder="Optional" />
            </div>
          </div>

          <div className="checkout-form__row">
            <div className="checkout-form__field">
              <label>Brand</label>
              <input type="text" name="brand" value={formData.brand} onChange={handleChange} placeholder="Optional" />
            </div>
            <div className="checkout-form__field">
              <label>Product Type</label>
              <select name="productType" value={formData.productType} onChange={handleChange}>
                <option value="physical">Physical</option>
                <option value="digital">Digital</option>
              </select>
            </div>
          </div>

          <button type="submit" disabled={loading} className="add-product__submit">
            {loading ? 'Creating...' : 'Create Product'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default AddProduct;