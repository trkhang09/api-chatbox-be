export default interface ResetPasswordDto {
  email: string;
  code: string;
  newPassword: string;
}
