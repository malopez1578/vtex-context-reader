import React from 'react'
import { useCssHandles } from 'vtex.css-handles'
import { useProduct } from 'vtex.product-context'

const CSS_HANDLES = ['container', 'title', 'description'] as const

interface ProductInfoProps {
  showDescription?: boolean
}

const ProductInfo: React.FC<ProductInfoProps> = ({ showDescription = true }) => {
  const handles = useCssHandles(CSS_HANDLES)
  const productContextValue = useProduct()

  if (!productContextValue?.product) {
    return null
  }

  const { product } = productContextValue

  return (
    <div className={handles.container}>
      <h2 className={handles.title}>{product.productName}</h2>
      {showDescription && (
        <p className={handles.description}>{product.description}</p>
      )}
    </div>
  )
}

export default ProductInfo
