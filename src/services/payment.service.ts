import axios from "axios";

export const createPayOSPayment = async (amount: number, orderId: string) => {
  const endpoint = process.env.PAYOS_ENDPOINT || "https://api.payos.vn/payment";
  const apiKey = process.env.PAYOS_API_KEY;
  if (!apiKey) throw new Error("PAYOS_API_KEY is not set");

  try {
    const response = await axios.post(endpoint, {
      amount,
      orderId,
      // Thêm các trường cần thiết khác, ví dụ:
      // callbackUrl: process.env.PAYOS_CALLBACK_URL,
      // description: "Thanh toán đơn thuê thời trang",
    }, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
    });
    return response.data.paymentUrl;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "PayOS payment error");
  }
};