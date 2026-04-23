'use client'

import type { CSSProperties } from 'react'
import { useState } from 'react'

import { getProductTotalStock } from '@/lib/shop/logic'
import type { ShopProduct, ShopProductCategory } from '@/lib/shop/types'

import { saveProductDetails } from './actions'

const NEW_PRODUCT_ID = '__new__'

const CATEGORY_OPTIONS: Array<{ value: ShopProductCategory; label: string }> = [
  { value: 'uniforms', label: 'Uniforms' },
  { value: 'belts', label: 'Belts' },
  { value: 'gear', label: 'Gear' },
  { value: 'merchandise', label: 'Merchandise' },
]

const BELT_OPTIONS = ['None', 'White', 'Yellow', 'Orange', 'Green', 'Blue', 'Brown', 'Black']

type ProductEditorVariant = {
  id: string
  size: string
  stock: string
  requiresApproval: boolean
}

type ProductEditorState = {
  id: string
  createdAt?: string
  name: string
  description: string
  category: ShopProductCategory
  price: string
  imagesText: string
  rating: string
  reviewCount: string
  isPublic: boolean
  requiresBelt: string
  variants: ProductEditorVariant[]
}

function createEmptyEditor(): ProductEditorState {
  return {
    id: '',
    name: '',
    description: '',
    category: 'merchandise',
    price: '0',
    imagesText: '',
    rating: '0',
    reviewCount: '0',
    isPublic: true,
    requiresBelt: 'None',
    variants: [{ id: '', size: 'Standard', stock: '0', requiresApproval: false }],
  }
}

function productToEditor(product: ShopProduct): ProductEditorState {
  return {
    id: product.id,
    createdAt: product.created_at,
    name: product.name,
    description: product.description,
    category: product.category,
    price: String(product.price),
    imagesText: product.images.join('\n'),
    rating: String(product.rating),
    reviewCount: String(product.review_count),
    isPublic: product.is_public,
    requiresBelt: product.requires_belt || 'None',
    variants:
      product.variants.length > 0
        ? product.variants.map((variant) => ({
            id: variant.id,
            size: variant.size,
            stock: String(variant.stock),
            requiresApproval: Boolean(variant.requiresApproval),
          }))
        : [{ id: '', size: 'Standard', stock: '0', requiresApproval: false }],
  }
}

function upsertProductInState(products: ShopProduct[], nextProduct: ShopProduct): ShopProduct[] {
  const existingIndex = products.findIndex((product) => product.id === nextProduct.id)

  if (existingIndex === -1) {
    return [nextProduct, ...products]
  }

  return products.map((product) =>
    product.id === nextProduct.id ? nextProduct : product
  )
}

export default function AdminProductClient({
  initialProducts,
}: {
  initialProducts: ShopProduct[]
}) {
  const [products, setProducts] = useState(initialProducts)
  const [selectedProductId, setSelectedProductId] = useState(
    initialProducts[0]?.id || NEW_PRODUCT_ID
  )
  const [editor, setEditor] = useState<ProductEditorState>(
    initialProducts[0] ? productToEditor(initialProducts[0]) : createEmptyEditor()
  )
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  const openProduct = (product: ShopProduct) => {
    setSelectedProductId(product.id)
    setEditor(productToEditor(product))
    setError('')
    setMessage('')
  }

  const startNewProduct = () => {
    setSelectedProductId(NEW_PRODUCT_ID)
    setEditor(createEmptyEditor())
    setError('')
    setMessage('')
  }

  const updateEditor = <Field extends keyof ProductEditorState>(
    field: Field,
    value: ProductEditorState[Field]
  ) => {
    setEditor((current) => ({
      ...current,
      [field]: value,
    }))
  }

  const updateVariant = (
    index: number,
    field: keyof ProductEditorVariant,
    value: string | boolean
  ) => {
    setEditor((current) => ({
      ...current,
      variants: current.variants.map((variant, variantIndex) =>
        variantIndex === index
          ? { ...variant, [field]: value }
          : variant
      ),
    }))
  }

  const addVariant = () => {
    setEditor((current) => ({
      ...current,
      variants: [
        ...current.variants,
        { id: '', size: '', stock: '0', requiresApproval: false },
      ],
    }))
  }

  const removeVariant = (index: number) => {
    setEditor((current) => ({
      ...current,
      variants:
        current.variants.length === 1
          ? current.variants
          : current.variants.filter((_, variantIndex) => variantIndex !== index),
    }))
  }

  const handleSave = async () => {
    setSaving(true)
    setError('')
    setMessage('')

    const response = await saveProductDetails({
      id: editor.id.trim() || undefined,
      created_at: editor.createdAt,
      name: editor.name,
      description: editor.description,
      category: editor.category,
      price: Number(editor.price),
      images: editor.imagesText
        .split('\n')
        .map((image) => image.trim())
        .filter(Boolean),
      rating: Number(editor.rating || 0),
      review_count: Number(editor.reviewCount || 0),
      is_public: editor.isPublic,
      requires_belt:
        editor.isPublic || editor.requiresBelt === 'None'
          ? null
          : editor.requiresBelt,
      variants: editor.variants.map((variant) => ({
        id: variant.id.trim() || undefined,
        size: variant.size,
        stock: Number(variant.stock),
        requiresApproval: variant.requiresApproval,
      })),
    })

    setSaving(false)

    if (!response.success || !response.product) {
      setError(response.error || 'Failed to save the product.')
      return
    }

    setProducts((current) => upsertProductInState(current, response.product))
    setSelectedProductId(response.product.id)
    setEditor(productToEditor(response.product))
    setMessage('Product saved. The storefront now reads this updated version.')
  }

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'minmax(0, 1.15fr) minmax(340px, 0.85fr)',
        gap: '1.5rem',
        alignItems: 'start',
      }}
    >
      <section
        style={{
          background: '#0a0a0a',
          border: '1px solid #222',
          borderRadius: '18px',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '1.25rem 1.5rem',
            borderBottom: '1px solid #1c1c1c',
            background: 'rgba(255,255,255,0.02)',
          }}
        >
          <div>
            <div style={{ color: '#fff', fontSize: '1.1rem', fontWeight: 700 }}>
              Catalog Control
            </div>
            <div style={{ color: '#888', fontSize: '0.85rem' }}>
              {products.length} products currently linked to the storefront
            </div>
          </div>

          <button
            type="button"
            onClick={startNewProduct}
            style={{
              background: 'var(--gold, #ffb703)',
              color: '#000',
              border: 'none',
              borderRadius: '999px',
              padding: '0.8rem 1.1rem',
              fontWeight: 800,
              cursor: 'pointer',
            }}
          >
            Add Product
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {products.map((product) => {
            const totalStock = getProductTotalStock(product)
            const selected = selectedProductId === product.id

            return (
              <button
                key={product.id}
                type="button"
                onClick={() => openProduct(product)}
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'minmax(0, 1.7fr) 120px 140px',
                  gap: '1rem',
                  textAlign: 'left',
                  padding: '1.2rem 1.5rem',
                  border: 'none',
                  borderBottom: '1px solid #1a1a1a',
                  background: selected ? 'rgba(255,183,3,0.06)' : 'transparent',
                  color: '#fff',
                  cursor: 'pointer',
                }}
              >
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontWeight: 700, marginBottom: '0.35rem' }}>{product.name}</div>
                  <div
                    style={{
                      color: '#888',
                      fontSize: '0.8rem',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {product.id}
                  </div>
                  <div
                    style={{
                      display: 'flex',
                      gap: '0.5rem',
                      flexWrap: 'wrap',
                      marginTop: '0.75rem',
                    }}
                  >
                    <span
                      style={{
                        border: '1px solid rgba(255,255,255,0.12)',
                        borderRadius: '999px',
                        padding: '0.2rem 0.6rem',
                        fontSize: '0.72rem',
                        color: '#aaa',
                        textTransform: 'uppercase',
                      }}
                    >
                      {product.category}
                    </span>
                    <span
                      style={{
                        border: '1px solid rgba(255,255,255,0.12)',
                        borderRadius: '999px',
                        padding: '0.2rem 0.6rem',
                        fontSize: '0.72rem',
                        color: product.is_public ? '#4caf50' : '#ffb703',
                        textTransform: 'uppercase',
                      }}
                    >
                      {product.is_public
                        ? 'Public Checkout'
                        : product.requires_belt
                          ? `${product.requires_belt}+`
                          : 'Athletes Only'}
                    </span>
                  </div>
                </div>

                <div>
                  <div style={{ color: '#888', fontSize: '0.78rem', marginBottom: '0.35rem' }}>
                    Price
                  </div>
                  <div style={{ fontWeight: 700 }}>₹{product.price.toLocaleString()}</div>
                </div>

                <div>
                  <div style={{ color: '#888', fontSize: '0.78rem', marginBottom: '0.35rem' }}>
                    Stock
                  </div>
                  <div style={{ fontWeight: 700 }}>{totalStock} units</div>
                  <div style={{ color: '#777', fontSize: '0.78rem', marginTop: '0.25rem' }}>
                    {product.variants.length} variants
                  </div>
                </div>
              </button>
            )
          })}
        </div>
      </section>

      <section
        style={{
          background: '#0a0a0a',
          border: '1px solid #222',
          borderRadius: '18px',
          padding: '1.5rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.25rem',
        }}
      >
        <div>
          <div style={{ color: '#fff', fontSize: '1.2rem', fontWeight: 700 }}>
            {selectedProductId === NEW_PRODUCT_ID ? 'Create Product' : 'Edit Product'}
          </div>
          <div style={{ color: '#888', fontSize: '0.85rem', marginTop: '0.35rem' }}>
            Everything saved here becomes the live shop source of truth.
          </div>
        </div>

        <label style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
          <span style={{ color: '#aaa', fontSize: '0.82rem', textTransform: 'uppercase' }}>
            Product Name
          </span>
          <input
            value={editor.name}
            onChange={(event) => updateEditor('name', event.target.value)}
            style={inputStyle}
          />
        </label>

        <label style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
          <span style={{ color: '#aaa', fontSize: '0.82rem', textTransform: 'uppercase' }}>
            Product ID
          </span>
          <input
            value={editor.id}
            onChange={(event) => updateEditor('id', event.target.value)}
            placeholder="Leave blank to auto-generate"
            style={inputStyle}
          />
        </label>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)',
            gap: '0.9rem',
          }}
        >
          <label style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
            <span style={{ color: '#aaa', fontSize: '0.82rem', textTransform: 'uppercase' }}>
              Category
            </span>
            <select
              value={editor.category}
              onChange={(event) =>
                updateEditor('category', event.target.value as ShopProductCategory)
              }
              style={inputStyle}
            >
              {CATEGORY_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <label style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
            <span style={{ color: '#aaa', fontSize: '0.82rem', textTransform: 'uppercase' }}>
              Price
            </span>
            <input
              type="number"
              min="0"
              value={editor.price}
              onChange={(event) => updateEditor('price', event.target.value)}
              style={inputStyle}
            />
          </label>
        </div>

        <label style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
          <span style={{ color: '#aaa', fontSize: '0.82rem', textTransform: 'uppercase' }}>
            Description
          </span>
          <textarea
            value={editor.description}
            onChange={(event) => updateEditor('description', event.target.value)}
            rows={5}
            style={textareaStyle}
          />
        </label>

        <label style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
          <span style={{ color: '#aaa', fontSize: '0.82rem', textTransform: 'uppercase' }}>
            Images
          </span>
          <textarea
            value={editor.imagesText}
            onChange={(event) => updateEditor('imagesText', event.target.value)}
            rows={4}
            placeholder="One image URL per line"
            style={textareaStyle}
          />
        </label>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)',
            gap: '0.9rem',
          }}
        >
          <label style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
            <span style={{ color: '#aaa', fontSize: '0.82rem', textTransform: 'uppercase' }}>
              Rating
            </span>
            <input
              type="number"
              min="0"
              max="5"
              step="0.1"
              value={editor.rating}
              onChange={(event) => updateEditor('rating', event.target.value)}
              style={inputStyle}
            />
          </label>

          <label style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
            <span style={{ color: '#aaa', fontSize: '0.82rem', textTransform: 'uppercase' }}>
              Review Count
            </span>
            <input
              type="number"
              min="0"
              value={editor.reviewCount}
              onChange={(event) => updateEditor('reviewCount', event.target.value)}
              style={inputStyle}
            />
          </label>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)',
            gap: '0.9rem',
          }}
        >
          <label style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
            <span style={{ color: '#aaa', fontSize: '0.82rem', textTransform: 'uppercase' }}>
              Store Access
            </span>
            <select
              value={editor.isPublic ? 'public' : 'athlete'}
              onChange={(event) =>
                updateEditor('isPublic', event.target.value === 'public')
              }
              style={inputStyle}
            >
              <option value="public">Public Checkout</option>
              <option value="athlete">Athletes Only</option>
            </select>
          </label>

          <label style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
            <span style={{ color: '#aaa', fontSize: '0.82rem', textTransform: 'uppercase' }}>
              Required Belt
            </span>
            <select
              value={editor.isPublic ? 'None' : editor.requiresBelt}
              disabled={editor.isPublic}
              onChange={(event) => updateEditor('requiresBelt', event.target.value)}
              style={{
                ...inputStyle,
                opacity: editor.isPublic ? 0.5 : 1,
              }}
            >
              {BELT_OPTIONS.map((belt) => (
                <option key={belt} value={belt}>
                  {belt}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginTop: '0.25rem',
          }}
        >
          <div style={{ color: '#fff', fontWeight: 700 }}>Variants and Stock</div>
          <button
            type="button"
            onClick={addVariant}
            style={{
              background: 'transparent',
              border: '1px solid rgba(255,255,255,0.15)',
              color: '#fff',
              borderRadius: '999px',
              padding: '0.6rem 0.9rem',
              cursor: 'pointer',
              fontWeight: 700,
            }}
          >
            Add Variant
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
          {editor.variants.map((variant, index) => (
            <div
              key={`${variant.id || 'variant'}-${index}`}
              style={{
                border: '1px solid #222',
                borderRadius: '14px',
                padding: '1rem',
                display: 'grid',
                gridTemplateColumns: 'minmax(0, 1.2fr) 120px auto',
                gap: '0.75rem',
                alignItems: 'end',
              }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <input
                  value={variant.size}
                  onChange={(event) =>
                    updateVariant(index, 'size', event.target.value)
                  }
                  placeholder="Variant / Size"
                  style={inputStyle}
                />
                <input
                  value={variant.id}
                  onChange={(event) => updateVariant(index, 'id', event.target.value)}
                  placeholder="Variant ID (optional)"
                  style={inputStyle}
                />
              </div>

              <input
                type="number"
                min="0"
                value={variant.stock}
                onChange={(event) => updateVariant(index, 'stock', event.target.value)}
                placeholder="Stock"
                style={inputStyle}
              />

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <label
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    color: '#ccc',
                    fontSize: '0.82rem',
                  }}
                >
                  <input
                    type="checkbox"
                    checked={variant.requiresApproval}
                    onChange={(event) =>
                      updateVariant(index, 'requiresApproval', event.target.checked)
                    }
                  />
                  Needs approval
                </label>

                <button
                  type="button"
                  onClick={() => removeVariant(index)}
                  disabled={editor.variants.length === 1}
                  style={{
                    background: 'transparent',
                    border: '1px solid rgba(255,255,255,0.12)',
                    color: editor.variants.length === 1 ? '#555' : '#ff6b6b',
                    borderRadius: '10px',
                    padding: '0.65rem 0.8rem',
                    cursor: editor.variants.length === 1 ? 'not-allowed' : 'pointer',
                    fontWeight: 700,
                  }}
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>

        {error ? (
          <div
            style={{
              background: 'rgba(214,40,40,0.12)',
              border: '1px solid rgba(214,40,40,0.35)',
              borderRadius: '12px',
              padding: '0.9rem 1rem',
              color: '#ff8a8a',
              fontSize: '0.9rem',
            }}
          >
            {error}
          </div>
        ) : null}

        {message ? (
          <div
            style={{
              background: 'rgba(76,175,80,0.12)',
              border: '1px solid rgba(76,175,80,0.3)',
              borderRadius: '12px',
              padding: '0.9rem 1rem',
              color: '#8de29b',
              fontSize: '0.9rem',
            }}
          >
            {message}
          </div>
        ) : null}

        <div style={{ display: 'flex', gap: '0.8rem' }}>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            style={{
              flex: 1,
              background: 'var(--gold, #ffb703)',
              color: '#000',
              border: 'none',
              borderRadius: '12px',
              padding: '1rem 1.1rem',
              fontWeight: 900,
              cursor: saving ? 'wait' : 'pointer',
            }}
          >
            {saving ? 'Saving Product...' : 'Save Product'}
          </button>

          <button
            type="button"
            onClick={() =>
              selectedProductId === NEW_PRODUCT_ID
                ? startNewProduct()
                : openProduct(
                    products.find((product) => product.id === selectedProductId) ||
                      products[0]
                  )
            }
            style={{
              background: 'transparent',
              color: '#fff',
              border: '1px solid rgba(255,255,255,0.15)',
              borderRadius: '12px',
              padding: '1rem 1.1rem',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            Reset
          </button>
        </div>
      </section>
    </div>
  )
}

const inputStyle: CSSProperties = {
  width: '100%',
  background: '#050505',
  border: '1px solid #222',
  borderRadius: '12px',
  color: '#fff',
  padding: '0.85rem 1rem',
}

const textareaStyle: CSSProperties = {
  ...inputStyle,
  resize: 'vertical',
  minHeight: '120px',
}
