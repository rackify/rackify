export const deepCopy = (obj: any) => {
  const newObj: any = {};

  for (const key in obj) {
    newObj[key] = typeof obj[key] === 'object' ?
      deepCopy(obj[key]) : obj[key];
  }

  return newObj;
};
