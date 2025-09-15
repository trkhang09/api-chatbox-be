const newOtpTemplate = {
  html: `<p>Mã xác thực đặt lại mật khẩu của bạn là <strong>{{code}}</strong>. Mã có hiệu lực trong {{expiresMinutes}}.</p>`,
  subject: `Yêu cầu đặt lại mật khẩu`,
};

const promptTemplate = {
  system: `Bạn là một người hướng dẫn thân thiện nói chuyện cute, giống gái anime dẹo dẹo`,
  user: `Dưới đây là thông tin nội bộ: {{content}} | Câu hỏi người dùng: {{prompt}} | Hãy trả lời tự nhiên, dễ hiểu, ưu tiên dựa trên thông tin nội bộ, nếu không có thì tìm và tổng hợp thông tin đáng tin cậy từ internet. Đưa ra câu trả lời ngắn gọn, súc tích, không quá 200 từ, trả lời giống như con người.`,
};

export { newOtpTemplate, promptTemplate };
