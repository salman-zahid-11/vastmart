import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { createProduct, updateProduct, getProductById } from '../services/productService';
import { createProduct, updateProduct, getProductById, getCategories, getSubCategories } from '../services/productService';
import './AddProduct.css';

const MAX_IMAGES = 5;

function AddProduct() {
  const navigate = useNavigate();
  const { id } = useParams(); // present only when editing
  const isEditMode = Boolean(id);

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
  const [existingImages, setExistingImages] = useState([]); // URLs already saved (edit mode)
  const [newImages, setNewImages] = useState([]); // new File objects
  const [newPreviews, setNewPreviews] = useState([]);
  const [imageUrls, setImageUrls] = useState(['']);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(isEditMode);
  const [categoryOptions, setCategoryOptions] = useState([]);
  const [subCategoryOptions, setSubCategoryOptions] = useState([]);
  const [categoryMode, setCategoryMode] = useState('select'); // 'select' | 'custom'
  const [subCategoryMode, setSubCategoryMode] = useState('select');

  useEffect(() => {
    if (!isEditMode) return;

    getProductById(id)
      .then((product) => {
        setFormData({
          name: product.name || '',
          description: product.description || '',
          price: product.price || '',
          category: product.category || '',
          subCategory: product.subCategory || '',
          brand: product.brand || '',
          stock: product.stock ?? '',
          productType: product.productType || 'physical',
        });
        setExistingImages(product.images || []);
      })
      .catch(() => setError('Failed to load product'))
      .finally(() => setPageLoading(false));
  }, [id, isEditMode]);

    useEffect(() => {
    getCategories().then(setCategoryOptions).catch(() => setCategoryOptions([]));
  }, []);
    useEffect(() => {
    if (formData.category) {
      getSubCategories(formData.category).then(setSubCategoryOptions).catch(() => setSubCategoryOptions([]));
    } else {
      setSubCategoryOptions([]);
    }
  }, [formData.category]);


  const totalImageCount = existingImages.length + newImages.length;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageSelect = (e) => {
    const files = Array.from(e.target.files);
    const combined = [...newImages, ...files].slice(0, MAX_IMAGES - existingImages.length);
    setNewImages(combined);
    setNewPreviews(combined.map((file) => URL.createObjectURL(file)));
    e.target.value = '';
  };

  const handleRemoveExisting = (index) => {
    setExistingImages(existingImages.filter((_, i) => i !== index));
  };

  const handleRemoveNew = (index) => {
    const filtered = newImages.filter((_, i) => i !== index);
    setNewImages(filtered);
    setNewPreviews(filtered.map((file) => URL.createObjectURL(file)));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (totalImageCount === 0 && imageUrls.every((u) => !u.trim())) {
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
      newImages.forEach((file) => data.append('images', file));

      const validUrls = imageUrls.map((u) => u.trim()).filter(Boolean);
      const combinedExisting = [...existingImages, ...validUrls];

      if (isEditMode) {
        data.append('existingImages', JSON.stringify(combinedExisting));
        await updateProduct(id, data);
      } else {
        if (validUrls.length > 0) {
          data.append('imageUrls', JSON.stringify(validUrls));
        }
        await createProduct(data);
      }

      navigate('/seller/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save product');
    } finally {
      setLoading(false);
    }
  };

  if (pageLoading) return <p className="page-loading">Loading product...</p>;

  return (
    <div className="add-product">
      <Link to="/seller/dashboard" className="add-product__back">← Back to dashboard</Link>
      <h1 className="add-product__title">{isEditMode ? 'Edit product' : 'Add a new product'}</h1>
      <p className="add-product__subtitle">
        {isEditMode
          ? 'Changes will be sent for admin re-approval before going live again.'
          : "It'll go live once an admin approves it."}
      </p>

      {error && <p className="checkout-form__error">{error}</p>}

      <form onSubmit={handleSubmit} className="add-product__form">
        <div className="add-product__preview">
          <div className="add-product__image-grid">
            {existingImages.map((src, i) => (
              <div key={`existing-${i}`} className="add-product__image-slot add-product__image-slot--filled">
                <img src={src} alt={`Existing ${i + 1}`} />
                <button type="button" onClick={() => handleRemoveExisting(i)} className="add-product__image-remove">×</button>
                {i === 0 && existingImages.length > 0 && <span className="add-product__image-main-badge">Main</span>}
              </div>
            ))}

            {newPreviews.map((src, i) => (
              <div key={`new-${i}`} className="add-product__image-slot add-product__image-slot--filled">
                <img src={src} alt={`New ${i + 1}`} />
                <button type="button" onClick={() => handleRemoveNew(i)} className="add-product__image-remove">×</button>
                {existingImages.length === 0 && i === 0 && <span className="add-product__image-main-badge">Main</span>}
              </div>
            ))}

            {totalImageCount < MAX_IMAGES && (
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
            {totalImageCount} / {MAX_IMAGES} images · First photo is the main image
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
            <input type="text" name="name" value={formData.name} onChange={handleChange} required />
          </div>

          <div className="checkout-form__field">
            <label>Description</label>
            <textarea name="description" value={formData.description} onChange={handleChange} rows={4} required />
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
              {categoryMode === 'select' ? (
                <select
                  name="category"
                  value={formData.category}
                  onChange={(e) => {
                    if (e.target.value === '__custom__') {
                      setCategoryMode('custom');
                      setFormData({ ...formData, category: '' });
                    } else {
                      handleChange(e);
                    }
                  }}
                  required
                >
                  <option value="">Select a category...</option>
                  {categoryOptions.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                  <option value="__custom__">+ Add a new category</option>
                </select>
              ) : (
                <div className="checkout-form__combo-row">
                  <input
                    type="text"
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    placeholder="Type new category name"
                    required
                  />
                  <button type="button" onClick={() => setCategoryMode('select')} className="checkout-form__combo-back">
                    ← Choose existing
                  </button>
                </div>
              )}
            </div>

            <div className="checkout-form__field">
              <label>Sub-category</label>
              {subCategoryMode === 'select' ? (
                <select
                  name="subCategory"
                  value={formData.subCategory}
                  onChange={(e) => {
                    if (e.target.value === '__custom__') {
                      setSubCategoryMode('custom');
                      setFormData({ ...formData, subCategory: '' });
                    } else {
                      handleChange(e);
                    }
                  }}
                >
                  <option value="">None</option>
                  {subCategoryOptions.map((sub) => (
                    <option key={sub} value={sub}>{sub}</option>
                  ))}
                  <option value="__custom__">+ Add a new sub-category</option>
                </select>
              ) : (
                <div className="checkout-form__combo-row">
                  <input
                    type="text"
                    name="subCategory"
                    value={formData.subCategory}
                    onChange={handleChange}
                    placeholder="Type new sub-category"
                  />
                  <button type="button" onClick={() => setSubCategoryMode('select')} className="checkout-form__combo-back">
                    ← Choose existing
                  </button>
                </div>
              )}
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
            {loading ? 'Saving...' : isEditMode ? 'Save Changes' : 'Create Product'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default AddProduct;