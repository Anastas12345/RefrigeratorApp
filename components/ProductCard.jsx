import { View, Text } from 'react-native';

export default function ProductCard({ product }) {

  const formattedDate = product.expiration_date
    ? new Date(product.expiration_date).toLocaleDateString('uk-UA')
    : '—';

  return (
    <View
      style={{
        backgroundColor: '#fff',
        padding: 15,
        marginVertical: 8,
        borderRadius: 15,
      }}
    >
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
        }}
      >
        <Text style={{ fontSize: 16, fontWeight: '600' }}>
          {product.name}
        </Text>

        <Text style={{ fontSize: 14 }}>
          {product.quantity} {product.unit}
        </Text>
      </View>

      <Text style={{ color: '#999', marginTop: 4 }}>
        {formattedDate}
      </Text>

      <View
        style={{
          height: 6,
          backgroundColor: '#E0E0E0',
          borderRadius: 4,
          marginVertical: 8,
        }}
      >
        <View
          style={{
            width: '60%',
            height: '100%',
            backgroundColor: '#6EDC5F',
            borderRadius: 4,
          }}
        />
      </View>

      <Text style={{ fontSize: 12, color: '#999' }}>
        {product.storage_places?.name || '—'}
      </Text>
    </View>
  );
}