/**
 * random otp
 */

const randomOtp = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

/**
 * replacePlaceHolder
 */

const replacePlaceHolder = (
  template: string,
  params: Record<string, string>,
) => {
  Object.keys(params).forEach((key) => {
    template = template.replace(new RegExp(`{{${key}}}`, 'g'), params[key]);
  });
  return template;
};

/**
 * convert Date time to minute
 */

const convertDateToMinute = (time: Date) => {
  return Math.floor(new Date(time).getTime() / 1000 / 60);
};

export { randomOtp, replacePlaceHolder, convertDateToMinute };
