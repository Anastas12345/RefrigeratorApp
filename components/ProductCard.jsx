import { View, Text } from 'react-native';
import { calculateProgress, getProgressColor } from "../constants/utils/dateProgress";

export default function ProductCard({ product }) {

  const formattedDate = product.expiration_date
    ? new Date(product.expiration_date).toLocaleDateString('uk-UA')
    : '—';

  const percent = calculateProgress(
    product.created_at,
    product.expiration_date
  );

  const progressColor = getProgressColor(percent);

  const isExpired = percent === 0;

  return (
    <View
      style={{
        backgroundColor: isExpired ? '#FDECEC' : '#fff', // ніжний червоний
        padding: 15,
        marginVertical: 8,
        borderRadius: 15,
        borderWidth: isExpired ? 1 : 0,
        borderColor: isExpired ? '#F5C2C2' : 'transparent',
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 6,
        shadowOffset: { width: 0, height: 3 },
        elevation: 2,
      }}
    >
      {/* Назва + кількість */}
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
        }}
      >
        <Text
          style={{
            fontSize: 16,
            fontWeight: '600',
            color: isExpired ? '#B3261E' : '#000',
          }}
        >
          {product.name}
        </Text>

        <Text style={{ fontSize: 14 }}>
          {product.quantity} {product.unit}
        </Text>
      </View>

      {/* Дата придатності */}
      <Text
        style={{
          color: isExpired ? '#B3261E' : '#999',
          marginTop: 4,
        }}
      >
        {formattedDate}
      </Text>

      {/* Прогрес бар */}
      <View
        style={{
          height: 6,
          backgroundColor: '#E0E0E0',
          borderRadius: 4,
          overflow: 'hidden',
          marginVertical: 8,
        }}
      >
        <View
          style={{
            width: `${percent}%`,
            height: '100%',
            backgroundColor: progressColor,
            borderRadius: 4,
          }}
        />
      </View>

      {/* Місце зберігання */}
      <Text style={{ fontSize: 12, color: '#999' }}>
        {product.storage_places?.name || '—'}
      </Text>
    </View>
  );
}