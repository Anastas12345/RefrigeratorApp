export interface Product {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  expiration_date: string;
  comment?: string;
  storage_places: { name: string };
  categoryId: number;
}

export let MOCK_PRODUCTS: Product[] = [
  {
    id: '1',
    name: 'Молоко',
    quantity: 1,
    unit: 'шт',
    expiration_date: '20-02-2026',
    comment: '144 ккал',
    storage_places: { name: 'Морозилка' },
    categoryId: 1,
  },
  {
    id: '2',
    name: 'Яйця',
    quantity: 10,
    unit: 'шт',
    expiration_date: '25-02-2026',
    comment: '',
    storage_places: { name: 'Холодильник' },
    categoryId: 14,
  },
  {
    id: '3',
    name: 'Хліб',
    quantity: 1,
    unit: 'шт',
    expiration_date: '18-02-2026',
    comment: '',
    storage_places: { name: 'Комора' },
    categoryId: 7,
  },
];

export function updateMockProduct(updatedProduct: Product) {
  const index = MOCK_PRODUCTS.findIndex(
    (p) => p.id === updatedProduct.id
  );

  if (index !== -1) {
    MOCK_PRODUCTS[index] = updatedProduct;
  }
}