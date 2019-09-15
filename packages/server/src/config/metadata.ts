const MetadataKey = Symbol('meta-data');

const getOrSetMetadataMap = (obj: any) => {
  const metadata = obj[MetadataKey];
  if (!metadata) {
    obj[MetadataKey] = new Map();
    return obj[MetadataKey];
  } else {
    return metadata;
  }
};

export const getMetadata = (obj: any, key: symbol) => {
  const metadata = getOrSetMetadataMap(obj);

  const value = metadata.get(key);

  return typeof value === 'undefined' ? null : value;
};

export const setMetadata = (obj: any, key: symbol, val: any) => {
  const metadata = getOrSetMetadataMap(obj);

  metadata.set(key, val);

  return val;
};
