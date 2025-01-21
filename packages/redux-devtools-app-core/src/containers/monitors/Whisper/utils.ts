const flattenObject = (obj: any, prefix = '') => {
  if(!obj){
    return ''
  }

  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
  return Object.keys(obj).reduce((acc, key) => {
    const value = obj[key];
    const newKey = prefix ? `${prefix}.${key}` : key;

    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      Object.assign(acc, flattenObject(value, newKey));
    } else {
      acc = {
        ...acc,
        [newKey]: value
      }
    }
    return acc;
  }, {});
}

export {
  flattenObject
}