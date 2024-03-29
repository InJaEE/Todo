import React from 'react';
import {View, Text, StyleSheet, Image} from 'react-native';

const Empty = () => {
  return (
    <View style={styles.block}>
      <Image
        style={styles.image}
        source={require('../assets/images/young_and_happy.png')}
      />
      <Text styl={styles.description}>할일이 없습니다.</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  block: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {
    width: 240,
    height: 179,
    marginBottom: 16,
  },
  description: {
    fontSize: 24,
    color: '#9e9e9e',
  },
});

export default Empty;
