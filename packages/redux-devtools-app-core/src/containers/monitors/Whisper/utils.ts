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

const onlychanges = (value: any) => {
  if(!value) {
    return value
  }

  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
  return Object.keys(value).reduce<any>((prev, key) => {

    const keyValue = value[key]

    if(Array.isArray(keyValue)){
      const ln = keyValue.length;
      //added => new value.
      if(ln === 1){
        return {
          ...prev,
          [key]: keyValue[0]
        }
      }
      // modification
      if(ln === 2){
        return {
          ...prev,
          [key]: keyValue[1]
        }
      }
      //delete
      if(ln === 3){
        return {
          ...prev,
        }
      }
    }
    else if(keyValue instanceof Object){
      return {
        ...prev,
        [key] :onlychanges(keyValue)
      }
    }

    return {
      ...prev,
      [key]: keyValue
    }

  }, {})
}

function cleanDiff(delta: any) {
  const cleaned = {} as any

  if(!Array.isArray(delta) && typeof delta === 'object' && delta !== null){
    for(const key in delta){
      if(key === '_t') continue;
      cleaned[key] = cleanDiff(delta[key])
    }
  }
  else if(Array.isArray(delta)){
    const ln = delta.length
    let toRet = {}

    switch(ln){
      case 1: {
        toRet = `A NEW VALUE WAS ADDED : ${JSON.stringify(delta[0])}`
        break;
      }
      case 2: {
        toRet = `THIS VALUE : ${JSON.stringify(delta[0])} WAS CHANGED TO : ${JSON.stringify(delta[1])}`
        break
      }
      case 3: {
        toRet = `THIS VALUE ${JSON.stringify(delta[0])}  WAS DELETED :`
        break
      }
    }

    return toRet
  }

  return cleaned
}

export {
  onlychanges,
  flattenObject,
  cleanDiff,
}