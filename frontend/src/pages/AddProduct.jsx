import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { createProduct } from '../services/productService';
import './AddProduct.css';

const MAX_IMAGES = 5;

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
  });
  const [images, setImages] = useState([]); // File objects
  const [previews, setPreviews] = useState([]);
    const [imageUrls, setImageUrls] = useState(['']);  // object URLs
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageSelect = (e) => {
    const files = Array.from(e.target.files);
    const combined = [...images, ...files].slice(0, MAX_IMAGES);
    setImages(combined);
    setPreviews(combined.map((file) => URL.createObjectURL(file)));
    e.target.value = ''; // allow re-selecting the same file if removed
  };

  const handleRemoveImage = (index) => {
    const newImages = images.filter((_, i) => i !== index);
    setImages(newImages);
    setPreviews(newImages.map((file) => URL.createObjectURL(file)));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (images.length === 0) {
      setError('Please add at least one product image');
      return;
    }

    setLoading(true);
    try {
      const data = new FormData();
      data.append('name', formData.name);
      data.append('description', formData.description);
      data.append('price', formData.price);
      data.append('category', formData.category);
      data.append('subCategory', formData.subCategory);
      data.append('brand', formData.brand);
      data.append('stock', formData.stock);
      data.append('productType', formData.productType);
      images.forEach((file) => data.append('images', file));

      const validUrls = imageUrls.map((u) => u.trim()).filter(Boolean);
      if (validUrls.length > 0) {
        data.append('imageUrls', JSON.stringify(validUrls));
      }

      await createProduct(data);
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
          <div className="add-product__image-grid">
            {previews.map((src, i) => (
              <div key={i} className="add-product__image-slot add-product__image-slot--filled">
                <img src={src} alt={`Preview ${i + 1}`} />
                <button type="button" onClick={() => handleRemoveImage(i)} className="add-product__image-remove">×</button>
                {i === 0 && <span className="add-product__image-main-badge">Main</span>}
              </div>
            ))}

            {images.length < MAX_IMAGES && (
              <label className="add-product__image-slot add-product__image-slot--add">
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  multiple
                  onChange={handleImageSelect}
                  style={{ display: 'none' }}
                />
                <span>+</span>
                <span className="add-product__image-add-label">Add photo</span>
              </label>
            )}
          </div>
                   <p className="add-product__image-hint">
            {images.length} / {MAX_IMAGES} images · First photo is the main image
          </p>

          <div className="add-product__url-section">
            <p className="add-product__url-label">Or paste image URLs instead</p>
            {imageUrls.map((url, i) => (
              <input
                key={i}
                type="text"
                value={url}
                onChange={(e) => {
                  const newUrls = [...imageUrls];
                  newUrls[i] = e.target.value;
                  setImageUrls(newUrls);
                }}
                placeholder="https://example.com/photo.jpg"
                className="add-product__url-input"
              />
            ))}
            {imageUrls.length < MAX_IMAGES && (
              <button
                type="button"
                onClick={() => setImageUrls([...imageUrls, ''])}
                className="add-product__url-add"
              >
                + Add another URL
              </button>
            )}
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