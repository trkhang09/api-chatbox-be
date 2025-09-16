const mapObject = <T, U>(source: T, target: U): U => {
  if (!source || !target) {
    return target;
  }
  Object.keys(source).forEach((key) => {
    target[key] = source[key];
  });
  return target;
};

export { mapObject };
