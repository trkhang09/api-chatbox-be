const mapObject = <T, U>(source: T, target: U): U => {
  if (!source || !target) {
    return target;
  }
  Object.keys(target).forEach((key) => {
    target[key] = source[key];
  });
  return target;
};

export { mapObject };
