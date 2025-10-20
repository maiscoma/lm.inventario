"use client"

import { useParams } from "react-router-dom"
import ProductForm from "../components/ProductForm"

const EditProductPage = () => {
  const { id } = useParams()

  return <ProductForm productId={id} isEdit={true} />
}

export default EditProductPage
