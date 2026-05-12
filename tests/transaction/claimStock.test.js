const Product = require('../../models/Product');

describe('Product.claimStock', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('mengembalikan claimed item dan menjaga pipeline aman saat sisa stok = 0', async () => {
    const mockDocBefore = {
      _id: '507f1f77bcf86cd799439011',
      kontenProduk: ['KODE-1'],
      totalTerjual: 0,
    };

    const spy = jest.spyOn(Product, 'findOneAndUpdate').mockResolvedValue(mockDocBefore);

    const result = await Product.claimStock(mockDocBefore._id, 1);

    expect(spy).toHaveBeenCalledTimes(1);
    const updatePipeline = spy.mock.calls[0][1];
    expect(Array.isArray(updatePipeline)).toBe(true);

    // Pastikan update kontenProduk tidak pernah mengirim $slice length = 0
    // (menggunakan guard $let + $cond, lalu [] jika remaining <= 0).
    expect(JSON.stringify(updatePipeline)).toContain('"$let"');
    expect(JSON.stringify(updatePipeline)).toContain('"$cond"');

    expect(result).toBeDefined();
    expect(result.claimed).toEqual(['KODE-1']);
    expect(result.product).toEqual(mockDocBefore);
  });

  test('return null saat stok tidak cukup / dokumen tidak ditemukan', async () => {
    jest.spyOn(Product, 'findOneAndUpdate').mockResolvedValue(null);
    const result = await Product.claimStock('507f1f77bcf86cd799439012', 2);
    expect(result).toBeNull();
  });
});
